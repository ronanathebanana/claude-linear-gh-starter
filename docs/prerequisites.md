# Prerequisites

Before setting up the Linear workflow integration, ensure you have the following tools and access configured.

## Required Software

### 1. Git (Version 2.0+)

**Check if installed:**
```bash
git --version
```

**Installation:**

**macOS:**
```bash
# Via Xcode Command Line Tools
xcode-select --install

# Or via Homebrew
brew install git
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install git
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install git
```

**Windows:**
Download from [git-scm.com](https://git-scm.com/download/win)

**Verify installation:**
```bash
git --version
# Should output: git version 2.x.x
```

---

### 2. Node.js (Version 16.0+)

**Check if installed:**
```bash
node --version
```

**Installation:**

**macOS:**
```bash
# Via Homebrew
brew install node

# Or via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

**Linux:**
```bash
# Via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/)

**Verify installation:**
```bash
node --version
# Should output: v16.x.x or higher

npm --version
# Should output: 8.x.x or higher
```

---

### 3. GitHub CLI (Version 2.0+)

**Check if installed:**
```bash
gh --version
```

**Installation:**

**macOS:**
```bash
brew install gh
```

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install gh
```

**Windows:**
```bash
winget install --id GitHub.cli

# Or via Chocolatey
choco install gh
```

**Verify installation:**
```bash
gh --version
# Should output: gh version 2.x.x
```

**Authenticate with GitHub:**
```bash
gh auth login
```

Follow the prompts:
1. Choose: **GitHub.com** (not Enterprise)
2. Choose: **HTTPS** protocol
3. Choose: **Login with a web browser** (recommended)
4. Follow browser authentication flow

**Verify authentication:**
```bash
gh auth status
# Should show: ✓ Logged in to github.com as YOUR_USERNAME
```

**Required OAuth Scopes:**
- `repo` - Access repositories and push code
- `workflow` - Update GitHub Actions workflows

If missing scopes, refresh authentication:
```bash
gh auth refresh -s repo -s workflow
```

---

## Required Accounts & Access

### 1. GitHub Repository

You need **admin or write access** to a GitHub repository where you want to install the workflow.

**Verify repository access:**
```bash
cd /path/to/your/project
gh repo view
```

Should display:
```
name: your-repo
owner: your-username
...
```

**Create new repository (if needed):**
```bash
gh repo create my-project --private --source=. --remote=origin
```

**Check your permission level:**
```bash
gh api repos/OWNER/REPO --jq .permissions
```

You need:
- `push: true` - To push workflow files
- `admin: true` - To configure secrets (preferred)

---

### 2. Linear Workspace Access

You need access to a Linear workspace with API key creation permissions.

**Check access:**
1. Visit [linear.app](https://linear.app)
2. Ensure you can access your workspace
3. Navigate to **Settings → API** (you should see this option)

**Required permissions:**
- Ability to create API keys
- Access to at least one team in the workspace
- Ability to view and edit issues in that team

**Note:** Free Linear accounts have full API access.

---

### 3. Claude Code CLI (Optional but Recommended)

The workflow is designed to work seamlessly with Claude Code.

**Check if installed:**
```bash
claude --version
```

**Installation:**
Follow instructions at [claude.ai/code](https://claude.ai/code)

**Note:** The setup wizard works with or without Claude Code CLI, but integration is smoother with it installed.

---

### 4. Claude Code Tool Approval (Optional for Power Users)

**Note:** You don't need to configure this to run the setup wizard! The wizard asks for bulk approval at the start - just say "yes" and you're good to go.

<details>
<summary><b>For power users: Persistent auto-approval configuration</b></summary>

If you plan to run the wizard multiple times or want persistent auto-approval for development commands, you can configure Claude Code settings.

**Add these to your Claude Code tool approval settings:**

```json
{
  "toolApproval": {
    "patterns": [
      "Bash(cd *)",
      "Bash(pwd)",
      "Bash(git *)",
      "Bash(cat *)",
      "Bash(test *)",
      "Bash(gh *)",
      "Bash(node --version)",
      "Bash(node -e:*)"
    ]
  }
}
```

This is useful for development workflows beyond just the setup wizard.

</details>

---

## Repository Requirements

### 1. Git Repository Initialized

Your project must be a git repository:

```bash
# Check if git repo
git rev-parse --git-dir
# Should output: .git

# Initialize if needed
git init
```

---

### 2. GitHub Remote Configured

Your repository must be connected to GitHub:

```bash
# Check remote
git remote -v
# Should show: origin  https://github.com/OWNER/REPO.git

# Add remote if needed
git remote add origin https://github.com/OWNER/REPO.git
```

---

### 3. GitHub Actions Enabled

GitHub Actions must be enabled for your repository:

**Check status:**
```bash
gh workflow list
```

**If Actions is disabled:**
1. Go to repository **Settings → Actions → General**
2. Under **Actions permissions**, select:
   - "Allow all actions and reusable workflows" (recommended)
   - Or "Allow OWNER, and select non-OWNER, actions and reusable workflows"
3. Save changes

---

### 4. No Conflicting Workflows

Ensure you don't have existing workflows that might conflict:

```bash
# List existing workflows
gh workflow list

# Check .github/workflows directory
ls -la .github/workflows/
```

If you have existing Linear integration workflows, consider:
- Removing them before installing this workflow
- Or customizing the workflow name during setup

---

## Optional But Recommended

### 1. Clean Working Directory

Before running setup, commit or stash any uncommitted changes:

```bash
# Check status
git status

# Commit changes
git add .
git commit -m "Save work before Linear setup"

# Or stash changes
git stash
```

---

### 2. Branch Protection (Optional)

If your `main` branch has branch protection rules:

**Check protection:**
```bash
node scripts/github-setup.js check-branch main
```

**Note:** Branch protection is fine, but ensure:
- GitHub Actions can push to protected branches
- Or workflow runs are not blocked by protection rules

**Adjust settings if needed:**
1. Go to repository **Settings → Branches**
2. Edit branch protection rule for `main`
3. Under "Rules applied to everyone including administrators":
   - ✓ Allow force pushes from GitHub Actions
   - Or configure specific bypass permissions

---

### 3. MCP Server Configuration (For Claude Desktop)

If using Claude Desktop (not CLI), you'll need MCP server configuration.

**See:** [docs/mcp-setup.md](./mcp-setup.md) for details

---

## Pre-Flight Check Script

Before running the setup wizard, you can verify all prerequisites:

```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/claude-linear-gh-starter.git
cd claude-linear-gh-starter

# Run verification
node scripts/github-setup.js verify
```

Expected output:
```
GitHub Access Verification

✓ GitHub CLI installed: gh CLI is installed
✓ GitHub authentication: Authenticated as YOUR_USERNAME
✓ Required OAuth scopes: Has repo and workflow scopes
✓ Repository connection: Connected to OWNER/REPO
✓ Repository permissions: Permission level: admin
✓ GitHub Actions: GitHub Actions enabled (X workflows)

✓ Overall status: PASS
```

If any checks fail, follow the guidance in this document to resolve them.

---

## Quick Verification Checklist

Before running setup, verify:

- [ ] Git installed and `git --version` works
- [ ] Node.js 16+ installed and `node --version` works
- [ ] GitHub CLI installed and `gh --version` works
- [ ] Authenticated with GitHub: `gh auth status` shows logged in
- [ ] Have `repo` and `workflow` OAuth scopes
- [ ] In a git repository: `git status` works
- [ ] Connected to GitHub: `gh repo view` shows your repo
- [ ] Have admin or write access to repository
- [ ] GitHub Actions is enabled: `gh workflow list` works
- [ ] Have Linear workspace access
- [ ] Can create Linear API keys: visit linear.app/settings/api
- [ ] Working directory is clean: `git status` shows no uncommitted changes

---

## Troubleshooting

### "gh: command not found"

**Solution:** Install GitHub CLI following instructions above

---

### "You are not logged into any GitHub hosts"

**Solution:**
```bash
gh auth login
```

Follow the prompts to authenticate.

---

### "Missing required OAuth scopes"

**Solution:**
```bash
gh auth refresh -s repo -s workflow
```

Re-authenticate with additional scopes.

---

### "could not resolve ref HEAD"

Your repository has no commits yet.

**Solution:**
```bash
git add .
git commit -m "Initial commit"
```

---

### "Permission denied (publickey)"

SSH key not configured or incorrect permissions.

**Solution:** Use HTTPS authentication:
```bash
gh auth login
# Choose HTTPS when prompted
```

Or configure SSH keys:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
gh ssh-key add ~/.ssh/id_ed25519.pub
```

---

### "Actions is not enabled for this repository"

**Solution:**
1. Go to repository Settings → Actions → General
2. Enable Actions
3. Save changes

---

## Getting Help

If you encounter issues with prerequisites:

1. **Check documentation:**
   - [GitHub CLI docs](https://cli.github.com/manual/)
   - [Git documentation](https://git-scm.com/doc)
   - [Node.js documentation](https://nodejs.org/en/docs/)

2. **Run diagnostics:**
   ```bash
   node scripts/github-setup.js verify
   ```

3. **Check our troubleshooting guide:**
   [docs/troubleshooting.md](./troubleshooting.md)

4. **Open an issue:**
   [github.com/YOUR_USERNAME/claude-linear-gh-starter/issues](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)

---

## Next Steps

Once all prerequisites are met, proceed to:

1. [Linear Setup Guide](./linear-setup.md) - Create Linear API key
2. [GitHub Setup Guide](./github-setup.md) - Configure GitHub repository
3. **Run the setup wizard** - Execute the interactive installation

---

**Ready to continue?** → [Linear Setup Guide](./linear-setup.md)
