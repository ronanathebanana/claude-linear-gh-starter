# CLAUDE.md

This file provides guidance to Claude Code when working with the Linear workflow setup wizard.

## Purpose

This repository is a **setup wizard** that installs a complete Linear + GitHub + Claude Code workflow integration into any project. The wizard automates:

- **Linear MCP server configuration** (OAuth-based, no API key required!)
- AI-powered workflow commands ("Let's get to work on DEV-123")
- Git commit message validation hooks
- Comprehensive documentation and examples
- Linear issue templates (Bug, Improvement, Feature)
- **GitHub Actions workflow** (optional, requires LINEAR_API_KEY)

**Target Users:** Development teams using Linear for issue tracking who want seamless GitHub integration and Claude Code productivity tools.

**Installation Time:** ~5 minutes with automated pre-flight validation

**Key Feature:** MCP-first approach means team members without Linear API key creation permissions can still use the full workflow via Claude Code commands!

## Setup Wizard Trigger

Activate the wizard when the user:

**Uses a slash command:**
- `/setup-linear`
- `/install`

**Or says:**
- "Setup Linear workflow"
- "Install Linear workflow"
- "Configure Linear integration"
- "Setup Linear + GitHub workflow"

All trigger methods run the same enhanced setup wizard.

## Pre-Setup: Display Installation Plan

**Before starting the wizard, show the user what will happen:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This wizard installs a complete Linear + GitHub + Claude Code workflow.

What you're about to get:

  Seamless Linear Integration
  • MCP server with OAuth (no API key needed!)
  • Real-time issue fetching and updates
  • Bidirectional sync (Claude ↔ Linear)

  AI-Powered Workflow
  • Natural language: "Let's get to work on DEV-123"
  • Automatic task analysis and documentation
  • Smart status updates on git events

  Professional Tooling
  • Custom slash commands (/start-issue, /create-pr)
  • Git commit validation
  • Linear issue templates (Bug, Feature, Improvement)
  • Team documentation

  Optional: GitHub Actions
  • Auto-update Linear on PR merge
  • Works great without this too!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time Required: ~5 minutes
You'll Need: Linear account + GitHub auth

The Setup Process:
  1. Authenticate with Linear (browser OAuth)
  2. Environment validation (we'll auto-fix issues)
  3. Configuration (we'll guide you through)
  4. Installation (automated)
  5. Verification (create test issue)

Ready to transform your workflow? (Y/n)
```

**After user says yes, IMMEDIATELY confirm project location:**

```
Great! Let's get started.

First, where should we install the Linear workflow?

Current directory: /Users/username/projects/my-app

Options:
1. Install in current directory [Recommended]
   → /Users/username/projects/my-app

2. Install in a different directory
   → You'll specify the path

Your choice [1]: _____
```

**If option 2 (different directory):**

```
Please provide the full path to your project directory:

Path: _____
```

**After getting path, verify it exists:**

```bash
# Verify directory in one command (batched with upcoming checks)
test -d "/path/to/project" && cd "/path/to/project" && echo "✓ Directory confirmed: $(pwd)" || echo "✗ Directory not found"
```

**If directory doesn't exist:**

```
✗ Directory not found: /path/to/project

Would you like to:
1. Create this directory
2. Choose a different directory
3. Cancel setup

Your choice [2]: _____
```

**Important validation - Detect if installing in setup tool repository:**

If the directory is `claude-linear-gh-starter` (the setup tool itself), warn:

```
⚠️  WARNING: Installing in setup tool repository

Current directory: /path/to/claude-linear-gh-starter

This is the setup TOOL repository. Most users want to install
the workflow in their own project directory, not in the tool itself.

This is typically only done for:
  • Testing the setup wizard
  • Contributing to claude-linear-gh-starter
  • Demo purposes

Is this intentional?

1. Yes, install here anyway (for testing/development)
2. No, let me choose my actual project directory

Your choice [2]: _____
```

**After confirming location, show summary:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Installation Location Confirmed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: /Users/username/projects/my-app
Git Repository: ✓ Detected
Remote: https://github.com/username/my-app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What happens next:

  1. Environment Validation
     Quick checks (batched for minimal approvals)

  2. Interactive Configuration
     Branch strategy, Linear connection, formats
     We'll guide you through each choice

  3. Automated Installation
     File creation via tools (typically auto-approved)

  4. Secure Operations
     You'll approve write operations (secrets, API calls, git push)

  5. Testing & Verification
     Create test issue to verify everything works

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Approval Strategy:
  • Read-only checks are batched (minimal interruptions)
  • Configuration is interactive (we'll guide you)
  • File operations follow your existing tool settings
  • Write operations require your approval (security first!)

This keeps things secure while maintaining a smooth flow.

Ready? Let's begin!
```

**IMPORTANT:**
- Batch all read-only commands together to minimize approval prompts
- Only ask for approval on write operations (gh secret set, git push, curl to Linear API)
- File operations via tools (Write, Edit) follow user's existing tool approval settings

## Linear's Native GitHub Integration vs This Workflow

**IMPORTANT:** Before starting setup, understand the difference between Linear's native integration and this workflow.

### Linear's Native Integration

Linear offers a built-in GitHub integration at: `linear.app/settings/integrations/github`

**What it provides:**
- ✅ Auto-links GitHub PRs to Linear issues (when PR contains issue ID)
- ✅ Shows PR status in Linear issue sidebar
- ✅ Displays commit information in Linear UI
- ✅ Basic PR → Issue linking (read-only)

**What it DOESN'T do:**
- ❌ Doesn't update Linear issue statuses based on git events
- ❌ No custom status mappings
- ❌ No AI-assisted task analysis
- ❌ No automated comments from Claude
- ❌ Read-only (GitHub → Linear only, no bidirectional sync)

### This Workflow (claude-linear-gh-starter)

**What this workflow provides:**
- ✅ **Bidirectional sync**: Claude posts analysis/updates back to Linear
- ✅ **AI development workflow**: "Let's get to work on DEV-123" commands
- ✅ **Task analysis**: Claude analyzes issues and posts summaries to Linear
- ✅ **MCP-powered**: Real-time Linear integration in Claude Code (OAuth, no API key!)
- ✅ **Optional automated status updates**: GitHub Actions can update statuses on PR merge
- ✅ **Custom status mappings**: Define your own workflow stages
- ✅ **Commit validation**: Git hooks ensure commits reference Linear issues

### How They Work Together

```
Linear Native Integration:
  GitHub → Linear (read-only linking, UI niceness)

This Workflow:
  GitHub ⟷ Linear ⟷ Claude Code (full automation + AI workflow)

Best Practice: Enable BOTH!
  ✓ Native integration provides visual PR links in Linear UI
  ✓ This workflow provides automation + AI-assisted development
```

### Recommendation

**Enable Linear's native integration when:**
- Your team uses Linear web app frequently
- You want visual PR links in Linear UI
- You want to see commit history in Linear
- Quick setup (just enable in Linear settings)

**Use this workflow when:**
- You want AI-assisted issue analysis
- You're using Claude Code for development
- You want automated status updates (optional GitHub Actions)
- You need custom workflow stage mappings
- You want bidirectional sync (Claude → Linear updates)

**Use BOTH when:**
- You want the best of both worlds! (recommended)
- Native integration handles UI niceness
- This workflow handles automation + AI assistance

### Setup Guidance

During the wizard, I'll offer to open Linear's integration settings:

```
💡 Tip: Linear's Native GitHub Integration

Linear offers a native GitHub integration for visual PR linking.

This is complementary to the workflow we're installing:
  • Native: UI-focused, read-only
  • This workflow: Automation + AI assistance

Recommendation: Enable BOTH for the best experience!

Would you like me to open Linear's integration settings now? (y/N)

  → https://linear.app/{{workspace}}/settings/integrations/github

(You can also do this later - it's independent of this workflow)
```

## Setup Wizard Flow

### Phase 1: Initialize TODO List

**[Step 1 of 12 | Automatic | ~5 seconds]**

**IMMEDIATELY after user approves setup, use TodoWrite to create the installation checklist:**

Show progress bar at the start:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [█_________] 1/12 steps complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Update this progress bar and TODO list after EACH step is completed using TodoWrite.**

**Progress Bar Format:**
- Use █ for completed sections
- Use _ for incomplete sections
- Always show: [█████_____] X/12 steps complete
- Update after each phase completion

Display format:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [████______] 4/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks
  ✓ Initialize Claude Code in project

Current:
  ⟳ Authenticate with Linear via MCP

Remaining:
  • Configure workflow settings
  • Set up branch strategy and status mappings
  • Configure commit and PR formats
  • Install workflow files and documentation
  • Set up git hooks
  • Create Linear issue templates
  • Create test issue
  • Test the workflow
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase 1.5: Check for Existing Installation & Version

**IMMEDIATELY after TODO list creation, check for existing workflow:**

```bash
node scripts/version-manager.js check
```

**If no existing workflow found:**
```
Status: No workflow installed

Proceeding with fresh installation...
```

Continue to Phase 2.

**If existing workflow found - IDEMPOTENT SETUP:**

```
═══════════════════════════════════════════════════════════════
Workflow Version Check
═══════════════════════════════════════════════════════════════

Installed Version: 1.0.0
Latest Version:    1.1.0

📦 Update available!

1 migration(s) available:

  1.0.0 → 1.1.0
  Add commit reference options and fix workflow bugs

  Changes:
    • New: Commit message reference options (Related/Closes/Fixes)
    • New: Linear magic word automation detection and warnings
    • New: GitHub Actions is now optional (MCP-first approach)
    • Fixed: GitHub Actions workflow branches syntax error
    • Improved: MCP-first authentication flow (no API key required)
    • Improved: Better documentation of Linear native integration

To upgrade, run:
  node scripts/version-manager.js upgrade --to 1.1.0 --create-branch

Installation Details:
─────────────────────────────────────────────────────────────
Installed: 2025-01-10T14:30:00Z
Last Migration: Never
Project: my-project
Linear Team: DEV - Development
```

**Present options to user:**

```
⚠️  Existing Linear workflow detected (v1.0.0)

What would you like to do?

1. Update configuration only
   → Modify settings without changing workflow files
   → Keeps your current version (1.0.0)
   → Quick reconfiguration

2. Upgrade to latest version (1.1.0) [Recommended]
   → Applies 1 migration with new features
   → Backs up existing files
   → Updates workflow files and configuration
   → Non-breaking changes

3. Reinstall everything
   → Complete fresh installation
   → Backs up and replaces all files
   → Use this if workflow is broken

4. Cancel
   → Exit without making changes

Your choice [2]: _____
```

**Option 1: Update Configuration Only**

```
Updating configuration...

What would you like to reconfigure?

1. Branch strategy (currently: main + staging)
2. Linear team (currently: DEV - Development)
3. Status mappings
4. Commit/PR formats
5. Auto-assignment rules
6. All of the above

Your choice: _____
```

Then run through relevant configuration questions from Phase 5, save updated `.linear-workflow.json`, and exit.

**Option 2: Upgrade to Latest Version**

```
Starting upgrade from 1.0.0 to 1.1.0...

Migration Plan:
─────────────────────────────────────────────────────────────
1.0.0 → 1.1.0
  Add commit reference options and fix workflow bugs

What's New in 1.1.0:
  ✨ New: Commit message reference options (Related/Closes/Fixes)
  ✨ New: Linear magic word automation detection and warnings
  ✨ New: GitHub Actions is now optional (MCP-first approach!)
  🐛 Fix: GitHub Actions workflow branches syntax error
  🔧 Improved: MCP-first authentication flow (no API key required)
  📝 Improved: Better documentation of Linear native integration

This upgrade will:
  ✓ Backup existing workflow files
  ✓ Add commit reference configuration (defaults to "Related:")
  ✓ Add Linear automation detection settings
  ✓ Add GitHub Actions optional configuration
  ✓ Fix workflow file branches syntax if affected
  ✓ Update .linear-workflow.json with new fields
  ✓ Preserve all your existing configuration settings

⚠️  Your project will be safe - all changes are backed up.

Proceed with upgrade? (Y/n)
```

If yes:

```bash
node scripts/version-manager.js upgrade --to 1.1.0 --create-branch
```

Shows:

```
═══════════════════════════════════════════════════════════════
Workflow Upgrade
═══════════════════════════════════════════════════════════════

Current Version: 1.0.0
Target Version:  1.1.0

Migration Plan:
─────────────────────────────────────────────────────────────
1.0.0 → 1.1.0
  Add commit reference options and fix workflow bugs

Creating upgrade branch...

✓ On branch: upgrade/linear-workflow-v1.1.0

Starting upgrade...

Executing migrations...

Migrating 1.0.0 → 1.1.0
  Add commit reference options and fix workflow bugs

  ✨ Adding commit reference configuration...
     → Set to: Related: DEV-XXX (recommended)
     → You can change this in .linear-workflow.json

  ✨ Adding Linear automation detection...
     → Checking for magic word automations
     → Status: Not enabled (safe to use Closes/Fixes)

  ✨ Adding GitHub Actions configuration...
     → Detected: GitHub Actions workflow installed
     → Status: Enabled

  🐛 Checking workflow file for syntax errors...
     → Found branches syntax error at line 10
     → Fixing: Replacing with branches-ignore pattern
     → ✓ Workflow file fixed

  ✓ Migration completed

✓ Backup created: .linear-workflow.json.backup
✓ Configuration updated: .linear-workflow.json
✓ Workflow file fixed: .github/workflows/linear-status-update.yml

Committing upgrade changes...

✓ Changes committed
✓ Branch pushed to remote

Pushing upgrade/linear-workflow-v1.1.0 to remote...

═══════════════════════════════════════════════════════════════
✅ Upgrade Complete!
═══════════════════════════════════════════════════════════════

Upgraded from 1.0.0 to 1.1.0

Branch Details:
  Branch: upgrade/linear-workflow-v1.1.0
  Remote: origin/upgrade/linear-workflow-v1.1.0

Next steps:
  1. Review changes: git diff main
  2. Test workflow: node scripts/test-integration.js
  3. Create PR:

     gh pr create --base main --head upgrade/linear-workflow-v1.1.0 \
       --title "chore: Upgrade Linear workflow to v1.1.0" \
       --body "Upgrades Linear workflow from 1.0.0 to 1.1.0

1.0.0 → 1.1.0: Add commit reference options and fix workflow bugs
  • ✨ New: Commit message reference options (Related/Closes/Fixes)
  • ✨ New: Linear magic word automation detection and conflict warnings
  • ✨ New: GitHub Actions is now optional (MCP-first approach)
  • 🐛 Fix: GitHub Actions workflow branches syntax error
  • 🔧 Improved: MCP-first authentication flow (no API key required for setup)
  • 📝 Improved: Better documentation of Linear native integration vs workflow"

  4. Merge when ready!
```

**Upgrade Flow Summary:**

The `--create-branch` flag automates:
1. ✓ Creates `upgrade/linear-workflow-v1.1.0` branch
2. ✓ Runs all migrations and updates files
3. ✓ Commits changes with detailed changelog
4. ✓ Pushes branch to remote
5. ✓ Provides PR creation command

This follows the same safe pattern as initial installation - team reviews changes before activating.

Then exit wizard - upgrade is complete!

**Option 3: Reinstall Everything**

```
⚠️  WARNING: Complete Reinstallation

This will:
  ✓ Backup all existing workflow files
  ✓ Delete current installation
  ✓ Run fresh installation wizard
  ✓ You'll need to reconfigure everything

This is typically used when:
  - Workflow is broken or corrupted
  - You want to start completely fresh
  - Migration failed

Are you sure? (y/N)
```

If yes:
1. Backup existing files
2. Delete `.linear-workflow.json`, `.mcp.json`, workflow files
3. Continue to Phase 2 (fresh installation)

**Option 4: Cancel**

```
Installation cancelled. No changes made.
```

Exit wizard.

**IMPORTANT:** Always detect existing installations before starting setup. This prevents:
- Accidental overwriting of custom configurations
- Breaking working workflows
- User confusion about versions

**NOTE:** Project location is now confirmed at the very beginning (before showing installation plan). This ensures users know where things will be installed before committing to the setup process.

### Phase 2: Create Installation Branch

**[Step 2 of 12 | Interactive | ~10 seconds]**

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [██________] 2/12 steps complete

Completed:
  ✓ Confirm project location

Current:
  ⟳ Create installation branch

Remaining:
  • Run pre-flight environment checks
  • Initialize Claude Code in project
  • Authenticate with Linear via MCP
  • Configure workflow settings
  • Set up branch strategy and status mappings
  • Configure commit and PR formats
  • Install workflow files and documentation
  • Set up git hooks
  • Create Linear issue templates
  • Create test issue
  • Test the workflow
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**IMPORTANT:** Before making any changes, create a new branch for the installation.

**Ask the user:**

```
For safety, I'll install the workflow on a new branch.

You can review all changes before merging to your main branch.

Branch name [setup/linear-workflow]:
```

**Create the branch with clear progress:**

```bash
echo "Creating installation branch..."

cd "/path/to/project" && \
  git checkout -b setup/linear-workflow && \
  echo "✓ Created branch: setup/linear-workflow"
```

**If branch already exists:**
```
⚠️  Branch 'setup/linear-workflow' already exists.

Options:
1. Use existing branch (will overwrite)
2. Choose different name
3. Install directly on current branch (not recommended)

Your choice [1]:
```

**Mark TODO as completed after branch created.**

### Phase 3: Pre-Flight Checks (AUTOMATIC)

**[Step 3 of 12 | Automatic | ~30 seconds]**

**CRITICAL:** When the user triggers "Setup Linear workflow", AUTOMATICALLY run pre-flight checks FIRST.

This prevents installation failures by catching issues upfront and fixing them automatically.

**Why Pre-Flight Checks Matter:**
- Catches ~95% of common setup issues before installation begins
- Prevents failures at the final git push step (most common error)
- Validates GitHub `workflow` scope (required to push `.github/workflows/` files)
- Reduces average time to resolution from 15-30 minutes to 2-5 minutes

**Mark TODO as in_progress, then run checks, then mark as completed.**

**Show progress and clear descriptions before each check:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [███_______] 3/12 steps complete

Running pre-flight environment checks...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Run these checks automatically (batched to minimize approval prompts):**

```bash
# Display what we're checking
echo "Verifying project directory..."
echo "Checking git repository status..."
echo "Validating GitHub access..."
echo "Confirming tool installations..."
echo ""

# Batch 1: All environment checks in target directory (one approval)
cd "/path/to/project" && \
  echo "=== DIRECTORY ===" && pwd && \
  echo "=== GIT REPO ===" && git rev-parse --git-dir 2>/dev/null && \
  echo "=== GIT STATUS ===" && git status --porcelain && \
  echo "=== GIT REMOTES ===" && git remote -v && \
  echo "=== EXISTING WORKFLOW ===" && (test -f .linear-workflow.json && cat .linear-workflow.json || echo "No existing workflow") && \
  echo "=== GITHUB REPO ===" && gh repo view --json nameWithOwner,isPrivate 2>&1 && \
  echo "=== BRANCH PROTECTION ===" && gh api repos/:owner/:repo/branches/main/protection --jq '.required_status_checks.checks[]?.context' 2>&1 || echo "No protection"

# Batch 2: Global tool checks (one approval)
echo "=== GITHUB CLI ===" && gh --version && \
  echo "=== GITHUB AUTH ===" && gh auth status 2>&1 && \
  echo "=== NODE VERSION ===" && node --version
```

**Note:** By batching read-only commands, users only approve 2 times instead of 8-10 times during pre-flight checks.

**Display results with clear status:**
```
🔍 Pre-Flight Checks

Checking git repository... ✓
  Location: /path/to/project/.git

Checking GitHub CLI... ✓
  gh version 2.40.0

Checking GitHub authentication... ✓
  User: username
  Scopes: repo ✓
  Note: 'workflow' scope only needed if enabling GitHub Actions (optional)

Checking GitHub repository... ✓
  Repository: owner/repo-name
  🔒 Private repository

Checking Node.js... ✓
  Version: v18.17.0

Checking working directory... ✓
  Clean

Checking for existing workflow... ✓
  No existing workflow (clean install)

Checking branch protection rules... ⚠
  Checking main branch protection...
  Checking if GitHub Actions can run...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All checks passed!

Your environment is ready for Linear workflow setup.

Note: Linear authentication will happen via MCP OAuth (next step)
```

**If critical checks fail, AUTOMATICALLY OFFER TO FIX:**

**Example: Missing workflow scope - AUTO-FIX FLOW**

When workflow scope is missing, AUTOMATICALLY offer to fix it:

```
Checking GitHub authentication... ⚠

⚠️  Missing 'workflow' scope

You're logged in as: username

The 'workflow' scope is required to:
  - Create/update GitHub Actions workflow files
  - Push .github/workflows/* files to repository

I can fix this for you right now.

Would you like me to refresh your GitHub authentication? (Y/n)
```

**If user says yes (default), AUTOMATICALLY run:**

```bash
gh auth refresh --scopes workflow --hostname github.com
```

This will output a device code and URL. **Display it clearly to the user:**

```
🔐 GitHub Authentication Required

Step 1: Copy this one-time code:
  XXXX-XXXX

Step 2: Open this URL in your browser:
  https://github.com/login/device

Step 3: Enter the code and authorize the 'workflow' scope

Waiting for authorization...
```

**IMPORTANT: Automatically poll the background process to detect completion:**

While waiting, use the BashOutput tool every 5-10 seconds to check if the process completed:

```bash
# Poll the background bash process
BashOutput(bash_id=<id>)
```

When status shows "completed" with exit_code 0, AUTOMATICALLY continue without requiring user input.

**After detecting completion, verify the scope was added:**

```bash
# Check if workflow scope is now present
gh auth status 2>&1 | grep -i "workflow"
```

**If successful:**
```
✅ Authentication updated successfully!
   Scopes: repo, workflow ✓

Continuing with setup...
```

**If failed:**
```
❌ Authentication failed or was cancelled

Please try again or authenticate manually:
  gh auth refresh --scopes workflow

Then restart: "Setup Linear workflow"
```

**Example: Not authenticated - AUTO-FIX FLOW**

When not authenticated at all, AUTOMATICALLY offer to fix:

```
Checking GitHub authentication... ✗

❌ Not authenticated to GitHub

You need to log in to GitHub to:
  - Configure repository secrets
  - Enable GitHub Actions workflows

I can start the authentication process for you.

Would you like me to authenticate you now? (Y/n)
```

**If user says yes (default), AUTOMATICALLY run:**

```bash
gh auth login --scopes workflow --hostname github.com
```

Display the device code flow and wait for completion, then verify and continue.

---

**Blockers vs Warnings:**
- **BLOCKERS (must auto-fix):** No gh auth, missing workflow scope
- **BLOCKERS (must guide):** No git, no gh CLI, no repo access
- **WARNINGS (can continue):** No Node.js, dirty working directory, branch protection issues

**For auth BLOCKERS:** Automatically offer to fix them inline. Do not proceed until resolved.
**For install BLOCKERS:** Guide user to install, then retry checks.
**For WARNINGS:** Display but allow user to continue.

---

**Example: Branch Protection Warning - INFORMATIONAL FLOW**

When branch protection is detected, INFORM the user about potential workflow behavior:

```
Checking branch protection rules... ⚠

⚠️  Branch Protection Detected

Your main branch has protection rules configured:
  • Required status checks: 2
  • Required approvals: 1
  • Restrict pushes: Yes

Impact on Linear Workflow:
  ✓ GitHub Actions will run normally
  ⚠  Workflow requires approval before merge
  ⚠  Status updates happen AFTER merge (not on PR open)

This means:
  • PRs to main will need approval before merging
  • Linear status updates when PR merges (not when opened)
  • Workflow will work correctly, just with approval gate

This is normal and recommended for protected branches!
```

**If no branch protection found:**
```
Checking branch protection rules... ✓
  No branch protection on main branch
  GitHub Actions workflow will run without restrictions
```

**If branch protection blocks GitHub Actions:**
```
Checking branch protection rules... ❌

⚠️  CRITICAL: GitHub Actions Blocked

Your branch protection rules may prevent GitHub Actions from running:
  • Branch requires status checks to pass
  • But no status checks are configured
  • Workflow: "linear-status-update" is not in required checks

This will cause the Linear workflow to fail!

To fix, add the workflow to required status checks:

Option 1: Via GitHub UI (Recommended)
  1. Go to: https://github.com/{{owner}}/{{repo}}/settings/branches
  2. Edit protection rules for 'main' branch
  3. Under "Require status checks", add:
     • "linear-status-update"
  4. Save changes

Option 2: Via GitHub CLI
  gh api repos/{{owner}}/{{repo}}/branches/main/protection \
    --method PUT \
    -f required_status_checks='{"strict":true,"checks":[{"context":"linear-status-update"}]}'

Option 3: Continue setup, fix later
  (Workflow will be installed but may not trigger until fixed)

Would you like to:
1. Open GitHub settings in browser (then continue after fix)
2. Continue setup (fix manually later)
3. Cancel setup

Your choice [1]: _____
```

**If user chooses 1:**
```bash
# Open browser to branch protection settings
gh repo view --web --branch main
```

Then wait for user confirmation:
```
After configuring branch protection, say "done" or "ready" to continue.
```

**If user chooses 2 (continue):**
```
⚠️  Continuing with setup

The workflow will be installed, but you'll need to configure branch
protection before it can run properly.

Reminder saved to installation summary.
```

---

**CRITICAL: Make the flow seamless - "Click, Click, Boom"**
- Don't make users run commands manually
- Don't make them restart the wizard
- Fix auth issues inline and continue automatically
- One continuous flow from start to finish

### Phase 4: Initialize Claude Code in Target Project

**[Step 4 of 12 | Automatic | ~10 seconds]**

**CRITICAL:** Initialize Claude Code in the target project to provide project-specific context, custom commands, and team onboarding documentation.

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [████______] 4/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks

Current:
  ⟳ Initialize Claude Code in project

Remaining:
  • Authenticate with Linear via MCP
  • Configure workflow settings
  • Set up branch strategy and status mappings
  • Configure commit and PR formats
  • Install workflow files and documentation
  • Set up git hooks
  • Create Linear issue templates
  • Create test issue
  • Optionally configure GitHub Actions
  • Test the workflow
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Check if Claude Code is already initialized:**

```bash
# Check if .claude directory exists
test -d .claude && echo "Claude Code already initialized" || echo "Claude Code not initialized"
```

**If already initialized:**

```
✓ Claude Code already initialized

Found existing .claude/ directory

Options:
1. Keep existing setup (recommended if you have custom commands)
2. Merge workflow documentation with existing setup
3. Overwrite with workflow configuration

Your choice [1]: _____
```

**If user chooses 1 (keep existing):**
- Skip Claude Code initialization
- Continue to next phase

**If user chooses 2 (merge):**
- Add workflow documentation to existing CLAUDE.md
- Add workflow-specific commands to .claude/commands/
- Keep existing configuration

**If user chooses 3 (overwrite):**
- Backup existing .claude/ to .claude.backup/
- Proceed with full initialization

**If NOT initialized, create Claude Code structure:**

```
Initializing Claude Code in project...

[1/4] Creating .claude directory structure...
      ✓ .claude/ created
      ✓ .claude/commands/ created

[2/4] Creating project instructions (CLAUDE.md)...
      ✓ CLAUDE.md created

[3/4] Adding workflow custom commands...
      ✓ .claude/commands/create-linear-issue.md created
      ✓ .claude/commands/bug-linear.md created
      ✓ .claude/commands/improvement-linear.md created
      ✓ .claude/commands/feature-linear.md created
      ✓ .claude/commands/get-feedback-linear.md created
      ✓ .claude/commands/pause-linear.md created
      ✓ .claude/commands/my-work-linear.md created
      ✓ .claude/commands/start-issue.md created
      ✓ .claude/commands/create-pr.md created
      ✓ .claude/commands/progress-update.md created

[4/4] Updating .gitignore...
      ✓ .gitignore updated (if needed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Claude Code initialized!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Created:
  • .claude/commands/ - Custom workflow commands
  • CLAUDE.md - Project instructions for Claude

Custom commands available after setup:

  Issue Creation:
  • /bug-linear - Quick bug report creation
  • /improvement-linear - Quick improvement issue creation
  • /feature-linear - Quick feature request creation
  • /create-linear-issue - Create any issue with template selection

  Workflow & Status:
  • /start-issue - Start work on an existing issue
  • /get-feedback-linear - Request feedback and mark as needs clarification
  • /pause-linear - Pause work and safely commit WIP
  • /my-work-linear - Show your active/paused/blocked issues
  • /create-pr - Create pull request with Linear integration
  • /progress-update - Post progress update to Linear

These commands will work for all team members using Claude Code!
```

**CLAUDE.md Template Content:**

Create `CLAUDE.md` in the project root with workflow-specific instructions:

```markdown
# {{project.name}} - Claude Code Instructions

This project uses the Linear + GitHub + Claude Code workflow integration.

## Linear Workflow

This project uses Linear for issue tracking with automated GitHub integration.

### Team Configuration

- **Linear Team**: {{linear.teamName}} ({{linear.teamKey}})
- **Workspace**: {{linear.workspaceName}}
- **Issue Pattern**: `{{formats.issuePattern}}`

### Workflow Statuses

{{#each linear.statuses}}
- **{{name}}**: {{meaning}}
  - Trigger: {{trigger}}
  {{#if gitEvent}}- Git Event: {{gitEvent}}{{/if}}
{{/each}}

### Branch Strategy

- **Main Branch**: `{{branches.main}}`
{{#if branches.staging}}- **Staging Branch**: `{{branches.staging}}`{{/if}}
{{#if branches.prod}}- **Production Branch**: `{{branches.prod}}`{{/if}}

### Commit Message Format

All commits must reference a Linear issue:

**Format**: `{{formats.issueReferenceKeyword}}: {{formats.issueExample}}`

**Examples**:
```
feat: Add user authentication ({{formats.issueReferenceKeyword}}: {{formats.issueExample}})
{{formats.issueReferenceKeyword}}: {{formats.issueExample}} - Fix login bug
fix({{formats.issueExample}}): Resolve timeout issue
```

### Working with Linear Issues

#### Creating a Linear Issue (Bottom-Up Workflow)

**When**: You want to add a new feature, fix a bug, or work on something not yet in Linear

**Trigger**: When you mention adding a new feature without referencing an existing issue

**Examples**:
- "Let's add user authentication"
- "I want to build a CSV export feature"
- "We need to fix the mobile layout"

**What happens**:

If Claude detects you're starting new work without a Linear issue reference, Claude will ask:

```
Would you like to create a Linear issue for this? (Y/n)
```

**If you say yes**:

1. **Template Selection** - Claude shows available Linear templates:
   ```
   Which template would you like to use?
   1. Bug Report
   2. Improvement
   3. Feature
   4. [Custom template names if you added more]
   ```

2. **Context Gathering** - Claude asks:
   ```
   Would you like to add context, or should I draft the issue?

   Options:
   1. I'll provide context (you describe the feature/bug)
   2. Draft it for me (Claude creates comprehensive description)
   ```

3. **Issue Creation** - Claude creates the Linear issue with:
   - Title based on your description
   - Template structure (description, acceptance criteria, etc.)
   - Your context or Claude's detailed analysis
   - Appropriate status (usually "To Do")

4. **Immediate Workflow** - Claude asks:
   ```
   Issue created: {{formats.issueExample}}

   Ready to start work on this issue? (Y/n)
   ```

5. **If you're ready** - Claude follows the normal workflow:
   - Fetch issue details
   - Create task analysis
   - Post analysis to Linear
   - Create feature branch
   - Make initial commit

**Benefits**:
- Stay in the terminal - no need to open Linear web app
- Quick issue creation for small features/bugs that don't need design docs
- Immediate transition from "idea" to "working on it"
- All context captured in Linear for team visibility

**Example Flow**:
```
You: "Let's add CSV export to the reports page"

Claude: "Would you like to create a Linear issue for this? (Y/n)"

You: "y"

Claude: "Which template? 1. Bug Report, 2. Improvement, 3. Feature"

You: "3"

Claude: "Should I draft it, or would you like to add context? (1. I'll provide, 2. Draft it)"

You: "2"

Claude: [Creates issue DEV-456 with comprehensive feature description]
        "Issue created: DEV-456 - Add CSV export to reports"
        "Ready to start work? (Y/n)"

You: "y"

Claude: [Follows normal workflow - analysis, branch, commit]
```

#### Starting Work (Existing Issue)

**Command**: `/start-issue` or say "Let's get to work on {{formats.issueExample}}"

**When**: You already have a Linear issue and want to start working on it

This will:
1. Fetch issue details from Linear
2. Create task analysis document
3. Post analysis summary to Linear
4. Create feature branch
5. Make initial commit

#### Creating Pull Requests

**Command**: `/create-pr` or say "Ready for review"

This will:
1. Create PR with proper title format
2. Post PR summary to Linear
3. Update issue status automatically

#### Progress Updates

**Command**: `/progress-update` or say "Add progress update"

This will:
1. Analyze recent commits
2. Check acceptance criteria
3. Post structured update to Linear

### Custom Commands

**Issue Creation:**
- `/bug-linear` - Quick bug report (auto-uses Bug template)
- `/improvement-linear` - Quick improvement (auto-uses Improvement template)
- `/feature-linear` - Quick feature request (auto-uses Feature template)
- `/create-linear-issue` - Create any issue with template selection

**Workflow & Status:**
- `/start-issue` - Start work on an existing issue
- `/get-feedback-linear` - Request feedback and mark as needs clarification
- `/pause-linear` - Pause work and commit WIP safely
- `/my-work-linear` - Show your active/paused/blocked issues

**Progress & Delivery:**
- `/create-pr` - Create pull request with Linear integration
- `/progress-update` - Post progress update to Linear

See `.claude/commands/` for full command definitions and examples.

### Team Guidelines

{{#if autoAssignment.enabled}}
#### Auto-Assignment

Issues are automatically assigned based on workflow stage:

{{#each autoAssignment.statusMappings}}
- **{{status}}** → {{assignee.name}} ({{assignee.email}})
{{/each}}

{{#if autoAssignment.preserveOriginal}}
Original assignees are preserved alongside new assignees.
{{/if}}
{{/if}}

### Documentation

- **Workflow Guide**: `docs/linear-workflow.md`
- **Issue Analysis**: `{{paths.issues}}`
- **Configuration**: `.linear-workflow.json`

### GitHub Actions

{{#if githubActions.enabled}}
✓ GitHub Actions enabled - Issues update automatically on PR merge

**Workflow**: `.github/workflows/linear-status-update.yml`

Status updates happen when:
- PR merged to `{{branches.main}}` → "{{linear.statuses.review}}"
{{#if branches.staging}}- PR merged to `{{branches.staging}}` → "{{linear.statuses.staging}}"{{/if}}
{{#if branches.prod}}- PR merged to `{{branches.prod}}` → "{{linear.statuses.done}}"{{/if}}
{{else}}
ℹ️  GitHub Actions not enabled - Use Claude Code commands for status updates
{{/if}}

### Getting Help

For workflow issues or questions:
1. Check `docs/linear-workflow.md` for detailed usage
2. Ask Claude: "How do I use the Linear workflow?"
3. Review `.linear-workflow.json` for configuration

---

Generated with [Claude Code](https://claude.com/claude-code)
```

**Custom Command Templates:**

**`.claude/commands/create-linear-issue.md`:**
```markdown
Create a new Linear issue and optionally start work immediately.

Usage:
  /create-linear-issue
  /create-linear-issue <brief description>

This command will:
1. Ask if you want to create a Linear issue (if not explicitly requested)
2. Show available Linear templates (Bug, Improvement, Feature, etc.)
3. Let you provide context or have Claude draft the issue
4. Create the issue in Linear with appropriate template structure
5. Optionally start work immediately (follows /start-issue workflow)

Benefits:
- Stay in terminal - no need to open Linear web app
- Quick issue creation for discoveries during development
- Immediate transition from idea to working on it
- All context captured in Linear for team visibility

Example:
  /create-linear-issue Add CSV export to reports

  Claude: "Which template? 1. Bug, 2. Improvement, 3. Feature"
  You: "3"

  Claude: "Should I draft it? (1. You provide, 2. I'll draft)"
  You: "2"

  Claude: [Creates {{formats.issueExample}} with comprehensive description]
          "Ready to start work? (Y/n)"
```

**`.claude/commands/bug-linear.md`:**
```markdown
Create a bug report in Linear (auto-uses Bug template).

Usage:
  /bug-linear
  /bug-linear <brief description>

Quick shortcut for bug reports - skips template selection.

Example:
  /bug-linear Login timeout is too short

  Claude: "Should I draft the bug report? (1. You provide, 2. I'll draft)"
  You: "2"

  Claude: [Creates comprehensive bug report with steps to reproduce]
          "Bug created: {{formats.issueExample}} - Login timeout too short"
          "Ready to start fixing? (Y/n)"
```

**`.claude/commands/improvement-linear.md`:**
```markdown
Create an improvement issue in Linear (auto-uses Improvement template).

Usage:
  /improvement-linear
  /improvement-linear <brief description>

Quick shortcut for improvements/enhancements - skips template selection.

Example:
  /improvement-linear Optimize database queries in reports

  Claude: "Should I draft the improvement? (1. You provide, 2. I'll draft)"
  You: "2"

  Claude: [Creates improvement with current vs proposed behavior]
          "Improvement created: {{formats.issueExample}} - Optimize queries"
          "Ready to start? (Y/n)"
```

**`.claude/commands/feature-linear.md`:**
```markdown
Create a feature request in Linear (auto-uses Feature template).

Usage:
  /feature-linear
  /feature-linear <brief description>

Quick shortcut for new features - skips template selection.

Example:
  /feature-linear Add user profile page

  Claude: "Should I draft the feature? (1. You provide, 2. I'll draft)"
  You: "2"

  Claude: [Creates feature with user story and acceptance criteria]
          "Feature created: {{formats.issueExample}} - User profile page"
          "Ready to start building? (Y/n)"
```

**`.claude/commands/start-issue.md`:**
```markdown
Start work on an existing Linear issue.

Usage:
  /start-issue {{formats.issueExample}}
  /start-issue

If no issue ID provided, you'll be prompted to enter one.

This command will:
1. Fetch issue details from Linear (via MCP)
2. Create comprehensive task analysis document
3. Post analysis summary as Linear comment
4. Create feature branch: feature/{{formats.issueExample}}-description
5. Make initial commit with issue reference
6. Update issue status to "{{linear.statuses.inProgress}}"

Example:
  /start-issue {{formats.issueExample}}
```

**`.claude/commands/create-pr.md`:**
```markdown
Create a pull request with Linear integration.

Usage:
  /create-pr
  /create-pr {{formats.issueExample}}

This command will:
1. Commit any pending changes
2. Push feature branch to origin
3. Create PR with proper title format: "{{formats.issueExample}}: Description"
4. Post PR summary to Linear issue
5. Status updates via GitHub Actions (if enabled)

The PR will include:
- Summary of changes
- Link to Linear issue
- Testing notes
- Review checklist

Example:
  /create-pr
```

**`.claude/commands/progress-update.md`:**
```markdown
Post a progress update to Linear.

Usage:
  /progress-update
  /progress-update {{formats.issueExample}}

This command will:
1. Analyze recent commits since last update
2. Check current file changes
3. Review acceptance criteria progress
4. Generate structured update
5. Post to Linear issue as comment

Update includes:
- Completed items
- Current work in progress
- Next steps
- Any blockers

Example:
  /progress-update
```

**Mark TODO as completed after initialization.**

### Phase 5: Linear MCP Authentication (MCP-FIRST!)

**[Step 5 of 12 | Interactive | Requires Browser | ~1-2 minutes]**

**CRITICAL:** This is the first step that requires Linear access. We authenticate via MCP BEFORE asking configuration questions, so we can use MCP tools to fetch teams, statuses, and other Linear data during configuration.

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [█████_____] 5/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks
  ✓ Initialize Claude Code in project

Current:
  ⟳ Authenticate with Linear via MCP

Remaining:
  • Configure workflow settings
  • Set up branch strategy and status mappings
  • Configure commit and PR formats
  • Install workflow files and documentation
  • Set up git hooks
  • Create Linear issue templates
  • Create test issue
  • Optionally configure GitHub Actions
  • Test the workflow
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Explain what's about to happen:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Linear Authentication via MCP

⏱️  Estimated time: 1-2 minutes
🌐 Requires: Browser authentication with Linear (OAuth)
🔑 No API key needed!

What will happen:
  1. I'll add the Linear MCP server to your Claude config (~5 seconds)
  2. You'll type /mcp to start OAuth authentication (~10 seconds)
  3. Your browser will open to Linear login page (~30 seconds)
  4. You'll authorize Claude Code access (~20 seconds)
  5. I'll verify the connection (~10 seconds)

Why this is first:
  ✓ No LINEAR_API_KEY required
  ✓ OAuth is secure (you control access)
  ✓ I can fetch your teams/statuses during configuration
  ✓ All workflow commands work immediately after setup

Ready to authenticate with Linear? (Y/n)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**After user confirms, proceed with MCP setup:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Setting up Linear MCP Server...

[1/2] Adding Linear MCP server to your configuration...
```

**Run the command:**

```bash
claude mcp add --transport http linear-server https://mcp.linear.app/mcp
```

**Display result:**

```
✓ Added HTTP MCP server linear-server
  URL: https://mcp.linear.app/mcp
  Config: ~/.claude.json

[2/2] Authentication Required (Browser)

⏱️  This step requires ~1 minute of your time

⚠️  IMPORTANT: Claude Code must be restarted to load the new MCP configuration.

Please follow these steps:

  1. Exit Claude Code (Ctrl+C or type 'exit')
  2. Open a NEW terminal in your project directory:
     {{project.path}}
  3. Start Claude Code again in that directory
  4. Type: /mcp

When you run /mcp, it will:
  1. Open a browser window
  2. Prompt you to log in to Linear
  3. Ask you to grant Claude Code access to your Linear workspace

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Note: Your installation progress is saved on the setup/linear-workflow branch.
After authenticating with /mcp in your new terminal, return here and say "done"
or "authenticated" to continue the setup.
```

**Wait for user to:**
1. Exit current Claude Code session
2. Open new terminal in project directory
3. Start Claude Code in that directory
4. Type `/mcp` in the new Claude Code session
5. Complete OAuth authentication in browser
6. Return to this setup and confirm they're authenticated by saying "done" or "authenticated"

**When user confirms authentication, verify it worked:**

```
✅ MCP Server Authentication Complete!

[3/3] Verifying connection... (this will take ~10 seconds)
```

**Test the connection by attempting to use a Linear MCP tool (e.g., list teams):**

If successful:
```
✓ Linear MCP server connected successfully
✓ Can access workspace: {{workspaceName}}
✓ Found {{teamCount}} accessible teams

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ MCP Authentication Complete! (Step 4 of 11 complete)

Total time: ~{{actual_time}} (estimated: 1-2 minutes)

You can now use Linear workflow commands like:
  • "Let's get to work on DEV-123"
  • "Create a blocker for this"
  • "Ready for review"

Now I can fetch your Linear teams and statuses for configuration...
```

If failed:
```
❌ MCP authentication failed or incomplete

Please ensure you:
  1. Ran /mcp command in Claude Code
  2. Completed OAuth flow in your browser
  3. Granted all required permissions to Linear workspace

Common issues:
  • Browser was closed before completing OAuth
  • Linear permissions were declined
  • Network connectivity issue during authentication

Try again? (Y/n)

If you continue to have issues:
  • Check https://linear.app/settings/api to verify API access
  • Try: claude mcp remove linear-server
  • Then restart from this phase
```

**Mark TODO as completed after MCP authentication successful.**

### Phase 6: Configuration Wizard

**[Step 6 of 12 | Interactive | ~2-5 minutes]**

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [██████____] 6/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks
  ✓ Initialize Claude Code in project
  ✓ Authenticate with Linear via MCP

Current:
  ⟳ Configure workflow settings

Remaining:
  • Set up branch strategy and status mappings
  • Configure commit and PR formats
  • Install workflow files and documentation
  • Set up git hooks
  • Create Linear issue templates
  • Create test issue
  • Test the workflow
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Ask the user these questions **one at a time**, storing answers in memory.

**IMPORTANT:** Now that MCP is authenticated, use MCP tools to fetch Linear data instead of requiring LINEAR_API_KEY!

#### Question 0: Configuration Profile (NEW!)

**FIRST QUESTION - Offer preset profiles for quick setup:**

```
Choose your workflow configuration:

🚀 1. Startup
   Move fast, ship faster - minimal overhead

   Best for:
   • Solo developers or small startups (1-3 developers)
   • Rapid prototyping and MVP development
   • Minimal process overhead

   Workflow:
   • Branches: main only
   • Statuses: In Progress → Done
   • Review: Optional
   • Setup time: ~2 minutes

👥 2. Small Team [Recommended]
   Balanced velocity with code review process

   Best for:
   • Small teams (3-10 developers)
   • Startups with QA process
   • Projects requiring code review

   Workflow:
   • Branches: main + staging
   • Statuses: In Progress → Code Review → QA Testing → Done
   • Review: Required
   • Setup time: ~4 minutes

🏢 3. Enterprise
   Full pipeline control with multiple environments

   Best for:
   • Large teams (10+ developers)
   • Enterprise organizations
   • Regulated industries

   Workflow:
   • Branches: main + staging + production
   • Statuses: In Progress → Code Review → QA → Deployed
   • Review: Required + approvals
   • Setup time: ~6 minutes

⚙️  4. Custom
   Full control - configure everything manually

   Best for:
   • Unique workflows
   • Specific requirements
   • Advanced users

   Workflow: You decide
   Setup time: ~10 minutes

Your choice [2]: _____
```

**Store the selected profile for later use.**

**If user selects 1, 2, or 3 (preset profile):**

```
✓ Profile selected: {{Profile Name}}

I'll use these defaults and ask you to customize key settings:
  • Linear team and workspace (required)
  • Team member assignments (if applicable)
  • Issue ID pattern (optional - can use defaults)

This will save you time by pre-configuring:
  • Branch strategy
  • Status mappings
  • Commit/PR formats
  • Detail levels

Let's get started!
```

Then **skip** or **pre-fill** questions based on profile:
- Question 2 (Branch Strategy) → Pre-filled from profile, skip
- Question 4 (Commit & PR Formats) → Pre-filled from profile, skip
- Question 5 (Update Detail Level) → Pre-filled from profile, skip
- Question 6 (Documentation Location) → Pre-filled from profile, skip

**Only ask:**
- Question 1: GitHub Actions (optional automation - always ask)
- Question 3: Linear Team Configuration (always ask - customize team/statuses via MCP)
- Question 7: Auto-Assignment (always ask - customize assignees)

**If user selects 4 (Custom):**

```
✓ Custom configuration selected

I'll guide you through all configuration options step by step.
This gives you complete control over your workflow.

Let's start!
```

Then ask **all questions** (Question 1-7).

---

#### Question 1: GitHub Actions (Optional Automation)

**IMPORTANT:** This is now OPTIONAL! The workflow works fully via Claude Code commands without GitHub Actions.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GitHub Actions Automation (Optional)

The Linear workflow is fully functional via Claude Code commands.

Want to add AUTOMATIC status updates when PRs merge?

This requires a LINEAR_API_KEY (stored in GitHub secrets).

✅ Benefits:
  ✓ Status auto-updates when PR merges (no manual updates)
  ✓ Works without Claude running
  ✓ Full team automation

⚠️  Requirements:
  • Linear API key creation permission
  • GitHub repository admin access

💡 Note: Some organizations restrict API key creation.
   If you can't create API keys, you can skip this - the workflow
   still works fully via Claude Code commands!

Would you like to enable GitHub Actions automation? (y/N)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If user says YES:**

```
Great! I'll need a Linear API key to set up GitHub Actions.

Please create an API key at: https://linear.app/settings/api

LINEAR_API_KEY: _____
```

**Validate the API key immediately:**

```bash
# Test API key works
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { id name email } }"}'
```

**If valid:**

```
✓ API key validated
✓ User: <name> (<email>)

I'll store this in GitHub repository secrets during installation.

GitHub Actions workflow will be installed and configured.
```

**If invalid:**

```
❌ API key validation failed

Please check:
  • API key format is correct (starts with lin_api_)
  • API key hasn't been revoked
  • You have access to the Linear workspace

Try again? (Y/n)
```

**If user says NO:**

```
✓ Skipping GitHub Actions automation

The workflow will work fully via Claude Code commands:
  • "Let's get to work on DEV-123"
  • "Ready for review"
  • "Create blocker"
  • And more...

GitHub Actions workflow will NOT be installed.

You can add it later by:
  1. Creating a LINEAR_API_KEY
  2. Adding it to GitHub secrets
  3. Installing .github/workflows/linear-status-update.yml

Continuing with setup...
```

**Store decision in config:**
```json
{
  "githubActions": {
    "enabled": true/false,
    "apiKeyConfigured": true/false
  }
}
```

#### Question 2: Branch Strategy
```
What branch names does your team use?

1. Simple (main only)
2. Standard (main + staging)
3. Enterprise (main + staging + prod)
4. Custom

Your choice [2]: _____
```

If custom:
```
Primary development branch [main]: _____
Staging/QA branch (leave empty if none): _____
Production branch (leave empty if none): _____
```

#### Question 3: Linear Team Configuration

**IMPORTANT:** Use MCP tools to fetch this data - no API key needed!

```
Fetching your Linear teams via MCP...
```

**Use MCP list_teams tool to fetch teams:**

```
✓ Connected to Linear workspace: <Workspace Name>

Available teams:
1. DEV - Development
2. ENG - Engineering
3. PRODUCT - Product Team

Which team should we configure? [1]: _____
```

**After team selected, use MCP get_team_states tool to fetch workflow states:**

```
✓ Team "DEV" selected

Fetching workflow states...

Available workflow states:
1. Todo
2. In Progress
3. In Review
4. Review Required
5. QA
6. Done
7. Canceled

Which status for active development (push to feature branch)? [2]: _____
Which status when PR merged to main? [4]: _____
Which status when PR merged to prod? [6]: _____
```

**Store team information:**
```json
{
  "linear": {
    "teamKey": "DEV",
    "teamId": "team-uuid-from-mcp",
    "teamName": "Development",
    "workspaceId": "workspace-uuid-from-mcp",
    "workspaceName": "Acme Inc"
  }
}
```

#### Question 3.5: Define Status Meanings (NEW!)

**After fetching workflow states, help the user define what each status means in their workflow.**

This context helps Claude understand when to update statuses during development and validates that status mappings make sense.

```
Let's define what each status means in your workflow.

This helps me understand when to update statuses automatically and
ensures your workflow mappings make sense.

For each status, I'll ask:
  • What this status represents
  • When issues should move to this status
  • Whether it's automated or manual

This takes ~2 minutes but makes the workflow much smarter.

Continue? [Y/n]: _____
```

**For each status in the team's workflow, ask these two questions:**

```
Status: {{Status Name}} (currently: {{count}} issues)

1. What does "{{Status Name}}" mean in your workflow?

   Common examples:
   • "Low priority / nice to have features"
   • "New issues, not yet analyzed"
   • "Analyzed and ready to start work"
   • "Actively working, branch checked out"
   • "Waiting for code review"
   • "Deployed to production"

   Your definition: _____

2. When does an issue move to "{{Status Name}}"?

   Common examples:
   • "When issue is created"
   • "After Claude completes analysis with no blockers"
   • "When developer pushes to feature branch"
   • "When PR is merged"
   • "After manual approval"

   Your trigger: _____
```

**Store both the meaning and trigger for each status.**

**Recommended status definitions (suggest these as defaults):**

Common Linear workflow statuses and their typical meanings:

- **Backlog**: "Low priority or nice to have features" | Trigger: "Manual triage as low priority"
- **To Do**: "New issues, not yet analyzed" | Trigger: "When issue is created or imported"
- **Ready for Development**: "Analyzed by Claude, no blockers, ready to start" | Trigger: "After Claude completes analysis with no blockers"
- **Feedback Required**: "Analyzed but has blockers or needs clarification" | Trigger: "When blockers or questions discovered during analysis"
- **In Progress**: "Actively working on issue, branch checked out" | Trigger: "Push to feature branch"
- **On Hold**: "User paused work on this issue" | Trigger: "User says 'pause work on this'"
- **In Review**: "Someone is actively reviewing the code" | Trigger: "Manual - when reviewer starts review"
- **Review Required**: "PR merged to staging, needs code review" | Trigger: "Merge to staging/testing branch"
- **Approved**: "Ready for production release" | Trigger: "Manual approval after review"
- **Released**: "Deployed to production, monitoring for issues" | Trigger: "Merge to production branch"
- **Done**: "Completed and verified, no issues after release" | Trigger: "Manual - 30 days after release with no feedback"
- **Canceled**: "Issue no longer relevant or needed" | Trigger: "Manual - when issue is cancelled"

**Example interaction:**

```
Status: Backlog (currently: 12 issues)

1. What does "Backlog" mean in your workflow?
   [Low priority / nice to have features]

2. When does an issue move to "Backlog"?
   [User manually triages as low priority]

✓ Backlog defined

────────────────────────────────────────────

Status: To Do (currently: 8 issues)

1. What does "To Do" mean in your workflow?
   [New issues, not yet analyzed]

2. When does an issue move to "To Do"?
   [When issue is created]

✓ To Do defined

────────────────────────────────────────────

Status: Ready for Development (currently: 3 issues)

1. What does "Ready for Development" mean in your workflow?
   [Claude analyzed issue, no blockers, ready to start]

2. When does an issue move to "Ready for Development"?
   [After Claude completes analysis with no blockers]

✓ Ready for Development defined

────────────────────────────────────────────

[Continue for all statuses...]
```

**After all statuses defined, validate the workflow mappings:**

```
Validating your workflow configuration...

Checking status mappings against definitions:

✓ Push to feature branch → "In Progress"
  Definition: "Actively working on issue, branch checked out"
  Analysis: Perfect match! This status means active work.

✓ Merge to main → "Review Required"
  Definition: "PR merged to staging, needs code review"
  Analysis: Good match. Issue needs review after merge.

⚠️  Warning: Merge to prod → "Released"
  Definition: "Deployed to production, monitoring for issues"
  Trigger: "Merge to production branch"

  Note: You have this mapped correctly, but consider adding "Approved"
  status before release if you need manual approval gates.

Would you like to adjust any mappings? [y/N]: _____
```

**Scenario-based validation examples:**

**Scenario 1: Logical mismatch detected**

```
❌ Potential Issue Detected

You mapped: Push to feature branch → "To Do"

But you defined "To Do" as:
  • Meaning: "New issues, not yet analyzed"
  • Trigger: "When issue is created"

This doesn't make sense! When you push to a feature branch, you're
actively working on the issue, not creating a new one.

Recommended mapping: "In Progress" (Actively working, branch checked out)

Would you like to:
1. Change mapping to "In Progress" (recommended)
2. Keep "To Do" (not recommended)
3. Redefine what "To Do" means

Your choice [1]: _____
```

**Scenario 2: Missing important status**

```
💡 Suggestion

I notice you have "Ready for Development" status but it's not mapped
to any git events.

Based on your definition:
  • "Analyzed by Claude, no blockers, ready to start"
  • Trigger: "After Claude completes analysis"

This is perfect for Claude to use when analyzing issues!

I'll automatically update issues to "Ready for Development" after
completing analysis (when no blockers found).

If blockers are found, which status should I use?

Your statuses:
1. Feedback Required (has blockers/questions)  ← Recommended
2. To Do (new issues, not analyzed)
3. On Hold (user paused)
4. Keep in current status

Your choice [1]: _____
```

**After validation complete:**

```
✓ Status definitions complete!

Summary:
  • {{count}} statuses defined
  • {{automated}} automated transitions
  • {{manual}} manual transitions

These definitions will help Claude:
  ✓ Update statuses appropriately during development
  ✓ Validate that git events map to correct statuses
  ✓ Generate accurate team documentation
  ✓ Provide context-aware workflow guidance

Let's continue with the next configuration step...
```

#### Question 4: Commit & PR Formats

**FIRST: Issue Reference Method**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
How should commits reference Linear issues?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose how to reference Linear issues in commit messages:

1. Related: DEV-XXX [Recommended]
   Best for: Full workflow control
   • GitHub Actions controls all status updates
   • No conflict with Linear automations
   • Most flexible approach

2. Closes: DEV-XXX
   Best for: Final commits that complete an issue
   • Indicates this commit closes the issue
   • ⚠️  May trigger Linear's magic word automation
   • Only use if you disable Linear automations (see below)

3. Fixes: DEV-XXX
   Best for: Bug fix commits
   • Indicates this commit fixes a bug
   • ⚠️  May trigger Linear's magic word automation
   • Only use if you disable Linear automations (see below)

Your choice [1]: _____

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPORTANT: Linear Magic Word Automations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Linear has built-in "magic word" automations that respond to keywords
like "Closes", "Fixes", "Resolves" in commit messages and PR titles.

If enabled, Linear will auto-update issue status when it sees these words.

This CAN CONFLICT with our GitHub Actions workflow!

Example conflict:
  1. PR with "Closes DEV-123" merges to main
  2. Linear magic words → moves issue to "Done"
  3. GitHub Actions workflow → tries to move to "Review Required"
  4. Result: Status conflict or unexpected behavior

Recommendation:
  • Use "Related: DEV-XXX" (Option 1) - safest, no conflicts
  • OR disable Linear magic word automations:
    → https://linear.app/{{workspace}}/settings/git

Check your Linear automation settings:
```

**Ask user about Linear automations:**

```
Do you have Linear's magic word automations enabled?

Check at: https://linear.app/{{workspace}}/settings/git

1. Not sure / Don't know
2. Yes, enabled (default in Linear)
3. No, disabled

Your choice [1]: _____
```

**If user selects "Not sure" or "Yes, enabled":**

```
⚠️  Linear magic word automations may be enabled

Recommendation: Use "Related: DEV-XXX" to avoid conflicts

Our GitHub Actions workflow will handle all status updates based on
your configured branch mappings. Using "Related:" gives you full control.

Alternative: Disable Linear automations at:
  → https://linear.app/{{workspace}}/settings/git
  → Uncheck "Auto close/archive"
  → Then you can use "Closes:" or "Fixes:" safely

Would you like me to open the Linear automation settings? (y/N)

Proceeding with "Related: DEV-XXX" format...
```

**If user selects "No, disabled":**

```
✓ Good! Linear automations are disabled

You can safely use any reference format:
  • "Related:" - General association
  • "Closes:" - Indicates completion
  • "Fixes:" - Indicates bug fix

All status updates will be controlled by our GitHub Actions workflow.

Using your selected format: {{userChoice}}
```

---

**SECOND: Commit Message Format**

```
Choose your commit message format:

1. <type>: <description> (Related: ISSUE-123)   [Conventional commits]
2. Related: ISSUE-123 - <description>           [Issue prefix]
3. <type>(ISSUE-123): <description>             [Issue in scope]
4. Custom format

Note: "Related:" will be replaced with your chosen reference method
      (Related/Closes/Fixes) from the previous step.

Your choice [1]: _____
```

**THIRD: PR Title Format**

```
Choose your PR title format:

1. ISSUE-123: Description                       [Issue prefix]
2. [ISSUE-123] Description                      [Issue in brackets]
3. Closes ISSUE-123: Description                [Magic word prefix]
4. Custom format

Note: If you chose "Closes:" or "Fixes:" for commits, consider using
      the same in PR titles for consistency.

⚠️  Warning: Magic words in PR titles also trigger Linear automations!

Your choice [1]: _____
```

```
What's your issue ID pattern?

Examples:
- DEV-1234 (Linear style)
- PROJ-456 (JIRA style)
- GH-789 (GitHub style)

Pattern (regex): [A-Z]+-\d+
Test your pattern with an example: _____
```

**After user provides pattern and example, VALIDATE against actual Linear issues:**

```
Testing pattern against your Linear workspace...
```

**Fetch a sample issue from their Linear team:**

```bash
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{
    "query": "query { team(id: \"{{teamId}}\") { issues(first: 1) { nodes { identifier } } } }"
  }'
```

**Test the pattern:**

```javascript
// Test if provided pattern matches actual Linear issue ID
const actualIssueId = "DEV-123"; // From API response
const userPattern = "[A-Z]+-\d+";
const userExample = "DEV-123";

// Convert pattern to JavaScript RegExp
const regex = new RegExp(userPattern);

// Test both the example and actual issue
const exampleMatches = regex.test(userExample);
const actualMatches = regex.test(actualIssueId);
```

**Scenario 1: Pattern matches (Success)**

```
✓ Pattern validated successfully!

  Your pattern: [A-Z]+-\d+
  Your example: DEV-123 ✓ Matches
  Linear issue: DEV-123 ✓ Matches

Your commit messages will correctly reference Linear issues.
```

**Scenario 2: Example matches but actual doesn't (Warning)**

```
⚠️  Pattern Validation Warning

  Your pattern: [A-Z]+-\d+
  Your example: DEV-123 ✓ Matches
  Linear issue: DEV-1234 ✗ Does NOT match

Your pattern might be too specific!

Issue detected:
  • Your pattern expects exactly 3 digits (\d+)
  • But Linear uses variable-length numbers (DEV-1, DEV-123, DEV-1234)

Recommended pattern: [A-Z]+-[0-9]+

Would you like to:
1. Use recommended pattern (recommended)
2. Keep your pattern
3. Enter a different pattern

Your choice [1]: _____
```

**Scenario 3: Example doesn't match pattern (Error)**

```
❌ Pattern Validation Failed

  Your pattern: [A-Z]+-\d+
  Your example: dev-123 ✗ Does NOT match

Your example doesn't match your own pattern!

Common issues:
  • Pattern expects uppercase [A-Z] but example is lowercase
  • Pattern expects different format than example
  • Typo in pattern or example

Please check your pattern and example.

Would you like to:
1. Try again with corrected pattern/example
2. Auto-detect pattern from Linear (recommended)
3. Use default pattern: [A-Z]+-[0-9]+

Your choice [2]: _____
```

**Scenario 4: Auto-detect pattern (Option)**

If user chooses auto-detect:

```
Analyzing your Linear issues to detect pattern...

Fetching sample issues from {{teamName}}...
```

**Fetch multiple issues to detect pattern:**

```bash
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{
    "query": "query { team(id: \"{{teamId}}\") { issues(first: 10) { nodes { identifier } } } }"
  }'
```

**Analyze and detect pattern:**

```
Detected pattern from 10 issues:

  DEV-1
  DEV-12
  DEV-123
  DEV-456
  DEV-789
  DEV-1001
  DEV-1234
  DEV-2000
  DEV-3456
  DEV-10000

Pattern detected: {{teamKey}}-[0-9]+
Example: {{teamKey}}-123

This pattern matches all your existing Linear issues.

Use this pattern? (Y/n): _____
```

**If yes:**
```
✓ Pattern auto-configured
  Pattern: {{teamKey}}-[0-9]+
  Example: {{teamKey}}-123

This pattern will match all Linear issues in your {{teamName}} team.
```

**If no, go back to manual entry.**

**Scenario 5: Team key mismatch (Critical)**

```
❌ CRITICAL: Team Key Mismatch

  Your pattern: PROJ-[0-9]+
  Your example: PROJ-123
  Linear team: DEV (uses DEV-xxx format)

Your pattern will NEVER match your Linear issues!

Linear issues in team "{{teamName}}" use format: {{teamKey}}-123

Would you like to:
1. Auto-fix pattern to match Linear team (recommended)
2. Enter a different pattern
3. Cancel setup (wrong Linear team selected?)

Your choice [1]: _____
```

**If user chooses auto-fix:**
```
✓ Pattern auto-fixed to match your Linear team

  Pattern: {{teamKey}}-[0-9]+
  Example: {{teamKey}}-123

This matches all issues in team "{{teamName}}".
```

#### Question 5: Update Detail Level
```
How detailed should Linear updates be?

1. 🎯 High-level (Stakeholder view)
   Brief summaries, business impact focus

2. 🔧 Technical (Developer view)
   Detailed analysis with code references

3. 📝 Minimal (Status updates only)
   One-line updates, commit references only

Your choice [2]: _____
```

#### Question 6: Documentation Location
```
Where should Claude store issue analysis documents?

1. /docs/issues/                           [Recommended]
2. /docs/dev-issues/                       [Alternative]
3. /.linear/issues/                        [Hidden folder]
4. Custom path

Your choice [1]: _____
```

#### Question 7: Auto-Assignment

**First, explain auto-assignment with real-world examples:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-Assignment: Notify the Right People Automatically
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auto-assignment automatically assigns (or reassigns) Linear issues to specific
team members when issue status changes. This ensures the right people are
notified at each stage.

📖 Real-World Examples:

Example 1: Code Review Workflow
  • Developer Alice pushes code → Issue moves to "Code Review"
  • Issue auto-assigned to Senior Dev Bob
  • Bob gets notification → reviews promptly

Example 2: QA Handoff
  • PR merged to staging → Issue moves to "QA Testing"
  • Issue auto-assigned to QA Lead Carol
  • Carol gets notification → starts testing

Example 3: Team Lead Oversight
  • Issue completed → Status moves to "Done"
  • Issue auto-assigned to Team Lead David
  • David reviews and closes issue

💡 Benefits:
  ✓ No manual reassignment needed
  ✓ Clear ownership at each stage
  ✓ Faster handoffs between team members
  ✓ Better visibility into who's working on what
  ✓ Reduced bottlenecks in the workflow

⚠️  Best for teams with:
  • Defined roles (reviewer, QA lead, etc.)
  • Clear workflow stages
  • Multiple people working on issues

Skip if:
  • Solo developer or very small team
  • Ad-hoc assignments work better
  • Don't want automatic reassignment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would you like to enable auto-assignment? (Y/n): _____
```

**If user says no:**
```
✓ Auto-assignment disabled

Issues will remain assigned to their original assignee throughout the workflow.
You can always enable this later by editing .linear-workflow.json.
```

**If user says yes:**

```
Great! Let's configure auto-assignment for your workflow.

Fetching team members from Linear workspace...
```

**Fetch team members via Linear API:**

```bash
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{
    "query": "query { organization { users { nodes { id name email active } } } }"
  }'
```

**Display team members with status indicators:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Team Members ({{teamName}}):

Active Members:
  1. Alice Smith - alice@company.com (Active)
  2. Bob Jones - bob@company.com (Active)
  3. Carol White - carol@company.com (Active)
  4. David Chen - david@company.com (Active)
  5. Emma Wilson - emma@company.com (Active)

  0. None / Skip this status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Let's configure assignments for each workflow stage.

You'll assign a team member (or skip) for each status transition.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**For each status in the workflow, ask individually:**

**Status 1: "In Progress" (when pushed to feature branch)**

```
[1/{{statusCount}}] Status: "{{linear.statuses.inProgress}}"

Triggered when: Developer pushes code to feature branch

Typical use case:
  • Assign to original developer (skip auto-assignment)
  • Or assign to team lead for oversight

Who should be assigned when issue moves to "{{linear.statuses.inProgress}}"?

Options:
  1. Alice Smith - alice@company.com
  2. Bob Jones - bob@company.com
  3. Carol White - carol@company.com
  4. David Chen - david@company.com
  5. Emma Wilson - emma@company.com
  0. None (keep current assignee)

Your choice [0]: _____
```

**Status 2: "Code Review" (when PR opened/merged to main)**

```
[2/{{statusCount}}] Status: "{{linear.statuses.review}}"

Triggered when: PR merged to {{branches.main}} branch

Typical use case:
  • Assign to senior developer or tech lead
  • Assign to specific code reviewer
  • Rotate between reviewers (configure later)

💡 Tip: Choose your most experienced reviewer or team lead

Who should be assigned when issue moves to "{{linear.statuses.review}}"?

Options:
  1. Alice Smith - alice@company.com
  2. Bob Jones - bob@company.com ⭐ (Tech Lead)
  3. Carol White - carol@company.com
  4. David Chen - david@company.com
  5. Emma Wilson - emma@company.com
  0. None (keep current assignee)

Your choice [2]: _____
```

**Status 3: "QA Testing" (when merged to staging)**

```
[3/{{statusCount}}] Status: "{{linear.statuses.staging}}"

Triggered when: PR merged to {{branches.staging}} branch

Typical use case:
  • Assign to QA engineer or QA lead
  • Assign to dedicated tester
  • Assign to product manager for UAT

💡 Tip: Choose the person responsible for testing/validation

Who should be assigned when issue moves to "{{linear.statuses.staging}}"?

Options:
  1. Alice Smith - alice@company.com
  2. Bob Jones - bob@company.com
  3. Carol White - carol@company.com ⭐ (QA Lead)
  4. David Chen - david@company.com
  5. Emma Wilson - emma@company.com
  0. None (keep current assignee)

Your choice [3]: _____
```

**Status 4: "Done" (when merged to production)**

```
[4/{{statusCount}}] Status: "{{linear.statuses.done}}"

Triggered when: PR merged to {{branches.prod}} branch (or final stage)

Typical use case:
  • Assign to team lead for verification
  • Assign to release manager
  • Assign to project manager
  • Keep with original developer

💡 Tip: Choose who verifies completion or skip to keep with developer

Who should be assigned when issue moves to "{{linear.statuses.done}}"?

Options:
  1. Alice Smith - alice@company.com
  2. Bob Jones - bob@company.com
  3. Carol White - carol@company.com
  4. David Chen - david@company.com ⭐ (Team Lead)
  5. Emma Wilson - emma@company.com
  0. None (keep current assignee)

Your choice [0]: _____
```

**After all status assignments configured, ask about preservation:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

One more question: Original Assignee Handling

When auto-assignment triggers, what should happen to the original assignee?

1. ✅ Keep original assignee (Recommended)
   • Adds new assignee alongside original
   • Both people can track the issue
   • Original developer stays informed

   Example: Issue assigned to Alice (dev)
            → Moves to Code Review
            → Now assigned to: Alice + Bob (reviewer)

2. 🔄 Replace original assignee
   • Removes original assignee completely
   • Only new assignee is assigned
   • Original assignee loses visibility

   Example: Issue assigned to Alice (dev)
            → Moves to Code Review
            → Now assigned to: Bob (reviewer only)

💡 Recommendation: Choose option 1 to keep everyone in the loop

Your choice [1]: _____
```

**After all configuration, show summary:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Auto-Assignment Configuration

Status Transitions:
  "{{linear.statuses.inProgress}}" → No change (keeps current assignee)
  "{{linear.statuses.review}}" → Assigned to Bob Jones (bob@company.com)
  "{{linear.statuses.staging}}" → Assigned to Carol White (carol@company.com)
  "{{linear.statuses.done}}" → No change (keeps current assignee)

Preservation: Keep original assignee ✓

📖 How it works:

  1. Developer Alice starts work on DEV-123
     Issue: DEV-123 (Alice)

  2. Alice pushes code, PR merged to main
     Issue: DEV-123 (Alice + Bob) ← Bob auto-assigned for review

  3. Bob approves, PR merged to staging
     Issue: DEV-123 (Alice + Bob + Carol) ← Carol auto-assigned for QA

  4. Testing complete, PR merged to prod
     Issue: DEV-123 (Alice + Bob + Carol) ← All stay assigned

💡 All team members stay informed throughout the workflow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Is this configuration correct? (Y/n): _____
```

**If user confirms, save configuration. If user says no, offer to reconfigure:**

```
Would you like to:
1. Reconfigure auto-assignment
2. Disable auto-assignment
3. Keep current configuration

Your choice [1]: _____
```

**See:** [Auto-Assignment Documentation](docs/auto-assignment.md) for details on this feature.

### Configuration Summary

**[Step 6 of 12 | Review | ~1 minute]**

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [██████____] 6/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks
  ✓ Initialize Claude Code in project
  ✓ Authenticate with Linear via MCP
  ✓ Configure workflow settings

Current:
  ⟳ Review configuration

Remaining:
  • Install workflow files and documentation
  • Set up GitHub secrets and git hooks
  • Configure Linear MCP server
  • Create Linear issue templates
  • Create test issue
  • Test the workflow
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Display complete configuration and confirm:

```
📋 Configuration Summary:

Project: /path/to/project
Branch Strategy: Standard (main + staging)

Linear:
  Team: DEV (Development)
  Workspace: Acme Inc
  Statuses:
    - Push to branch → "In Progress"
    - Merge to main → "Review Required"
    - Merge to prod → "Done"
  Magic Word Automations: Disabled ✓
    (No conflicts with workflow)

Formats:
  Issue Reference: Related: DEV-123
  Commit: <type>: <description> (Related: DEV-123)
  PR Title: DEV-123: Description
  Issue Pattern: DEV-\d+

GitHub Actions:
  Enabled: Yes
  LINEAR_API_KEY: Will be configured
  Auto-status updates: On PR merge

Detail Level: Technical (Developer view)
Documentation: /docs/issues/

Auto-Assignment:
  Enabled: Yes
  On Review → Alice Smith (alice@team.com)
  On Staging → Carol White (qa-lead@team.com)
  Preserve Original: Yes

Is this correct? [Y/n]: _____
```

If no, ask which section to edit.

### Installation Safety & Rollback

**CRITICAL:** Before starting installation, explain the safety mechanisms:

```
🛡️  Installation Safety Features

This installation is protected by automatic rollback:

1. All existing files will be backed up before modification
2. Installation state is tracked at each phase
3. If any phase fails, all changes are automatically reverted
4. You can manually rollback at any time

Installation phases:
  [1/7] Create installation branch
  [2/7] Create configuration file
  [3/7] Generate GitHub Actions workflow
  [4/7] Create workflow documentation
  [5/7] Configure MCP integration
  [6/7] Install git hooks
  [7/7] Create documentation folders

If installation fails at any phase, your project will be restored
to its previous state automatically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DRY-RUN MODE AVAILABLE

Would you like to preview the installation without making changes?

Options:
1. Dry-run first (preview changes, no files modified)
2. Install now (apply changes immediately)

Your choice [1]: _____
```

**If user chooses Option 1 (Dry-run):**

Run installation in dry-run mode:

```bash
node scripts/setup-orchestrator.js install --config .linear-workflow.json --dry-run
```

**Dry-Run Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Linear Workflow Installation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DRY RUN MODE - No files will be modified

[1/7] Create installation branch
  [DRY RUN] Would create branch: setup/linear-workflow

[2/7] Create configuration file
  [DRY RUN] Would create: .linear-workflow.json
  Preview (first 500 chars):
  {
    "version": "1.0.0",
    "project": {
      "name": "my-project",
      "path": "/path/to/project"
    },
    ...
  }

[3/7] Generate GitHub Actions workflow
  [DRY RUN] Would create: .github/workflows/linear-status-update.yml
  Preview (first 500 chars):
  name: Update Linear Issue Status

  on:
    pull_request:
      types: [closed]
    ...

[4/7] Create workflow documentation
  [DRY RUN] Would create: docs/linear-workflow.md

[5/7] Configure MCP integration
  [DRY RUN] Would create: .mcp.json, .env.example

[6/7] Install git hooks
  [DRY RUN] Would install: .git/hooks/commit-msg

[7/7] Create documentation folders
  [DRY RUN] Would create: docs/issues/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DRY-RUN COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files that would be created:
  • .linear-workflow.json
  • .github/workflows/linear-status-update.yml
  • docs/linear-workflow.md
  • .mcp.json
  • .env.example
  • .git/hooks/commit-msg
  • docs/issues/ (directory)

Files that would be backed up:
  (none - no existing files will be modified)

No changes were made to your project.
```

**After dry-run, ask:**

```
Review complete. Everything looks good?

Options:
1. Proceed with installation
2. Edit configuration and re-run dry-run
3. Cancel installation

Your choice [1]: _____
```

**If user chooses "Proceed with installation":**

```
Proceeding with installation...
(Continue to normal installation flow)
```

**If user chooses Option 2 (Install now):**

Skip dry-run and proceed directly to installation.

**During Installation:**

Use the setup orchestrator to execute installation with automatic rollback:

```bash
node scripts/setup-orchestrator.js install --config .linear-workflow.json
```

The orchestrator will:
- Track each phase completion in `.linear-workflow-state.json`
- Create backups of any files before modifying them
- Track all newly created files
- Automatically rollback on any error
- Provide clear error messages with recovery instructions

**If Installation Fails:**

The orchestrator automatically performs rollback:

```
❌ Installation Failed

Error in phase: Generate GitHub Actions workflow
Message: Permission denied: .github/workflows/

Rolling back changes...

  ✓ Restored: .github/workflows/linear-status-update.yml
  ✓ Deleted: .linear-workflow.json
  ✓ Deleted: .mcp.json

✓ Rollback complete - project restored to previous state

To retry installation:
  1. Fix the error (check permissions on .github/)
  2. Run: node scripts/setup-orchestrator.js install --config .linear-workflow.json
```

**Manual Rollback:**

If needed, user can manually rollback at any time:

```bash
node scripts/setup-orchestrator.js rollback
```

**Check Installation Status:**

```bash
node scripts/setup-orchestrator.js status
```

Shows:
- Current installation phase
- Completed phases
- Failed phase (if any)
- Files created
- Backups made

### Phase 7: Installation

**[Step 7 of 12 | Automatic | ~1-2 minutes]**

Once confirmed, execute installation via the orchestrator:

Show progress at the start of installation:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [███████___] 7/12 steps complete

Installing workflow files...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Display each step with clear descriptions:

```
📦 Installing Linear Workflow

[1/6] Creating workflow configuration...
      ✓ .linear-workflow.json created

[2/6] Generating team documentation...
      ✓ docs/linear-workflow.md created

[3/6] Creating MCP reference files...
      ✓ .mcp.json created (reference for Claude Desktop users)
      ✓ .env.example created (reference template)
      ✓ .gitignore updated

[4/6] Installing commit message validation...
      ✓ .git/hooks/commit-msg installed
      ⟳ Testing hook validation...
      ✓ Hook validation passed (7/7 tests)

[5/6] Creating issue documentation folder...
      ✓ docs/issues/ created

[6/6] GitHub Actions automation...
```

**If GitHub Actions enabled (user provided LINEAR_API_KEY):**

```
      [6/6a] Creating GitHub Actions workflow...
            ✓ .github/workflows/linear-status-update.yml created

      [6/6b] Configuring GitHub repository secrets...
            ⟳ Adding LINEAR_API_KEY to GitHub...
            ✓ LINEAR_API_KEY added to repository secrets
            ⟳ Validating Linear API connection...
            ✓ Secret validated - Linear API connection successful
```

**If GitHub Actions NOT enabled:**

```
      ✓ Skipped (user opted out)
      ℹ️  GitHub Actions workflow NOT installed
      ℹ️  Workflow fully functional via Claude Code commands
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Installation complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Secret Validation Details:**

After setting the LINEAR_API_KEY GitHub secret, IMMEDIATELY validate it:

```bash
node scripts/validate-secrets.js --api-key $LINEAR_API_KEY
```

The validation script will:
1. Test the API key against Linear's GraphQL API
2. Verify you have workspace access
3. List accessible teams
4. Confirm permissions are correct

**Successful Validation:**

```
═══════════════════════════════════════════════════════════════
GitHub Secrets Validation
═══════════════════════════════════════════════════════════════

[1/3] Checking GitHub repository secrets...
  ✓ LINEAR_API_KEY secret is set in GitHub

[2/3] Checking secret accessibility in workflows...
  ✓ Secret is accessible in GitHub Actions workflows

[3/3] Validating Linear API connection...
  ✓ Linear API key is valid

Connection Details:
─────────────────────────────────────────────────────────────
User: Alice Chen (alice@company.com)
Workspace: Acme Inc

Accessible Teams:
  • DEV - Development
  • ENG - Engineering

═══════════════════════════════════════════════════════════════
✅ All validations passed!
═══════════════════════════════════════════════════════════════

Your LINEAR_API_KEY is properly configured and functional.
```

**If Validation Fails:**

```
[3/3] Validating Linear API connection...
  ✗ Linear API key is invalid

Error Details:
─────────────────────────────────────────────────────────────
Authentication failed

Common Issues:
  • API key was revoked or deleted in Linear
  • API key has incorrect format (should start with lin_api_)
  • Typo when setting the GitHub secret
  • Network connectivity issues

To fix:
  1. Create a new API key: https://linear.app/settings/api
  2. Update GitHub secret: gh secret set LINEAR_API_KEY
  3. Run this script again to validate

═══════════════════════════════════════════════════════════════
❌ Validation failed
═══════════════════════════════════════════════════════════════
```

**If validation fails:**
1. DO NOT proceed with installation
2. Create a new Linear API key at https://linear.app/settings/api
3. Set it again: `gh secret set LINEAR_API_KEY`
4. Re-run validation until it passes
5. Then retry installation from Phase 7

**IMPORTANT:** Never skip secret validation - invalid secrets cause silent failures in GitHub Actions!

**MCP Integration Details:**

Create reference files for team documentation (Claude Desktop users):

1. **.mcp.json** - Reference config for Claude Desktop users:
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
       }
     }
   }
   ```

   **Note:** This file is for documentation only. Claude Desktop users should add this to their global config at:
   `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **.env.example** - Template for reference:
   ```
   # Linear API Configuration
   # This file is for reference only - not used by Claude Code MCP setup
   # Get your API key from: https://linear.app/settings/api

   LINEAR_API_KEY=your_linear_api_key_here
   ```

3. **Update .gitignore** to include:
   ```
   # Environment variables
   .env
   ```

**IMPORTANT:** Do NOT create `.env` file - it's not needed for Claude Code's MCP setup.

### Phase 7.5: Test Git Hook

**[Automatic during Phase 7 | ~15 seconds]**

**CRITICAL:** After installing the git hook, IMMEDIATELY test it to ensure proper validation.

**Run automatic hook testing:**

```bash
node scripts/test-git-hook.js
```

**Successful Test Output:**

```
═══════════════════════════════════════════════════════════════
Git Hook Validation Tests
═══════════════════════════════════════════════════════════════

[1/4] Checking configuration...
  ✓ Configuration loaded
  Pattern: [A-Z]+-\d+
  Example: DEV-123

[2/4] Checking hook installation...
  ✓ Hook is installed
  Location: .git/hooks/commit-msg

[3/4] Verifying hook configuration...
  ✓ Hook is configured correctly

[4/4] Running validation tests...

  ✓ Valid commit with issue in parens
  ✓ Valid commit with issue prefix
  ✓ Valid commit with issue in scope
  ✓ Invalid commit without issue
  ✓ Invalid commit with wrong format
  ✓ Merge commit (should skip validation)
  ✓ Revert commit (should skip validation)

═══════════════════════════════════════════════════════════════
Test Results
═══════════════════════════════════════════════════════════════

Passed: 7/7
Failed: 0/7

✅ All tests passed!

Your commit-msg hook is working correctly.
All commits will now be validated for Linear issue IDs.
```

**What the tests verify:**
1. **Valid formats accepted:**
   - `feat: Add feature (Related: DEV-123)` ✓
   - `Related: DEV-123 - Fix bug` ✓
   - `fix(DEV-123): Resolve issue` ✓
   - `feat: Add feature (Closes: DEV-123)` ✓
   - `Fixes: DEV-123 - Resolve issue` ✓

2. **Invalid formats rejected:**
   - `feat: Add feature` ✗ (no issue ID)
   - `Random commit message` ✗ (no issue ID)

3. **Special commits allowed:**
   - Merge commits ✓ (no validation)
   - Revert commits ✓ (no validation)

**If tests fail:**

```
❌ Some tests failed

Your commit-msg hook may not be working correctly.

To fix:
  1. Check hook permissions: ls -la .git/hooks/commit-msg
  2. Verify configuration: cat .linear-workflow.json
  3. Reinstall hook: Run setup wizard

For detailed output, run:
  node scripts/test-git-hook.js --verbose
```

**Troubleshooting failed tests:**

1. **Hook not executable:**
   ```bash
   chmod +x .git/hooks/commit-msg
   ```

2. **Pattern mismatch:**
   - Check `.linear-workflow.json` has correct `formats.issuePattern`
   - Re-render hook template with updated config

3. **Hook file corrupted:**
   ```bash
   # Re-copy from template
   node scripts/apply-config.js apply \
     templates/commit-msg.template \
     .git/hooks/commit-msg \
     .linear-workflow.json

   chmod +x .git/hooks/commit-msg
   ```

**Manual test (optional):**

```bash
# Try a test commit
git add .
git commit -m "test: Verify hook (DEV-123)"

# Should show:
# ✓ Valid commit message
#   Issue: DEV-123
```

**IMPORTANT:** Do NOT proceed to Phase 7 if hook tests fail. A broken commit-msg hook will:
- Allow commits without issue IDs (breaking workflow automation)
- Cause confusion when status updates don't work
- Require manual cleanup of commit history

### Phase 8: Create Linear Issue Templates

**[Step 8 of 12 | Automatic | ~30 seconds]**

**IMPORTANT:** Use MCP tools to create templates - no API key needed!

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [████████__] 8/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks
  ✓ Initialize Claude Code in project
  ✓ Authenticate with Linear via MCP
  ✓ Configure workflow settings
  ✓ Review configuration
  ✓ Install workflow files and documentation

Current:
  ⟳ Create Linear issue templates

Remaining:
  • Create test issue
  • Test the workflow
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**After installation completes, automatically create Linear templates:**

```
Creating Linear issue templates...

[1/3] ⟳ Bug Report template
[2/3] Improvement template
[3/3] New Feature template
```

**Use Linear MCP tools to create templates:**

**Note:** MCP may not have direct template creation tools. If MCP doesn't support template creation, fallback to GraphQL API (requires LINEAR_API_KEY if GitHub Actions enabled, otherwise skip template creation and note it for user).

**If GitHub Actions is enabled (user provided LINEAR_API_KEY):**

Use the LINEAR_API_KEY to create templates via GraphQL API:

```bash
# Bug Report Template
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{
    "query": "mutation { templateCreate(input: {
      type: \"issue\",
      teamId: \"{{teamId}}\",
      name: \"Bug Report\",
      templateData: {
        title: \"[BUG] \",
        description: \"## Description\\n\\nBrief description of the bug.\\n\\n## Steps to Reproduce\\n\\n1. \\n2. \\n3. \\n\\n## Expected Behavior\\n\\nWhat should happen.\\n\\n## Actual Behavior\\n\\nWhat actually happens.\\n\\n## Environment\\n\\n- Browser/Device:\\n- Version:\\n\\n## Screenshots\\n\\n(if applicable)\"
      }
    }) { success template { id name } } }"
  }'

# Improvement Template
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{
    "query": "mutation { templateCreate(input: {
      type: \"issue\",
      teamId: \"{{teamId}}\",
      name: \"Improvement\",
      templateData: {
        title: \"[IMPROVEMENT] \",
        description: \"## Current Behavior\\n\\nHow it works now.\\n\\n## Proposed Improvement\\n\\nHow it could be better.\\n\\n## Benefits\\n\\n- \\n- \\n\\n## Considerations\\n\\n- \"
      }
    }) { success template { id name } } }"
  }'

# New Feature Template
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{
    "query": "mutation { templateCreate(input: {
      type: \"issue\",
      teamId: \"{{teamId}}\",
      name: \"New Feature\",
      templateData: {
        title: \"[FEATURE] \",
        description: \"## Feature Description\\n\\nWhat this feature does.\\n\\n## User Story\\n\\nAs a [user type], I want to [action] so that [benefit].\\n\\n## Acceptance Criteria\\n\\n- [ ] \\n- [ ] \\n- [ ] \\n\\n## Design/Mockups\\n\\n(if applicable)\\n\\n## Technical Notes\\n\\n\"
      }
    }) { success template { id name } } }"
  }'
```

**If GitHub Actions is NOT enabled (no LINEAR_API_KEY):**

```
⚠️  Skipping template creation

Linear issue templates require a LINEAR_API_KEY to create programmatically.

You can create these templates manually in Linear:
  1. Go to: https://linear.app/{{workspace}}/settings/templates
  2. Create templates: Bug Report, Improvement, Feature
  3. Or skip this step - templates are optional

Would you like me to open the templates page? (y/N)

Continuing with test issue creation...
```

**Mark TODO as completed after templates are created.**

### Phase 9: Create Test Issue

**[Step 9 of 12 | Automatic | ~10 seconds]**

**IMPORTANT:** Use MCP tools to create test issue!

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [█████████_] 9/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks
  ✓ Initialize Claude Code in project
  ✓ Authenticate with Linear via MCP
  ✓ Configure workflow settings
  ✓ Review configuration
  ✓ Install workflow files and documentation
  ✓ Create Linear issue templates

Current:
  ⟳ Create test issue

Remaining:
  • Test the workflow
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**After templates are created, create a test issue using Linear MCP tools:**

**IMPORTANT:** Use MCP create_issue tool - no API key needed!

```
Creating test issue to verify setup...
```

**Create issue via Linear MCP:**

Use the `create_issue` MCP tool with the following parameters:

```javascript
{
  teamId: "{{teamId}}",
  title: "Add user authentication to dashboard",
  description: `## Overview

Implement user authentication for the dashboard to ensure only authorized users can access sensitive data.

## Requirements

- Support email/password login
- Add JWT token-based authentication
- Implement password reset flow
- Add session management
- Secure API endpoints

## Acceptance Criteria

- [ ] User can log in with email and password
- [ ] Invalid credentials show appropriate error
- [ ] JWT tokens are generated and validated correctly
- [ ] Password reset email is sent successfully
- [ ] Session expires after 24 hours of inactivity
- [ ] All API endpoints require valid authentication

## Technical Notes

Consider using bcrypt for password hashing and verify token expiration is handled properly. May need to update middleware for protected routes.

---

**Test Issue:** This issue will verify the Linear workflow integration. When Claude analyzes this, it should post a task analysis comment. When you commit and push, the status should update automatically.`,
  stateId: "{{todoStateId}}"
}
```

**Capture the created issue ID and display:**

```
Test issue created: {{ISSUE-ID}}

Title: Add user authentication to dashboard
URL: https://linear.app/{{workspace}}/issue/{{ISSUE-ID}}

This test issue has realistic requirements and acceptance criteria for Claude
to analyze. When you run "Let's get to work on {{ISSUE-ID}}", Claude will:
  1. Fetch and analyze the issue
  2. Create a detailed task analysis document
  3. Post the analysis as a comment to the Linear issue ← 2-way flow!
  4. Create a feature branch and initial commit
```

**Mark TODO as completed.**

### Phase 10: Test the Workflow

**[Step 10 of 12 | Automatic Validation + Optional Full Test | ~1-3 minutes]**

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [██████████] 10/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks
  ✓ Initialize Claude Code in project
  ✓ Authenticate with Linear via MCP
  ✓ Configure workflow settings
  ✓ Review configuration
  ✓ Install workflow files and documentation
  ✓ Create Linear issue templates
  ✓ Create test issue

Current:
  ⟳ Test the workflow

Remaining:
  • Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**After test issue is created, AUTOMATICALLY run validation tests:**

**Part A: Automatic Validation (No user input required)**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 Running Automated Tests...

[1/5] ⟳ Testing Linear MCP connection...
      Fetching test issue {{ISSUE-ID}}...
```

**Use Linear MCP tools to fetch the test issue:**

```javascript
// Use get_issue MCP tool
const issue = await getIssue(issueId);
```

If successful:
```
      ✓ Linear MCP connection working
      ✓ Can fetch issue: {{ISSUE-ID}}
      ✓ Issue title: "Test Linear + Claude + GitHub Integration"

[2/5] Validating configuration file...
```

**Read and validate .linear-workflow.json:**

```bash
node scripts/validate-config.js .linear-workflow.json
```

If successful:
```
      ✓ Configuration file valid
      ✓ All required fields present
      ✓ Issue pattern matches: {{issuePattern}}

[3/5] Checking GitHub Actions workflow...
```

**Validate workflow YAML syntax:**

```bash
# Check if workflow file exists and is valid YAML
test -f .github/workflows/linear-status-update.yml && \
  node -e "const yaml = require('js-yaml'); const fs = require('fs'); \
  yaml.load(fs.readFileSync('.github/workflows/linear-status-update.yml', 'utf8')); \
  console.log('✓ Workflow YAML is valid');"
```

If successful:
```
      ✓ Workflow file exists
      ✓ YAML syntax valid
      ✓ Required secrets configured

[4/5] Verifying git hook installation...
```

**Check hook is executable and working:**

```bash
# Already tested in Phase 6.5, just confirm status
test -x .git/hooks/commit-msg && echo "✓ Hook is executable"
```

```
      ✓ Git hook installed at .git/hooks/commit-msg
      ✓ Hook is executable
      ✓ Hook validation passed (7/7 tests)

[5/5] Testing GitHub repository access...
```

**Verify can push to repository:**

```bash
gh repo view --json nameWithOwner,viewerPermission
```

If successful:
```
      ✓ Repository accessible
      ✓ User has push permissions
      ✓ Can push to setup/linear-workflow branch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All Automated Tests Passed! (5/5)

Setup validation complete:
  ✓ Linear MCP connection working
  ✓ Configuration file valid
  ✓ GitHub Actions workflow ready
  ✓ Git commit hook working
  ✓ Repository access confirmed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Part B: Optional Full Workflow Test**

After automatic validation passes, offer the complete workflow test:

```
🎯 Optional: Test Complete Workflow

The installation is validated and ready to use. You can optionally test
the complete workflow end-to-end right now.

Test issue: {{ISSUE-ID}}
URL: https://linear.app/{{workspace}}/issue/{{ISSUE-ID}}

⚠️  IMPORTANT: The GitHub Actions workflow won't be active until you merge
   the setup/linear-workflow branch to main. However, we can test the Linear
   MCP integration and git hooks right now!

To run the full test, say: "Let's get to work on {{ISSUE-ID}}"

This will:
  1. Fetch issue details using Linear MCP tools
  2. Create task analysis document in /docs/issues/
  3. Post summary comment to Linear issue
  4. Create feature branch (feature/{{ISSUE-ID}}-test-setup)
  5. Make initial commit with issue reference
  6. Push to GitHub
  7. Verify commit message hook validation
  8. Test Linear MCP integration end-to-end

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Options:
1. Run full workflow test (recommended)
2. Skip and finalize installation

Your choice [1]: _____
```

**If user chooses 1 or triggers workflow ("Let's get to work on..."):**

Follow the complete Linear workflow as documented in docs/linear-workflow.md:
1. Fetch issue with MCP tools (get_issue, list_comments)
2. Create task analysis
3. Post to Linear
4. Create branch
5. Initial commit
6. Push

**After workflow completes:**

```
✅ Test workflow successful!

  Test Branch: feature/{{ISSUE-ID}}-test-setup
  Task Analysis: /docs/issues/{{ISSUE-ID}}-test-setup/task-analysis.md
  Linear Comment: Posted to issue {{ISSUE-ID}}

  ✓ Linear MCP tools working
  ✓ Task analysis created
  ✓ Linear comment posted
  ✓ Feature branch created
  ✓ Commit message hook passed validation
  ✓ Pushed to GitHub

⚠️  Note: GitHub Actions workflow won't trigger yet because the workflow
   file (.github/workflows/linear-status-update.yml) isn't on main yet.
   The workflow will become active after you merge setup/linear-workflow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Testing Complete!

The setup is working correctly:
  ✓ Linear MCP integration
  ✓ Task analysis workflow
  ✓ Commit message validation (git hook)
  ✓ Git push to GitHub

📝 Note: The test branch (feature/{{ISSUE-ID}}-test-setup) can be deleted
   after installation. You'll merge setup/linear-workflow, not the test branch.

Ready to finalize the installation? (Y/n)
```

**Mark TODO as completed.**

**If user chooses 2 (skips full workflow test):**

```
✓ Automated validation complete (5/5 tests passed)

The installation is ready to finalize. You can test the complete workflow
anytime after installation by saying "Let's get to work on {{ISSUE-ID}}".

All critical components have been validated:
  ✓ Linear MCP connection
  ✓ Configuration file
  ✓ GitHub Actions workflow
  ✓ Git commit hook
  ✓ Repository access

Let's finalize the installation.
```

### Phase 11: Commit and Push Installation

**[Step 11 of 12 | Automatic | ~30 seconds]**

**Show progress:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Linear Workflow Setup

Progress: [███████████] 11/12 steps complete

Completed:
  ✓ Confirm project location
  ✓ Create installation branch
  ✓ Run pre-flight environment checks
  ✓ Initialize Claude Code in project
  ✓ Authenticate with Linear via MCP
  ✓ Configure workflow settings
  ✓ Review configuration
  ✓ Install workflow files and documentation
  ✓ Create Linear issue templates
  ✓ Create test issue
  ✓ Test the workflow

Current:
  ⟳ Commit and push installation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**After testing is complete (or skipped), switch back to setup branch and commit all installation files:**

```
Finalizing installation...

Switching back to setup/linear-workflow branch...
Adding all workflow files...
Committing installation...
```

**Batch all git operations together:**

```bash
echo "Switching to installation branch..."

cd "/path/to/project" && \
  git checkout setup/linear-workflow && \
  echo "✓ Switched to setup/linear-workflow" && \
  echo "" && \
  echo "Staging workflow files..." && \
  git add .linear-workflow.json .mcp.json .env .env.example .gitignore .github/ docs/ .git/hooks/commit-msg .claude/ CLAUDE.md && \
  echo "✓ Files staged for commit" && \
  echo "" && \
  echo "Creating commit..." && \
  git commit -m "feat: Add Linear workflow integration

- GitHub Actions workflow for automatic status updates
- Linear MCP server configuration
- Git commit message validation hook
- Workflow documentation
- Linear issue templates

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>" && \
  git push -u origin setup/linear-workflow && \
  echo "✓ Changes pushed to setup/linear-workflow"
```

**Display completion message:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Installation Complete!

All changes have been committed to branch: setup/linear-workflow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 What was installed:

  ✓ CLAUDE.md - Project instructions for Claude Code
  ✓ .claude/commands/ - Custom workflow commands (/start-issue, /create-pr, /progress-update)
  ✓ .linear-workflow.json - Workflow configuration
  ✓ .github/workflows/linear-status-update.yml - GitHub Actions workflow (if enabled)
  ✓ docs/linear-workflow.md - Complete documentation
  ✓ .mcp.json - Reference config for Claude Desktop users
  ✓ .env.example - Reference template
  ✓ .gitignore - Updated
  ✓ .git/hooks/commit-msg - Commit validation
  ✓ docs/issues/ - Issue documentation folder
  ✓ GitHub secret: LINEAR_API_KEY (if GitHub Actions enabled)
  ✓ Linear MCP server: Configured via CLI (claude mcp add)
  ✓ Linear templates: Bug Report, Improvement, Feature (if API key available)
  ✓ Test issue: {{ISSUE-ID}}

📝 Commit Message Format:

  Your commits should reference Linear issues using:
    {{formats.issueReferenceKeyword}}: {{formats.issueExample}}

  Example commits:
    • feat: Add authentication ({{formats.issueReferenceKeyword}}: {{formats.issueExample}})
    • {{formats.issueReferenceKeyword}}: {{formats.issueExample}} - Fix login bug
    • fix({{formats.issueExample}}): Resolve timeout issue

  ⚠️  Linear Magic Word Automations: {{linearAutomations.magicWordsEnabled ? "Enabled" : "Disabled"}}
  {{#if linearAutomations.magicWordsEnabled}}
    Using "{{formats.issueReferenceKeyword}}" may trigger Linear's auto-status updates.
    This can conflict with GitHub Actions workflow.

    To disable: https://linear.app/{{linear.workspaceName}}/settings/git
  {{else}}
    Good! No conflicts between Linear and GitHub Actions.
    Status updates are fully controlled by your workflow configuration.
  {{/if}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Review the changes:

  View files: git diff main setup/linear-workflow
  Review docs: cat docs/linear-workflow.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Installation Complete!

Your AI-powered Linear workflow is ready to use.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test the Workflow

Try the complete 2-way workflow before merging:

  Say: "Let's get to work on {{ISSUE-ID}}"

  What happens:
    • Claude fetches and analyzes the issue from Linear
    • Creates a detailed task analysis document locally
    • Posts analysis comment back to Linear (2-way flow!)
    • Creates feature branch and initial commit
    • Git hook validates your commit message

  Then check the Linear issue to see Claude's analysis comment!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

More Commands to Try:

  Slash Commands:
    • /start-issue {{ISSUE-ID}}
    • /create-pr
    • /progress-update

  Natural Language:
    • "Fetch me any recent bugs"
    • "Let's get some high priority items"
    • "What are we busy with?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Step: Merge to Activate

Once tested and confirmed, merge the changes to:
  • Activate the workflow for all team members
  • Enable GitHub Actions status updates (if configured)
  • Make custom commands available to everyone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Merge the setup/linear-workflow branch to activate the workflow

After merging: The GitHub Actions workflow will become active and all
commits with Linear issue references will automatically update issue statuses!

Option 1 - Create a Pull Request (recommended for team review):

  gh pr create --base main --head setup/linear-workflow \
    --title "feat: Add Linear workflow integration ({{ISSUE-ID}})" \
    --body "Adds complete Linear + GitHub + Claude workflow automation.

See docs/linear-workflow.md for usage guide.

Configuration:
- Profile: {{profile}}
- Team: {{linear.teamName}}
- Auto-assignment: {{autoAssignmentSummary}}
- Issue pattern: {{formats.issuePattern}}"

Option 2 - Direct merge (if you've reviewed and approved):

  git checkout main
  git merge setup/linear-workflow
  git push origin main

After merging to main:
  ✓ GitHub Actions workflow will be active
  ✓ All commits with {{formats.issueExample}} will update Linear automatically
  ✓ Team can start using workflow commands immediately

Need help merging? Just ask!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Mark final TODO as completed and clear the list.**

## Implementation Notes

### File Generation

When creating files, use the templates from the `templates/` directory:

1. **GitHub Workflow** (`templates/github-workflow.yml.template`):
   - Replace `{{linear.teamKey}}` with user's team key
   - Replace `{{linear.statuses.*}}` with selected status names
   - Replace `{{branches.*}}` with branch names

2. **Linear Workflow Docs** (`templates/linear-workflow.md.template`):
   - Replace placeholders with user-specific values
   - Include examples using their issue pattern

3. **MCP Config** (`templates/mcp-config.json.template`):
   - Set LINEAR_API_KEY placeholder

4. **Configuration File** (`.linear-workflow.json`):
   - Store all user choices in JSON format

### Error Handling

If any step fails:
- Display clear error message
- Suggest fix (e.g., "Run: gh auth login")
- Offer to retry
- Provide rollback option

### Idempotent Setup

If configuration already exists:
```
⚠️  Existing Linear workflow detected!

Found: .linear-workflow.json (created 2 days ago)

What would you like to do?
1. Update configuration (keeps existing files)
2. Reinstall everything (overwrites files)
3. Cancel

Your choice [1]: _____
```

## Status-Aware Automation

**Understanding and Using Status Definitions**

After configuration, you have detailed information about what each status means in the team's workflow. Use these definitions to make intelligent decisions about when to update issue statuses automatically.

### Accessing Status Definitions

Status definitions are stored in `.linear-workflow.json` under `linear.statuses`. Each status includes:

- **name**: Display name of the status
- **id**: Linear status ID
- **meaning**: What this status represents in the workflow
- **trigger**: When issues should move to this status
- **automated**: Whether this is automated or manual
- **gitEvent** (optional): Specific git event that triggers this status

### Status-Aware Decision Making

**When starting work on an issue ("Let's get to work on..."):**

1. **Check current status and validate it makes sense:**

```javascript
// Example status checks
const currentStatus = issue.state.name;
const statusDef = config.linear.statuses[currentStatus.toLowerCase().replace(/\s+/g, '')];

// Validate based on meaning
if (statusDef?.meaning?.includes('Low priority') || statusDef?.meaning?.includes('Backlog')) {
  // Warn user: "This issue is in Backlog (low priority). Do you want to continue?"
}

if (statusDef?.meaning?.includes('Feedback') || statusDef?.meaning?.includes('blockers')) {
  // Check: "This issue needs feedback. Has the blocker been resolved?"
}

if (statusDef?.meaning?.includes('Hold') || statusDef?.meaning?.includes('paused')) {
  // Ask: "This issue is on hold. Ready to resume?"
}
```

2. **After completing analysis, update to appropriate status:**

```javascript
// Find the appropriate status based on analysis outcome
const hasBlockers = /* check if blockers found */;

if (hasBlockers) {
  // Find "Feedback Required" or similar status
  const feedbackStatus = Object.values(config.linear.statuses).find(s =>
    s.meaning?.includes('blockers') ||
    s.meaning?.includes('clarification') ||
    s.meaning?.includes('Feedback')
  );

  if (feedbackStatus) {
    updateIssue(issueId, { stateId: feedbackStatus.id });
    // Post comment explaining blockers
  }
} else {
  // Find "Ready for Development" or similar status
  const readyStatus = Object.values(config.linear.statuses).find(s =>
    s.meaning?.includes('ready to start') ||
    s.meaning?.includes('Ready for Development') ||
    s.meaning?.includes('no blockers')
  );

  if (readyStatus) {
    updateIssue(issueId, { stateId: readyStatus.id });
    // Post comment with analysis summary
  }
}
```

**When user pauses work ("pause work on this"):**

```javascript
// Find "On Hold" or similar status
const onHoldStatus = Object.values(config.linear.statuses).find(s =>
  s.meaning?.includes('paused') ||
  s.meaning?.includes('On Hold') ||
  s.trigger?.includes('pause')
);

if (onHoldStatus) {
  // Update to On Hold
  updateIssue(issueId, { stateId: onHoldStatus.id });
  // Post pause comment with reason
}
```

**When marking as blocked:**

```javascript
// Check if they have "Feedback Required" or similar status
const blockedStatus = Object.values(config.linear.statuses).find(s =>
  s.meaning?.includes('blockers') ||
  s.meaning?.includes('clarification') ||
  s.meaning?.includes('Feedback')
);

if (blockedStatus) {
  updateIssue(issueId, { stateId: blockedStatus.id });
  // Post detailed blocker information
} else {
  // Fallback to "On Hold" if no feedback status exists
  const onHoldStatus = Object.values(config.linear.statuses).find(s =>
    s.meaning?.includes('Hold')
  );
  if (onHoldStatus) {
    updateIssue(issueId, { stateId: onHoldStatus.id });
  }
}
```

### Status Validation During Configuration

**When mapping git events to statuses, validate they make sense:**

```javascript
// Example validation logic
const statusMapping = {
  gitEvent: 'push_feature_branch',
  selectedStatus: config.linear.statuses.inProgress
};

// Check if meaning aligns with git event
if (statusMapping.gitEvent === 'push_feature_branch') {
  const expectedMeanings = ['actively working', 'in progress', 'branch checked out'];
  const actualMeaning = statusMapping.selectedStatus.meaning.toLowerCase();

  const isGoodMatch = expectedMeanings.some(expected =>
    actualMeaning.includes(expected)
  );

  if (!isGoodMatch) {
    // Warn user about potential mismatch
    console.log(`⚠️  Warning: "${statusMapping.selectedStatus.name}" may not be the best choice for pushing to feature branch.`);
    console.log(`   Meaning: "${statusMapping.selectedStatus.meaning}"`);
    console.log(`   Expected: Status meaning "actively working" or "in progress"`);
  }
}
```

### Common Status Patterns

**Pattern 1: Analysis Workflow**

```
To Do (new, not analyzed)
  ↓ (Claude analyzes)
Ready for Development (analyzed, no blockers) OR Feedback Required (has blockers)
  ↓ (developer starts)
In Progress (actively working)
```

**Pattern 2: Review Workflow**

```
In Progress (actively working)
  ↓ (PR created and merged)
Review Required (needs code review)
  ↓ (reviewer approves)
Approved (ready for release)
```

**Pattern 3: Release Workflow**

```
Approved (ready for release)
  ↓ (deployed to production)
Released (monitoring for issues)
  ↓ (30 days, no issues)
Done (completed successfully)
```

### Example Implementation

**Full workflow when starting an issue:**

```javascript
async function startWorkOnIssue(issueId, config) {
  // 1. Fetch issue
  const issue = await getIssue(issueId);
  const currentStatus = issue.state.name;

  // 2. Check current status against definitions
  const currentStatusDef = findStatusByName(config.linear.statuses, currentStatus);

  // 3. Validate it makes sense to start work
  if (currentStatusDef?.meaning?.includes('Low priority')) {
    const confirm = await ask("This issue is low priority. Continue anyway?");
    if (!confirm) return;
  }

  if (currentStatusDef?.meaning?.includes('Feedback')) {
    const confirm = await ask("This issue needs feedback. Has it been resolved?");
    if (!confirm) return;
  }

  // 4. Perform analysis
  const analysis = await analyzeIssue(issue);
  const hasBlockers = analysis.blockers.length > 0;

  // 5. Update to appropriate status based on analysis
  if (hasBlockers) {
    const feedbackStatus = Object.values(config.linear.statuses).find(s =>
      s.meaning?.includes('blockers') || s.meaning?.includes('Feedback')
    );

    if (feedbackStatus) {
      await updateIssue(issueId, { stateId: feedbackStatus.id });
      await postComment(issueId, formatBlockerComment(analysis.blockers));
      console.log(`Status updated to "${feedbackStatus.name}" (has blockers)`);
    }
  } else {
    const readyStatus = Object.values(config.linear.statuses).find(s =>
      s.meaning?.includes('ready to start') || s.meaning?.includes('Ready for Development')
    );

    if (readyStatus) {
      await updateIssue(issueId, { stateId: readyStatus.id });
      await postComment(issueId, formatAnalysisSummary(analysis));
      console.log(`Status updated to "${readyStatus.name}" (ready to start)`);
    }

    // 6. Create feature branch
    await createFeatureBranch(issueId, issue.title);

    // 7. Push initial commit (will trigger GitHub Actions to update to "In Progress")
    await pushInitialCommit(issueId);
  }
}

function findStatusByName(statuses, name) {
  return Object.values(statuses).find(s => s.name === name);
}
```

### Best Practices

1. **Always check status definitions before updating**
   - Don't hardcode status names
   - Use meaning and trigger to find the right status

2. **Provide context in comments when updating status**
   - Explain why the status changed
   - Include relevant information (blockers, progress, etc.)

3. **Validate mappings make sense**
   - Check that git events align with status meanings
   - Warn user if configuration seems illogical

4. **Handle missing statuses gracefully**
   - Not all teams have all statuses
   - Have fallbacks (e.g., "On Hold" if no "Feedback Required")

5. **Respect manual statuses**
   - Don't automatically update statuses marked as `automated: false`
   - These require user decision (Approved, Done, Canceled)

## Commands After Installation

Once workflow is installed, support these commands. These commands enable natural, conversational development workflows with Linear integration.

### Core Workflow Commands

#### Create Linear Issue (Bottom-Up Workflow)

**Trigger phrases:**
- "Let's add [feature description]"
- "I want to build [feature description]"
- "We need to fix [bug description]"
- "/create-linear-issue"
- "/create-linear-issue [brief description]"

**When to trigger:**
User mentions adding/building/fixing something WITHOUT referencing an existing Linear issue ID.

**Claude should:**

1. **Detect new work without issue reference** and ask:
   ```
   Would you like to create a Linear issue for this? (Y/n)
   ```

2. **If yes, fetch available templates** using Linear MCP:
   ```javascript
   // Use Linear MCP to get issue templates for the team
   const templates = await listTemplates(teamId);
   ```

   Display:
   ```
   Which template would you like to use?
   1. Bug Report
   2. Improvement
   3. Feature
   4. [Any custom templates from Linear]
   ```

3. **Ask about context**:
   ```
   Would you like to add context, or should I draft the issue?

   Options:
   1. I'll provide context (you describe it)
   2. Draft it for me (Claude creates comprehensive description)
   ```

4. **If user provides context (Option 1)**:
   - Prompt for: Title, Description, Acceptance Criteria
   - Use their exact words
   - Fill in template structure

5. **If Claude drafts (Option 2)**:
   - Analyze user's initial request
   - Create comprehensive description based on template:
     - **Bug Report**: Description, Steps to Reproduce, Expected vs Actual, Environment
     - **Improvement**: Current Behavior, Proposed Improvement, Benefits, Considerations
     - **Feature**: Feature Description, User Story, Acceptance Criteria, Technical Notes
   - Generate realistic acceptance criteria
   - Add technical considerations

6. **Create issue via Linear MCP**:
   ```javascript
   const issue = await createIssue({
     teamId: config.linear.teamId,
     title: title,
     description: description,
     stateId: config.linear.statuses.todo.id,
     templateId: selectedTemplate.id
   });
   ```

7. **Display created issue**:
   ```
   Issue created: DEV-456 - [Title]

   Linear URL: https://linear.app/workspace/issue/DEV-456
   ```

8. **Ask to start work immediately**:
   ```
   Ready to start work on this issue? (Y/n)
   ```

9. **If yes**, follow normal "Start Work on Issue" workflow:
   - Fetch issue details
   - Create task analysis
   - Post analysis to Linear
   - Create feature branch
   - Push initial commit

**Benefits:**
- Keeps developers in terminal
- Quick issue creation for discoveries during development
- No need to open Linear web app
- Immediate transition from idea to implementation
- All work tracked in Linear for team visibility

**Example Flow:**
```
User: "Let's add CSV export to the reports page"

Claude: "Would you like to create a Linear issue for this? (Y/n)"
User: "y"

Claude: "Which template? 1. Bug Report, 2. Improvement, 3. Feature"
User: "3"

Claude: "Would you like to add context, or should I draft it? (1. Provide, 2. Draft)"
User: "2"

Claude: [Creates comprehensive feature description]
        "Issue created: DEV-456 - Add CSV export to reports"
        "Ready to start work on this issue? (Y/n)"
User: "y"

Claude: [Follows normal workflow - fetch, analyze, branch, commit]
```

#### Quick Shortcuts: /bug-linear, /improvement-linear, /feature-linear

**Purpose**: Streamlined issue creation by automatically selecting the template type.

These commands work exactly like `/create-linear-issue` but skip the template selection step:
- `/bug-linear` - Automatically uses "Bug Report" template
- `/improvement-linear` - Automatically uses "Improvement" template
- `/feature-linear` - Automatically uses "Feature" template

**Trigger phrases:**
- `/bug-linear [description]`
- `/improvement-linear [description]`
- `/feature-linear [description]`

**Claude should:**

1. **Skip template selection** - Template is already determined by command
2. **Ask about context** (same as `/create-linear-issue`):
   ```
   Would you like to add context, or should I draft the [bug/improvement/feature]?

   Options:
   1. I'll provide context (you describe it)
   2. Draft it for me (Claude creates comprehensive description)
   ```

3. **Create issue with appropriate template**:
   ```javascript
   const templateType = command === '/bug-linear' ? 'bug' :
                       command === '/improvement-linear' ? 'improvement' : 'feature';

   const template = templates.find(t => t.name.toLowerCase().includes(templateType));

   const issue = await createIssue({
     teamId: config.linear.teamId,
     title: title,
     description: description,
     stateId: config.linear.statuses.todo.id,
     templateId: template.id
   });
   ```

4. **Display created issue**:
   ```
   [Bug/Improvement/Feature] created: DEV-456 - [Title]

   Linear URL: https://linear.app/workspace/issue/DEV-456
   ```

5. **Ask to start work immediately** (context-aware language):
   - Bug: "Ready to start fixing this bug? (Y/n)"
   - Improvement: "Ready to start working on this improvement? (Y/n)"
   - Feature: "Ready to start building this feature? (Y/n)"

**Example Flows:**

**Bug Report:**
```
User: "/bug-linear Login timeout is too short"

Claude: "Should I draft the bug report? (1. You provide, 2. I'll draft)"
User: "2"

Claude: [Creates comprehensive bug report]
        "Bug created: DEV-456 - Login timeout too short"
        "Ready to start fixing this bug? (Y/n)"
```

**Improvement:**
```
User: "/improvement-linear Optimize database queries in reports"

Claude: "Should I draft the improvement? (1. You provide, 2. I'll draft)"
User: "2"

Claude: [Creates improvement with current vs proposed behavior]
        "Improvement created: DEV-457 - Optimize database queries"
        "Ready to start working on this improvement? (Y/n)"
```

**Feature:**
```
User: "/feature-linear Add user profile page"

Claude: "Should I draft the feature? (1. You provide, 2. I'll draft)"
User: "2"

Claude: [Creates feature with user story and acceptance criteria]
        "Feature created: DEV-458 - Add user profile page"
        "Ready to start building this feature? (Y/n)"
```

**Benefits:**
- **Faster creation** - One less step (no template selection)
- **Clear intent** - Command name indicates issue type
- **Type-specific language** - "Fix bug", "Build feature", "Work on improvement"
- **Same rich descriptions** - Claude still generates comprehensive content
- **Muscle memory** - Developers quickly learn which command to use

**When to use each:**
- `/bug-linear` - Something is broken, not working as expected, or causing errors
- `/improvement-linear` - Enhancement to existing functionality, optimization, refactoring, UX improvements
- `/feature-linear` - New functionality, new page/component, new integration, new capability

#### Start Work on Issue (Existing Issue)

**Trigger phrases:**
- "Let's get to work on DEV-456"
- "Start work on DEV-456"
- "Begin DEV-456"

**When to trigger:**
User references an existing Linear issue ID.

**Claude should:**
1. Update local repo (`git checkout main && git pull`)
2. Fetch issue with MCP (`get_issue`, `list_comments`)
3. Create task analysis document (11-section format)
4. Post summary comment to Linear (`create_comment`)
5. Create feature branch
6. Push initial commit
7. Confirm status updated to "In Progress"

#### Continue Existing Issue

**Trigger phrases:**
- "Continue DEV-456"
- "Resume DEV-456"
- "Resume work on DEV-456"

**Claude should:**
1. Fetch latest issue context (`get_issue`)
2. Find and checkout existing branch
3. Pull latest changes
4. Review task analysis and recent comments
5. Show WIP status
6. Resume implementation

#### Create Pull Request

**Trigger phrases:**
- "Create PR for DEV-456"
- "Ready for review"
- "Open pull request"

**Claude should:**
1. Commit any pending changes
2. Create PR via `gh pr create` with proper title format
3. Post PR summary to Linear (`create_comment`)
4. Status updates automatically via GitHub Actions
5. Return PR URL

---

### Related Issue Creation

#### Create Blocker

**Trigger phrases:**
- "Create a blocker for this"
- "This is blocked by [description]"

**Claude should:**
1. Ask: "What's blocking you?" (if not provided)
2. Create new issue with blocker template
3. Link as "blocks" current issue using Linear API
4. Set status: "To Do"
5. Brief analysis + mark "Ready for Development"
6. Return focus to current issue

**Comment to current issue:**
```markdown
## Blocker Created

Created blocking issue: DEV-XXX - [Title]

Work on this issue is paused until blocker is resolved.
```

#### Create Sub-task

**Trigger phrases:**
- "Create a sub-task for [description]"
- "Break this into a sub-task: [description]"

**Claude should:**
1. Ask: "How complex is this sub-task?"

   **Options:**
   - **Small** (1-2 hours) - Quick implementation
   - **Medium** (half day) - Standard sub-task
   - **Large** (1-2 days) - Significant work, consider breaking down further

2. Ask: "Does this sub-task depend on anything?"

   **Options:**
   - **No dependencies** - Can be worked on anytime
   - **Depends on other sub-tasks** - Ask which ones, set relationships
   - **Depends on parent issue completion** - Note prerequisite
   - **Depends on external factor** - Note what's needed

3. Create child issue linked to current issue with:
   - Inherited labels and priority from parent
   - Estimate set based on complexity
   - Dependencies noted in description
   - Status: "To Do"

4. Brief analysis (lighter than full task analysis):
   - What needs to be done
   - Key files to modify
   - Acceptance criteria

5. Offer: "Would you like to start work on this sub-task now, or continue with the parent issue?"

**Sub-task template:**
```markdown
## Parent Issue
DEV-XXX: [Parent Title]

## Sub-task Description
[Description from user]

## Complexity
[Small/Medium/Large] - Estimated [time]

## Dependencies
[List any dependencies or "None"]

## Context
[Brief context from parent issue]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

#### Create Related Bug

**Trigger phrases:**
- "Found a bug: [description]"
- "This needs a bug report"
- "Create bug issue for [description]"

**Claude should:**
1. Ask: "Is this bug related to the current issue, or is it part of another issue or feature?"

   **Options:**
   - **Related to current issue** (default if working on an issue)
   - **Part of another issue** (ask for issue ID)
   - **Standalone bug** (not related to any specific issue)
   - **Part of a feature area** (ask which area/component)

2. Based on response, link appropriately:
   - Current issue → Link as "related to" current issue
   - Another issue → Ask "Which issue?" then link to that issue
   - Standalone → Create without explicit links
   - Feature area → Add label/tag for that area

3. Set priority based on severity keywords in description:
   - "critical", "urgent", "blocking", "production down" → Priority 1 (Urgent)
   - "important", "high", "user-facing" → Priority 2 (High)
   - "minor", "low", "cosmetic" → Priority 4 (Low)
   - Default → Priority 3 (Normal)

4. Create issue using Bug Report template with:
   - Description (from user)
   - Steps to Reproduce (infer from current context if available)
   - Expected vs Actual Behavior
   - Environment details
   - Related issue/feature context

5. Quick analysis focused on:
   - Likely root cause
   - Reproduction steps
   - Potential fix approach

6. Status: "Ready for Development"

7. Post link back to origin (current issue or mentioned issue)

**Bug template includes:**
- Title: "[BUG] [Brief description]"
- Description
- Steps to Reproduce
- Expected vs Actual Behavior
- Environment details
- Related Issues/Context
- Discovered during: [Link to current work if applicable]

#### Create Follow-up

**Trigger phrases:**
- "Create follow-up for [description]"
- "Add follow-up: [description]"
- "Log this for later: [description]"

**Claude should:**
1. Ask: "What type of follow-up is this?"

   **Options:**
   - **Tech debt** - Code that needs refactoring/cleanup
   - **Improvement** - Enhancement to existing functionality
   - **Optimization** - Performance or efficiency improvement
   - **Documentation** - Missing or outdated docs
   - **Testing** - Additional test coverage needed

2. Ask: "When should this be addressed?"

   **Options:**
   - **Soon** (Next sprint) - Priority 2, Status: "To Do"
   - **Later** (This quarter) - Priority 3, Status: "Backlog"
   - **Eventually** (Nice to have) - Priority 4, Status: "Backlog"
   - **Before next release** - Priority 2, add "pre-release" label

3. Create improvement/tech-debt issue with:
   - Type-specific label (tech-debt, improvement, etc.)
   - Link as "related to" current issue
   - Priority based on timeline
   - Status based on timeline
   - Minimal analysis (capture context and rationale)

4. Post link to current issue

**Follow-up template:**
```markdown
## Follow-up from
DEV-XXX: [Current Issue]

## Type
[Tech Debt / Improvement / Optimization / Documentation / Testing]

## Description
[Description from user]

## Why This Matters
[Impact and rationale]

## Context
[Brief context from current work]

## Suggested Approach
[Quick notes if obvious]

## Timeline
[Soon / Later / Eventually / Before Release]
```

---

### Progress & Communication

#### Progress Update

**Trigger phrases:**
- "Add progress update"
- "Post progress to Linear"
- "Update Linear with progress"

**Claude should:**
1. Analyze recent commits since last update
2. Check current file changes (`git status`, `git diff`)
3. Review acceptance criteria from task analysis
4. Generate structured update
5. Post to Linear using `create_comment`

**Update format:**
```markdown
## Progress Update

**Completed:**
- [Items from recent commits]
- [Completed acceptance criteria]

**In Progress:**
- [Current file changes]
- [Active work]

**Next Steps:**
- [Remaining acceptance criteria]
- [Planned work]

**Blockers:** [If any, or "None"]
```

#### Mark as Blocked

**Trigger phrases:**
- "Mark as blocked"
- "This is blocked by [reason]"
- "Pause this issue"

**Claude should:**
1. Ask: "What type of blocker is this?"

   **Options:**
   - **Waiting on person** - Need input/approval from someone
   - **Blocked by another issue** - Dependencies on other work
   - **External dependency** - Third-party service, API, library
   - **Decision needed** - Architectural or product decision required
   - **Missing information** - Need specs, designs, or requirements
   - **Technical blocker** - Infrastructure, tooling, or environment issue

2. Based on blocker type, ask follow-up:
   - **Person** → "Who are you waiting on?"
   - **Issue** → "Which issue is blocking this?" (can create if doesn't exist)
   - **External** → "What external dependency?"
   - **Decision** → "Who needs to make this decision?"
   - **Information** → "What information is needed and from whom?"
   - **Technical** → "What's the technical blocker?"

3. Ask: "When do you expect this to be unblocked?"
   - **Today/Tomorrow** - Check back soon
   - **This week** - Follow up in a few days
   - **Unknown** - May need escalation
   - **Waiting on response** - Track in Linear

4. Update issue status to "On Hold" using `update_issue`

5. Post detailed blocker comment with all context

6. If blocker is another issue:
   - Offer to create blocker issue if it doesn't exist
   - Link issues using "blocks" relationship

7. Commit any WIP changes with blocker context

8. Offer: "Would you like to switch to another issue, or should I show you other available work?"

**Blocked comment format:**
```markdown
## Issue Blocked

**Blocker Type:** [Type from options above]

**Details:** [Specific blocker description]

**Waiting On:** [Person/Team/Issue/External dependency]

**Expected Resolution:** [Timeline or "Unknown"]

**Action Required:** [What needs to happen to unblock]

**Related Issue:** [If blocker issue created]

**Impact:** [How this affects timeline/scope]

Work paused until blocker is resolved.
```

#### Request Clarification

**Trigger phrases:**
- "Request clarification on [topic]"
- "Ask about [topic]"
- "Need clarification: [question]"

**Claude should:**
1. Ask: "Who should clarify this?"

   **Options:**
   - **Issue creator** (default)
   - **Product owner/manager** - Product decisions
   - **Tech lead/architect** - Technical decisions
   - **Designer** - UI/UX questions
   - **Specific person** - Ask for name

2. Ask: "How urgent is this clarification?"

   **Options:**
   - **Blocking** - Can't proceed without it (status → "On Hold")
   - **Important** - Affects approach but can make progress (keep current status)
   - **Nice to have** - Can proceed with assumptions (keep current status)

3. Based on urgency:
   - **Blocking** → Update status to "On Hold", tag with "needs-clarification"
   - **Important/Nice to have** → Keep current status, add comment only

4. Post formatted question to Linear with appropriate tags

5. Offer based on urgency:
   - **Blocking** → "Would you like to switch to another issue?"
   - **Important/Nice to have** → "Should I continue with my current understanding?"

**Clarification comment format:**
```markdown
## Clarification Needed

**Priority:** [Blocking / Important / Nice to have]

**Question:** [User's question]

**Context:** [Why this clarification is needed]

**Current Understanding:** [What Claude assumes]

**Impact:** [How this affects implementation]

**Options Considered:**
1. [Option A - pros/cons]
2. [Option B - pros/cons]

@[person] - Could you provide clarification?

**If no response:** [What will I assume / How will I proceed]
```

---

### Context Switching

#### Pause Work

**Trigger phrases:**
- "Pause work on this"
- "Switch away from this"
- "Save progress and switch"

**Claude should:**
1. Ask: "Why are you pausing?"

   **Options:**
   - **Switching priorities** - Higher priority work came up
   - **Blocked** - Can't proceed (triggers "Mark as Blocked" flow)
   - **End of day** - Normal work pause
   - **Need break** - Stepping away temporarily
   - **Other reason** - Ask for details

2. Ask: "When do you plan to resume?"

   **Options:**
   - **Later today** - Short pause
   - **Tomorrow** - End of day
   - **Next week** - Longer pause
   - **Unknown** - Depends on other factors

3. Based on reason:
   - **Blocked** → Follow "Mark as Blocked" flow instead
   - **Other reasons** → Continue with pause flow

4. Commit all changes with descriptive WIP message including reason

5. Post pause comment to Linear with context

6. Return to main branch (`git checkout main && git pull`)

7. Based on next action:
   - **Switching priorities** → "Which issue would you like to work on next?"
   - **End of day** → "Have a good evening! Your work is safely committed."
   - **Need break** → "Take your time! Your progress is saved."

**WIP commit format:**
```
wip: [Brief description of current state] (DEV-XXX)

Reason: [Why pausing]
Resume: [When planning to resume]

Progress saved:
- [Key changes made]
- [Current focus]

Next: [What to do when resuming]

Related: DEV-XXX
```

**Pause comment to Linear:**
```markdown
## Work Paused

**Reason:** [Why pausing]

**Expected Resume:** [When planning to resume]

**Progress:**
- [Summary of work completed]

**Current State:**
- [What's been done]
- [What's pending]

**Resume Notes:** [Context for resuming]

**Branch:** feature/DEV-XXX-description (WIP committed)
```

#### What Am I Working On?

**Trigger phrases:**
- "What am I working on?"
- "Show my active issues"
- "List my work"

**Claude should:**
1. Use Linear MCP to search issues assigned to user with status "In Progress"
2. For each issue, check for local git branch
3. Show last activity on each
4. Offer to continue any of them

**Display format:**
```
📋 Your Active Work:

1. DEV-456: Feature description
   Branch: feature/DEV-456-description
   Last commit: 2 hours ago
   Status: In Progress

2. DEV-789: Bug fix description
   Branch: feature/DEV-789-bug-fix
   Last commit: 1 day ago
   Status: In Progress

Which would you like to continue? (or "start new issue")
```

---

### Query & Reporting Commands

These commands help discover, triage, and understand what's happening across the team.

#### Fetch Recent Bugs

**Trigger phrases:**
- "Fetch me any recent bugs"
- "Show me new bugs"
- "What bugs need analysis?"
- "Are there any unanalyzed bugs?"

**Claude should:**
1. Use Linear MCP to search for issues with:
   - Label/tag contains "bug" OR title contains "[BUG]"
   - Status is "To Do" OR any status where `meaning` includes "not yet analyzed"
   - Created within last 7 days (or ask user for timeframe)

2. For each bug found, check:
   - Has Claude analysis been posted? (check comments)
   - Current status and what it means
   - Priority level

3. Present bugs grouped by priority

4. Offer to analyze any bug

**Display format:**
```
🐛 Recent Bugs (7 days)

High Priority:
  1. DEV-456: Login fails on Safari [To Do]
     Created: 2 days ago
     Status: Not yet analyzed

  2. DEV-478: Data loss in checkout flow [To Do]
     Created: 4 days ago
     Status: Not yet analyzed

Normal Priority:
  3. DEV-489: Button alignment off on mobile [To Do]
     Created: 1 day ago
     Status: Not yet analyzed

Low Priority:
  4. DEV-492: Typo in error message [Backlog]
     Created: 5 days ago
     Status: Low priority

Total: 4 bugs need analysis

Would you like me to analyze any of these? (say "analyze DEV-456" or "analyze all")
```

**Status-aware filtering:**
```javascript
// Use status definitions to find "not analyzed" issues
const unanalyzedStatuses = Object.values(config.linear.statuses).filter(s =>
  s.meaning?.includes('not yet analyzed') ||
  s.meaning?.includes('not analyzed') ||
  s.meaning?.includes('New issues') ||
  s.name === 'To Do'
);

// Find bugs in those statuses
const bugs = await searchIssues({
  filter: {
    state: { in: unanalyzedStatuses.map(s => s.id) },
    labels: { some: { name: { containsIgnoreCase: 'bug' } } },
    createdAt: { gte: sevenDaysAgo }
  }
});
```

#### Fetch High Priority Items

**Trigger phrases:**
- "Let's get some high priority items"
- "Show me high priority issues"
- "What's urgent?"
- "Give me the important stuff"

**Claude should:**
1. Use Linear MCP to search for issues with:
   - Priority: Urgent (1) or High (2)
   - Status is NOT "Done" or "Canceled"
   - Status is NOT in any status where `meaning` includes "completed"

2. Group by status using status definitions:
   - **Needs Analysis**: Status meaning includes "not analyzed"
   - **Ready to Start**: Status meaning includes "ready to start" or "no blockers"
   - **Blocked**: Status meaning includes "blockers" or "feedback"
   - **In Progress**: Status meaning includes "actively working"
   - **Review**: Status meaning includes "review"
   - **Other**: Everything else

3. Show which ones you can start immediately

4. Offer to start work on any issue

**Display format:**
```
⚡ High Priority Items

🔴 Urgent (Priority 1):

  Ready to Start:
    1. DEV-401: Fix payment gateway timeout [Ready for Development]
       Analyzed 1 day ago, no blockers

  In Progress:
    2. DEV-423: Implement 2FA authentication [In Progress]
       Started 3 hours ago by @alice
       Branch: feature/DEV-423-2fa

🟠 High (Priority 2):

  Needs Analysis:
    3. DEV-445: Optimize database queries [To Do]
       Created 2 days ago, not yet analyzed

  Blocked:
    4. DEV-467: Add export to CSV feature [Feedback Required]
       Blocked: Waiting on API design from backend team

  Review:
    5. DEV-489: Update user permissions UI [Review Required]
       PR #234 merged to staging, needs review

Total: 5 high priority items
  • 1 ready to start immediately
  • 1 needs analysis
  • 1 blocked
  • 2 in progress/review

Recommendation: Start with DEV-401 (payment gateway fix)

Would you like to work on any of these? (say "start DEV-401")
```

**Status-aware grouping:**
```javascript
// Use status definitions to intelligently group issues
function categorizeByStatus(issues, statusDefinitions) {
  const categories = {
    needsAnalysis: [],
    readyToStart: [],
    blocked: [],
    inProgress: [],
    review: [],
    other: []
  };

  for (const issue of issues) {
    const statusDef = findStatusByName(statusDefinitions, issue.state.name);

    if (statusDef.meaning?.includes('not analyzed') || statusDef.meaning?.includes('not yet analyzed')) {
      categories.needsAnalysis.push(issue);
    } else if (statusDef.meaning?.includes('ready to start') || statusDef.meaning?.includes('no blockers')) {
      categories.readyToStart.push(issue);
    } else if (statusDef.meaning?.includes('blockers') || statusDef.meaning?.includes('feedback')) {
      categories.blocked.push(issue);
    } else if (statusDef.meaning?.includes('actively working') || statusDef.meaning?.includes('in progress')) {
      categories.inProgress.push(issue);
    } else if (statusDef.meaning?.includes('review')) {
      categories.review.push(issue);
    } else {
      categories.other.push(issue);
    }
  }

  return categories;
}
```

#### What Are We Busy With (Team Status)

**Trigger phrases:**
- "What are we busy with?"
- "What's the team working on?"
- "Show all active work"
- "What's in progress?"

**Claude should:**
1. Use Linear MCP to search for ALL issues (not just mine) with:
   - Status where `meaning` includes "actively working" or "in progress"
   - Include assignee information

2. Group by:
   - Team member (if multiple people)
   - Priority level
   - Time in status

3. Identify:
   - Issues stuck too long (> 3 days in progress with no commits)
   - Blocked issues that weren't moved to correct status
   - High priority items

4. Provide team overview

**Display format:**
```
👥 Team Activity - In Progress Issues

Alice (@alice):
  1. DEV-423: Implement 2FA authentication [High Priority]
     In progress for: 3 hours
     Last commit: 45 minutes ago
     Branch: feature/DEV-423-2fa

  2. DEV-445: Optimize database queries [Normal Priority]
     In progress for: 2 days
     Last commit: 2 days ago ⚠️  No recent activity
     Branch: feature/DEV-445-optimize

Bob (@bob):
  3. DEV-467: Add CSV export [Normal Priority]
     In progress for: 1 day
     Last commit: 3 hours ago
     Branch: feature/DEV-467-csv-export

Carol (@carol):
  4. DEV-489: Update permissions UI [High Priority]
     In progress for: 4 hours
     Last commit: 30 minutes ago
     Branch: feature/DEV-489-permissions

Unassigned:
  5. DEV-501: Fix mobile layout [Normal Priority] ⚠️
     In progress for: 5 days
     No assignee, no branch found

Summary:
  • Total: 5 issues in progress
  • High priority: 2
  • ⚠️  Attention needed: 2 (no recent activity or unassigned)

Potential issues:
  • DEV-445: No commits in 2 days - blocked?
  • DEV-501: 5 days in progress with no assignee - stale?

Would you like to:
  • Start new work
  • Check on stalled issues
  • Review team capacity
```

**Status-aware team query:**
```javascript
// Find all "in progress" issues using status definitions
const inProgressStatuses = Object.values(config.linear.statuses).filter(s =>
  s.meaning?.includes('actively working') ||
  s.meaning?.includes('in progress') ||
  s.meaning?.includes('branch checked out')
);

// Get all team's active work
const activeIssues = await searchIssues({
  filter: {
    state: { in: inProgressStatuses.map(s => s.id) },
    team: { id: { eq: config.linear.teamId } }
  },
  includeArchived: false
});

// For each issue, check for:
// 1. Git branch existence
// 2. Last commit time
// 3. Comments/activity
// 4. Time in current status

const enrichedIssues = await Promise.all(
  activeIssues.map(async issue => {
    const branch = await findBranch(issue.identifier);
    const lastCommit = branch ? await getLastCommitTime(branch) : null;
    const timeInStatus = Date.now() - new Date(issue.stateUpdatedAt);

    return {
      ...issue,
      branch,
      lastCommit,
      timeInStatus,
      needsAttention: timeInStatus > 3 * 24 * 60 * 60 * 1000 || !branch // > 3 days or no branch
    };
  })
);
```

**Smart recommendations:**
```javascript
// Provide intelligent recommendations based on team status
function generateRecommendations(issues, config) {
  const recommendations = [];

  // Find stalled issues
  const stalledIssues = issues.filter(i => i.needsAttention);
  if (stalledIssues.length > 0) {
    recommendations.push({
      type: 'stalled',
      message: `${stalledIssues.length} issue(s) may be stalled (no recent activity)`,
      action: 'Check if these should be moved to "On Hold" or "Feedback Required"'
    });
  }

  // Find high priority items
  const highPriorityCount = issues.filter(i => i.priority <= 2).length;
  if (highPriorityCount > 3) {
    recommendations.push({
      type: 'capacity',
      message: `${highPriorityCount} high priority issues in progress`,
      action: 'Consider if team is overloaded or if priorities need adjustment'
    });
  }

  // Find unassigned issues
  const unassignedCount = issues.filter(i => !i.assignee).length;
  if (unassignedCount > 0) {
    recommendations.push({
      type: 'unassigned',
      message: `${unassignedCount} issue(s) in progress with no assignee`,
      action: 'These may have been auto-updated but not started yet'
    });
  }

  return recommendations;
}
```

---

### Quick Actions

#### Ready for Review

**Trigger phrases:**
- "Ready for review"
- "Create PR and request review"
- "This is ready"

**Claude should:**
1. Ask: "Have you tested this thoroughly?"

   **Options:**
   - **Yes, fully tested** - Proceed with PR creation
   - **No, need to test** - Offer to help write/run tests
   - **Partially tested** - Ask what still needs testing

2. If not fully tested, ask: "Should I help you test first, or create PR anyway?"

3. Ask: "Who should review this?"

   **Options:**
   - **Team** (default) - No specific reviewers
   - **Specific person** - Ask for GitHub username
   - **Multiple people** - Ask for list of usernames
   - **Auto-assign** - Use CODEOWNERS or team defaults

4. Ask: "Are there any specific areas reviewers should focus on?"
   - If yes, capture focus areas
   - If no, auto-generate from changed files

5. Commit any pending changes with proper message

6. Push branch

7. Create PR via `gh pr create` with reviewers if specified

8. Post comprehensive PR summary to Linear

9. Update status to "Review Required" (via GitHub Actions)

10. Offer: "Would you like to work on another issue while this is in review?"

**PR summary to Linear:**
```markdown
## Pull Request Created

**PR:** [PR URL]

**Reviewers:** [Tagged reviewers or "Team"]

**Changes:**
- [Key changes from commits]
- [Files modified summary]

**Testing:**
- [Tests added/updated]
- [Manual testing performed]
- [Test coverage: X%]

**Review Focus:**
- [Area 1 - why it needs attention]
- [Area 2 - why it needs attention]

**Screenshots/Demos:**
[If UI changes]

**Breaking Changes:** [Yes/No - details if yes]

**Status:** 🟠 In Review

**Merge Target:** [main/staging/prod]
```

#### Address Review Comments

**Trigger phrases:**
- "Address review comments"
- "Fix PR feedback"
- "Update based on review"

**Claude should:**
1. Fetch PR review comments via `gh pr view`
2. Create checklist of comments
3. Post checklist to Linear
4. Work through each comment
5. Commit fixes with references
6. Post update when complete

**Review checklist format:**
```markdown
## Addressing Review Comments

PR: [PR URL]

**Comments to Address:**
- [ ] [Comment 1 summary]
- [ ] [Comment 2 summary]
- [ ] [Comment 3 summary]

**Progress:**
[Updates as each item completed]
```

---

### Best Practices for Command Implementation

**Context Awareness:**
- Always check if currently working on an issue before certain commands
- Infer current issue from branch name if possible
- If no current issue context, ask user to specify

**Error Handling:**
- If MCP tools fail, fall back to Linear API (curl)
- If git operations fail, explain clearly and suggest fix
- Always verify Linear updates succeeded

**Confirmation:**
- For destructive actions (pause, switch), confirm first
- For issue creation, show preview before creating
- Always return URLs/IDs after creating issues

**Natural Language:**
- Support variations of trigger phrases
- Don't require exact wording
- Understand intent from context

**Efficiency:**
- Batch MCP operations when possible
- Don't re-fetch data unnecessarily
- Cache issue context during session

## Configuration File Schema

The `.linear-workflow.json` file structure:

```json
{
  "version": "1.0.0",
  "project": {
    "name": "project-name",
    "path": "/full/path/to/project"
  },
  "branches": {
    "main": "main",
    "staging": "staging",
    "prod": "prod"
  },
  "linear": {
    "teamKey": "DEV",
    "teamId": "uuid-here",
    "teamName": "Development",
    "workspaceId": "uuid-here",
    "workspaceName": "Acme Inc",
    "statuses": {
      "backlog": {
        "name": "Backlog",
        "id": "uuid-here",
        "meaning": "Low priority / nice to have features",
        "trigger": "User manually triages as low priority",
        "automated": false
      },
      "todo": {
        "name": "To Do",
        "id": "uuid-here",
        "meaning": "New issues, not yet analyzed",
        "trigger": "When issue is created or imported",
        "automated": true
      },
      "readyForDev": {
        "name": "Ready for Development",
        "id": "uuid-here",
        "meaning": "Claude analyzed issue, no blockers, ready to start",
        "trigger": "After Claude completes analysis with no blockers",
        "automated": true
      },
      "feedbackRequired": {
        "name": "Feedback Required",
        "id": "uuid-here",
        "meaning": "Claude analyzed but found blockers/needs clarification",
        "trigger": "When blockers or questions discovered during analysis",
        "automated": true
      },
      "inProgress": {
        "name": "In Progress",
        "id": "uuid-here",
        "meaning": "Actively working on issue, branch checked out",
        "trigger": "Push to feature branch",
        "automated": true,
        "gitEvent": "push_feature_branch"
      },
      "onHold": {
        "name": "On Hold",
        "id": "uuid-here",
        "meaning": "User paused work on this issue",
        "trigger": "User says 'pause work on this'",
        "automated": true
      },
      "inReview": {
        "name": "In Review",
        "id": "uuid-here",
        "meaning": "Someone is actively reviewing the code",
        "trigger": "Manual - when reviewer starts review",
        "automated": false
      },
      "reviewRequired": {
        "name": "Review Required",
        "id": "uuid-here",
        "meaning": "PR merged to staging, needs code review",
        "trigger": "Merge to staging/testing branch",
        "automated": true,
        "gitEvent": "merge_to_staging"
      },
      "approved": {
        "name": "Approved",
        "id": "uuid-here",
        "meaning": "Ready for production release",
        "trigger": "Manual approval after review",
        "automated": false
      },
      "released": {
        "name": "Released",
        "id": "uuid-here",
        "meaning": "Deployed to production, monitoring for issues",
        "trigger": "Merge to production branch",
        "automated": true,
        "gitEvent": "merge_to_prod"
      },
      "done": {
        "name": "Done",
        "id": "uuid-here",
        "meaning": "Completed and verified, no issues after release",
        "trigger": "Manual - 30 days after release with no feedback",
        "automated": false
      },
      "canceled": {
        "name": "Canceled",
        "id": "uuid-here",
        "meaning": "Issue no longer relevant or needed",
        "trigger": "Manual - when issue is cancelled",
        "automated": false
      }
    }
  },
  "formats": {
    "commit": "conventional-parens",
    "pr": "issue-prefix",
    "issuePattern": "[A-Z]+-\\d+",
    "issueExample": "DEV-123",
    "issueReference": "related",
    "issueReferenceKeyword": "Related"
  },
  "detail": "technical",
  "paths": {
    "issues": "/docs/issues/",
    "workflow": "/.github/workflows/linear-status-update.yml"
  },
  "linearAutomations": {
    "magicWordsEnabled": false,
    "checkedAt": "2025-01-11T10:30:00Z",
    "note": "If true, using Closes/Fixes may conflict with GitHub Actions"
  },
  "githubActions": {
    "enabled": true,
    "apiKeyConfigured": true
  },
  "installed": "2025-01-11T10:30:00Z"
}
```

## Template Variables Reference

When rendering templates, replace these placeholders:

### Branch Variables
- `{{branches.main}}` → User's main branch name
- `{{branches.staging}}` → Staging branch (or empty)
- `{{branches.prod}}` → Production branch (or empty)

### Linear Variables
- `{{linear.teamKey}}` → Team key (e.g., "DEV")
- `{{linear.teamName}}` → Full team name
- `{{linear.workspaceName}}` → Workspace name
- `{{linear.statuses.inProgress}}` → Status name for active work
- `{{linear.statuses.review}}` → Status name for review
- `{{linear.statuses.done}}` → Status name for completion

### Format Variables
- `{{formats.issuePattern}}` → Regex pattern for issues
- `{{formats.issueExample}}` → Example issue ID
- `{{formats.commit}}` → Commit format identifier
- `{{formats.pr}}` → PR format identifier

### Path Variables
- `{{paths.issues}}` → Issue docs directory
- `{{project.name}}` → Project name
- `{{project.path}}` → Full project path

## Best Practices

1. **Always validate** - Check user inputs before proceeding
2. **Be conversational** - Use friendly language, not robotic
3. **Show progress** - Use checkmarks and status indicators via TodoWrite
4. **Handle errors gracefully** - Never crash, always suggest fixes
5. **Use installation branch** - Create setup/linear-workflow branch for safety
6. **Test connections** - Verify Linear API and GitHub CLI work before proceeding
7. **Provide examples** - Show what generated files will look like
8. **Allow customization** - Let users edit config after installation
9. **Minimal emojis** - Use sparingly, only for status indicators ([✓] [ ] [✗])
10. **Update TODOs** - Mark tasks in_progress, then completed after EACH step
11. **Batch read commands** - Combine read-only operations into single commands to minimize approval prompts
12. **Auto-create templates** - Set up Linear issue templates automatically
13. **Commit and push** - End by committing all changes to the installation branch
14. **Offer merge options** - Give users choice to merge directly, create PR, or test first

**Command Batching Strategy:**
- ✓ Batch all read-only checks together (git status, git remote, pwd, etc.)
- ✓ Batch git operations that belong together (checkout + commit + push)
- ✗ Never batch write operations with different purposes
- ✗ Keep Linear API calls separate (users should approve each API operation)

## Troubleshooting Guide

Include these common issues in error handling:

### Linear API Issues
- Invalid API key → Guide to create new one
- Team not found → List available teams
- No permission → Check user has correct Linear role

### MCP Server Issues
- **MCP server not connecting:**
  - Check `.mcp.json` file exists
  - Verify `LINEAR_API_KEY` is set in `.env` file
  - Try: `npx -y @modelcontextprotocol/server-linear` to test manually
  - Restart Claude Code after creating/updating `.mcp.json`

- **MCP tools not available:**
  - Ensure `.mcp.json` is in the project root directory
  - Check `.env` file has correct LINEAR_API_KEY format: `lin_api_...`
  - Verify Claude Code has loaded the MCP server (check status bar)

- **Environment variable not loading:**
  - Ensure `.env` file is in project root (same directory as `.mcp.json`)
  - Check for typos: must be exactly `LINEAR_API_KEY=...` (no spaces)
  - Try setting as system environment variable instead

### GitHub Issues
- Not authenticated → Run `gh auth login`
- No repo access → Check repository exists and user has admin
- Secrets permission → Ensure user has write access to secrets

### Git Issues
- Not in repo → Initialize git or cd to correct directory
- Dirty working tree → Suggest stashing or committing changes
- Branch exists → Offer to use existing or create new name

### Workflow vs MCP
**Remember:**
- GitHub Actions workflow uses Linear API (curl) - for CI/CD automation
- Claude Code uses Linear MCP server - for interactive development via OAuth
- Different authentication methods:
  - GitHub Actions: LINEAR_API_KEY from repository secrets
  - Claude Code: OAuth authentication via `claude mcp add` + `/mcp` command
  - Claude Desktop: OAuth authentication via global config file + restart

---

**Remember:** This is a setup tool. After installation, the workflow lives in the user's project, not in this repository.
