#!/usr/bin/env node

/**
 * Configuration Validator
 *
 * Validates user configuration against the JSON schema and performs
 * additional business logic validation.
 *
 * Usage:
 *   const { validateConfig } = require('./validate-config.js');
 *
 *   const errors = validateConfig(config);
 *   if (errors.length > 0) {
 *     console.error('Validation errors:', errors);
 *   }
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// Validation Rules
// ============================================================================

/**
 * Validation error class
 */
class ValidationError {
  constructor(field, message, value = null) {
    this.field = field;
    this.message = message;
    this.value = value;
  }

  toString() {
    return `${this.field}: ${this.message}${this.value !== null ? ` (got: ${JSON.stringify(this.value)})` : ''}`;
  }
}

/**
 * Validate required field exists and is not empty
 */
function validateRequired(config, field, errors) {
  const value = getNestedValue(config, field);
  if (value === undefined || value === null || value === '') {
    errors.push(new ValidationError(field, 'Required field is missing or empty', value));
    return false;
  }
  return true;
}

/**
 * Validate field is a string
 */
function validateString(config, field, errors, options = {}) {
  const value = getNestedValue(config, field);

  if (value === undefined && options.optional) {
    return true;
  }

  if (typeof value !== 'string') {
    errors.push(new ValidationError(field, 'Must be a string', value));
    return false;
  }

  if (options.minLength && value.length < options.minLength) {
    errors.push(new ValidationError(field, `Must be at least ${options.minLength} characters`, value));
    return false;
  }

  if (options.maxLength && value.length > options.maxLength) {
    errors.push(new ValidationError(field, `Must be at most ${options.maxLength} characters`, value));
    return false;
  }

  if (options.pattern && !new RegExp(options.pattern).test(value)) {
    errors.push(new ValidationError(field, `Must match pattern: ${options.pattern}`, value));
    return false;
  }

  return true;
}

/**
 * Validate field is one of allowed values
 */
function validateEnum(config, field, allowedValues, errors) {
  const value = getNestedValue(config, field);

  if (!allowedValues.includes(value)) {
    errors.push(new ValidationError(
      field,
      `Must be one of: ${allowedValues.join(', ')}`,
      value
    ));
    return false;
  }

  return true;
}

/**
 * Validate git branch name
 */
function validateBranchName(branchName, field, errors) {
  if (!branchName) return true; // Optional

  // Git branch name rules
  const invalidPatterns = [
    /\s/,                    // No spaces
    /\.\./,                  // No double dots
    /^[.\/]/,                // Can't start with . or /
    /[\/.]$/,                // Can't end with / or .
    /[~^:?*\[\]\\]/,        // No special characters
    /@{/,                    // No @{
    /\/\//,                  // No double slashes
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(branchName)) {
      errors.push(new ValidationError(
        field,
        'Invalid git branch name format',
        branchName
      ));
      return false;
    }
  }

  return true;
}

/**
 * Validate regex pattern
 */
function validateRegex(pattern, field, errors) {
  try {
    new RegExp(pattern);
    return true;
  } catch (error) {
    errors.push(new ValidationError(
      field,
      `Invalid regex pattern: ${error.message}`,
      pattern
    ));
    return false;
  }
}

/**
 * Validate path format
 */
function validatePath(pathStr, field, errors, options = {}) {
  if (!pathStr) {
    if (options.optional) return true;
    errors.push(new ValidationError(field, 'Path is required', pathStr));
    return false;
  }

  // Check path starts with /
  if (!pathStr.startsWith('/')) {
    errors.push(new ValidationError(
      field,
      'Path must start with / (relative to project root)',
      pathStr
    ));
    return false;
  }

  // Check path ends with / for directories
  if (options.isDirectory && !pathStr.endsWith('/')) {
    errors.push(new ValidationError(
      field,
      'Directory path must end with /',
      pathStr
    ));
    return false;
  }

  // Check for invalid characters
  if (/[<>:"|?*]/.test(pathStr)) {
    errors.push(new ValidationError(
      field,
      'Path contains invalid characters',
      pathStr
    ));
    return false;
  }

  return true;
}

/**
 * Get nested value from object
 */
function getNestedValue(obj, path) {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate complete configuration object
 *
 * @param {Object} config - Configuration object to validate
 * @returns {Array<ValidationError>} Array of validation errors (empty if valid)
 */
function validateConfig(config) {
  const errors = [];

  // Version
  validateRequired(config, 'version', errors);
  validateString(config, 'version', errors, { pattern: '^\\d+\\.\\d+\\.\\d+$' });

  // Project
  validateRequired(config, 'project', errors);
  validateRequired(config, 'project.name', errors);
  validateString(config, 'project.name', errors, { minLength: 1, maxLength: 100 });
  validateRequired(config, 'project.path', errors);
  validateString(config, 'project.path', errors, { minLength: 1 });

  // Branches
  validateRequired(config, 'branches', errors);
  validateRequired(config, 'branches.main', errors);
  validateString(config, 'branches.main', errors, { minLength: 1 });
  validateBranchName(config.branches?.main, 'branches.main', errors);

  // Optional branches
  if (config.branches?.staging) {
    validateString(config, 'branches.staging', errors, { minLength: 1 });
    validateBranchName(config.branches.staging, 'branches.staging', errors);
  }
  if (config.branches?.prod) {
    validateString(config, 'branches.prod', errors, { minLength: 1 });
    validateBranchName(config.branches.prod, 'branches.prod', errors);
  }

  // Check for duplicate branch names
  const branchNames = [
    config.branches?.main,
    config.branches?.staging,
    config.branches?.prod
  ].filter(Boolean);

  const uniqueBranches = new Set(branchNames);
  if (branchNames.length !== uniqueBranches.size) {
    errors.push(new ValidationError(
      'branches',
      'Branch names must be unique',
      branchNames
    ));
  }

  // Linear
  validateRequired(config, 'linear', errors);
  validateRequired(config, 'linear.teamKey', errors);
  validateString(config, 'linear.teamKey', errors, { pattern: '^[A-Z]+$' });
  validateRequired(config, 'linear.teamId', errors);
  validateString(config, 'linear.teamId', errors);
  validateRequired(config, 'linear.teamName', errors);
  validateString(config, 'linear.teamName', errors);
  validateRequired(config, 'linear.workspaceId', errors);
  validateString(config, 'linear.workspaceId', errors);
  validateRequired(config, 'linear.workspaceName', errors);
  validateString(config, 'linear.workspaceName', errors);

  // Linear statuses
  validateRequired(config, 'linear.statuses', errors);
  validateRequired(config, 'linear.statuses.inProgress', errors);
  validateString(config, 'linear.statuses.inProgress', errors);
  validateRequired(config, 'linear.statuses.inProgressId', errors);
  validateString(config, 'linear.statuses.inProgressId', errors);
  validateRequired(config, 'linear.statuses.review', errors);
  validateString(config, 'linear.statuses.review', errors);
  validateRequired(config, 'linear.statuses.reviewId', errors);
  validateString(config, 'linear.statuses.reviewId', errors);
  validateRequired(config, 'linear.statuses.done', errors);
  validateString(config, 'linear.statuses.done', errors);
  validateRequired(config, 'linear.statuses.doneId', errors);
  validateString(config, 'linear.statuses.doneId', errors);

  // Formats
  validateRequired(config, 'formats', errors);
  validateRequired(config, 'formats.commit', errors);
  validateEnum(config, 'formats.commit',
    ['conventional-parens', 'issue-prefix', 'issue-scope', 'custom'],
    errors
  );
  validateRequired(config, 'formats.pr', errors);
  validateEnum(config, 'formats.pr',
    ['issue-prefix', 'issue-brackets', 'custom'],
    errors
  );
  validateRequired(config, 'formats.issuePattern', errors);
  validateString(config, 'formats.issuePattern', errors);
  if (config.formats?.issuePattern) {
    validateRegex(config.formats.issuePattern, 'formats.issuePattern', errors);
  }
  validateRequired(config, 'formats.issueExample', errors);
  validateString(config, 'formats.issueExample', errors);

  // Test that issue example matches pattern
  if (config.formats?.issuePattern && config.formats?.issueExample) {
    try {
      const regex = new RegExp(config.formats.issuePattern);
      if (!regex.test(config.formats.issueExample)) {
        errors.push(new ValidationError(
          'formats.issueExample',
          'Issue example does not match issue pattern',
          config.formats.issueExample
        ));
      }
    } catch {
      // Regex validation error already reported
    }
  }

  // Detail level
  validateRequired(config, 'detail', errors);
  validateEnum(config, 'detail', ['high-level', 'technical', 'minimal'], errors);

  // Assignees (optional)
  if (config.assignees) {
    // Validate enabled flag
    if ('enabled' in config.assignees && typeof config.assignees.enabled !== 'boolean') {
      errors.push(new ValidationError(
        'assignees.enabled',
        'Must be a boolean',
        config.assignees.enabled
      ));
    }

    // If enabled, validate at least one assignee is configured
    if (config.assignees.enabled) {
      const hasAnyAssignee =
        config.assignees.onInProgress ||
        config.assignees.onReview ||
        config.assignees.onStaging ||
        config.assignees.onDone;

      if (!hasAnyAssignee) {
        errors.push(new ValidationError(
          'assignees',
          'Auto-assignment enabled but no assignees configured',
          null
        ));
      }
    }

    // Validate each assignee field is a string (if provided)
    ['onInProgress', 'onReview', 'onStaging', 'onDone'].forEach(field => {
      if (config.assignees[field] && typeof config.assignees[field] !== 'string') {
        errors.push(new ValidationError(
          `assignees.${field}`,
          'Must be a string (Linear user UUID)',
          config.assignees[field]
        ));
      }
    });

    // Validate preserveOriginal flag
    if ('preserveOriginal' in config.assignees && typeof config.assignees.preserveOriginal !== 'boolean') {
      errors.push(new ValidationError(
        'assignees.preserveOriginal',
        'Must be a boolean',
        config.assignees.preserveOriginal
      ));
    }
  }

  // Paths
  validateRequired(config, 'paths', errors);
  validateRequired(config, 'paths.issues', errors);
  validatePath(config.paths?.issues, 'paths.issues', errors, { isDirectory: true });
  validateRequired(config, 'paths.workflow', errors);
  validatePath(config.paths?.workflow, 'paths.workflow', errors);

  // Timestamps
  validateString(config, 'installed', errors, { optional: true });
  if (config.installed) {
    try {
      new Date(config.installed);
    } catch (error) {
      errors.push(new ValidationError(
        'installed',
        'Invalid ISO 8601 date format',
        config.installed
      ));
    }
  }

  return errors;
}

/**
 * Validate configuration against JSON schema
 *
 * @param {Object} config - Configuration to validate
 * @param {string} schemaPath - Path to JSON schema file
 * @returns {Promise<Array<ValidationError>>} Validation errors
 */
async function validateAgainstSchema(config, schemaPath) {
  const errors = [];

  try {
    // Load schema
    const schemaContent = await fs.readFile(schemaPath, 'utf8');
    const schema = JSON.parse(schemaContent);

    // Basic JSON Schema validation
    // (In production, would use a proper JSON Schema validator like ajv)
    // For now, just check required properties
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in config)) {
          errors.push(new ValidationError(field, 'Required field is missing'));
        }
      }
    }

  } catch (error) {
    errors.push(new ValidationError('schema', `Schema validation failed: ${error.message}`));
  }

  return errors;
}

/**
 * Format validation errors for display
 *
 * @param {Array<ValidationError>} errors - Validation errors
 * @returns {string} Formatted error message
 */
function formatErrors(errors) {
  if (errors.length === 0) {
    return '✓ Configuration is valid';
  }

  const lines = [
    `❌ Configuration validation failed with ${errors.length} error(s):\n`
  ];

  errors.forEach((error, index) => {
    lines.push(`${index + 1}. ${error.toString()}`);
  });

  return lines.join('\n');
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  validateConfig,
  validateAgainstSchema,
  formatErrors,
  ValidationError,
};

// ============================================================================
// CLI Usage
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Configuration Validator

Usage:
  node validate-config.js <config.json> [schema.json]

Examples:
  node validate-config.js .linear-workflow.json
  node validate-config.js config.json setup/config-schema.json
`);
    process.exit(0);
  }

  const configPath = args[0];
  const schemaPath = args[1] || path.join(__dirname, '../setup/config-schema.json');

  (async () => {
    try {
      // Load config
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);

      // Validate
      const errors = validateConfig(config);

      // Also validate against schema if provided
      if (schemaPath) {
        const schemaErrors = await validateAgainstSchema(config, schemaPath);
        errors.push(...schemaErrors);
      }

      // Display results
      console.log(formatErrors(errors));

      if (errors.length > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
