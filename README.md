<div align="center">

<br/>

# ⚡ Linear × Claude × GitHub

<br/>

# 🔗 Linear + GitHub + Claude Workflow

**Just say "Let's get to work on DEV-123" and watch the magic happen** ✨

*Issues are friends, not food.* 🐟

[![Claude](https://img.shields.io/badge/Claude-AI-CC785C?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai)
[![Linear](https://img.shields.io/badge/Linear-Integrated-5E6AD2?style=for-the-badge&logo=linear&logoColor=white)](https://linear.app)
[![GitHub](https://img.shields.io/badge/GitHub-Automated-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com)

<br/>

</div>

---

## 📖 Overview

**Just talk to Claude. Everything else happens automatically.**

Say "Let's get to work on DEV-123" and watch Claude:
1. 📡 Fetch the issue from Linear
2. 📝 Analyze requirements and create a task breakdown
3. 💬 Post the analysis back to Linear (your team sees it immediately)
4. 🌿 Create a feature branch
5. ✍️ Make an initial commit
6. 🚀 Push to GitHub and update Linear status

**Then keep coding.** As you push commits, merge PRs, and deploy to production, Linear updates automatically. No clicking, no context switching, no "did you update the ticket?" Slack pings.

This is a **2-way integration**: Claude reads from Linear (via MCP), creates task analysis locally, and posts back to Linear. Your team sees Claude's work. GitHub Actions handle status updates automatically as code moves through your workflow (optional - you can use Claude commands without GitHub Actions).

The setup wizard walks you through a **5-minute installation** that configures everything: Linear MCP integration (OAuth-based, **no API key required**!), optional GitHub Actions workflows, commit message validation, auto-assignment rules, and team configuration. Choose from pre-built profiles (Startup, Small Team, Enterprise) or customize every detail to match your workflow.

**Perfect for teams who:**
- Want to ship code, not update tickets
- Need workflow automation without the complexity
- Use Linear for issue tracking and GitHub for code
- Want AI-powered task analysis and summaries

[🚀 Quick Start](#-quick-start) • [⚡ Commands](COMMAND-CHEATSHEET.md) • [✨ Features](#-key-features) • [📖 Documentation](docs/) • [💬 Support](#-support)

<br/>

<br/>

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 💬 Conversational Workflow
- 🗣️ **Natural Commands** — Just say "Let's get to work on DEV-123"
- 📡 **2-Way Sync** — Claude reads from Linear, posts analysis back
- 🤖 **AI Task Analysis** — Detailed breakdowns posted to Linear automatically
- 🌿 **Auto Branch Creation** — Feature branches with proper naming
- ⚡ **Zero Manual Work** — No clicking, no context switching
- 🔐 **MCP-First** — OAuth-based setup, no API key creation required!

</td>
<td width="50%">

### 🔄 Automated Updates
- ✅ **Auto Status Sync** — Issues flow through workflow as code moves
- 👥 **Smart Assignment** — Auto-assign reviewers, QA leads, stakeholders
- 🌿 **Branch Detection** — Monitors git activity and syncs with Linear
- 📋 **Audit Trail** — Complete history in Linear
- ⚙️ **Flexible Setup** — Use GitHub Actions or Claude commands only

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Developer Experience
- ⏱️ **5-Minute Setup** — Interactive wizard handles everything
- 🛡️ **Pre-Flight Validation** — Catches 95% of issues before install
- 🔒 **Safe Installation** — All changes on review branch first
- 🎨 **Flexible Profiles** — Startup, small team, or enterprise workflows

</td>
<td width="50%">

### 🔐 Security & Compliance
- 🔑 **Secrets Management** — API keys in GitHub Secrets, never in code
- 🛡️ **Branch Protection** — Works with protected branches
- 📚 **Auto-Generated Docs** — Complete workflow docs for your team
- ✅ **Full Traceability** — All updates logged and traceable

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

## 🚀 Quick Start

Three commands. Five minutes. You're done.

```bash
# 1. Clone this repo
git clone https://github.com/YOUR_USERNAME/claude-linear-gh-starter.git

# 2. Start Claude Code in the cloned repo
cd claude-linear-gh-starter && claude

# 3. Run the setup wizard
/setup-linear
```

The wizard asks where to install, then handles everything: environment checks, Linear connection, GitHub Actions setup, and team configuration. Test it with the generated issue, merge the branch, and you're live.

**Need help?** The wizard includes pre-flight checks and auto-fixes common issues. If something's missing (like GitHub CLI), it'll tell you exactly what to install.

<br/>

---

## 🔄 Upgrading Existing Installation

Already using v1.0.0? Upgrade to v1.1.0 to get new features:

```bash
# Navigate to your project (where .linear-workflow.json exists)
cd your-project

# Start Claude Code
claude

# Re-run the setup wizard
/setup-linear
```

The wizard will detect your existing installation and offer to upgrade:

**What's New in v1.1.0:**
- ✨ **Commit Reference Options** — Choose Related/Closes/Fixes for commit messages
- ✨ **Linear Magic Word Warnings** — Detects conflicts with Linear automations
- ✨ **Optional GitHub Actions** — Use MCP-only workflow if preferred
- 🐛 **Workflow Syntax Fix** — Automatically fixes branches configuration bug
- 🔧 **MCP-First Setup** — No API key required during installation

**Upgrade Process:**
1. Detects your v1.0.0 installation
2. Shows changelog and what will change
3. Creates backups automatically
4. Adds new config fields with defaults
5. Fixes workflow file syntax if needed
6. Preserves all your existing settings

**Safe & Non-Breaking:** All changes are backed up, and your configuration is preserved.

<br/>

---

## ⚡ Common Commands

After setup, just talk to Claude naturally. Here are some examples:

**Start working:**
```
"Let's get to work on DEV-123"
"Continue DEV-456"
```

**When blocked:**
```
"Create a blocker for this"
"This is blocked by [reason]"
```

**Discover work:**
```
"Show me high priority issues"
"Any recent bugs?"
"What am I working on?"
```

**Finish up:**
```
"Ready for review"
"Add progress update"
```

[→ **Full Command Cheat Sheet**](COMMAND-CHEATSHEET.md) - Complete list of 20+ commands

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
<td>Issue tracking (OAuth, no API key needed)</td>
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

## 🔄 How It Works

### The Magic: Just Talk to Claude

Instead of manually creating branches, writing analysis docs, and updating Linear, just say what you want to do:

<div align="center">

```
┌─────────────────────────────────────────────────────────────┐
│  💬 You: "Let's get to work on DEV-123"                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  🤖 Claude automatically:                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 📡 Fetches issue from Linear (via MCP)                  │
│     "DEV-123: Add user authentication to dashboard"         │
│                                                             │
│  2. 📝 Analyzes requirements & creates task document        │
│     • Breaks down acceptance criteria                       │
│     • Identifies files to modify                            │
│     • Notes potential blockers                              │
│     • Saves to /docs/issues/DEV-123/                        │
│                                                             │
│  3. 💬 Posts analysis back to Linear (2-way sync!)          │
│     "Claude's Task Analysis: [summary]"                     │
│     ← Your team sees this in Linear immediately             │
│                                                             │
│  4. 🌿 Creates feature branch                               │
│     feature/DEV-123-add-user-authentication                 │
│                                                             │
│  5. ✍️  Makes initial commit with issue reference           │
│     "feat: Initialize user authentication                   │
│                                                             │
│     Related: DEV-123"                                       │
│     ← Git hook validates issue ID format                    │
│                                                             │
│  6. 🚀 Pushes to GitHub                                     │
│     ← GitHub Actions updates Linear status to "In Progress" │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

</div>

**That's it.** You're now working on the issue with:
- ✅ Full context from Linear
- ✅ Detailed task analysis document
- ✅ Feature branch created
- ✅ Initial commit made
- ✅ Linear updated and team notified
- ✅ Ready to start coding

---

### The Automation: Status Updates Throughout Development

Once Claude sets you up, GitHub Actions keeps Linear in sync automatically as your code moves through the workflow:

<div align="center">

```
🌿 Push to feature branch
   ↓
   GitHub Actions → Linear status: "In Progress"

🔀 Merge PR to main
   ↓
   GitHub Actions → Linear status: "Code Review"
   Auto-assigns reviewer (if configured)

🧪 Merge to staging
   ↓
   GitHub Actions → Linear status: "QA Testing"
   Auto-assigns QA lead (if configured)

🚀 Deploy to production
   ↓
   GitHub Actions → Linear status: "Done"
```

</div>

**Your commit messages become your ticket updates.** No clicking, no manual status changes, no context switching.

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

### 📝 Commit Reference Options

Customize how Linear issues are referenced in commits:

```json
{
  "formats": {
    "issueReference": "related",
    "issueReferenceKeyword": "Related"
  }
}
```

**Available Options:**
- **Related:** (Recommended) — `Related: DEV-123` - Flexible, no automation conflicts
- **Closes:** — `Closes: DEV-123` - May trigger Linear magic word automations
- **Fixes:** — `Fixes: DEV-123` - May trigger Linear magic word automations

**⚠️ Linear Magic Words:** If you enable Linear's built-in automation for "Closes" or "Fixes", those keywords will trigger Linear's status updates in addition to GitHub Actions. The wizard detects this and warns you about potential conflicts. Use "Related:" to avoid conflicts and let GitHub Actions control all status updates.

<br/>

### 🔧 Optional GitHub Actions

Choose whether to enable GitHub Actions automation:

```json
{
  "githubActions": {
    "enabled": false,
    "apiKeyConfigured": false
  }
}
```

**Two Modes:**
- **GitHub Actions Enabled** — Automatic status updates on push/merge (requires LINEAR_API_KEY)
- **MCP-Only Mode** — Use Claude commands for all updates (no API key needed)

**Perfect for:**
- Teams where not everyone can create Linear API keys
- Organizations with strict API key policies
- Users who prefer manual control via Claude commands

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
<summary><b>❌ GitHub Actions Workflow Syntax Error</b></summary>

**Symptoms:** Error: "you may only define one of `branches` and `branches-ignore` for a single event"

**Cause:** v1.0.0 had a syntax bug in the workflow file

**Solution:**
```bash
# Upgrade to v1.1.0 (automatically fixes the bug)
cd your-project && claude
/setup-linear  # Select "Upgrade to latest version"

# Or manually fix in .github/workflows/linear-status-update.yml:
# Replace:
#   branches:
#     - '**'
#     - '!main'
# With:
#   branches-ignore:
#     - 'main'
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

### 🔑 Authentication & Security
- **MCP OAuth** (Default): Browser-based authentication, no API keys to manage
- **GitHub Secrets** (Optional): `LINEAR_API_KEY` stored encrypted if using GitHub Actions
- **Local .env**: Automatically added to `.gitignore` if created
- **Never Committed**: Pre-commit hooks prevent accidental commits
- **No API Key Required**: Setup works via OAuth, team members don't need key creation permissions

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
