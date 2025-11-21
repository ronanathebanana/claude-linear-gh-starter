# Standard Workflow Example

This example shows a standard Linear workflow configuration suitable for growing teams with a QA/staging phase before production deployment.

## Team Profile

**Team Size:** 10-50 developers
**Complexity:** Medium
**Deployment:** Staged releases (dev → staging → production)
**Review Process:** Formal code review + QA testing

---

## Branch Strategy

### Standard (Main + Staging)

```
main ────────┬──────────────┬─────────────────>
             │              │
             └──> staging ──┴─────────────────>
                     ↑
                  feature/
                  branches
```

**Branches:**
- `main` - Development branch, latest code
- `staging` - QA/testing branch, release candidates
- `feature/*` - Feature branches for all work

**Flow:**
1. Develop in feature branches
2. Merge to `main` for code review
3. Promote to `staging` for QA
4. Deploy `staging` to production

---

## Linear Configuration

### Workflow States

```
┌─────────┐   ┌────────────┐   ┌────────────────┐   ┌────┐   ┌──────┐
│  Todo   │-->│ In Progress│-->│ Review Required│-->│ QA │-->│ Done │
└─────────┘   └────────────┘   └────────────────┘   └────┘   └──────┘
```

**Five states:**
1. **Todo** - Backlog, not started
2. **In Progress** - Active development
3. **Review Required** - Code review needed
4. **QA** - Testing in staging
5. **Done** - Deployed to production

### Status Mappings

| Git Event | Linear Status |
|-----------|---------------|
| Push to feature branch | In Progress |
| PR merged to `main` | Review Required |
| Merged to `staging` | QA |
| Deployed to production | Done |

---

## Example Configuration

### .linear-workflow.json

```json
{
  "version": "1.0.0",
  "project": {
    "name": "company-app",
    "path": "/Users/dev/projects/company-app"
  },
  "branches": {
    "main": "main",
    "staging": "staging"
  },
  "linear": {
    "teamKey": "ENG",
    "teamId": "abc-123-uuid",
    "teamName": "Engineering",
    "workspaceId": "xyz-456-uuid",
    "workspaceName": "Acme Company",
    "statuses": {
      "inProgress": "In Progress",
      "inProgressId": "state-uuid-1",
      "review": "Review Required",
      "reviewId": "state-uuid-2",
      "done": "QA",
      "doneId": "state-uuid-3"
    }
  },
  "formats": {
    "commit": "conventional-parens",
    "pr": "issue-prefix",
    "issuePattern": "[A-Z]+-\\d+",
    "issueExample": "ENG-123"
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

### Phase 1: Development

**1. Pick an issue from sprint:**
```
ENG-256: Implement payment processing
Status: Todo
Sprint: Q1 Sprint 3
```

**2. Tell Claude:**
```
Start work on ENG-256
```

**3. Implement feature:**
```bash
# Work on feature branch
git checkout -b feature/eng-256-payment-processing

# Make changes
git add src/payments/
git commit -m "feat: add Stripe integration (ENG-256)"
git commit -m "feat: implement payment webhook (ENG-256)"
git commit -m "test: add payment tests (ENG-256)"

# Push
git push origin feature/eng-256-payment-processing
```

**4. Linear updates:**
```
Status: In Progress ← Automatic on first push
```

---

### Phase 2: Code Review

**5. Create PR to main:**
```bash
gh pr create --base main \
  --title "ENG-256: Implement payment processing" \
  --body "Adds Stripe integration with webhook handling"
```

**6. Code review:**
- Request reviews from 2 team members
- Address feedback
- Push additional commits
- Get approvals

**7. Merge to main:**
```bash
gh pr merge --squash
```

**8. Linear updates:**
```
Status: Review Required ← Automatic when merged to main
```

---

### Phase 3: QA Testing

**9. Promote to staging:**
```bash
git checkout staging
git merge main
git push origin staging
```

**10. Linear updates:**
```
Status: QA ← Automatic when pushed to staging
```

**11. QA team tests on staging:**
- Functional testing
- Regression testing
- Performance testing
- Security review

**12. QA feedback:**
```
If bugs found:
- Create new issues (ENG-257, ENG-258)
- Fix in feature branches
- Merge back through main → staging

If approved:
- Ready for production
```

---

### Phase 4: Production Deploy

**13. Deploy staging to production:**
```bash
# Via deployment pipeline
# Automated or manual depending on setup
```

**14. Manually update Linear (or use custom webhook):**
```
Status: Done ← When confirmed in production
```

---

## Commit Message Format

### Conventional Commits

```
<type>(<scope>): <description> (ENG-123)

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructure
- test: Tests
- chore: Maintenance

Examples:
feat(payments): add Stripe integration (ENG-256)
fix(auth): resolve token expiration bug (ENG-257)
test(payments): add webhook tests (ENG-256)
docs(api): document payment endpoints (ENG-256)
```

---

## PR Title and Description Format

### PR Title

```
ENG-123: Clear description of changes

Examples:
ENG-256: Implement payment processing
ENG-257: Fix payment webhook timeout
ENG-258: Add payment error handling
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does

## Related Issue
ENG-256

## Changes
- Added Stripe SDK integration
- Implemented webhook endpoint
- Added payment confirmation flow
- Added tests for payment processing

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manually tested payment flow
- [ ] Tested webhook handling

## Screenshots/Videos
(If UI changes)

## Deployment Notes
- Requires STRIPE_API_KEY environment variable
- Database migration needed: `rake db:migrate`
```

---

## Sprint Planning Integration

### Sprint Structure

**2-week sprints:**

```
Week 1:
Monday: Sprint planning
  - Review backlog
  - Estimate issues
  - Assign to sprint
Tuesday-Friday: Development
  - Work on "Todo" issues
  - Move to "In Progress" automatically
  - PRs go to "Review Required"

Week 2:
Monday-Wednesday: Development continues
  - Finish sprint work
  - Code reviews
Thursday: Cut release to staging
  - Merge all completed work to staging
  - Status → "QA"
Friday: QA testing
  - Test all features on staging
  - Log bugs for next sprint

Monday: Production deploy
  - Deploy staging to prod
  - Status → "Done"
```

---

## Team Roles and Responsibilities

### Developers

**Responsibilities:**
- Pick issues from "Todo"
- Move to "In Progress" (automatic on push)
- Create PRs when complete
- Address code review feedback
- Fix bugs found in QA

### Tech Leads

**Responsibilities:**
- Review PRs
- Approve merges to main
- Coordinate releases
- Manage main/staging branches

### QA Team

**Responsibilities:**
- Test features on staging
- Verify status is "QA"
- Log bugs in Linear
- Sign off on releases

### Product Manager

**Responsibilities:**
- Create and prioritize issues
- Review Linear status
- Coordinate with stakeholders
- Approve production deploys

---

## GitHub Branch Protection

### Recommended Settings

**For `main` branch:**
- ✅ Require pull request before merging
- ✅ Require 2 approvals
- ✅ Require status checks to pass
- ✅ Require conversation resolution
- ✅ Include administrators

**For `staging` branch:**
- ✅ Require pull request before merging
- ✅ Require 1 approval (tech lead)
- ✅ Require status checks to pass

---

## CI/CD Integration

### Automated Testing

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
      - name: Run linter
        run: npm run lint
```

### Automated Deployment

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: ./install/scripts/deploy-staging.sh
```

---

## Advantages

**For Growing Teams:**
- ✅ Formal QA process
- ✅ Staged releases
- ✅ Time for testing
- ✅ Reduced production bugs
- ✅ Clear status visibility
- ✅ Better coordination

**Tradeoffs:**
- ⚠️ Slower to production
- ⚠️ More branch management
- ⚠️ Requires QA resources

---

## When to Use

**This workflow works well when:**
- Team is 10-50 people
- Have dedicated QA resources
- Need testing before production
- Ship releases weekly/bi-weekly
- Multiple teams coordinate work
- Customer-facing application
- Compliance requirements

**Consider upgrading when:**
- Need separate production branch
- Multiple environments (dev/qa/staging/prod)
- Complex release management
- Enterprise compliance needs

---

## Setup Wizard Answers

**Branch Strategy:**
```
1. Simple (main only)
2. Standard (main + staging) ← Choose this
3. Enterprise (main + staging + prod)
```

**Linear Statuses:**
```
Active development: In Progress
Merged to main: Review Required
Merged to staging: QA
```

**Commit Format:**
```
1. <type>: <description> (ISSUE-123) ← [Recommended]
```

**Detail Level:**
```
2. Technical (Developer view) ← [Recommended]
```

---

## Example Sprint Board

### Sprint 12 - Q1

```
┌──────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────┐  ┌──────┐
│    Todo      │  │  In Progress   │  │ Review Required│  │   QA   │  │ Done │
├──────────────┤  ├────────────────┤  ├────────────────┤  ├────────┤  ├──────┤
│ ENG-260      │  │ ENG-256 (Alice)│  │ ENG-253        │  │ ENG-250│  │ ENG-245│
│ ENG-261      │  │ ENG-257 (Bob)  │  │ ENG-254        │  │ ENG-251│  │ ENG-246│
│ ENG-262      │  │ ENG-258 (Carol)│  │ ENG-255        │  │ ENG-252│  │ ENG-247│
│ ENG-263      │  │                │  │                │  │        │  │ ENG-248│
│ ENG-264      │  │                │  │                │  │        │  │ ENG-249│
└──────────────┘  └────────────────┘  └────────────────┘  └────────┘  └──────┘
```

**Workflow moves issues automatically through columns!**

---

## Real-World Example

**TechCorp - Engineering Team**

**Team:**
- 25 developers (3 teams)
- 5 QA engineers
- 2 product managers
- 1 engineering manager

**Process:**
1. Bi-weekly sprints with planning on Mondays
2. Developers work in feature branches
3. Daily standup reviews Linear board
4. PRs require 2 approvals
5. Thursday: Cut release to staging
6. Friday: QA testing on staging
7. Monday: Production deploy if QA passes

**Results:**
- Bi-weekly production releases
- 90% of issues ship on time
- Low production bug rate
- Clear visibility for stakeholders
- Automated status updates save 5 hours/week

---

## Tips for Success

### Code Review Best Practices

- Keep PRs small (< 400 lines)
- Write clear PR descriptions
- Link to Linear issues
- Request specific reviewers
- Address feedback promptly

### QA Coordination

- QA tests as soon as code hits staging
- Use Linear comments for QA feedback
- Tag developers for quick fixes
- Sign off explicitly in Linear

### Release Management

- Maintain release notes
- Coordinate deploys with product
- Have rollback plan ready
- Monitor after deploys

---

## Troubleshooting

### "Status not updating to QA"

**Issue:** Merged to staging but still "Review Required"

**Solution:** Check workflow configuration has staging mapping:
```json
{
  "branches": {
    "staging": "staging"
  }
}
```

### "Too many issues in Review Required"

**Issue:** Bottleneck at code review stage

**Solutions:**
- Add more reviewers
- Set review time expectations (< 24 hours)
- Use CODEOWNERS file
- Split large PRs

### "QA finds issues late"

**Issue:** Bugs found in staging delay release

**Solutions:**
- Earlier QA involvement
- Better test coverage
- Automated testing
- Smaller feature batches

---

## Migration Paths

### From Startup Workflow

**When ready:**
1. Create `staging` branch from `main`
2. Update workflow configuration
3. Add "Review Required" and "QA" statuses
4. Continue development as normal
5. New merges will use new flow

### To Enterprise Workflow

**When needed:**
1. Add `prod` branch
2. Add more granular statuses
3. Implement approval workflows
4. Add compliance checks

See: [Enterprise Workflow Example](./enterprise-workflow.md)

---

## Related Resources

- [Startup Workflow](./startup-workflow.md) - For small teams
- [Enterprise Workflow](./enterprise-workflow.md) - For large organizations
- [GitHub Setup Guide](../github-setup.md)
- [Troubleshooting Guide](../troubleshooting.md)

---

**Ready to set up?** → Return to main [README](../../README.md)
