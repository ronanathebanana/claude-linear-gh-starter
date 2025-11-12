# Error Handling & Recovery

This document provides comprehensive error handling guidance for the Linear workflow setup wizard. It covers common issues, error messages, recovery procedures, and troubleshooting strategies.

## Error Handling Principles

1. **Never crash** - Always catch errors gracefully
2. **Clear messages** - Explain what went wrong in plain language
3. **Suggest fixes** - Provide actionable recovery steps
4. **Offer options** - Let users choose how to proceed
5. **Preserve progress** - Don't lose configuration data on errors
6. **Allow retry** - Let users fix issues and continue
7. **Provide escape** - Always offer a way to cancel/exit

## Error Message Format

**Standard error message structure:**

```
❌ [Error Title]

[What went wrong]

[Why this happened / Common causes]

[Recovery options or next steps]

[Additional help or documentation links]
```

**Example:**
```
❌ Linear API Connection Failed

Could not connect to Linear's API to verify your workspace.

Common causes:
- Invalid API key (check for typos or extra spaces)
- Network connectivity issues
- Linear service temporarily unavailable
- API key has been revoked

What would you like to do?
1. Try again with the same key
2. Enter a different API key
3. Check Linear service status (https://status.linear.app)
4. Exit setup

Your choice: _____
```

---

## Error Categories

### 1. Git & Repository Errors

#### GIT_001: Not a Git Repository

**When it occurs:** User tries to run setup in non-git directory

**Error message:**
```
❌ Not a Git Repository

This directory is not initialized with git. The Linear workflow requires
git to track changes and integrate with GitHub Actions.

Current directory: {{current_path}}

Would you like to:
1. Initialize git here (git init)
2. Navigate to a different directory
3. Cancel setup

Your choice [1]: _____
```

**Recovery:**

*Option 1: Initialize git*
```bash
git init
```

Then show:
```
✓ Git repository initialized

Before continuing with setup, you should:

1. Add a .gitignore file (recommended)
2. Create an initial commit:
   git add .
   git commit -m "Initial commit"

Would you like me to help with this? (Y/n): _____
```

*Option 2: Change directory*
```
Please enter the full path to your project directory:

Path: _____
```

Validate new path and re-run pre-flight checks.

---

#### GIT_002: Dirty Working Directory

**When it occurs:** Uncommitted changes exist

**Error message:**
```
⚠️  Uncommitted Changes

You have uncommitted changes:

Modified files:
{{#modified_files}}  M {{file}}{{/modified_files}}

Untracked files:
{{#untracked_files}}  ? {{file}}{{/untracked_files}}

Setup will create new workflow files. To avoid confusion:

1. Commit current changes (recommended)
   git add .
   git commit -m "Save work before Linear setup"

2. Stash changes temporarily
   git stash
   (Restore later with: git stash pop)

3. Continue anyway
   (New files will be added to your working directory)

Your choice [1]: _____
```

**Recovery:** User chooses option, then setup continues.

---

#### GIT_003: Branch Already Exists

**When it occurs:** Trying to create a branch that exists

**Error message:**
```
❌ Branch Already Exists

The branch "{{branch_name}}" already exists in this repository.

This might happen if:
- You previously started work on this issue
- Someone else is working on this issue
- The branch name coincidentally matches

Would you like to:
1. Checkout existing branch (continue previous work)
2. Create branch with different name ({{suggested_alternative}})
3. Delete existing branch and start fresh (⚠ loses work)
4. Cancel

Your choice [1]: _____
```

**Recovery:** Execute chosen option

---

### 2. GitHub CLI Errors

#### GH_001: GitHub CLI Not Installed

**When it occurs:** `gh` command not found

**Error message:**
```
❌ GitHub CLI Not Installed

The GitHub CLI (gh) is required for:
- Setting up repository secrets
- Creating pull requests
- Managing GitHub Actions

Installation instructions:

macOS:
  brew install gh

Linux (Debian/Ubuntu):
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
    sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) \
    signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
    https://cli.github.com/packages stable main" | \
    sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update
  sudo apt install gh

Windows:
  winget install --id GitHub.cli

After installation, run:
  gh auth login

Then restart this setup wizard.

Full installation guide: https://github.com/cli/cli#installation
```

**Recovery:** User installs gh, then wizard can restart from pre-flight checks.

---

#### GH_002: Not Authenticated

**When it occurs:** `gh auth status` fails

**Error message:**
```
❌ GitHub CLI Not Authenticated

You need to authenticate with GitHub to:
- Configure repository secrets
- Enable GitHub Actions workflows

To authenticate, run:

  gh auth login

Follow the prompts:
1. Choose: GitHub.com
2. Choose: HTTPS
3. Choose: Login with a web browser (recommended)

Required permissions (scopes):
✓ repo - Access repositories
✓ workflow - Update GitHub Actions

After authentication, restart the setup wizard.
```

**Recovery:** User runs `gh auth login`, then restarts.

---

#### GH_003: Insufficient Scopes

**When it occurs:** Authenticated but missing required scopes

**Error message:**
```
⚠️  Insufficient GitHub Permissions

You're authenticated, but your token is missing required scopes:

Current scopes: {{current_scopes}}
Missing: {{missing_scopes}}

To add required scopes, run:

  gh auth refresh -s repo -s workflow

This will prompt you to re-authenticate with additional permissions.

After granting permissions, restart the setup wizard.
```

**Recovery:** User runs `gh auth refresh`, then restarts.

---

#### GH_004: Repository Not Found

**When it occurs:** Directory not connected to GitHub repo

**Error message:**
```
⚠️  No GitHub Repository Connected

This git repository isn't connected to GitHub yet.

Current remotes:
{{#remotes}}  {{name}}: {{url}}{{/remotes}}
{{^remotes}}  (none){{/remotes}}

Would you like to:
1. Create a new GitHub repository
2. Connect to an existing repository
3. Continue without GitHub (manual setup required)
4. Cancel setup

Your choice: _____
```

**Recovery:**

*Option 1: Create repository*
```
Repository name [{{suggested_name}}]: _____
Description (optional): _____
Visibility:
  1. Private
  2. Public
Your choice [1]: _____
```

Execute:
```bash
gh repo create {{repo_name}} --{{visibility}} --source=. --remote=origin --push
```

*Option 2: Connect existing*
```
Enter repository (owner/repo-name): _____
```

Execute:
```bash
git remote add origin https://github.com/{{owner}}/{{repo}}.git
git push -u origin {{current_branch}}
```

---

#### GH_005: No Repository Access

**When it occurs:** User lacks write access to repository

**Error message:**
```
❌ Insufficient Repository Permissions

You have read-only access to {{repo_owner}}/{{repo_name}}.

Required permissions:
✗ Write access (to push workflow files)
✗ Admin access (to configure secrets)

Your current permission: Read

Solutions:
1. Request admin access from repository owner
2. Fork the repository and set up workflow in your fork
3. Ask repository owner to run setup wizard

Contact: {{repo_owner}} (repository owner)

Setup cannot continue without write permissions.
```

**Recovery:** User must get permissions or fork repo, then restart.

---

#### GH_006: Secret Creation Failed

**When it occurs:** `gh secret set` command fails

**Error message:**
```
❌ Failed to Create GitHub Secret

Could not create LINEAR_API_KEY secret in repository.

Error: {{error_message}}

Common causes:
- No admin access to repository secrets
- Repository Actions disabled
- Network connectivity issues
- GitHub API rate limit exceeded

Would you like to:
1. Retry creating secret
2. Skip secret setup (you'll add it manually)
3. Check repository settings
4. Exit setup

Your choice: _____

If you choose to add the secret manually:
1. Go to: https://github.com/{{owner}}/{{repo}}/settings/secrets/actions
2. Click "New repository secret"
3. Name: LINEAR_API_KEY
4. Value: {{masked_api_key}}
5. Click "Add secret"
```

**Recovery:** User chooses option and proceeds accordingly.

---

### 3. Linear API Errors

#### LINEAR_001: Invalid API Key

**When it occurs:** API key authentication fails

**Error message:**
```
❌ Invalid Linear API Key

The API key you provided could not authenticate with Linear.

Error: {{api_error_message}}

Common causes:
- API key copied incorrectly (check for extra spaces)
- API key has been revoked
- API key doesn't have required permissions

To create a new API key:
1. Visit https://linear.app/settings/api
2. Click "Create new API key"
3. Give it a name (e.g., "GitHub Workflow Integration")
4. Copy the key immediately (you won't see it again!)

Would you like to:
1. Try again with a different API key
2. Check your copied key and retry
3. Visit Linear settings to create new key
4. Exit setup

Your choice: _____
```

**Recovery:** User gets correct API key and retries.

---

#### LINEAR_002: Network Connection Failed

**When it occurs:** Can't reach Linear API

**Error message:**
```
❌ Linear API Connection Failed

Could not connect to Linear's API.

Error: {{network_error}}

This could be due to:
- Network connectivity issues
- Firewall or proxy blocking requests
- Linear service temporarily unavailable
- DNS resolution problems

Troubleshooting:
1. Check your internet connection
2. Verify you can access https://linear.app in browser
3. Check Linear service status: https://status.linear.app
4. Try disabling VPN/proxy temporarily

Would you like to:
1. Retry connection
2. Exit and troubleshoot connectivity
3. Continue setup (will use API key later)

Your choice: _____
```

**Recovery:** User fixes network issue and retries.

---

#### LINEAR_003: No Teams Found

**When it occurs:** Workspace has no teams or no access

**Error message:**
```
❌ No Teams Available

Your Linear workspace doesn't have any teams, or your API key
doesn't have access to any teams.

Workspace: {{workspace_name}}
Teams found: 0

Possible causes:
- Your workspace doesn't have teams set up yet
- API key lacks team access permissions
- You're not a member of any teams

To fix this:
1. Visit https://linear.app/{{workspace}}/settings/teams
2. Create a team or request access to existing teams
3. Ensure your API key has team access

After resolving, would you like to:
1. Retry with same API key
2. Try different API key
3. Exit setup

Your choice: _____
```

**Recovery:** User fixes team access and retries.

---

#### LINEAR_004: No Workflow States

**When it occurs:** Selected team has no workflow configured

**Error message:**
```
❌ Team Has No Workflow States

The team "{{team_name}}" ({{team_key}}) doesn't have workflow states configured.

Workflow states (like "Todo", "In Progress", "Done") are required for
the Linear integration to update issue statuses.

To fix this:
1. Visit https://linear.app/{{workspace}}/settings/teams/{{team_key}}
2. Go to "Workflow" section
3. Create workflow states (or use template)
4. Save changes

Common workflow state examples:
- Todo / Backlog
- In Progress / In Development
- In Review / Review Required
- Done / Completed
- Canceled

After configuring workflow states, would you like to:
1. Retry with same team
2. Choose different team
3. Exit setup

Your choice: _____
```

**Recovery:** User configures workflow in Linear and retries.

---

#### LINEAR_005: API Rate Limited

**When it occurs:** Too many requests to Linear API

**Error message:**
```
⚠️  Linear API Rate Limit Exceeded

You've made too many requests to Linear's API.

Rate limit: {{rate_limit}}
Reset time: {{reset_time}} ({{time_until_reset}} from now)

This usually happens when:
- Running setup multiple times quickly
- Other tools using same API key
- Automated scripts making many requests

Options:
1. Wait {{time_until_reset}} and retry automatically
2. Continue later (setup will resume where it left off)
3. Use different API key (if you have multiple)

Your choice [1]: _____
```

**Recovery:** Wait for rate limit reset or use different key.

---

### 4. File System Errors

#### FS_001: No Write Permission

**When it occurs:** Can't write to project directory

**Error message:**
```
❌ Permission Denied

Cannot write to directory: {{target_path}}

Error: {{system_error}}

This directory may be:
- Owned by another user
- Protected by system permissions
- Located in restricted folder

To fix this:
1. Check directory permissions:
   ls -la {{parent_directory}}

2. Change ownership if needed:
   sudo chown -R $USER {{directory}}

3. Or choose a different installation directory

Would you like to:
1. Choose different directory
2. Exit (fix permissions manually)

Your choice: _____
```

**Recovery:** User fixes permissions or chooses different location.

---

#### FS_002: File Already Exists

**When it occurs:** Workflow file exists and user doesn't want to overwrite

**Error message:**
```
⚠️  File Already Exists

The file already exists: {{file_path}}

This file will be replaced during setup.

Current file:
  Size: {{file_size}}
  Modified: {{modification_date}}

Would you like to:
1. Backup and replace
   (Creates {{file_path}}.backup)

2. Skip this file
   (Keep existing file, may cause issues)

3. View difference
   (Compare new vs existing)

4. Cancel setup

Your choice [1]: _____
```

**Recovery:** User chooses option, setup proceeds accordingly.

---

#### FS_003: Disk Space Low

**When it occurs:** Not enough disk space for installation

**Error message:**
```
⚠️  Low Disk Space

Available space: {{available_space}}
Required: ~{{required_space}}

While the workflow files are small, you may need space for:
- Git operations
- Documentation generation
- Future issue analysis files

Would you like to:
1. Continue anyway (if you're sure you have enough space)
2. Free up disk space and retry
3. Cancel setup

Your choice: _____
```

**Recovery:** User frees space or continues if acceptable.

---

### 5. Validation Errors

#### VAL_001: Invalid Branch Name

**When it occurs:** User enters invalid git branch name

**Error message:**
```
❌ Invalid Branch Name

Branch name "{{invalid_name}}" is not valid.

Git branch names cannot:
✗ Contain spaces
✗ Start or end with /
✗ Contain .. (double dots)
✗ Contain these characters: ~^:?*[\\
✗ Start with a dot (.)

Examples of valid branch names:
✓ main
✓ develop
✓ feature/user-auth
✓ staging-v2
✓ production-us-east

Please enter a valid branch name: _____
```

**Recovery:** User enters valid name.

---

#### VAL_002: Invalid Issue Pattern

**When it occurs:** Regex pattern doesn't compile or doesn't match example

**Error message:**
```
❌ Invalid Issue ID Pattern

The regex pattern "{{pattern}}" has an error.

{{#regex_error}}
Regex error: {{regex_error}}
{{/regex_error}}

{{#no_match}}
Pattern doesn't match your example "{{example}}".
{{/no_match}}

Common regex patterns for Linear:
- [A-Z]+-\d+        Matches: DEV-123, PROJ-456
- [A-Z]{2,5}-\d+    Matches: AB-1, ABCDE-999
- DEV-\d+           Matches: DEV-123 (single team)

Would you like to:
1. Try a different pattern
2. Use standard pattern [A-Z]+-\d+
3. Get help with regex

Your choice: _____
```

**Recovery:** User enters valid pattern or chooses standard.

---

#### VAL_003: Duplicate Configuration

**When it occurs:** User enters same value for multiple fields

**Error message:**
```
❌ Duplicate Branch Names

You entered "{{duplicate_name}}" for multiple branches:
{{#duplicates}}  - {{branch_role}}{{/duplicates}}

Each branch must have a unique name for the workflow to function correctly.

Please use different names for:
- Main branch (where PRs merge)
- Staging branch (QA/testing)
- Production branch (live deployment)

Let's reconfigure your branch names.
```

**Recovery:** User re-enters branch names with unique values.

---

### 6. Runtime Errors

#### RUN_001: Template Rendering Failed

**When it occurs:** Error processing template files

**Error message:**
```
❌ Template Processing Error

Failed to generate workflow file: {{template_name}}

Error: {{template_error}}

This is likely a bug in the setup wizard. Please:

1. Report this issue:
   https://github.com/{{repo}}/issues/new
   Include the error message above

2. Try workaround:
   - Exit setup
   - Delete .linear-workflow.json (if exists)
   - Restart setup

3. Manual installation:
   Follow guide at: {{docs_url}}

Would you like to:
1. Retry rendering
2. Skip this file (manual setup required)
3. Exit setup

Your choice: _____
```

**Recovery:** User reports bug, uses workaround, or manual setup.

---

#### RUN_002: GitHub Action Creation Failed

**When it occurs:** Can't create workflow file in .github/workflows/

**Error message:**
```
❌ Failed to Create GitHub Actions Workflow

Could not create file: .github/workflows/linear-status-update.yml

Error: {{error_message}}

Common causes:
- .github/workflows/ directory doesn't exist
- No write permissions
- File path too long (Windows)
- Disk space issues

To fix:
1. Create directory manually:
   mkdir -p .github/workflows

2. Check permissions:
   ls -la .github/

3. Verify disk space:
   df -h .

Would you like to:
1. Create directory and retry
2. Exit and fix manually

Your choice [1]: _____
```

**Recovery:** User fixes issue and retries.

---

### 7. User Input Errors

#### INPUT_001: Invalid Response

**When it occurs:** User enters unexpected input

**Error message:**
```
⚠️  Invalid Input

Expected: {{expected_format}}
You entered: {{user_input}}

{{#expected_options}}
Valid options:
{{#options}}  {{index}}. {{option}}{{/options}}
{{/expected_options}}

Please try again: _____
```

**Recovery:** Show help and re-prompt.

---

#### INPUT_002: Timeout

**When it occurs:** User doesn't respond for extended period

**Error message:**
```
⏱️  Input Timeout

No response received for {{timeout_minutes}} minutes.

Your progress has been saved. To resume:
1. Restart the setup wizard
2. Say "resume setup" or "continue setup"

Your configuration will be loaded automatically.

Exit now? (Y/n): _____
```

**Recovery:** Save progress, allow resume.

---

## Progress Preservation

**When errors occur, save progress:**

**Create `.linear-workflow-progress.json`:**
```json
{
  "version": "1.0.0",
  "timestamp": "2025-01-11T10:30:00Z",
  "phase": "wizard",
  "lastCompletedQuestion": 3,
  "answers": {
    "projectPath": "/path/to/project",
    "branches": {
      "main": "main",
      "staging": "staging"
    },
    "githubSetupSecret": true
  },
  "preflightResults": {
    "git": true,
    "github": true,
    "node": true
  }
}
```

**On wizard restart:**
```
Welcome back! I found a setup in progress.

You were at: Question 4 of 7 (Linear Configuration)
Last updated: 15 minutes ago

Would you like to:
1. Continue where you left off
2. Start over from the beginning
3. Review previous answers

Your choice [1]: _____
```

---

## Rollback Mechanism

**If installation fails partway through:**

**Error message:**
```
❌ Installation Failed

An error occurred during installation:

Completed steps:
✓ Created configuration file
✓ Created GitHub Actions workflow
✗ Failed: Setting up GitHub secrets

Would you like to:
1. Retry from failed step
2. Rollback changes (restore backups)
3. Keep partial installation (fix manually)
4. Exit

Your choice: _____
```

**Rollback procedure:**
1. Restore backed up files
2. Delete newly created files
3. Remove `.linear-workflow.json`
4. Show summary of rollback actions

**After rollback:**
```
✓ Rollback Complete

All changes have been reverted:
✓ Restored original files from backups
✓ Removed newly created files
✓ Cleaned up temporary files

Your project is back to its original state.

To try again:
1. Fix the issue that caused failure
2. Restart the setup wizard

Need help? Check troubleshooting guide:
{{docs_url}}/troubleshooting.md
```

---

## Logging and Debugging

**Create setup log file: `.linear-setup.log`**

```
[2025-01-11 10:30:00] Starting Linear workflow setup
[2025-01-11 10:30:01] Pre-flight checks: PASS
[2025-01-11 10:30:15] Question 1 (Project Location): /path/to/project
[2025-01-11 10:30:30] Question 2 (GitHub Auth): Authenticated as username
[2025-01-11 10:31:00] Question 3 (Branch Strategy): Standard (main + staging)
[2025-01-11 10:31:45] Question 4a (Linear API Key): Validating...
[2025-01-11 10:31:47] ERROR: Linear API connection failed
[2025-01-11 10:31:47] Error details: Network timeout after 2000ms
[2025-01-11 10:32:00] User choice: Retry connection
[2025-01-11 10:32:02] Linear API: Connected successfully
[2025-01-11 10:32:02] Workspace: Acme Inc (ID: abc-123)
```

**On error, suggest:**
```
Full setup log saved to: .linear-setup.log

If you need help, please:
1. Check the log file for details
2. Report issue with log attached
3. Visit troubleshooting guide
```

---

## Common Error Recovery Flows

### Flow 1: Linear API Key Issues

```
User starts setup
  → Enters API key
  → ERROR: Invalid key
  → User tries again (3 attempts)
  → ERROR: Still invalid
  → Show link to create new key
  → User creates new key
  → Success
```

### Flow 2: GitHub Repository Issues

```
User starts setup
  → ERROR: No GitHub repo
  → Offer to create repo
  → User chooses "Create new"
  → ERROR: Name already taken
  → Suggest alternative name
  → User accepts
  → Create repo successfully
  → Continue setup
```

### Flow 3: Permission Issues

```
User starts setup
  → ERROR: No write access to directory
  → Suggest fixing permissions
  → User exits to fix
  → User restarts setup
  → Load saved progress
  → Continue from where left off
  → Success
```

---

## Help System

**User can type "help" at any prompt:**

```
❓ Help: {{current_question}}

{{question_help_text}}

Related commands:
- Type "back" to go to previous question
- Type "restart" to start over
- Type "cancel" to exit setup
- Type "skip" to skip this question (if optional)

Need more help?
- Troubleshooting: {{docs_url}}/troubleshooting.md
- Full docs: {{docs_url}}/README.md
- Report issue: {{repo_url}}/issues

Press Enter to continue...
```

---

## Contact Support

**When all else fails:**

```
🆘 Need More Help?

If you're stuck and can't resolve the issue:

1. Check troubleshooting guide:
   {{docs_url}}/troubleshooting.md

2. Search existing issues:
   {{repo_url}}/issues

3. Ask for help:
   {{repo_url}}/discussions

4. Report a bug:
   {{repo_url}}/issues/new

Include in your report:
- Setup log file (.linear-setup.log)
- Error message
- Your configuration progress (.linear-workflow-progress.json)
- Operating system and versions

We'll help you get set up!
```
