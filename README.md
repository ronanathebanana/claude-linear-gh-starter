# Claude Linear GitHub Starter

> Interactive setup wizard for Linear + Claude + GitHub workflow integration

## What is this?

A complete workflow automation system that connects **Linear issue tracking**, **Claude AI assistant**, and **GitHub Actions** to create a seamless development workflow. When you push commits or merge PRs, your Linear issues automatically update status and receive progress comments.

## Features

- 🤖 **Automated Status Updates** - Linear issues update automatically based on git activity
- 📝 **Smart Task Analysis** - Claude analyzes issues and posts structured summaries
- 🔄 **GitHub Actions Integration** - Custom workflow that tracks commits and PRs
- 🎯 **Customizable** - Configure team keys, branch names, status names, and more
- 📚 **Comprehensive Docs** - Complete workflow documentation generated for your team
- ⚡ **Quick Setup** - Interactive wizard completes setup in < 10 minutes

## How it works

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Push commit to feature/dev-123-feature-name              │
│    → GitHub Actions detects DEV-123                         │
│    → Linear issue status: "In Progress"                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Create PR: "DEV-123: Add new feature"                   │
│    → PR linked to Linear issue                              │
│    → No status change (stays "In Progress")                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Merge PR to main                                         │
│    → Linear issue status: "Review Required"                 │
│    → Comment added with PR link                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Merge to production                                      │
│    → Linear issue status: "Done"                            │
│    → Workflow complete!                                     │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before running the setup wizard, ensure you have:

- ✅ Git repository initialized
- ✅ GitHub CLI (`gh`) installed and authenticated
- ✅ Node.js installed (for MCP integration)
- ✅ Claude Code CLI or Claude Desktop
- ✅ Linear account with API access
- ✅ GitHub repository with admin permissions

## Quick Start

### 1. Clone this repository

```bash
# Clone the template
git clone https://github.com/YOUR_USERNAME/claude-linear-gh-starter.git
cd claude-linear-gh-starter

# Or use as a GitHub template (coming soon)
```

### 2. Navigate to your project

```bash
cd /path/to/your/project
```

### 3. Run the setup wizard with Claude

```bash
# Open Claude Code in your project
claude-code

# Then tell Claude:
"Setup Linear workflow"
```

Claude will guide you through an interactive wizard to configure:
- Linear team keys and workflow states
- GitHub branch strategy (main/staging/prod)
- Commit and PR title formats
- Status update detail level
- Documentation paths

### 4. Complete setup

The wizard will:
- ✅ Generate GitHub Actions workflow file
- ✅ Create Linear workflow documentation
- ✅ Configure MCP integration
- ✅ Install git hooks
- ✅ Set up GitHub secrets
- ✅ Create issue documentation folders

### 5. Test it out!

```bash
# Tell Claude to start work on an issue
"Start work on DEV-123"

# Claude will:
# 1. Fetch issue details from Linear
# 2. Analyze and post task summary
# 3. Create feature branch
# 4. Push initial commit
# 5. Linear status updates automatically!
```

## What gets installed?

```
your-project/
├── .github/
│   └── workflows/
│       └── linear-status-update.yml    # Auto-generated workflow
├── .git/
│   └── hooks/
│       └── commit-msg                   # Git hook for validation
├── docs/
│   ├── linear-workflow.md              # Complete workflow guide
│   └── issues/                         # Issue analysis folder
├── .mcp.json                           # MCP server config
├── .linear-workflow.json               # Your configuration
└── CLAUDE.md                           # (Updated with Linear section)
```

## Configuration Example

After setup, your `.linear-workflow.json` looks like:

```json
{
  "version": "1.0.0",
  "project": {
    "name": "my-awesome-project"
  },
  "branches": {
    "main": "main",
    "staging": "staging",
    "prod": "prod"
  },
  "linear": {
    "teamKey": "DEV",
    "statuses": {
      "inProgress": "In Progress",
      "review": "Review Required",
      "done": "Done"
    }
  },
  "formats": {
    "commit": "conventional-parens",
    "pr": "issue-prefix",
    "issuePattern": "[A-Z]+-\\d+"
  },
  "detail": "technical",
  "paths": {
    "issues": "/docs/issues/"
  }
}
```

## Documentation

- [Prerequisites](docs/prerequisites.md) - System requirements and setup
- [Linear Setup](docs/linear-setup.md) - Linear workspace configuration
- [GitHub Setup](docs/github-setup.md) - Repository secrets and permissions
- [MCP Setup](docs/mcp-setup.md) - Model Context Protocol integration
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## Examples

### Starting work on an issue

```
You: "Start work on DEV-456"

Claude:
✓ Fetched issue details from Linear
✓ Created task analysis in /docs/issues/DEV-456-feature-name/
✓ Posted summary to Linear issue
✓ Created branch: feature/dev-456-feature-name
✓ Pushed initial commit
✓ Linear status updated to "In Progress"

Ready to implement!
```

### Creating a pull request

```
You: "Create a PR for DEV-456"

Claude:
✓ Created PR: "DEV-456: Add feature name"
✓ Posted PR summary to Linear
✓ Updated issue status to "In Review"

PR URL: https://github.com/your-org/your-repo/pull/123
```

## Workflow Variants

This starter supports multiple team workflows:

### Startup (Simple)
- **Branches:** `main` only
- **Statuses:** Todo → In Progress → Done

### Small Team
- **Branches:** `main`, `staging`
- **Statuses:** Todo → In Progress → In Review → Done

### Enterprise
- **Branches:** `main`, `staging`, `prod`
- **Statuses:** Todo → In Progress → In Review → QA → Done

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © [Your Name]

## Credits

Created by the team at [MatchDay Live](https://matchdaylive.com) for our internal workflow, now open sourced for the community.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/discussions)

---

**Note:** This project is in active development. Star the repo to follow updates!
