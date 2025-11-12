#!/usr/bin/env node

/**
 * Example Usage Script
 *
 * Demonstrates how to use the template rendering system to generate
 * workflow files from templates and configuration.
 *
 * This script can be used as:
 * 1. Reference for implementing the setup wizard
 * 2. Manual installation script
 * 3. Testing the template system
 *
 * Usage:
 *   node example-usage.js [--dry-run]
 */

const path = require('path');
const { applyMultipleConfigs, deleteBackups, rollback } = require('./apply-config.js');
const { validateConfig, formatErrors } = require('./validate-config.js');

// ============================================================================
// Example Configuration
// ============================================================================

/**
 * This is an example configuration that would be gathered from the wizard
 */
const exampleConfig = {
  version: '1.0.0',

  project: {
    name: 'my-awesome-project',
    path: '/tmp/my-awesome-project'  // Using /tmp for cross-platform compatibility
  },

  branches: {
    main: 'main',
    staging: 'staging',
    prod: 'production'
  },

  linear: {
    teamKey: 'DEV',
    teamId: 'abc-123-uuid-here',
    teamName: 'Development',
    workspaceId: 'xyz-456-uuid-here',
    workspaceName: 'Acme Inc',
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
    issueExample: 'DEV-123'
  },

  detail: 'technical',

  paths: {
    issues: '/docs/issues/',
    workflow: '/.github/workflows/linear-status-update.yml'
  },

  // Auto-assignment (optional)
  assignees: {
    enabled: true,
    onReview: 'user-uuid-alice',      // Alice reviews code
    onStaging: 'user-uuid-carol',     // Carol handles QA
    preserveOriginal: true            // Keep existing assignee if set
  },

  installed: new Date().toISOString(),
  installedBy: 'claude-code-cli'
};

// ============================================================================
// Template Mapping
// ============================================================================

/**
 * Define which templates should be applied and where
 */
function getTemplateMapping(projectPath) {
  const templatesDir = path.join(__dirname, '../templates');

  return [
    {
      name: 'GitHub Actions Workflow',
      templatePath: path.join(templatesDir, 'github-workflow.yml.template'),
      outputPath: path.join(projectPath, '.github/workflows/linear-status-update.yml')
    },
    {
      name: 'Linear Workflow Documentation',
      templatePath: path.join(templatesDir, 'linear-workflow.md.template'),
      outputPath: path.join(projectPath, 'docs/linear-workflow.md')
    },
    {
      name: 'Claude Instructions',
      templatePath: path.join(templatesDir, 'claude-instructions.md.template'),
      outputPath: path.join(projectPath, 'CLAUDE.md.linear-section')
    },
    {
      name: 'MCP Configuration',
      templatePath: path.join(templatesDir, 'mcp-config.json.template'),
      outputPath: path.join(projectPath, '.mcp.json')
    },
    {
      name: 'Configuration File',
      templatePath: path.join(templatesDir, 'config-file.json.template'),
      outputPath: path.join(projectPath, '.linear-workflow.json')
    },
    {
      name: 'Git Commit Hook',
      templatePath: path.join(templatesDir, 'commit-msg.template'),
      outputPath: path.join(projectPath, '.git/hooks/commit-msg')
    }
  ];
}

// ============================================================================
// Installation Functions
// ============================================================================

/**
 * Install workflow files from templates
 *
 * @param {Object} config - User configuration
 * @param {Object} options - Installation options
 * @returns {Promise<Object>} Installation result
 */
async function installWorkflow(config, options = {}) {
  const {
    dryRun = false,
    continueOnError = false,
    backup = true
  } = options;

  console.log('\n📦 Installing Linear Workflow\n');

  // Step 1: Validate configuration
  console.log('1. Validating configuration...');
  const errors = validateConfig(config);

  if (errors.length > 0) {
    console.error('\n' + formatErrors(errors));
    return { success: false, errors };
  }
  console.log('   ✓ Configuration is valid\n');

  // Step 2: Apply templates
  console.log('2. Applying templates...');

  const templates = getTemplateMapping(config.project.path);
  const results = [];

  try {
    for (const template of templates) {
      console.log(`   Processing: ${template.name}`);

      const result = await applyMultipleConfigs(
        [template],
        config,
        { dryRun, continueOnError, backup }
      );

      results.push(...result);

      if (result[0].success) {
        if (dryRun) {
          console.log(`   ✓ ${template.name} (dry run)`);
        } else {
          console.log(`   ✓ ${template.name}`);
          if (result[0].backupPath) {
            console.log(`     Backup: ${result[0].backupPath}`);
          }
        }
      } else {
        console.log(`   ✗ ${template.name}`);
        console.log(`     Error: ${result[0].error}`);

        if (!continueOnError) {
          throw new Error(`Failed to apply template: ${template.name}`);
        }
      }
    }

    console.log('\n3. Installation summary:');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`   ✓ ${successful} template(s) applied successfully`);
    if (failed > 0) {
      console.log(`   ✗ ${failed} template(s) failed`);
    }

    if (dryRun) {
      console.log('\n   (Dry run - no files were actually written)');
    }

    return {
      success: failed === 0,
      results,
      successful,
      failed
    };

  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    console.log('\nAttempting rollback...');

    const rollbackResult = await rollback({ deleteBackups: false });

    if (rollbackResult.success) {
      console.log('✓ Rollback successful - all changes reverted');
      console.log(`  Restored ${rollbackResult.restored.length} file(s)`);
    } else {
      console.error('✗ Rollback failed');
      console.error('  Failed files:', rollbackResult.failed);
    }

    return {
      success: false,
      error: error.message,
      rollback: rollbackResult
    };
  }
}

/**
 * Clean up backup files after successful installation
 */
async function cleanupBackups() {
  console.log('\n🧹 Cleaning up backup files...');

  const result = await deleteBackups();

  if (result.success) {
    console.log(`✓ Deleted ${result.deleted.length} backup file(s)`);
  } else {
    console.error('✗ Failed to delete some backups');
    console.error('  Failed:', result.failed);
  }

  return result;
}

// ============================================================================
// CLI Interface
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse command line options
  const dryRun = args.includes('--dry-run');
  const continueOnError = args.includes('--continue-on-error');
  const noBackup = args.includes('--no-backup');
  const cleanup = args.includes('--cleanup');

  if (args.includes('--help')) {
    console.log(`
Linear Workflow Installation Example

Usage:
  node example-usage.js [options]

Options:
  --dry-run             Don't actually write files, just show what would happen
  --continue-on-error   Continue installing even if a template fails
  --no-backup           Don't create backup files
  --cleanup             Delete backup files after successful installation
  --help                Show this help message

Example:
  node example-usage.js --dry-run
  node example-usage.js
  node example-usage.js --cleanup

Note:
  This script uses the example configuration defined in the script.
  In the real wizard, configuration would come from user input.
`);
    return;
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Linear Workflow Installation Example');
  console.log('═══════════════════════════════════════════════════════');

  console.log('\n📋 Configuration:');
  console.log('   Project:', exampleConfig.project.name);
  console.log('   Team:', exampleConfig.linear.teamName, `(${exampleConfig.linear.teamKey})`);
  console.log('   Branches:', Object.entries(exampleConfig.branches)
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join(', '));
  console.log('   Detail Level:', exampleConfig.detail);

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No files will be written');
  }

  // Install workflow
  const result = await installWorkflow(exampleConfig, {
    dryRun,
    continueOnError,
    backup: !noBackup
  });

  if (result.success) {
    console.log('\n✅ Installation completed successfully!\n');

    if (!dryRun) {
      console.log('Next steps:');
      console.log('1. Review generated files in your project');
      console.log('2. Set up LINEAR_API_KEY in GitHub secrets');
      console.log('3. Commit and push the workflow files');
      console.log('4. Test with: "Start work on DEV-123"');

      if (cleanup) {
        await cleanupBackups();
      }
    }
  } else {
    console.log('\n❌ Installation failed\n');
    console.error('Errors:', result.errors || result.error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  installWorkflow,
  cleanupBackups,
  exampleConfig,
  getTemplateMapping
};
