#!/bin/bash

# Linear Workflow Setup - Pre-Flight Checks
# This script validates all requirements before starting the setup wizard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Exit codes
EXIT_SUCCESS=0
EXIT_BLOCKER=1
EXIT_WARNING=2

# Track overall status
BLOCKERS=0
WARNINGS=0

echo ""
echo "🔍 Pre-Flight Checks"
echo ""
echo "Running setup validation..."
echo ""

# ============================================================================
# Check 1: Git Repository
# ============================================================================

printf "Checking git repository... "

if ! git rev-parse --git-dir &>/dev/null; then
    echo -e "${RED}✗${NC}"
    echo ""
    echo -e "${RED}❌ Not a git repository${NC}"
    echo ""
    echo "This directory is not initialized with git."
    echo ""
    echo "Please either:"
    echo "  1. Navigate to your git repository directory"
    echo "  2. Initialize git: git init"
    echo ""
    BLOCKERS=$((BLOCKERS + 1))
else
    GIT_DIR=$(git rev-parse --git-dir)
    echo -e "${GREEN}✓${NC}"
    echo "  Location: $GIT_DIR"
fi

# ============================================================================
# Check 2: GitHub CLI Installation
# ============================================================================

printf "Checking GitHub CLI... "

if ! command -v gh &>/dev/null; then
    echo -e "${RED}✗${NC}"
    echo ""
    echo -e "${RED}❌ GitHub CLI not installed${NC}"
    echo ""
    echo "The GitHub CLI (gh) is required to configure repository secrets."
    echo ""
    echo "Installation instructions:"
    echo "  macOS:     brew install gh"
    echo "  Linux:     See https://github.com/cli/cli#installation"
    echo "  Windows:   winget install --id GitHub.cli"
    echo ""
    echo "After installing, run: gh auth login"
    echo ""
    BLOCKERS=$((BLOCKERS + 1))
else
    GH_VERSION=$(gh --version | head -n 1)
    echo -e "${GREEN}✓${NC}"
    echo "  $GH_VERSION"
fi

# ============================================================================
# Check 3: GitHub CLI Authentication & Scopes
# ============================================================================

if command -v gh &>/dev/null; then
    printf "Checking GitHub authentication... "

    if ! gh auth status &>/dev/null; then
        echo -e "${RED}✗${NC}"
        echo ""
        echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
        echo ""
        echo "You need to log in to GitHub with the required scopes."
        echo ""
        echo "Please run:"
        echo ""
        echo -e "  ${BLUE}gh auth login --scopes workflow${NC}"
        echo ""
        echo "Required scopes:"
        echo "  ✓ repo       (access repositories)"
        echo "  ✓ workflow   (update GitHub Actions workflows)"
        echo ""
        echo "Follow the prompts and choose:"
        echo "  - GitHub.com (not Enterprise)"
        echo "  - HTTPS protocol"
        echo "  - Authenticate with browser (recommended)"
        echo ""
        BLOCKERS=$((BLOCKERS + 1))
    else
        # Check for required scopes
        GH_USERNAME=$(gh api user -q '.login' 2>/dev/null || echo "unknown")

        # Get OAuth scopes - gh doesn't expose this easily, so we check via API
        # We'll test if we can access workflow-related endpoints

        HAS_WORKFLOW_SCOPE=false

        # Try to check scopes via auth token endpoint
        if gh auth status 2>&1 | grep -q "Token scopes:"; then
            SCOPES=$(gh auth status 2>&1 | grep "Token scopes:" | cut -d':' -f2)
            if echo "$SCOPES" | grep -q "workflow"; then
                HAS_WORKFLOW_SCOPE=true
            fi
        else
            # Fallback: assume workflow scope if we can list secrets
            if gh secret list &>/dev/null; then
                HAS_WORKFLOW_SCOPE=true
            fi
        fi

        if [ "$HAS_WORKFLOW_SCOPE" = false ]; then
            echo -e "${YELLOW}⚠${NC}"
            echo ""
            echo -e "${YELLOW}⚠️  Missing 'workflow' scope${NC}"
            echo ""
            echo "You're logged in as: $GH_USERNAME"
            echo ""
            echo "However, you're missing the 'workflow' scope which is required to:"
            echo "  - Create/update GitHub Actions workflow files"
            echo "  - Push .github/workflows/* files to repository"
            echo ""
            echo "Please re-authenticate with the workflow scope:"
            echo ""
            echo -e "  ${BLUE}gh auth refresh --scopes workflow${NC}"
            echo ""
            echo "Or logout and login again:"
            echo ""
            echo -e "  ${BLUE}gh auth logout${NC}"
            echo -e "  ${BLUE}gh auth login --scopes workflow${NC}"
            echo ""
            BLOCKERS=$((BLOCKERS + 1))
        else
            echo -e "${GREEN}✓${NC}"
            echo "  User: $GH_USERNAME"
            echo "  Scopes: repo, workflow ✓"
        fi
    fi
fi

# ============================================================================
# Check 4: GitHub Repository Connection
# ============================================================================

if command -v gh &>/dev/null && gh auth status &>/dev/null; then
    printf "Checking GitHub repository... "

    REPO_INFO=$(gh repo view --json nameWithOwner,isPrivate 2>&1)

    if echo "$REPO_INFO" | grep -q "Could not resolve to a Repository" ||
       echo "$REPO_INFO" | grep -q "no git remotes found"; then
        echo -e "${YELLOW}⚠${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Not connected to a GitHub repository${NC}"
        echo ""
        echo "This git repository isn't connected to GitHub yet."
        echo ""
        echo "You can either:"
        echo "  1. Create a new GitHub repository:"
        echo -e "     ${BLUE}gh repo create${NC}"
        echo ""
        echo "  2. Connect to existing repository:"
        echo -e "     ${BLUE}git remote add origin https://github.com/OWNER/REPO.git${NC}"
        echo ""
        echo "  3. Continue anyway (you'll need to manually configure GitHub later)"
        echo ""
        WARNINGS=$((WARNINGS + 1))
    else
        REPO_NAME=$(echo "$REPO_INFO" | jq -r '.nameWithOwner')
        IS_PRIVATE=$(echo "$REPO_INFO" | jq -r '.isPrivate')

        echo -e "${GREEN}✓${NC}"
        echo "  Repository: $REPO_NAME"

        if [ "$IS_PRIVATE" = "true" ]; then
            echo "  🔒 Private repository"
        else
            echo "  🌍 Public repository"
        fi
    fi
fi

# ============================================================================
# Check 5: Node.js Installation (Warning only)
# ============================================================================

printf "Checking Node.js... "

if ! command -v node &>/dev/null; then
    echo -e "${YELLOW}⚠${NC}"
    echo "  Not installed (optional)"
    WARNINGS=$((WARNINGS + 1))
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC}"
    echo "  Version: $NODE_VERSION"
fi

# ============================================================================
# Check 6: Working Directory Status (Warning only)
# ============================================================================

if git rev-parse --git-dir &>/dev/null; then
    printf "Checking working directory... "

    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠${NC}"
        echo "  Uncommitted changes detected"
        echo ""
        echo "  Consider committing or stashing changes before setup."
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓${NC}"
        echo "  Clean"
    fi
fi

# ============================================================================
# Check 7: LINEAR_API_KEY Environment Variable (Informational)
# ============================================================================

printf "Checking LINEAR_API_KEY... "

if [ -z "$LINEAR_API_KEY" ]; then
    echo -e "${YELLOW}⚠${NC}"
    echo "  Not in environment (we'll ask during setup)"
else
    echo -e "${GREEN}✓${NC}"
    echo "  Found in environment"
fi

# ============================================================================
# Check 8: Existing Workflow Detection
# ============================================================================

printf "Checking for existing workflow... "

if [ -f ".linear-workflow.json" ]; then
    echo -e "${YELLOW}⚠${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Existing Linear workflow detected${NC}"
    echo ""

    if command -v jq &>/dev/null; then
        INSTALLED_DATE=$(jq -r '.installed // "unknown"' .linear-workflow.json 2>/dev/null)
        TEAM_NAME=$(jq -r '.linear.teamName // "unknown"' .linear-workflow.json 2>/dev/null)
        TEAM_KEY=$(jq -r '.linear.teamKey // "unknown"' .linear-workflow.json 2>/dev/null)

        echo "  Installed: $INSTALLED_DATE"
        echo "  Team: $TEAM_NAME ($TEAM_KEY)"
        echo ""
    fi

    echo "  The wizard will ask if you want to update or reinstall."
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓${NC}"
    echo "  No existing workflow (clean install)"
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $BLOCKERS -gt 0 ]; then
    echo -e "${RED}❌ Setup cannot continue${NC}"
    echo ""
    echo "Found $BLOCKERS critical issue(s) that must be resolved."
    echo ""
    echo "Please fix the issues above and re-run the setup wizard."
    echo ""
    exit $EXIT_BLOCKER
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Setup can continue with warnings${NC}"
    echo ""
    echo "Found $WARNINGS warning(s) - review above for details."
    echo ""
    echo "You can proceed, but some features may require manual configuration."
    echo ""
    exit $EXIT_WARNING
else
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your environment is ready for Linear workflow setup."
    echo ""
    exit $EXIT_SUCCESS
fi
