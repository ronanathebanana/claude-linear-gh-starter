#!/bin/bash

###############################################################################
# Git Hooks Installer
#
# Installs git hooks for the Linear workflow, including:
# - commit-msg: Validates commit messages contain issue IDs
#
# Usage:
#   ./install-hooks.sh [project-path]
#
# If project-path is not provided, uses current directory
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default project path to current directory
PROJECT_PATH="${1:-.}"

# Resolve absolute path
PROJECT_PATH="$(cd "$PROJECT_PATH" && pwd)"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Git Hooks Installer${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Project path: $PROJECT_PATH"
echo ""

###############################################################################
# Pre-flight checks
###############################################################################

echo -e "${BLUE}Running pre-flight checks...${NC}"

# Check if project path exists
if [ ! -d "$PROJECT_PATH" ]; then
  echo -e "${RED}✗ Error: Directory not found: $PROJECT_PATH${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Project directory exists"

# Check if it's a git repository
if [ ! -d "$PROJECT_PATH/.git" ]; then
  echo -e "${RED}✗ Error: Not a git repository: $PROJECT_PATH${NC}"
  echo "  Run: git init"
  exit 1
fi
echo -e "${GREEN}✓${NC} Git repository detected"

# Check if hooks directory exists
HOOKS_DIR="$PROJECT_PATH/.git/hooks"
if [ ! -d "$HOOKS_DIR" ]; then
  echo -e "${YELLOW}⚠${NC} Hooks directory not found, creating..."
  mkdir -p "$HOOKS_DIR"
  echo -e "${GREEN}✓${NC} Hooks directory created"
else
  echo -e "${GREEN}✓${NC} Hooks directory exists"
fi

echo ""

###############################################################################
# Install commit-msg hook
###############################################################################

echo -e "${BLUE}Installing commit-msg hook...${NC}"

COMMIT_MSG_HOOK="$HOOKS_DIR/commit-msg"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")/templates"
COMMIT_MSG_TEMPLATE="$TEMPLATE_DIR/commit-msg.template"

# Check if template exists
if [ ! -f "$COMMIT_MSG_TEMPLATE" ]; then
  echo -e "${RED}✗ Error: Template not found: $COMMIT_MSG_TEMPLATE${NC}"
  exit 1
fi

# Check if hook already exists
if [ -f "$COMMIT_MSG_HOOK" ]; then
  echo -e "${YELLOW}⚠ Hook already exists: $COMMIT_MSG_HOOK${NC}"
  echo ""
  echo "Options:"
  echo "  1. Backup existing and install new hook"
  echo "  2. Skip installation (keep existing hook)"
  echo "  3. Overwrite existing hook"
  echo ""
  read -p "Your choice [1]: " choice
  choice=${choice:-1}

  case $choice in
    1)
      BACKUP_PATH="$COMMIT_MSG_HOOK.backup.$(date +%Y%m%d_%H%M%S)"
      cp "$COMMIT_MSG_HOOK" "$BACKUP_PATH"
      echo -e "${GREEN}✓${NC} Backed up existing hook to: $BACKUP_PATH"
      ;;
    2)
      echo -e "${BLUE}Skipping commit-msg hook installation${NC}"
      exit 0
      ;;
    3)
      echo -e "${YELLOW}Overwriting existing hook${NC}"
      ;;
    *)
      echo -e "${RED}Invalid choice${NC}"
      exit 1
      ;;
  esac
fi

# Copy template to hooks directory
cp "$COMMIT_MSG_TEMPLATE" "$COMMIT_MSG_HOOK"

# Make hook executable
chmod +x "$COMMIT_MSG_HOOK"

echo -e "${GREEN}✓${NC} commit-msg hook installed"
echo -e "${GREEN}✓${NC} Hook made executable"

echo ""

###############################################################################
# Verify installation
###############################################################################

echo -e "${BLUE}Verifying installation...${NC}"

if [ ! -f "$COMMIT_MSG_HOOK" ]; then
  echo -e "${RED}✗ Hook file not found after installation${NC}"
  exit 1
fi

if [ ! -x "$COMMIT_MSG_HOOK" ]; then
  echo -e "${RED}✗ Hook is not executable${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Hook file exists and is executable"

# Test hook syntax
if head -n 1 "$COMMIT_MSG_HOOK" | grep -q '^#!'; then
  echo -e "${GREEN}✓${NC} Hook has valid shebang"
else
  echo -e "${YELLOW}⚠${NC} Hook may be missing shebang line"
fi

echo ""

###############################################################################
# Summary
###############################################################################

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Git hooks installed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Installed hooks:"
echo "  • commit-msg: $COMMIT_MSG_HOOK"
echo ""
echo "What this hook does:"
echo "  • Validates commit messages contain Linear issue IDs"
echo "  • Enforces commit message format (configured in .linear-workflow.json)"
echo "  • Prevents commits without proper issue references"
echo ""
echo "To disable the hook temporarily:"
echo "  git commit --no-verify -m \"your message\""
echo ""
echo "To uninstall the hook:"
echo "  rm $COMMIT_MSG_HOOK"
echo ""
echo "Test the hook:"
echo "  echo 'test commit' | $COMMIT_MSG_HOOK"
echo ""

###############################################################################
# Optional: Install additional hooks
###############################################################################

# Check if there are other hook templates
if [ -d "$TEMPLATE_DIR" ]; then
  OTHER_HOOKS=$(find "$TEMPLATE_DIR" -name "*-hook.template" ! -name "commit-msg.template" 2>/dev/null || true)

  if [ -n "$OTHER_HOOKS" ]; then
    echo -e "${BLUE}Additional hooks available:${NC}"
    echo "$OTHER_HOOKS" | while read -r hook; do
      hook_name=$(basename "$hook" .template)
      echo "  • $hook_name"
    done
    echo ""
    echo "To install additional hooks, run this script with specific hook names."
  fi
fi
