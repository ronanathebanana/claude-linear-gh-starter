# Setup Wizard Prompts

This file contains structured prompt templates for the Linear workflow setup wizard. Claude should use these prompts to guide users through the 7-question configuration flow.

## Prompt Design Principles

1. **Conversational tone** - Friendly, not robotic
2. **One question at a time** - Don't overwhelm users
3. **Clear defaults** - Show recommended choices
4. **Validation before proceeding** - Catch errors early
5. **Allow going back** - Users can revise answers
6. **Show progress** - Indicate where they are in the flow

---

## Question 1: Project Location

**Purpose:** Determine where to install the workflow files

**Prompt Template:**
```
📍 Project Location

Where would you like to install the Linear workflow?

Current directory: {{current_directory}}

Is this correct? (Y/n): _____
```

**If user says "no":**
```
Please provide the full path to your project directory:

Path: _____
```

**Validation:**
- Path must exist
- Path must be a git repository
- User must have write permissions

**Validation Errors:**

*If not a git repository:*
```
❌ This directory is not a git repository.

Would you like to:
1. Initialize git here (git init)
2. Choose a different directory
3. Cancel setup

Your choice: _____
```

*If path doesn't exist:*
```
❌ Directory not found: {{user_provided_path}}

Please check the path and try again, or type "cancel" to exit.

Path: _____
```

**Success:**
```
✓ Project location: {{project_path}}
```

---

## Question 2: GitHub Authentication

**Purpose:** Verify GitHub CLI access and offer to set up secrets

**Prompt Template:**
```
🔐 GitHub Authentication

Checking GitHub CLI status...

{{#gh_authenticated}}
✓ GitHub CLI authenticated as {{github_username}}
✓ Repository: {{repo_owner}}/{{repo_name}}
{{/gh_authenticated}}

{{^gh_authenticated}}
❌ GitHub CLI not authenticated

Please run: gh auth login

Then restart the setup wizard.
{{/gh_authenticated}}

{{#gh_authenticated}}
We'll need to set up a LINEAR_API_KEY secret in your GitHub repository.
This allows GitHub Actions to update Linear issues automatically.

Would you like me to set this up now? (Y/n): _____

(You can also do this manually later at:
https://github.com/{{repo_owner}}/{{repo_name}}/settings/secrets/actions)
{{/gh_authenticated}}
```

**If user says "yes":**
```
Great! We'll set up the secret during the Linear configuration step (Question 4).

For now, we'll continue with the setup.
```

**If user says "no":**
```
No problem! You can set up the LINEAR_API_KEY secret manually later.

To do this:
1. Go to your repository settings
2. Navigate to Secrets and variables → Actions
3. Create a new secret named LINEAR_API_KEY
4. Paste your Linear API key as the value

We'll remind you at the end of setup.
```

**Validation Errors:**

*If gh not installed:*
```
❌ GitHub CLI (gh) is not installed

Please install it first:
- Mac: brew install gh
- Linux: See https://github.com/cli/cli#installation
- Windows: See https://github.com/cli/cli#installation

Then run: gh auth login

After that, restart the setup wizard.
```

*If not in a GitHub repository:*
```
⚠️  This directory is not connected to a GitHub repository.

Would you like to:
1. Create a new GitHub repository
2. Connect to an existing repository
3. Continue without GitHub (manual setup required)
4. Cancel setup

Your choice: _____
```

**Success:**
```
✓ GitHub authentication configured
{{#will_setup_secret}}✓ Will configure LINEAR_API_KEY secret{{/will_setup_secret}}
{{^will_setup_secret}}⚠ Remember to add LINEAR_API_KEY secret manually{{/will_setup_secret}}
```

---

## Question 3: Branch Strategy

**Purpose:** Configure branch names for status updates

**Prompt Template:**
```
🌿 Branch Strategy

What branch names does your team use?

1. Simple (main only)
   - All work happens on feature branches
   - PRs merge directly to main

2. Standard (main + staging)                    [Recommended]
   - Feature branches → main (review/QA)
   - Main → staging (testing)

3. Enterprise (main + staging + prod)
   - Feature branches → main (review)
   - Main → staging (QA)
   - Staging → prod (production release)

4. Custom
   - Define your own branch names

Your choice [2]: _____
```

**If user chooses "1. Simple":**
```
✓ Branch strategy: Simple (main only)

Main branch name [main]: _____
```

**If user chooses "2. Standard":**
```
✓ Branch strategy: Standard (main + staging)

Main branch name [main]: _____
Staging branch name [staging]: _____
```

**If user chooses "3. Enterprise":**
```
✓ Branch strategy: Enterprise (main + staging + prod)

Main branch name [main]: _____
Staging branch name [staging]: _____
Production branch name [prod]: _____
```

**If user chooses "4. Custom":**
```
✓ Branch strategy: Custom

Let's configure your branch names.

Primary development branch (where PRs merge) [main]: _____

Staging/QA branch (leave empty if none): _____

Production branch (leave empty if none): _____
```

**Validation:**
- Branch names must be valid git branch names (no spaces, special characters)
- Main branch is required
- Staging and prod branches are optional
- Branch names must not conflict

**Validation Errors:**

*If invalid branch name:*
```
❌ Invalid branch name: "{{invalid_branch}}"

Branch names cannot contain:
- Spaces
- Special characters (except - and _)
- Start with a dot (.)

Please try again: _____
```

*If duplicate branch names:*
```
❌ Branch names must be unique

You entered "{{duplicate_name}}" for multiple branches.

Please use different names for each branch.
```

**Success:**
```
✓ Branch configuration:
  - Main: {{main_branch}}
  {{#staging_branch}}- Staging: {{staging_branch}}{{/staging_branch}}
  {{#prod_branch}}- Production: {{prod_branch}}{{/prod_branch}}
```

---

## Question 4: Linear Configuration

**Purpose:** Connect to Linear workspace and configure team settings

### Step 4a: API Key

**Prompt Template:**
```
🔗 Linear Configuration

Let's connect to your Linear workspace.

You'll need a Linear API key. If you don't have one:
1. Visit https://linear.app/settings/api
2. Click "Create new API key"
3. Give it a name like "GitHub Workflow Integration"
4. Copy the key (you won't see it again!)

Please paste your Linear API key:

LINEAR_API_KEY: _____

(This will be stored securely in GitHub secrets and your local .env file)
```

**While validating:**
```
Connecting to Linear...
```

**Validation Errors:**

*If API key invalid:*
```
❌ Invalid Linear API key

The API key you provided couldn't authenticate with Linear.

Common issues:
- Key was copied incorrectly (check for extra spaces)
- Key has been revoked
- Key doesn't have required permissions

Please try again or create a new API key at:
https://linear.app/settings/api

LINEAR_API_KEY: _____

Or type "cancel" to exit.
```

*If API connection fails:*
```
❌ Could not connect to Linear API

Error: {{error_message}}

This could be a temporary network issue. Would you like to:
1. Retry connection
2. Enter a different API key
3. Cancel setup

Your choice: _____
```

**Success → Step 4b:**

### Step 4b: Team Selection

**Prompt Template:**
```
✓ Connected to Linear workspace: {{workspace_name}}

Available teams:
{{#teams}}
{{index}}. {{teamKey}} - {{teamName}}
{{/teams}}

Which team should we configure? [1]: _____
```

**Example:**
```
✓ Connected to Linear workspace: Acme Inc

Available teams:
1. DEV - Development
2. ENG - Engineering
3. PRODUCT - Product Team
4. DESIGN - Design Team

Which team should we configure? [1]: _____
```

**Validation:**
- Must select a valid team number
- Team must have workflow states configured

**Validation Errors:**

*If invalid team number:*
```
❌ Please enter a number between 1 and {{team_count}}

Your choice: _____
```

*If team has no workflow:*
```
❌ Team "{{team_name}}" doesn't have workflow states configured

Please configure workflow states in Linear first, or choose a different team.

Available teams:
{{#teams}}
{{index}}. {{teamKey}} - {{teamName}}
{{/teams}}

Your choice: _____
```

**Success → Step 4c:**

### Step 4c: Workflow States

**Prompt Template:**
```
✓ Team selected: {{team_name}} ({{team_key}})

Available workflow states for {{team_name}}:
{{#workflow_states}}
{{index}}. {{state_name}}
{{/workflow_states}}

Now let's map your workflow states to GitHub events:

Which status should issues move to when you push to a feature branch?
(This indicates active development has started)

Status for active development [2]: _____
```

**After first answer:**
```
✓ Active development → "{{in_progress_status}}"

Which status when a PR is merged to {{main_branch}}?
{{#has_staging}}(This typically means code review is complete and it's ready for staging/QA){{/has_staging}}
{{^has_staging}}(This typically means the feature is complete and ready for production){{/has_staging}}

Status for {{main_branch}} merge [{{suggested_index}}]: _____
```

**If has production branch:**
```
✓ Merged to {{main_branch}} → "{{review_status}}"

Which status when code is merged/deployed to {{prod_branch}}?
(This indicates the feature is live in production)

Status for {{prod_branch}} deployment [{{suggested_index}}]: _____
```

**Validation:**
- Must select valid state numbers
- States should follow logical progression (though not enforced)
- Can select same state for multiple events if desired

**Validation Errors:**

*If invalid state number:*
```
❌ Please enter a number between 1 and {{state_count}}

Your choice: _____
```

**Success:**
```
✓ Workflow states configured:
  - Push to feature branch → "{{in_progress_status}}"
  - Merge to {{main_branch}} → "{{review_status}}"
  {{#prod_branch}}- Deploy to {{prod_branch}} → "{{done_status}}"{{/prod_branch}}
```

---

## Question 5: Commit & PR Formats

**Purpose:** Define how issue IDs appear in commits and PRs

### Step 5a: Commit Message Format

**Prompt Template:**
```
📝 Commit & PR Formats

Choose your commit message format:

1. <type>: <description> (ISSUE-123)        [Conventional commits]
   Example: feat: add user authentication (DEV-456)

2. ISSUE-123: <description>                 [Issue prefix]
   Example: DEV-456: add user authentication

3. <type>(ISSUE-123): <description>         [Issue in scope]
   Example: feat(DEV-456): add user authentication

4. Custom format
   (You'll define your own pattern)

Your choice [1]: _____
```

**If user chooses "4. Custom":**
```
Please describe your commit format using placeholders:
- {type} = commit type (feat, fix, etc.)
- {issue} = issue ID
- {description} = commit message

Example formats:
- {issue} | {description}
- [{issue}] {type}: {description}
- {type}({issue}): {description}

Your format: _____

Example with DEV-123:
{{rendered_example}}

Is this correct? (Y/n): _____
```

**Success:**
```
✓ Commit format: {{commit_format_description}}
```

### Step 5b: PR Title Format

**Prompt Template:**
```
Choose your PR title format:

1. ISSUE-123: Description                   [Issue prefix]
   Example: DEV-456: Add user authentication

2. [ISSUE-123] Description                  [Issue in brackets]
   Example: [DEV-456] Add user authentication

3. Custom format

Your choice [1]: _____
```

**If user chooses "3. Custom":**
```
Please describe your PR title format using placeholders:
- {issue} = issue ID
- {description} = PR description

Example formats:
- {issue} - {description}
- ({issue}) {description}
- {description} [{issue}]

Your format: _____

Example with DEV-123:
{{rendered_example}}

Is this correct? (Y/n): _____
```

**Success:**
```
✓ PR title format: {{pr_format_description}}
```

### Step 5c: Issue ID Pattern

**Prompt Template:**
```
What's your issue ID pattern?

This is a regular expression that matches your issue IDs.

Common patterns:
1. [A-Z]+-\d+                    [Linear/JIRA style: DEV-123, PROJ-456]
2. [A-Z]+\d+                     [Compact: DEV123, PROJ456]
3. GH-\d+                        [GitHub style: GH-789]
4. #\d+                          [Simple numbers: #123]
5. Custom regex

Your choice [1]: _____
```

**If user chooses "5. Custom":**
```
Enter your regex pattern:

Pattern: _____

Let's test it! Provide an example issue ID:

Example: _____

{{#match_success}}
✓ Match found: {{matched_id}}
{{/match_success}}

{{^match_success}}
❌ No match found with pattern "{{pattern}}"

This pattern won't match your example "{{example}}".
Would you like to:
1. Revise the pattern
2. Try a different example
3. Use a standard pattern

Your choice: _____
{{/match_success}}
```

**If user chooses standard pattern:**
```
Please provide an example issue ID from your Linear workspace:

Example: _____

{{#valid_format}}
✓ Pattern: {{pattern}}
✓ Example: {{example}}
{{/valid_format}}

{{^valid_format}}
⚠️  Your example "{{example}}" doesn't match Linear's typical format.

Linear issue IDs usually look like: DEV-123, TEAM-456

Is "{{example}}" correct? (Y/n): _____
{{/valid_format}}
```

**Success:**
```
✓ Issue ID pattern: {{issue_pattern}}
  Example: {{issue_example}}
```

---

## Question 6: Update Detail Level

**Purpose:** Configure verbosity of Linear comments

**Prompt Template:**
```
🎨 Update Detail Level

How detailed should Linear updates be?

1. 🎯 High-level (Stakeholder view)
   Brief summaries focusing on business impact
   Example: "Completed user authentication feature. Ready for QA."
   Best for: Teams with non-technical stakeholders following issues

2. 🔧 Technical (Developer view)                [Recommended]
   Detailed analysis with code references
   Example: "Implemented OAuth2 flow in auth.service.ts:45. Added JWT token
   validation middleware. Updated user schema to include refresh tokens."
   Best for: Development teams who want full context

3. 📝 Minimal (Status updates only)
   One-line updates with commit references
   Example: "Status updated via commit abc123f"
   Best for: Teams who prefer to read commits/PRs directly

Your choice [2]: _____
```

**Validation:**
- Must select 1, 2, or 3

**Validation Errors:**

*If invalid choice:*
```
❌ Please enter 1, 2, or 3

Your choice: _____
```

**Success:**
```
✓ Update detail level: {{detail_level_name}}
```

---

## Question 7: Documentation Location

**Purpose:** Configure where Claude stores issue analysis documents

**Prompt Template:**
```
📁 Documentation Location

Where should Claude store issue analysis documents?

When you say "Start work on DEV-123", Claude creates detailed analysis
documents to help with implementation. Where should these go?

1. /docs/issues/                           [Recommended]
   Standard docs folder, visible in repo

2. /docs/dev-issues/                       [Alternative]
   Separate from user-facing docs

3. /.linear/issues/                        [Hidden folder]
   Keeps Linear docs separate (starts with dot)

4. Custom path
   You choose the location

Your choice [1]: _____
```

**If user chooses "4. Custom":**
```
Enter the path where issue documents should be stored:

Path should:
- Start with / (relative to project root)
- End with / (indicates directory)
- Use valid folder names (no special characters)

Custom path: _____

Example structure:
{{custom_path}}
├── DEV-123-feature-name/
│   ├── task-analysis.md
│   └── implementation-notes.md
└── DEV-124-another-feature/
    └── task-analysis.md

Is this correct? (Y/n): _____
```

**Validation:**
- Path must start with /
- Path should end with /
- Path must be valid directory name
- Parent directory must be writable

**Validation Errors:**

*If invalid path format:*
```
❌ Invalid path format: "{{invalid_path}}"

Path should:
- Start with / (e.g., /docs/issues/)
- End with / (e.g., /docs/issues/)
- Use valid characters (a-z, A-Z, 0-9, -, _, /)

Please try again: _____
```

**Success:**
```
✓ Documentation location: {{docs_path}}
```

---

## Question 8: Auto-Assignment

**Purpose:** Configure automatic assignment of issues when status changes

**Prompt Template:**
```
🎯 Auto-Assignment Configuration

Would you like to automatically assign issues to team members when status changes?

This helps notify the right people when an issue needs their attention.

Examples:
- When moving to "In Review" → Assign to code reviewer
- When moving to "QA" → Assign to QA engineer
- When moving to "Done" → Assign back to original author

Enable auto-assignment? (Y/n): _____
```

**If user says "no":**
```
✓ Auto-assignment disabled

Issues will keep their current assignee when status changes.
```

**Skip to Configuration Summary**

**If user says "yes":**
```
✓ Auto-assignment enabled

Let's fetch your team members from Linear...
```

**Fetch team members using Linear API:**
```javascript
// Using linear-helpers.js
const members = await getTeamMembers(apiKey, teamId);
```

**Display team members:**
```
Team Members:

1. Alice Smith - alice@company.com
2. Bob Jones - bob@company.com
3. Carol White - carol@company.com
4. David Brown - david@company.com
5. None (leave unassigned)

Configure assignments for status changes:

When issue moves to "{{inProgressStatus}}", assign to:
(Press Enter to skip): _____
```

**Repeat for each status:**
```
When issue moves to "{{reviewStatus}}", assign to: _____

{{#hasStaging}}
When issue moves to "{{stagingStatus}}", assign to: _____
{{/hasStaging}}

{{#hasDone}}
When issue moves to "{{doneStatus}}", assign to: _____
{{/hasDone}}
```

**Preservation option:**
```
If an issue is already assigned, should we:

1. Replace with configured assignee
2. Keep original assignee (skip auto-assignment)

Your choice [2]: _____
```

**Validation:**
- Team member selection must be valid (1-N or skip)
- At least one status should have an assignee configured
- Store Linear user IDs, not just names

**Example Configuration:**
```
✓ Auto-assignment configured:
  - "In Progress" → (no change)
  - "In Review" → Alice Smith (code reviewer)
  - "QA" → Carol White (QA lead)
  - "Done" → (no change)

  Preserve original assignee: Yes
```

**Storage:**
```json
{
  "assignees": {
    "enabled": true,
    "onReview": "user-uuid-alice",
    "onStaging": "user-uuid-carol",
    "preserveOriginal": true
  }
}
```

---

## Configuration Summary

**After all questions answered, show complete summary:**

**Prompt Template:**
```
📋 Configuration Summary

Let's review your configuration:

Project:
  Path: {{project_path}}
  Repository: {{repo_owner}}/{{repo_name}}

Branch Strategy: {{branch_strategy_name}}
  - Main: {{main_branch}}
  {{#staging_branch}}- Staging: {{staging_branch}}{{/staging_branch}}
  {{#prod_branch}}- Production: {{prod_branch}}{{/prod_branch}}

Linear:
  Workspace: {{workspace_name}}
  Team: {{team_name}} ({{team_key}})
  Statuses:
    - Push to feature branch → "{{in_progress_status}}"
    - Merge to {{main_branch}} → "{{review_status}}"
    {{#prod_branch}}- Deploy to {{prod_branch}} → "{{done_status}}"{{/prod_branch}}

Formats:
  Commit: {{commit_format_example}}
  PR Title: {{pr_format_example}}
  Issue Pattern: {{issue_pattern}} (e.g., {{issue_example}})

Updates:
  Detail Level: {{detail_level_name}}
  Documentation: {{docs_path}}

{{#assignees.enabled}}
Auto-Assignment:
  {{#assignees.onInProgress}}- "{{inProgress_status}}" → {{assignees.onInProgress_name}}{{/assignees.onInProgress}}
  {{#assignees.onReview}}- "{{review_status}}" → {{assignees.onReview_name}}{{/assignees.onReview}}
  {{#assignees.onStaging}}- "{{staging_status}}" → {{assignees.onStaging_name}}{{/assignees.onStaging}}
  {{#assignees.onDone}}- "{{done_status}}" → {{assignees.onDone_name}}{{/assignees.onDone}}
  Preserve original: {{#assignees.preserveOriginal}}Yes{{/assignees.preserveOriginal}}{{^assignees.preserveOriginal}}No{{/assignees.preserveOriginal}}
{{/assignees.enabled}}
{{^assignees.enabled}}
Auto-Assignment: Disabled
{{/assignees.enabled}}

GitHub Secrets:
  {{#will_setup_secret}}✓ Will configure LINEAR_API_KEY automatically{{/will_setup_secret}}
  {{^will_setup_secret}}⚠ You'll need to add LINEAR_API_KEY manually{{/will_setup_secret}}

Is this configuration correct? (Y/n): _____
```

**If user says "no":**
```
Which section would you like to edit?

1. Project location
2. Branch strategy
3. Linear configuration
4. Commit & PR formats
5. Update detail level
6. Documentation location
7. Cancel (start over)

Your choice: _____
```

**If user says "yes" → Proceed to Phase 4: Installation**

---

## Progress Indicators

**Throughout the wizard, show progress:**

```
Setup Progress: [██████░░░░] Question 3 of 7
```

Or simpler:
```
Step 3/7: Branch Strategy
```

---

## Back/Edit Support

**At any question, user can say:**
- `"back"` → Go to previous question
- `"restart"` → Start wizard from beginning
- `"cancel"` → Exit wizard
- `"help"` → Show help for current question

**Response to "help":**
```
Help: {{current_question_name}}

{{help_text_for_question}}

What this affects:
{{impact_description}}

Need more help? Check the docs:
{{docs_link}}

Press Enter to continue with the current question.
```

---

## Completion Messages

**After successful installation (Phase 4):**

```
✅ Installation Complete!

Your Linear workflow is now configured and ready to use.

🚀 Next Steps:

1. Test the setup:
   Say: "Start work on {{issue_example}}"

2. Review generated files:
   - .github/workflows/linear-status-update.yml
   - docs/linear-workflow.md
   - .linear-workflow.json

3. Commit the changes:
   git add .
   git commit -m "feat: add Linear workflow integration"
   git push

4. Share with your team:
   Share docs/linear-workflow.md with your team members

📖 Full documentation: docs/linear-workflow.md

{{^github_secret_configured}}
⚠️  Remember to add your LINEAR_API_KEY to GitHub secrets:
   gh secret set LINEAR_API_KEY --body "{{linear_api_key}}"

   Or manually at:
   https://github.com/{{repo_owner}}/{{repo_name}}/settings/secrets/actions
{{/github_secret_configured}}

Need help? Just ask!
```
