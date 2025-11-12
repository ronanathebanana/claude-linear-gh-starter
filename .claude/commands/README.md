# Slash Commands

This directory contains Claude Code slash commands for the Linear workflow setup.

## Available Commands

### `/setup-linear`
Run the complete Linear + Claude + GitHub workflow installation wizard.

**Usage:**
```
/setup-linear
```

**What it does:**
- Validates your environment (git, GitHub CLI, Node.js)
- Fixes GitHub authentication issues automatically
- Guides you through Linear workspace configuration
- Sets up branch strategy and status mappings
- Installs GitHub Actions workflow
- Creates Linear issue templates
- Sets up git hooks and documentation
- Creates a test issue to verify everything works

**Time:** ~5 minutes

---

### `/install`
Alias for `/setup-linear` - runs the same installation wizard.

**Usage:**
```
/install
```

---

## How Slash Commands Work

Slash commands are shortcuts that expand into full prompts. When you type `/setup-linear`, Claude Code will execute the Linear workflow setup wizard automatically.

You can also trigger setup by saying:
- "Setup Linear workflow"
- "Install Linear workflow"
- "Configure Linear integration"

All methods run the same enhanced setup wizard with:
- Batch command approval
- Visual progress tracking
- Automatic template creation
- Built-in test verification
