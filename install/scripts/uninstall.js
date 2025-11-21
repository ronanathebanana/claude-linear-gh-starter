#!/usr/bin/env node

/**
 * Linear Workflow Uninstaller
 *
 * Cleanly removes all Linear workflow integration files and configurations
 * with options for backing up or complete removal.
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Files and directories to remove
const WORKFLOW_FILES = {
  config: [
    '.linear-workflow.json',
    '.linear-workflow-state.json',
    '.mcp.json',
    '.env.example'
  ],
  directories: [
    '.github/workflows/linear-status-update.yml',
    'docs/issues',
    'docs/dev-issues',
    '.claude/commands' // Only workflow commands, not all
  ],
  gitHooks: [
    '.git/hooks/commit-msg'
  ],
  documentation: [
    'docs/linear-workflow.md',
    'CLAUDE.md'
  ],
  backupFiles: [
    '*.backup',
    '.linear-workflow.json.backup',
    '**/*.bak'
  ]
};

// Commands that were installed
const WORKFLOW_COMMANDS = [
  'blocked-linear.md',
  'bug-linear.md',
  'cleanup-branches.md',
  'create-blocker-linear.md',
  'create-linear-issue.md',
  'create-pr.md',
  'create-release-approval.md',
  'create-subtask-linear.md',
  'feature-linear.md',
  'feedback-linear.md',
  'get-feedback-linear.md',
  'high-priority-linear.md',
  'improvement-linear.md',
  'linear-help.md',
  'my-work-linear.md',
  'pause-linear.md',
  'progress-update.md',
  'start-issue.md',
  'team-work-linear.md',
  'tutorial.md',
  'workflow-status.md'
];

class LinearWorkflowUninstaller {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.removedItems = [];
    this.backedUpItems = [];
    this.errors = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim().toLowerCase());
      });
    });
  }

  async fileExists(filepath) {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  async detectInstallation() {
    this.log('\n🔍 Detecting Linear workflow installation...', 'cyan');

    const hasConfig = await this.fileExists('.linear-workflow.json');
    const hasWorkflow = await this.fileExists('.github/workflows/linear-status-update.yml');
    const hasHook = await this.fileExists('.git/hooks/commit-msg');
    const hasMcp = await this.fileExists('.mcp.json');

    if (!hasConfig && !hasWorkflow && !hasHook && !hasMcp) {
      this.log('\n❌ No Linear workflow installation found in this directory.', 'yellow');
      return false;
    }

    this.log('\n✓ Found Linear workflow installation:', 'green');
    if (hasConfig) this.log('  • Configuration file (.linear-workflow.json)', 'green');
    if (hasWorkflow) this.log('  • GitHub Actions workflow', 'green');
    if (hasHook) this.log('  • Git commit message hook', 'green');
    if (hasMcp) this.log('  • MCP configuration', 'green');

    // Check for version
    if (hasConfig) {
      try {
        const config = JSON.parse(await fs.readFile('.linear-workflow.json', 'utf8'));
        if (config.version) {
          this.log(`  • Version: ${config.version}`, 'cyan');
        }
        if (config.installed) {
          const date = new Date(config.installed).toLocaleDateString();
          this.log(`  • Installed: ${date}`, 'cyan');
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return true;
  }

  async createBackup(filepath) {
    const backupPath = `${filepath}.uninstall-backup-${Date.now()}`;
    try {
      await fs.copyFile(filepath, backupPath);
      this.backedUpItems.push({ original: filepath, backup: backupPath });
      return backupPath;
    } catch (error) {
      this.errors.push({ file: filepath, error: error.message });
      return null;
    }
  }

  async removeFile(filepath, backup = false) {
    try {
      if (await this.fileExists(filepath)) {
        if (backup) {
          const backupPath = await this.createBackup(filepath);
          if (backupPath) {
            this.log(`    ↳ Backed up to: ${path.basename(backupPath)}`, 'cyan');
          }
        }
        await fs.unlink(filepath);
        this.removedItems.push(filepath);
        this.log(`  ✓ Removed: ${filepath}`, 'green');
        return true;
      }
      return false;
    } catch (error) {
      this.errors.push({ file: filepath, error: error.message });
      this.log(`  ✗ Failed to remove: ${filepath}`, 'red');
      return false;
    }
  }

  async removeDirectory(dirPath) {
    try {
      if (await this.fileExists(dirPath)) {
        await fs.rmdir(dirPath, { recursive: true });
        this.removedItems.push(dirPath);
        this.log(`  ✓ Removed directory: ${dirPath}`, 'green');
        return true;
      }
      return false;
    } catch (error) {
      // Directory might not be empty or might not exist
      return false;
    }
  }

  async removeWorkflowCommands() {
    this.log('\n📝 Removing workflow commands...', 'cyan');

    const commandsDir = '.claude/commands';
    if (await this.fileExists(commandsDir)) {
      let removed = 0;
      for (const command of WORKFLOW_COMMANDS) {
        const commandPath = path.join(commandsDir, command);
        if (await this.fileExists(commandPath)) {
          await this.removeFile(commandPath);
          removed++;
        }
      }

      if (removed > 0) {
        this.log(`  ✓ Removed ${removed} workflow commands`, 'green');

        // Check if commands directory is now empty
        try {
          const remaining = await fs.readdir(commandsDir);
          if (remaining.length === 0) {
            await this.removeDirectory(commandsDir);

            // Check if .claude directory is empty
            const claudeContents = await fs.readdir('.claude');
            if (claudeContents.length === 0) {
              await this.removeDirectory('.claude');
            }
          }
        } catch {
          // Directory doesn't exist or can't be read
        }
      }
    }
  }

  async removeMcpServer() {
    this.log('\n🔌 Removing Linear MCP server...', 'cyan');

    try {
      // Check if claude CLI is available
      execSync('which claude', { stdio: 'ignore' });

      // Remove MCP server
      try {
        execSync('claude mcp remove linear-server', { stdio: 'pipe' });
        this.log('  ✓ Removed Linear MCP server from Claude configuration', 'green');
      } catch {
        this.log('  ℹ Linear MCP server not found or already removed', 'yellow');
      }
    } catch {
      this.log('  ⚠ Claude CLI not found - skipping MCP removal', 'yellow');
      this.log('    To remove manually: claude mcp remove linear-server', 'yellow');
    }
  }

  async removeGitHubSecrets() {
    const answer = await this.prompt('\nRemove LINEAR_API_KEY from GitHub secrets? (y/N): ');

    if (answer === 'y' || answer === 'yes') {
      try {
        execSync('gh secret delete LINEAR_API_KEY', { stdio: 'pipe' });
        this.log('  ✓ Removed LINEAR_API_KEY from GitHub secrets', 'green');
      } catch (error) {
        this.log('  ⚠ Could not remove GitHub secret (may not exist or no permission)', 'yellow');
      }
    } else {
      this.log('  ℹ Keeping LINEAR_API_KEY in GitHub secrets', 'cyan');
    }
  }

  async cleanupGitignore() {
    const gitignorePath = '.gitignore';

    if (await this.fileExists(gitignorePath)) {
      try {
        let content = await fs.readFile(gitignorePath, 'utf8');
        const originalContent = content;

        // Remove Linear workflow specific entries
        const linesToRemove = [
          '# Linear Workflow - Generated files',
          '.env',
          '*.backup',
          '.linear-workflow-state.json',
          '.linear-workflow.json.backup'
        ];

        for (const line of linesToRemove) {
          content = content.replace(new RegExp(`^${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gm'), '');
        }

        // Clean up multiple blank lines
        content = content.replace(/\n{3,}/g, '\n\n');

        if (content !== originalContent) {
          await fs.writeFile(gitignorePath, content);
          this.log('  ✓ Cleaned up .gitignore', 'green');
        }
      } catch (error) {
        this.log('  ⚠ Could not clean up .gitignore', 'yellow');
      }
    }
  }

  async performUninstall(options) {
    this.log('\n═══════════════════════════════════════════════════════════════', 'bold');
    this.log('Starting Linear Workflow Uninstallation', 'bold');
    this.log('═══════════════════════════════════════════════════════════════', 'bold');

    // Remove configuration files
    this.log('\n⚙️ Removing configuration files...', 'cyan');
    for (const file of WORKFLOW_FILES.config) {
      await this.removeFile(file, options.backup);
    }

    // Remove git hooks
    this.log('\n🪝 Removing git hooks...', 'cyan');
    for (const hook of WORKFLOW_FILES.gitHooks) {
      await this.removeFile(hook, options.backup);
    }

    // Remove GitHub workflow
    this.log('\n🔄 Removing GitHub Actions workflow...', 'cyan');
    await this.removeFile('.github/workflows/linear-status-update.yml', options.backup);

    // Try to remove workflows directory if empty
    try {
      const workflowsDir = '.github/workflows';
      const files = await fs.readdir(workflowsDir);
      if (files.length === 0) {
        await this.removeDirectory(workflowsDir);

        // Also try to remove .github if empty
        const githubFiles = await fs.readdir('.github');
        if (githubFiles.length === 0) {
          await this.removeDirectory('.github');
        }
      }
    } catch {
      // Directory doesn't exist or not empty
    }

    // Remove workflow commands
    await this.removeWorkflowCommands();

    // Remove documentation
    if (options.removeDocs) {
      this.log('\n📚 Removing workflow documentation...', 'cyan');
      for (const doc of WORKFLOW_FILES.documentation) {
        await this.removeFile(doc, options.backup);
      }
    }

    // Remove issue directories
    this.log('\n📁 Removing issue directories...', 'cyan');
    await this.removeDirectory('docs/issues');
    await this.removeDirectory('docs/dev-issues');

    // Clean up backup files
    if (options.cleanBackups) {
      this.log('\n🗑️ Removing backup files...', 'cyan');
      try {
        execSync('find . -name "*.backup" -o -name "*.bak" | xargs rm -f', { stdio: 'ignore' });
        this.log('  ✓ Removed all backup files', 'green');
      } catch {
        this.log('  ⚠ Could not remove some backup files', 'yellow');
      }
    }

    // Clean up .gitignore
    await this.cleanupGitignore();

    // Remove MCP server
    if (options.removeMcp) {
      await this.removeMcpServer();
    }

    // Remove GitHub secrets
    if (options.removeSecrets) {
      await this.removeGitHubSecrets();
    }
  }

  async showSummary() {
    this.log('\n═══════════════════════════════════════════════════════════════', 'bold');
    this.log('Uninstallation Summary', 'bold');
    this.log('═══════════════════════════════════════════════════════════════', 'bold');

    if (this.removedItems.length > 0) {
      this.log(`\n✅ Successfully removed ${this.removedItems.length} items:`, 'green');
      for (const item of this.removedItems.slice(0, 10)) {
        this.log(`  • ${item}`, 'green');
      }
      if (this.removedItems.length > 10) {
        this.log(`  ... and ${this.removedItems.length - 10} more`, 'green');
      }
    }

    if (this.backedUpItems.length > 0) {
      this.log(`\n💾 Created ${this.backedUpItems.length} backups:`, 'cyan');
      for (const backup of this.backedUpItems.slice(0, 5)) {
        this.log(`  • ${backup.original} → ${backup.backup}`, 'cyan');
      }
      if (this.backedUpItems.length > 5) {
        this.log(`  ... and ${this.backedUpItems.length - 5} more`, 'cyan');
      }
    }

    if (this.errors.length > 0) {
      this.log(`\n⚠️ Encountered ${this.errors.length} errors:`, 'yellow');
      for (const error of this.errors) {
        this.log(`  • ${error.file}: ${error.error}`, 'yellow');
      }
    }

    this.log('\n✨ Linear workflow has been uninstalled!', 'green');
    this.log('\nYour project is now restored to its pre-workflow state.', 'cyan');

    if (this.backedUpItems.length > 0) {
      this.log('\n💡 Tip: Backup files have been created. You can delete them with:', 'cyan');
      this.log('  find . -name "*.uninstall-backup-*" -delete', 'cyan');
    }
  }

  async run() {
    try {
      // Check for installation
      const hasInstallation = await this.detectInstallation();
      if (!hasInstallation) {
        this.rl.close();
        process.exit(0);
      }

      // Show warning
      this.log('\n⚠️  WARNING: This will remove the Linear workflow integration!', 'yellow');
      this.log('\nThis includes:', 'yellow');
      this.log('  • Configuration files (.linear-workflow.json, .mcp.json)', 'yellow');
      this.log('  • GitHub Actions workflow', 'yellow');
      this.log('  • Git commit message hooks', 'yellow');
      this.log('  • Workflow commands in .claude/commands/', 'yellow');
      this.log('  • Issue documentation directories', 'yellow');

      const confirm = await this.prompt('\nAre you sure you want to uninstall? (y/N): ');

      if (confirm !== 'y' && confirm !== 'yes') {
        this.log('\n✓ Uninstallation cancelled.', 'cyan');
        this.rl.close();
        process.exit(0);
      }

      // Ask about options
      const options = {};

      options.backup = await this.prompt('\nCreate backups of removed files? (Y/n): ') !== 'n';
      options.removeDocs = await this.prompt('Remove workflow documentation (docs/linear-workflow.md, CLAUDE.md)? (y/N): ') === 'y';
      options.cleanBackups = await this.prompt('Remove all existing backup files (*.backup, *.bak)? (y/N): ') === 'y';
      options.removeMcp = await this.prompt('Remove Linear MCP server from Claude? (Y/n): ') !== 'n';
      options.removeSecrets = await this.prompt('Remove LINEAR_API_KEY from GitHub secrets? (y/N): ') === 'y';

      // Perform uninstallation
      await this.performUninstall(options);

      // Show summary
      await this.showSummary();

      this.rl.close();
      process.exit(0);
    } catch (error) {
      this.log(`\n❌ Uninstallation failed: ${error.message}`, 'red');
      this.log('\nPlease report this issue with the error details.', 'yellow');
      this.rl.close();
      process.exit(1);
    }
  }
}

// Run the uninstaller
if (require.main === module) {
  const uninstaller = new LinearWorkflowUninstaller();
  uninstaller.run();
}

module.exports = { LinearWorkflowUninstaller };