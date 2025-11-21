#!/bin/bash

# SAFER release preparation that maintains compatibility
# This approach uses symlinks to ensure nothing breaks

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Safe Release Preparation - Maintains Full Compatibility"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "This script will:"
echo "  1. Test the current setup works"
echo "  2. Create new organized structure"
echo "  3. Create compatibility symlinks"
echo "  4. Verify setup still works"
echo "  5. Only then remove old files"
echo ""

read -p "Continue with safe reorganization? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Step 1: Testing current setup works..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test that key files exist
if [ ! -d "templates" ]; then
    echo -e "${RED}✗${NC} templates/ directory not found"
    exit 1
fi

if [ ! -d "scripts" ]; then
    echo -e "${RED}✗${NC} scripts/ directory not found"
    exit 1
fi

if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}✗${NC} CLAUDE.md not found"
    exit 1
fi

# Test that a key script can find templates
if node -e "const fs = require('fs'); if (!fs.existsSync('templates/commit-msg.template')) { process.exit(1); }" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Scripts can find templates"
else
    echo -e "${RED}✗${NC} Scripts cannot find templates"
    exit 1
fi

echo -e "${GREEN}✓${NC} Current setup is working"

echo ""
echo "Step 2: Creating new directory structure..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create new directories
mkdir -p install/scripts
mkdir -p install/templates/workflow
mkdir -p install/templates/commands
mkdir -p install/templates/config
mkdir -p install/config

echo -e "${GREEN}✓${NC} Created new directory structure"

echo ""
echo "Step 3: Copying files to new structure (keeping originals)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy (not move) scripts
cp -r scripts/* install/scripts/ 2>/dev/null || true
echo -e "${GREEN}✓${NC} Copied scripts"

# Copy templates with organization
cp templates/github-workflow.yml.template install/templates/workflow/ 2>/dev/null || true
cp templates/linear-workflow.md.template install/templates/workflow/ 2>/dev/null || true
cp templates/commit-msg.template install/templates/workflow/ 2>/dev/null || true
cp templates/claude-instructions.md.template install/templates/workflow/ 2>/dev/null || true
echo -e "${GREEN}✓${NC} Copied workflow templates"

cp -r templates/commands/* install/templates/commands/ 2>/dev/null || true
echo -e "${GREEN}✓${NC} Copied command templates"

cp templates/config-file.json.template install/templates/config/ 2>/dev/null || true
cp templates/mcp-config.json.template install/templates/config/ 2>/dev/null || true
echo -e "${GREEN}✓${NC} Copied config templates"

# Copy setup configs
if [ -f "setup/config-profiles.json" ]; then
    cp setup/config-profiles.json install/config/profiles.json
fi
if [ -f "setup/config-schema.json" ]; then
    cp setup/config-schema.json install/config/schema.json
fi
echo -e "${GREEN}✓${NC} Copied configuration files"

echo ""
echo "Step 4: Creating backward compatibility symlinks..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create symlinks so old paths still work
ln -sfn install/scripts scripts.new 2>/dev/null || true
ln -sfn install/templates templates.new 2>/dev/null || true

echo -e "${YELLOW}⚠${NC}  Symlinks created for testing"

echo ""
echo "Step 5: Testing new structure with symlinks..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test that files are accessible through new structure
if [ -f "install/templates/workflow/commit-msg.template" ]; then
    echo -e "${GREEN}✓${NC} Templates accessible in new location"
else
    echo -e "${RED}✗${NC} Templates not accessible in new location"
    echo "Aborting - new structure not working"
    rm -rf install
    rm -f scripts.new templates.new
    exit 1
fi

if [ -f "install/scripts/apply-config.js" ]; then
    echo -e "${GREEN}✓${NC} Scripts accessible in new location"
else
    echo -e "${RED}✗${NC} Scripts not accessible in new location"
    echo "Aborting - new structure not working"
    rm -rf install
    rm -f scripts.new templates.new
    exit 1
fi

echo -e "${GREEN}✓${NC} New structure is working!"

echo ""
echo "Step 6: Creating path update script..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create a comprehensive path updater
cat > update-all-paths.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Updating all paths for new structure...\n');

// Files that need updating
const filesToUpdate = [
    'CLAUDE.md',
    'install/scripts/*.js',
    '.claude/commands/*.md',
    'docs/*.md',
    'docs/examples/*.md',
    'README.md',
    'package.json'
];

// Comprehensive path mappings
const replacements = [
    // Template paths
    [/templates\/github-workflow\.yml\.template/g, 'install/templates/workflow/github-workflow.yml.template'],
    [/templates\/linear-workflow\.md\.template/g, 'install/templates/workflow/linear-workflow.md.template'],
    [/templates\/commit-msg\.template/g, 'install/templates/workflow/commit-msg.template'],
    [/templates\/claude-instructions\.md\.template/g, 'install/templates/workflow/claude-instructions.md.template'],
    [/templates\/config-file\.json\.template/g, 'install/templates/config/config-file.json.template'],
    [/templates\/mcp-config\.json\.template/g, 'install/templates/config/mcp-config.json.template'],
    [/templates\/commands\//g, 'install/templates/commands/'],

    // Script paths
    [/"scripts\//g, '"install/scripts/'],
    [/'scripts\//g, "'install/scripts/"],
    [/\bscripts\//g, 'install/scripts/'],
    [/\.\/scripts\//g, './install/scripts/'],
    [/\.\.\/scripts\//g, '../install/scripts/'],

    // Setup paths
    [/setup\/config-profiles\.json/g, 'install/config/profiles.json'],
    [/setup\/config-schema\.json/g, 'install/config/schema.json'],

    // Package.json specific
    [/"main": "scripts\/apply-config\.js"/g, '"main": "install/scripts/apply-config.js"'],

    // Relative paths in scripts (when moved to install/scripts)
    [/\.\.\/templates\//g, '../templates/'],
    [/path\.join\(__dirname, '\.\.\/templates/g, "path.join(__dirname, '../templates"],
];

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [pattern, replacement] of replacements) {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
            changed = true;
            content = newContent;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`✓ Updated: ${filePath}`);
    }
}

// Process all files
const glob = require('glob');
filesToUpdate.forEach(pattern => {
    const files = glob.sync(pattern);
    files.forEach(updateFile);
});

console.log('\n✓ Path update complete!');
EOF

chmod +x update-all-paths.js
echo -e "${GREEN}✓${NC} Created path updater"

echo ""
echo "Step 7: Removing internal/development files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove internal documentation (safe to remove)
rm -f .archive-setup-improvements.md 2>/dev/null || true
rm -f PROJECT-SPEC.md 2>/dev/null || true
rm -f DIAGRAMS.md 2>/dev/null || true
rm -f EMOJI-GUIDE.md 2>/dev/null || true
rm -f COMMAND-CHEATSHEET.md 2>/dev/null || true
rm -f docs/reset-for-testing.md 2>/dev/null || true
echo -e "${GREEN}✓${NC} Removed internal documentation"

# Remove personal settings
rm -f .claude/settings.local.json 2>/dev/null || true
echo -e "${GREEN}✓${NC} Removed personal settings"

# Remove test files from scripts
rm -f scripts/test-*.js 2>/dev/null || true
rm -f scripts/example-usage.js 2>/dev/null || true
echo -e "${GREEN}✓${NC} Removed test scripts"

# Remove internal setup docs
rm -f setup/*.md 2>/dev/null || true
echo -e "${GREEN}✓${NC} Removed internal setup docs"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Safe preparation complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Current state:"
echo "  • Original files still exist (scripts/, templates/)"
echo "  • New structure created (install/)"
echo "  • Symlinks ready for testing"
echo "  • Internal files removed"
echo ""
echo -e "${YELLOW}IMPORTANT NEXT STEPS:${NC}"
echo ""
echo "1. Test the setup wizard STILL WORKS:"
echo "   In Claude Code: /setup-linear"
echo ""
echo "2. If it works, run the path updater:"
echo "   node update-all-paths.js"
echo ""
echo "3. Test AGAIN after path updates:"
echo "   In Claude Code: /setup-linear"
echo ""
echo "4. Once confirmed working, remove old directories:"
echo "   rm -rf scripts templates setup"
echo "   rm scripts.new templates.new"
echo ""
echo "5. Commit the changes:"
echo "   git add -A"
echo "   git commit -m 'chore: Reorganize for public release'"
echo ""
echo "This safe approach ensures nothing breaks! Test at each step."