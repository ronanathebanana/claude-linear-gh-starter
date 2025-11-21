# MCP Setup Guide

This guide explains how to set up the Linear MCP (Model Context Protocol) server for use with Claude Desktop or Claude Code CLI.

## Overview

The Linear MCP server allows Claude to:
- Fetch issue details from Linear
- Create and update issues
- Add comments to issues
- List team issues
- Search Linear workspace

**This is configured automatically during setup**, but you can also configure it manually.

---

## What is MCP?

**Model Context Protocol (MCP)** is a standard for connecting Claude to external data sources and tools.

**MCP servers** are small programs that:
- Run on your machine
- Connect to external APIs (like Linear)
- Expose data and functions to Claude
- Handle authentication

**For the Linear workflow:**
- MCP server connects to Linear API
- Claude uses MCP to read/write Linear issues
- No need to copy-paste issue IDs or details

---

## Prerequisites

- **Claude Desktop** or **Claude Code CLI** installed
- **Linear API key** (from [Linear Setup Guide](./linear-setup.md))
- **npx** available (comes with Node.js 16+)

---

## Option 1: Automatic Configuration (Recommended)

The setup wizard automatically configures MCP for you.

**During setup:**
1. Wizard detects Claude Desktop or Claude Code CLI
2. Creates/updates `.mcp.json` configuration file
3. Adds Linear server with your API key
4. You're done!

**To verify automatic setup worked:**
```bash
cat .mcp.json
```

Should contain Linear server configuration.

---

## Option 2: Manual Configuration

### For Claude Code CLI

**1. Create or edit `.mcp.json` in your project:**

```bash
cd /path/to/your/project
```

**2. Create `.mcp.json` file:**

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": [
        "-y",
        "@linear/mcp-server-linear"
      ],
      "env": {
        "LINEAR_API_KEY": "lin_api_YOUR_KEY_HERE"
      }
    }
  }
}
```

**3. Replace `lin_api_YOUR_KEY_HERE` with your actual Linear API key**

**4. Restart Claude Code CLI** (if running)

---

### For Claude Desktop

**1. Locate Claude Desktop config file:**

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**2. Edit the config file:**

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": [
        "-y",
        "@linear/mcp-server-linear"
      ],
      "env": {
        "LINEAR_API_KEY": "lin_api_YOUR_KEY_HERE"
      }
    }
  }
}
```

**3. If file already has other MCP servers**, merge the configuration:

```json
{
  "mcpServers": {
    "existing-server": {
      ...existing config...
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "lin_api_YOUR_KEY_HERE"
      }
    }
  }
}
```

**4. Restart Claude Desktop**

---

## Verification

### Test MCP Connection

**Ask Claude:**
```
Can you list my Linear issues?
```

or

```
Get issue details for DEV-123
```

**If MCP is working:**
- Claude will fetch real data from Linear
- You'll see actual issue titles, descriptions, statuses

**If MCP is NOT working:**
- Claude will say it cannot access Linear
- Or will respond generically without real data

---

### Debugging MCP

**Check configuration:**

**For Claude Code CLI:**
```bash
cat .mcp.json
```

**For Claude Desktop:**
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Linux
cat ~/.config/Claude/claude_desktop_config.json
```

**Verify:**
- `LINEAR_API_KEY` is present
- API key format is correct (`lin_api_...`)
- JSON syntax is valid (no trailing commas, quotes correct)

---

**Test Linear API key directly:**

```bash
export LINEAR_API_KEY="lin_api_YOUR_KEY_HERE"

npx -y @linear/mcp-server-linear
```

**Expected:** MCP server starts without errors

**If you see errors:**
- Check API key is correct
- Ensure `npx` is available: `npx --version`
- Try updating npm: `npm install -g npm@latest`

---

## Available Linear MCP Tools

When MCP is configured, Claude can use these tools:

### get_issue
Fetch details for a specific issue.

**Example:**
```
Get issue DEV-123
```

**Returns:**
- Issue title
- Description
- Current status
- Assignee
- Labels
- Comments
- Related issues

---

### create_issue
Create a new Linear issue.

**Example:**
```
Create a new issue in team DEV with title "Fix login bug" and description "Users cannot log in with Google OAuth"
```

---

### update_issue
Update an existing issue.

**Example:**
```
Update issue DEV-123 to status "In Progress" and assign to me
```

---

### create_comment
Add a comment to an issue.

**Example:**
```
Add comment to DEV-123: "Fixed in PR #456"
```

---

### list_comments
List all comments on an issue.

**Example:**
```
Show comments on DEV-123
```

---

### search_issues
Search for issues in your workspace.

**Example:**
```
Search for issues assigned to me that are in progress
```

---

## Security Considerations

### Protect Your API Key

**DO:**
- ✓ Store API key in MCP config file only
- ✓ Keep config file out of git (use `.gitignore`)
- ✓ Set appropriate file permissions
- ✓ Use project-specific config files

**DON'T:**
- ✗ Commit MCP config to git
- ✗ Share config files
- ✗ Use same API key across all projects (create separate keys)

---

### File Permissions

**Recommended permissions for config files:**

```bash
# Claude Desktop config
chmod 600 ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Project .mcp.json
chmod 600 .mcp.json
```

**This ensures:**
- Only you can read/write the file
- Other users cannot access your API key

---

### .gitignore

**Ensure `.mcp.json` is gitignored:**

```bash
# Add to .gitignore
echo ".mcp.json" >> .gitignore

# Verify
cat .gitignore | grep mcp
```

**If you want to commit an MCP template:**

Create `.mcp.json.example`:
```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "YOUR_KEY_HERE"
      }
    }
  }
}
```

**Users can copy and fill in:**
```bash
cp .mcp.json.example .mcp.json
# Edit .mcp.json with real API key
```

---

## Troubleshooting

### "LINEAR_API_KEY not found"

**Problem:** MCP server cannot find API key

**Solutions:**
1. Check `env` section in MCP config
2. Verify API key format (starts with `lin_api_`)
3. Ensure no extra spaces or quotes
4. Restart Claude Desktop/CLI after config changes

---

### "Cannot find module '@linear/mcp-server-linear'"

**Problem:** NPM package not available

**Solutions:**
1. Check internet connection
2. Verify `npx` works: `npx --version`
3. Try installing manually:
   ```bash
   npm install -g @linear/mcp-server-linear
   ```
4. Use full path in config:
   ```json
   {
     "command": "/usr/local/bin/npx",
     "args": ["-y", "@linear/mcp-server-linear"]
   }
   ```

---

### "API authentication failed"

**Problem:** Invalid or revoked API key

**Solutions:**
1. Verify key at [linear.app/settings/api](https://linear.app/settings/api)
2. Check key hasn't been deleted
3. Create new key if needed
4. Update MCP config with new key
5. Restart Claude

---

### "MCP server crashed"

**Problem:** Server exits unexpectedly

**Solutions:**
1. Check Claude logs:
   - **macOS:** `~/Library/Logs/Claude/`
   - **Linux:** `~/.config/Claude/logs/`

2. Test MCP server directly:
   ```bash
   export LINEAR_API_KEY="your_key"
   npx -y @linear/mcp-server-linear
   ```

3. Check Node.js version: `node --version` (need 16+)

4. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

---

### Claude Doesn't See Linear Tools

**Problem:** Claude says "I don't have access to Linear"

**Solutions:**
1. **Verify config file location:**
   - Claude Code: `.mcp.json` in project root
   - Claude Desktop: `claude_desktop_config.json` in app data

2. **Check JSON syntax:**
   ```bash
   # Validate JSON
   cat .mcp.json | python -m json.tool
   ```

3. **Restart Claude completely:**
   - Quit application (not just close window)
   - Reopen

4. **Check config is loaded:**
   - Ask Claude: "What MCP servers do you have?"
   - Should list "linear"

---

## Advanced Configuration

### Using Environment Variables

Instead of hardcoding API key in config:

**1. Set environment variable:**

```bash
# Add to ~/.bashrc or ~/.zshrc
export LINEAR_API_KEY="lin_api_YOUR_KEY_HERE"
```

**2. Reference in MCP config:**

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}"
      }
    }
  }
}
```

**Note:** Environment variable expansion depends on your shell and Claude version.

---

### Multiple Workspaces

**To configure multiple Linear workspaces:**

```json
{
  "mcpServers": {
    "linear-work": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "lin_api_WORK_KEY"
      }
    },
    "linear-personal": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "lin_api_PERSONAL_KEY"
      }
    }
  }
}
```

**Claude can then access both:**
```
Get my work issues from linear-work
Get my personal issues from linear-personal
```

---

### Custom MCP Server Port

If you have port conflicts:

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "YOUR_KEY",
        "PORT": "3001"
      }
    }
  }
}
```

---

## MCP vs GitHub Actions

**These are different but complementary:**

**MCP Server:**
- Runs locally on your machine
- Allows Claude to interact with Linear directly
- Used during development and planning
- No GitHub required

**GitHub Actions Workflow:**
- Runs in GitHub cloud
- Updates Linear based on git events (commits, PRs)
- Automatic status updates
- Requires GitHub repository

**Typical flow:**
1. **Planning:** Claude uses MCP to fetch issue DEV-123
2. **Development:** You work on the code
3. **Commit:** Push code, GitHub Actions updates Linear
4. **Review:** Claude uses MCP to add comments, update status

Both are part of the complete workflow!

---

## Getting Help

**MCP Documentation:**
- [MCP Specification](https://modelcontextprotocol.io/)
- [Linear MCP Server](https://www.npmjs.com/package/@linear/mcp-server-linear)

**Claude Support:**
- [Claude Code docs](https://docs.claude.com/code)
- [Claude Desktop docs](https://docs.claude.com/desktop)

**Integration Issues:**
- [Troubleshooting guide](./troubleshooting.md)
- [Open an issue](https://github.com/ronanathebanana/claude-linear-gh-starter/issues)

---

## Next Steps

With MCP configured:

1. ✓ Prerequisites verified
2. ✓ Linear API key created
3. ✓ GitHub repository configured
4. ✓ MCP server configured
5. → **Next:** Run the setup wizard!

---

**Ready to install?** → Return to main README for setup wizard instructions
