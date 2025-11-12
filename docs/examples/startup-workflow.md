# Startup Workflow Example

This example shows a simple Linear workflow configuration suitable for startups and small teams with a straightforward development process.

## Team Profile

**Team Size:** 2-10 developers
**Complexity:** Low
**Deployment:** Continuous deployment to production
**Review Process:** Informal, async code review

---

## Branch Strategy

### Simple (Main Only)

```
main ──────────────────────────────────────>
       ↑           ↑          ↑
    feature/   feature/   feature/
    login      dashboard  api
```

**Branches:**
- `main` - Production branch, always deployable
- `feature/*` - Feature branches for all work

**No staging or QA branches** - Deploy directly to production from `main`.

---

## Linear Configuration

### Workflow States

```
┌─────────┐     ┌────────────┐     ┌──────┐
│  Todo   │ --> │ In Progress│ --> │ Done │
└─────────┘     └────────────┘     └──────┘
```

**Three simple states:**
1. **Todo** - Work not started
2. **In Progress** - Actively being worked on
3. **Done** - Completed and deployed

### Status Mappings

| Git Event | Linear Status |
|-----------|---------------|
| Push to feature branch | In Progress |
| PR merged to `main` | Done |

---

## Example Configuration

### .linear-workflow.json

```json
{
  "version": "1.0.0",
  "project": {
    "name": "startup-app",
    "path": "/Users/dev/projects/startup-app"
  },
  "branches": {
    "main": "main"
  },
  "linear": {
    "teamKey": "TEAM",
    "teamId": "abc-123-uuid",
    "teamName": "Product Team",
    "workspaceId": "xyz-456-uuid",
    "workspaceName": "Startup Inc",
    "statuses": {
      "inProgress": "In Progress",
      "inProgressId": "state-uuid-1",
      "review": "Done",
      "reviewId": "state-uuid-2",
      "done": "Done",
      "doneId": "state-uuid-2"
    }
  },
  "formats": {
    "commit": "conventional-parens",
    "pr": "issue-prefix",
    "issuePattern": "[A-Z]+-\\d+",
    "issueExample": "TEAM-123"
  },
  "detail": "technical",
  "paths": {
    "issues": "/docs/issues/",
    "workflow": "/.github/workflows/linear-status-update.yml"
  },
  "installed": "2025-01-11T10:00:00Z"
}
```

---

## Typical Development Flow

### Starting Work

**1. Pick an issue from Linear:**
```
TEAM-42: Add user authentication
Status: Todo
```

**2. Tell Claude:**
```
Start work on TEAM-42
```

**3. Claude creates feature branch:**
```bash
git checkout -b feature/team-42-user-authentication
```

**4. Linear issue updates automatically:**
```
TEAM-42: Add user authentication
Status: In Progress ← Updated automatically
```

---

### Working on the Feature

**5. Make changes and commit:**
```bash
git add src/auth/
git commit -m "feat: implement OAuth login (TEAM-42)"
```

**6. Push to GitHub:**
```bash
git push origin feature/team-42-user-authentication
```

**7. Linear stays "In Progress"** - Multiple commits don't change status

---

### Shipping to Production

**8. Create PR:**
```bash
gh pr create --title "TEAM-42: Add user authentication" \
  --body "Implements OAuth login with Google and GitHub providers"
```

**9. Get informal review:**
- Team member reviews PR
- Approves changes

**10. Merge to main:**
```bash
gh pr merge --squash
```

**11. Linear automatically updates:**
```
TEAM-42: Add user authentication
Status: Done ← Updated when merged
```

**12. Automatic deployment:**
- CI/CD deploys `main` to production
- Feature goes live

---

## Commit Message Format

### Conventional Commits with Issue ID

```
<type>: <description> (TEAM-123)

Examples:
feat: add OAuth login (TEAM-42)
fix: resolve login redirect loop (TEAM-43)
docs: update README with auth instructions (TEAM-42)
refactor: simplify auth logic (TEAM-42)
```

---

## PR Title Format

### Issue ID Prefix

```
TEAM-123: Description

Examples:
TEAM-42: Add user authentication
TEAM-43: Fix login redirect bug
TEAM-44: Update dashboard with new metrics
```

---

## Advantages

**For Startups:**
- ✅ Simple to understand
- ✅ Fast to ship features
- ✅ Minimal overhead
- ✅ No complex branching
- ✅ Direct feedback loop

**Tradeoffs:**
- ⚠️ No staging environment
- ⚠️ Less formal review process
- ⚠️ Main branch === production

---

## When to Use

**This workflow works well when:**
- Team is small (< 10 people)
- Everyone reviews code informally
- You're okay with shipping directly to production
- Features are small and independent
- You have good test coverage
- Rollbacks are easy

**Consider upgrading when:**
- Team grows beyond 10 people
- Need formal QA process
- Want staging environment
- Regulatory requirements for testing
- Multiple teams working on same codebase

---

## Setup Wizard Answers

When running the setup wizard, choose:

**Branch Strategy:**
```
1. Simple (main only) ←
2. Standard (main + staging)
3. Enterprise (main + staging + prod)
```

**Linear Statuses:**
```
Active development: In Progress
Merged to main: Done
```

**Commit Format:**
```
1. <type>: <description> (ISSUE-123) ← [Recommended]
2. ISSUE-123: <description>
3. <type>(ISSUE-123): <description>
```

**PR Title Format:**
```
1. ISSUE-123: Description ← [Recommended]
2. [ISSUE-123] Description
```

**Detail Level:**
```
1. High-level (Stakeholder view)
2. Technical (Developer view) ← [Recommended for startups]
3. Minimal (Status updates only)
```

---

## Example Issue Lifecycle

### TEAM-42: Add User Authentication

**Day 1 - Morning:**
```
Status: Todo
Assignee: Sarah
Priority: High
```

**Day 1 - 10:00 AM:**
```
Sarah: "Start work on TEAM-42"
Claude: Creates branch, posts task analysis to Linear
Status: In Progress ← Automatic update
```

**Day 1 - Afternoon:**
```
Sarah commits:
- "feat: add OAuth providers (TEAM-42)"
- "feat: implement login flow (TEAM-42)"
- "test: add auth tests (TEAM-42)"

Status: Still "In Progress" ← No change on additional commits
```

**Day 2 - Morning:**
```
Sarah: "Create PR for TEAM-42"
Claude: Creates PR, adds summary to Linear
PR: TEAM-42: Add user authentication
Status: Still "In Progress"
```

**Day 2 - Afternoon:**
```
Alex reviews and approves PR
Sarah merges to main
Status: Done ← Automatic update
CI/CD deploys to production
Feature is live!
```

---

## Real-World Example

**Acme Startup - Product Team**

**Team:**
- 5 developers
- 1 designer (occasional code contributions)
- 1 founder (reviews PRs)

**Process:**
1. Weekly planning: Create issues in Linear
2. Developers pick issues and start work
3. Work in feature branches
4. Create PRs when done
5. Quick review (< 24 hours)
6. Merge and deploy
7. Monitor in production

**Results:**
- Ship features daily
- Linear always up-to-date
- Low overhead
- Fast feedback

---

## Tips for Success

### Keep It Simple

- Don't overcomplicate branching
- Ship small features frequently
- Trust your tests
- Use feature flags for risky changes

### Communication

- Use Linear comments for context
- Tag teammates in PR reviews
- Keep PRs focused and small
- Write clear commit messages

### Monitoring

- Watch production after deploys
- Have rollback procedure ready
- Monitor error tracking
- Quick hotfix process

---

## Migration Path

### Outgrew Simple Workflow?

**Switch to Standard Workflow when:**
- Need QA/testing phase
- Want to batch releases
- Require more formal process
- Multiple teams coordinating

**Migration is easy:**
1. Create `staging` branch
2. Update workflow configuration
3. Add new status mapping for staging
4. Continue working as before

See: [Standard Workflow Example](./standard-workflow.md)

---

## Related Resources

- [Standard Workflow](./standard-workflow.md) - For growing teams
- [Enterprise Workflow](./enterprise-workflow.md) - For large organizations
- [Troubleshooting Guide](../troubleshooting.md)
- [GitHub Setup Guide](../github-setup.md)

---

**Ready to set up?** → Return to main [README](../../README.md)
