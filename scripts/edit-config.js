#!/usr/bin/env node

/**
 * Interactive Configuration Editor
 *
 * Edit .linear-workflow.json configuration interactively.
 * Similar to `npm init` but for workflow configuration.
 *
 * Usage:
 *   node scripts/edit-config.js
 *   node scripts/edit-config.js --section branches
 *   node scripts/edit-config.js --backup
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG_FILE = '.linear-workflow.json';
const BACKUP_SUFFIX = '.backup';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create readline interface for user input
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Prompt user for input
 */
function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const rl = createInterface();
    const displayDefault = defaultValue ? ` [${defaultValue}]` : '';

    rl.question(`${question}${displayDefault}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Prompt for yes/no confirmation
 */
async function confirm(question, defaultYes = true) {
  const defaultStr = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await prompt(`${question} ${defaultStr}`);
  const normalized = answer.toLowerCase();

  if (!normalized) return defaultYes;
  return normalized === 'y' || normalized === 'yes';
}

/**
 * Display menu and get selection
 */
async function menu(title, options) {
  console.log('');
  console.log('━'.repeat(65));
  console.log(title);
  console.log('━'.repeat(65));
  console.log('');

  options.forEach((option, index) => {
    console.log(`  ${index + 1}. ${option.label}`);
    if (option.description) {
      console.log(`     ${option.description}`);
    }
  });

  console.log('  0. Back / Cancel');
  console.log('');

  const answer = await prompt('Your choice', '0');
  const choice = parseInt(answer, 10);

  if (isNaN(choice) || choice < 0 || choice > options.length) {
    return null;
  }

  return choice === 0 ? null : options[choice - 1];
}

/**
 * Load configuration file
 */
async function loadConfig(filePath = CONFIG_FILE) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`✗ Configuration file not found: ${filePath}`);
      console.error('');
      console.error('Run the setup wizard first:');
      console.error('  /setup-linear');
      console.error('');
    } else {
      console.error(`✗ Error loading configuration: ${error.message}`);
    }
    process.exit(1);
  }
}

/**
 * Save configuration file
 */
async function saveConfig(config, filePath = CONFIG_FILE) {
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Create backup of configuration
 */
async function backupConfig(filePath = CONFIG_FILE) {
  const backupPath = `${filePath}${BACKUP_SUFFIX}`;
  await fs.copyFile(filePath, backupPath);
  return backupPath;
}

// ============================================================================
// Configuration Editors
// ============================================================================

/**
 * Edit branch configuration
 */
async function editBranches(config) {
  console.log('');
  console.log('Current Branch Configuration:');
  console.log('─'.repeat(65));
  console.log(`  Main branch:       ${config.branches.main || 'not set'}`);
  console.log(`  Staging branch:    ${config.branches.staging || 'not set'}`);
  console.log(`  Production branch: ${config.branches.prod || 'not set'}`);
  console.log('');

  if (!await confirm('Edit branch configuration?')) {
    return false;
  }

  config.branches.main = await prompt(
    'Main branch name',
    config.branches.main || 'main'
  );

  config.branches.staging = await prompt(
    'Staging branch (leave empty for none)',
    config.branches.staging || ''
  ) || null;

  config.branches.prod = await prompt(
    'Production branch (leave empty for none)',
    config.branches.prod || ''
  ) || null;

  console.log('');
  console.log('✓ Branch configuration updated');
  return true;
}

/**
 * Edit Linear status mappings
 */
async function editStatuses(config) {
  console.log('');
  console.log('Current Status Mappings:');
  console.log('─'.repeat(65));
  console.log(`  In Progress: ${config.linear.statuses.inProgress}`);
  console.log(`  Review:      ${config.linear.statuses.review}`);
  if (config.linear.statuses.staging) {
    console.log(`  Staging:     ${config.linear.statuses.staging}`);
  }
  console.log(`  Done:        ${config.linear.statuses.done}`);
  console.log('');

  if (!await confirm('Edit status mappings?')) {
    return false;
  }

  console.log('');
  console.log('Note: Status names must match your Linear workflow states exactly.');
  console.log('');

  config.linear.statuses.inProgress = await prompt(
    'Status when pushed to feature branch',
    config.linear.statuses.inProgress
  );

  config.linear.statuses.review = await prompt(
    'Status when merged to main',
    config.linear.statuses.review
  );

  if (config.branches.staging) {
    config.linear.statuses.staging = await prompt(
      'Status when merged to staging',
      config.linear.statuses.staging || ''
    ) || null;
  }

  config.linear.statuses.done = await prompt(
    'Status when merged to production (or final stage)',
    config.linear.statuses.done
  );

  console.log('');
  console.log('✓ Status mappings updated');
  console.log('');
  console.log('⚠️  Note: You may need to update status IDs separately');
  console.log('   Run: node scripts/linear-helpers.js statuses <team-id>');
  console.log('');
  return true;
}

/**
 * Edit format configuration
 */
async function editFormats(config) {
  console.log('');
  console.log('Current Format Configuration:');
  console.log('─'.repeat(65));
  console.log(`  Commit format:  ${config.formats.commit}`);
  console.log(`  PR format:      ${config.formats.pr}`);
  console.log(`  Issue pattern:  ${config.formats.issuePattern}`);
  console.log(`  Issue example:  ${config.formats.issueExample}`);
  console.log('');

  if (!await confirm('Edit format configuration?')) {
    return false;
  }

  // Commit format
  const commitChoice = await menu('Choose commit message format', [
    {
      label: 'Conventional with parens: feat: description (DEV-123)',
      value: 'conventional-parens'
    },
    {
      label: 'Issue prefix: DEV-123: description',
      value: 'issue-prefix'
    },
    {
      label: 'Issue in scope: feat(DEV-123): description',
      value: 'issue-scope'
    }
  ]);

  if (commitChoice) {
    config.formats.commit = commitChoice.value;
  }

  // PR format
  const prChoice = await menu('Choose PR title format', [
    {
      label: 'Issue prefix: DEV-123: Description',
      value: 'issue-prefix'
    },
    {
      label: 'Issue in brackets: [DEV-123] Description',
      value: 'issue-brackets'
    }
  ]);

  if (prChoice) {
    config.formats.pr = prChoice.value;
  }

  // Issue pattern
  console.log('');
  config.formats.issuePattern = await prompt(
    'Issue ID pattern (regex)',
    config.formats.issuePattern
  );

  config.formats.issueExample = await prompt(
    'Issue ID example',
    config.formats.issueExample
  );

  console.log('');
  console.log('✓ Format configuration updated');
  return true;
}

/**
 * Edit auto-assignment configuration
 */
async function editAssignees(config) {
  console.log('');
  console.log('Current Auto-Assignment Configuration:');
  console.log('─'.repeat(65));
  console.log(`  Enabled: ${config.assignees?.enabled ? 'Yes' : 'No'}`);

  if (config.assignees?.enabled) {
    console.log(`  On In Progress: ${config.assignees.onInProgress || 'not set'}`);
    console.log(`  On Review:      ${config.assignees.onReview || 'not set'}`);
    console.log(`  On Staging:     ${config.assignees.onStaging || 'not set'}`);
    console.log(`  On Done:        ${config.assignees.onDone || 'not set'}`);
    console.log(`  Preserve:       ${config.assignees.preserveOriginal ? 'Yes' : 'No'}`);
  }
  console.log('');

  if (!await confirm('Edit auto-assignment configuration?')) {
    return false;
  }

  if (!config.assignees) {
    config.assignees = { enabled: false };
  }

  config.assignees.enabled = await confirm('Enable auto-assignment?', config.assignees.enabled);

  if (config.assignees.enabled) {
    console.log('');
    console.log('Enter user IDs for each status transition (or leave empty to skip):');
    console.log('');
    console.log('💡 Tip: Find user IDs with: node scripts/linear-helpers.js team-members <team-id>');
    console.log('');

    config.assignees.onInProgress = await prompt(
      'Assign when moved to "In Progress"',
      config.assignees.onInProgress || ''
    ) || null;

    config.assignees.onReview = await prompt(
      'Assign when moved to "Review"',
      config.assignees.onReview || ''
    ) || null;

    if (config.linear.statuses.staging) {
      config.assignees.onStaging = await prompt(
        'Assign when moved to "Staging"',
        config.assignees.onStaging || ''
      ) || null;
    }

    config.assignees.onDone = await prompt(
      'Assign when moved to "Done"',
      config.assignees.onDone || ''
    ) || null;

    console.log('');
    config.assignees.preserveOriginal = await confirm(
      'Preserve original assignee when auto-assigning?',
      config.assignees.preserveOriginal !== false
    );
  }

  console.log('');
  console.log('✓ Auto-assignment configuration updated');
  return true;
}

/**
 * Edit detail level
 */
async function editDetailLevel(config) {
  console.log('');
  console.log('Current Detail Level:', config.detail || 'not set');
  console.log('');

  if (!await confirm('Edit detail level?')) {
    return false;
  }

  const choice = await menu('Choose update detail level', [
    {
      label: 'High-level (Stakeholder view)',
      description: 'Brief summaries, business impact focus',
      value: 'stakeholder'
    },
    {
      label: 'Technical (Developer view)',
      description: 'Detailed analysis with code references',
      value: 'technical'
    },
    {
      label: 'Minimal (Status updates only)',
      description: 'One-line updates, commit references only',
      value: 'minimal'
    }
  ]);

  if (choice) {
    config.detail = choice.value;
    console.log('');
    console.log('✓ Detail level updated');
    return true;
  }

  return false;
}

/**
 * Edit documentation paths
 */
async function editPaths(config) {
  console.log('');
  console.log('Current Paths:');
  console.log('─'.repeat(65));
  console.log(`  Issues:   ${config.paths.issues}`);
  console.log(`  Workflow: ${config.paths.workflow}`);
  console.log('');

  if (!await confirm('Edit documentation paths?')) {
    return false;
  }

  config.paths.issues = await prompt(
    'Issue documentation folder',
    config.paths.issues
  );

  config.paths.workflow = await prompt(
    'GitHub Actions workflow path',
    config.paths.workflow
  );

  console.log('');
  console.log('✓ Paths updated');
  return true;
}

// ============================================================================
// Main Menu
// ============================================================================

/**
 * Display main configuration menu
 */
async function mainMenu(config) {
  let modified = false;
  let running = true;

  while (running) {
    const choice = await menu('Configuration Editor - Main Menu', [
      {
        label: 'Edit Branch Strategy',
        description: `Current: main=${config.branches.main}, staging=${config.branches.staging || 'none'}`,
        handler: editBranches
      },
      {
        label: 'Edit Status Mappings',
        description: `Map git events to Linear statuses`,
        handler: editStatuses
      },
      {
        label: 'Edit Commit & PR Formats',
        description: `Current: ${config.formats.commit}, pattern=${config.formats.issuePattern}`,
        handler: editFormats
      },
      {
        label: 'Edit Auto-Assignment Rules',
        description: `Current: ${config.assignees?.enabled ? 'Enabled' : 'Disabled'}`,
        handler: editAssignees
      },
      {
        label: 'Edit Detail Level',
        description: `Current: ${config.detail || 'not set'}`,
        handler: editDetailLevel
      },
      {
        label: 'Edit Documentation Paths',
        description: `Issues: ${config.paths.issues}`,
        handler: editPaths
      },
      {
        label: 'Save and Exit',
        description: 'Save changes and exit editor',
        handler: async () => {
          running = false;
          return true;
        }
      },
      {
        label: 'Exit Without Saving',
        description: 'Discard all changes',
        handler: async () => {
          if (await confirm('Discard all changes?', false)) {
            running = false;
            modified = false;
          }
          return false;
        }
      }
    ]);

    if (!choice) {
      // User selected 0 (back/cancel)
      if (await confirm('Exit editor?', false)) {
        running = false;
      }
    } else if (choice.handler) {
      const changed = await choice.handler(config);
      if (changed) {
        modified = true;
      }
    }
  }

  return modified;
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  console.log('═'.repeat(65));
  console.log('Interactive Configuration Editor');
  console.log('═'.repeat(65));
  console.log('');

  // Check for backup flag
  const shouldBackup = args.includes('--backup') || args.includes('-b');

  // Load existing configuration
  const config = await loadConfig();

  console.log(`✓ Configuration loaded: ${CONFIG_FILE}`);
  console.log(`  Version: ${config.version || '1.0.0'}`);
  console.log(`  Project: ${config.project?.name || 'not set'}`);
  console.log('');

  // Create backup if requested
  if (shouldBackup) {
    const backupPath = await backupConfig();
    console.log(`✓ Backup created: ${backupPath}`);
    console.log('');
  }

  // Check for specific section to edit
  const sectionArg = args.find(arg => arg.startsWith('--section='));
  if (sectionArg) {
    const section = sectionArg.split('=')[1];

    const sectionHandlers = {
      branches: editBranches,
      statuses: editStatuses,
      formats: editFormats,
      assignees: editAssignees,
      detail: editDetailLevel,
      paths: editPaths
    };

    const handler = sectionHandlers[section];
    if (!handler) {
      console.error(`✗ Unknown section: ${section}`);
      console.error('');
      console.error('Available sections: branches, statuses, formats, assignees, detail, paths');
      process.exit(1);
    }

    const modified = await handler(config);

    if (modified) {
      await saveConfig(config);
      console.log('');
      console.log('═'.repeat(65));
      console.log('✅ Configuration saved successfully!');
      console.log('═'.repeat(65));
      console.log('');
      console.log('Next steps:');
      console.log('  1. Review changes: cat .linear-workflow.json');
      console.log('  2. Regenerate workflow files if needed');
      console.log('  3. Test configuration: node scripts/validate-config.js');
      console.log('');
    }
  } else {
    // Show main menu
    const modified = await mainMenu(config);

    if (modified) {
      await saveConfig(config);
      console.log('');
      console.log('═'.repeat(65));
      console.log('✅ Configuration saved successfully!');
      console.log('═'.repeat(65));
      console.log('');
      console.log('Next steps:');
      console.log('  1. Review changes: cat .linear-workflow.json');
      console.log('  2. Regenerate workflow files: node scripts/apply-config.js');
      console.log('  3. Test configuration: node scripts/validate-config.js');
      console.log('  4. Commit changes: git add .linear-workflow.json && git commit');
      console.log('');
    } else {
      console.log('');
      console.log('No changes made.');
      console.log('');
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  loadConfig,
  saveConfig,
  backupConfig,
  editBranches,
  editStatuses,
  editFormats,
  editAssignees,
  editDetailLevel,
  editPaths
};

if (require.main === module) {
  main().catch(error => {
    console.error('');
    console.error('✗ Error:', error.message);
    console.error('');
    process.exit(1);
  });
}
