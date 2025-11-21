# Troubleshooting Guide

This guide helps you resolve common issues with the Linear workflow setup and integration.

## Quick Diagnostics

Before diving into specific issues, run the automated pre-flight checks:

```bash
# Automated pre-flight checks (recommended)
./install/scripts/preflight-checks.sh

# GitHub authentication helper
./install/scripts/github-auth-helper.sh

# Manual validation (if scripts unavailable)
node install/scripts/github-setup.js verify
node install/scripts/test-integration.js
node install/scripts/validate-config.js .linear-workflow.json
node install/scripts/validate-workflow.js .github/workflows/linear-status-update.yml
```

---

## Most Common Issues

These are the most frequently encountered issues during setup:

### 1. Cannot Push Workflow Files - Missing `workflow` Scope

**Error:**
```
! [remote rejected] branch -> branch (refusing to allow an OAuth App to create or
  update workflow `.github/workflows/linear-status-update.yml` without `workflow` scope)
error: failed to push some refs to 'https://github.com/owner/repo.git'
```

**Cause:** Your GitHub CLI authentication is missing the `workflow` scope, which is required to push files to `.github/workflows/`.

**Fix:**

**Option 1 - Use the helper script (recommended):**
```bash
./install/scripts/github-auth-helper.sh
```

The script will guide you through re-authentication.

**Option 2 - Refresh authentication manually:**
```bash
gh auth refresh --scopes workflow
```

**Option 3 - Re-authenticate from scratch:**
```bash
gh auth logout
gh auth login --scopes workflow
```

When prompted during `gh auth login`, choose:
- **GitHub.com** (not Enterprise)
- **HTTPS** protocol
- **Authenticate via web browser** (recommended)

**Verify the fix:**
```bash
gh auth status 2>&1 | grep workflow
```

You should see `workflow` in the scopes list.

**Prevention:** Always run pre-flight checks before setup:
```bash
./install/scripts/preflight-checks.sh
```

---

### 2. LINEAR_API_KEY Not Available in Shell

**Message:**
```
Good news! Your LINEAR_API_KEY is already configured in the .env file. However,
for it to be available in your current shell session, you need to export it.
```

**Cause:** The `.env` file exists but the environment variable isn't loaded in your current shell.

**Important:** This is usually NOT a blocker! The LINEAR_API_KEY in `.env` is used for:
- Local testing (if you run Linear API commands manually in your shell)
- MCP integration (if using Claude with MCP)

**The GitHub Actions workflow doesn't need this** - it uses the `LINEAR_API_KEY` secret we configured in GitHub repository secrets during setup.

**If you need it in your shell for testing:**

```bash
# Load from .env file
export LINEAR_API_KEY=$(grep LINEAR_API_KEY .env | cut -d '=' -f2)

# Verify
echo $LINEAR_API_KEY
```

**For permanent shell access**, add to your shell profile (`~/.bashrc`, `~/.zshrc`):
```bash
# Add this line (with your actual key)
export LINEAR_API_KEY=lin_api_YOUR_KEY_HERE
```

Then reload:
```bash
source ~/.zshrc  # or ~/.bashrc
```

**Security Note:** Make sure `.env` is in your `.gitignore` to avoid committing secrets!

---

## Installation Issues

### Setup Wizard Won't Start

**Symptoms:**
- Claude doesn't respond to "Setup Linear workflow"
- No setup wizard appears

**Solutions:**

1. **Verify you're in the correct repository:**
   ```bash
   pwd
   # Should be in claude-linear-gh-starter directory

   ls CLAUDE.md
   # Should exist
   ```

2. **Check Claude Code is using the CLAUDE.md file:**
   - Ensure CLAUDE.md is in the repository root
   - Restart Claude Code CLI
   - Try saying: "Read the CLAUDE.md file"

3. **Use explicit trigger phrase:**
   ```
   Setup Linear workflow
   ```
   (Exact phrase from CLAUDE.md)

---

### Pre-Flight Checks Fail

**Symptoms:**
- Setup stops with "Pre-flight checks failed"
- Missing requirements error

**Solutions:**

**For "Git not found":**
```bash
# Install Git
# macOS:
brew install git

# Linux:
sudo apt install git

# Verify:
git --version
```

**For "GitHub CLI not found":**
```bash
# Install gh
# macOS:
brew install gh

# Linux:
sudo apt install gh

# Verify:
gh --version
```

**For "Not authenticated":**
```bash
gh auth login
# Follow prompts
```

**For "Node.js not found":**
```bash
# Install Node.js 16+
# macOS:
brew install node

# Verify:
node --version
```

---

### "Permission Denied" During Installation

**Symptoms:**
- Cannot write to `.github/workflows/`
- Cannot create directories

**Solutions:**

1. **Check file permissions:**
   ```bash
   ls -la .github/
   ls -la .github/workflows/
   ```

2. **Ensure you own the directory:**
   ```bash
   # Check ownership
   ls -la | grep .github

   # Fix if needed (macOS/Linux)
   sudo chown -R $USER .github/
   ```

3. **Check disk space:**
   ```bash
   df -h .
   # Ensure sufficient space available
   ```

---

## GitHub Integration Issues

### GitHub CLI Authentication Fails

**Symptoms:**
- `gh auth status` shows not logged in
- Authentication errors during setup

**Solutions:**

1. **Re-authenticate:**
   ```bash
   gh auth logout
   gh auth login
   ```

2. **Choose correct options:**
   - GitHub.com (not Enterprise)
   - HTTPS protocol
   - Login with browser

3. **Check OAuth scopes:**
   ```bash
   gh auth status
   # Should show: repo, workflow
   ```

4. **Refresh with required scopes:**
   ```bash
   gh auth refresh -s repo -s workflow
   ```

---

### "Repository Not Found"

**Symptoms:**
- `gh repo view` fails
- Setup says no GitHub repository

**Solutions:**

1. **Check you're in a git repository:**
   ```bash
   git status
   # Should not say "not a git repository"
   ```

2. **Check remote is configured:**
   ```bash
   git remote -v
   # Should show origin pointing to GitHub
   ```

3. **Add remote if missing:**
   ```bash
   gh repo view
   # If this fails, create the repo:
   gh repo create
   ```

4. **Verify repository exists on GitHub:**
   - Visit github.com/YOUR_USERNAME/REPO_NAME
   - Ensure you have access

---

### Cannot Set GitHub Secrets

**Symptoms:**
- `gh secret set LINEAR_API_KEY` fails
- "Permission denied" for secrets

**Solutions:**

1. **Check repository permissions:**
   ```bash
   gh repo view --json permissions
   ```

   You need `admin: true` or `maintain: true`

2. **If you don't have permission:**
   - Ask repository owner for admin access
   - Or use web interface (may have different permissions)

3. **Ensure Actions is enabled:**
   ```bash
   gh workflow list
   # Should not show "Actions disabled"
   ```

4. **Try web interface:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `LINEAR_API_KEY`
   - Value: Your API key

---

### GitHub Actions Workflow Doesn't Run

**Symptoms:**
- Workflow file exists but doesn't execute
- No workflow runs appear

**Solutions:**

1. **Check Actions is enabled:**
   ```bash
   gh workflow list
   ```

   If disabled, enable in Settings → Actions → General

2. **Check workflow file location:**
   ```bash
   ls -la .github/workflows/
   # Should contain linear-status-update.yml
   ```

3. **Validate workflow syntax:**
   ```bash
   node install/scripts/validate-workflow.js .github/workflows/linear-status-update.yml
   ```

4. **Check workflow has been pushed:**
   ```bash
   git log --oneline -- .github/workflows/
   # Should show commit with workflow file

   git push origin main
   ```

5. **Manually trigger workflow:**
   ```bash
   gh workflow run linear-status-update.yml
   ```

6. **View workflow logs:**
   ```bash
   gh run list --workflow=linear-status-update.yml
   gh run view <run-id> --log
   ```

---

## Linear Integration Issues

### Linear API Key Invalid

**Symptoms:**
- "Authentication failed" from Linear
- Setup wizard rejects API key

**Solutions:**

1. **Verify key format:**
   - Should start with `lin_api_`
   - About 40-50 characters long
   - No spaces or line breaks

2. **Check key hasn't been deleted:**
   - Visit [linear.app/settings/api](https://linear.app/settings/api)
   - Ensure key is still listed
   - If missing, create new key

3. **Test key directly:**
   ```bash
   curl https://api.linear.app/graphql \
     -H "Authorization: YOUR_KEY" \
     -d '{"query":"{ viewer { id name } }"}'
   ```

   Should return your user info, not an error

4. **Create new key:**
   - Go to Linear Settings → API
   - Create new API key
   - Replace in GitHub secrets:
     ```bash
     gh secret set LINEAR_API_KEY
     ```

---

### "No Teams Found"

**Symptoms:**
- Setup says no Linear teams available
- Cannot select a team

**Solutions:**

1. **Verify team membership:**
   - Go to Linear Settings → Teams
   - Ensure you're a member of at least one team

2. **Check API key permissions:**
   - API key inherits your user permissions
   - Ensure you have access to view teams

3. **Try different API key:**
   - Some workspace roles may have limited access
   - Ask workspace admin for appropriate permissions

---

### Linear Status Not Updating

**Symptoms:**
- Commits/PRs don't update Linear issue status
- Issue stays in old status

**Solutions:**

1. **Check commit message includes issue ID:**
   ```bash
   git log --oneline -1
   # Should contain: DEV-123 (or your issue ID format)
   ```

2. **Verify issue ID format matches configuration:**
   ```bash
   cat .linear-workflow.json | grep issuePattern
   # Should match your commit format
   ```

3. **Check GitHub Actions ran:**
   ```bash
   gh run list --workflow=linear-status-update.yml --limit 5
   ```

4. **View workflow logs:**
   ```bash
   gh run view <run-id> --log
   # Look for Linear API calls and errors
   ```

5. **Verify LINEAR_API_KEY secret is set:**
   ```bash
   gh secret list
   # Should show LINEAR_API_KEY
   ```

6. **Check issue exists and is accessible:**
   - Visit Linear and verify issue ID exists
   - Ensure issue is not archived
   - Check you have permission to edit issue

7. **Check workflow state mapping:**
   ```bash
   cat .linear-workflow.json | grep -A 10 statuses
   # Verify status names match Linear exactly
   ```

---

### Linear Rate Limit Exceeded

**Symptoms:**
- "Rate limit exceeded" errors
- 429 responses from Linear API

**Solutions:**

1. **Wait for rate limit reset:**
   - Linear allows 120 requests/minute
   - Wait 1 minute and try again

2. **Check for workflow loops:**
   ```bash
   gh run list --limit 20
   # Look for excessive workflow runs
   ```

3. **Reduce workflow frequency:**
   - Edit workflow triggers if needed
   - Consolidate multiple commits before pushing

4. **Contact Linear support:**
   - If legitimate usage hitting limits
   - Request increased rate limits

---

## Workflow Validation Issues

### "Invalid YAML Syntax"

**Symptoms:**
- Workflow file validation fails
- GitHub shows syntax error

**Solutions:**

1. **Run validator:**
   ```bash
   node install/scripts/validate-workflow.js .github/workflows/linear-status-update.yml
   ```

2. **Common YAML issues:**
   - **Tabs instead of spaces:**
     ```bash
     # Check for tabs
     cat -A .github/workflows/linear-status-update.yml | grep "^I"
     ```
     Fix: Replace tabs with spaces

   - **Incorrect indentation:**
     Each level should be 2 spaces

   - **Missing quotes:**
     Strings with special characters need quotes

3. **Use YAML validator:**
   ```bash
   # Python
   python -c "import yaml; yaml.safe_load(open('.github/workflows/linear-status-update.yml'))"

   # Online: yamllint.com
   ```

4. **Re-render template:**
   ```bash
   node install/scripts/apply-config.js apply \
     install/templates/workflow/github-workflow.yml.template \
     .github/workflows/linear-status-update.yml \
     .linear-workflow.json
   ```

---

### "Secret Not Accessible in Workflow"

**Symptoms:**
- Workflow runs but LINEAR_API_KEY is empty
- Authentication fails in workflow

**Solutions:**

1. **Verify secret exists:**
   ```bash
   gh secret list
   ```

2. **Check secret name exactly:**
   - Must be `LINEAR_API_KEY` (uppercase)
   - Not `linear_api_key` or `Linear_API_Key`

3. **Re-set the secret:**
   ```bash
   gh secret set LINEAR_API_KEY
   # Paste your Linear API key
   ```

4. **Check workflow has permission to access secrets:**
   - Workflows from forks cannot access secrets
   - Ensure running on your repository, not a fork

5. **Test secret access:**
   - View workflow logs
   - Look for "LINEAR_API_KEY is not set" messages

---

## Template Rendering Issues

### "Template Variable Not Replaced"

**Symptoms:**
- Generated files still contain `{{variable}}`
- Configuration not applied correctly

**Solutions:**

1. **Check configuration file:**
   ```bash
   cat .linear-workflow.json
   # Verify all required fields are present
   ```

2. **Validate configuration:**
   ```bash
   node install/scripts/validate-config.js .linear-workflow.json
   ```

3. **Re-render templates:**
   ```bash
   node install/scripts/apply-config.js apply \
     install/templates/TEMPLATE_NAME.template \
     OUTPUT_PATH \
     .linear-workflow.json
   ```

4. **Check template syntax:**
   - Variables: `{{variable}}`
   - Nested: `{{object.property}}`
   - Conditional: `{{#condition}}...{{/condition}}`

---

### Configuration Validation Fails

**Symptoms:**
- `.linear-workflow.json` doesn't validate
- Error messages about invalid config

**Solutions:**

1. **Run validator with details:**
   ```bash
   node install/scripts/validate-config.js .linear-workflow.json
   ```

2. **Common validation errors:**

   **Branch names not unique:**
   ```json
   {
     "branches": {
       "main": "main",
       "staging": "main"  // ❌ Duplicate
     }
   }
   ```
   Fix: Use different branch names

   **Invalid regex pattern:**
   ```json
   {
     "formats": {
       "issuePattern": "[invalid(regex"  // ❌ Unclosed bracket
     }
   }
   ```
   Fix: Use valid regex

   **Issue example doesn't match pattern:**
   ```json
   {
     "formats": {
       "issuePattern": "[A-Z]+-\\d+",
       "issueExample": "invalid"  // ❌ Doesn't match pattern
     }
   }
   ```
   Fix: Use matching example (e.g., "DEV-123")

3. **Check JSON syntax:**
   ```bash
   cat .linear-workflow.json | python -m json.tool
   ```

4. **Compare with schema:**
   ```bash
   cat install/config/schema.json
   # Review required fields and formats
   ```

---

## MCP Integration Issues

### Claude Cannot Access Linear

**Symptoms:**
- Claude says "I don't have access to Linear"
- MCP tools not available

**Solutions:**

1. **Verify MCP configuration:**

   **For Claude Code CLI:**
   ```bash
   cat .mcp.json
   ```

   **For Claude Desktop:**
   ```bash
   # macOS
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Check configuration format:**
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["-y", "@linear/mcp-server-linear"],
         "env": {
           "LINEAR_API_KEY": "lin_api_YOUR_KEY_HERE"
         }
       }
     }
   }
   ```

3. **Restart Claude:**
   - Completely quit and reopen
   - Don't just close the window

4. **Test MCP server directly:**
   ```bash
   export LINEAR_API_KEY="lin_api_YOUR_KEY"
   npx -y @linear/mcp-server-linear
   ```

   Should start without errors

5. **Check npx is available:**
   ```bash
   npx --version
   # Should show npm version
   ```

---

### MCP Server Crashes

**Symptoms:**
- MCP server starts then stops
- Error messages in Claude logs

**Solutions:**

1. **Check Claude logs:**
   ```bash
   # macOS
   tail -f ~/Library/Logs/Claude/*.log

   # Linux
   tail -f ~/.config/Claude/logs/*.log
   ```

2. **Verify Node.js version:**
   ```bash
   node --version
   # Should be 16+ or higher
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

4. **Test Linear API directly:**
   ```bash
   curl https://api.linear.app/graphql \
     -H "Authorization: YOUR_KEY" \
     -d '{"query":"{ viewer { id } }"}'
   ```

5. **Try installing MCP server globally:**
   ```bash
   npm install -g @linear/mcp-server-linear

   # Then update config to use global install
   which linear-mcp-server
   ```

---

## Performance Issues

### Workflow Takes Too Long

**Symptoms:**
- Workflow runs for several minutes
- Timeout errors

**Solutions:**

1. **Add timeout to workflow:**
   ```yaml
   jobs:
     update-linear:
       timeout-minutes: 5
   ```

2. **Check for network issues:**
   - View workflow logs for delays
   - Look for retries or timeouts

3. **Optimize Linear API calls:**
   - Batch updates if possible
   - Use GraphQL queries efficiently

4. **Add concurrency limits:**
   ```yaml
   concurrency:
     group: linear-update-${{ github.ref }}
     cancel-in-progress: true
   ```

---

### Git Hooks Slow Down Commits

**Symptoms:**
- `git commit` takes several seconds
- Commit hook runs slowly

**Solutions:**

1. **Check hook content:**
   ```bash
   cat .git/hooks/commit-msg
   ```

2. **Optimize regex matching:**
   - Use simpler patterns
   - Avoid complex validation

3. **Bypass hook temporarily:**
   ```bash
   git commit --no-verify -m "message"
   ```

4. **Remove hook if not needed:**
   ```bash
   rm .git/hooks/commit-msg
   ```

---

## Rollback and Recovery

### Need to Undo Installation

**Symptoms:**
- Installation went wrong
- Want to start over

**Solutions:**

1. **Use automated rollback:**
   ```bash
   node install/scripts/apply-config.js rollback
   ```

2. **Manual rollback:**
   ```bash
   # Restore from backups
   mv .github/workflows/linear-status-update.yml.backup \
      .github/workflows/linear-status-update.yml

   # Remove configuration
   rm .linear-workflow.json

   # Remove git hook
   rm .git/hooks/commit-msg
   ```

3. **Git reset (if committed):**
   ```bash
   git log --oneline | head -5
   # Find commit before installation

   git reset --hard COMMIT_HASH
   ```

4. **Fresh start:**
   ```bash
   # Remove all generated files
   rm -rf .github/workflows/linear-status-update.yml
   rm .linear-workflow.json
   rm .mcp.json
   rm .git/hooks/commit-msg

   # Re-run setup
   # Say to Claude: "Setup Linear workflow"
   ```

---

### Backup Files Everywhere

**Symptoms:**
- Many `.backup` files
- Disk space filling up

**Solutions:**

1. **List backup files:**
   ```bash
   find . -name "*.backup"
   ```

2. **Remove backups after successful installation:**
   ```bash
   find . -name "*.backup" -delete
   ```

3. **Or use cleanup script:**
   ```bash
   node install/scripts/example-usage.js --cleanup
   ```

---

## Getting More Help

### Enable Debug Mode

**For more verbose output:**

```bash
# Enable debug logging
export DEBUG=*

# Run setup or validation
node install/scripts/github-setup.js verify
```

---

### Collect Diagnostic Information

**Before reporting an issue, collect:**

1. **System information:**
   ```bash
   echo "OS: $(uname -s) $(uname -r)"
   echo "Node: $(node --version)"
   echo "npm: $(npm --version)"
   echo "Git: $(git --version)"
   echo "GitHub CLI: $(gh --version)"
   ```

2. **Configuration:**
   ```bash
   # Sanitize (remove API keys) before sharing
   cat .linear-workflow.json | sed 's/lin_api_[^"]*/"REDACTED"/'
   ```

3. **Validation results:**
   ```bash
   node install/scripts/validate-config.js .linear-workflow.json
   node install/scripts/validate-workflow.js .github/workflows/linear-status-update.yml
   node install/scripts/github-setup.js verify
   ```

4. **Recent errors:**
   ```bash
   # Workflow logs
   gh run list --limit 5
   gh run view <run-id> --log
   ```

---

### Where to Get Help

1. **Documentation:**
   - [Prerequisites](./prerequisites.md)
   - [Linear Setup](./linear-setup.md)
   - [GitHub Setup](./github-setup.md)
   - [MCP Setup](./mcp-setup.md)

2. **Community:**
   - [GitHub Discussions](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/discussions)
   - [Issues](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)

3. **Vendor Support:**
   - [Linear Support](https://linear.app/contact)
   - [GitHub Support](https://support.github.com)
   - [Claude Support](https://support.anthropic.com)

---

## Common Error Messages

### "EACCES: permission denied"

**Meaning:** No write permission to file or directory

**Fix:**
```bash
sudo chown -R $USER /path/to/directory
chmod 755 /path/to/directory
```

---

### "MODULE_NOT_FOUND"

**Meaning:** Missing Node.js dependency

**Fix:**
```bash
npm install
# Or for specific module:
npm install <module-name>
```

---

### "401 Unauthorized"

**Meaning:** Invalid or missing authentication

**Fix:**
- Check API key is correct
- Verify key hasn't been revoked
- Re-authenticate: `gh auth login`

---

### "404 Not Found"

**Meaning:** Resource doesn't exist

**Fix:**
- Verify repository exists
- Check issue ID is correct
- Ensure you have access to resource

---

### "422 Unprocessable Entity"

**Meaning:** Request valid but cannot be processed

**Fix:**
- Check required fields are present
- Verify data format matches API expectations
- Review Linear API documentation

---

### "Rate limit exceeded"

**Meaning:** Too many API requests

**Fix:**
- Wait 1 hour for limit reset
- Reduce request frequency
- Check for runaway loops

---

## Still Having Issues?

**Create a detailed issue report:**

1. **Title:** Brief description of problem
2. **Environment:** OS, Node version, etc.
3. **Steps to reproduce:** What you did
4. **Expected behavior:** What should happen
5. **Actual behavior:** What actually happened
6. **Error messages:** Full error output
7. **Diagnostics:** Output from diagnostic commands

**Submit at:** [GitHub Issues](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues/new)

---

**Back to:** [Documentation Index](./README.md)
