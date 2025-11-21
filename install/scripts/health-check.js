#!/usr/bin/env node

/**
 * Health Check Command
 *
 * Validates the Linear workflow installation and configuration.
 * Provides detailed diagnostics and actionable fix suggestions.
 *
 * Usage:
 *   node install/scripts/health-check.js                  # Run all checks
 *   node install/scripts/health-check.js --fix            # Run checks and auto-fix common issues
 *   node install/scripts/health-check.js --verbose        # Show detailed output
 *   node install/scripts/health-check.js --json           # Output results as JSON
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// Configuration
// ============================================================================

const REQUIRED_CONFIG_FIELDS = [
  'version',
  'project.name',
  'project.path',
  'branches.main',
  'linear.teamKey',
  'linear.teamId',
  'linear.workspaceId',
  'linear.statuses.inProgress',
  'linear.statuses.review',
  'linear.statuses.done',
  'formats.commit',
  'formats.pr',
  'formats.issuePattern',
  'detail',
  'paths.issues'
];

// ============================================================================
// Helper Functions
// ============================================================================

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf-8', ...options });
  } catch (error) {
    return null;
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function isExecutable(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.mode & 0o111) !== 0;
  } catch {
    return false;
  }
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    return { error: error.message };
  }
}

// ============================================================================
// Health Check Results
// ============================================================================

class HealthCheckResults {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
    this.fixes = [];
  }

  addCheck(name, passed, message, details = {}) {
    this.checks.push({ name, passed, message, details });

    if (!passed) {
      if (details.severity === 'warning') {
        this.warnings.push({ name, message, details });
      } else {
        this.errors.push({ name, message, details });
      }
    }
  }

  addFix(name, description, command) {
    this.fixes.push({ name, description, command });
  }

  getScore() {
    const total = this.checks.length;
    const passed = this.checks.filter(c => c.passed).length;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  }

  getSummary() {
    return {
      score: this.getScore(),
      total: this.checks.length,
      passed: this.checks.filter(c => c.passed).length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      fixes: this.fixes.length
    };
  }

  format(verbose = false, jsonOutput = false) {
    if (jsonOutput) {
      return JSON.stringify({
        summary: this.getSummary(),
        checks: this.checks,
        warnings: this.warnings,
        errors: this.errors,
        fixes: this.fixes
      }, null, 2);
    }

    const score = this.getScore();
    const summary = this.getSummary();

    let output = '\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '  Linear Workflow Health Check\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    // Overall score
    const scoreEmoji = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
    output += `Overall Health: ${scoreEmoji} ${score}%\n`;
    output += `  ${summary.passed}/${summary.total} checks passed\n`;
    if (summary.warnings > 0) {
      output += `  ${summary.warnings} warnings\n`;
    }
    if (summary.errors > 0) {
      output += `  ${summary.errors} errors\n`;
    }
    output += '\n';

    // Detailed checks
    if (verbose) {
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      output += '  Detailed Results\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

      for (const check of this.checks) {
        const icon = check.passed ? '✓' : '✗';
        output += `${icon} ${check.name}\n`;
        output += `  ${check.message}\n`;
        if (check.details && Object.keys(check.details).length > 0) {
          for (const [key, value] of Object.entries(check.details)) {
            if (key !== 'severity' && key !== 'fixable') {
              output += `  ${key}: ${value}\n`;
            }
          }
        }
        output += '\n';
      }
    } else {
      // Summary view
      if (this.errors.length > 0) {
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '  Errors\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        for (const error of this.errors) {
          output += `❌ ${error.name}\n`;
          output += `   ${error.message}\n\n`;
        }
      }

      if (this.warnings.length > 0) {
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '  Warnings\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        for (const warning of this.warnings) {
          output += `⚠️  ${warning.name}\n`;
          output += `   ${warning.message}\n\n`;
        }
      }
    }

    // Suggested fixes
    if (this.fixes.length > 0) {
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      output += '  Suggested Fixes\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

      for (let i = 0; i < this.fixes.length; i++) {
        const fix = this.fixes[i];
        output += `${i + 1}. ${fix.name}\n`;
        output += `   ${fix.description}\n`;
        if (fix.command) {
          output += `   Command: ${fix.command}\n`;
        }
        output += '\n';
      }

      output += 'Run with --fix to automatically apply fixable issues\n\n';
    }

    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

    return output;
  }
}

// ============================================================================
// Health Checks
// ============================================================================

async function checkConfigurationFile(projectPath, results, autoFix) {
  const configPath = path.join(projectPath, '.linear-workflow.json');

  if (!fileExists(configPath)) {
    results.addCheck(
      'Configuration File',
      false,
      'Configuration file not found',
      {
        severity: 'error',
        path: configPath,
        fixable: false
      }
    );
    results.addFix(
      'Create Configuration',
      'Run the setup wizard to create configuration',
      'Say "Setup Linear workflow" to Claude'
    );
    return null;
  }

  const config = readJSON(configPath);

  if (config.error) {
    results.addCheck(
      'Configuration File',
      false,
      `Invalid JSON: ${config.error}`,
      {
        severity: 'error',
        path: configPath,
        fixable: false
      }
    );
    results.addFix(
      'Fix JSON Syntax',
      'Check configuration file for syntax errors',
      `cat ${configPath}`
    );
    return null;
  }

  results.addCheck(
    'Configuration File',
    true,
    'Configuration file exists and is valid JSON',
    { path: configPath }
  );

  return config;
}

async function checkRequiredFields(config, results, autoFix) {
  if (!config) return;

  const missingFields = [];

  for (const field of REQUIRED_CONFIG_FIELDS) {
    const value = getNestedValue(config, field);
    if (value === undefined || value === null) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    results.addCheck(
      'Required Fields',
      false,
      `Missing ${missingFields.length} required field(s)`,
      {
        severity: 'error',
        missing: missingFields.join(', '),
        fixable: false
      }
    );
    results.addFix(
      'Add Missing Fields',
      'Edit configuration to add missing fields',
      'node install/scripts/edit-config.js'
    );
  } else {
    results.addCheck(
      'Required Fields',
      true,
      'All required fields present',
      { count: REQUIRED_CONFIG_FIELDS.length }
    );
  }
}

async function checkWorkflowFile(projectPath, results, autoFix) {
  const workflowPath = path.join(projectPath, '.github/workflows/linear-status-update.yml');

  if (!fileExists(workflowPath)) {
    results.addCheck(
      'GitHub Actions Workflow',
      false,
      'Workflow file not found',
      {
        severity: 'error',
        path: workflowPath,
        fixable: false
      }
    );
    results.addFix(
      'Create Workflow File',
      'Run the setup wizard to create workflow',
      'Say "Setup Linear workflow" to Claude'
    );
    return;
  }

  // Basic YAML validation
  const content = fs.readFileSync(workflowPath, 'utf-8');
  const hasName = content.includes('name:');
  const hasOn = content.includes('on:');
  const hasJobs = content.includes('jobs:');

  if (!hasName || !hasOn || !hasJobs) {
    results.addCheck(
      'GitHub Actions Workflow',
      false,
      'Workflow file appears invalid (missing required sections)',
      {
        severity: 'error',
        path: workflowPath,
        fixable: false
      }
    );
    results.addFix(
      'Validate Workflow',
      'Check workflow file syntax',
      'node install/scripts/validate-workflow.js'
    );
  } else {
    results.addCheck(
      'GitHub Actions Workflow',
      true,
      'Workflow file exists and appears valid',
      { path: workflowPath }
    );
  }
}

async function checkGitHook(projectPath, results, autoFix) {
  const hookPath = path.join(projectPath, '.git/hooks/commit-msg');

  if (!fileExists(hookPath)) {
    results.addCheck(
      'Git Commit Hook',
      false,
      'Commit message hook not installed',
      {
        severity: 'warning',
        path: hookPath,
        fixable: true
      }
    );
    results.addFix(
      'Install Git Hook',
      'Run the hook installation script',
      './install/scripts/install-hooks.sh'
    );

    if (autoFix) {
      console.log('Auto-fixing: Installing git hook...');
      const templatePath = path.join(__dirname, '../install/templates/workflow/commit-msg.template');
      if (fileExists(templatePath)) {
        fs.copyFileSync(templatePath, hookPath);
        fs.chmodSync(hookPath, 0o755);
        console.log('✓ Git hook installed');
      }
    }
    return;
  }

  if (!isExecutable(hookPath)) {
    results.addCheck(
      'Git Commit Hook',
      false,
      'Hook exists but is not executable',
      {
        severity: 'warning',
        path: hookPath,
        fixable: true
      }
    );
    results.addFix(
      'Make Hook Executable',
      'Set executable permissions on hook',
      `chmod +x ${hookPath}`
    );

    if (autoFix) {
      console.log('Auto-fixing: Making hook executable...');
      fs.chmodSync(hookPath, 0o755);
      console.log('✓ Hook is now executable');
    }
    return;
  }

  results.addCheck(
    'Git Commit Hook',
    true,
    'Hook installed and executable',
    { path: hookPath }
  );
}

async function checkGitHubSecret(projectPath, results, autoFix) {
  const repoInfo = exec('gh repo view --json nameWithOwner -q .nameWithOwner');

  if (!repoInfo) {
    results.addCheck(
      'GitHub Repository',
      false,
      'Could not access GitHub repository',
      {
        severity: 'warning',
        fixable: false
      }
    );
    results.addFix(
      'Check GitHub Authentication',
      'Ensure GitHub CLI is authenticated',
      'gh auth status'
    );
    return;
  }

  const secrets = exec('gh secret list');

  if (!secrets || !secrets.includes('LINEAR_API_KEY')) {
    results.addCheck(
      'LINEAR_API_KEY Secret',
      false,
      'LINEAR_API_KEY not found in GitHub secrets',
      {
        severity: 'error',
        repository: repoInfo.trim(),
        fixable: false
      }
    );
    results.addFix(
      'Set GitHub Secret',
      'Add LINEAR_API_KEY to repository secrets',
      'gh secret set LINEAR_API_KEY'
    );
  } else {
    results.addCheck(
      'LINEAR_API_KEY Secret',
      true,
      'LINEAR_API_KEY exists in GitHub secrets',
      { repository: repoInfo.trim() }
    );
  }
}

async function checkMCPConfiguration(projectPath, results, autoFix) {
  const mcpPath = path.join(projectPath, '.mcp.json');

  if (!fileExists(mcpPath)) {
    results.addCheck(
      'MCP Configuration',
      false,
      'MCP configuration file not found',
      {
        severity: 'warning',
        path: mcpPath,
        fixable: false
      }
    );
    results.addFix(
      'Create MCP Config',
      'Run the setup wizard to create MCP configuration',
      'Say "Setup Linear workflow" to Claude'
    );
    return;
  }

  const mcpConfig = readJSON(mcpPath);

  if (mcpConfig.error) {
    results.addCheck(
      'MCP Configuration',
      false,
      `Invalid MCP configuration: ${mcpConfig.error}`,
      {
        severity: 'warning',
        path: mcpPath,
        fixable: false
      }
    );
    return;
  }

  if (!mcpConfig.mcpServers || !mcpConfig.mcpServers.linear) {
    results.addCheck(
      'MCP Configuration',
      false,
      'Linear MCP server not configured',
      {
        severity: 'warning',
        path: mcpPath,
        fixable: false
      }
    );
  } else {
    results.addCheck(
      'MCP Configuration',
      true,
      'MCP configuration exists and includes Linear server',
      { path: mcpPath }
    );
  }
}

async function checkBranchStrategy(projectPath, config, results, autoFix) {
  if (!config) return;

  const currentBranch = exec('git branch --show-current', { cwd: projectPath });

  if (!currentBranch) {
    results.addCheck(
      'Branch Strategy',
      false,
      'Could not determine current branch',
      {
        severity: 'warning',
        fixable: false
      }
    );
    return;
  }

  const branches = exec('git branch -a', { cwd: projectPath });

  if (!branches) {
    results.addCheck(
      'Branch Strategy',
      false,
      'Could not list branches',
      {
        severity: 'warning',
        fixable: false
      }
    );
    return;
  }

  const configuredBranches = [];
  const missingBranches = [];

  if (config.branches?.main) {
    configuredBranches.push(config.branches.main);
    if (!branches.includes(config.branches.main)) {
      missingBranches.push(config.branches.main);
    }
  }

  if (config.branches?.staging) {
    configuredBranches.push(config.branches.staging);
    if (!branches.includes(config.branches.staging)) {
      missingBranches.push(config.branches.staging);
    }
  }

  if (config.branches?.prod) {
    configuredBranches.push(config.branches.prod);
    if (!branches.includes(config.branches.prod)) {
      missingBranches.push(config.branches.prod);
    }
  }

  if (missingBranches.length > 0) {
    results.addCheck(
      'Branch Strategy',
      false,
      `Missing configured branches: ${missingBranches.join(', ')}`,
      {
        severity: 'warning',
        configured: configuredBranches.join(', '),
        missing: missingBranches.join(', '),
        fixable: true
      }
    );
    results.addFix(
      'Create Missing Branches',
      'Create the configured branches',
      `git checkout -b ${missingBranches[0]}`
    );
  } else {
    results.addCheck(
      'Branch Strategy',
      true,
      'All configured branches exist',
      {
        current: currentBranch.trim(),
        configured: configuredBranches.join(', ')
      }
    );
  }
}

async function checkLinearConnection(config, results, autoFix) {
  if (!config) return;

  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    results.addCheck(
      'Linear API Connection',
      false,
      'LINEAR_API_KEY not found in environment',
      {
        severity: 'warning',
        fixable: false
      }
    );
    results.addFix(
      'Set LINEAR_API_KEY',
      'Add LINEAR_API_KEY to environment or .env file',
      'echo "LINEAR_API_KEY=your_key_here" >> .env'
    );
    return;
  }

  // Validate API key by making a test request
  const query = JSON.stringify({
    query: `query { organization { id name } }`
  });

  const response = exec(
    `curl -s -X POST https://api.linear.app/graphql \\
      -H "Authorization: ${apiKey}" \\
      -H "Content-Type: application/json" \\
      -d '${query}'`
  );

  if (!response) {
    results.addCheck(
      'Linear API Connection',
      false,
      'Could not connect to Linear API',
      {
        severity: 'error',
        fixable: false
      }
    );
    return;
  }

  try {
    const data = JSON.parse(response);

    if (data.errors) {
      results.addCheck(
        'Linear API Connection',
        false,
        `Linear API error: ${data.errors[0].message}`,
        {
          severity: 'error',
          fixable: false
        }
      );
      results.addFix(
        'Validate LINEAR_API_KEY',
        'Check that your API key is valid',
        'node install/scripts/validate-secrets.js'
      );
    } else if (data.data?.organization) {
      results.addCheck(
        'Linear API Connection',
        true,
        'Successfully connected to Linear API',
        {
          organization: data.data.organization.name,
          workspace: config.linear?.workspaceName
        }
      );
    }
  } catch (error) {
    results.addCheck(
      'Linear API Connection',
      false,
      `Failed to parse Linear API response: ${error.message}`,
      {
        severity: 'error',
        fixable: false
      }
    );
  }
}

async function checkDocumentation(projectPath, config, results, autoFix) {
  if (!config) return;

  const issuesPath = path.join(projectPath, config.paths?.issues || 'docs/issues/');

  if (!fileExists(issuesPath)) {
    results.addCheck(
      'Documentation Directory',
      false,
      'Issue documentation directory not found',
      {
        severity: 'warning',
        path: issuesPath,
        fixable: true
      }
    );
    results.addFix(
      'Create Documentation Directory',
      'Create the configured documentation directory',
      `mkdir -p ${issuesPath}`
    );

    if (autoFix) {
      console.log('Auto-fixing: Creating documentation directory...');
      fs.mkdirSync(issuesPath, { recursive: true });
      console.log(`✓ Created ${issuesPath}`);
    }
  } else {
    results.addCheck(
      'Documentation Directory',
      true,
      'Documentation directory exists',
      { path: issuesPath }
    );
  }

  const workflowDoc = path.join(projectPath, 'docs/linear-workflow.md');

  if (!fileExists(workflowDoc)) {
    results.addCheck(
      'Workflow Documentation',
      false,
      'Workflow documentation not found',
      {
        severity: 'warning',
        path: workflowDoc,
        fixable: false
      }
    );
    results.addFix(
      'Create Workflow Documentation',
      'Run the setup wizard to create documentation',
      'Say "Setup Linear workflow" to Claude'
    );
  } else {
    results.addCheck(
      'Workflow Documentation',
      true,
      'Workflow documentation exists',
      { path: workflowDoc }
    );
  }
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const autoFix = args.includes('--fix');
  const verbose = args.includes('--verbose');
  const jsonOutput = args.includes('--json');
  const projectPath = process.cwd();

  if (!jsonOutput) {
    console.log('\nRunning health checks...\n');
  }

  const results = new HealthCheckResults();

  // Run all health checks
  const config = await checkConfigurationFile(projectPath, results, autoFix);
  await checkRequiredFields(config, results, autoFix);
  await checkWorkflowFile(projectPath, results, autoFix);
  await checkGitHook(projectPath, results, autoFix);
  await checkGitHubSecret(projectPath, results, autoFix);
  await checkMCPConfiguration(projectPath, results, autoFix);
  await checkBranchStrategy(projectPath, config, results, autoFix);
  await checkLinearConnection(config, results, autoFix);
  await checkDocumentation(projectPath, config, results, autoFix);

  // Output results
  console.log(results.format(verbose, jsonOutput));

  // Exit with appropriate code
  const score = results.getScore();
  if (score >= 90) {
    process.exit(0);
  } else if (score >= 70) {
    process.exit(1);
  } else {
    process.exit(2);
  }
}

// ============================================================================
// Run
// ============================================================================

if (require.main === module) {
  main().catch(error => {
    console.error('Health check failed:', error.message);
    process.exit(3);
  });
}

module.exports = { HealthCheckResults };
