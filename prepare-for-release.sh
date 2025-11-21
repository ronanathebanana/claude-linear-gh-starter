#!/bin/bash

# Prepare claude-linear-gh-starter for public release
# This script reorganizes files and removes internal documentation

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Preparing claude-linear-gh-starter for public release"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup warning
echo "⚠️  WARNING: This will reorganize the entire repository"
echo "Make sure you have committed all changes first!"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Step 1: Creating new directory structure..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create new directories
mkdir -p install/scripts
mkdir -p install/templates/workflow
mkdir -p install/templates/commands
mkdir -p install/templates/config
mkdir -p install/config

echo "✓ Created new directory structure"

echo ""
echo "Step 2: Moving installation scripts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Move scripts to install/scripts
if [ -d "scripts" ]; then
    # Keep only necessary scripts for end users
    for script in apply-config.js validate-config.js version-manager.js \
                  setup-orchestrator.js validate-secrets.js health-check.js \
                  github-setup.js generate-onboarding.js validate-workflow.js; do
        if [ -f "scripts/$script" ]; then
            mv "scripts/$script" "install/scripts/" 2>/dev/null || true
            echo "  ✓ Moved $script"
        fi
    done

    # Remove test and development scripts
    rm -f scripts/test-*.js
    rm -f scripts/*.sh
    rm -f scripts/example-usage.js
    rm -f scripts/edit-config.js
    rm -f scripts/README.md

    # Remove scripts directory if empty
    rmdir scripts 2>/dev/null || true
fi

echo ""
echo "Step 3: Reorganizing templates..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Move workflow templates
if [ -d "templates" ]; then
    mv templates/github-workflow.yml.template install/templates/workflow/ 2>/dev/null || true
    mv templates/linear-workflow.md.template install/templates/workflow/ 2>/dev/null || true
    mv templates/commit-msg.template install/templates/workflow/ 2>/dev/null || true
    mv templates/claude-instructions.md.template install/templates/workflow/ 2>/dev/null || true
    echo "  ✓ Moved workflow templates"

    # Move command templates
    if [ -d "templates/commands" ]; then
        mv templates/commands/*.template install/templates/commands/ 2>/dev/null || true
        echo "  ✓ Moved command templates"
    fi

    # Move config templates
    mv templates/config-file.json.template install/templates/config/ 2>/dev/null || true
    mv templates/mcp-config.json.template install/templates/config/ 2>/dev/null || true
    echo "  ✓ Moved config templates"

    # Clean up old templates directory
    rm -rf templates
fi

echo ""
echo "Step 4: Moving configuration files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Move setup configs
if [ -d "setup" ]; then
    mv setup/config-profiles.json install/config/profiles.json 2>/dev/null || true
    mv setup/config-schema.json install/config/schema.json 2>/dev/null || true
    echo "  ✓ Moved configuration files"

    # Remove internal documentation from setup
    rm -f setup/*.md
    rmdir setup 2>/dev/null || true
fi

echo ""
echo "Step 5: Cleaning up documentation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Move upgrade guide to docs
if [ -f "UPGRADE_GUIDE.md" ]; then
    mv UPGRADE_GUIDE.md docs/upgrade-guide.md
    echo "  ✓ Moved upgrade guide to docs"
fi

# Remove internal documentation
rm -f .archive-setup-improvements.md
rm -f PROJECT-SPEC.md
rm -f DIAGRAMS.md
rm -f EMOJI-GUIDE.md
rm -f COMMAND-CHEATSHEET.md
rm -f docs/reset-for-testing.md
echo "  ✓ Removed internal documentation"

# Remove personal settings
rm -f .claude/settings.local.json
echo "  ✓ Removed personal settings"

echo ""
echo "Step 6: Creating getting-started guide..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > docs/getting-started.md << 'EOF'
# Getting Started

Welcome to the Linear + GitHub + Claude workflow setup wizard! This tool will help you integrate Linear issue tracking with GitHub and Claude Code in about 15 minutes.

## Quick Start

### Option 1: Using Claude Code (Recommended)

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/claude-linear-gh-starter.git
   cd claude-linear-gh-starter
   ```

2. In Claude Code, run:
   ```
   /setup-linear
   ```

   Or simply say:
   ```
   Setup Linear workflow
   ```

3. Follow the interactive wizard - it handles everything!

### Option 2: Manual Installation

If you prefer to understand what's being installed:

1. Review the [prerequisites](prerequisites.md)
2. Check the [example workflows](examples/) to choose your setup
3. Run the setup wizard manually

## What Gets Installed

- **Linear MCP integration** - OAuth-based, no API key required!
- **GitHub Actions workflow** - Optional automatic status updates
- **Git commit hooks** - Ensure all commits reference Linear issues
- **Claude commands** - 20+ workflow commands like `/start-issue`
- **Documentation** - Complete workflow guide for your team

## After Installation

1. Test the workflow with the created test issue
2. Optionally run the interactive tutorial: `/tutorial`
3. Merge the setup branch to activate for your team

## Need Help?

- Check [troubleshooting guide](troubleshooting.md)
- Review [example workflows](examples/)
- See [upgrade guide](upgrade-guide.md) for updating

The setup wizard will guide you through everything - just keep pressing enter!
EOF

echo "  ✓ Created getting-started.md"

echo ""
echo "Step 7: Updating .gitignore..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Add entries for user-specific files
cat >> .gitignore << 'EOF'

# User-specific files (don't commit these)
.claude/settings.local.json
.linear-workflow.json
.env
.env.local
*.backup
*.log

# Test output
test-results/
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo
.DS_Store
EOF

echo "  ✓ Updated .gitignore"

echo ""
echo "Step 8: Updating package.json..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Update package.json paths
if [ -f "package.json" ]; then
    # Update main script path
    sed -i '' 's|"main": "scripts/apply-config.js"|"main": "install/scripts/setup-wizard.js"|g' package.json
    sed -i '' 's|"setup": "node scripts/setup-wizard.js"|"setup": "node install/scripts/setup-wizard.js"|g' package.json
    sed -i '' 's|"validate": "node scripts/validate-config.js"|"validate": "node install/scripts/validate-config.js"|g' package.json

    # Update repository URLs
    sed -i '' 's|YOUR_USERNAME|anthropics|g' package.json

    echo "  ✓ Updated package.json"
fi

echo ""
echo "Step 9: Creating path mapping file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create a path mapping for scripts to know where files moved
cat > install/path-mapping.json << 'EOF'
{
  "templates": {
    "workflow": "install/templates/workflow",
    "commands": "install/templates/commands",
    "config": "install/templates/config"
  },
  "scripts": "install/scripts",
  "config": "install/config"
}
EOF

echo "  ✓ Created path mapping"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Repository prepared for public release!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary of changes:"
echo "  • Removed ${RED}9${NC} internal documentation files"
echo "  • Reorganized into cleaner folder structure"
echo "  • Created install/ directory with all setup files"
echo "  • Updated paths in package.json"
echo "  • Added comprehensive .gitignore entries"
echo "  • Created getting-started guide"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git status"
echo "  2. Test the setup wizard still works"
echo "  3. Update README.md if needed"
echo "  4. Commit: git add -A && git commit -m 'chore: Prepare for public release'"
echo "  5. Tag release: git tag v1.0.0"
echo ""
echo "The repository is now ready for public release! 🚀"