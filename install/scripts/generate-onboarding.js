#!/usr/bin/env node

/**
 * Team Onboarding Documentation Generator
 *
 * Generates team-specific onboarding documentation based on the Linear workflow configuration.
 * Creates personalized guides with actual team settings, issue patterns, and branch names.
 *
 * Usage:
 *   node install/scripts/generate-onboarding.js                     # Generate all docs
 *   node install/scripts/generate-onboarding.js --output ./onboarding  # Custom output directory
 *   node install/scripts/generate-onboarding.js --format markdown   # Output format (markdown/html)
 *   node install/scripts/generate-onboarding.js --minimal           # Generate minimal quick-start only
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Helper Functions
// ============================================================================

function loadConfig(projectPath) {
  const configPath = path.join(projectPath, '.linear-workflow.json');

  if (!fs.existsSync(configPath)) {
    throw new Error('Configuration file not found. Run setup wizard first.');
  }

  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (error) {
    throw new Error(`Invalid configuration file: ${error.message}`);
  }
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Generated: ${filePath}`);
}

// ============================================================================
// Template Generators
// ============================================================================

function generateQuickStart(config) {
  const example = config.formats?.issueExample || 'DEV-123';

  return `# Quick Start Guide

Welcome to the ${config.project?.name || 'Project'} development team!

This guide will get you up and running with our Linear + GitHub + Claude workflow.

## Prerequisites

Before starting, ensure you have:

- [x] Git installed
- [x] GitHub CLI (\`gh\`) installed and authenticated
- [x] Node.js 16+ installed (for Linear MCP server)
- [x] Access to Linear workspace: **${config.linear?.workspaceName || 'Your Workspace'}**
- [x] Access to GitHub repository

## Initial Setup

### 1. Clone the Repository

\`\`\`bash
gh repo clone ${config.project?.name || 'org/repo'}
cd ${config.project?.name || 'repo'}
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Linear MCP (for Claude Code)

If you're using Claude Code CLI:

\`\`\`bash
# Add Linear MCP server
claude mcp add --transport http linear-server https://mcp.linear.app/mcp

# Authenticate
/mcp
\`\`\`

Follow the browser authentication flow to connect to Linear.

### 4. Verify Installation

\`\`\`bash
# Run health check
node install/scripts/health-check.js

# Should show 90%+ health score
\`\`\`

## Your First Issue

### Step 1: Pick an Issue from Linear

Visit: [${config.linear?.teamKey || 'TEAM'} Team Issues](https://linear.app/${config.linear?.workspaceName?.toLowerCase().replace(/\s+/g, '-') || 'workspace'}/team/${config.linear?.teamKey || 'TEAM'})

Look for issues with status: **${config.linear?.statuses?.todo || 'To Do'}**

### Step 2: Start Work (with Claude Code)

\`\`\`bash
# In Claude Code, say:
"Let's get to work on ${example}"
\`\`\`

Claude will:
- Create feature branch
- Generate task analysis
- Post summary to Linear
- Update status to **${config.linear?.statuses?.inProgress || 'In Progress'}**

### Step 3: Make Changes

Edit files, write code, run tests.

### Step 4: Commit Your Changes

Our commit message format: **${getCommitFormatExample(config)}**

\`\`\`bash
git add .
git commit -m "feat: Implement user authentication (${example})"
git push
\`\`\`

The git hook will validate your commit message includes the issue ID.

### Step 5: Create Pull Request

\`\`\`bash
# With Claude Code:
"Create PR for ${example}"

# Or manually:
gh pr create --title "${example}: Implement user authentication"
\`\`\`

When merged to **${config.branches?.main || 'main'}**, the issue automatically updates to **${config.linear?.statuses?.review || 'Review'}**.

${config.branches?.staging ? `
### Step 6: Deploy to Staging

\`\`\`bash
git checkout ${config.branches.staging}
git merge ${config.branches.main}
git push
\`\`\`

Issue automatically updates to **${config.linear?.statuses?.staging || 'QA Testing'}**.
` : ''}

${config.branches?.prod ? `
### Step 7: Production Deployment

\`\`\`bash
git checkout ${config.branches.prod}
git merge ${config.branches.staging || config.branches.main}
git push
\`\`\`

Issue automatically updates to **${config.linear?.statuses?.done || 'Done'}**.
` : ''}

## Daily Workflow

\`\`\`bash
# Morning: Update your local repository
git checkout ${config.branches?.main || 'main'}
git pull

# Start work on an issue
# Say to Claude: "Let's get to work on ${example}"

# Make changes, commit with issue reference
git commit -m "fix: Resolve login bug (${example})"

# Push changes (triggers Linear update)
git push

# Create PR when ready
# Say to Claude: "Create PR for ${example}"

# After review and merge, move to next issue
\`\`\`

## Getting Help

- **Workflow Issues**: \`node install/scripts/health-check.js\`
- **Configuration**: \`node install/scripts/edit-config.js\`
- **Git Hook Problems**: \`node install/scripts/test-git-hook.js\`
- **Documentation**: See \`docs/linear-workflow.md\`

Welcome to the team!
`;
}

function generateDetailedGuide(config) {
  const example = config.formats?.issueExample || 'DEV-123';

  return `# Linear Workflow - Detailed Guide

Complete guide to our ${config.project?.name || 'Project'} development workflow.

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Branch Strategy](#branch-strategy)
3. [Commit Message Format](#commit-message-format)
4. [Status Transitions](#status-transitions)
${config.assignees?.enabled ? '5. [Auto-Assignment](#auto-assignment)\n' : ''}${config.assignees?.enabled ? '6' : '5'}. [Common Operations](#common-operations)
${config.assignees?.enabled ? '7' : '6'}. [Troubleshooting](#troubleshooting)

## Workflow Overview

Our workflow integrates three tools:

1. **Linear** - Issue tracking and project management
2. **GitHub** - Code hosting and CI/CD
3. **Claude Code** - AI-powered development assistant

Issues flow through statuses automatically based on git operations.

## Branch Strategy

We use a **${getBranchStrategyName(config)}** strategy:

${getBranchStrategyDiagram(config)}

### Branch Descriptions

${generateBranchDescriptions(config)}

## Commit Message Format

We use **${getCommitFormatName(config)}** format:

### Format

${getCommitFormatExample(config)}

### Examples

**Valid commits:**
\`\`\`bash
${generateCommitExamples(config, example)}
\`\`\`

**Invalid commits:**
\`\`\`bash
# Missing issue reference
git commit -m "feat: Add user authentication"  # ✗ Will be rejected

# Wrong format
git commit -m "Added new feature ${example}"  # ✗ Will be rejected
\`\`\`

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring (no functional changes)
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config, etc.)

## Status Transitions

Issues automatically transition through statuses based on git activity:

### Status Flow

\`\`\`
${generateStatusFlow(config)}
\`\`\`

### Triggers

| Action | Branch | New Status |
|--------|--------|------------|
| Push to feature branch | \`feature/${example}-*\` | **${config.linear?.statuses?.inProgress?.name || config.linear?.statuses?.inProgress || 'In Progress'}** |
| Merge PR | → \`${config.branches?.main || 'main'}\` | **${config.linear?.statuses?.review?.name || config.linear?.statuses?.review || 'Review'}** |
${config.branches?.staging ? `| Merge to staging | → \`${config.branches.staging}\` | **${config.linear?.statuses?.staging?.name || config.linear?.statuses?.staging || 'QA Testing'}** |` : ''}
${config.branches?.prod ? `| Merge to production | → \`${config.branches.prod}\` | **${config.linear?.statuses?.done?.name || config.linear?.statuses?.done || 'Done'}** |` : ''}
${!config.branches?.staging && !config.branches?.prod ? `| Merge to main | → \`${config.branches?.main || 'main'}\` | **${config.linear?.statuses?.done?.name || config.linear?.statuses?.done || 'Done'}** |` : ''}

${generateStatusDefinitionsSection(config)}

${config.assignees?.enabled ? generateAutoAssignmentSection(config) : ''}

## Common Operations

### Starting Work on an Issue

**With Claude Code:**
\`\`\`bash
# Say to Claude:
"Let's get to work on ${example}"
\`\`\`

Claude will:
1. Fetch issue details from Linear
2. Create task analysis document
3. Post summary to Linear
4. Create feature branch
5. Update status to **${config.linear?.statuses?.inProgress || 'In Progress'}**

**Manually:**
\`\`\`bash
# Create feature branch
git checkout ${config.branches?.main || 'main'}
git pull
git checkout -b feature/${example}-description

# Make changes
# ...

# Commit with issue reference
git commit -m "feat: Description (${example})"

# Push (triggers status update)
git push -u origin feature/${example}-description
\`\`\`

### Creating a Pull Request

**With Claude Code:**
\`\`\`bash
# Say to Claude:
"Create PR for ${example}"
\`\`\`

**Manually:**
\`\`\`bash
gh pr create \\
  --title "${example}: Brief description" \\
  --body "Closes ${example}

## Changes
- Change 1
- Change 2

## Testing
- Test 1
- Test 2"
\`\`\`

### Continuing Existing Work

**With Claude Code:**
\`\`\`bash
# Say to Claude:
"Continue ${example}"
# or
"What am I working on?"
\`\`\`

**Manually:**
\`\`\`bash
# Find and checkout existing branch
git branch -a | grep ${example}
git checkout feature/${example}-description
git pull
\`\`\`

### Pausing Work

**With Claude Code:**
\`\`\`bash
# Say to Claude:
"Pause work on this"
\`\`\`

Claude will:
1. Commit WIP changes
2. Post pause comment to Linear
3. Return to main branch

**Manually:**
\`\`\`bash
# Commit work in progress
git add .
git commit -m "wip: Save progress (${example})"
git push

# Return to main
git checkout ${config.branches?.main || 'main'}
\`\`\`

### Creating Related Issues

**With Claude Code:**

\`\`\`bash
# Create blocker
"Create a blocker for this"

# Create sub-task
"Create a sub-task for [description]"

# Report bug
"Found a bug: [description]"

# Add follow-up
"Create follow-up for [description]"
\`\`\`

Claude will create and link related issues automatically.

### Adding Progress Updates

**With Claude Code:**
\`\`\`bash
# Say to Claude:
"Add progress update"
\`\`\`

Claude analyzes recent commits and posts structured update to Linear.

## Troubleshooting

### Commit Hook Rejecting Messages

**Problem:** \`git commit\` fails with validation error

**Solution:**
\`\`\`bash
# Test your commit message format
node install/scripts/test-git-hook.js

# Check issue pattern
cat .linear-workflow.json | grep issuePattern

# Ensure message includes issue ID: ${config.formats?.issuePattern || '[A-Z]+-\\d+'}
\`\`\`

### Status Not Updating in Linear

**Problem:** Commits pushed but Linear status unchanged

**Solutions:**

1. **Check GitHub Actions workflow:**
\`\`\`bash
gh run list --workflow=linear-status-update.yml
gh run view <run-id> --log
\`\`\`

2. **Verify LINEAR_API_KEY secret:**
\`\`\`bash
gh secret list | grep LINEAR_API_KEY
\`\`\`

3. **Check issue ID pattern:**
\`\`\`bash
# Ensure commit/branch includes correct pattern
git log -1  # Check last commit
\`\`\`

### MCP Server Not Connecting

**Problem:** Claude Code can't access Linear

**Solutions:**

1. **Re-authenticate:**
\`\`\`bash
/mcp
\`\`\`

2. **Check MCP configuration:**
\`\`\`bash
cat .mcp.json
\`\`\`

3. **Verify Linear API key:**
\`\`\`bash
node install/scripts/validate-secrets.js
\`\`\`

### Branch Protection Preventing Push

**Problem:** Can't push to main/staging/prod

**This is expected!** Our workflow uses feature branches and pull requests.

**Solution:**
\`\`\`bash
# Always work on feature branches
git checkout -b feature/${example}-description

# Push feature branch
git push -u origin feature/${example}-description

# Create PR to merge
gh pr create
\`\`\`

### Need to Update Configuration

**Problem:** Wrong branch names, status mappings, or settings

**Solution:**
\`\`\`bash
# Interactive configuration editor
node install/scripts/edit-config.js

# Or manually edit
nano .linear-workflow.json
\`\`\`

### Health Check Failing

**Problem:** Installation validation showing errors

**Solution:**
\`\`\`bash
# Run health check with verbose output
node install/scripts/health-check.js --verbose

# Attempt auto-fix
node install/scripts/health-check.js --fix

# Manual fixes
# Follow suggested fixes from health check output
\`\`\`

## Additional Resources

- **Configuration Reference**: \`.linear-workflow.json\`
- **Workflow File**: \`.github/workflows/linear-status-update.yml\`
- **Team Documentation**: \`${config.paths?.issues || 'docs/issues/'}\`
- **Health Check**: \`node install/scripts/health-check.js\`
- **Edit Configuration**: \`node install/scripts/edit-config.js\`

## Questions?

- Check \`docs/linear-workflow.md\` for workflow documentation
- Run \`node install/scripts/health-check.js\` to diagnose issues
- Ask your team lead or Claude Code for help!
`;
}

function generateQuickReference(config) {
  const example = config.formats?.issueExample || 'DEV-123';

  return `# Quick Reference Card

## Commit Message Format

${getCommitFormatExample(config)}

**Example:** \`${generateCommitExamples(config, example).split('\n')[0].trim()}\`

## Branch Names

- Feature: \`feature/${example}-description\`
- Bugfix: \`fix/${example}-bug-description\`
- Hotfix: \`hotfix/${example}-critical-fix\`

## Status Transitions

| Action | Status |
|--------|--------|
| Push to feature branch | ${config.linear?.statuses?.inProgress || 'In Progress'} |
| Merge to ${config.branches?.main || 'main'} | ${config.linear?.statuses?.review || 'Review'} |
${config.branches?.staging ? `| Merge to ${config.branches.staging} | ${config.linear?.statuses?.staging || 'QA Testing'} |` : ''}
${config.branches?.prod ? `| Merge to ${config.branches.prod} | ${config.linear?.statuses?.done || 'Done'} |` : ''}

## Common Commands

### Start Work
\`\`\`bash
# With Claude Code
"Let's get to work on ${example}"

# Manual
git checkout -b feature/${example}-description
\`\`\`

### Commit Changes
\`\`\`bash
git add .
git commit -m "feat: Description (${example})"
git push
\`\`\`

### Create PR
\`\`\`bash
# With Claude Code
"Create PR for ${example}"

# Manual
gh pr create --title "${example}: Description"
\`\`\`

### Check Status
\`\`\`bash
# With Claude Code
"What am I working on?"

# Manual
git branch --show-current
\`\`\`

## Troubleshooting

| Issue | Command |
|-------|---------|
| Health check | \`node install/scripts/health-check.js\` |
| Test git hook | \`node install/scripts/test-git-hook.js\` |
| Validate secrets | \`node install/scripts/validate-secrets.js\` |
| Edit config | \`node install/scripts/edit-config.js\` |
| View workflow logs | \`gh run list\` |

## Important Patterns

- **Issue Pattern**: \`${config.formats?.issuePattern || '[A-Z]+-\\d+'}\`
- **Example**: \`${example}\`
- **Team Key**: \`${config.linear?.teamKey || 'TEAM'}\`

## Links

- [Linear Team](https://linear.app/${config.linear?.workspaceName?.toLowerCase().replace(/\s+/g, '-') || 'workspace'}/team/${config.linear?.teamKey || 'TEAM'})
- [GitHub Repository](https://github.com/${config.project?.name || 'org/repo'})
- [Documentation](docs/linear-workflow.md)
`;
}

function generateTroubleshootingGuide(config) {
  const example = config.formats?.issueExample || 'DEV-123';

  return `# Troubleshooting Guide

Common issues and their solutions for the Linear workflow.

## Table of Contents

1. [Commit Hook Issues](#commit-hook-issues)
2. [Status Update Issues](#status-update-issues)
3. [MCP Connection Issues](#mcp-connection-issues)
4. [Branch and Merge Issues](#branch-and-merge-issues)
5. [Configuration Issues](#configuration-issues)
6. [GitHub Actions Issues](#github-actions-issues)

---

## Commit Hook Issues

### Hook Rejecting Valid Commit Messages

**Symptoms:**
\`\`\`
Commit message validation failed!
Issue ID not found in commit message.
\`\`\`

**Possible Causes:**
1. Issue ID doesn't match pattern: \`${config.formats?.issuePattern || '[A-Z]+-\\d+'}\`
2. Issue ID in wrong position for format: ${getCommitFormatName(config)}
3. Git hook has wrong configuration

**Solutions:**

**1. Test your commit message:**
\`\`\`bash
node install/scripts/test-git-hook.js
\`\`\`

**2. Check the pattern:**
\`\`\`bash
cat .linear-workflow.json | grep issuePattern
# Should show: ${config.formats?.issuePattern || '[A-Z]+-\\d+'}
\`\`\`

**3. Valid formats for your team:**
${getCommitFormatExample(config)}

**4. Reinstall hook if corrupted:**
\`\`\`bash
./install/scripts/install-hooks.sh
chmod +x .git/hooks/commit-msg
\`\`\`

### Hook Not Running at All

**Symptoms:**
- Commits succeed without validation
- Can commit without issue ID

**Solutions:**

**1. Check hook exists:**
\`\`\`bash
ls -la .git/hooks/commit-msg
# Should show executable permissions (-rwxr-xr-x)
\`\`\`

**2. Make hook executable:**
\`\`\`bash
chmod +x .git/hooks/commit-msg
\`\`\`

**3. Reinstall hook:**
\`\`\`bash
./install/scripts/install-hooks.sh
\`\`\`

---

## Status Update Issues

### Linear Status Not Updating After Push

**Symptoms:**
- Pushed commits but status still "To Do"
- GitHub Actions workflow not running

**Diagnosis:**
\`\`\`bash
# Check recent workflow runs
gh run list --workflow=linear-status-update.yml

# View specific run logs
gh run view <run-id> --log
\`\`\`

**Possible Causes & Solutions:**

**1. Workflow not on main branch yet:**

If you just installed, the workflow file might still be on setup branch.

\`\`\`bash
# Check if workflow file exists on main
git checkout ${config.branches?.main || 'main'}
ls .github/workflows/linear-status-update.yml

# If missing, merge setup branch
git merge setup/linear-workflow
git push
\`\`\`

**2. LINEAR_API_KEY secret missing:**

\`\`\`bash
# Check secret exists
gh secret list | grep LINEAR_API_KEY

# Set secret if missing
gh secret set LINEAR_API_KEY
# Paste your API key when prompted
\`\`\`

**3. Issue ID not detected:**

\`\`\`bash
# Check commit message includes issue ID
git log -1

# Check branch name includes issue ID
git branch --show-current
# Should be: feature/${example}-*
\`\`\`

**4. Invalid API key:**

\`\`\`bash
# Test API key
node install/scripts/validate-secrets.js
\`\`\`

### Status Updating to Wrong State

**Symptoms:**
- Merged to ${config.branches?.main || 'main'} but status went to "${config.linear?.statuses?.done || 'Done'}" instead of "${config.linear?.statuses?.review || 'Review'}"

**Solution:**

Check workflow configuration matches your team's states:

\`\`\`bash
# Review workflow file
cat .github/workflows/linear-status-update.yml

# Compare to current configuration
cat .linear-workflow.json

# Update workflow if needed
node install/scripts/edit-config.js
# Then regenerate workflow
\`\`\`

---

## MCP Connection Issues

### Claude Code Can't Access Linear

**Symptoms:**
- "MCP server not found" error
- Linear tools not available in Claude

**Solutions:**

**1. Check MCP server configured:**
\`\`\`bash
claude mcp list
# Should show: linear-server
\`\`\`

**2. Add MCP server if missing:**
\`\`\`bash
claude mcp add --transport http linear-server https://mcp.linear.app/mcp
\`\`\`

**3. Authenticate:**
\`\`\`bash
# In Claude Code
/mcp
# Follow browser authentication
\`\`\`

**4. Verify connection:**
\`\`\`bash
# Say to Claude:
"List my Linear issues"
# Should return issues from your workspace
\`\`\`

### Authentication Expired

**Symptoms:**
- MCP worked before but now showing auth errors
- "Unauthorized" errors from Linear

**Solution:**

Re-authenticate:
\`\`\`bash
/mcp
# Complete OAuth flow in browser
\`\`\`

---

## Branch and Merge Issues

### Can't Push to ${config.branches?.main || 'main'}

**Symptoms:**
\`\`\`
remote: error: GH006: Protected branch update failed
\`\`\`

**This is expected behavior!** Main branch is protected.

**Solution:**

Use feature branches and pull requests:
\`\`\`bash
# Create feature branch
git checkout -b feature/${example}-description

# Make changes and commit
git add .
git commit -m "feat: Description (${example})"

# Push feature branch
git push -u origin feature/${example}-description

# Create PR
gh pr create --title "${example}: Description"

# After approval, merge PR
gh pr merge --merge
\`\`\`

${config.branches?.staging ? `
### Changes Not Appearing on Staging

**Problem:** Merged to ${config.branches.main} but staging hasn't updated

**Solution:**

Staging doesn't auto-update. Manually merge:

\`\`\`bash
git checkout ${config.branches.staging}
git pull
git merge ${config.branches.main}
git push
\`\`\`

Status will update to **${config.linear?.statuses?.staging || 'QA Testing'}**.
` : ''}

${config.branches?.prod ? `
### Production Deployment Not Updating Status

**Problem:** Merged to ${config.branches.prod} but status not "Done"

**Solution:**

Check workflow trigger configuration:

\`\`\`bash
cat .github/workflows/linear-status-update.yml | grep -A 5 "on:"

# Should include:
#   push:
#     branches:
#       - ${config.branches.prod}
\`\`\`

If missing, update workflow configuration.
` : ''}

---

## Configuration Issues

### Wrong Branch Names or Statuses

**Problem:** Configuration doesn't match team's actual setup

**Solution:**

\`\`\`bash
# Interactive editor
node install/scripts/edit-config.js

# Select what to edit:
# 1. Branch strategy
# 2. Linear statuses
# 3. Commit formats
# etc.
\`\`\`

After updating, regenerate workflow file if needed.

### Configuration File Corrupted

**Problem:** Invalid JSON in .linear-workflow.json

**Solution:**

\`\`\`bash
# Check for JSON errors
cat .linear-workflow.json | jq .

# If errors, restore from backup
cp .linear-workflow.json.backup .linear-workflow.json

# Or regenerate
# Say to Claude: "Setup Linear workflow"
# Choose "Update configuration"
\`\`\`

---

## GitHub Actions Issues

### Workflow Not Triggering

**Symptoms:**
- Push succeeds but no workflow run appears

**Diagnosis:**
\`\`\`bash
# List recent runs
gh run list

# Check workflow exists
ls .github/workflows/linear-status-update.yml

# Validate workflow syntax
cat .github/workflows/linear-status-update.yml | grep -E "^(name|on|jobs):"
\`\`\`

**Solutions:**

**1. Workflow file not on target branch:**
\`\`\`bash
# Ensure workflow exists on the branch you're pushing to
git checkout ${config.branches?.main || 'main'}
ls .github/workflows/
\`\`\`

**2. Workflow disabled:**
\`\`\`bash
# Enable workflow
gh workflow enable linear-status-update.yml
\`\`\`

**3. Syntax error in workflow:**
\`\`\`bash
node install/scripts/validate-workflow.js
\`\`\`

### Workflow Running but Failing

**Symptoms:**
- Workflow appears in GitHub Actions but shows red X

**Diagnosis:**
\`\`\`bash
# View error logs
gh run list --workflow=linear-status-update.yml
gh run view <run-id> --log
\`\`\`

**Common Errors:**

**"LINEAR_API_KEY not found":**
\`\`\`bash
gh secret set LINEAR_API_KEY
\`\`\`

**"Invalid API key":**
\`\`\`bash
# Validate and update
node install/scripts/validate-secrets.js
gh secret set LINEAR_API_KEY  # Paste new key
\`\`\`

**"Issue not found":**
- Check issue ID pattern matches Linear
- Ensure issue exists in correct team

**"Status not found":**
- Verify status names in configuration match Linear
- Update configuration if team changed statuses

---

## Getting More Help

### Run Comprehensive Health Check

\`\`\`bash
# Full diagnostics
node install/scripts/health-check.js --verbose

# Attempt auto-fixes
node install/scripts/health-check.js --fix

# JSON output for debugging
node install/scripts/health-check.js --json > health-report.json
\`\`\`

### Check All Systems

\`\`\`bash
# 1. Git repository
git status
git remote -v

# 2. GitHub CLI
gh auth status

# 3. Workflow status
gh run list --limit 5

# 4. Configuration
cat .linear-workflow.json | jq .

# 5. Linear connection
node install/scripts/validate-secrets.js
\`\`\`

### Still Stuck?

1. Review docs: \`docs/linear-workflow.md\`
2. Check GitHub Actions logs: \`gh run view --log\`
3. Ask your team lead
4. Ask Claude Code: "Help me debug the Linear workflow"

### Collect Debug Information

When asking for help, provide:

\`\`\`bash
# System info
echo "Node: $(node --version)"
echo "Git: $(git --version)"
echo "GH CLI: $(gh --version)"

# Health check
node install/scripts/health-check.js --verbose > debug-health.txt

# Recent workflow runs
gh run list --limit 10 > debug-runs.txt

# Configuration
cat .linear-workflow.json > debug-config.txt

# Provide these files when asking for help
\`\`\`
`;
}

// ============================================================================
// Format Helpers
// ============================================================================

function getCommitFormatName(config) {
  const format = config.formats?.commit || 'conventional-parens';
  const formats = {
    'conventional-parens': 'Conventional Commits with Issue in Parentheses',
    'issue-prefix': 'Issue Prefix',
    'issue-scope': 'Conventional Commits with Issue in Scope',
    'custom': 'Custom Format'
  };
  return formats[format] || format;
}

function getCommitFormatExample(config) {
  const format = config.formats?.commit || 'conventional-parens';
  const example = config.formats?.issueExample || 'DEV-123';

  const examples = {
    'conventional-parens': `\`<type>: <description> (${example})\``,
    'issue-prefix': `\`${example}: <description>\``,
    'issue-scope': `\`<type>(${example}): <description>\``,
    'custom': `\`<custom format with ${example}>\``
  };

  return examples[format] || examples['conventional-parens'];
}

function generateCommitExamples(config, issueId) {
  const format = config.formats?.commit || 'conventional-parens';

  const examples = {
    'conventional-parens': [
      `feat: Add user authentication (${issueId})`,
      `fix: Resolve login redirect issue (${issueId})`,
      `docs: Update API documentation (${issueId})`
    ],
    'issue-prefix': [
      `${issueId}: Add user authentication`,
      `${issueId}: Resolve login redirect issue`,
      `${issueId}: Update API documentation`
    ],
    'issue-scope': [
      `feat(${issueId}): Add user authentication`,
      `fix(${issueId}): Resolve login redirect issue`,
      `docs(${issueId}): Update API documentation`
    ]
  };

  return (examples[format] || examples['conventional-parens']).join('\n');
}

function getBranchStrategyName(config) {
  if (config.branches?.prod) return 'Three-tier';
  if (config.branches?.staging) return 'Two-tier';
  return 'Simple';
}

function getBranchStrategyDiagram(config) {
  if (config.branches?.prod) {
    return `\`\`\`
feature/* → ${config.branches.main} → ${config.branches.staging} → ${config.branches.prod}
(develop)   (review)      (QA)          (production)
\`\`\``;
  }

  if (config.branches?.staging) {
    return `\`\`\`
feature/* → ${config.branches.main} → ${config.branches.staging}
(develop)   (review)      (production)
\`\`\``;
  }

  return `\`\`\`
feature/* → ${config.branches.main}
(develop)   (production)
\`\`\``;
}

function generateBranchDescriptions(config) {
  let desc = `- **${config.branches?.main || 'main'}**: Primary development branch\n`;

  if (config.branches?.staging) {
    desc += `- **${config.branches.staging}**: QA testing and staging environment\n`;
  }

  if (config.branches?.prod) {
    desc += `- **${config.branches.prod}**: Production releases\n`;
  }

  desc += `- **feature/[issue-id]-[description]**: Feature development branches\n`;
  desc += `- **fix/[issue-id]-[description]**: Bug fix branches\n`;
  desc += `- **hotfix/[issue-id]-[description]**: Critical production fixes\n`;

  return desc;
}

function generateStatusFlow(config) {
  const flows = [];

  flows.push(`${config.linear?.statuses?.todo || 'To Do'}`);
  flows.push(`    ↓ (push to feature branch)`);
  flows.push(`${config.linear?.statuses?.inProgress || 'In Progress'}`);
  flows.push(`    ↓ (merge to ${config.branches?.main || 'main'})`);
  flows.push(`${config.linear?.statuses?.review || 'Review'}`);

  if (config.branches?.staging) {
    flows.push(`    ↓ (merge to ${config.branches.staging})`);
    flows.push(`${config.linear?.statuses?.staging || 'QA Testing'}`);
  }

  if (config.branches?.prod) {
    flows.push(`    ↓ (merge to ${config.branches.prod})`);
  } else if (!config.branches?.staging) {
    flows.push(`    ↓ (task complete)`);
  }

  flows.push(`${config.linear?.statuses?.done || 'Done'}`);

  return flows.join('\n');
}

function generateStatusDefinitionsSection(config) {
  if (!config.linear?.statuses) return '';

  let section = `\n## Understanding Workflow Statuses\n\nEach status has a specific meaning in our team's workflow:\n\n`;

  // Build status definitions table
  section += `| Status | Meaning | Automated | Trigger |\n`;
  section += `|--------|---------|-----------|----------|\n`;

  // Iterate through all statuses in the config
  const statuses = config.linear.statuses;
  for (const [key, statusData] of Object.entries(statuses)) {
    // Skip if it's old format (just a string)
    if (typeof statusData === 'string') continue;

    // Skip if it doesn't have name (might be ID field)
    if (!statusData.name) continue;

    const automated = statusData.automated ? 'Yes' : 'No';
    section += `| ${statusData.name} | ${statusData.meaning || 'N/A'} | ${automated} | ${statusData.trigger || 'N/A'} |\n`;
  }

  // Add when to manually update statuses
  section += `\n### When to Manually Update Statuses\n\n`;
  section += `Most statuses update automatically, but you may need to manually update:\n\n`;

  const manualStatuses = [];
  for (const [key, statusData] of Object.entries(statuses)) {
    if (typeof statusData === 'object' && statusData.automated === false) {
      manualStatuses.push(`- **${statusData.name}**: ${statusData.trigger}`);
    }
  }

  if (manualStatuses.length > 0) {
    section += manualStatuses.join('\n') + '\n';
  } else {
    section += `All statuses in your workflow are automated.\n`;
  }

  return section;
}

function generateAutoAssignmentSection(config) {
  if (!config.assignees?.enabled) return '';

  let section = `\n## Auto-Assignment\n\nIssues are automatically assigned when status changes:\n\n`;

  const assignments = [];

  if (config.assignees.onInProgress) {
    assignments.push(`| Status changes to **${config.linear?.statuses?.inProgress || 'In Progress'}** | Assigned to developer | Push to feature branch |`);
  }

  if (config.assignees.onReview) {
    assignments.push(`| Status changes to **${config.linear?.statuses?.review || 'Review'}** | Assigned to reviewer | Merge to ${config.branches?.main || 'main'} |`);
  }

  if (config.assignees.onStaging) {
    assignments.push(`| Status changes to **${config.linear?.statuses?.staging || 'QA Testing'}** | Assigned to QA lead | Merge to ${config.branches?.staging || 'staging'} |`);
  }

  if (config.assignees.onDone) {
    assignments.push(`| Status changes to **${config.linear?.statuses?.done || 'Done'}** | Assigned to release manager | Final deployment |`);
  }

  if (assignments.length > 0) {
    section += `| When | Assigned To | Trigger |\n`;
    section += `|------|-------------|----------|\n`;
    section += assignments.join('\n') + '\n';
  }

  if (config.assignees.preserveOriginal) {
    section += `\n**Note:** Original assignee is preserved. New assignees are added to the list.\n`;
  } else {
    section += `\n**Note:** Assignment replaces original assignee.\n`;
  }

  return section;
}

// ============================================================================
// Main Generator
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const projectPath = process.cwd();
  const outputDir = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || path.join(projectPath, 'docs/onboarding');
  const minimal = args.includes('--minimal');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Team Onboarding Documentation Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Load configuration
  console.log('Loading configuration...');
  const config = loadConfig(projectPath);
  console.log(`✓ Loaded configuration for: ${config.project?.name || 'Project'}\n`);

  // Generate documentation
  console.log('Generating documentation...\n');

  ensureDirectory(outputDir);

  // Always generate quick start
  writeFile(
    path.join(outputDir, 'QUICK-START.md'),
    generateQuickStart(config)
  );

  // Generate quick reference card
  writeFile(
    path.join(outputDir, 'QUICK-REFERENCE.md'),
    generateQuickReference(config)
  );

  if (!minimal) {
    // Generate detailed guide
    writeFile(
      path.join(outputDir, 'DETAILED-GUIDE.md'),
      generateDetailedGuide(config)
    );

    // Generate troubleshooting guide
    writeFile(
      path.join(outputDir, 'TROUBLESHOOTING.md'),
      generateTroubleshootingGuide(config)
    );
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Documentation Generated Successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Output directory: ${outputDir}\n`);
  console.log('Share these files with your team:\n');
  console.log('  • QUICK-START.md     - New team member onboarding');
  console.log('  • QUICK-REFERENCE.md - Command cheat sheet');
  if (!minimal) {
    console.log('  • DETAILED-GUIDE.md  - Complete workflow guide');
    console.log('  • TROUBLESHOOTING.md - Common issues and solutions');
  }
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// ============================================================================
// Run
// ============================================================================

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    console.error('\nEnsure Linear workflow is configured first.');
    console.error('Run: Say "Setup Linear workflow" to Claude\n');
    process.exit(1);
  });
}

module.exports = {
  generateQuickStart,
  generateDetailedGuide,
  generateQuickReference,
  generateTroubleshootingGuide
};
