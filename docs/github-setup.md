# GitHub Setup Guide

This guide walks you through configuring your GitHub repository for the Linear workflow integration, including CLI authentication, repository setup, and GitHub Actions configuration.

## Overview

The GitHub integration requires:
1. **GitHub CLI** - Installed and authenticated
2. **Repository Access** - Admin or write permissions
3. **GitHub Actions** - Enabled for your repository
4. **Repository Secrets** - LINEAR_API_KEY configured

---

## Step 1: Install GitHub CLI

If you haven't already, install the GitHub CLI (`gh`).

**Check if installed:**
```bash
gh --version
```

**If not installed, see:** [Prerequisites Guide](./prerequisites.md#3-github-cli-version-20)

---

## Step 2: Authenticate with GitHub

### 2.1 Login to GitHub CLI

```bash
gh auth login
```

**Follow the prompts:**

**1. What account do you want to log into?**
```
> GitHub.com
  GitHub Enterprise Server
```
**Choose:** `GitHub.com`

**2. What is your preferred protocol for Git operations?**
```
> HTTPS
  SSH
```
**Choose:** `HTTPS` (recommended for most users)

**3. Authenticate GitHub CLI with your GitHub credentials?**
```
> Login with a web browser
  Paste an authentication token
```
**Choose:** `Login with a web browser`

**4. Follow browser flow:**
- Browser will open automatically
- Click **"Authorize github"**
- Complete any 2FA if required
- Return to terminal

---

### 2.2 Verify Authentication

```bash
gh auth status
```

**Expected output:**
```
✓ Logged in to github.com as YOUR_USERNAME (keyring)
✓ Git operations for github.com configured to use https protocol.
✓ Token: *******************
✓ Token scopes: admin:public_key, gist, repo, workflow
```

**Key things to verify:**
- ✓ Shows "Logged in to github.com"
- ✓ Shows your username
- ✓ Token scopes include: `repo`, `workflow`

---

### 2.3 Add Required Scopes (If Missing)

If you're missing `repo` or `workflow` scopes:

```bash
gh auth refresh -s repo -s workflow
```

**This will:**
- Re-authenticate with additional permissions
- Update your token with required scopes
- May open browser for re-authorization

**Verify scopes were added:**
```bash
gh auth status
```

---

## Step 3: Repository Setup

### 3.1 Navigate to Your Project

```bash
cd /path/to/your/project
```

**Verify you're in the right directory:**
```bash
pwd
# Should show your project path

git status
# Should show git status (not "not a git repository")
```

---

### 3.2 Check Repository Connection

```bash
gh repo view
```

**Expected output:**
```
name: your-repo-name
description: Your repository description
owner: YOUR_USERNAME
...
```

**If you get "not found" or error:**
Your repository may not be connected to GitHub yet. Continue to Step 3.3.

---

### 3.3 Create GitHub Repository (If Needed)

**If repository doesn't exist on GitHub:**

```bash
gh repo create
```

**Follow the prompts:**

**1. What would you like to do?**
```
> Push an existing local repository to GitHub
  Create a new repository on GitHub from scratch
```
**Choose:** `Push an existing local repository to GitHub`

**2. Path to local repository:**
```
. (current directory)
```

**3. Repository name:**
```
your-project-name
```

**4. Description:**
```
Your project description (optional)
```

**5. Visibility:**
```
> Private
  Public
```
**Choose based on your needs** (Private recommended for most projects)

**6. Add a remote?**
```
Yes
```

**7. What should the new remote be called?**
```
origin
```

**8. Would you like to push commits from the current branch?**
```
Yes
```

---

### 3.4 Verify Repository Access

**Check your permission level:**

```bash
gh repo view --json permissions
```

**You need at minimum:**
```json
{
  "permissions": {
    "admin": false,
    "maintain": false,
    "push": true,
    "triage": false,
    "pull": true
  }
}
```

**Required permissions:**
- ✓ `push: true` - Can push code
- ✓ `admin: true` OR `maintain: true` - Can configure secrets (preferred)

**If you only have `pull: true`:**
- You have read-only access
- Ask repository owner for write/admin access
- Or fork the repository and set up workflow in your fork

---

## Step 4: Enable GitHub Actions

### 4.1 Check if Actions is Enabled

```bash
gh workflow list
```

**If Actions is enabled:**
```
# May show existing workflows or be empty
# No error message
```

**If Actions is disabled:**
```
GitHub Actions is disabled on this repository
```

---

### 4.2 Enable Actions (If Disabled)

**Via GitHub CLI:**
```bash
# This may not work on all repos, try web interface instead
gh api -X PUT repos/:owner/:repo/actions/permissions \
  -F enabled=true
```

**Via Web Interface:**
1. Go to your repository on GitHub.com
2. Click **Settings** (requires admin access)
3. Click **Actions** → **General** in left sidebar
4. Under **Actions permissions**, select:
   - **"Allow all actions and reusable workflows"** (recommended)
   - Or **"Allow OWNER, and select non-OWNER, actions and reusable workflows"**
5. Scroll down and click **Save**

**Verify Actions is enabled:**
```bash
gh workflow list
# Should not show error about Actions being disabled
```

---

### 4.3 Configure Workflow Permissions

**Set workflow permissions to allow writing:**

1. Go to repository **Settings → Actions → General**
2. Scroll to **Workflow permissions**
3. Select:
   - **"Read and write permissions"**
   - ✓ Check **"Allow GitHub Actions to create and approve pull requests"** (optional)
4. Click **Save**

**Why this matters:**
The workflow needs to be able to read repository data and potentially write comments or status checks.

---

## Step 5: Configure Repository Secrets

### 5.1 Understand Repository Secrets

GitHub Secrets are encrypted environment variables that:
- Are stored securely in your repository
- Are accessible to GitHub Actions workflows
- Never appear in logs or output
- Can be updated without changing code

**The Linear workflow needs:**
- `LINEAR_API_KEY` - Your Linear API key

---

### 5.2 Add LINEAR_API_KEY Secret

**Method 1: Via GitHub CLI (Recommended)**

```bash
gh secret set LINEAR_API_KEY
```

**You'll be prompted to paste the value:**
```
Paste your secret (⏎ to finish):
```

**Paste your Linear API key** (from [Linear Setup Guide](./linear-setup.md)) and press Enter.

**Expected output:**
```
✓ Set Actions secret LINEAR_API_KEY for YOUR_USERNAME/your-repo
```

---

**Method 2: Via Web Interface**

1. Go to your repository on GitHub.com
2. Click **Settings**
3. Click **Secrets and variables** → **Actions** in left sidebar
4. Click **New repository secret**
5. **Name:** `LINEAR_API_KEY`
6. **Secret:** Paste your Linear API key
7. Click **Add secret**

---

### 5.3 Verify Secret Exists

```bash
gh secret list
```

**Expected output:**
```
LINEAR_API_KEY  Updated YYYY-MM-DD
```

**If the secret is not listed:**
- Re-run `gh secret set LINEAR_API_KEY`
- Or use web interface method
- Check you have admin/maintain permissions on repository

---

### 5.4 Test Secret Access (Optional)

**Create a test workflow to verify secret is accessible:**

```bash
# Create test workflow
mkdir -p .github/workflows
cat > .github/workflows/test-secret.yml << 'EOF'
name: Test Secret Access
on: workflow_dispatch
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check secret
        env:
          LINEAR_KEY: ${{ secrets.LINEAR_API_KEY }}
        run: |
          if [ -z "$LINEAR_KEY" ]; then
            echo "❌ LINEAR_API_KEY secret is not set"
            exit 1
          fi
          echo "✓ LINEAR_API_KEY secret is accessible"
          echo "Key length: ${#LINEAR_KEY} characters"
EOF

# Push to GitHub
git add .github/workflows/test-secret.yml
git commit -m "test: add secret access test"
git push

# Run workflow
gh workflow run test-secret.yml

# Wait a few seconds, then check status
gh run list --workflow=test-secret.yml --limit 1
```

**Expected:** Workflow completes successfully ✓

**Clean up test workflow:**
```bash
git rm .github/workflows/test-secret.yml
git commit -m "test: remove secret access test"
git push
```

---

## Step 6: Branch Configuration

### 6.1 Understand Branch Strategy

The workflow needs to know your branch names:

**Common strategies:**

**Simple:**
- `main` only
- All PRs merge to `main`

**Standard:**
- `main` for development
- `staging` for QA/testing

**Enterprise:**
- `main` for development
- `staging` for QA
- `prod` for production

---

### 6.2 List Your Branches

```bash
git branch -a
```

**Example output:**
```
* main
  remotes/origin/main
  remotes/origin/staging
  remotes/origin/production
```

**Note the branch names you use** - you'll configure these during setup.

---

### 6.3 Check Branch Protection (Optional)

**If you have branch protection on `main`:**

```bash
node scripts/github-setup.js check-branch main
```

**Branch protection is fine, but ensure:**
- GitHub Actions can run on protected branches
- Workflow runs are not blocked
- Status checks (if required) are properly configured

**To adjust protection rules:**
1. Go to repository **Settings → Branches**
2. Click **Edit** on branch protection rule
3. Configure as needed
4. Save changes

---

## Step 7: Test GitHub Integration

### 7.1 Run Verification Script

From the `claude-linear-gh-starter` repository:

```bash
node scripts/github-setup.js verify
```

**Expected output:**
```
GitHub Access Verification

✓ GitHub CLI installed: gh CLI is installed
✓ GitHub authentication: Authenticated as YOUR_USERNAME
✓ Required OAuth scopes: Has repo and workflow scopes
✓ Repository connection: Connected to YOUR_USERNAME/your-repo
✓ Repository permissions: Permission level: admin
✓ GitHub Actions: GitHub Actions enabled (X workflows)

✓ Overall status: PASS
```

**If any checks fail:**
- Follow the error messages to resolve issues
- Review relevant sections in this guide
- See [Troubleshooting](#troubleshooting) below

---

### 7.2 Manual Verification Checklist

- [ ] `gh auth status` shows authenticated
- [ ] `gh repo view` shows your repository
- [ ] `gh workflow list` works (Actions enabled)
- [ ] `gh secret list` shows LINEAR_API_KEY
- [ ] You have push permission to repository
- [ ] You have admin/maintain permission (for secrets)

---

## Troubleshooting

### "gh: command not found"

**Problem:** GitHub CLI not installed

**Solution:** See [Prerequisites Guide](./prerequisites.md#3-github-cli-version-20)

---

### "failed to get current user"

**Problem:** Not authenticated with GitHub

**Solution:**
```bash
gh auth login
```

Follow authentication flow.

---

### "HTTP 404: Not Found"

**Problem:** Repository doesn't exist or you don't have access

**Solutions:**
1. Verify you're in correct directory: `pwd`
2. Check remote URL: `git remote -v`
3. Verify repository exists: Visit GitHub.com
4. Request access if it's someone else's repository

---

### "permission denied"

**Problem:** Insufficient repository permissions

**Solutions:**
1. Check your permission level:
   ```bash
   gh repo view --json permissions
   ```

2. If you only have `pull: true`:
   - Ask repository owner for write/admin access
   - Or fork the repository

3. If you own the repository:
   - Ensure you're authenticated as correct user: `gh auth status`

---

### "Actions is not enabled"

**Problem:** GitHub Actions is disabled for repository

**Solution:**
1. Go to repository **Settings → Actions → General**
2. Enable Actions
3. Select appropriate permissions
4. Save changes

Or programmatically:
```bash
gh api -X PUT repos/:owner/:repo/actions/permissions -F enabled=true
```

---

### "failed to create secret"

**Problem:** Cannot set repository secret

**Solutions:**
1. **Check permissions:**
   - Need admin or maintain access
   - Verify: `gh repo view --json permissions`

2. **Check Actions is enabled:**
   - Secrets only work if Actions is enabled
   - Verify: `gh workflow list`

3. **Try web interface:**
   - Settings → Secrets and variables → Actions
   - New repository secret

4. **Check secret name:**
   - Must be uppercase
   - Use underscores not hyphens
   - Cannot start with `GITHUB_`

---

### "Rate limit exceeded"

**Problem:** Hit GitHub API rate limit

**Solution:**
- Wait 1 hour for rate limit reset
- Check current limits: `gh api rate_limit`
- Authenticated requests have higher limits (5000/hour)

---

### Multiple GitHub Accounts

**Problem:** Logged into wrong GitHub account

**Solution:**
1. Check current user:
   ```bash
   gh auth status
   ```

2. Logout and re-authenticate:
   ```bash
   gh auth logout
   gh auth login
   ```

3. Choose correct account during login

---

## Security Best Practices

### Protect Repository Secrets

**DO:**
- ✓ Use repository secrets for sensitive data
- ✓ Limit who has admin access to repository
- ✓ Audit secret access regularly
- ✓ Rotate secrets periodically
- ✓ Use environments for additional protection (Pro/Enterprise)

**DON'T:**
- ✗ Hardcode secrets in workflow files
- ✗ Log secret values
- ✗ Use secrets in pull requests from forks (they won't have access)
- ✗ Share secrets across repositories unnecessarily

---

### Workflow Security

**Best practices:**
1. **Review third-party actions:**
   - Only use actions from trusted sources
   - Pin actions to specific commits or versions
   - Example: `actions/checkout@v4` ✓ vs `actions/checkout@main` ✗

2. **Limit workflow permissions:**
   - Use `permissions:` block in workflow
   - Grant minimum required permissions
   - Default to read-only

3. **Validate inputs:**
   - Don't trust user input in workflows
   - Sanitize branch names, PR titles, etc.
   - Use GitHub expressions carefully

---

## Advanced Configuration

### Environment Protection Rules (Pro/Enterprise)

**For additional security:**
1. Go to repository **Settings → Environments**
2. Create environment (e.g., "production")
3. Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches
4. Reference environment in workflow:
   ```yaml
   jobs:
     deploy:
       environment: production
   ```

---

### Branch Protection Rules

**Recommended settings for `main` branch:**
1. Go to **Settings → Branches**
2. Add rule for `main`
3. Enable:
   - ✓ Require pull request before merging
   - ✓ Require status checks to pass
   - ✓ Require conversation resolution
   - ✓ Include administrators (recommended)
4. Save

---

### Organization Secrets

**If using GitHub organization:**
- Secrets can be shared across repositories
- Go to Organization **Settings → Secrets and variables**
- Add organization-level secrets
- Grant access to specific repositories

---

## Getting Help

**GitHub Docs:**
- [GitHub CLI docs](https://cli.github.com/manual/)
- [GitHub Actions docs](https://docs.github.com/en/actions)
- [Managing secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

**Integration Support:**
- [Troubleshooting guide](./troubleshooting.md)
- [Open an issue](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)

---

## Next Steps

With GitHub configured, you're ready to:

1. ✓ Prerequisites verified
2. ✓ Linear API key created
3. ✓ GitHub repository configured
4. → **Next:** Run the setup wizard!

Or optionally configure MCP integration:
→ [MCP Setup Guide](./mcp-setup.md)

---

**Ready to install?** → Return to main README for setup wizard instructions
