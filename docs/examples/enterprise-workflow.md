# Enterprise Workflow Example

This example shows an enterprise-grade Linear workflow configuration suitable for large organizations with complex deployment pipelines and strict compliance requirements.

## Team Profile

**Team Size:** 50+ developers across multiple teams
**Complexity:** High
**Deployment:** Multi-stage with approvals (dev → qa → staging → production)
**Review Process:** Formal code review + QA + security review + release approvals

---

## Branch Strategy

### Enterprise (Main + Staging + Prod)

```
main ────────┬────────────┬─────────────────────>
             │            │
             └─> staging ─┴────┬────────────────>
                               │
                               └─> prod ────────>
                                       ↑
                                   (approval)
```

**Branches:**
- `main` - Development/integration branch
- `staging` - Pre-production testing
- `prod` (or `production`) - Production-ready code
- `feature/*` - Feature development
- `hotfix/*` - Critical production fixes
- `release/*` - Release candidates

**Flow:**
1. Develop in feature branches
2. Merge to `main` for integration
3. Promote to `staging` for comprehensive testing
4. Promote to `prod` with approval process
5. Deploy `prod` to production environments

---

## Linear Configuration

### Workflow States

```
┌────────┐  ┌───────────┐  ┌───────────┐  ┌─────┐  ┌────────┐  ┌──────────┐  ┌──────┐
│ Backlog│->│ In Dev    │->│ In Review │->│ QA  │->│Staging │->│ Approved │->│ Done │
└────────┘  └───────────┘  └───────────┘  └─────┘  └────────┘  └──────────┘  └──────┘
```

**Seven states:**
1. **Backlog** - Prioritized but not started
2. **In Development** - Active coding
3. **In Review** - Code review in progress
4. **QA** - Testing by QA team
5. **Staging** - Pre-production verification
6. **Approved** - Ready for production deploy
7. **Done** - Deployed to production

### Status Mappings

| Git Event | Linear Status |
|-----------|---------------|
| Push to feature branch | In Development |
| PR merged to `main` | In Review |
| Merged to `staging` | Staging |
| Merged to `prod` | Approved |
| Production deployment complete | Done (manual update or webhook) |

---

## Example Configuration

### .linear-workflow.json

```json
{
  "version": "1.0.0",
  "project": {
    "name": "enterprise-platform",
    "path": "/Users/dev/projects/enterprise-platform"
  },
  "branches": {
    "main": "main",
    "staging": "staging",
    "prod": "production"
  },
  "linear": {
    "teamKey": "PLAT",
    "teamId": "abc-123-uuid",
    "teamName": "Platform Engineering",
    "workspaceId": "xyz-456-uuid",
    "workspaceName": "Enterprise Corp",
    "statuses": {
      "inProgress": "In Development",
      "inProgressId": "state-uuid-1",
      "review": "In Review",
      "reviewId": "state-uuid-2",
      "done": "Approved",
      "doneId": "state-uuid-3"
    }
  },
  "formats": {
    "commit": "conventional-parens",
    "pr": "issue-prefix",
    "issuePattern": "[A-Z]+-\\d+",
    "issueExample": "PLAT-123"
  },
  "detail": "technical",
  "paths": {
    "issues": "/docs/engineering/issues/",
    "workflow": "/.github/workflows/linear-status-update.yml"
  },
  "installed": "2025-01-11T10:00:00Z"
}
```

---

## Typical Development Flow

### Phase 1: Development & Integration

**1. Sprint Planning:**
```
PLAT-512: Implement multi-region data replication
Status: Backlog
Priority: Critical
Sprint: Q1 Sprint 8
Epic: Data Infrastructure
Team: Platform Engineering
Estimate: 8 points
```

**2. Start work:**
```
Engineer: "Start work on PLAT-512"
Claude: Creates feature branch, analysis document
Status: In Development ← Automatic
```

**3. Implementation:**
```bash
git checkout -b feature/plat-512-multi-region-replication

# Development over several days
git commit -m "feat(replication): add region discovery (PLAT-512)"
git commit -m "feat(replication): implement sync protocol (PLAT-512)"
git commit -m "feat(replication): add conflict resolution (PLAT-512)"
git commit -m "test(replication): add integration tests (PLAT-512)"
git commit -m "docs(replication): document architecture (PLAT-512)"

git push origin feature/plat-512-multi-region-replication
```

**4. Linear stays "In Development"** during active work

---

### Phase 2: Code Review

**5. Create PR to main:**
```bash
gh pr create --base main \
  --title "PLAT-512: Implement multi-region data replication" \
  --body "$(cat <<EOF
## Summary
Implements multi-region data replication with conflict resolution

## Related Issues
- Primary: PLAT-512
- Depends on: PLAT-500 (infrastructure)
- Blocks: PLAT-520 (failover)

## Changes
- Added region discovery service
- Implemented sync protocol with CRDTs
- Added conflict resolution engine
- Comprehensive test coverage (95%)
- Architecture documentation

## Testing
- [x] Unit tests (342 tests pass)
- [x] Integration tests (18 scenarios)
- [x] Load testing (10k ops/sec)
- [x] Security review completed
- [x] Performance benchmarks meet SLA

## Deployment
- Requires database migration: `migrations/20250111_add_regions.sql`
- New env vars: REGION_ID, PEER_DISCOVERY_URL
- Feature flag: enable_multi_region_replication

## Rollback Plan
Feature flag can disable immediately if issues arise

## Security Considerations
- All inter-region traffic uses mTLS
- Audit logging for all replications
- RBAC applied at region boundary

EOF
)"
```

**6. Code review process:**
- Request reviews from:
  - 2 senior engineers
  - 1 architect
  - 1 security engineer
- Address feedback in additional commits
- Get all approvals

**7. Merge to main:**
```bash
gh pr merge --squash
```

**8. Linear updates:**
```
Status: In Review ← Automatic
```

---

### Phase 3: QA Testing

**9. Daily integration build:**
- Automated job merges approved PRs to staging
- Or manual promotion:
  ```bash
  git checkout staging
  git merge main
  git push origin staging
  ```

**10. Linear updates:**
```
Status: Staging ← Automatic
```

**11. QA team testing (3-5 days):**
- Functional testing
- Regression testing suite
- Performance testing
- Load testing
- Security scanning
- Compatibility testing
- Accessibility testing
- Documentation review

**12. QA sign-off in Linear:**
```
Comment: "QA Approved - All tests pass"
Labels: +qa-approved
```

---

### Phase 4: Production Approval

**13. Create release candidate:**
```bash
git checkout -b release/v2.5.0
git merge staging
git tag v2.5.0-rc.1
git push origin release/v2.5.0 --tags
```

**14. Approval process:**
- Engineering Manager: Code quality review
- Product Manager: Feature completeness
- Security Team: Security audit
- Compliance: Regulatory check
- CTO/VP Eng: Final approval

**15. Promote to prod branch:**
```bash
git checkout production
git merge release/v2.5.0
git tag v2.5.0
git push origin production --tags
```

**16. Linear updates:**
```
Status: Approved ← Automatic
```

---

### Phase 5: Production Deployment

**17. Gradual rollout:**
```
Week 1: Deploy to 10% of prod servers
Week 2: Deploy to 50% if metrics good
Week 3: Deploy to 100%
```

**18. Deployment monitoring:**
- Error rates
- Performance metrics
- User feedback
- System health

**19. Post-deploy verification:**
- Smoke tests pass
- Metrics within SLA
- No critical errors

**20. Mark complete:**
```
Manually update via Linear UI or webhook:
Status: Done
```

---

## Commit Message Format

### Strict Conventional Commits

```
<type>(<scope>): <description> (PLAT-123)

[optional body]

[optional footer: breaking changes, related issues]

Types (enforced):
- feat: New feature (minor version)
- fix: Bug fix (patch version)
- docs: Documentation only
- style: Formatting, no code change
- refactor: Code change, no behavior change
- perf: Performance improvement
- test: Adding tests
- chore: Build/tooling changes
- BREAKING CHANGE: (major version)

Scopes (team-specific):
- api, auth, db, cache, queue, monitoring, etc.

Examples:
feat(replication): implement multi-region sync (PLAT-512)

Adds CRDT-based conflict resolution for multi-region data
replication with automatic failover support.

Breaking-Change: Changes replication API schema
Closes: PLAT-512
Related: PLAT-500, PLAT-501
```

**Enforced by:**
- Git commit hook
- PR validation
- CI/CD pipeline

---

## PR Requirements Checklist

### Required Before Merge

**Code Quality:**
- [ ] All tests pass (unit + integration)
- [ ] Code coverage ≥ 80%
- [ ] Linter passes (no warnings)
- [ ] No security vulnerabilities (Snyk/Dependabot)

**Review:**
- [ ] 2+ approvals from senior engineers
- [ ] Architect approval (for architectural changes)
- [ ] Security review (for security-sensitive code)

**Documentation:**
- [ ] Code comments for complex logic
- [ ] API documentation updated
- [ ] Architecture docs updated (if applicable)
- [ ] CHANGELOG.md updated

**Testing:**
- [ ] Unit tests for new code
- [ ] Integration tests for user flows
- [ ] Performance tests for critical paths
- [ ] Manual testing completed

**Compliance:**
- [ ] GDPR considerations addressed
- [ ] SOC2 requirements met
- [ ] Audit logging added (if needed)
- [ ] Security considerations documented

---

## Team Structure

### Multiple Teams Coordination

**Platform Team (PLAT):**
- Core infrastructure
- APIs and services
- Database and caching
- Monitoring and observability

**Frontend Team (FE):**
- User interfaces
- Mobile apps
- Design system

**Data Team (DATA):**
- Analytics pipelines
- ML models
- Data warehouse

**Security Team (SEC):**
- Security features
- Compliance
- Vulnerability management

**Each team has:**
- Own Linear team/project
- Own workflow configuration
- Shared staging/prod branches
- Cross-team dependencies tracked in Linear

---

## Release Management

### Release Train Model

**Every 2 weeks:**

```
Week 1:
Monday: Sprint start
  - Development begins
Tuesday-Thursday: Active development
  - Feature branches → main
  - Status: In Development → In Review
Friday: Code freeze for sprint
  - Cut release branch
  - Merge to staging

Week 2:
Monday-Wednesday: QA testing
  - Staging environment testing
  - Status: Staging
Thursday: Release approval meeting
  - Review all features
  - Sign-off from stakeholders
  - Merge to prod branch
  - Status: Approved
Friday: Production deployment
  - Gradual rollout begins
  - Status: Done when complete
```

**Hotfix Process:**
```bash
# Critical bug in production
git checkout -b hotfix/plat-999-critical-fix production
# Fix bug
git commit -m "fix(api): resolve authentication bypass (PLAT-999)"
# Create PR to production
gh pr create --base production --label hotfix
# After approval, merge and deploy immediately
# Cherry-pick to main and staging
```

---

## CI/CD Pipeline

### Multi-Stage Pipeline

```yaml
# .github/workflows/enterprise-ci.yml

stages:
  build:
    - Compile code
    - Run linters
    - Security scanning

  test:
    - Unit tests (all)
    - Integration tests (all)
    - E2E tests (smoke)
    - Performance tests

  quality:
    - Code coverage (≥80%)
    - Code quality (SonarQube)
    - Dependency audit
    - License compliance

  security:
    - SAST (static analysis)
    - DAST (dynamic analysis)
    - Container scanning
    - Secret detection

  deploy:
    - Deploy to appropriate environment
    - Run smoke tests
    - Update monitoring
    - Notify stakeholders
```

---

## Compliance & Auditing

### Audit Trail

**Every change tracked:**
- Who made the change (git commit author)
- What changed (diff)
- When (timestamp)
- Why (Linear issue reference)
- Approvals (PR reviews)
- Deployment record (release tags)

**Linear provides:**
- Issue history
- Status change log
- Comment thread
- Assignee changes
- Priority adjustments

---

## Monitoring & Observability

### Post-Deployment Monitoring

**Automated checks:**
- Error rate increase
- Performance degradation
- API latency spikes
- Database query times
- Memory/CPU usage

**Alerts integrated with Linear:**
- Auto-create issues for critical alerts
- Link to recent deployments
- Assign to on-call engineer

---

## Advantages

**For Enterprise:**
- ✅ Multi-stage verification
- ✅ Compliance-ready
- ✅ Detailed audit trail
- ✅ Risk mitigation
- ✅ Gradual rollouts
- ✅ Clear approval process
- ✅ Cross-team coordination

**Tradeoffs:**
- ⚠️ Longer time to production
- ⚠️ More process overhead
- ⚠️ Complex branch management
- ⚠️ Requires dedicated QA/release teams

---

## When to Use

**This workflow works well when:**
- Organization has 50+ engineers
- Multiple teams on shared codebase
- Regulatory/compliance requirements (HIPAA, SOC2, GDPR)
- High-traffic production systems
- Enterprise customers with SLAs
- Need formal change control
- Multi-region deployments

---

## Setup Wizard Answers

**Branch Strategy:**
```
3. Enterprise (main + staging + prod) ← Choose this
```

**Linear Statuses:**
```
Active development: In Development
Merged to main: In Review
Merged to staging: Staging
Merged to prod: Approved
```

**Commit Format:**
```
1. <type>: <description> (ISSUE-123) ← [Required]
```

**PR Title Format:**
```
1. ISSUE-123: Description ← [Required]
```

**Detail Level:**
```
2. Technical (Developer view) ← [Recommended]
```

---

## Real-World Example

**GlobalTech Corp - Engineering Organization**

**Scale:**
- 200 engineers across 8 teams
- 50 million users
- 99.99% uptime SLA
- SOC2 Type II compliant
- Multi-region deployment (US, EU, APAC)

**Process:**
- Bi-weekly release train
- 3-day QA cycle
- 2-day approval process
- Gradual rollouts over 1 week
- 24/7 on-call rotation

**Tools:**
- Linear for issue tracking
- GitHub for code
- Datadog for monitoring
- PagerDuty for incidents
- Slack for communication

**Results:**
- 26 production releases per year
- 99.97% uptime achieved
- Zero security incidents
- All compliance audits passed
- High developer satisfaction

---

## Tips for Success

### Process Discipline

- Enforce branch protection strictly
- Required checks must pass
- No direct commits to main/staging/prod
- All changes through PRs
- Maintain detailed release notes

### Automation

- Automate everything possible
- CI/CD for all branches
- Automated testing at every stage
- Automated deployments
- Automated rollbacks if metrics degrade

### Communication

- Daily standups per team
- Weekly sync across teams
- Release planning meetings
- Post-mortems for incidents
- Clear documentation

### Quality Gates

- Don't skip QA
- Security reviews mandatory
- Performance benchmarks required
- Load testing before big releases
- Gradual rollouts always

---

## Troubleshooting

### "Release taking too long"

**Solutions:**
- Reduce batch size (more frequent, smaller releases)
- Parallelize QA testing
- Automate more tests
- Streamline approval process

### "Too many merge conflicts"

**Solutions:**
- Smaller, more frequent merges
- Feature flags for incomplete work
- Better team coordination
- Modular architecture

### "Hotfixes bypassing process"

**Solutions:**
- Fast-track approval for critical fixes
- Defined severity levels
- On-call empowered to approve
- Post-deploy review required

---

## Scaling Further

### For Very Large Organizations (500+ engineers)

**Consider:**
- **Monorepo with many teams**
  - Per-team Linear projects
  - Shared infrastructure
  - Dependency management

- **Microservices architecture**
  - Per-service repositories
  - Independent deploy cadences
  - Service mesh for coordination

- **Multiple staging environments**
  - Integration environment
  - QA environment
  - Pre-production environment
  - Canary environment

---

## Related Resources

- [Startup Workflow](./startup-workflow.md) - For small teams
- [Standard Workflow](./standard-workflow.md) - For mid-size teams
- [GitHub Setup Guide](../github-setup.md)
- [Troubleshooting Guide](../troubleshooting.md)

---

**Ready to set up?** → Return to main [README](../../README.md)
