# Pre-Flight Checks

Before starting the Linear workflow setup wizard, validate that all required tools and permissions are in place. This document outlines the checks to perform, expected results, and recovery procedures.

## Overview

The pre-flight check phase ensures:
1. User is in a git repository
2. GitHub CLI is installed and authenticated
3. Node.js is installed (required for future enhancements)
4. User has appropriate permissions
5. Repository is properly configured

**Display Format:**
```
🔍 Pre-Flight Checks

Running setup validation...
```

---

## Check 1: Git Repository

**Purpose:** Ensure we're in a valid git repository where workflow files can be installed

**Command:**
```bash
git rev-parse --git-dir 2>/dev/null
```

**Success Criteria:**
- Exit code 0
- Returns `.git` or absolute path to git directory

**Display on Success:**
```
✓ Git repository detected
  Location: {{git_dir}}
```

**Failure Scenarios:**

### Not in a git repository

**Detection:**
- Exit code 128
- Error: "fatal: not a git repository"

**Display:**
```
❌ Not a git repository

This directory is not initialized with git.

Would you like to:
1. Initialize git here (git init)
2. Navigate to a different directory
3. Cancel setup

Your choice: _____
```

**Recovery Option 1: Initialize git**
```bash
git init
```

**After initialization:**
```
✓ Git repository initialized

Next, you should:
1. Create initial commit: git add . && git commit -m "Initial commit"
2. Create GitHub repository: gh repo create
3. Push to remote: git push -u origin main

Would you like me to help with this? (Y/n): _____
```

**Recovery Option 2: Change directory**
```
Please enter the path to your project directory:

Path: _____
```

Then re-run all checks from the new directory.

---

## Check 2: GitHub CLI Installation

**Purpose:** Verify gh CLI is installed and accessible

**Command:**
```bash
gh --version
```

**Success Criteria:**
- Exit code 0
- Output contains version number (e.g., "gh version 2.40.0")

**Display on Success:**
```
✓ GitHub CLI installed
  Version: {{gh_version}}
```

**Failure Scenarios:**

### GitHub CLI not installed

**Detection:**
- Exit code 127
- Error: "command not found: gh"

**Display:**
```
❌ GitHub CLI not installed

The GitHub CLI (gh) is required to:
- Set up repository secrets
- Create pull requests
- Manage GitHub Actions

Installation instructions:

macOS:
  brew install gh

Linux (Debian/Ubuntu):
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update
  sudo apt install gh

Linux (Fedora/RHEL):
  sudo dnf install gh

Windows:
  winget install --id GitHub.cli
  # Or download from: https://github.com/cli/cli/releases

After installing, run: gh auth login

Then restart the setup wizard.

Setup cannot continue without GitHub CLI.
```

**Exit wizard until gh is installed**

---

## Check 3: GitHub CLI Authentication

**Purpose:** Verify user is logged into GitHub via gh CLI

**Command:**
```bash
gh auth status 2>&1
```

**Success Criteria:**
- Exit code 0
- Output contains "Logged in to github.com as {{username}}"
- Token has required scopes: `repo`, `workflow`

**Display on Success:**
```
✓ GitHub CLI authenticated
  User: {{github_username}}
  Scopes: {{scopes}}
```

**Failure Scenarios:**

### Not authenticated

**Detection:**
- Exit code 1
- Output contains "You are not logged into any GitHub hosts"

**Display:**
```
❌ GitHub CLI not authenticated

You need to log in to GitHub to:
- Configure repository secrets
- Enable GitHub Actions

Please run:

  gh auth login

Follow the prompts to authenticate. Choose:
- GitHub.com (not Enterprise)
- HTTPS protocol
- Authenticate with browser (recommended)

Scopes needed:
✓ repo (access repositories)
✓ workflow (update GitHub Actions)

After authenticating, restart the setup wizard.

Setup cannot continue without authentication.
```

**Exit wizard until user authenticates**

### Insufficient scopes

**Detection:**
- Exit code 0 (authenticated)
- But output missing 'repo' or 'workflow' in scopes

**Display:**
```
⚠️  Insufficient GitHub permissions

You're logged in, but missing required scopes:
{{#missing_repo}}✗ repo (needed to access repository secrets){{/missing_repo}}
{{#missing_workflow}}✗ workflow (needed to configure GitHub Actions){{/missing_workflow}}

Please re-authenticate with additional scopes:

  gh auth refresh -s repo -s workflow

Then restart the setup wizard.
```

**Exit wizard until scopes are added**

---

## Check 4: GitHub Repository Detection

**Purpose:** Verify this directory is connected to a GitHub repository

**Command:**
```bash
gh repo view --json nameWithOwner,isPrivate 2>&1
```

**Success Criteria:**
- Exit code 0
- Returns valid JSON with repository info
- User has admin/write access

**Parse Response:**
```json
{
  "nameWithOwner": "owner/repo-name",
  "isPrivate": true
}
```

**Display on Success:**
```
✓ GitHub repository connected
  Repository: {{repo_owner}}/{{repo_name}}
  {{#is_private}}🔒 Private repository{{/is_private}}
  {{^is_private}}🌍 Public repository{{/is_private}}
```

**Failure Scenarios:**

### Not connected to GitHub repository

**Detection:**
- Exit code 1
- Error contains "no git remotes found" or "not a git repository"

**Display:**
```
⚠️  Not connected to a GitHub repository

This git repository isn't connected to GitHub yet.

Would you like to:
1. Create a new GitHub repository
2. Connect to an existing repository
3. Continue without GitHub (manual setup required)
4. Cancel setup

Your choice: _____
```

**Recovery Option 1: Create new repository**
```
Let's create a GitHub repository for this project.

Repository name [{{suggested_name}}]: _____

Description (optional): _____

Visibility:
1. Private (only you and collaborators can see it)
2. Public (anyone can see it)

Your choice [1]: _____
```

Then execute:
```bash
gh repo create {{repo_name}} \
  --{{visibility}} \
  --source=. \
  --remote=origin \
  --push
```

**Recovery Option 2: Connect existing repository**
```
Enter the GitHub repository to connect to:

Format: owner/repo-name
Example: acme/my-project

Repository: _____
```

Then execute:
```bash
git remote add origin https://github.com/{{owner}}/{{repo_name}}.git
git push -u origin {{current_branch}}
```

**Recovery Option 3: Continue without GitHub**
```
⚠️  Continuing without GitHub connection

You can still set up the workflow, but you'll need to:
- Manually configure GitHub repository later
- Manually add LINEAR_API_KEY secret
- Manually push workflow files

The wizard will generate all files locally.

Continue anyway? (y/N): _____
```

### No write access to repository

**Detection:**
- Exit code 0 (repo exists)
- But `gh repo view --json viewerPermission` returns "READ"

**Display:**
```
❌ Insufficient repository permissions

You have read-only access to {{repo_owner}}/{{repo_name}}.

To set up the workflow, you need:
- Write or Admin access to push workflow files
- Admin access to configure repository secrets

Please:
1. Request admin access from {{repo_owner}}
2. Or fork the repository and set up workflow there

Setup cannot continue without write permissions.
```

**Exit wizard until permissions are granted**

---

## Check 5: Node.js Installation

**Purpose:** Verify Node.js is available (for future script execution)

**Command:**
```bash
node --version
```

**Success Criteria:**
- Exit code 0
- Version >= 16.0.0

**Display on Success:**
```
✓ Node.js installed
  Version: {{node_version}}
```

**Failure Scenarios:**

### Node.js not installed

**Detection:**
- Exit code 127
- Error: "command not found: node"

**Display:**
```
⚠️  Node.js not installed

Node.js is recommended for:
- Running validation scripts
- Template rendering (future)
- Enhanced setup experience (future)

However, setup can continue without it for now.

Installation instructions:

macOS:
  brew install node

Linux:
  # Using NodeSource:
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs

Windows:
  Download from: https://nodejs.org/

Would you like to:
1. Continue without Node.js
2. Pause setup to install Node.js

Your choice [1]: _____
```

**Allow continuation without Node.js** (mark as warning, not blocker)

### Node.js version too old

**Detection:**
- Exit code 0
- Version < 16.0.0

**Display:**
```
⚠️  Node.js version outdated

Installed: {{current_version}}
Required: >= 16.0.0

Newer features may not work with this version.

Upgrade instructions:

macOS:
  brew upgrade node

Linux:
  # Using n:
  sudo npm install -g n
  sudo n lts

Windows:
  Download from: https://nodejs.org/

Would you like to:
1. Continue with current version (may have issues)
2. Pause setup to upgrade Node.js

Your choice [1]: _____
```

**Allow continuation with warning**

---

## Check 6: Working Directory Status

**Purpose:** Ensure working directory is clean or manageable

**Command:**
```bash
git status --porcelain
```

**Success Criteria:**
- Exit code 0
- Output empty or only untracked files

**Display on Success:**
```
✓ Working directory clean
```

**Failure Scenarios:**

### Uncommitted changes

**Detection:**
- Exit code 0
- Output contains modified/staged files

**Display:**
```
⚠️  Uncommitted changes detected

You have uncommitted changes in your working directory:
{{#modified_files}}
  M {{file}}
{{/modified_files}}

The setup will create new files. To keep things clean, consider:

1. Commit current changes first
   git add .
   git commit -m "Save work before Linear setup"

2. Stash changes temporarily
   git stash
   (You can restore with: git stash pop)

3. Continue anyway
   (New files will be created alongside your changes)

Your choice [1]: _____
```

**Allow continuation after user chooses**

---

## Check 7: LINEAR_API_KEY Environment Variable

**Purpose:** Check if LINEAR_API_KEY is already available

**Command:**
```bash
echo $LINEAR_API_KEY
```

**Success Criteria:**
- Variable exists and is non-empty

**Display on Success:**
```
✓ LINEAR_API_KEY found in environment
  (Will use this unless you provide a different key)
```

**If not found:**
```
⚠️ LINEAR_API_KEY not in environment
  (We'll ask for this during Linear configuration)
```

**Note:** This is informational only, not a blocker

---

## Check 8: Existing Workflow Detection

**Purpose:** Check if Linear workflow is already installed

**Command:**
```bash
test -f .linear-workflow.json && cat .linear-workflow.json
```

**Success Criteria:**
- File doesn't exist (clean install)
- OR file exists (update/reinstall scenario)

**If workflow already exists:**

**Display:**
```
⚠️  Existing Linear workflow detected!

Found: .linear-workflow.json
Installed: {{install_date}}
Version: {{version}}

Configuration:
  Team: {{team_name}} ({{team_key}})
  Branches: {{branch_list}}

What would you like to do?

1. Update configuration
   (Keeps existing files, updates settings)

2. Reinstall completely
   (Backs up and replaces all files)

3. Cancel setup
   (Keep current configuration)

Your choice: _____
```

**Recovery Options:**

**Option 1: Update configuration**
- Load existing config
- Pre-fill wizard with current values
- Allow user to change any setting
- Backup existing files before overwriting

**Option 2: Reinstall**
- Backup all existing workflow files
  - `.linear-workflow.json` → `.linear-workflow.json.backup`
  - `.github/workflows/linear-status-update.yml` → `*.backup`
  - etc.
- Run full wizard from scratch
- Generate fresh files

**Option 3: Cancel**
- Exit wizard gracefully
- No changes made

---

## Complete Pre-Flight Check Display

**When all checks pass:**

```
🔍 Pre-Flight Checks

✓ Git repository detected
  Location: /path/to/project/.git

✓ GitHub CLI installed
  Version: gh version 2.40.0

✓ GitHub CLI authenticated
  User: username
  Scopes: repo, workflow

✓ GitHub repository connected
  Repository: username/project-name
  🔒 Private repository

✓ Node.js installed
  Version: v18.17.0

✓ Working directory clean

⚠️ LINEAR_API_KEY not in environment
  (We'll ask for this during setup)

All critical requirements met! Ready to begin configuration.

Press Enter to start the setup wizard...
```

**When checks fail:**

```
🔍 Pre-Flight Checks

✓ Git repository detected
✓ GitHub CLI installed
❌ GitHub CLI not authenticated
✗ GitHub repository check skipped (auth required)
✓ Node.js installed
✓ Working directory clean

Setup cannot continue with failed checks.

Please resolve the issues above and restart the wizard.
```

---

## Check Execution Order

**Run checks in this order:**

1. Git repository (blocker)
2. GitHub CLI installation (blocker)
3. GitHub CLI authentication (blocker)
4. GitHub repository connection (blocker)
5. Repository permissions (blocker)
6. Node.js installation (warning only)
7. Working directory status (warning only)
8. LINEAR_API_KEY environment (informational)
9. Existing workflow detection (special handling)

**Stop at first blocker.** Don't continue if critical checks fail.

**Continue with warnings.** Non-critical checks can show warnings but allow setup to proceed.

---

## Retry Logic

**After showing a fixable error:**

```
After resolving the issue, would you like to:
1. Retry pre-flight checks
2. Skip this check (not recommended)
3. Exit setup

Your choice [1]: _____
```

**Option 1:** Re-run all checks from the beginning

**Option 2:** Mark check as skipped and continue (only for non-critical checks)

**Option 3:** Exit gracefully

---

## Summary Data Structure

**After pre-flight checks, store this data:**

```json
{
  "preflightResults": {
    "git": {
      "installed": true,
      "isRepo": true,
      "gitDir": "/path/to/project/.git"
    },
    "github": {
      "cliInstalled": true,
      "cliVersion": "2.40.0",
      "authenticated": true,
      "username": "username",
      "scopes": ["repo", "workflow"],
      "repoConnected": true,
      "repoOwner": "owner",
      "repoName": "project-name",
      "repoPrivate": true,
      "hasWriteAccess": true
    },
    "node": {
      "installed": true,
      "version": "18.17.0",
      "versionValid": true
    },
    "environment": {
      "linearApiKeyPresent": false,
      "workingDirClean": true
    },
    "existing": {
      "workflowInstalled": false,
      "configFile": null
    },
    "timestamp": "2025-01-11T10:30:00Z",
    "allChecksPassed": true
  }
}
```

**This data is used during wizard to:**
- Pre-fill values (repo name, username, etc.)
- Skip redundant questions
- Make intelligent defaults
- Show relevant warnings

---

## Exit Codes

**Standard exit codes for check results:**

- `0` - Check passed
- `1` - Check failed (blocker)
- `2` - Check failed (warning, can continue)
- `127` - Tool not installed

Use these consistently for automated testing and debugging.
