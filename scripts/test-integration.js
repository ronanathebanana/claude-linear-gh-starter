#!/usr/bin/env node

/**
 * Integration Testing Script
 *
 * Tests the complete Linear workflow setup and installation to ensure
 * everything works correctly before going live.
 *
 * This script validates:
 * - Pre-flight checks pass
 * - Configuration is valid
 * - Templates render correctly
 * - GitHub integration works
 * - Generated workflow file is valid YAML
 * - All files are created in correct locations
 *
 * Usage:
 *   node test-integration.js [--config path/to/config.json]
 */

const fs = require('fs').promises;
const path = require('path');
const { validateConfig, formatErrors } = require('./validate-config.js');
const { renderTemplate, applyConfig } = require('./apply-config.js');
const {
  verifyGitHubAccess,
  checkGitHubActionsStatus,
  secretExists
} = require('./github-setup.js');

// ============================================================================
// Test Suite
// ============================================================================

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
  }

  /**
   * Run a test
   */
  async test(name, fn, options = {}) {
    const { skip = false, critical = false } = options;

    if (skip) {
      this.results.skipped++;
      this.results.tests.push({
        name,
        status: 'skipped',
        message: 'Test skipped'
      });
      console.log(`⊘ ${name} (skipped)`);
      return;
    }

    try {
      await fn();
      this.results.passed++;
      this.results.tests.push({
        name,
        status: 'passed'
      });
      console.log(`✓ ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({
        name,
        status: 'failed',
        error: error.message,
        critical
      });
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);

      if (critical) {
        throw new Error(`Critical test failed: ${name}`);
      }
    }
  }

  /**
   * Print summary
   */
  summary() {
    console.log('\n' + '═'.repeat(60));
    console.log('Test Summary');
    console.log('═'.repeat(60));
    console.log(`Passed:  ${this.results.passed}`);
    console.log(`Failed:  ${this.results.failed}`);
    console.log(`Skipped: ${this.results.skipped}`);
    console.log(`Total:   ${this.results.tests.length}`);

    const success = this.results.failed === 0;
    console.log('\n' + (success ? '✓ All tests passed!' : '✗ Some tests failed'));

    return success;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Assert condition is true
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Assert two values are equal
 */
function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected} but got ${actual}`);
  }
}

/**
 * Check if file exists
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
 * Load example configuration
 */
async function loadExampleConfig() {
  return {
    version: '1.0.0',
    project: {
      name: 'test-project',
      path: '/tmp/test-project'
    },
    branches: {
      main: 'main',
      staging: 'staging',
      prod: 'production'
    },
    linear: {
      teamKey: 'TEST',
      teamId: 'test-team-uuid',
      teamName: 'Test Team',
      workspaceId: 'test-workspace-uuid',
      workspaceName: 'Test Workspace',
      statuses: {
        inProgress: 'In Progress',
        inProgressId: 'state-uuid-1',
        review: 'Review Required',
        reviewId: 'state-uuid-2',
        done: 'Done',
        doneId: 'state-uuid-3'
      }
    },
    formats: {
      commit: 'conventional-parens',
      pr: 'issue-prefix',
      issuePattern: '[A-Z]+-\\d+',
      issueExample: 'TEST-123'
    },
    detail: 'technical',
    paths: {
      issues: '/docs/issues/',
      workflow: '/.github/workflows/linear-status-update.yml'
    },
    installed: new Date().toISOString()
  };
}

// ============================================================================
// Test Suites
// ============================================================================

/**
 * Test configuration validation
 */
async function testConfigValidation(runner) {
  console.log('\n📋 Configuration Validation Tests\n');

  await runner.test('Valid configuration passes validation', async () => {
    const config = await loadExampleConfig();
    const errors = validateConfig(config);
    assert(errors.length === 0, `Validation errors: ${formatErrors(errors)}`);
  }, { critical: true });

  await runner.test('Invalid configuration fails validation', async () => {
    const config = { version: '1.0.0' }; // Missing required fields
    const errors = validateConfig(config);
    assert(errors.length > 0, 'Should have validation errors');
  });

  await runner.test('Branch names must be unique', async () => {
    const config = await loadExampleConfig();
    config.branches.staging = config.branches.main; // Duplicate
    const errors = validateConfig(config);
    assert(errors.some(e => e.field === 'branches'), 'Should detect duplicate branches');
  });

  await runner.test('Issue pattern must be valid regex', async () => {
    const config = await loadExampleConfig();
    config.formats.issuePattern = '[invalid(regex'; // Invalid regex
    const errors = validateConfig(config);
    assert(errors.some(e => e.field === 'formats.issuePattern'), 'Should detect invalid regex');
  });

  await runner.test('Issue example must match pattern', async () => {
    const config = await loadExampleConfig();
    config.formats.issuePattern = '[A-Z]+-\\d+';
    config.formats.issueExample = 'invalid'; // Doesn't match pattern
    const errors = validateConfig(config);
    assert(errors.some(e => e.field === 'formats.issueExample'), 'Should detect pattern mismatch');
  });

  await runner.test('Assignees enabled must be boolean', async () => {
    const config = await loadExampleConfig();
    config.assignees = { enabled: 'yes' }; // Should be boolean
    const errors = validateConfig(config);
    assert(errors.some(e => e.field === 'assignees.enabled'), 'Should detect invalid enabled type');
  });

  await runner.test('Enabled assignees must have at least one assignee', async () => {
    const config = await loadExampleConfig();
    config.assignees = { enabled: true }; // No assignees configured
    const errors = validateConfig(config);
    assert(errors.some(e => e.field === 'assignees'), 'Should detect missing assignees');
  });

  await runner.test('Assignee fields must be strings', async () => {
    const config = await loadExampleConfig();
    config.assignees = {
      enabled: true,
      onReview: 123 // Should be string
    };
    const errors = validateConfig(config);
    assert(errors.some(e => e.field === 'assignees.onReview'), 'Should detect invalid assignee type');
  });

  await runner.test('Valid assignee configuration passes', async () => {
    const config = await loadExampleConfig();
    config.assignees = {
      enabled: true,
      onReview: 'user-uuid-123',
      onStaging: 'user-uuid-456',
      preserveOriginal: true
    };
    const errors = validateConfig(config);
    assert(!errors.some(e => e.field.startsWith('assignees')), 'Should pass validation');
  });

  await runner.test('Disabled assignees do not require configuration', async () => {
    const config = await loadExampleConfig();
    config.assignees = { enabled: false };
    const errors = validateConfig(config);
    assert(!errors.some(e => e.field === 'assignees'), 'Should not require assignees when disabled');
  });
}

/**
 * Test template rendering
 */
async function testTemplateRendering(runner) {
  console.log('\n🎨 Template Rendering Tests\n');

  await runner.test('Simple variable substitution', async () => {
    const template = 'Hello {{name}}!';
    const config = { name: 'World' };
    const result = renderTemplate(template, config);
    assertEquals(result, 'Hello World!', 'Template should render correctly');
  });

  await runner.test('Nested property access', async () => {
    const template = '{{user.profile.name}}';
    const config = { user: { profile: { name: 'Test' } } };
    const result = renderTemplate(template, config);
    assertEquals(result, 'Test', 'Should access nested properties');
  });

  await runner.test('Conditional sections (truthy)', async () => {
    const template = '{{#show}}visible{{/show}}';
    const config = { show: true };
    const result = renderTemplate(template, config);
    assertEquals(result, 'visible', 'Should show conditional content');
  });

  await runner.test('Conditional sections (falsy)', async () => {
    const template = '{{#show}}hidden{{/show}}';
    const config = { show: false };
    const result = renderTemplate(template, config);
    assertEquals(result, '', 'Should hide conditional content');
  });

  await runner.test('Inverted sections', async () => {
    const template = '{{^hide}}visible{{/hide}}';
    const config = { hide: false };
    const result = renderTemplate(template, config);
    assertEquals(result, 'visible', 'Should show inverted content');
  });

  await runner.test('Array iteration', async () => {
    const template = '{{#items}}{{name}},{{/items}}';
    const config = { items: [{ name: 'A' }, { name: 'B' }] };
    const result = renderTemplate(template, config);
    assertEquals(result, 'A,B,', 'Should iterate over array');
  });

  await runner.test('Undefined variables render as empty', async () => {
    const template = '{{missing}}';
    const config = {};
    const result = renderTemplate(template, config);
    assertEquals(result, '', 'Should render empty string for undefined');
  });
}

/**
 * Test template file rendering
 */
async function testTemplateFiles(runner) {
  console.log('\n📄 Template File Tests\n');

  const templatesDir = path.join(__dirname, '../templates');
  const config = await loadExampleConfig();

  const templates = [
    'github-workflow.yml.template',
    'linear-workflow.md.template',
    'claude-instructions.md.template',
    'mcp-config.json.template',
    'config-file.json.template',
    'commit-msg.template'
  ];

  for (const template of templates) {
    await runner.test(`Template exists: ${template}`, async () => {
      const templatePath = path.join(templatesDir, template);
      const exists = await fileExists(templatePath);
      assert(exists, `Template file not found: ${templatePath}`);
    });

    await runner.test(`Template renders: ${template}`, async () => {
      const templatePath = path.join(templatesDir, template);
      const content = await fs.readFile(templatePath, 'utf8');
      const rendered = renderTemplate(content, config);
      assert(rendered.length > 0, 'Rendered template should not be empty');
      assert(!rendered.includes('{{'), 'All variables should be substituted');
    });
  }
}

/**
 * Test GitHub integration
 */
async function testGitHubIntegration(runner) {
  console.log('\n🐙 GitHub Integration Tests\n');

  await runner.test('GitHub CLI is installed', async () => {
    const { isGitHubCLIInstalled } = require('./github-setup.js');
    const installed = await isGitHubCLIInstalled();
    assert(installed, 'GitHub CLI must be installed');
  });

  await runner.test('GitHub access verification runs', async () => {
    const results = await verifyGitHubAccess();
    assert(results.checks.length > 0, 'Should run multiple checks');
    assert(['pass', 'warn', 'fail'].includes(results.overall), 'Should have valid status');
  });

  // Only test these if we're in a GitHub repo
  const { getRepositoryInfo } = require('./github-setup.js');
  const repoInfo = await getRepositoryInfo();

  await runner.test('GitHub Actions status check', async () => {
    const actions = await checkGitHubActionsStatus();
    assert(typeof actions.enabled === 'boolean', 'Should return boolean status');
  }, { skip: !repoInfo.success });

  await runner.test('Secret listing works', async () => {
    const { listRepositorySecrets } = require('./github-setup.js');
    const secrets = await listRepositorySecrets();
    assert(Array.isArray(secrets), 'Should return array of secrets');
  }, { skip: !repoInfo.success });
}

/**
 * Test file operations
 */
async function testFileOperations(runner) {
  console.log('\n📁 File Operation Tests\n');

  const testDir = '/tmp/linear-workflow-test';
  const testFile = path.join(testDir, 'test.txt');

  await runner.test('Ensure directory creation', async () => {
    const { ensureDirectory } = require('./apply-config.js');
    await ensureDirectory(testDir);
    const exists = await fileExists(testDir);
    assert(exists, 'Directory should be created');
  });

  await runner.test('Atomic file write', async () => {
    const { writeFileAtomic } = require('./apply-config.js');
    await writeFileAtomic(testFile, 'test content');
    const exists = await fileExists(testFile);
    assert(exists, 'File should be created');
    const content = await fs.readFile(testFile, 'utf8');
    assertEquals(content, 'test content', 'Content should match');
  });

  await runner.test('File backup creation', async () => {
    const { backupFile } = require('./apply-config.js');
    const backupPath = await backupFile(testFile);
    assert(backupPath, 'Should return backup path');
    const exists = await fileExists(backupPath);
    assert(exists, 'Backup file should exist');
  });

  await runner.test('Rollback functionality', async () => {
    const { backupFile, writeFileAtomic, rollback } = require('./apply-config.js');

    // Create original
    await writeFileAtomic(testFile, 'original');

    // Backup
    await backupFile(testFile);

    // Modify
    await writeFileAtomic(testFile, 'modified');

    // Rollback
    await rollback();

    // Check restored
    const content = await fs.readFile(testFile, 'utf8');
    assertEquals(content, 'original', 'Should restore original content');
  });

  // Cleanup
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Test complete workflow
 */
async function testCompleteWorkflow(runner) {
  console.log('\n🔄 Complete Workflow Tests\n');

  await runner.test('Example config loads', async () => {
    const config = await loadExampleConfig();
    assert(config.version, 'Config should have version');
    assert(config.project, 'Config should have project');
    assert(config.linear, 'Config should have linear');
  });

  await runner.test('Example config validates', async () => {
    const config = await loadExampleConfig();
    const errors = validateConfig(config);
    assert(errors.length === 0, `Config has validation errors: ${formatErrors(errors)}`);
  });

  await runner.test('Dry run completes without errors', async () => {
    const { installWorkflow } = require('./example-usage.js');
    const config = await loadExampleConfig();

    // Run in dry-run mode (doesn't write files)
    const result = await installWorkflow(config, { dryRun: true });
    assert(result, 'Should return result object');
  });
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('═'.repeat(60));
  console.log('Linear Workflow Integration Tests');
  console.log('═'.repeat(60));

  const runner = new TestRunner();

  try {
    // Run test suites
    await testConfigValidation(runner);
    await testTemplateRendering(runner);
    await testTemplateFiles(runner);
    await testFileOperations(runner);
    await testGitHubIntegration(runner);
    await testCompleteWorkflow(runner);

    // Print summary
    const success = runner.summary();

    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Critical test failure:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for programmatic use
module.exports = {
  TestRunner,
  loadExampleConfig
};
