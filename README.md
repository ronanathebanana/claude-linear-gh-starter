<div align="center">

<br/>

# ⚡ Linear × Claude × GitHub

<br/>

# 🔗 Linear + GitHub + Claude Workflow

**Issue tracking that doesn't make you want to quit** ✨

[![Version](https://img.shields.io/badge/version-1.0.0-5E6AD2?style=for-the-badge&logo=git&logoColor=white)](https://github.com/YOUR_USERNAME/claude-linear-gh-starter)
[![License](https://img.shields.io/badge/license-MIT-00D084?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Node](https://img.shields.io/badge/node-≥16-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![GitHub](https://img.shields.io/badge/GitHub-Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

<br/>

</div>

---

## 📖 Overview

Stop manually updating tickets. This workflow automation connects **Linear**, **GitHub**, and **Claude AI** to keep your issues in sync automatically. When you push code, merge PRs, or deploy to production, your Linear issues update themselves—no clicking, no context switching, no "did you update the ticket?" Slack pings.

The setup wizard walks you through a **5-minute installation** that configures everything: GitHub Actions workflows, commit message validation, auto-assignment rules, and Claude AI integration via MCP. Choose from pre-built profiles (Startup, Small Team, Enterprise) or customize every detail to match your workflow.

Once installed, your development flow becomes seamless: commit with an issue ID, push to your branch, and watch Linear update automatically. Merge to staging? Issue moves to "Code Review" and auto-assigns your reviewer. Deploy to production? Status updates to "Done". Your commit messages become your ticket updates.

**Perfect for teams who:**
- Want to ship code, not update tickets
- Need workflow automation without the complexity
- Use Linear for issue tracking and GitHub for code
- Want AI-powered task analysis and summaries

[🚀 Quick Start](#-quick-start) • [✨ Features](#-key-features) • [📖 Documentation](docs/) • [💬 Support](#-support)

<br/>

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

Three commands. Five minutes. You're done.

```bash
# 1. Clone this repo into your project
git clone https://github.com/YOUR_USERNAME/claude-linear-gh-starter.git

# 2. Start Claude Code in your project directory
cd your-project && claude

# 3. Run the setup wizard
/setup-linear
```

The wizard handles everything: environment checks, Linear connection, GitHub Actions setup, and team configuration. Test it with the generated issue, merge the branch, and you're live.

**Need help?** The wizard includes pre-flight checks and auto-fixes common issues. If something's missing (like GitHub CLI), it'll tell you exactly what to install.

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

Copyright © 2025

<br/>

---

## 🙏 Acknowledgments

<div align="center">

**Built with:**

🤖 **[Anthropic Claude AI](https://claude.ai)** for intelligent automation
📊 **[Linear API](https://linear.app)** for issue tracking integration
🐙 **[GitHub Actions](https://github.com/features/actions)** for CI/CD infrastructure

<br/>

Built for the developer community. 💙

</div>

<br/>

---

<div align="center">

**Questions?** Check the [📖 documentation](docs/) or [🐛 open an issue](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)

**Ready to get started?** Run `/setup-linear` in Claude Code ⚡

<br/>

Your tickets update themselves now. You're welcome. 🤖

</div>
