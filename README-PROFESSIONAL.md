# Linear + GitHub + Claude Workflow Automation

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/YOUR_USERNAME/claude-linear-gh-starter)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg?logo=node.js)](https://nodejs.org)

**Production-ready workflow automation that connects Linear issue tracking with GitHub Actions and Claude AI for seamless development operations.**

[Quick Start](#quick-start) • [Features](#key-features) • [Documentation](docs/) • [Support](#support)

---

## Overview

This toolkit automates Linear issue tracking throughout your development workflow. When you push commits or merge pull requests, Linear issues automatically update to reflect the current status—no manual updates required.

**Two-pronged integration:**
- **GitHub Actions**: Automates status updates based on git activity
- **Claude AI Integration**: Enables interactive issue management via Model Context Protocol (MCP)

---

## Key Features

### Automated Workflow
- **Automatic Status Updates**: Issues transition through your workflow as code moves through branches
- **Smart Assignment**: Auto-assign team members when issues change status (reviewers, QA leads, etc.)
- **Branch Detection**: Monitors git activity and updates Linear accordingly

### Developer Experience
- **5-Minute Setup**: Interactive wizard handles complete configuration
- **Pre-Flight Validation**: Catches 95% of common issues before installation
- **Safe Installation**: All changes on review branch before merging

### Security & Compliance
- **Secrets Management**: API keys stored in GitHub Secrets, never in code
- **Branch Protection Compatible**: Works with protected branches and required checks
- **Audit Trail**: Complete history of automated updates in Linear

### Team Collaboration
- **AI Task Analysis**: Claude analyzes issues and posts structured summaries
- **Flexible Configuration**: Adapts to startup, small team, or enterprise workflows
- **Auto-Generated Docs**: Creates complete workflow documentation for your team

---

## Use Cases

| Team Size | Branch Strategy | Status Stages | Setup Time |
|-----------|----------------|---------------|------------|
| **Startup (1-3 devs)** | `main` only | 2 statuses | ~2 minutes |
| **Small Team (3-10 devs)** | `main` + `staging` | 4 statuses | ~4 minutes |
| **Enterprise (10+ devs)** | `main` + `staging` + `prod` | 4+ statuses | ~6 minutes |

---

## Prerequisites

Before installation, ensure you have:

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Git | Latest | Repository management |
| GitHub CLI | Latest | GitHub API access |
| Node.js | 16+ | MCP server runtime |
| Linear Account | N/A | Issue tracking |
| GitHub Repository | N/A | Code hosting |

**Installation:**
```bash
# macOS
brew install gh node

# Linux (Debian/Ubuntu)
sudo apt install gh nodejs

# Windows
choco install gh nodejs

# Authenticate
gh auth login
```

---

## Quick Start

### Step 1: Validate Environment

Run pre-flight checks to ensure your environment is ready:

```bash
./scripts/preflight-checks.sh
```

This validates:
- Git repository initialization
- GitHub CLI installation and authentication
- Required `workflow` scope for GitHub CLI
- Repository access permissions
- Node.js installation

**Common Issue:** Missing `workflow` scope

If you see this warning, run:
```bash
gh auth refresh --scopes workflow
```

### Step 2: Run Setup Wizard

From your project directory in Claude Code:

```bash
# Option 1: Slash command
/setup-linear

# Option 2: Natural language
"Setup Linear workflow"
```

The wizard will guide you through:

1. **Project Location** - Where to install the workflow
2. **Branch Strategy** - Choose from preset profiles or customize
3. **Linear Connection** - Connect to your workspace and team
4. **Status Mapping** - Map git events to Linear status changes
5. **Format Configuration** - Define commit message and PR title patterns
6. **Auto-Assignment** - Configure automatic team member assignments
7. **Detail Level** - Set update verbosity (stakeholder vs technical)

### Step 3: Review and Merge

Installation creates a `setup/linear-workflow` branch with all changes:

```bash
# Review changes
git diff main setup/linear-workflow

# Option 1: Direct merge
git checkout main
git merge setup/linear-workflow
git push

# Option 2: Pull request (recommended)
gh pr create --base main --head setup/linear-workflow
```

### Step 4: Start Using

Once merged, the workflow activates automatically:

```bash
# Work on an issue
git checkout -b feature/DEV-123-new-feature
git commit -m "feat: implement feature (DEV-123)"
git push

# Status automatically updates to "In Progress"

# Create and merge PR
gh pr create --title "DEV-123: Implement new feature"
gh pr merge --merge

# Status automatically updates to "Review Required"
```

---

## How It Works

### Status Update Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: Feature Branch                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Developer pushes to feature/DEV-123-feature                │
│  → GitHub Actions detects issue ID                          │
│  → Calls Linear API                                         │
│  → Updates status to "In Progress"                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Stage 2: Pull Request                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PR merged to main branch                                   │
│  → GitHub Actions detects merge                             │
│  → Updates status to "Code Review"                          │
│  → Auto-assigns reviewer (if configured)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Stage 3: Staging Deployment                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Merged to staging branch                                   │
│  → Updates status to "QA Testing"                           │
│  → Auto-assigns QA lead (if configured)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Stage 4: Production Release                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Merged to production branch                                │
│  → Updates status to "Done"                                 │
│  → Workflow complete                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Architecture

The system installs these components:

```
project/
├── .github/workflows/
│   └── linear-status-update.yml    # GitHub Actions automation
├── .git/hooks/
│   └── commit-msg                   # Validates issue references
├── docs/
│   ├── linear-workflow.md          # Team documentation
│   └── issues/                     # AI-generated analysis
├── .mcp.json                       # Claude MCP configuration
├── .env                            # API credentials (gitignored)
└── .linear-workflow.json           # Workflow configuration
```

---

## Configuration

### Workflow Profiles

Choose from pre-configured profiles during setup:

**Startup Profile**
- Branches: `main` only
- Statuses: In Progress → Done
- Best for: Solo developers, rapid prototyping
- Setup time: ~2 minutes

**Small Team Profile**
- Branches: `main` + `staging`
- Statuses: In Progress → Code Review → QA Testing → Done
- Best for: Teams of 3-10 developers
- Setup time: ~4 minutes

**Enterprise Profile**
- Branches: `main` + `staging` + `production`
- Statuses: Full workflow with deployment gates
- Best for: Large teams, regulated industries
- Setup time: ~6 minutes

**Custom Profile**
- Full control over all settings
- Best for: Unique requirements
- Setup time: ~10 minutes

### Auto-Assignment

Configure automatic assignment when status changes:

```json
{
  "assignees": {
    "enabled": true,
    "onReview": "reviewer-user-id",
    "onStaging": "qa-lead-user-id",
    "preserveOriginal": true
  }
}
```

**Benefits:**
- Reviewers notified automatically when PR ready
- QA team alerted when code reaches staging
- Clear ownership at each stage
- Original assignee retained for visibility

---

## Validation & Testing

The setup includes comprehensive validation:

### Pre-Flight Checks
- Environment validation before installation
- GitHub authentication scope verification
- Repository access confirmation
- Branch protection rule analysis

### Installation Testing
- Commit message hook validation (7 automated tests)
- Linear API connectivity check
- GitHub Actions workflow syntax validation
- Repository permission verification
- Configuration file validation

### Pattern Validation
- Issue ID patterns tested against actual Linear issues
- Auto-detection of team-specific formats
- Mismatch warnings with auto-fix suggestions

---

## Documentation

Complete guides available in `/docs`:

| Guide | Description |
|-------|-------------|
| [Prerequisites](docs/prerequisites.md) | System requirements and installation |
| [Linear Setup](docs/linear-setup.md) | Workspace configuration and API access |
| [GitHub Setup](docs/github-setup.md) | Repository secrets and permissions |
| [MCP Setup](docs/mcp-setup.md) | Claude AI integration via MCP |
| [Auto-Assignment](docs/auto-assignment.md) | Team member assignment configuration |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and solutions |

---

## Troubleshooting

### Issue: Linear API Not Connecting

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

### Issue: GitHub Actions Not Running

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

### Issue: Commit Hook Rejecting Messages

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

[→ Full Troubleshooting Guide](docs/troubleshooting.md)

---

## Version Management

### Checking for Updates

```bash
node scripts/version-manager.js check
```

### Upgrading

```bash
node scripts/version-manager.js upgrade --to 1.1.0
```

All upgrades include:
- Automatic configuration backup
- Safe migration scripts
- Rollback capability
- Changelog display

---

## Security Considerations

### API Key Storage
- **GitHub Secrets**: LINEAR_API_KEY stored encrypted in repository
- **Local .env**: Automatically added to .gitignore
- **Never Committed**: Pre-commit hooks prevent accidental commits

### Branch Protection
- Compatible with protected branches
- Works with required status checks
- Supports approval workflows
- Setup validates protection rules

### Audit Trail
- All automated updates logged in Linear
- GitHub Actions logs retained
- Commit messages reference issues
- Full traceability maintained

---

## Enterprise Features

### Compliance
- Automated audit logs
- Deployment gates at each stage
- Required approval workflows
- Multi-environment support

### Team Management
- Role-based auto-assignment
- Configurable notification rules
- Team-specific workflows
- Centralized configuration

### Integration
- Works with existing CI/CD pipelines
- Compatible with deployment tools
- Supports custom status mappings
- Flexible webhook configuration

---

## Support

### Getting Help

- **Documentation**: Comprehensive guides in `/docs`
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/discussions)

### Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Coding standards
- Pull request process
- Release procedures

---

## License

MIT License - see [LICENSE](LICENSE) for details

Copyright (c) 2025 MatchDay Live

---

## Acknowledgments

Built with:
- **Anthropic Claude AI** for intelligent automation
- **Linear API** for issue tracking integration
- **GitHub Actions** for CI/CD infrastructure

Originally developed for internal use at [MatchDay Live](https://matchdaylive.com), now open-sourced for the community.

---

**Questions?** Check the [documentation](docs/) or [open an issue](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues).

**Ready to get started?** Run `/setup-linear` in Claude Code.
