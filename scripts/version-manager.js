#!/usr/bin/env node

/**
 * Version Manager - Handle workflow versioning and migrations
 *
 * Detects existing workflow installations, compares versions,
 * and provides migration paths for upgrades.
 *
 * Usage:
 *   node scripts/version-manager.js check
 *   node scripts/version-manager.js upgrade --from 1.0.0 --to 1.1.0
 *   node scripts/version-manager.js list-migrations
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// Version Constants
// ============================================================================

const CURRENT_VERSION = '1.1.0';
const CONFIG_FILE = '.linear-workflow.json';

// ============================================================================
// Migration Definitions
// ============================================================================

/**
 * Migration registry - defines all available migrations
 * Each migration has: fromVersion, toVersion, description, and migration function
 */
const MIGRATIONS = [
  {
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    description: 'Add commit reference options and fix workflow bugs',
    breaking: false,
    changes: [
      '✨ New: Commit message reference options (Related/Closes/Fixes)',
      '✨ New: Linear magic word automation detection and conflict warnings',
      '✨ New: GitHub Actions is now optional (MCP-first approach)',
      '🐛 Fix: GitHub Actions workflow branches syntax error',
      '🔧 Improved: MCP-first authentication flow (no API key required for setup)',
      '📝 Improved: Better documentation of Linear native integration vs workflow'
    ],
    async migrate(config, projectPath) {
      const path = require('path');
      const fs = require('fs').promises;

      // Add new features to config
      const updated = { ...config };

      // Add version field if missing
      if (!updated.version) {
        updated.version = '1.0.0';
      }

      // Add commit message reference configuration
      if (!updated.formats.issueReference) {
        updated.formats.issueReference = 'related';
        updated.formats.issueReferenceKeyword = 'Related';
      }

      // Add Linear automation detection
      if (!updated.linearAutomations) {
        updated.linearAutomations = {
          magicWordsEnabled: false,
          checkedAt: new Date().toISOString(),
          note: 'If true, using Closes/Fixes may conflict with GitHub Actions'
        };
      }

      // Add GitHub Actions configuration
      if (!updated.githubActions) {
        // Detect if GitHub Actions is enabled by checking for workflow file
        const workflowPath = path.join(projectPath, '.github/workflows/linear-status-update.yml');
        let workflowExists = false;

        try {
          await fs.access(workflowPath);
          workflowExists = true;
        } catch {
          // File doesn't exist
        }

        updated.githubActions = {
          enabled: workflowExists,
          apiKeyConfigured: workflowExists
        };
      }

      // Fix GitHub Actions workflow file if it exists
      const workflowPath = path.join(projectPath, '.github/workflows/linear-status-update.yml');
      try {
        let workflowContent = await fs.readFile(workflowPath, 'utf8');

        // Fix: branches + branches-ignore syntax error
        // Replace pattern: branches: with '**' and '!' patterns → branches-ignore:
        const hasSyntaxError = workflowContent.includes("branches:\n      - '**'") ||
                               workflowContent.includes("branches:\n      - \"**\"");

        if (hasSyntaxError) {
          console.log('  🔧 Fixing workflow file branches syntax...');

          // Replace the problematic push section
          workflowContent = workflowContent.replace(
            /push:\s+branches:\s+- ['"]?\*\*['"]?\s+- ['"]?![^'"]+['"]?(\s+- ['"]?![^'"]+['"]?)?(\s+- ['"]?![^'"]+['"]?)?/g,
            (match) => {
              // Extract the excluded branches
              const mainBranch = config.branches?.main || 'main';
              const stagingBranch = config.branches?.staging || '';
              const prodBranch = config.branches?.prod || '';

              let replacement = `push:\n    branches-ignore:\n      - '${mainBranch}'`;

              if (stagingBranch) {
                replacement += `\n      - '${stagingBranch}'`;
              }
              if (prodBranch) {
                replacement += `\n      - '${prodBranch}'`;
              }

              return replacement;
            }
          );

          await fs.writeFile(workflowPath, workflowContent, 'utf8');
          console.log('  ✓ Workflow file updated');
        }
      } catch (error) {
        // Workflow file doesn't exist or can't be read - that's okay
        if (error.code !== 'ENOENT') {
          console.log(`  ⚠️  Could not update workflow file: ${error.message}`);
        }
      }

      // Update version
      updated.version = '1.1.0';
      updated.lastMigration = new Date().toISOString();

      return updated;
    }
  },

  {
    fromVersion: '1.1.0',
    toVersion: '1.2.0',
    description: 'Add configuration profiles and interactive editor',
    breaking: false,
    changes: [
      'New: Configuration profiles (Startup, Small Team, Enterprise)',
      'New: Interactive configuration editor',
      'New: Workflow simulation mode',
      'Improved: Better template rendering performance',
      'Fixed: Handling of special characters in commit messages'
    ],
    async migrate(config, projectPath) {
      const updated = { ...config };

      // Add profile metadata
      updated.profile = updated.profile || 'custom';

      // Detect profile based on branch strategy
      if (config.branches) {
        if (!config.branches.staging && !config.branches.prod) {
          updated.profile = 'startup';
        } else if (config.branches.staging && !config.branches.prod) {
          updated.profile = 'small-team';
        } else if (config.branches.staging && config.branches.prod) {
          updated.profile = 'enterprise';
        }
      }

      // Add editor preferences
      updated.preferences = updated.preferences || {
        confirmOnExit: true,
        autoSave: false,
        verboseLogging: false
      };

      updated.version = '1.2.0';
      updated.lastMigration = new Date().toISOString();

      return updated;
    }
  }
];

// ============================================================================
// Version Detection & Comparison
// ============================================================================

/**
 * Load existing configuration
 */
async function loadConfig(projectPath = process.cwd()) {
  const configPath = path.join(projectPath, CONFIG_FILE);

  try {
    const content = await fs.readFile(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null; // No existing config
  }
}

/**
 * Compare two semantic versions
 * @returns {number} -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
}

/**
 * Get applicable migrations between two versions
 */
function getMigrationPath(fromVersion, toVersion) {
  const path = [];

  // Sort migrations by version order
  const sortedMigrations = [...MIGRATIONS].sort((a, b) =>
    compareVersions(a.fromVersion, b.fromVersion)
  );

  // Find all migrations needed to get from fromVersion to toVersion
  let currentVersion = fromVersion;

  for (const migration of sortedMigrations) {
    // Skip if migration starts before our current version
    if (compareVersions(migration.fromVersion, currentVersion) < 0) {
      continue;
    }

    // Stop if migration goes beyond target version
    if (compareVersions(migration.toVersion, toVersion) > 0) {
      break;
    }

    // Include migration if it's in our path
    if (compareVersions(migration.fromVersion, currentVersion) >= 0) {
      path.push(migration);
      currentVersion = migration.toVersion;
    }
  }

  return path;
}

// ============================================================================
// Git Branch Management
// ============================================================================

/**
 * Create upgrade branch for version changes
 */
async function createUpgradeBranch(targetVersion) {
  const branchName = `upgrade/linear-workflow-v${targetVersion}`;

  console.log('Creating upgrade branch...');
  console.log('');

  try {
    // Check if branch already exists
    try {
      execSync(`git rev-parse --verify ${branchName}`, { stdio: 'pipe' });

      // Branch exists, ask what to do
      console.log(`⚠️  Branch '${branchName}' already exists`);
      console.log('');
      console.log('Options:');
      console.log('  1. Use existing branch (will overwrite changes)');
      console.log('  2. Choose different branch name');
      console.log('  3. Cancel upgrade');
      console.log('');
      console.log('Defaulting to option 1 (use existing branch)');
      console.log('');

      execSync(`git checkout ${branchName}`, { stdio: 'inherit' });

    } catch {
      // Branch doesn't exist, create it
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    }

    console.log(`✓ On branch: ${branchName}`);
    console.log('');

    return branchName;

  } catch (error) {
    throw new Error(`Failed to create upgrade branch: ${error.message}`);
  }
}

/**
 * Commit upgrade changes
 */
async function commitUpgrade(version, config) {
  const branchName = `upgrade/linear-workflow-v${version}`;

  console.log('Committing upgrade changes...');
  console.log('');

  try {
    // Stage changes
    execSync('git add .linear-workflow.json .github/ docs/', { stdio: 'inherit' });

    // Create commit with detailed message
    const commitMessage = `chore: Upgrade Linear workflow to v${version}

Upgraded from ${config.version || '1.0.0'} to ${version}

Changes:
${getUpgradeChangelog(config.version || '1.0.0', version)}

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

    console.log('✓ Changes committed');
    console.log('');

    // Push branch
    console.log(`Pushing ${branchName} to remote...`);
    execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });

    console.log('✓ Branch pushed to remote');
    console.log('');

    return branchName;

  } catch (error) {
    throw new Error(`Failed to commit upgrade: ${error.message}`);
  }
}

/**
 * Get changelog for upgrade
 */
function getUpgradeChangelog(fromVersion, toVersion) {
  const migrations = getMigrationPath(fromVersion, toVersion);

  let changelog = '';
  migrations.forEach(migration => {
    changelog += `\n${migration.fromVersion} → ${migration.toVersion}: ${migration.description}\n`;
    migration.changes.forEach(change => {
      changelog += `  • ${change}\n`;
    });
  });

  return changelog.trim();
}

// ============================================================================
// Migration Execution
// ============================================================================

/**
 * Execute a series of migrations
 */
async function executeMigrations(config, migrations, projectPath) {
  let currentConfig = config;

  console.log('Executing migrations...');
  console.log('');

  for (const migration of migrations) {
    console.log(`Migrating ${migration.fromVersion} → ${migration.toVersion}`);
    console.log(`  ${migration.description}`);

    if (migration.breaking) {
      console.log('  ⚠️  This is a BREAKING change');
    }

    try {
      currentConfig = await migration.migrate(currentConfig, projectPath);
      console.log('  ✓ Migration completed');
      console.log('');
    } catch (error) {
      console.error(`  ✗ Migration failed: ${error.message}`);
      throw error;
    }
  }

  return currentConfig;
}

/**
 * Save updated configuration
 */
async function saveConfig(config, projectPath = process.cwd()) {
  const configPath = path.join(projectPath, CONFIG_FILE);

  // Create backup of old config
  try {
    await fs.copyFile(configPath, `${configPath}.backup`);
    console.log('✓ Backup created: .linear-workflow.json.backup');
  } catch {
    // No existing config to backup
  }

  await fs.writeFile(
    configPath,
    JSON.stringify(config, null, 2),
    'utf8'
  );

  console.log('✓ Configuration updated');
}

// ============================================================================
// CLI Commands
// ============================================================================

async function checkVersion(projectPath = process.cwd()) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Workflow Version Check');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  const config = await loadConfig(projectPath);

  if (!config) {
    console.log('Status: No workflow installed');
    console.log('');
    console.log('To install the Linear workflow, run:');
    console.log('  Setup Linear workflow');
    console.log('');
    return;
  }

  const installedVersion = config.version || '1.0.0'; // Default to 1.0.0 if not set
  const comparison = compareVersions(installedVersion, CURRENT_VERSION);

  console.log(`Installed Version: ${installedVersion}`);
  console.log(`Latest Version:    ${CURRENT_VERSION}`);
  console.log('');

  if (comparison === 0) {
    console.log('✅ You have the latest version!');
    console.log('');
  } else if (comparison < 0) {
    console.log('📦 Update available!');
    console.log('');

    const migrations = getMigrationPath(installedVersion, CURRENT_VERSION);

    if (migrations.length > 0) {
      console.log(`${migrations.length} migration(s) available:`);
      console.log('');

      migrations.forEach(migration => {
        console.log(`  ${migration.fromVersion} → ${migration.toVersion}`);
        console.log(`  ${migration.description}`);
        if (migration.breaking) {
          console.log('  ⚠️  BREAKING CHANGE');
        }
        console.log('');
        console.log('  Changes:');
        migration.changes.forEach(change => {
          console.log(`    • ${change}`);
        });
        console.log('');
      });

      console.log('To upgrade, run:');
      console.log(`  node scripts/version-manager.js upgrade --to ${CURRENT_VERSION}`);
      console.log('');
    } else {
      console.log('⚠️  No migration path found');
      console.log('');
      console.log('You may need to reinstall the workflow.');
      console.log('');
    }
  } else {
    console.log('⚠️  Installed version is newer than this tool');
    console.log('');
    console.log('You may need to update the claude-linear-gh-starter repository.');
    console.log('');
  }

  // Show installation details
  console.log('Installation Details:');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`Installed: ${config.installed || 'Unknown'}`);
  console.log(`Last Migration: ${config.lastMigration || 'Never'}`);

  if (config.project) {
    console.log(`Project: ${config.project.name}`);
  }

  if (config.linear) {
    console.log(`Linear Team: ${config.linear.teamKey} - ${config.linear.teamName}`);
  }

  console.log('');
}

async function upgrade(options = {}) {
  const { from, to, projectPath = process.cwd(), createBranch = false } = options;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Workflow Upgrade');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Load current config
  const config = await loadConfig(projectPath);

  if (!config) {
    console.error('✗ No existing workflow found');
    console.error('');
    console.error('Install the workflow first by running:');
    console.error('  Setup Linear workflow');
    console.error('');
    process.exit(1);
  }

  const currentVersion = config.version || '1.0.0';
  const targetVersion = to || CURRENT_VERSION;

  console.log(`Current Version: ${currentVersion}`);
  console.log(`Target Version:  ${targetVersion}`);
  console.log('');

  if (compareVersions(currentVersion, targetVersion) >= 0) {
    console.log('✓ Already at target version or newer');
    console.log('');
    process.exit(0);
  }

  // Get migration path
  const migrations = getMigrationPath(currentVersion, targetVersion);

  if (migrations.length === 0) {
    console.error('✗ No migration path found');
    console.error('');
    console.error('You may need to reinstall the workflow.');
    console.error('');
    process.exit(1);
  }

  // Show migration plan
  console.log('Migration Plan:');
  console.log('─────────────────────────────────────────────────────────────');
  migrations.forEach(migration => {
    console.log(`${migration.fromVersion} → ${migration.toVersion}`);
    console.log(`  ${migration.description}`);
    if (migration.breaking) {
      console.log('  ⚠️  BREAKING CHANGE');
    }
  });
  console.log('');

  // Create upgrade branch if requested
  let branchName = null;
  if (createBranch) {
    branchName = await createUpgradeBranch(targetVersion);
  }

  console.log('Starting upgrade...');
  console.log('');

  try {
    // Execute migrations
    const upgradedConfig = await executeMigrations(config, migrations, projectPath);

    // Save updated config
    await saveConfig(upgradedConfig, projectPath);

    // Commit and push if branch was created
    if (createBranch) {
      await commitUpgrade(targetVersion, config);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Upgrade Complete!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Upgraded from ${currentVersion} to ${upgradedConfig.version}`);
    console.log('');

    if (createBranch) {
      console.log('Branch Details:');
      console.log(`  Branch: ${branchName}`);
      console.log(`  Remote: origin/${branchName}`);
      console.log('');
      console.log('Next steps:');
      console.log('  1. Review changes: git diff main');
      console.log('  2. Test workflow: node scripts/test-integration.js');
      console.log('  3. Create PR:');
      console.log('');
      console.log(`     gh pr create --base main --head ${branchName} \\`);
      console.log(`       --title "chore: Upgrade Linear workflow to v${upgradedConfig.version}" \\`);
      console.log(`       --body "Upgrades Linear workflow from ${currentVersion} to ${upgradedConfig.version}\\n\\n${getUpgradeChangelog(currentVersion, upgradedConfig.version).replace(/\n/g, '\\n')}"`);
      console.log('');
      console.log('  4. Merge when ready!');
      console.log('');
    } else {
      console.log('Next steps:');
      console.log('  1. Review changes in .linear-workflow.json');
      console.log('  2. Test workflow: node scripts/test-integration.js');
      console.log('  3. Commit changes: git commit -m "chore: Upgrade workflow to v' + upgradedConfig.version + '"');
      console.log('');
    }

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('❌ Upgrade Failed');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    console.error(`Error: ${error.message}`);
    console.error('');
    console.error('Your original configuration has been backed up to:');
    console.error('  .linear-workflow.json.backup');
    console.error('');
    console.error('To restore:');
    console.error('  mv .linear-workflow.json.backup .linear-workflow.json');
    console.error('');

    // If we created a branch, offer to delete it
    if (createBranch && branchName) {
      console.error('To delete the upgrade branch:');
      console.error(`  git checkout main && git branch -D ${branchName}`);
      console.error('');
    }

    process.exit(1);
  }
}

async function listMigrations() {
  console.log('Available Migrations');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  MIGRATIONS.forEach(migration => {
    console.log(`${migration.fromVersion} → ${migration.toVersion}`);
    console.log(`  ${migration.description}`);

    if (migration.breaking) {
      console.log('  ⚠️  BREAKING CHANGE');
    }

    console.log('');
    console.log('  Changes:');
    migration.changes.forEach(change => {
      console.log(`    • ${change}`);
    });

    console.log('');
  });
}

// ============================================================================
// Main CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'check':
        await checkVersion();
        break;

      case 'upgrade': {
        const toIndex = args.indexOf('--to');
        const to = toIndex !== -1 ? args[toIndex + 1] : CURRENT_VERSION;
        const createBranch = args.includes('--create-branch');

        await upgrade({ to, createBranch });
        break;
      }

      case 'list-migrations':
        await listMigrations();
        break;

      default:
        console.log('Version Manager - Workflow Version Management');
        console.log('');
        console.log('Usage:');
        console.log('  node scripts/version-manager.js check');
        console.log('  node scripts/version-manager.js upgrade [--to <version>] [--create-branch]');
        console.log('  node scripts/version-manager.js list-migrations');
        console.log('');
        console.log('Commands:');
        console.log('  check            - Check installed version and available updates');
        console.log('  upgrade          - Upgrade to latest or specified version');
        console.log('  list-migrations  - List all available migrations');
        console.log('');
        console.log('Options:');
        console.log('  --to <version>   - Target version (default: latest)');
        console.log('  --create-branch  - Create upgrade branch, commit, and push (recommended)');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/version-manager.js upgrade --create-branch');
        console.log('  node scripts/version-manager.js upgrade --to 1.2.0 --create-branch');
        console.log('');
        process.exit(1);
    }

    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  loadConfig,
  compareVersions,
  getMigrationPath,
  executeMigrations,
  CURRENT_VERSION,
  MIGRATIONS
};

if (require.main === module) {
  main();
}
