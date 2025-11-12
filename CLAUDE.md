# CLAUDE.md

This file provides guidance to Claude Code when working with the Linear workflow setup wizard.

## Purpose

This repository is a **setup wizard** that installs a complete Linear + GitHub + Claude Code workflow integration into any project. The wizard automates:

- GitHub Actions workflow for automatic Linear status updates
- Linear MCP server configuration for Claude Code
- Git commit message validation hooks
- Comprehensive documentation and examples
- Linear issue templates (Bug, Improvement, Feature)

**Target Users:** Development teams using Linear for issue tracking who want seamless GitHub integration and Claude Code productivity tools.

**Installation Time:** ~5 minutes with automated pre-flight validation

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
Linear Workflow Setup

This wizard will install a complete Linear + GitHub integration into your project.

What will be installed:
  - GitHub Actions workflow for automatic status updates
  - Linear workflow configuration file
  - Git commit message validation hook
  - Team documentation and guidelines
  - GitHub repository secret (LINEAR_API_KEY)
  - Linear issue templates (Bug Report, Improvement, Feature)

What you'll need:
  - Linear API key (we'll guide you to create one)
  - GitHub authentication with 'workflow' scope
  - ~5 minutes to complete configuration

The wizard will:
  1. Run environment checks (git, GitHub CLI, Node.js)
  2. Fix any authentication issues automatically
  3. Ask configuration questions (branch strategy, statuses, formats)
  4. Install all files and configure GitHub
  5. Create a test issue to verify the setup

Would you like to continue? (Y/n)
```

**After user says yes, explain the setup process:**

```
Perfect! Here's what will happen:

Setup Overview:
  1. Environment checks (2 read-only commands - you'll approve these)
  2. Configuration questions (branch strategy, Linear connection, formats)
  3. File installation (Write/Edit tools - auto-approved by default)
  4. GitHub & Linear setup (you'll approve write operations individually)
  5. Test issue creation and verification

During setup:
  ✓ Read-only checks are batched (minimal approvals)
  ✓ Configuration questions are interactive
  ✓ File operations happen via tools (typically auto-approved)
  ⚠ Write operations require your approval (secrets, API calls, git push)

This ensures security while keeping the flow smooth.

Let's begin!
```

**IMPORTANT:**
- Batch all read-only commands together to minimize approval prompts
- Only ask for approval on write operations (gh secret set, git push, curl to Linear API)
- File operations via tools (Write, Edit) follow user's existing tool approval settings

## Setup Wizard Flow

### Phase 1: Initialize TODO List

**IMMEDIATELY after user approves setup, use TodoWrite to create the installation checklist:**

```
Setup Tasks:
[ ] Confirm project location
[ ] Create installation branch
[ ] Run pre-flight environment checks
[ ] Configure Linear workspace connection
[ ] Set up branch strategy and status mappings
[ ] Configure commit and PR formats
[ ] Install workflow files and documentation
[ ] Set up GitHub secrets and git hooks
[ ] Configure Linear MCP server
[ ] Create Linear issue templates
[ ] Create test issue
[ ] Test the workflow
[ ] Commit and push installation
```

**Update this TODO list after EACH step is completed using TodoWrite.**

Display format (minimal emojis):
```
Installation Progress:

[✓] Confirm project location
[✓] Create installation branch
[✓] Run pre-flight environment checks
[ ] Configure Linear workspace connection
[ ] Set up branch strategy and status mappings
...
```

### Phase 2: Confirm Project Location

**CRITICAL:** Before running any pre-flight checks, confirm where the workflow should be installed.

**Ask the user:**

```
Where would you like to install the Linear workflow?

Current directory: /path/to/user/project

Options:
1. Install in current directory
2. Install in a different directory

Your choice [1]: _____
```

**If option 2:**
```
Please provide the full path to your project directory:

Path: _____
```

**After getting the path, verify it exists (batched into one command):**

```bash
# Verify and confirm directory in one command
test -d "/path/to/project" && cd "/path/to/project" && echo "✓ Directory exists: $(pwd)" || echo "✗ Directory not found"
```

**Important notes:**
- This repository (claude-linear-gh-starter) is the setup TOOL itself
- Users typically want to install the workflow in their OWN project
- If they choose the current directory and it's the setup tool repo, warn them:
  ```
  ⚠️  Warning: You're installing in the setup tool repository itself.

  This is typically used for testing. Most users want to install
  the workflow in their own project directory instead.

  Continue with current directory? (Y/n)
  ```

**Mark TODO as completed after confirming location.**

### Phase 3: Create Installation Branch

**IMPORTANT:** Before making any changes, create a new branch for the installation.

**Ask the user:**

```
For safety, I'll install the workflow on a new branch.

You can review all changes before merging to your main branch.

Branch name [setup/linear-workflow]:
```

**Create the branch:**

```bash
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

### Phase 4: Pre-Flight Checks (AUTOMATIC)

**CRITICAL:** When the user triggers "Setup Linear workflow", AUTOMATICALLY run pre-flight checks FIRST.

This prevents installation failures by catching issues upfront and fixing them automatically.

**Why Pre-Flight Checks Matter:**
- Catches ~95% of common setup issues before installation begins
- Prevents failures at the final git push step (most common error)
- Validates GitHub `workflow` scope (required to push `.github/workflows/` files)
- Reduces average time to resolution from 15-30 minutes to 2-5 minutes

**Mark TODO as in_progress, then run checks, then mark as completed.**

**Run these checks automatically (batched to minimize approval prompts):**

```bash
# Batch 1: All environment checks in target directory (one approval)
cd "/path/to/project" && \
  echo "=== DIRECTORY ===" && pwd && \
  echo "=== GIT REPO ===" && git rev-parse --git-dir 2>/dev/null && \
  echo "=== GIT STATUS ===" && git status --porcelain && \
  echo "=== GIT REMOTES ===" && git remote -v && \
  echo "=== EXISTING WORKFLOW ===" && (test -f .linear-workflow.json && cat .linear-workflow.json || echo "No existing workflow") && \
  echo "=== GITHUB REPO ===" && gh repo view --json nameWithOwner,isPrivate 2>&1

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
  Scopes: repo, workflow ✓

Checking GitHub repository... ✓
  Repository: owner/repo-name
  🔒 Private repository

Checking Node.js... ✓
  Version: v18.17.0

Checking working directory... ✓
  Clean

Checking LINEAR_API_KEY... ⚠
  Not in environment (we'll ask during setup)

Checking for existing workflow... ✓
  No existing workflow (clean install)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All checks passed!

Your environment is ready for Linear workflow setup.
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
- **WARNINGS (can continue):** No Node.js, dirty working directory

**For auth BLOCKERS:** Automatically offer to fix them inline. Do not proceed until resolved.
**For install BLOCKERS:** Guide user to install, then retry checks.
**For WARNINGS:** Display but allow user to continue.

---

**CRITICAL: Make the flow seamless - "Click, Click, Boom"**
- Don't make users run commands manually
- Don't make them restart the wizard
- Fix auth issues inline and continue automatically
- One continuous flow from start to finish

### Phase 5: Configuration Wizard

Ask the user these questions **one at a time**, storing answers in memory:

#### Question 1: GitHub Authentication
```
GitHub CLI Status:
✓ Logged in as <username>

We'll need to set up a LINEAR_API_KEY secret in your GitHub repository.
Would you like me to do this now? [Y/n]

(You can also do this manually later at:
https://github.com/<user>/<repo>/settings/secrets/actions)
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

#### Question 3: Linear Configuration
```
Let's connect to your Linear workspace.

Please provide your Linear API key (create one at: https://linear.app/settings/api)

LINEAR_API_KEY: _____

(This will be stored in your GitHub secrets and local .env file)
```

Then fetch and display:
```
✓ Connected to Linear workspace: <Workspace Name>

Available teams:
1. DEV - Development
2. ENG - Engineering
3. PRODUCT - Product Team

Which team should we configure? [1]: _____
```

After team selected, fetch workflow states:
```
✓ Team "DEV" selected

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

#### Question 4: Commit & PR Formats
```
Choose your commit message format:

1. <type>: <description> (ISSUE-123)        [Conventional commits]
2. ISSUE-123: <description>                 [Issue prefix]
3. <type>(ISSUE-123): <description>         [Issue in scope]
4. Custom format

Your choice [1]: _____
```

```
Choose your PR title format:

1. ISSUE-123: Description                   [Issue prefix]
2. [ISSUE-123] Description                  [Issue in brackets]
3. Custom format

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
```
Would you like to automatically assign issues to team members when status changes?

This helps notify the right people (e.g., reviewers, QA engineers) when an issue needs their attention.

Enable auto-assignment? (Y/n): _____
```

**If yes:**
```
Fetching team members from Linear...

Team Members:
1. Alice Smith - alice@company.com
2. Bob Jones - bob@company.com
3. Carol White - carol@company.com
4. None (skip)

When issue moves to "In Progress", assign to: _____
When issue moves to "Review Required", assign to: _____
When issue moves to "QA", assign to: _____

If an issue is already assigned, should we:
1. Replace with configured assignee
2. Keep original assignee (skip auto-assignment)

Your choice [2]: _____
```

**If no:**
```
✓ Auto-assignment disabled
```

**See:** [Auto-Assignment Documentation](docs/auto-assignment.md) for details on this feature.

### Phase 6: Configuration Summary

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

Formats:
  Commit: <type>: <description> (DEV-123)
  PR Title: DEV-123: Description
  Issue Pattern: DEV-\d+

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

### Phase 7: Installation

Once confirmed, execute installation:

```
📦 Installing Linear Workflow...

1. Creating configuration file
   ✓ .linear-workflow.json created

2. Creating GitHub Actions workflow
   ✓ .github/workflows/linear-status-update.yml created

3. Creating workflow documentation
   ✓ docs/linear-workflow.md created

4. Creating MCP reference files
   ✓ .mcp.json created (reference for Claude Desktop users)
   ✓ .env.example created (reference template)
   ✓ .gitignore updated

5. Installing git hooks
   ✓ .git/hooks/commit-msg installed

6. Creating issue documentation folder
   ✓ docs/issues/ created

7. Setting up GitHub secrets
   ✓ LINEAR_API_KEY added to repository secrets

✅ Installation complete!
```

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

### Phase 8: Configure Linear MCP Server

**CRITICAL:** This phase requires user interaction and cannot be automated.

**After files are created, configure MCP server for Claude Code:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Setting up Linear MCP Server...

For Claude Code (CLI):

Step 1: Adding Linear MCP server to your configuration...
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

Step 2: Authentication Required

To complete setup, you need to authenticate with Linear.

Please type: /mcp

This will:
  1. Open a browser window
  2. Prompt you to log in to Linear
  3. Grant Claude Code access to your Linear workspace

⚠️  I cannot proceed until you authenticate. Please run /mcp now.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After you authenticate, say "done" or "authenticated" to continue.
```

**Wait for user to:**
1. Type `/mcp` in Claude Code
2. Complete OAuth authentication in browser
3. Confirm they're authenticated

**When user confirms authentication, verify it worked:**

```
✅ MCP Server Authentication Complete!

Verifying connection...
```

**Test the connection by attempting to use a Linear MCP tool (e.g., list teams):**

If successful:
```
✓ Linear MCP server connected successfully
✓ Can access workspace: {{workspaceName}}

Continuing with template creation...
```

If failed:
```
❌ MCP authentication failed or incomplete

Please ensure you:
  1. Ran /mcp command
  2. Completed OAuth flow in browser
  3. Granted all required permissions

Try again? (Y/n)
```

**Documentation Reference:**

The project includes `.mcp.json` as a reference file for team members using Claude Desktop.

**For Claude Desktop users:**
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
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
Then restart Claude Desktop application.

**Mark TODO as completed after MCP authentication successful.**

### Phase 9: Create Linear Issue Templates

**After installation completes, automatically create Linear templates:**

```
Creating Linear issue templates...

[1/3] Bug Report template
[2/3] Improvement template
[3/3] New Feature template
```

**Use Linear API to create templates:**

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

**Mark TODO as completed after templates are created.**

### Phase 10: Create Test Issue

**After templates are created, create a test issue using Linear API:**

**IMPORTANT:** Since MCP authentication is now complete, you could use MCP tools here, but for consistency during installation, continue using curl.

```
Creating test issue to verify setup...
```

**Create issue via Linear API:**

```bash
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{
    "query": "mutation { issueCreate(input: {
      teamId: \"{{teamId}}\",
      title: \"Test Linear + Claude + GitHub Integration\",
      description: \"This is a test issue to verify the Linear workflow setup.\\n\\nWhen you commit code referencing this issue, it should automatically:\\n- Update to In Progress when pushed to a feature branch\\n- Update to Review Required when merged to main\\n- Update to Done when merged to prod\\n\\nTest by running: git commit -m \\\"test: Verify workflow ({{issueId}})\\\"\"
      stateId: \"{{todoStateId}}\"
    }) { success issue { id identifier title url } } }"
  }'
```

**Capture the created issue ID and display:**

```
Test issue created: {{ISSUE-ID}}

Title: Test Linear + Claude + GitHub Integration
URL: https://linear.app/{{workspace}}/issue/{{ISSUE-ID}}
```

**Mark TODO as completed.**

### Phase 11: Test the Workflow

**After test issue is created, prompt user to test the complete workflow:**

**CRITICAL:** Do NOT run git commands automatically. Instead, guide the user to trigger the workflow naturally.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Setup Complete - Ready for Testing!

I've created a test issue to verify the workflow:
  {{ISSUE-ID}}: Test Linear + Claude + GitHub Integration
  URL: https://linear.app/{{workspace}}/issue/{{ISSUE-ID}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: The GitHub Actions workflow won't be active until you merge
   the setup/linear-workflow branch to main. However, we can test the Linear
   MCP integration right now!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 Let's test it out!

To test, say: "Let's get to work on {{ISSUE-ID}}"

This will trigger the full Linear workflow:
  1. Fetch issue details using Linear MCP tools
  2. Create task analysis document in /docs/issues/
  3. Post summary comment to Linear issue
  4. Create feature branch (feature/{{ISSUE-ID}}-test-setup)
  5. Make initial commit with issue reference
  6. Push to GitHub
  7. Verify commit message hook validation
  8. Test Linear MCP integration end-to-end

After testing successfully, we'll commit the installation and you can merge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to test? Say "Let's get to work on {{ISSUE-ID}}" or "skip" to finalize installation.
```

**If user triggers workflow ("Let's get to work on..."):**

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

**If user skips testing:**

```
No problem! You can test the workflow after installation.

Let's finalize the installation.
```

### Phase 12: Commit and Push Installation

**After testing is complete (or skipped), switch back to setup branch and commit all installation files:**

```
Switching back to setup/linear-workflow branch...
Committing all installation files...
```

**Batch all git operations together:**

```bash
cd "/path/to/project" && \
  git checkout setup/linear-workflow && \
  echo "✓ Switched to setup/linear-workflow" && \
  git add .linear-workflow.json .mcp.json .env .env.example .gitignore .github/ docs/ .git/hooks/commit-msg && \
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

  ✓ .linear-workflow.json - Workflow configuration
  ✓ .github/workflows/linear-status-update.yml - GitHub Actions workflow
  ✓ docs/linear-workflow.md - Complete documentation
  ✓ .mcp.json - Reference config for Claude Desktop users
  ✓ .env.example - Reference template
  ✓ .gitignore - Updated
  ✓ .git/hooks/commit-msg - Commit validation
  ✓ docs/issues/ - Issue documentation folder
  ✓ GitHub secret: LINEAR_API_KEY
  ✓ Linear MCP server: Configured via CLI (claude mcp add)
  ✓ Linear templates: Bug Report, Improvement, Feature
  ✓ Test issue: {{ISSUE-ID}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Review the changes:

  View files: git diff main setup/linear-workflow
  Review docs: cat docs/linear-workflow.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Ready to merge?

⚠️  IMPORTANT: Merge the setup/linear-workflow branch (NOT the test branch)

   The test branch (feature/{{ISSUE-ID}}-test-setup) was just for testing.
   You need to merge setup/linear-workflow to activate the workflow!

⚠️  After merging: The GitHub Actions workflow will become active and all
   commits with Linear issue references will automatically update issue statuses!

Option 1 - Direct merge (if you've reviewed and approved):
  git checkout main
  git merge setup/linear-workflow
  git push origin main

Option 2 - Create a Pull Request (recommended for team review):
  gh pr create --base main --head setup/linear-workflow \
    --title "feat: Add Linear workflow integration" \
    --body "Adds complete Linear + GitHub + Claude workflow automation.

See docs/linear-workflow.md for usage guide."

After merging setup/linear-workflow to main:
  ✓ GitHub Actions workflow will be active
  ✓ All commits with {{formats.issueExample}} will update Linear
  ✓ Team can start using the workflow immediately

Optional cleanup:
  git branch -d feature/{{ISSUE-ID}}-test-setup
  git push origin --delete feature/{{ISSUE-ID}}-test-setup

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

## Commands After Installation

Once workflow is installed, support these commands. These commands enable natural, conversational development workflows with Linear integration.

### Core Workflow Commands

#### Start Work on Issue

**Trigger phrases:**
- "Let's get to work on DEV-456"
- "Start work on DEV-456"
- "Begin DEV-456"

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
      "inProgress": "In Progress",
      "inProgressId": "uuid-here",
      "review": "Review Required",
      "reviewId": "uuid-here",
      "done": "Done",
      "doneId": "uuid-here"
    }
  },
  "formats": {
    "commit": "conventional-parens",
    "pr": "issue-prefix",
    "issuePattern": "[A-Z]+-\\d+",
    "issueExample": "DEV-123"
  },
  "detail": "technical",
  "paths": {
    "issues": "/docs/issues/",
    "workflow": "/.github/workflows/linear-status-update.yml"
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
