# Reset Procedure for Testing

This document describes how to reset the Linear workflow installation to simulate a first-time user experience.

## Purpose

Use this when you need to test the complete setup wizard from scratch, including:
- Pre-flight checks
- GitHub workflow scope authentication
- MCP setup
- Linear configuration
- Template creation
- Test issue verification

## Reset Steps

### 1. Clean Up Existing Installation

Remove all installed workflow files from the target project:

```bash
cd '/path/to/your/project'

# Remove configuration files
rm -f .linear-workflow.json
rm -f .env

# Remove GitHub Actions workflow
rm -f .github/workflows/linear-status-update.yml

# Remove documentation
rm -f docs/linear-workflow.md
rm -rf docs/issues/

# Remove git hooks
rm -f .git/hooks/commit-msg

# Remove GitHub secret
gh secret remove LINEAR_API_KEY
```

### 2. Reset GitHub Authentication

Remove the workflow scope to simulate a first-time user:

```bash
# Check current authentication
gh auth status

# Logout the account with workflow scope
gh auth logout --hostname github.com --user <username>

# The CLI will automatically switch to another authenticated account
# OR re-login without selecting workflow scope:
gh auth login --hostname github.com
# When prompted for scopes, do NOT select 'workflow'
```

### 3. Verify Clean State

Confirm everything is reset:

```bash
cd '/path/to/your/project'

# Should show no Linear files
git status

# Should NOT show 'workflow' in token scopes
gh auth status 2>&1 | grep -i "Token scopes"

# Should return empty or "not found"
gh secret list | grep LINEAR_API_KEY

# Should not exist
ls -la .linear-workflow.json .env
ls -la .github/workflows/linear-status-update.yml
ls -la docs/linear-workflow.md
ls -la .git/hooks/commit-msg
```

**Expected Clean State:**

```
GitHub Authentication:
  ✓ Logged in
  ✗ No 'workflow' scope (this is correct for testing)

Project Files:
  ✓ No .linear-workflow.json
  ✓ No .env
  ✓ No .github/workflows/linear-status-update.yml
  ✓ No docs/linear-workflow.md
  ✓ No docs/issues/
  ✓ No .git/hooks/commit-msg

GitHub Secrets:
  ✓ No LINEAR_API_KEY secret
```

## Testing the Setup Wizard

After reset, you can test the complete setup flow:

### Method 1: Slash Command (Recommended)

```bash
# In Claude Code:
/setup-linear
```

### Method 2: Natural Language

```bash
# In Claude Code:
"Setup Linear workflow"
"Install Linear workflow"
```

### Method 3: Alias

```bash
# In Claude Code:
/install
```

## What to Verify During Testing

### Phase 1: Pre-flight Checks
- [ ] Detects git repository
- [ ] Detects GitHub CLI
- [ ] Detects missing workflow scope
- [ ] Offers to fix scope automatically

### Phase 2: Authentication Fix
- [ ] Runs `gh auth refresh --scopes workflow`
- [ ] Opens browser for authentication
- [ ] Automatically polls for completion
- [ ] Detects when scope is added
- [ ] Continues setup without manual confirmation

### Phase 3: Configuration
- [ ] Connects to Linear API
- [ ] Fetches teams
- [ ] Fetches workflow states
- [ ] Collects branch strategy
- [ ] Collects format preferences
- [ ] Shows configuration summary

### Phase 4: Installation
- [ ] Creates .linear-workflow.json
- [ ] Creates .github/workflows/linear-status-update.yml
- [ ] Creates .env file
- [ ] Creates docs/linear-workflow.md
- [ ] Creates docs/issues/ directory
- [ ] Installs .git/hooks/commit-msg
- [ ] Sets LINEAR_API_KEY in GitHub secrets
- [ ] Updates TODO list after each step

### Phase 5: Template Creation
- [ ] Creates "Bug Report" template in Linear
- [ ] Creates "Improvement" template in Linear
- [ ] Creates "Feature" template in Linear
- [ ] Confirms all 3 templates created successfully

### Phase 6: Test Issue Creation
- [ ] Creates test issue: "Test Linear + Claude + GitHub Integration"
- [ ] Returns issue identifier (e.g., DEV-123)
- [ ] Provides issue URL

### Phase 7: Interactive Test Prompt
- [ ] Prompts user to test with: "Let's get to work on DEV-XXX"
- [ ] Explains what the test will verify

## Common Issues During Testing

### Issue: Cannot remove workflow file

**Symptom:**
```
rm: .github/workflows/linear-status-update.yml: No such file or directory
```

**Solution:** File doesn't exist - this is fine, continue with other cleanup steps.

### Issue: Cannot remove GitHub secret

**Symptom:**
```
HTTP 404: Not Found
```

**Solution:** Secret doesn't exist - this is fine, continue with verification.

### Issue: Still shows workflow scope after logout

**Symptom:**
```
gh auth status shows 'workflow' scope
```

**Solution:** You logged out the wrong account or there are multiple accounts. Run:
```bash
gh auth status  # Note which account has workflow scope
gh auth logout --hostname github.com --user <correct-username>
```

### Issue: Browser authentication doesn't open

**Symptom:**
```
gh auth refresh --scopes workflow doesn't open browser
```

**Solution:** Try alternative authentication:
```bash
gh auth login --hostname github.com --web
```

## Reset Script

For convenience, save this as `scripts/reset-testing.sh`:

```bash
#!/bin/bash
set -e

PROJECT_PATH="${1:-$PWD}"

echo "Resetting Linear workflow installation in: $PROJECT_PATH"
echo ""

cd "$PROJECT_PATH"

echo "1. Removing workflow files..."
rm -f .linear-workflow.json .env
rm -f .github/workflows/linear-status-update.yml
rm -f docs/linear-workflow.md
rm -rf docs/issues/
rm -f .git/hooks/commit-msg
echo "   ✓ Files removed"

echo ""
echo "2. Removing GitHub secret..."
gh secret remove LINEAR_API_KEY 2>/dev/null || echo "   (No secret to remove)"
echo "   ✓ Secret removed"

echo ""
echo "3. Current GitHub authentication:"
gh auth status 2>&1 | grep -A 5 "Active account: true" || true

echo ""
echo "✓ Reset complete!"
echo ""
echo "To remove workflow scope, run:"
echo "  gh auth logout --hostname github.com --user <username>"
echo ""
echo "To test setup, run in Claude Code:"
echo "  /setup-linear"
```

**Usage:**

```bash
# Make executable
chmod +x scripts/reset-testing.sh

# Run from project root
./scripts/reset-testing.sh '/path/to/target/project'
```

## Notes

- The reset procedure is idempotent - safe to run multiple times
- Always verify clean state before testing
- Keep your Linear API key handy for re-testing
- The setup wizard should handle missing workflow scope automatically
- Total setup time should be ~5 minutes with the enhanced flow

---

Last updated: 2025-11-11
