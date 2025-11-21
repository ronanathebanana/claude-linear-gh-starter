# Setup Wizard Improvements

Feedback and improvements needed for the Linear workflow setup wizard.

## ✅ Fixed Issues

### 1. Missing Command Templates
**Issue:** Setup said it would install 21 commands but only 19 were present.
**Missing:** `start-issue.md.template` and `progress-update.md.template`
**Fix:** ✓ Created both missing templates
**Files:**
- `install/templates/commands/start-issue.md.template`
- `install/templates/commands/progress-update.md.template`

---

## 🔧 Issues to Fix in CLAUDE.md

### 2. Backup File Management
**Issue:** During setup, backup files are created but unclear if they're gitignored or cleaned up.

**What needs to be done:**
- Document backup file locations and naming
- Add backup cleanup step after successful installation
- Add `*.backup` to .gitignore during setup
- Provide command to clean up old backups

**Implementation:**
```markdown
After installation completes successfully, cleanup backups:

```bash
# Remove backup files (only after verifying installation works)
rm -f .linear-workflow.json.backup
rm -f .github/workflows/*.backup
```

Add to .gitignore during Phase 7:
```bash
echo "*.backup" >> .gitignore
echo ".linear-workflow-state.json" >> .gitignore
```
```

**Location in CLAUDE.md:** Phase 7 (Installation) and Phase 11 (Commit and Push)

---

### 3. Linear Template Creation
**Issue:** MCP doesn't have template creation tools. Setup can't auto-create templates without LINEAR_API_KEY.

**Current behavior:**
- Uses MCP tools (which don't support template creation)
- Falls back to GraphQL API (requires LINEAR_API_KEY)
- If no API key, just skips template creation

**Better approach:**
```markdown
**If GitHub Actions is enabled (user provided LINEAR_API_KEY):**

Use the LINEAR_API_KEY to create templates via GraphQL API:

[existing code]

**If GitHub Actions is NOT enabled (no LINEAR_API_KEY):**

```
⚠️  Linear Issue Templates

I can't create Linear issue templates automatically without an API key.

Options:

1. Provide LINEAR_API_KEY now to auto-create templates
   → I'll create: Bug Report, Improvement, Feature
   → Quick setup (~30 seconds)

2. Skip for now and create manually later
   → I'll provide template examples
   → You can copy/paste into Linear UI
   → Takes ~5 minutes manually

Your choice [2]: _____
```

**If user chooses Option 1:**
- Guide them to create API key at linear.app/settings/api
- Store temporarily for template creation
- Ask if they also want to enable GitHub Actions with this key
- Create templates
- Optionally set up GitHub Actions

**If user chooses Option 2:**
```
✓ Skipping automatic template creation

Template Examples:

📁 Bug Report Template:
────────────────────────────────────────────
Title: [BUG] Brief description

Description:
## Description
Brief description of the bug.

## Steps to Reproduce
1.
2.
3.

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser/Device:
- Version:

## Screenshots
(if applicable)
────────────────────────────────────────────

[Similar examples for Improvement and Feature templates]

To create these manually:
1. Go to: https://linear.app/{{workspace}}/settings/templates
2. Click "New Template"
3. Copy the template content above
4. Save

This takes about 5 minutes to set up all three templates.
```
```

**Location in CLAUDE.md:** Phase 8 (Create Linear Issue Templates)

---

### 4. Auto-Approve Linear MCP Commands
**Issue:** Want to pre-approve all Linear MCP tools during setup to reduce friction.

**Implementation:**
During Phase 5 (Linear MCP Authentication), after successful authentication:

```markdown
**After authentication successful:**

```
✅ MCP Authentication Complete!

One more quick setup step: Tool Permissions

The Linear workflow uses these MCP tools frequently:
  • list_issues - Search and filter issues
  • get_issue - Fetch issue details
  • create_issue - Create new issues
  • update_issue - Update issue status/fields
  • create_comment - Post updates to Linear
  • list_teams - Access team information
  • get_team - Fetch team details

Would you like to auto-approve these tools for smoother workflow? (Y/n)

[If yes:]

I'll configure Claude Code to auto-approve Linear MCP tools.

Note: You can always revoke this in Claude Code settings later.
```

Then add to user's Claude Code config:

```json
{
  "mcpServers": {
    "linear-server": {
      "autoApprove": ["list_issues", "get_issue", "create_issue", "update_issue", "create_comment", "list_teams", "get_team", "list_cycles", "list_projects"]
    }
  }
}
```

**Alternative:** If per-tool approval isn't available, inform user:

```
💡 Tool Approval Tip

During the workflow, Claude will ask for permission to use Linear MCP tools.

Common tools you'll be asked to approve:
  • list_issues - Fetching issues
  • get_issue - Loading issue details
  • create_comment - Posting updates to Linear

Tip: Select "Always allow" for Linear tools to avoid repeated prompts.
```
```

**Location in CLAUDE.md:** Phase 5 (Linear MCP Authentication)

---

### 5. Test Issue Should Create a File
**Issue:** Test issue should demonstrate 2-way interaction by having Claude create a file.

**Current test issue:**
- User authentication feature
- Just requirements, no file creation

**Improved test issue:**
```markdown
**Title:** Setup Verification - Create Welcome Guide

**Description:**
Create a simple welcome guide file to verify the Linear workflow integration.

## Requirements

Create a file called `WELCOME.md` in the project root with the following:

1. A welcome message for new team members
2. Brief explanation of the Linear workflow
3. Link to workflow documentation
4. Example of how to start work on an issue

## Acceptance Criteria

- [ ] `WELCOME.md` file exists in project root
- [ ] File contains welcome message
- [ ] File explains how to use `/start-issue`
- [ ] File links to `docs/linear-workflow.md`
- [ ] File is properly formatted (Markdown)

## Technical Notes

This is a test issue to verify:
- ✓ Claude can fetch and analyze Linear issues
- ✓ Claude can create files based on issue requirements
- ✓ Claude can post task analysis to Linear
- ✓ Claude can commit and push changes
- ✓ 2-way Linear integration is working

Keep it simple - just a basic markdown file with a welcome message!

---

**Test Issue:** This verifies the complete Linear workflow integration.
When Claude analyzes this, it should:
1. Understand it needs to create a file
2. Post analysis comment to Linear ← 2-way flow!
3. Create the WELCOME.md file
4. Make a commit with proper issue reference
5. Push to feature branch
```

Benefits:
- Demonstrates file creation capability
- Tests full 2-way workflow
- Creates useful documentation as side effect
- Easy to verify (file exists, has content)
- More realistic than authentication feature

**Location in CLAUDE.md:** Phase 9 (Create Test Issue)

---

### 6. Tutorial Command Error Message
**Issue:** Shows "Error: Unknown slash command: tutorial" but then runs anyway.

**Root cause:** The tutorial template exists but the error message is confusing UX.

**Fix options:**

**Option A:** Suppress the error message
```markdown
When user runs `/tutorial`, immediately invoke tutorial workflow without showing error.
```

**Option B:** Acknowledge and explain
```markdown
When user runs `/tutorial`:

```
Note: The tutorial command runs via prompt expansion (this is expected)

Starting interactive tutorial...
```
```

**Option C:** Update the template file name
- Rename to use a different mechanism that doesn't show the error
- This may require changes to how slash commands work

**Recommended:** Option A (suppress error, just run tutorial)

**Location in CLAUDE.md:** Tutorial command section

---

### 7. Final Closure Message
**Issue:** Setup completion must end with: "Issues are friends, not food. 🐟"

**Current ending:**
```
Happy coding with Linear + Claude! 🚀
```

**Required ending:**
```
Issues are friends, not food. 🐟

Happy coding with Linear + Claude! 🚀
```

**Location in CLAUDE.md:** Phase 11 (Commit and Push Installation) - final message

**Implementation:**
```markdown
After showing the completion message and merge instructions, add:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Remember:

Issues are friends, not food. 🐟

Happy coding with Linear + Claude! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
```

---

## Summary of Changes Needed

### In CLAUDE.md:
1. **Phase 7:** Add backup file cleanup and .gitignore entries
2. **Phase 8:** Improve template creation flow with API key option
3. **Phase 5:** Add MCP tool auto-approval section
4. **Phase 9:** Update test issue to include file creation requirement
5. **Tutorial:** Fix error message UX
6. **Phase 11:** Add "Issues are friends, not food. 🐟" to final message

### In Code:
- ✅ Created missing command templates (start-issue, progress-update)
- Add backup cleanup logic to setup orchestrator
- Add .gitignore updates during installation
- Update test issue creation with file requirement

### Testing Checklist:
- [ ] Verify all 21 command templates install correctly
- [ ] Test backup cleanup after installation
- [ ] Verify .gitignore includes backup files
- [ ] Test template creation with/without API key
- [ ] Test MCP tool auto-approval (if available)
- [ ] Verify test issue creates WELCOME.md file
- [ ] Confirm tutorial command runs smoothly
- [ ] Check final message has "Issues are friends, not food. 🐟"

---

## Priority Order

1. **High Priority (Affects user experience):**
   - ✅ Missing command templates
   - Final closure message
   - Template creation flow
   - Test issue file creation

2. **Medium Priority (Nice to have):**
   - MCP tool auto-approval
   - Tutorial error message
   - Backup cleanup

3. **Low Priority (Documentation):**
   - Backup file management docs
