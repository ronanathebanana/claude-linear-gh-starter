#!/bin/bash

# GitHub Authentication Helper for Linear Workflow Setup
# Guides users through proper GitHub CLI authentication with required scopes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GitHub Authentication Setup Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if gh is installed
if ! command -v gh &>/dev/null; then
    echo -e "${RED}❌ GitHub CLI not installed${NC}"
    echo ""
    echo "Please install GitHub CLI first:"
    echo ""
    echo "  macOS:     brew install gh"
    echo "  Linux:     See https://github.com/cli/cli#installation"
    echo "  Windows:   winget install --id GitHub.cli"
    echo ""
    exit 1
fi

echo "GitHub CLI installed: $(gh --version | head -n 1)"
echo ""

# Check current auth status
echo "Checking current authentication status..."
echo ""

if gh auth status &>/dev/null; then
    USERNAME=$(gh api user -q '.login' 2>/dev/null || echo "unknown")

    echo -e "${GREEN}✓ Already authenticated as: $USERNAME${NC}"
    echo ""

    # Check for workflow scope
    HAS_WORKFLOW=false

    if gh auth status 2>&1 | grep -q "workflow"; then
        HAS_WORKFLOW=true
    elif gh secret list &>/dev/null 2>&1; then
        # Fallback check - if we can list secrets, we likely have workflow scope
        HAS_WORKFLOW=true
    fi

    if [ "$HAS_WORKFLOW" = true ]; then
        echo -e "${GREEN}✓ Required scopes present (including 'workflow')${NC}"
        echo ""
        echo "You're all set! No action needed."
        echo ""
        exit 0
    else
        echo -e "${YELLOW}⚠️  Missing 'workflow' scope${NC}"
        echo ""
        echo "The 'workflow' scope is required to:"
        echo "  • Create/update GitHub Actions workflow files"
        echo "  • Push files to .github/workflows/"
        echo ""
        echo "You need to add this scope to your authentication."
        echo ""

        # Offer options
        echo "Options:"
        echo ""
        echo "  1. Refresh authentication (adds workflow scope)"
        echo "  2. Logout and re-authenticate"
        echo "  3. Exit (fix manually)"
        echo ""

        read -p "Your choice [1]: " choice
        choice=${choice:-1}

        case $choice in
            1)
                echo ""
                echo "Refreshing authentication with workflow scope..."
                echo ""
                gh auth refresh --scopes workflow

                if [ $? -eq 0 ]; then
                    echo ""
                    echo -e "${GREEN}✅ Successfully added workflow scope!${NC}"
                    echo ""
                else
                    echo ""
                    echo -e "${RED}❌ Failed to refresh authentication${NC}"
                    echo ""
                    echo "Please try logging out and re-authenticating:"
                    echo "  gh auth logout"
                    echo "  gh auth login --scopes workflow"
                    echo ""
                    exit 1
                fi
                ;;
            2)
                echo ""
                echo "Logging out..."
                gh auth logout

                echo ""
                echo "Now logging in with workflow scope..."
                echo ""

                gh auth login --scopes workflow

                if [ $? -eq 0 ]; then
                    echo ""
                    echo -e "${GREEN}✅ Successfully authenticated!${NC}"
                    echo ""
                else
                    echo ""
                    echo -e "${RED}❌ Authentication failed${NC}"
                    echo ""
                    exit 1
                fi
                ;;
            3)
                echo ""
                echo "To fix manually, run:"
                echo "  gh auth refresh --scopes workflow"
                echo ""
                exit 0
                ;;
            *)
                echo ""
                echo "Invalid choice. Exiting."
                exit 1
                ;;
        esac
    fi
else
    echo -e "${YELLOW}Not currently authenticated${NC}"
    echo ""
    echo "Let's set up GitHub CLI authentication with the required scopes."
    echo ""

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Required Scopes"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "The Linear workflow integration requires these scopes:"
    echo ""
    echo "  ✓ repo       - Access repositories"
    echo "  ✓ workflow   - Update GitHub Actions workflows"
    echo ""
    echo "These scopes allow the setup wizard to:"
    echo "  • Create workflow files in .github/workflows/"
    echo "  • Configure repository secrets (LINEAR_API_KEY)"
    echo "  • Create pull requests"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    read -p "Press Enter to start authentication..."

    echo ""
    echo "Starting GitHub authentication..."
    echo ""
    echo -e "${CYAN}When prompted, please choose:${NC}"
    echo "  • GitHub.com (not Enterprise Server)"
    echo "  • HTTPS protocol"
    echo "  • Authenticate via web browser (recommended)"
    echo ""

    gh auth login --scopes workflow

    if [ $? -eq 0 ]; then
        USERNAME=$(gh api user -q '.login' 2>/dev/null || echo "unknown")
        echo ""
        echo -e "${GREEN}✅ Successfully authenticated as: $USERNAME${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Authentication failed${NC}"
        echo ""
        echo "Please try again or visit:"
        echo "  https://github.com/cli/cli/manual/gh_auth_login"
        echo ""
        exit 1
    fi
fi

# Final verification
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if gh auth status &>/dev/null; then
    USERNAME=$(gh api user -q '.login' 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ Authenticated as: $USERNAME${NC}"

    # Verify scopes
    HAS_WORKFLOW=false
    if gh auth status 2>&1 | grep -q "workflow" || gh secret list &>/dev/null 2>&1; then
        HAS_WORKFLOW=true
        echo -e "${GREEN}✓ Workflow scope: Present${NC}"
    else
        echo -e "${RED}✗ Workflow scope: Missing${NC}"
    fi

    echo ""

    if [ "$HAS_WORKFLOW" = true ]; then
        echo -e "${GREEN}✅ GitHub authentication is properly configured!${NC}"
        echo ""
        echo "You can now run the Linear workflow setup wizard."
        echo ""
    else
        echo -e "${YELLOW}⚠️  Workflow scope still missing${NC}"
        echo ""
        echo "Please run:"
        echo "  gh auth refresh --scopes workflow"
        echo ""
        exit 1
    fi
else
    echo -e "${RED}✗ Authentication check failed${NC}"
    echo ""
    exit 1
fi

exit 0
