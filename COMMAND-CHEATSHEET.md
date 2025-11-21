# Command Cheat Sheet

Quick reference for all 20 slash commands plus natural language workflow commands.

> **Pro tip:** You don't need to memorize these! Just talk to Claude naturally about what you want to do.

---

## 📋 Quick Reference: All 20 Slash Commands

### Issue Creation (6 commands)

| Command | What It Does | Example |
|---------|--------------|---------|
| `/bug-linear` | Quick bug report (auto-uses Bug template) | `/bug-linear Login timeout too short` |
| `/improvement-linear` | Quick improvement (auto-uses Improvement template) | `/improvement-linear Optimize database queries` |
| `/feature-linear` | Quick feature request (auto-uses Feature template) | `/feature-linear Add user profile page` |
| `/create-linear-issue` | Create any issue with template selection | `/create-linear-issue Add CSV export` |
| `/create-blocker-linear` | Create blocking issue for current work | `/create-blocker-linear Database indexes needed` |
| `/create-subtask-linear` | Create sub-task linked to current issue | `/create-subtask-linear Add login form UI` |

### Workflow & Status (8 commands)

| Command | What It Does | Example |
|---------|--------------|---------|
| `/start-issue` | Start work on existing issue | `/start-issue DEV-123` |
| `/feedback-linear` | Request feedback/clarification from teammates | `/feedback-linear Should this support mobile?` |
| `/get-feedback-linear` | Retrieve and show recent feedback comments | `/get-feedback-linear` |
| `/pause-linear` | Pause work and commit WIP safely | `/pause-linear Higher priority came up` |
| `/blocked-linear` | Mark as blocked by external dependency | `/blocked-linear Waiting for API deployment` |
| `/my-work-linear` | Show your active/paused/blocked issues | `/my-work-linear` |
| `/team-work-linear` | Show team's active work | `/team-work-linear` |
| `/high-priority-linear` | Show high priority items across team | `/high-priority-linear` |

### Progress & Delivery (3 commands)

| Command | What It Does | Example |
|---------|--------------|---------|
| `/create-pr` | Create pull request with Linear integration | `/create-pr` |
| `/create-release-approval` | Create release approval issue for production | `/create-release-approval v1.2.0` |
| `/progress-update` | Post progress update to Linear | `/progress-update` |

### Maintenance & Diagnostics (2 commands)

| Command | What It Does | Example |
|---------|--------------|---------|
| `/workflow-status` | Check workflow health and diagnose issues | `/workflow-status` |
| `/cleanup-branches` | Clean up merged and stale branches | `/cleanup-branches` |

### Help & Learning (2 commands)

| Command | What It Does | Example |
|---------|--------------|---------|
| `/tutorial` | Interactive tutorial to learn the workflow | `/tutorial` |
| `/linear-help` | Show all available commands and what they do | `/linear-help` |

---

## 🚀 Detailed Command Guide

### Issue Creation Commands

#### `/bug-linear` - Quick Bug Report

Create a bug report without template selection.

```bash
/bug-linear Login timeout is too short
```

**What happens:**
1. Skips template selection (auto-uses "Bug Report")
2. Ask if you'll provide context or Claude should draft
3. Creates comprehensive bug report with:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
4. Posts to Linear
5. Asks if you want to start fixing it now

**Example flow:**
```
You: /bug-linear Mobile menu doesn't close after click

Claude: Should I draft the bug report? (1. You provide, 2. I'll draft)
You: 2

Claude: [Creates comprehensive bug report]
        Bug created: DEV-456 - Mobile menu doesn't close
        Ready to start fixing this bug? (Y/n)
```

---

#### `/improvement-linear` - Quick Improvement

Create an improvement/enhancement issue.

```bash
/improvement-linear Optimize database queries in reports
```

**What happens:**
1. Auto-uses "Improvement" template
2. Creates issue with:
   - Current behavior
   - Proposed improvement
   - Benefits
   - Considerations
3. Posts to Linear
4. Asks if you want to start work

---

#### `/feature-linear` - Quick Feature Request

Create a new feature issue.

```bash
/feature-linear Add user profile page
```

**What happens:**
1. Auto-uses "Feature" template
2. Creates feature with:
   - Feature description
   - User story
   - Acceptance criteria
   - Technical notes
3. For large features, offers to create sub-tasks
4. Asks if you want to start building

---

#### `/create-linear-issue` - Full Template Selection

Create any type of issue with manual template selection.

```bash
/create-linear-issue Add CSV export functionality
```

**What happens:**
1. Shows all available Linear templates
2. You choose which template to use
3. Rest of flow same as quick commands above

**Use when:**
- You have custom templates beyond Bug/Improvement/Feature
- You want to see all template options first

---

#### `/create-blocker-linear` - Create Blocking Issue

Create a separate issue to track what's blocking you.

```bash
/create-blocker-linear Database indexes need to be added
```

**What happens:**
1. Identifies current issue
2. Asks blocker type (Infrastructure/Bug/Dependency/Missing feature)
3. Asks who should work on it
4. Creates blocker issue
5. Automatically links as "blocks" current issue
6. Asks if you want to mark current issue as blocked

**Example:**
```
You: /create-blocker-linear Need staging API deployed

Claude: Type? 1. Infrastructure, 2. Bug, 3. Dependency, 4. Missing feature
You: 1

Claude: Who should work on this? 1. Me, 2. Team member, 3. Another team
You: 3

Claude: Which team?
You: DevOps

        ✓ Created DEV-500 - Deploy staging API
        ✓ Linked: DEV-500 blocks DEV-123
        ✓ Assigned to: DevOps

        Mark DEV-123 as blocked? (Y/n)
```

---

#### `/create-subtask-linear` - Create Sub-task

Break down large issues into smaller pieces.

```bash
/create-subtask-linear Add login form UI component
```

**What happens:**
1. Asks complexity (Small/Medium/Large)
2. Asks about dependencies
3. Asks who should work on it
4. Creates child issue linked to parent
5. Sets estimate based on complexity
6. Asks if you want to start work on sub-task

**Perfect for:**
- Breaking down large features
- Enabling parallel work (assign sub-tasks to different people)
- Iterative delivery

---

### Workflow & Status Commands

#### `/start-issue` - Start Work on Issue

Start working on an existing Linear issue.

```bash
/start-issue DEV-123
```

**What happens:**
1. Fetches issue from Linear (via MCP)
2. Creates detailed 11-section task analysis
3. **Asks: "Would you like me to post a summary comment to Linear? (Y/n)"**
4. If yes: Builds comment summary, then posts to Linear
5. If no: Skips building/posting, continues workflow
6. Creates feature branch: `feature/DEV-123-description`
7. Makes initial commit
8. Updates issue status to "In Progress"

**Also works with natural language:**
```
"Let's get to work on DEV-123"
"Start work on DEV-123"
"Begin DEV-123"
```

---

#### `/feedback-linear` - Request Feedback

Request clarification or feedback from teammates.

```bash
/feedback-linear Should this support mobile devices?
```

**What happens:**
1. Detects current issue from your branch
2. Asks who should respond (Issue creator/Specific person/Team)
3. Asks if you should pause work while waiting
4. Posts structured question to Linear
5. Tags the person for notification
6. Updates status to "Feedback Required"
7. Optionally pauses work and commits WIP

**Example:**
```
You: /feedback-linear Which API endpoint should I use?

Claude: Who should respond? 1. @alice (creator), 2. Specific person, 3. Team
You: 2

Claude: Enter their email:
You: techleady@team.com

Claude: Pause work while waiting? (Y/n)
You: y

        ✓ Question posted to Linear
        ✓ @techlead tagged for notification
        ✓ Status updated: Feedback Required
        ✓ Work paused - WIP committed
```

---

#### `/get-feedback-linear` - Retrieve Feedback

Check if your feedback requests have been answered.

```bash
/get-feedback-linear
```

**What happens:**
1. Checks current issue (or all your issues with "Feedback Required")
2. Fetches recent comments
3. Shows which questions were answered
4. Tracks time since request
5. Suggests follow-up actions
6. Asks if you want to resume work

**Example:**
```
You: /get-feedback-linear

Claude: Feedback on DEV-123: User authentication

        📝 3 new comments:

        ✅ @alice answered: "Yes, support iOS and Android"
        ✅ @bob answered: "Use /api/v2/auth endpoint"
        ✅ @carol answered: "Mockups added to Figma"

        All questions answered!
        Ready to resume work? (Y/n)
```

---

#### `/pause-linear` - Pause Work

Safely pause work and switch to something else.

```bash
/pause-linear Higher priority work came up
```

**What happens:**
1. Asks why pausing (Priorities/End of day/Dependency/Break)
2. Asks when you'll resume
3. Asks for resume notes (optional)
4. Commits all WIP changes with context
5. Posts pause comment to Linear
6. Updates status to "On Hold"
7. Returns to main branch

**Different from `/blocked-linear`:**
- `/pause-linear` - Temporary pause, you'll resume (context switching)
- `/blocked-linear` - Hard external blocker (infrastructure, APIs, other teams)

---

#### `/blocked-linear` - Mark as Blocked

Mark issue as blocked by external dependency.

```bash
/blocked-linear Waiting for staging database setup
```

**What happens:**
1. Asks blocker type (Team/Infrastructure/Third-party/External approval)
2. Asks who can unblock it
3. Asks expected resolution time
4. Posts blocker comment to Linear
5. Updates status to appropriate blocked status
6. Optionally creates blocker issue

**Use when:**
- Waiting for another team's service/API
- Infrastructure not ready
- Third-party dependency
- External approval needed

---

#### `/my-work-linear` - Show Your Work

Overview of all your assigned issues.

```bash
/my-work-linear          # Active work only (default)
/my-work-linear all      # Everything (active, paused, blocked, completed)
/my-work-linear paused   # Just paused/blocked issues
```

**What happens:**
1. Fetches all your issues from Linear
2. Groups by status (Active/Paused/Blocked)
3. Shows current branch detection
4. Flags stale issues (no commits in 5+ days)
5. Flags missing branches
6. Offers quick actions (resume, switch, follow up)

**Example output:**
```
📋 Your Active Work

🔴 High Priority:
  DEV-123: User auth (In Progress, 2 days)
  Branch: feature/DEV-123-auth ✓
  Last commit: 3 hours ago

🟠 Normal Priority:
  DEV-124: Optimize queries (In Progress, 5 hours) ← Currently active
  Branch: feature/DEV-124-optimize ✓

Summary: 2 active, 0 paused, 0 blocked

What would you like to do?
1. Continue current work
2. Switch to another issue
3. Show paused work
```

---

#### `/team-work-linear` - Show Team's Work

See what everyone on the team is working on.

```bash
/team-work-linear
/team-work-linear all      # Include paused/blocked
/team-work-linear blocked  # Just blocked issues
```

**What happens:**
1. Shows all team members' active issues
2. Groups by person
3. Identifies stale work (no activity in 5+ days)
4. Flags potential bottlenecks
5. Provides recommendations

**Perfect for:**
- Daily standups
- Finding who needs help
- Identifying blocked work
- Capacity planning

---

#### `/high-priority-linear` - Show High Priority Work

Focus on urgent and high priority items across the team.

```bash
/high-priority-linear
/high-priority-linear urgent  # Only P1 urgent
/high-priority-linear mine    # Only yours
```

**What happens:**
1. Shows P1 (Urgent) and P2 (High) issues
2. Groups by priority
3. Flags unassigned urgent work
4. Detects stale high-priority issues
5. Provides recommendations on what to work on

**Example:**
```
⚡ High Priority Items

🔴 Urgent (Priority 1):
  DEV-123: Payment gateway timeout
  Status: In Progress (@alice)

  DEV-124: Database migration failing ⚠️ UNASSIGNED
  Created: 2 hours ago

🟠 High (Priority 2):
  DEV-125: User auth (Ready to start, @bob)

Needs attention:
⚠️ DEV-124 - Urgent and unassigned!

What would you like to do?
1. Assign DEV-124 to me
2. Start work on DEV-125
```

---

### Progress & Delivery Commands

#### `/create-pr` - Create Pull Request

Create PR when work is ready for review.

```bash
/create-pr
/create-pr DEV-123  # Specify issue if not on feature branch
```

**What happens:**
1. Commits any pending changes
2. Pushes branch to GitHub
3. Creates PR with proper title format
4. Posts comprehensive summary to Linear
5. Status updates automatically (via GitHub Actions if enabled)

---

#### `/create-release-approval` - Create Release Approval

Create a comprehensive release approval issue when preparing for production deployment.

```bash
/create-release-approval v1.2.0
/create-release-approval              # Will ask for version
```

**What happens:**
1. Analyzes commits between staging/main and production
2. Extracts all Linear issue IDs from commits
3. Fetches issue details from Linear (via MCP)
4. Categorizes by type (Bug fixes/Features/Improvements)
5. Asks who should approve the release
6. Creates release approval issue with:
   - Complete list of all changes
   - Links to all related issues
   - Brief summary of each issue's fix/implementation
   - Approval checklist
   - Release metadata

**Example:**
```
You: /create-release-approval v1.2.0

Claude: Analyzing commits between staging and production...
        Found 8 issues to include in release v1.2.0

        Breakdown:
          • 3 bug fixes
          • 2 new features
          • 3 improvements

        Who should approve this release?
        1. Jane Bloggs - Release Manager
        2. Joe Bloggs - Tech Lead
        3. No assignee

You: 1

Claude: ✓ Release approval created: DEV-999
        ✓ Assigned to: Jane Bloggs
        ✓ Linked 8 issues

        Linear URL: https://linear.app/.../DEV-999
```

**Release Approval Issue Format:**
```markdown
Release Approval: v1.2.0 - January 21, 2025

A summary of recent changes awaiting review for release v1.2.0.

## Changes in This Release

### Bug Fixes (3)
[DEV-123: Fix Overflow Menu]
Issue: Overflow menu not appearing on mobile
Fix: Updated CSS z-index and positioning logic

### New Features (2)
[DEV-156: Add User Authentication]
Feature: Secure login system with password reset
Implemented: JWT-based auth with email/password

### Improvements (3)
[DEV-167: Optimize Database Queries]
Improvement: Slow query performance on reports
Implemented: Added indexes, reduced load time to <2s

## Approval Checklist
- [ ] All features tested in staging
- [ ] No critical bugs reported
- [ ] Documentation updated
- [ ] Stakeholders notified
- [ ] Ready for production deployment
```

**Auto-integration with PR creation:**

When creating a PR to production, Claude automatically offers to create release approval:

```
You: /create-pr

Claude: Detecting target branch... production

        This looks like a release PR!
        Would you like to create a Release Approval issue? (Y/n)
```

**Perfect for:**
- Production releases requiring formal approval
- Stakeholder visibility into deployments
- Release documentation and audit trail
- Teams with approval gates
- Regulated industries

---

#### `/progress-update` - Post Progress Update

Share progress update to Linear.

```bash
/progress-update
```

**What happens:**
1. Analyzes recent commits
2. Checks current file changes
3. Reviews acceptance criteria progress
4. Generates structured update
5. Posts to Linear as comment

**Update includes:**
- Completed items
- Work in progress
- Next steps
- Any blockers

---

### Maintenance & Diagnostics Commands

#### `/workflow-status` - Check Workflow Health

Diagnose workflow issues and check system health.

```bash
/workflow-status
/workflow-status --detailed  # Show additional diagnostics
```

**What happens:**
1. Checks Linear MCP connection (OAuth authentication)
2. Validates GitHub CLI access and permissions
3. Tests git hooks installation and functionality
4. Verifies configuration file is valid
5. Checks GitHub Actions workflow (if enabled)
6. Shows recent activity (7 days)
7. Provides health score (0-100%)
8. Offers auto-fix for common issues

**Health checks include:**
- ✅ Linear MCP Connection - Server, authentication, workspace access
- ✅ GitHub CLI - Version, authentication, scopes, repository access
- ✅ Git Hooks - Location, executable status, validation tests
- ✅ Configuration - File validity, required fields, issue pattern
- ✅ GitHub Actions - Workflow file, secrets, recent runs
- 📊 Recent Activity - Issues, PRs, commits in last 7 days

**Example output (healthy):**
```
🔍 Pre-Flight Checks

✅ Linear MCP Connection
   • Server: Connected
   • Authentication: Valid (OAuth)
   • Workspace: Acme Inc
   • Team: DEV - Development

✅ GitHub CLI
   • Version: gh 2.40.0
   • Authenticated: username
   • Scopes: repo, workflow ✓

✅ Git Hooks
   • Location: .git/hooks/commit-msg
   • Executable: Yes
   • Tests passing: 7/7 ✓

✅ Overall Health: Excellent (100%)

All systems operational!
```

**Example output (with issues):**
```
❌ Linear MCP Connection
   • Server: Not responding
   • Error: Connection timeout

   🔧 How to fix:
   1. Restart Claude Code to reload MCP config
   2. If still failing, re-authenticate:
      claude mcp remove linear-server
      claude mcp add --transport http linear-server https://mcp.linear.app/mcp
   3. Run /mcp to authenticate

⚠️  Overall Health: Fair (65%)

3 issues detected. Run auto-fix? (Y/n)
```

**Auto-fix feature:**
When issues are detected, Claude can automatically fix common problems:
- Make git hooks executable
- Test MCP connection and guide re-authentication
- Verify GitHub secrets configuration
- Update outdated configuration

**Perfect for:**
- Troubleshooting when something isn't working
- After initial setup to verify installation
- Before starting work (morning checklist)
- After configuration changes
- When onboarding new team members

---

#### `/cleanup-branches` - Clean Up Branches

Automatically detect and clean up merged or stale branches.

```bash
/cleanup-branches
/cleanup-branches --merged-only  # Only clean merged branches (safest)
/cleanup-branches --dry-run      # Preview what would be deleted
```

**What happens:**
1. Scans for local branches in repository
2. Checks merge status against main/staging/prod
3. Identifies stale branches (30+ days no activity)
4. Detects abandoned branches (60+ days, no PR)
5. Categorizes branches (Merged/Stale/Active)
6. Shows detailed report with issue links
7. Lets you choose what to clean up
8. Safely deletes selected branches (local + remote)

**Branch categories:**

**Merged (Safe):**
- PR was merged
- All commits are in target branch
- Safe to delete

**Stale (Caution):**
- No commits in 30+ days
- No open PR
- Requires confirmation

**Active (Keep):**
- Recent activity
- Has open PR
- Currently checked out

**Example output:**
```
Branch Cleanup Report

✅ Merged Branches (Safe to Delete)

1. feature/DEV-123-login
   • PR #234 merged to main (3 days ago)
   • Issue: DEV-123 - Add user authentication [Done]
   • 15 commits, fully merged

2. feature/DEV-115-api
   • PR #230 merged to main (1 week ago)
   • Issue: DEV-115 - Refactor API [Done]
   • 8 commits, fully merged

⚠️  Stale Branches (Review Before Deleting)

3. feature/DEV-100-test
   • Last commit: 45 days ago
   • No PR found
   • Issue: DEV-100 - Test feature [On Hold]
   • 2 commits, not merged

✨ Active Branches (Keep)

4. feature/DEV-125-dashboard
   • Last commit: 2 hours ago
   • In progress, no PR yet
   • Issue: DEV-125 - Dashboard refactor [In Progress]

Summary:
  • 2 merged branches (safe to delete)
  • 1 stale branch (review needed)
  • 1 active branch (keep)

What would you like to clean up?
1. Delete all merged branches (2 branches) [Recommended]
2. Delete merged + stale branches (3 branches)
3. Select individual branches to delete
4. Dry run (show what would be deleted)
5. Cancel
```

**Safety features:**
- Pre-deletion checks for unpushed commits
- Backup suggestions for unmerged work
- Protected branches never deleted (main, staging, prod)
- Current branch never deleted
- Branches with open PRs flagged for review
- Confirmation required for destructive actions

**Command options:**

`--merged-only` - Only clean merged branches (safest):
```bash
/cleanup-branches --merged-only

Cleaning up merged branches only...
Found 3 merged branches
Delete all? (Y/n)
```

`--dry-run` - Preview without deleting:
```bash
/cleanup-branches --dry-run

DRY RUN - No branches will be deleted

Would delete:
  ✓ feature/DEV-123-login (merged)
  ✓ feature/DEV-115-api (merged)

Would keep:
  • feature/DEV-125-dashboard (active)
```

**Perfect for:**
- After merging multiple PRs
- Weekly maintenance (keep repo clean)
- Before starting new work
- When branch list is getting long
- Repository spring cleaning

**Integration:**
- `/create-pr` offers automatic cleanup after merge
- `/workflow-status` detects stale branches
- `/my-work-linear` shows your active branches

---

### Help & Learning Commands

#### `/tutorial` - Interactive Tutorial

Learn the Linear workflow through hands-on practice.

```bash
/tutorial
/tutorial resume  # Resume from where you left off
/tutorial reset   # Start over from beginning
```

**What happens:**
1. Welcome and overview (~30 seconds)
2. Understand the test issue created during setup
3. Start work with AI analysis (see 2-way integration!)
4. Make a simple change to simulate work
5. Commit with proper format (git hook validation)
6. Check workflow health with diagnostics
7. Completion and next steps

**Perfect for:**
- First-time users after setup
- New team members onboarding
- Anyone who wants to understand the workflow before using it
- Learning by doing rather than reading

**Time:** ~10 minutes
**Safe:** Uses tutorial branch, won't affect real work

**Example flow:**
```
You: /tutorial

Claude:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Welcome to Linear Workflow Tutorial! 🎓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You'll learn the complete workflow by actually using it.

What you'll do:
  1. Understand a Linear issue
  2. Start work with AI analysis
  3. Make a simple change
  4. Commit with proper format
  5. Check workflow health
  6. See the complete workflow in action

Time: ~10 minutes
Ready to start? (Y/n)

[Tutorial walks you through each step interactively]

Step 1: Understanding Linear Issues
[Fetches and displays test issue]

Step 2: Starting Work with AI Analysis
[Shows AI analysis creation and Linear posting]

Step 3: Making Changes
[Creates tutorial file]

Step 4: Committing with Validation
[Demonstrates git hook validation]

Step 5: Workflow Health Check
[Runs /workflow-status]

Step 6: Completion
[Cleanup and next steps]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 You're Ready to Go!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Resume capability:**
If tutorial is interrupted, resume from where you left off:
```
/tutorial resume

Claude: You're on Step 3 of 6: Making Changes
        Resume from here? (Y/n)
```

**Reset capability:**
Start over from the beginning:
```
/tutorial reset

Claude: Reset and start over? (Y/n)
```

**Tutorial state tracking:**
Progress is saved in `.linear-workflow.json`:
```json
{
  "tutorial": {
    "completed": false,
    "currentStep": 3,
    "startedAt": "2025-01-21T10:00:00Z",
    "issueId": "DEV-123",
    "canResume": true
  }
}
```

**What you'll learn:**
- ✅ Fetch issues from Linear via MCP
- ✅ AI analysis with 2-way integration
- ✅ Feature branch workflow
- ✅ Commit message validation
- ✅ Workflow health diagnostics
- ✅ Complete development cycle

**Key insight:** The tutorial uses the actual test issue created during setup, so you'll see real Linear integration in action!

---

#### `/linear-help` - Show All Commands

Get a quick reference of all available Linear workflow commands.

```bash
/linear-help
```

**What happens:**
1. Displays organized list of all 21 commands by category
2. Shows brief description of what each command does
3. Includes quick usage examples
4. Provides links to detailed documentation
5. Reminds you that natural language works too

**Display format:**
```
📝 Issue Creation (6 commands)
  /bug-linear - Quick bug report
  /improvement-linear - Quick improvement
  /feature-linear - Quick feature request
  ...

🔄 Workflow & Status (8 commands)
  /start-issue - Start work on existing issue
  /feedback-linear - Request feedback
  ...

🚀 Progress & Delivery (3 commands)
  /create-pr - Create pull request
  /create-release-approval - Create release approval
  /progress-update - Post progress update

🔧 Maintenance & Diagnostics (2 commands)
  /workflow-status - Check workflow health
  /cleanup-branches - Clean up merged/stale branches

🎓 Help & Learning (2 commands)
  /tutorial - Interactive tutorial (learn by doing!)
  /linear-help - Show all commands

💡 Pro tip: Natural language works too!
   "Let's get to work on DEV-123"
   "Show me high priority items"

📖 Detailed docs: COMMAND-CHEATSHEET.md
```

**Perfect for:**
- New team members learning the workflow
- Quick command reference without leaving terminal
- Finding the right command for your situation
- Remembering command syntax

**Related:** Just ask Claude naturally:
- "What commands are available?"
- "How do I create a bug report?"
- "Show me workflow commands"

---

## 🗣️ Natural Language Commands

You can also use natural language instead of slash commands!

### Starting Work

```
"Let's get to work on DEV-123"
"Start work on DEV-456"
"Begin DEV-789"
"Continue DEV-123"
```

### Creating Issues

```
"Let's add CSV export to reports"           ← Triggers /create-linear-issue
"I found a bug - mobile menu doesn't close" ← Suggests /bug-linear
"We need to optimize the database"         ← Suggests /improvement-linear
```

### Getting Help

```
"What am I working on?"     ← /my-work-linear
"What's the team doing?"    ← /team-work-linear
"Show me high priority"     ← /high-priority-linear
```

### When Blocked

```
"This is blocked by [reason]"  ← /blocked-linear
"I need feedback on X"         ← /feedback-linear
"Create a blocker for this"    ← /create-blocker-linear
```

---

## 📖 Common Workflows

### Morning Routine

```bash
1. /my-work-linear                    # See what you're working on
2. /get-feedback-linear               # Check if questions answered
3. /high-priority-linear              # Check urgent items
4. /start-issue DEV-123               # Continue or start work
```

### Creating New Work from Terminal

```bash
1. /feature-linear Add dark mode toggle    # Create feature
2. (Claude asks for details)
3. Ready to start? → Yes
4. (Claude starts normal workflow)
```

### Blocked and Need to Switch

```bash
1. /blocked-linear Waiting for API deployment
2. /my-work-linear                    # See other work
3. /start-issue DEV-456               # Switch to different issue
```

### Request and Get Feedback

```bash
# Request feedback
1. /feedback-linear Should this support mobile?
2. (Claude posts question, tags person, pauses work)

# Later, check for answers
3. /get-feedback-linear
4. (Claude shows answers)
5. Ready to resume? → Yes
```

### End of Day

```bash
1. /progress-update                   # Share progress
2. /pause-linear End of day
3. (Claude commits WIP, posts pause comment)
```

---

## 💡 Tips & Best Practices

### When to Use Slash Commands vs Natural Language

**Use slash commands when:**
- You want a specific action immediately
- You're creating issues quickly (`/bug-linear`, `/feature-linear`)
- You're checking status (`/my-work-linear`, `/team-work-linear`)

**Use natural language when:**
- Starting conversations about work
- You're not sure which command to use
- You want Claude to suggest the best approach

### Command Combinations

**Quick issue creation → immediate work:**
```bash
/feature-linear Add CSV export
→ Ready to start? (Y)
→ (Full workflow starts automatically)
```

**Check feedback → resume work:**
```bash
/get-feedback-linear
→ All answered!
→ Resume? (Y)
→ (Checks out branch, updates status)
```

**Team visibility → help teammate:**
```bash
/team-work-linear
→ See @bob blocked for 3 days
→ /start-issue DEV-789  (the blocker)
```

---

## 🔗 Related Documentation

- **[README.md](README.md)** - Full project overview and setup guide
- **[UPGRADE_GUIDE.md](UPGRADE_GUIDE.md)** - Upgrading from v1.0.0 to v1.1.0
- **[docs/linear-workflow.md](docs/linear-workflow.md)** - Detailed workflow documentation
- **[docs/auto-assignment.md](docs/auto-assignment.md)** - Auto-assignment configuration
- **[docs/troubleshooting.md](docs/troubleshooting.md)** - Common issues and solutions

---

## ❓ Need Help?

**During work:**
- Just ask Claude: "What commands can I use?"
- All commands support natural language
- Claude understands context from conversation

**Detailed help for specific command:**
- Each command has detailed docs in `.claude/commands/` (after setup)
- Example: `.claude/commands/feedback-linear.md`

**Setup help:**
- Run `/setup-linear` and follow the wizard
- Pre-flight checks catch issues early
- All questions have helpful defaults

---

**Remember:** You don't need to memorize these! Just talk to Claude naturally about what you want to do. Claude will use the right command based on context. 🚀
