# Command Cheat Sheet

Quick reference for all available workflow commands in Claude Code.

## Core Workflow

### Start Work on an Issue

Begin working on a Linear issue with full analysis and setup.

```
"Let's get to work on DEV-123"
"Start work on DEV-456"
"Begin DEV-789"
```

**What happens:**
- Fetches issue from Linear
- Creates detailed task analysis
- Posts summary to Linear
- Creates feature branch
- Makes initial commit
- Updates status to "In Progress"

---

### Continue Existing Work

Resume work on an issue you've already started.

```
"Continue DEV-123"
"Resume DEV-456"
"Resume work on DEV-789"
```

**What happens:**
- Checks out existing branch
- Reviews task analysis
- Shows current progress
- Resumes implementation

---

### Create Pull Request

Open a pull request when work is ready for review.

```
"Create PR for DEV-123"
"Ready for review"
"Open pull request"
```

**What happens:**
- Commits pending changes
- Pushes branch
- Creates PR with proper format
- Posts summary to Linear
- Status updates automatically

---

## Related Issues

### Create a Blocker

Create an issue that blocks current work.

```
"Create a blocker for this"
"This is blocked by [description]"
```

**What happens:**
- Creates new blocking issue
- Links to current issue
- Brief analysis
- Returns focus to original issue

---

### Create a Sub-task

Break down work into smaller tasks.

```
"Create a sub-task for [description]"
"Break this into a sub-task: [description]"
```

**What happens:**
- Asks about complexity (Small/Medium/Large)
- Asks about dependencies
- Creates child issue
- Links to parent issue
- Brief analysis

---

### Create a Bug Report

Report a bug discovered during work.

```
"Found a bug: [description]"
"This needs a bug report"
"Create bug issue for [description]"
```

**What happens:**
- Asks about relationship (current issue/standalone)
- Sets priority based on severity
- Creates bug with template
- Quick analysis
- Links to related work

---

### Create a Follow-up

Log technical debt or improvements for later.

```
"Create follow-up for [description]"
"Add follow-up: [description]"
"Log this for later: [description]"
```

**What happens:**
- Asks type (Tech debt/Improvement/Optimization/Docs/Testing)
- Asks when to address (Soon/Later/Eventually/Before release)
- Creates issue with appropriate priority
- Links to current work

---

## Progress & Communication

### Post Progress Update

Share progress on current work to Linear.

```
"Add progress update"
"Post progress to Linear"
"Update Linear with progress"
```

**What happens:**
- Analyzes recent commits
- Checks file changes
- Reviews acceptance criteria
- Posts structured update to Linear

---

### Mark as Blocked

Flag an issue as blocked with context.

```
"Mark as blocked"
"This is blocked by [reason]"
"Pause this issue"
```

**What happens:**
- Asks blocker type (Person/Issue/External/Decision/Info/Technical)
- Asks for details
- Asks expected resolution
- Updates status to "On Hold"
- Posts detailed blocker comment
- Offers to create blocker issue if needed

---

### Request Clarification

Ask for clarification on requirements.

```
"Request clarification on [topic]"
"Ask about [topic]"
"Need clarification: [question]"
```

**What happens:**
- Asks who should clarify (Creator/PM/Tech Lead/Designer/Specific person)
- Asks urgency (Blocking/Important/Nice to have)
- Posts formatted question to Linear
- Updates status if blocking

---

## Context Switching

### Pause Current Work

Save progress and switch away from current issue.

```
"Pause work on this"
"Switch away from this"
"Save progress and switch"
```

**What happens:**
- Asks why pausing (Switching priorities/Blocked/End of day/Break)
- Asks when resuming (Later today/Tomorrow/Next week/Unknown)
- Commits WIP changes
- Posts pause comment to Linear
- Returns to main branch

---

### Show Active Work

See all your in-progress issues.

```
"What am I working on?"
"Show my active issues"
"List my work"
```

**What happens:**
- Lists all "In Progress" issues
- Shows branch and last commit time
- Offers to continue any issue

---

## Discovery & Triage

### Fetch Recent Bugs

Find new bugs that need analysis.

```
"Fetch me any recent bugs"
"Show me new bugs"
"What bugs need analysis?"
"Are there any unanalyzed bugs?"
```

**What happens:**
- Searches for bug-labeled issues
- Filters by "not yet analyzed" status
- Groups by priority
- Offers to analyze any bug

---

### Show High Priority Work

Find urgent items that need attention.

```
"Let's get some high priority items"
"Show me high priority issues"
"What's urgent?"
"Give me the important stuff"
```

**What happens:**
- Searches Priority 1 (Urgent) and Priority 2 (High)
- Groups by status (Ready/Blocked/In Progress/Review)
- Recommends which to start
- Offers to begin work

---

### Team Status

See what the whole team is working on.

```
"What are we busy with?"
"What's the team working on?"
"Show all active work"
"What's in progress?"
```

**What happens:**
- Shows all team's "In Progress" issues
- Groups by team member
- Identifies stalled work
- Provides recommendations

---

## Review Workflow

### Ready for Review

Create PR and request review when work is complete.

```
"Ready for review"
"Create PR and request review"
"This is ready"
```

**What happens:**
- Asks if fully tested
- Asks who should review
- Asks for review focus areas
- Commits pending changes
- Creates PR with reviewers
- Posts comprehensive summary to Linear
- Updates status to "Review Required"

---

### Address Review Comments

Work through PR feedback systematically.

```
"Address review comments"
"Fix PR feedback"
"Update based on review"
```

**What happens:**
- Fetches PR review comments
- Creates checklist
- Posts to Linear
- Works through each comment
- Commits fixes with references
- Posts update when complete

---

## Quick Actions

### Setup Wizard

Install the Linear workflow integration.

```
"/setup-linear"
```

**What happens:**
- Interactive setup wizard
- Configures Linear connection
- Sets up GitHub Actions
- Installs git hooks
- Creates test issue

---

### MCP Authentication

Authenticate Claude Code with Linear.

```
"/mcp"
```

**What happens:**
- Opens OAuth flow in browser
- Authenticates with Linear
- Grants workspace access

---

## Natural Language

All commands support natural variations! Don't worry about exact phrasing.

**Examples:**
- "Let's start DEV-123" = "Begin work on DEV-123" = "Start DEV-123"
- "I need to create a blocker" = "Create a blocker for this" = "This is blocked"
- "Show me bugs" = "Any recent bugs?" = "What bugs need attention?"

**Tips:**
- Be conversational - Claude understands context
- Reference issues by ID when relevant
- Ask follow-up questions anytime
- Switch between tasks freely

---

## Common Workflows

### Starting Your Day

```
1. "What am I working on?"
2. "Continue DEV-123"
   OR
   "Show me high priority issues"
3. "Let's get to work on DEV-456"
```

---

### Found a Bug While Working

```
1. "Found a bug: [description]"
2. "Continue with current work" (or "Start work on bug")
```

---

### Blocked and Need to Switch

```
1. "This is blocked by [reason]"
2. "What am I working on?" (or "Show high priority")
3. "Continue DEV-789"
```

---

### Finishing a Feature

```
1. "Add progress update"
2. "Ready for review"
3. (After review) "Address review comments"
4. (After approval) Status updates automatically on merge
```

---

### End of Day

```
1. "Add progress update"
2. "Pause work on this" (reason: End of day)
3. Done! Progress saved, Linear updated
```

---

## Status Updates

### How Linear Statuses Update

**Automatically (via GitHub Actions):**
- Push to feature branch → "In Progress"
- Merge to staging → "Review Required" (+ auto-assigns reviewer)
- Merge to main → "Released"

**Manually (via Claude):**
- After analysis with blockers → "Feedback Required"
- After analysis with no blockers → "Ready for Development"
- When paused/blocked → "On Hold"

**Your custom statuses:**
Check `.linear-workflow.json` for your team's specific status mappings.

---

## Tips & Best Practices

### Commit Messages

All commits must reference a Linear issue ID:

```bash
# Valid formats (configured during setup):
git commit -m "feat: Add user auth (DEV-123)"
git commit -m "DEV-123: Fix login bug"
git commit -m "fix(DEV-123): Handle timeout"

# Invalid (will be rejected by git hook):
git commit -m "Add user auth"
```

---

### Branch Naming

Feature branches are created automatically:

```
feature/DEV-123-issue-title
feature/DEV-456-fix-login-bug
```

---

### When to Use Each Command

| Situation | Command |
|-----------|---------|
| Starting new work | "Let's get to work on DEV-123" |
| Already started | "Continue DEV-123" |
| Can't proceed | "This is blocked by [reason]" |
| Large task | "Create a sub-task for [part]" |
| Discovered bug | "Found a bug: [description]" |
| Need to switch | "Pause work on this" |
| Work complete | "Ready for review" |
| PR has feedback | "Address review comments" |
| Don't know what to do | "Show me high priority issues" |

---

## Need Help?

**Documentation:**
- Setup Guide: [README.md](README.md)
- Workflow Details: [docs/linear-workflow.md](docs/linear-workflow.md)
- Auto-Assignment: [docs/auto-assignment.md](docs/auto-assignment.md)
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)

**During Setup:**
- Type `/setup-linear` and follow the wizard
- All questions have helpful defaults
- Pre-flight checks catch issues early

**After Setup:**
- Just ask Claude! "What commands can I use?"
- All commands support natural language
- Claude understands context from conversation

---

**Pro tip:** You don't need to memorize these commands. Just talk to Claude naturally about what you want to do!
