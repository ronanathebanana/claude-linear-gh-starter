# Linear Setup Guide

This guide walks you through setting up Linear for the workflow integration, including creating an API key, understanding team structure, and configuring workflow states.

## Overview

The Linear workflow integration requires:
1. **Linear API Key** - For authenticating with Linear's API
2. **Team Configuration** - Select which team to track
3. **Workflow States** - Map Linear issue states to GitHub events

---

## Step 1: Access Linear Workspace

### 1.1 Log into Linear

Visit [linear.app](https://linear.app) and log in to your workspace.

**Verify you have access:**
- Can view issues in your workspace
- Are a member of at least one team
- Can access workspace settings

**If you don't have access:**
- Request invitation from workspace admin
- Or create a new workspace: [linear.app/onboarding](https://linear.app/onboarding)

---

### 1.2 Verify Team Membership

**Check your teams:**
1. Click your workspace name (top left)
2. Select **Settings → Teams**
3. Verify you're a member of at least one team

**Team Permissions Needed:**
- ✓ View issues
- ✓ Edit issues
- ✓ Update issue status

**Note:** You don't need admin permissions for teams, just regular membership.

---

## Step 2: Create Linear API Key

### 2.1 Navigate to API Settings

1. Click your profile picture (top right)
2. Select **Settings** from dropdown
3. In the left sidebar, click **API**
4. Or visit directly: [linear.app/settings/api](https://linear.app/settings/api)

---

### 2.2 Create New API Key

**Click "Create new API key"**

**Fill in the details:**

**Label:**
```
GitHub Workflow Integration
```

**Description (optional):**
```
API key for Linear + GitHub workflow automation.
Used to update issue statuses based on GitHub events.
```

**Permissions:**
The API key inherits your user permissions automatically. No additional configuration needed.

**Click "Create"**

---

### 2.3 Copy API Key

**⚠️ IMPORTANT:** You'll only see the API key once!

**The key format looks like:**
```
lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Copy the key immediately:**
- Click the **Copy** button
- Or manually select and copy the entire key

**Store securely:**
- Paste into a password manager
- Or save to a secure note
- Do NOT commit to git
- Do NOT share publicly

**If you lose the key:**
You'll need to delete it and create a new one. The old key cannot be recovered.

---

## Step 3: Test API Key (Optional)

Verify your API key works before continuing with setup.

### Using curl:

```bash
export LINEAR_API_KEY="lin_api_YOUR_KEY_HERE"

curl https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query": "{ viewer { id name email } }"}'
```

**Expected response:**
```json
{
  "data": {
    "viewer": {
      "id": "abc-123",
      "name": "Your Name",
      "email": "you@example.com"
    }
  }
}
```

**If you get an error:**
- Check the API key is copied correctly
- Ensure no extra spaces or characters
- Verify you're using the full key (starts with `lin_api_`)

---

## Step 4: Understand Team Structure

### 4.1 Team Keys

Each Linear team has a unique key (e.g., `DEV`, `ENG`, `PROD`).

**Find your team keys:**
1. Go to **Settings → Teams**
2. Each team shows its key next to the name

**Example:**
```
DEV - Development Team
ENG - Engineering
PROD - Product Team
```

**Team key is used in issue IDs:**
```
DEV-123  ← "DEV" is the team key
ENG-456  ← "ENG" is the team key
```

---

### 4.2 Multiple Teams

**If your workspace has multiple teams:**

During setup, you'll choose **one team** to configure for the workflow.

**Choose the team where:**
- Most active development happens
- You want automatic status updates
- You track feature work

**Note:** You can run setup multiple times for different teams, or manually configure multiple teams in the workflow file.

---

## Step 5: Workflow States

### 5.1 Understanding States

Linear issues move through workflow states (also called "statuses").

**Common state examples:**
- Todo / Backlog
- In Progress / In Development
- In Review / Review Required
- QA / Testing
- Done / Completed
- Canceled / Won't Do

**View your team's states:**
1. Go to **Settings → Teams → [Your Team]**
2. Click **Workflow** tab
3. You'll see all states for that team

---

### 5.2 State Types

Linear states have types:

- **Unstarted** - Work hasn't begun (e.g., "Todo", "Backlog")
- **Started** - Active work (e.g., "In Progress", "In Review")
- **Completed** - Work finished (e.g., "Done", "Shipped")
- **Canceled** - Work abandoned (e.g., "Canceled", "Won't Do")

**The workflow integration uses these states to track issue progress.**

---

### 5.3 Recommended State Mapping

During setup, you'll map GitHub events to Linear states:

**Recommended mapping for standard workflows:**

| GitHub Event | Recommended Linear State |
|-------------|-------------------------|
| Push to feature branch | "In Progress" (or "In Development") |
| PR merged to `main` | "Review Required" (or "QA", "Testing") |
| PR merged to `prod` | "Done" (or "Completed", "Shipped") |

**Customize based on your workflow:**

**For startups/small teams:**
```
Push to branch → In Progress
Merged to main → Done
```

**For enterprise with staging:**
```
Push to branch → In Progress
Merged to main → Review Required
Merged to staging → QA
Merged to prod → Done
```

---

## Step 6: Prepare for Setup

### 6.1 Information Checklist

Have this information ready before running the setup wizard:

- [ ] **Linear API Key** (copied to clipboard or saved securely)
- [ ] **Workspace Name** (e.g., "Acme Inc")
- [ ] **Team to Configure** (e.g., "Development")
- [ ] **Team Key** (e.g., "DEV")
- [ ] **Workflow States Available** (list of status names)
- [ ] **Desired State Mapping** (which states for which events)

---

### 6.2 Example Configuration

Here's a complete example for reference:

```
Workspace: Acme Inc
Team: Development (DEV)

Workflow States:
- Todo
- In Progress
- In Review
- Review Required
- QA
- Done
- Canceled

Desired Mapping:
- Push to feature branch → "In Progress"
- Merge to main → "Review Required"
- Merge to production → "Done"

Issue ID Format: DEV-123, DEV-456, etc.
Pattern: DEV-\d+
```

---

## Step 7: Common Linear Configurations

### For Agile/Scrum Teams

**Typical states:**
- Backlog
- Sprint Planning
- In Development
- In Review
- QA
- Done
- Blocked

**Recommended mapping:**
```
Push → In Development
PR merged → In Review
Deployed → Done
```

---

### For Kanban Teams

**Typical states:**
- Todo
- In Progress
- In Review
- Done

**Recommended mapping:**
```
Push → In Progress
PR merged to main → In Review
PR merged to prod → Done
```

---

### For Enterprise Teams

**Typical states:**
- Backlog
- In Development
- Code Review
- QA
- Staging
- Production
- Done

**Recommended mapping:**
```
Push → In Development
Merged to main → Code Review
Merged to staging → QA
Deployed to prod → Done
```

---

## Troubleshooting

### Cannot Access API Settings

**Problem:** Don't see "API" in settings sidebar

**Solutions:**
- Ensure you're logged in
- Check you have API access (all plans include API access)
- Try direct URL: [linear.app/settings/api](https://linear.app/settings/api)
- Contact workspace admin if still unavailable

---

### API Key Not Working

**Problem:** API key returns authentication error

**Solutions:**
1. **Check the key format:**
   - Must start with `lin_api_`
   - Should be ~40-50 characters
   - No spaces or line breaks

2. **Verify key is active:**
   - Go to Settings → API
   - Check key is listed (not deleted)
   - If missing, create new key

3. **Test with curl:**
   ```bash
   curl https://api.linear.app/graphql \
     -H "Authorization: YOUR_KEY" \
     -d '{"query":"{ viewer { id } }"}'
   ```

---

### Cannot Find Team States

**Problem:** Team doesn't have workflow states configured

**Solutions:**
1. Go to **Settings → Teams → [Your Team] → Workflow**
2. If empty, click **"Use template"** to set up default states
3. Or manually create states:
   - Click **"Add state"**
   - Name it (e.g., "In Progress")
   - Choose type (e.g., "Started")
   - Save

---

### Multiple Workspaces

**Problem:** Member of multiple Linear workspaces

**Solution:**
- Choose the workspace where you want the integration
- Ensure you're in the correct workspace when creating API key
- API key only works for the workspace where it was created
- To integrate multiple workspaces, create separate API keys

---

## Security Best Practices

### Protect Your API Key

**DO:**
- ✓ Store in password manager
- ✓ Use GitHub Secrets for workflows
- ✓ Use environment variables locally (`.env` files in `.gitignore`)
- ✓ Rotate keys periodically
- ✓ Delete unused keys

**DON'T:**
- ✗ Commit to git
- ✗ Share in Slack/email/chat
- ✗ Hardcode in source code
- ✗ Store in plain text files
- ✗ Reuse across multiple projects (create separate keys)

---

### Key Rotation

**Recommended schedule:** Rotate API keys every 6-12 months

**How to rotate:**
1. Create new API key in Linear
2. Update GitHub secret: `gh secret set LINEAR_API_KEY`
3. Test workflow works with new key
4. Delete old key from Linear settings
5. Update any local `.env` files

---

## API Rate Limits

Linear API has rate limits to ensure service stability.

**Current limits (as of 2024):**
- **120 requests per minute** per API key
- **2000 requests per hour** per API key

**The workflow integration typically uses:**
- 1-3 requests per commit/PR (well within limits)
- Minimal impact on your API quota

**If you hit rate limits:**
- Workflow will retry with exponential backoff
- Check for misconfigured webhooks or loops
- Contact Linear support if limits are insufficient

---

## Getting Help

**Linear Support:**
- Documentation: [developers.linear.app](https://developers.linear.app)
- API Reference: [linear.app/docs/graphql](https://linear.app/docs/graphql)
- Support: [linear.app/contact](https://linear.app/contact)

**Integration Issues:**
- Troubleshooting guide: [docs/troubleshooting.md](./troubleshooting.md)
- Open issue: [github.com/ronanathebanana/claude-linear-gh-starter/issues](https://github.com/ronanathebanana/claude-linear-gh-starter/issues)

---

## Next Steps

With your Linear API key ready, proceed to:

1. ✓ Prerequisites verified
2. ✓ Linear API key created
3. → **Next:** [GitHub Setup Guide](./github-setup.md)
4. → **Then:** Run the setup wizard

---

**Ready to continue?** → [GitHub Setup Guide](./github-setup.md)
