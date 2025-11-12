#!/usr/bin/env node

/**
 * Template Configuration Applier
 *
 * Renders template files with user configuration values and safely writes them
 * to the target project directory.
 *
 * Features:
 * - Mustache-style template rendering ({{variable}}, {{#section}}...{{/section}})
 * - Nested property access ({{object.property.nested}})
 * - Conditional sections ({{#condition}}...{{/condition}})
 * - Inverted sections ({{^condition}}...{{/condition}})
 * - File backup before overwriting
 * - Atomic file writes
 * - Rollback mechanism
 *
 * Usage:
 *   const { applyConfig, renderTemplate } = require('./apply-config.js');
 *
 *   // Render a template string
 *   const output = renderTemplate(templateContent, config);
 *
 *   // Apply template file to output location
 *   await applyConfig('templates/github-workflow.yml.template',
 *                     '.github/workflows/linear-status-update.yml',
 *                     config);
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { promisify } = require('util');

// ============================================================================
// Template Rendering Engine
// ============================================================================

/**
 * Get nested property value from object using dot notation
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-notation path (e.g., 'user.name.first')
 * @returns {*} The value at the path, or undefined
 */
function getNestedValue(obj, path) {
  if (!path) return obj;

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

/**
 * Check if a value is truthy for template conditionals
 * @param {*} value - Value to check
 * @returns {boolean} True if value should render conditional section
 */
function isTruthy(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.length > 0;
  if (typeof value === 'number') return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Render a Mustache-style template with configuration data
 *
 * Supports:
 * - {{variable}} - Simple substitution
 * - {{object.nested}} - Nested property access
 * - {{#section}}...{{/section}} - Conditional sections (shown if truthy)
 * - {{^section}}...{{/section}} - Inverted sections (shown if falsy)
 *
 * @param {string} template - Template string with placeholders
 * @param {Object} config - Configuration object with values
 * @returns {string} Rendered template
 */
function renderTemplate(template, config, options = {}) {
  let output = template;

  // Process conditional sections ({{#section}}...{{/section}})
  // Must be done before simple variable substitution
  output = processConditionalSections(output, config, false);

  // Process inverted sections ({{^section}}...{{/section}})
  output = processConditionalSections(output, config, true);

  // Process simple variable substitutions ({{variable}})
  output = processVariableSubstitution(output, config, options);

  return output;
}

/**
 * Process conditional or inverted sections in template
 * @param {string} template - Template string
 * @param {Object} config - Configuration object
 * @param {boolean} inverted - If true, process {{^section}}, else {{#section}}
 * @returns {string} Template with sections processed
 */
function processConditionalSections(template, config, inverted = false) {
  const marker = inverted ? '\\^' : '#';
  const regex = new RegExp(`\\{\\{${marker}([^}]+)\\}\\}([\\s\\S]*?)\\{\\{\\/\\1\\}\\}`, 'g');

  return template.replace(regex, (match, key, content) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(config, trimmedKey);
    const shouldRender = inverted ? !isTruthy(value) : isTruthy(value);

    if (shouldRender) {
      // For arrays, render content for each item
      if (Array.isArray(value) && !inverted) {
        return value.map(item => {
          // If array item is an object, merge with config for nested access
          const itemConfig = typeof item === 'object'
            ? { ...config, ...item }
            : { ...config, item };
          return renderTemplate(content, itemConfig);
        }).join('');
      }

      // For objects/truthy values, render content once with object properties available
      if (typeof value === 'object' && value !== null && !inverted) {
        const sectionConfig = { ...config, ...value };
        return renderTemplate(content, sectionConfig);
      }

      // For simple truthy/falsy, render content as-is
      return renderTemplate(content, config);
    }

    return '';
  });
}

/**
 * Process simple variable substitutions in template
 * @param {string} template - Template string
 * @param {Object} config - Configuration object
 * @returns {string} Template with variables substituted
 */
function processVariableSubstitution(template, config, options = {}) {
  // Match {{variable}} but not {{#section}} or {{/section}} or {{^section}}
  const regex = /\{\{(?![#\/\^])([^}]+)\}\}/g;

  return template.replace(regex, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(config, trimmedKey);

    // Return value as string, or empty string if undefined
    if (value === undefined || value === null) {
      return '';
    }

    // Convert to string
    let stringValue = String(value);

    // Escape backslashes for JSON templates
    if (options.isJSON) {
      stringValue = stringValue.replace(/\\/g, '\\\\');
    }

    return stringValue;
  });
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Backup tracker for rollback functionality
 */
const backupTracker = {
  backups: [],

  /**
   * Add a backup to the tracker
   * @param {string} original - Original file path
   * @param {string} backup - Backup file path
   */
  add(original, backup) {
    this.backups.push({ original, backup, timestamp: new Date().toISOString() });
  },

  /**
   * Clear all tracked backups
   */
  clear() {
    this.backups = [];
  },

  /**
   * Get all tracked backups
   * @returns {Array} List of backup records
   */
  getAll() {
    return [...this.backups];
  }
};

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists, creating it if necessary
 * @param {string} dirPath - Directory path
 * @returns {Promise<void>}
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Create a backup of an existing file
 * @param {string} filePath - Path to file to backup
 * @param {Object} options - Backup options
 * @param {string} options.suffix - Backup file suffix (default: '.backup')
 * @param {boolean} options.timestamp - Add timestamp to backup (default: false)
 * @returns {Promise<string|null>} Path to backup file, or null if no backup needed
 */
async function backupFile(filePath, options = {}) {
  const { suffix = '.backup', timestamp = false } = options;

  // Check if file exists
  const exists = await fileExists(filePath);
  if (!exists) {
    return null; // No backup needed
  }

  // Generate backup filename
  let backupPath = filePath + suffix;
  if (timestamp) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    backupPath = `${filePath}.${ts}${suffix}`;
  }

  // Copy file to backup location
  await fs.copyFile(filePath, backupPath);

  // Track for rollback
  backupTracker.add(filePath, backupPath);

  return backupPath;
}

/**
 * Write file atomically (write to temp file, then rename)
 * @param {string} filePath - Destination file path
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
async function writeFileAtomic(filePath, content) {
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath);
  const tempPath = path.join(dir, `.${filename}.tmp.${process.pid}`);

  try {
    // Ensure directory exists
    await ensureDirectory(dir);

    // Write to temporary file
    await fs.writeFile(tempPath, content, 'utf8');

    // Atomic rename
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Apply a template configuration to create an output file
 *
 * @param {string} templatePath - Path to template file
 * @param {string} outputPath - Path where rendered file should be written
 * @param {Object} config - Configuration object for template rendering
 * @param {Object} options - Options
 * @param {boolean} options.backup - Create backup of existing file (default: true)
 * @param {string} options.backupSuffix - Backup file suffix (default: '.backup')
 * @param {boolean} options.dryRun - Don't actually write files (default: false)
 * @returns {Promise<Object>} Result object with status and paths
 */
async function applyConfig(templatePath, outputPath, config, options = {}) {
  const {
    backup = true,
    backupSuffix = '.backup',
    dryRun = false
  } = options;

  const result = {
    success: false,
    templatePath,
    outputPath,
    backupPath: null,
    dryRun,
    error: null
  };

  try {
    // Read template file
    const template = await fs.readFile(templatePath, 'utf8');

    // Detect if output is JSON for proper escaping
    const isJSON = outputPath.endsWith('.json');

    // Render template
    const rendered = renderTemplate(template, config, { isJSON });

    if (dryRun) {
      result.success = true;
      result.preview = rendered.substring(0, 500); // First 500 chars
      return result;
    }

    // Backup existing file if requested
    if (backup) {
      const backupPath = await backupFile(outputPath, { suffix: backupSuffix });
      result.backupPath = backupPath;
    }

    // Write rendered content atomically
    await writeFileAtomic(outputPath, rendered);

    result.success = true;
    return result;

  } catch (error) {
    result.error = error.message;
    throw error;
  }
}

/**
 * Apply multiple template configurations
 *
 * @param {Array<Object>} templates - Array of template configurations
 * @param {Object} config - Configuration object for template rendering
 * @param {Object} options - Options (same as applyConfig)
 * @returns {Promise<Array<Object>>} Array of results
 */
async function applyMultipleConfigs(templates, config, options = {}) {
  const results = [];

  for (const template of templates) {
    try {
      const result = await applyConfig(
        template.templatePath,
        template.outputPath,
        config,
        options
      );
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        templatePath: template.templatePath,
        outputPath: template.outputPath,
        error: error.message
      });

      // Stop on first error unless continueOnError is set
      if (!options.continueOnError) {
        throw error;
      }
    }
  }

  return results;
}

/**
 * Rollback all changes by restoring from backups
 *
 * @param {Object} options - Rollback options
 * @param {boolean} options.deleteBackups - Delete backup files after restore (default: false)
 * @returns {Promise<Object>} Rollback result
 */
async function rollback(options = {}) {
  const { deleteBackups = false } = options;
  const backups = backupTracker.getAll();

  const result = {
    success: true,
    restored: [],
    failed: [],
    backupsDeleted: []
  };

  for (const { original, backup } of backups) {
    try {
      // Check if backup exists
      const exists = await fileExists(backup);
      if (!exists) {
        result.failed.push({
          file: original,
          error: 'Backup file not found'
        });
        continue;
      }

      // Restore from backup
      await fs.copyFile(backup, original);
      result.restored.push(original);

      // Delete backup if requested
      if (deleteBackups) {
        await fs.unlink(backup);
        result.backupsDeleted.push(backup);
      }

    } catch (error) {
      result.failed.push({
        file: original,
        error: error.message
      });
      result.success = false;
    }
  }

  // Clear tracker if rollback was successful
  if (result.success) {
    backupTracker.clear();
  }

  return result;
}

/**
 * Delete all tracked backup files
 * @returns {Promise<Object>} Deletion result
 */
async function deleteBackups() {
  const backups = backupTracker.getAll();

  const result = {
    success: true,
    deleted: [],
    failed: []
  };

  for (const { backup } of backups) {
    try {
      const exists = await fileExists(backup);
      if (exists) {
        await fs.unlink(backup);
        result.deleted.push(backup);
      }
    } catch (error) {
      result.failed.push({
        file: backup,
        error: error.message
      });
      result.success = false;
    }
  }

  // Clear tracker
  backupTracker.clear();

  return result;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Template rendering
  renderTemplate,
  getNestedValue,
  isTruthy,

  // File operations
  applyConfig,
  applyMultipleConfigs,
  backupFile,
  writeFileAtomic,
  fileExists,
  ensureDirectory,

  // Backup management
  rollback,
  deleteBackups,
  backupTracker,
};

// ============================================================================
// CLI Usage (if run directly)
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Template Configuration Applier

Usage:
  node apply-config.js <command> [options]

Commands:
  render <template> <config.json>
    Render a template file with configuration from JSON file

  apply <template> <output> <config.json>
    Apply template to output file with configuration

  test
    Run built-in tests

Examples:
  node apply-config.js render templates/github-workflow.yml.template config.json
  node apply-config.js apply templates/github-workflow.yml.template .github/workflows/linear.yml config.json
  node apply-config.js test
`);
    process.exit(0);
  }

  const command = args[0];

  if (command === 'test') {
    // Run tests
    runTests();
  } else if (command === 'render' && args.length >= 3) {
    // Render template
    const templatePath = args[1];
    const configPath = args[2];

    (async () => {
      try {
        const template = await fs.readFile(templatePath, 'utf8');
        const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
        const rendered = renderTemplate(template, config);
        console.log(rendered);
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
    })();

  } else if (command === 'apply' && args.length >= 4) {
    // Apply template to file
    const templatePath = args[1];
    const outputPath = args[2];
    const configPath = args[3];

    (async () => {
      try {
        const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
        const result = await applyConfig(templatePath, outputPath, config);

        console.log('✓ Template applied successfully');
        console.log('  Template:', result.templatePath);
        console.log('  Output:', result.outputPath);
        if (result.backupPath) {
          console.log('  Backup:', result.backupPath);
        }
      } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
      }
    })();

  } else {
    console.error('Invalid command or arguments');
    process.exit(1);
  }
}

// ============================================================================
// Tests
// ============================================================================

function runTests() {
  console.log('Running template renderer tests...\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log('✓', name);
      passed++;
    } catch (error) {
      console.log('✗', name);
      console.log('  Error:', error.message);
      failed++;
    }
  }

  function assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected "${expected}" but got "${actual}"`);
    }
  }

  // Test simple variable substitution
  test('Simple variable substitution', () => {
    const template = 'Hello {{name}}!';
    const config = { name: 'World' };
    const result = renderTemplate(template, config);
    assertEquals(result, 'Hello World!');
  });

  // Test nested property access
  test('Nested property access', () => {
    const template = 'User: {{user.name.first}} {{user.name.last}}';
    const config = { user: { name: { first: 'John', last: 'Doe' } } };
    const result = renderTemplate(template, config);
    assertEquals(result, 'User: John Doe');
  });

  // Test conditional section (truthy)
  test('Conditional section (truthy)', () => {
    const template = '{{#show}}Hello!{{/show}}';
    const config = { show: true };
    const result = renderTemplate(template, config);
    assertEquals(result, 'Hello!');
  });

  // Test conditional section (falsy)
  test('Conditional section (falsy)', () => {
    const template = '{{#show}}Hello!{{/show}}';
    const config = { show: false };
    const result = renderTemplate(template, config);
    assertEquals(result, '');
  });

  // Test inverted section
  test('Inverted section', () => {
    const template = '{{^hide}}Visible{{/hide}}';
    const config = { hide: false };
    const result = renderTemplate(template, config);
    assertEquals(result, 'Visible');
  });

  // Test array iteration
  test('Array iteration', () => {
    const template = '{{#items}}{{name}} {{/items}}';
    const config = { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] };
    const result = renderTemplate(template, config);
    assertEquals(result, 'A B C ');
  });

  // Test undefined variable
  test('Undefined variable', () => {
    const template = 'Hello {{missing}}!';
    const config = {};
    const result = renderTemplate(template, config);
    assertEquals(result, 'Hello !');
  });

  // Test complex template
  test('Complex template', () => {
    const template = `
Project: {{project.name}}
{{#branches.main}}Main: {{branches.main}}{{/branches.main}}
{{#branches.staging}}Staging: {{branches.staging}}{{/branches.staging}}
{{^branches.prod}}No production branch{{/branches.prod}}`;

    const config = {
      project: { name: 'test-project' },
      branches: { main: 'main', staging: 'staging' }
    };

    const result = renderTemplate(template, config);
    assertEquals(result.includes('Project: test-project'), true);
    assertEquals(result.includes('Main: main'), true);
    assertEquals(result.includes('Staging: staging'), true);
    assertEquals(result.includes('No production branch'), true);
  });

  console.log(`\n${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}
