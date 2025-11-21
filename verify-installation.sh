#!/bin/bash

# Verification script to ensure installation still works after reorganization
# Run this AFTER reorganizing to catch any broken paths

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installation Verification Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "Testing critical paths and files..."
echo ""

# Function to test file existence
test_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        echo "    Missing: $file"
        ((ERRORS++))
        return 1
    fi
}

# Function to test directory existence
test_dir() {
    local dir=$1
    local description=$2

    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        echo "    Missing: $dir"
        ((ERRORS++))
        return 1
    fi
}

# Function to test path in file
test_path_in_file() {
    local file=$1
    local pattern=$2
    local description=$3

    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC}  $description"
        echo "    Found old path: $pattern in $file"
        ((WARNINGS++))
        return 1
    else
        echo -e "${GREEN}✓${NC} $description"
        return 0
    fi
}

echo "1. Core Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_file "CLAUDE.md" "CLAUDE.md (main instructions)"
test_file "package.json" "package.json"
test_file "README.md" "README.md"
echo ""

echo "2. Directory Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if using new structure
if [ -d "install" ]; then
    echo -e "${GREEN}✓${NC} Using new structure (install/)"

    test_dir "install/scripts" "Scripts directory"
    test_dir "install/templates" "Templates directory"
    test_dir "install/templates/workflow" "Workflow templates"
    test_dir "install/templates/commands" "Command templates"
    test_dir "install/templates/config" "Config templates"
    test_dir "install/config" "Configuration directory"

    STRUCTURE="new"
else
    echo -e "${YELLOW}⚠${NC}  Using old structure (scripts/, templates/)"

    test_dir "scripts" "Scripts directory"
    test_dir "templates" "Templates directory"
    test_dir "templates/commands" "Command templates"

    STRUCTURE="old"
fi
echo ""

echo "3. Critical Templates"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$STRUCTURE" == "new" ]; then
    test_file "install/templates/workflow/github-workflow.yml.template" "GitHub workflow template"
    test_file "install/templates/workflow/commit-msg.template" "Commit message hook template"
    test_file "install/templates/workflow/linear-workflow.md.template" "Documentation template"
    test_file "install/templates/config/config-file.json.template" "Config file template"
else
    test_file "templates/github-workflow.yml.template" "GitHub workflow template"
    test_file "templates/commit-msg.template" "Commit message hook template"
    test_file "templates/linear-workflow.md.template" "Documentation template"
    test_file "templates/config-file.json.template" "Config file template"
fi
echo ""

echo "4. Critical Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$STRUCTURE" == "new" ]; then
    test_file "install/scripts/apply-config.js" "Config application script"
    test_file "install/scripts/validate-config.js" "Config validation script"
    test_file "install/scripts/setup-orchestrator.js" "Setup orchestrator"
else
    test_file "scripts/apply-config.js" "Config application script"
    test_file "scripts/validate-config.js" "Config validation script"
    test_file "scripts/setup-orchestrator.js" "Setup orchestrator"
fi
echo ""

echo "5. Path References in CLAUDE.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$STRUCTURE" == "new" ]; then
    # Check for old paths that should have been updated
    test_path_in_file "CLAUDE.md" "templates/github" "No old workflow template paths"
    test_path_in_file "CLAUDE.md" "templates/commit" "No old commit template paths"
    test_path_in_file "CLAUDE.md" "scripts/apply" "No old script paths"

    # Check that new paths exist
    if grep -q "install/templates" CLAUDE.md 2>/dev/null; then
        echo -e "${GREEN}✓${NC} CLAUDE.md updated with new paths"
    else
        echo -e "${YELLOW}⚠${NC}  CLAUDE.md may not be fully updated"
        ((WARNINGS++))
    fi
else
    echo -e "${GREEN}✓${NC} Using old structure - no path updates needed"
fi
echo ""

echo "6. Command Templates Count"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$STRUCTURE" == "new" ]; then
    CMD_COUNT=$(ls -1 install/templates/commands/*.template 2>/dev/null | wc -l)
else
    CMD_COUNT=$(ls -1 templates/commands/*.template 2>/dev/null | wc -l)
fi

if [ "$CMD_COUNT" -ge 15 ]; then
    echo -e "${GREEN}✓${NC} Found $CMD_COUNT command templates (expected 15+)"
else
    echo -e "${RED}✗${NC} Only found $CMD_COUNT command templates (expected 15+)"
    ((ERRORS++))
fi
echo ""

echo "7. Package.json Entry Points"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$STRUCTURE" == "new" ]; then
    if grep -q '"main".*install/scripts' package.json 2>/dev/null; then
        echo -e "${GREEN}✓${NC} package.json main entry updated"
    else
        echo -e "${YELLOW}⚠${NC}  package.json main entry not updated"
        ((WARNINGS++))
    fi
else
    if grep -q '"main".*scripts/' package.json 2>/dev/null; then
        echo -e "${GREEN}✓${NC} package.json main entry correct"
    fi
fi
echo ""

echo "8. Test Script Loading"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test that a script can load successfully
if [ "$STRUCTURE" == "new" ]; then
    SCRIPT_PATH="install/scripts/validate-config.js"
else
    SCRIPT_PATH="scripts/validate-config.js"
fi

if [ -f "$SCRIPT_PATH" ]; then
    if node -e "try { require('./$SCRIPT_PATH'); console.log('Script loads'); } catch(e) { console.error('Script fails:', e.message); process.exit(1); }" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Scripts can be loaded by Node.js"
    else
        echo -e "${RED}✗${NC} Scripts fail to load - path issues likely"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} Test script not found at $SCRIPT_PATH"
    ((ERRORS++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Perfect! All tests passed.${NC}"
    echo ""
    echo "The installation structure is working correctly."
    echo "You can safely proceed with testing the setup wizard."
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Passed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "The installation should work, but review the warnings above."
    echo "These are usually old path references that need updating."
else
    echo -e "${RED}❌ Failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Critical issues found! The installation may not work properly."
    echo "Review the errors above and fix them before proceeding."
fi

echo ""
echo "Next steps:"
if [ $ERRORS -eq 0 ]; then
    echo "  1. Test the setup wizard: /setup-linear (in Claude Code)"
    echo "  2. If it works, commit your changes"
else
    echo "  1. Fix the errors listed above"
    echo "  2. Run this verification again"
    echo "  3. Once passing, test the setup wizard"
fi

exit $ERRORS