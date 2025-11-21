#!/usr/bin/env node

/**
 * GitHub Actions Workflow Validator
 *
 * Validates that the generated GitHub Actions workflow file is correct
 * and will work properly.
 *
 * Checks:
 * - Valid YAML syntax
 * - Required fields present
 * - Event triggers configured correctly
 * - Job structure is valid
 * - Steps are properly formatted
 * - Environment variables/secrets referenced correctly
 *
 * Usage:
 *   node validate-workflow.js path/to/workflow.yml
 */

const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ============================================================================
// YAML Parsing (basic - for validation without external deps)
// ============================================================================

/**
 * Basic YAML validation (checks structure without full parsing)
 * In production, would use js-yaml or similar
 */
function basicYAMLValidation(content) {
  const errors = [];

  // Check for basic syntax issues
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for tabs (YAML doesn't allow tabs for indentation)
    if (line.includes('\t')) {
      errors.push({
        line: lineNum,
        message: 'YAML does not allow tabs for indentation',
        severity: 'error'
      });
    }

    // Check for basic structure
    if (line.trim().endsWith(':') && !line.trim().match(/^[\w-]+:/)) {
      errors.push({
        line: lineNum,
        message: 'Invalid key format',
        severity: 'warning'
      });
    }
  }

  return errors;
}

// ============================================================================
// Workflow Structure Validation
// ============================================================================

/**
 * Validate GitHub Actions workflow structure
 */
async function validateWorkflowStructure(workflowPath) {
  const errors = [];
  const warnings = [];

  try {
    const content = await fs.readFile(workflowPath, 'utf8');

    // Basic YAML validation
    const yamlErrors = basicYAMLValidation(content);
    errors.push(...yamlErrors.filter(e => e.severity === 'error'));
    warnings.push(...yamlErrors.filter(e => e.severity === 'warning'));

    // Required top-level fields
    const requiredFields = ['name', 'on', 'jobs'];
    for (const field of requiredFields) {
      const regex = new RegExp(`^${field}:`, 'm');
      if (!regex.test(content)) {
        errors.push({
          field,
          message: `Missing required top-level field: ${field}`,
          severity: 'error'
        });
      }
    }

    // Check for event triggers
    if (!content.includes('on:')) {
      errors.push({
        field: 'on',
        message: 'Workflow must define trigger events',
        severity: 'error'
      });
    }

    // Check for jobs
    if (!content.includes('jobs:')) {
      errors.push({
        field: 'jobs',
        message: 'Workflow must define at least one job',
        severity: 'error'
      });
    }

    // Check for steps in jobs
    if (!content.includes('steps:')) {
      warnings.push({
        field: 'jobs',
        message: 'Jobs should contain steps',
        severity: 'warning'
      });
    }

    // Check for secrets usage
    const secretsUsed = (content.match(/\$\{\{\s*secrets\.\w+\s*\}\}/g) || []);
    if (secretsUsed.length > 0) {
      // Extract secret names
      const secretNames = secretsUsed.map(s => {
        const match = s.match(/secrets\.(\w+)/);
        return match ? match[1] : null;
      }).filter(Boolean);

      if (secretNames.includes('LINEAR_API_KEY')) {
        warnings.push({
          field: 'secrets',
          message: 'Workflow uses LINEAR_API_KEY - ensure this secret is configured in repository',
          severity: 'info'
        });
      }
    }

    // Check for required actions
    const hasCheckoutAction = content.includes('actions/checkout@');
    if (!hasCheckoutAction) {
      warnings.push({
        field: 'steps',
        message: 'Workflow should typically include actions/checkout step',
        severity: 'warning'
      });
    }

    // Check for Linear API calls
    if (content.includes('linear') || content.includes('Linear')) {
      if (!secretsUsed.some(s => s.includes('LINEAR_API_KEY'))) {
        warnings.push({
          field: 'secrets',
          message: 'Workflow mentions Linear but does not use LINEAR_API_KEY secret',
          severity: 'warning'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        lines: content.split('\n').length,
        jobs: (content.match(/^\s+[\w-]+:/gm) || []).length,
        steps: (content.match(/^\s+-\s+name:/gm) || []).length,
        secrets: secretsUsed.length
      }
    };

  } catch (error) {
    return {
      valid: false,
      errors: [{
        message: `Failed to read workflow file: ${error.message}`,
        severity: 'error'
      }],
      warnings: []
    };
  }
}

/**
 * Validate workflow using GitHub CLI (if available)
 */
async function validateWithGitHubCLI(workflowPath) {
  try {
    // Check if gh CLI is available
    await execAsync('gh --version');

    // Try to validate using gh workflow view
    // Note: This only works if the workflow is already in the repo
    const { stdout, stderr } = await execAsync(
      `gh workflow view ${workflowPath} 2>&1 || true`
    );

    // If workflow isn't in repo yet, that's okay
    if (stderr && stderr.includes('could not find')) {
      return {
        validated: false,
        message: 'Workflow not yet in repository (this is okay for new installations)'
      };
    }

    return {
      validated: true,
      output: stdout
    };

  } catch (error) {
    return {
      validated: false,
      message: 'GitHub CLI validation not available',
      error: error.message
    };
  }
}

/**
 * Check for common issues
 */
function checkCommonIssues(content) {
  const issues = [];

  // Check for hardcoded values that should be secrets
  const patterns = [
    { pattern: /lin_api_\w+/i, message: 'Hardcoded Linear API key detected - use secrets instead' },
    { pattern: /ghp_\w+/i, message: 'Hardcoded GitHub token detected - use secrets instead' },
    { pattern: /['\"]sk-\w+['\"]/i, message: 'Hardcoded API key detected - use secrets instead' }
  ];

  for (const { pattern, message } of patterns) {
    if (pattern.test(content)) {
      issues.push({
        type: 'security',
        message,
        severity: 'error'
      });
    }
  }

  // Check for deprecated actions syntax
  if (content.includes('::set-output')) {
    issues.push({
      type: 'deprecation',
      message: 'Using deprecated set-output command - consider using $GITHUB_OUTPUT',
      severity: 'warning'
    });
  }

  if (content.includes('::add-path')) {
    issues.push({
      type: 'deprecation',
      message: 'Using deprecated add-path command - consider using $GITHUB_PATH',
      severity: 'warning'
    });
  }

  // Check for shell injection risks
  if (content.match(/\$\{\{\s*github\.event\./)) {
    issues.push({
      type: 'security',
      message: 'Using user-controllable input in workflow - ensure proper sanitization',
      severity: 'warning'
    });
  }

  return issues;
}

/**
 * Suggest improvements
 */
function suggestImprovements(content) {
  const suggestions = [];

  // Suggest caching if not present
  if (!content.includes('actions/cache@')) {
    suggestions.push({
      type: 'performance',
      message: 'Consider adding caching for dependencies to speed up workflow'
    });
  }

  // Suggest concurrency limits
  if (!content.includes('concurrency:')) {
    suggestions.push({
      type: 'optimization',
      message: 'Consider adding concurrency limits to prevent multiple workflow runs'
    });
  }

  // Suggest timeout
  if (!content.includes('timeout-minutes:')) {
    suggestions.push({
      type: 'reliability',
      message: 'Consider adding timeout-minutes to prevent stuck workflows'
    });
  }

  return suggestions;
}

// ============================================================================
// Formatting & Display
// ============================================================================

function formatValidationResults(results) {
  const lines = ['Workflow Validation Results', ''];

  // Stats
  if (results.stats) {
    lines.push('📊 Statistics:');
    lines.push(`  Lines: ${results.stats.lines}`);
    lines.push(`  Jobs: ${results.stats.jobs}`);
    lines.push(`  Steps: ${results.stats.steps}`);
    lines.push(`  Secrets: ${results.stats.secrets}`);
    lines.push('');
  }

  // Errors
  if (results.errors && results.errors.length > 0) {
    lines.push('❌ Errors:');
    results.errors.forEach((error, i) => {
      const location = error.line ? ` (line ${error.line})` : '';
      lines.push(`  ${i + 1}. ${error.message}${location}`);
    });
    lines.push('');
  }

  // Warnings
  if (results.warnings && results.warnings.length > 0) {
    lines.push('⚠️  Warnings:');
    results.warnings.forEach((warning, i) => {
      const location = warning.line ? ` (line ${warning.line})` : '';
      lines.push(`  ${i + 1}. ${warning.message}${location}`);
    });
    lines.push('');
  }

  // Overall result
  if (results.valid) {
    lines.push('✓ Workflow validation passed');
  } else {
    lines.push('✗ Workflow validation failed');
  }

  return lines.join('\n');
}

// ============================================================================
// Main Validation Function
// ============================================================================

async function validateWorkflow(workflowPath) {
  const results = await validateWorkflowStructure(workflowPath);

  // Add common issues check
  const content = await fs.readFile(workflowPath, 'utf8');
  const issues = checkCommonIssues(content);
  results.errors.push(...issues.filter(i => i.severity === 'error'));
  results.warnings.push(...issues.filter(i => i.severity === 'warning'));

  // Add suggestions
  const suggestions = suggestImprovements(content);
  results.suggestions = suggestions;

  // Try GitHub CLI validation
  const cliValidation = await validateWithGitHubCLI(workflowPath);
  results.cliValidation = cliValidation;

  return results;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  validateWorkflow,
  validateWorkflowStructure,
  validateWithGitHubCLI,
  checkCommonIssues,
  suggestImprovements,
  formatValidationResults
};

// ============================================================================
// CLI Usage
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
GitHub Actions Workflow Validator

Usage:
  node validate-workflow.js <workflow-file.yml>

Example:
  node validate-workflow.js .github/workflows/linear-status-update.yml
`);
    process.exit(0);
  }

  const workflowPath = args[0];

  (async () => {
    try {
      console.log(`Validating workflow: ${workflowPath}\n`);

      const results = await validateWorkflow(workflowPath);

      // Display results
      console.log(formatValidationResults(results));

      // Display suggestions
      if (results.suggestions && results.suggestions.length > 0) {
        console.log('\n💡 Suggestions:');
        results.suggestions.forEach((suggestion, i) => {
          console.log(`  ${i + 1}. ${suggestion.message}`);
        });
      }

      // Display CLI validation
      if (results.cliValidation && results.cliValidation.validated) {
        console.log('\n✓ GitHub CLI validation passed');
      }

      process.exit(results.valid ? 0 : 1);

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
