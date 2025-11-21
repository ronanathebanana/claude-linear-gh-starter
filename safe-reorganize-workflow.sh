#!/bin/bash

# Safe workflow for reorganizing with full rollback capability

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Safe Reorganization Workflow with Git Branching"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    echo "Let's save these first before reorganizing."
    echo ""
    read -p "Commit current changes? (Y/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        echo "Committing current changes..."
        git add -A
        git commit -m "feat: Add release preparation scripts and new command templates

- Added safe-release-prep.sh for safe reorganization
- Added verify-installation.sh for testing
- Added new command templates
- Updated documentation for public release"

        echo -e "${GREEN}✓${NC} Changes committed"
    else
        echo -e "${RED}✗${NC} Please commit or stash your changes first"
        exit 1
    fi
fi

# Save current branch name
ORIGINAL_BRANCH=$(git branch --show-current)
echo "Current branch: $ORIGINAL_BRANCH"
echo ""

# Create reorganization branch
REORG_BRANCH="chore/reorganize-for-public-release"
echo "Creating reorganization branch: $REORG_BRANCH"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$REORG_BRANCH; then
    echo -e "${YELLOW}⚠️  Branch already exists${NC}"
    echo ""
    echo "Options:"
    echo "  1. Delete and recreate branch (lose any work on it)"
    echo "  2. Switch to existing branch"
    echo "  3. Create different branch name"
    echo "  4. Cancel"
    echo ""
    read -p "Your choice [2]: " -n 1 -r CHOICE
    echo ""

    case $CHOICE in
        1)
            git branch -D $REORG_BRANCH
            git checkout -b $REORG_BRANCH
            ;;
        3)
            read -p "Enter new branch name: " REORG_BRANCH
            git checkout -b $REORG_BRANCH
            ;;
        4)
            echo "Cancelled"
            exit 0
            ;;
        *)
            git checkout $REORG_BRANCH
            ;;
    esac
else
    git checkout -b $REORG_BRANCH
fi

echo -e "${GREEN}✓${NC} Now on branch: $REORG_BRANCH"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ready to reorganize!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You're now on a safe branch. The reorganization will:"
echo "  1. Create new /install directory structure"
echo "  2. Copy (not move) files to new locations"
echo "  3. Keep originals until verified working"
echo "  4. Update all paths automatically"
echo ""
echo -e "${GREEN}Safe to proceed!${NC} You can always rollback with:"
echo "  git checkout $ORIGINAL_BRANCH"
echo "  git branch -D $REORG_BRANCH"
echo ""
read -p "Run safe reorganization? (Y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
    echo "Cancelled"
    exit 0
fi

# Run the safe reorganization
echo ""
echo "Starting safe reorganization..."
echo ""

if [ -f "safe-release-prep.sh" ]; then
    chmod +x safe-release-prep.sh
    ./safe-release-prep.sh
else
    echo -e "${RED}✗${NC} safe-release-prep.sh not found!"
    echo "Please ensure the script exists"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Reorganization Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Current status:"
echo "  ✓ On branch: $REORG_BRANCH"
echo "  ✓ Original work saved in: $ORIGINAL_BRANCH"
echo "  ✓ New structure created in /install"
echo "  ✓ Old structure still exists for testing"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Test the setup wizard:"
echo "   In Claude Code: /setup-linear"
echo ""
echo "2. If it works, update paths:"
echo "   node update-all-paths.js"
echo ""
echo "3. Test again after path updates"
echo ""
echo "4. Remove old directories:"
echo "   rm -rf scripts templates setup"
echo ""
echo "5. Commit the reorganization:"
echo "   git add -A"
echo "   git commit -m 'chore: Complete repository reorganization'"
echo ""
echo "6. Merge back to main (after thorough testing):"
echo "   git checkout $ORIGINAL_BRANCH"
echo "   git merge $REORG_BRANCH"
echo ""
echo -e "${GREEN}Rollback options always available:${NC}"
echo "  • Reset changes: git reset --hard HEAD"
echo "  • Abandon branch: git checkout $ORIGINAL_BRANCH && git branch -D $REORG_BRANCH"
echo "  • Revert commit: git revert HEAD"
echo ""
echo "You're completely safe to experiment! 🚀"