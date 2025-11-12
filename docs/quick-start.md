# Quick Start Guide

Get your Linear + Claude + GitHub workflow up and running in 5 minutes.

## Prerequisites

Before starting, ensure you have:
- [ ] Git repository initialized
- [ ] GitHub CLI installed (`gh`)
- [ ] GitHub CLI authenticated with `workflow` scope
- [ ] Linear account and workspace access
- [ ] Node.js v16+ (optional but recommended)

**Quick Check:**
```bash
git --version
gh --version
gh auth status
node --version
```

## Installation

### Method 1: Slash Command (Recommended)

The fastest way to get started:

```bash
# Navigate to your project
cd /path/to/your/project

# Launch Claude Code
claude-code

# Run setup command
/setup-linear
```

That's it! The wizard will guide you through everything.

### Method 2: Natural Language

```bash
# In Claude Code, just say:
"Setup Linear workflow"
```

or

```bash
"Install Linear workflow"
```

### Method 3: Alias Command

```bash
/install
```

All methods run the same comprehensive setup wizard.

## What Happens During Setup

The wizard will:

1. **[30 sec]** Run pre-flight checks
   - Validates git, GitHub CLI, Node.js
   - Checks GitHub authentication
   - Verifies workflow scope (auto-fixes if missing)

2. **[2 min]** Configuration questions
   - Project location confirmation
   - Linear API key setup
   - Team selection
   - Branch strategy (main, staging, prod)
   - Status mapping configuration
   - Commit/PR format preferences
   - Documentation location

3. **[1 min]** Installation
   - Creates `.linear-workflow.json`
   - Generates GitHub Actions workflow
   - Installs git commit hooks
   - Creates documentation
   - Sets up GitHub secrets

4. **[1 min]** Template & Test Setup
   - Creates 3 Linear issue templates
   - Creates test issue
   - Verifies workflow works

5. **[30 sec]** Final verification
   - Tests the integration
   - Confirms everything is working

## Post-Installation

After setup completes, you'll see:

```
Installation Complete

Your Linear workflow is now active!

I've created a test issue to verify everything works:
  DEV-XXX: Test Linear + Claude + GitHub Integration

Let's test it out! Would you like to start work on DEV-XXX?

Say: "Let's get to work on DEV-XXX"
```

Type the suggested command to test your setup!

## Troubleshooting

### Missing workflow scope

If you see:
```
Missing 'workflow' scope
```

The wizard will automatically offer to fix this. Just say "yes" and follow the browser authentication flow.

### Linear API key

Get your API key from: https://linear.app/settings/api

The wizard will guide you through adding it.

### GitHub secrets

The wizard automatically configures the `LINEAR_API_KEY` secret in your repository.

## Next Steps

Once setup is complete:

1. **Test the workflow:**
   ```
   "Let's get to work on DEV-XXX"
   ```

2. **Commit the configuration:**
   ```bash
   git add .github/ .linear-workflow.json .gitignore docs/
   git commit -m "chore: Add Linear workflow integration"
   git push
   ```

3. **Share with your team:**
   - Share `docs/linear-workflow.md` with your team
   - Show them how to use the Linear templates
   - Explain the commit message format

## Commands Reference

After installation, you can use:

- `"Start work on DEV-123"` - Begin working on an issue
- `"Continue DEV-123"` - Resume work on an issue
- `"Create PR for DEV-123"` - Create a pull request

## Getting Help

- See [Full Documentation](../README.md)
- Check [Troubleshooting Guide](./troubleshooting.md)
- Review [Prerequisites](./prerequisites.md)
- Read [Linear Setup Details](./linear-setup.md)
- Check [GitHub Setup Details](./github-setup.md)

## Support

If you encounter issues:

1. Run pre-flight checks:
   ```bash
   ./scripts/preflight-checks.sh
   ```

2. Check the troubleshooting guide
3. Review GitHub Actions logs
4. Open an issue on GitHub

---

**Total Setup Time:** ~5 minutes
**Difficulty:** Easy (fully guided)
**Result:** Complete Linear + GitHub + Claude integration
