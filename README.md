<div align="center">

<br/>

# ⚡ Linear × Claude × GitHub

<br/>

# 🔗 Linear + GitHub + Claude Workflow

**Automated issue tracking that actually works** ✨

[![Version](https://img.shields.io/badge/version-1.0.0-5E6AD2?style=for-the-badge&logo=git&logoColor=white)](https://github.com/YOUR_USERNAME/claude-linear-gh-starter)
[![License](https://img.shields.io/badge/license-MIT-00D084?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Node](https://img.shields.io/badge/node-≥16-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![GitHub](https://img.shields.io/badge/GitHub-Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

<br/>

**Production-ready workflow automation that connects Linear issue tracking with GitHub Actions and Claude AI for seamless development operations.**

[🚀 Quick Start](#-quick-start) • [✨ Features](#-key-features) • [📖 Documentation](docs/) • [💬 Support](#-support)

<br/>

</div>

---

## 🎯 What Is This?

A **5-minute setup wizard** that automates your entire Linear workflow. Push commits and merge PRs—Linear issues update themselves. No manual work, no context switching, just smooth sailing.

**Two-pronged integration:**
- 🤖 **GitHub Actions**: Automates status updates based on git activity
- 🧠 **Claude AI**: Interactive issue management via Model Context Protocol (MCP)

<br/>

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔄 Automated Workflow
- ✅ **Auto Status Updates** — Issues flow through your workflow as code moves
- 👥 **Smart Assignment** — Auto-assign reviewers, QA leads, and stakeholders
- 🌿 **Branch Detection** — Monitors git activity and syncs with Linear

</td>
<td width="50%">

### ⚡ Developer Experience
- ⏱️ **5-Minute Setup** — Interactive wizard handles everything
- 🛡️ **Pre-Flight Validation** — Catches 95% of issues before install
- 🔒 **Safe Installation** — All changes on review branch first

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Security & Compliance
- 🔑 **Secrets Management** — API keys in GitHub Secrets, never in code
- 🛡️ **Branch Protection** — Works with protected branches
- 📋 **Audit Trail** — Complete history in Linear

</td>
<td width="50%">

### 👥 Team Collaboration
- 🤖 **AI Task Analysis** — Claude analyzes and summarizes issues
- 🎨 **Flexible Config** — Startup, small team, or enterprise workflows
- 📚 **Auto-Generated Docs** — Complete workflow docs for your team

</td>
</tr>
</table>

<br/>

---

## 💡 Use Cases

<div align="center">

| Team Type | Branch Strategy | Status Stages | Setup Time |
|-----------|----------------|---------------|------------|
| **🚀 Startup** (1-3 devs) | `main` only | 2 statuses | ~2 min |
| **👥 Small Team** (3-10 devs) | `main` + `staging` | 4 statuses | ~4 min |
| **🏢 Enterprise** (10+ devs) | `main` + `staging` + `prod` | 4+ statuses | ~6 min |

</div>

<br/>

---

## 📋 Prerequisites

Before diving in, make sure you have:

<table>
<tr>
<th>Requirement</th>
<th>Version</th>
<th>Purpose</th>
</tr>
<tr>
<td>🔧 Git</td>
<td>Latest</td>
<td>Repository management</td>
</tr>
<tr>
<td>🐙 GitHub CLI</td>
<td>Latest</td>
<td>GitHub API access</td>
</tr>
<tr>
<td>📦 Node.js</td>
<td>16+</td>
<td>MCP server runtime</td>
</tr>
<tr>
<td>📊 Linear Account</td>
<td>N/A</td>
<td>Issue tracking</td>
</tr>
<tr>
<td>🏠 GitHub Repository</td>
<td>N/A</td>
<td>Code hosting</td>
</tr>
</table>

**Quick Install:**
```bash
# macOS
brew install gh node

# Linux (Debian/Ubuntu)
sudo apt install gh nodejs

# Windows
choco install gh nodejs

# Authenticate with GitHub
gh auth login
```

<br/>

---

## 🚀 Quick Start

### Step 1️⃣: Validate Environment

Run pre-flight checks to ensure everything's ready:

```bash
./scripts/preflight-checks.sh
```

This validates:
- ✅ Git repository initialization
- ✅ GitHub CLI installation and authentication
- ✅ Required `workflow` scope for GitHub CLI
- ✅ Repository access permissions
- ✅ Node.js installation

**⚠️ Common Issue:** Missing `workflow` scope

If you see this warning:
```bash
gh auth refresh --scopes workflow
```

<br/>

### Step 2️⃣: Run Setup Wizard

From your project directory in Claude Code:

```bash
# Option 1: Slash command
/setup-linear

# Option 2: Natural language
"Setup Linear workflow"
```

The wizard guides you through:

1. 📍 **Project Location** - Where to install the workflow
2. 🌿 **Branch Strategy** - Choose preset profiles or customize
3. 🔗 **Linear Connection** - Connect to workspace and team
4. 📊 **Status Mapping** - Map git events to Linear statuses
5. 📝 **Format Configuration** - Define commit/PR patterns
6. 👥 **Auto-Assignment** - Configure team assignments
7. 📈 **Detail Level** - Set update verbosity

<br/>

### Step 3️⃣: Test & Merge

Installation creates a `setup/linear-workflow` branch. Test first, then merge:

```bash
# Test the workflow
"Let's get to work on DEV-123"

# Review changes
git diff main setup/linear-workflow

# Option 1: Direct merge
git checkout main && git merge setup/linear-workflow && git push

# Option 2: Pull request (recommended)
gh pr create --base main --head setup/linear-workflow
```

<br/>

### Step 4️⃣: Start Using

Once merged, the workflow activates automatically:

```bash
# Work on an issue
git checkout -b feature/DEV-123-new-feature
git commit -m "feat: implement feature (DEV-123)"
git push
# ✅ Status automatically updates to "In Progress"

# Create and merge PR
gh pr create --title "DEV-123: Implement new feature"
gh pr merge --merge
# ✅ Status automatically updates to "Review Required"
```

<br/>

---

## 🔄 How It Works

<div align="center">

```
┌─────────────────────────────────────────────────────────────┐
│  🌿 Stage 1: Feature Branch                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Developer pushes to feature/DEV-123-feature                │
│  → GitHub Actions detects issue ID                          │
│  → Calls Linear API                                         │
│  → ✅ Updates status to "In Progress"                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🔄 Stage 2: Pull Request                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PR merged to main branch                                   │
│  → GitHub Actions detects merge                             │
│  → ✅ Updates status to "Code Review"                       │
│  → 👤 Auto-assigns reviewer (if configured)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🧪 Stage 3: Staging Deployment                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Merged to staging branch                                   │
│  → ✅ Updates status to "QA Testing"                        │
│  → 👥 Auto-assigns QA lead (if configured)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🚀 Stage 4: Production Release                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Merged to production branch                                │
│  → ✅ Updates status to "Done"                              │
│  → 🎉 Workflow complete                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

</div>

<br/>

---

## ⚙️ Configuration

### 📊 Workflow Profiles

Choose from pre-configured profiles during setup:

<table>
<tr>
<td width="33%">

**🚀 Startup Profile**
- Branches: `main` only
- Statuses: In Progress → Done
- Best for: Solo devs, rapid prototyping
- Setup time: ~2 minutes

</td>
<td width="33%">

**👥 Small Team Profile**
- Branches: `main` + `staging`
- Statuses: In Progress → Code Review → QA → Done
- Best for: Teams of 3-10 developers
- Setup time: ~4 minutes

</td>
<td width="33%">

**🏢 Enterprise Profile**
- Branches: `main` + `staging` + `prod`
- Statuses: Full workflow with gates
- Best for: Large teams, regulated industries
- Setup time: ~6 minutes

</td>
</tr>
</table>

<br/>

### 👥 Auto-Assignment

Configure automatic assignment when status changes:

```json
{
  "autoAssignment": {
    "enabled": true,
    "preserveOriginal": true,
    "assignments": {
      "reviewRequired": {
        "userId": "reviewer-user-id",
        "userName": "Alex Acton"
      }
    }
  }
}
```

**Benefits:**
- ✅ Reviewers notified automatically when PR ready
- ✅ QA team alerted when code reaches staging
- ✅ Clear ownership at each stage
- ✅ Original assignee retained for visibility

<br/>

---

## ✅ Validation & Testing

The setup includes comprehensive validation:

### 🛡️ Pre-Flight Checks
- Environment validation before installation
- GitHub authentication scope verification
- Repository access confirmation
- Branch protection rule analysis

### 🧪 Installation Testing
- Commit message hook validation (7 automated tests)
- Linear API connectivity check
- GitHub Actions workflow syntax validation
- Repository permission verification
- Configuration file validation

### 🎯 Pattern Validation
- Issue ID patterns tested against actual Linear issues
- Auto-detection of team-specific formats
- Mismatch warnings with auto-fix suggestions

<br/>

---

## 📚 Documentation

Complete guides available in `/docs`:

<div align="center">

| 📖 Guide | Description |
|-------|-------------|
| [Prerequisites](docs/prerequisites.md) | System requirements and installation |
| [Linear Setup](docs/linear-setup.md) | Workspace configuration and API access |
| [GitHub Setup](docs/github-setup.md) | Repository secrets and permissions |
| [MCP Setup](docs/mcp-setup.md) | Claude AI integration via MCP |
| [Auto-Assignment](docs/auto-assignment.md) | Team member assignment configuration |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and solutions |

</div>

<br/>

---

## 🔧 Troubleshooting

<details>
<summary><b>❌ Linear API Not Connecting</b></summary>

**Symptoms:** Status updates not appearing in Linear

**Solutions:**
```bash
# Verify API key exists
gh secret list | grep LINEAR_API_KEY

# Test connection
node scripts/validate-secrets.js

# Check workflow logs
gh run list --workflow=linear-status-update.yml
```
</details>

<details>
<summary><b>❌ GitHub Actions Not Running</b></summary>

**Symptoms:** Workflow doesn't trigger on push/merge

**Solutions:**
```bash
# Verify workflow file exists
ls .github/workflows/linear-status-update.yml

# Check recent runs
gh run list

# Validate workflow syntax
gh workflow list
```
</details>

<details>
<summary><b>❌ Commit Hook Rejecting Messages</b></summary>

**Symptoms:** Git commits fail with validation error

**Solutions:**
```bash
# Test hook installation
node scripts/test-git-hook.js

# Verify issue pattern
cat .linear-workflow.json | grep issuePattern

# Check hook permissions
ls -la .git/hooks/commit-msg
```
</details>

[→ **Full Troubleshooting Guide**](docs/troubleshooting.md)

<br/>

---

## 🔐 Security Considerations

### 🔑 API Key Storage
- **GitHub Secrets**: `LINEAR_API_KEY` stored encrypted in repository
- **Local .env**: Automatically added to `.gitignore`
- **Never Committed**: Pre-commit hooks prevent accidental commits

### 🛡️ Branch Protection
- Compatible with protected branches
- Works with required status checks
- Supports approval workflows
- Setup validates protection rules

### 📋 Audit Trail
- All automated updates logged in Linear
- GitHub Actions logs retained
- Commit messages reference issues
- Full traceability maintained

<br/>

---

## 🏢 Enterprise Features

<table>
<tr>
<td width="33%">

### 📋 Compliance
- Automated audit logs
- Deployment gates at each stage
- Required approval workflows
- Multi-environment support

</td>
<td width="33%">

### 👥 Team Management
- Role-based auto-assignment
- Configurable notification rules
- Team-specific workflows
- Centralized configuration

</td>
<td width="33%">

### 🔗 Integration
- Works with existing CI/CD pipelines
- Compatible with deployment tools
- Supports custom status mappings
- Flexible webhook configuration

</td>
</tr>
</table>

<br/>

---

## 💬 Support

### 🆘 Getting Help

- **📖 Documentation**: Comprehensive guides in [`/docs`](docs/)
- **🐛 Issues**: Report bugs or request features on [GitHub Issues](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)
- **💬 Discussions**: Ask questions in [GitHub Discussions](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/discussions)

### 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Coding standards
- Pull request process
- Release procedures

<br/>

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

Copyright © 2025 [MatchDay Live](https://matchdaylive.com)

<br/>

---

## 🙏 Acknowledgments

<div align="center">

**Built with:**

🤖 **[Anthropic Claude AI](https://claude.ai)** for intelligent automation
📊 **[Linear API](https://linear.app)** for issue tracking integration
🐙 **[GitHub Actions](https://github.com/features/actions)** for CI/CD infrastructure

<br/>

Originally developed for internal use at [MatchDay Live](https://matchdaylive.com),
now open-sourced for the community. 💙

</div>

<br/>

---

<div align="center">

**Questions?** Check the [📖 documentation](docs/) or [🐛 open an issue](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)

**Ready to get started?** Run `/setup-linear` in Claude Code ⚡

<br/>

Made with ❤️ by developers, for developers

</div>
