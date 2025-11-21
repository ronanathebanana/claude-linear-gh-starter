# Auto-Assignment Feature

Automatically assign Linear issues to team members when status changes occur, ensuring the right people are notified at the right time.

## Overview

The auto-assignment feature allows you to configure automatic issue assignment based on status transitions:

**Example workflow:**
1. Developer pushes code → Issue moves to "In Progress" → Stays assigned to developer
2. PR merged to main → Issue moves to "In Review" → Auto-assigns to code reviewer
3. Merged to staging → Issue moves to "QA" → Auto-assigns to QA engineer
4. Deployed → Issue moves to "Done" → Keeps current assignee

## Benefits

**For Code Reviews:**
- Automatically notify reviewers when code is ready
- No manual assignment needed
- Reviewers see issues appear in their inbox

**For QA:**
- QA team knows immediately when features are ready for testing
- Automatic handoff from development to testing
- Clear ownership at each stage

**For Team Coordination:**
- Ensures nothing falls through the cracks
- Clear responsibility at each stage
- Automatic notifications via Linear

---

## Configuration

### During Setup Wizard

The wizard will ask if you want to enable auto-assignment:

```
🎯 Auto-Assignment Configuration

Would you like to automatically assign issues to team members when status changes?

Enable auto-assignment? (Y/n):
```

**If yes, you'll configure:**
1. Team members are fetched from Linear
2. Choose assignee for each status transition
3. Decide whether to preserve existing assignees

---

### Configuration Format

In `.linear-workflow.json`:

```json
{
  "assignees": {
    "enabled": true,
    "onInProgress": "user-uuid-1",
    "onReview": "user-uuid-2",
    "onStaging": "user-uuid-3",
    "onDone": null,
    "preserveOriginal": true
  }
}
```

**Fields:**
- `enabled`: Turn auto-assignment on/off
- `onInProgress`: User ID to assign when status → "In Progress"
- `onReview`: User ID to assign when status → "In Review"
- `onStaging`: User ID to assign when status → "Staging/QA"
- `onDone`: User ID to assign when status → "Done"
- `preserveOriginal`: If true, don't reassign if already has assignee

---

## How It Works

### Status Change Flow

**When GitHub Actions workflow detects a status change:**

1. Check if auto-assignment is enabled
2. Look up configured assignee for new status
3. If `preserveOriginal` is true:
   - Check if issue already has assignee
   - If yes, skip reassignment
   - If no, assign configured user
4. If `preserveOriginal` is false:
   - Always assign configured user
5. Update issue via Linear API

### Linear API Call

```graphql
mutation UpdateIssue($id: String!, $assigneeId: String!) {
  issueUpdate(
    id: $id,
    input: { assigneeId: $assigneeId }
  ) {
    success
    issue {
      id
      assignee {
        name
      }
    }
  }
}
```

---

## Use Cases

### Use Case 1: Code Review Process

**Configuration:**
```json
{
  "assignees": {
    "enabled": true,
    "onReview": "alice-uuid",  // Alice is code reviewer
    "preserveOriginal": false
  }
}
```

**Flow:**
1. Bob creates PR for issue DEV-123
2. PR merged to main
3. Status → "In Review"
4. **Auto-assigns to Alice**
5. Alice gets Linear notification
6. Alice reviews and approves

---

### Use Case 2: QA Handoff

**Configuration:**
```json
{
  "assignees": {
    "enabled": true,
    "onStaging": "carol-uuid",  // Carol is QA lead
    "preserveOriginal": false
  }
}
```

**Flow:**
1. Feature complete in main branch
2. Merged to staging
3. Status → "QA"
4. **Auto-assigns to Carol**
5. Carol gets notification
6. Carol tests feature

---

### Use Case 3: Preserve Original Developer

**Configuration:**
```json
{
  "assignees": {
    "enabled": true,
    "onReview": "tech-lead-uuid",
    "onStaging": "qa-lead-uuid",
    "preserveOriginal": true  // Keep original if assigned
  }
}
```

**Scenario 1: Issue already assigned to Bob**
- Status → "In Review"
- Issue already assigned to Bob
- **Keeps Bob** (preserves original)

**Scenario 2: Issue unassigned**
- Status → "In Review"
- No current assignee
- **Assigns to tech lead**

---

## Common Configurations

### Small Team (Rotating Reviewers)

```json
{
  "assignees": {
    "enabled": true,
    "onReview": "team-lead-uuid",
    "preserveOriginal": true
  }
}
```

**Behavior:**
- If developer already assigned issue to specific reviewer → keeps that reviewer
- If no reviewer assigned → assigns to team lead who can delegate

---

### Dedicated QA Team

```json
{
  "assignees": {
    "enabled": true,
    "onStaging": "qa-team-lead-uuid",
    "preserveOriginal": false
  }
}
```

**Behavior:**
- All QA work goes to QA team lead
- Team lead distributes among QA team

---

### Enterprise with Multiple Stages

```json
{
  "assignees": {
    "enabled": true,
    "onReview": "code-reviewer-uuid",
    "onStaging": "qa-engineer-uuid",
    "onDone": "product-manager-uuid",
    "preserveOriginal": false
  }
}
```

**Behavior:**
- Clear handoff at each stage
- Always reassigns (doesn't preserve)
- Product manager gets notified when complete

---

## Getting Team Member IDs

### Option 1: During Setup Wizard

The wizard fetches and displays team members automatically.

### Option 2: Using linear-helpers Script

```bash
# Set your Linear API key
export LINEAR_API_KEY="lin_api_your_key_here"

# List all team members
node install/scripts/linear-helpers.js team-members YOUR_TEAM_ID

# Find specific user by email
node install/scripts/linear-helpers.js find-user alice@company.com
```

**Output:**
```
User Found:
  Name: Jane Bloggs
  Email: alice@company.com
  ID: abc-123-user-uuid  ← Use this ID
  Active: true
  Admin: false
```

### Option 3: Via Linear GraphQL API

```graphql
query {
  team(id: "your-team-id") {
    members {
      nodes {
        id
        name
        email
      }
    }
  }
}
```

---

## Updating Configuration

### Enable Auto-Assignment After Installation

**1. Get team member IDs:**
```bash
export LINEAR_API_KEY="your_key"
node install/scripts/linear-helpers.js team-members TEAM_ID
```

**2. Edit `.linear-workflow.json`:**
```json
{
  ...existing config...,
  "assignees": {
    "enabled": true,
    "onReview": "alice-user-uuid",
    "onStaging": "carol-user-uuid",
    "preserveOriginal": true
  }
}
```

**3. Re-render the GitHub workflow:**
```bash
node install/scripts/apply-config.js apply \
  install/templates/workflow/github-workflow.yml.template \
  .github/workflows/linear-status-update.yml \
  .linear-workflow.json
```

**4. Commit and push:**
```bash
git add .linear-workflow.json .github/workflows/linear-status-update.yml
git commit -m "feat: enable auto-assignment for code reviews"
git push
```

---

### Disable Auto-Assignment

**Set `enabled: false` in config:**
```json
{
  "assignees": {
    "enabled": false
  }
}
```

Then re-render the workflow (step 3 above).

---

### Change Assignees

Just update the user IDs in config and re-render:

```json
{
  "assignees": {
    "enabled": true,
    "onReview": "new-reviewer-uuid",  // Changed reviewer
    "preserveOriginal": true
  }
}
```

---

## Troubleshooting

### Issue Not Getting Assigned

**Check:**
1. Auto-assignment is enabled in config
2. Assignee ID is correct (run `linear-helpers.js find-user`)
3. User is active in Linear workspace
4. Workflow has LINEAR_API_KEY secret set
5. Check workflow logs: `gh run view --log`

### Wrong Person Getting Assigned

**Check:**
1. Verify user ID in config matches intended person
2. Run: `LINEAR_API_KEY=key node install/scripts/linear-helpers.js team-members TEAM_ID`
3. Confirm IDs match

### User Gets Unassigned

**Cause:** Status change with no configured assignee

**Solution:**
- Set assignee for that status
- Or set `preserveOriginal: true` to keep current assignee

### Assignment Keeps Getting Overwritten

**Cause:** `preserveOriginal: false`

**Solution:** Set `preserveOriginal: true` in config

---

## Best Practices

### 1. Use Preserve Original for Flexibility

```json
{
  "preserveOriginal": true
}
```

This allows developers to manually assign reviewers while still providing automatic assignment for unassigned issues.

### 2. Assign Key Roles Only

Don't assign for every status - focus on critical handoffs:
- Code review
- QA testing
- Final approval

### 3. Use Team Leads as Default

Assign to team leads who can delegate:
```json
{
  "onReview": "tech-lead-uuid",  // Tech lead delegates
  "onStaging": "qa-lead-uuid"    // QA lead distributes
}
```

### 4. Document Your Workflow

Add a comment in your config explaining who each UUID represents:
```json
{
  "assignees": {
    "enabled": true,
    // Jane Bloggs - Primary code reviewer
    "onReview": "abc-123-uuid",
    // Sarah Bloggs - QA Lead
    "onStaging": "def-456-uuid"
  }
}
```

### 5. Test Configuration

After setting up, test with a real issue:
1. Create test issue
2. Push code
3. Verify auto-assignment works
4. Check Linear notifications

---

## Advanced: Multiple Reviewers

Linear API supports only one assignee, but you can work around this:

### Option 1: Use Linear Subscribers

```graphql
mutation AddSubscriber($issueId: String!, $userId: String!) {
  issueAddSubscriber(
    id: $issueId,
    subscriberId: $userId
  ) {
    success
  }
}
```

Subscribers get notifications without being assigned.

### Option 2: Rotate Assignees

Keep a list and rotate:
```json
{
  "assignees": {
    "onReview": "reviewer-1-uuid"  // Change weekly
  }
}
```

Update config periodically.

### Option 3: Use Team Mention in Comments

Instead of assigning, add comment:
```
@dev-team This is ready for review
```

---

## FAQ

**Q: Can I assign to multiple people?**
A: Linear supports one assignee per issue. Use subscribers or team mentions for additional notifications.

**Q: What if the user leaves the team?**
A: Update the config with new user ID and re-deploy workflow.

**Q: Can I assign based on labels or other criteria?**
A: Not currently. Assignment is based solely on status changes. You can manually assign based on other criteria.

**Q: Does this work with Linear's triage feature?**
A: Yes, auto-assignment works alongside Linear's triage. If issue is in triage and gets assigned, triage status is cleared.

**Q: Can different issues have different assignment rules?**
A: No, rules are global for the team. All issues follow the same assignment configuration.

---

## Related Documentation

- [Linear Setup Guide](./linear-setup.md)
- [Troubleshooting](./troubleshooting.md)
- [Linear API Docs](https://developers.linear.app)

---

**Need help?** [Open an issue](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)
