# Upgrade Guide

This starter kit is designed to work as both a **setup tool** and an **upgrade tool**.

## Quick Start

### For New Projects
```bash
# In your project directory, ask Claude:
"Setup Linear workflow"
```

### For Existing Installations
```bash
# Check for updates
node scripts/version-manager.js check

# Upgrade with automatic branch creation (recommended)
node scripts/version-manager.js upgrade --create-branch
```

## Upgrade Strategy

We use **Option 1: Upgrade Branch Pattern** for maximum safety:

```
upgrade/linear-workflow-v1.1.0  ← Upgrade branch (review here)
    ↓
  main  ← Merge when ready
```

### Why This Approach?

1. **Consistency** - Same pattern as initial installation
2. **Safety** - Team reviews before activation
3. **Documentation** - PR becomes permanent record
4. **Testing** - Test upgrade branch before merging
5. **Rollback** - Easy to abandon if issues

## Version Detection

The wizard automatically detects existing installations:

```
Phase 1.5: Check for Existing Installation & Version
  ↓
┌─────────────────────────────────────┐
│ No workflow found                   │ → Fresh installation (12 steps)
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Workflow found (v1.0.0)             │ → Present options:
│ Latest: v1.1.0                      │    1. Update config only
│ Update available!                   │    2. Upgrade (recommended)
└─────────────────────────────────────┘    3. Reinstall
                                           4. Cancel
```

## Upgrade Flow with --create-branch

```bash
node scripts/version-manager.js upgrade --create-branch
```

**What happens:**

1. ✓ Checks installed version vs latest
2. ✓ Shows migration plan with changelog
3. ✓ Creates `upgrade/linear-workflow-v1.1.0` branch
4. ✓ Runs all migrations (backing up first)
5. ✓ Updates configuration files
6. ✓ Fixes any known issues (e.g., workflow syntax)
7. ✓ Commits with detailed changelog
8. ✓ Pushes to remote
9. ✓ Provides PR creation command

**Example output:**

```
═══════════════════════════════════════════════════════════════
✅ Upgrade Complete!
═══════════════════════════════════════════════════════════════

Upgraded from 1.0.0 to 1.1.0

Branch Details:
  Branch: upgrade/linear-workflow-v1.1.0
  Remote: origin/upgrade/linear-workflow-v1.1.0

Next steps:
  1. Review changes: git diff main
  2. Test workflow: node scripts/test-integration.js
  3. Create PR:

     gh pr create --base main --head upgrade/linear-workflow-v1.1.0 \
       --title "chore: Upgrade Linear workflow to v1.1.0" \
       --body "..."

  4. Merge when ready!
```

## Migration System

### Version Registry

Current: **1.1.0**

Available migrations:
- **1.0.0 → 1.1.0** - Commit reference options + bug fixes
- **1.1.0 → 1.2.0** - Configuration profiles + editor (planned)

### Migration Features

- ✓ Automatic backup before changes
- ✓ Rollback on failure
- ✓ Breaking change detection
- ✓ Detailed changelog
- ✓ Smart file updates (preserves custom config)

### Example Migration

```javascript
{
  fromVersion: '1.0.0',
  toVersion: '1.1.0',
  description: 'Add commit reference options and fix workflow bugs',
  breaking: false,
  changes: [
    '✨ New: Commit message reference options (Related/Closes/Fixes)',
    '✨ New: Linear magic word automation detection',
    '🐛 Fix: GitHub Actions workflow branches syntax error',
    // ... more changes
  ],
  async migrate(config, projectPath) {
    // Migration logic here
    // Returns updated config
  }
}
```

## Upgrade Safety

### Backups Created

Before any upgrade:
- `.linear-workflow.json.backup` - Configuration backup
- Git branch isolation - Original files untouched on main

### Rollback Options

**If upgrade fails:**
```bash
# Automatic rollback happens
# Original config restored from backup
# Error message shows how to clean up

# Delete failed upgrade branch
git checkout main
git branch -D upgrade/linear-workflow-v1.1.0
```

**If upgrade succeeds but you want to revert:**
```bash
# Just don't merge the PR
# Delete the upgrade branch
git branch -D upgrade/linear-workflow-v1.1.0
git push origin --delete upgrade/linear-workflow-v1.1.0
```

## Using as an Upgrade Tool

The starter kit is **interchangeable** between setup and upgrade:

```bash
# Clone this repo wherever you want
git clone https://github.com/your-org/claude-linear-gh-starter.git
cd claude-linear-gh-starter

# Navigate to ANY project with existing workflow
cd ../your-existing-project

# Run upgrade from the starter kit
node ../claude-linear-gh-starter/scripts/version-manager.js check
node ../claude-linear-gh-starter/scripts/version-manager.js upgrade --create-branch

# Or ask Claude in your project:
"Setup Linear workflow"  # Will detect existing and offer upgrade
```

## Testing Before Merge

Always test the upgrade branch before merging:

```bash
# On upgrade branch
node scripts/test-integration.js

# Test a real workflow command
# "Let's get to work on TEST-123"

# Review all changed files
git diff main

# Check configuration
cat .linear-workflow.json
```

## Idempotent Design

The starter kit can be run multiple times safely:

- ✓ Detects existing installations
- ✓ Offers appropriate options (upgrade vs reinstall)
- ✓ Preserves custom configuration
- ✓ Only updates necessary fields
- ✓ Backs up before changes

## Best Practices

1. **Always use --create-branch for upgrades**
   - Provides safe review process
   - Creates PR for team visibility
   - Easy rollback if needed

2. **Review changes before merging**
   - Check `.linear-workflow.json` diff
   - Review any workflow file changes
   - Test with a real issue

3. **Keep starter kit updated**
   - Pull latest version before upgrading projects
   - Check for new migrations

4. **Document custom changes**
   - Note any manual config tweaks
   - May need to reapply after upgrade

## Common Scenarios

### Scenario 1: Fresh Install
```
User: "Setup Linear workflow"
Claude: [Runs 12-step setup wizard]
Result: setup/linear-workflow branch → PR → merge
```

### Scenario 2: Upgrade Existing
```
User: "Setup Linear workflow"
Claude: [Detects v1.0.0, latest is v1.1.0]
        [Offers upgrade option]
User: [Selects upgrade]
Claude: [Runs upgrade with --create-branch]
Result: upgrade/linear-workflow-v1.1.0 → PR → merge
```

### Scenario 3: Reconfigure Only
```
User: "Setup Linear workflow"
Claude: [Detects existing installation]
        [Offers update config only]
User: [Selects update config]
Claude: [Runs interactive config editor]
Result: Changes committed directly (no branch needed)
```

### Scenario 4: Broken Workflow
```
User: "Setup Linear workflow"
Claude: [Detects existing but broken]
        [Offers reinstall option]
User: [Selects reinstall]
Claude: [Backs up existing, runs fresh install]
Result: setup/linear-workflow branch → PR → merge
```

## Ready to Use!

✅ Version detection working
✅ Upgrade branch automation working
✅ Migration system working
✅ Backup/rollback working
✅ Idempotent design working
✅ Documentation complete

**You can now run this on existing projects safely!**
