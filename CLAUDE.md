# CLAUDE.md

This file provides guidance to Claude Code when working with the Linear workflow setup wizard.

## Purpose

This repository is a **setup tool** that helps users install a complete Linear + Claude + GitHub workflow integration into their own projects. When a user says "Setup Linear workflow" or similar commands, Claude should execute the interactive setup wizard.

## Setup Wizard Trigger

Activate the wizard when the user says:
- "Setup Linear workflow"
- "Install Linear workflow"
- "Configure Linear integration"
- "Setup Linear + GitHub workflow"

## Setup Wizard Flow

### Phase 1: Pre-Flight Checks

Before starting the wizard, verify:

```bash
# Check git repository
git status

# Check GitHub CLI
gh auth status

# Check Node.js
node --version

# Check for LINEAR_API_KEY in environment
echo $LINEAR_API_KEY
```

**Display results:**
```
🔍 Pre-Flight Checks:
✓ Git repository detected
✓ GitHub CLI installed and authenticated
✓ Node.js installed (v18.0.0)
⚠ LINEAR_API_KEY not found (we'll set this up)
⚠ GitHub repository secrets not configured (we'll handle this)
```

If critical requirements missing (git, gh, node), **stop and guide user** to install them first.

### Phase 2: Configuration Wizard

Ask the user these questions **one at a time**, storing answers in memory:

#### Question 1: Project Location
```
Where would you like to install the Linear workflow?

Current directory: /path/to/user/project

Is this correct? [Y/n]
```

If no, ask for full path.

#### Question 2: GitHub Authentication
```
GitHub CLI Status:
✓ Logged in as <username>

We'll need to set up a LINEAR_API_KEY secret in your GitHub repository.
Would you like me to do this now? [Y/n]

(You can also do this manually later at:
https://github.com/<user>/<repo>/settings/secrets/actions)
```

#### Question 3: Branch Strategy
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

#### Question 4: Linear Configuration
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

#### Question 5: Commit & PR Formats
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

#### Question 6: Update Detail Level
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

#### Question 7: Documentation Location
```
Where should Claude store issue analysis documents?

1. /docs/issues/                           [Recommended]
2. /docs/dev-issues/                       [Alternative]
3. /.linear/issues/                        [Hidden folder]
4. Custom path

Your choice [1]: _____
```

### Phase 3: Configuration Summary

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

Is this correct? [Y/n]: _____
```

If no, ask which section to edit.

### Phase 4: Installation

Once confirmed, execute installation:

```
📦 Installing Linear Workflow...

1. Creating configuration file
   ✓ .linear-workflow.json created

2. Creating GitHub Actions workflow
   ✓ .github/workflows/linear-status-update.yml created

3. Creating workflow documentation
   ✓ docs/linear-workflow.md created

4. Configuring MCP integration
   ✓ .mcp.json created/updated

5. Installing git hooks
   ✓ .git/hooks/commit-msg installed

6. Creating issue documentation folder
   ✓ docs/issues/ created

7. Setting up GitHub secrets
   ✓ LINEAR_API_KEY added to repository secrets

8. Updating CLAUDE.md
   ✓ Linear workflow section added

✅ Installation complete!
```

### Phase 5: Next Steps

```
🚀 Your Linear workflow is ready!

Next steps:

1. Test the setup:
   "Start work on <ISSUE-ID>"

2. Review generated files:
   - .github/workflows/linear-status-update.yml
   - docs/linear-workflow.md
   - .linear-workflow.json

3. Customize if needed:
   - Edit workflow file for custom logic
   - Adjust status mappings in config

4. Share with your team:
   - Commit and push the workflow files
   - Share docs/linear-workflow.md with team

📖 Full documentation: docs/linear-workflow.md

Need help? Just ask!
```

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

Once workflow is installed, support these commands:

### Start Work on Issue
```
User: "Start work on DEV-456"

Claude should:
1. Fetch issue from Linear (get_issue)
2. Create task analysis document
3. Post summary to Linear
4. Create feature branch
5. Push initial commit
6. Confirm status updated
```

### Continue Existing Issue
```
User: "Continue DEV-456"

Claude should:
1. Fetch latest issue context
2. Find and checkout branch
3. Review previous work
4. Resume implementation
```

### Create Pull Request
```
User: "Create PR for DEV-456"

Claude should:
1. Create PR via gh CLI
2. Post summary to Linear
3. Update issue status
4. Return PR URL
```

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
3. **Show progress** - Use checkmarks and status indicators
4. **Handle errors gracefully** - Never crash, always suggest fixes
5. **Backup before overwrite** - If files exist, create `.backup` versions
6. **Test connections** - Verify Linear API and GitHub CLI work before proceeding
7. **Provide examples** - Show what generated files will look like
8. **Allow customization** - Let users edit config after installation

## Troubleshooting Guide

Include these common issues in error handling:

### Linear API Issues
- Invalid API key → Guide to create new one
- Team not found → List available teams
- No permission → Check user has correct Linear role

### GitHub Issues
- Not authenticated → Run `gh auth login`
- No repo access → Check repository exists and user has admin
- Secrets permission → Ensure user has write access to secrets

### Git Issues
- Not in repo → Initialize git or cd to correct directory
- Dirty working tree → Suggest stashing or committing changes
- Branch exists → Offer to use existing or create new name

---

**Remember:** This is a setup tool. After installation, the workflow lives in the user's project, not in this repository.
