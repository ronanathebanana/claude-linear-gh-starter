# Project Specification: Claude Linear GitHub Starter

## Executive Summary

**Project Name:** claude-linear-gh-starter
**Version:** 1.0.0
**Type:** Developer Tool / Setup Wizard
**Target Users:** Development teams using Linear, Claude, and GitHub
**License:** MIT
**Status:** In Development

## Vision

Create a turnkey solution that allows any development team to implement a sophisticated Linear + Claude + GitHub workflow integration in under 10 minutes through an interactive setup wizard.

## Problem Statement

Currently, teams wanting to integrate Linear issue tracking with Claude AI assistance and GitHub Actions must:
1. Manually create and configure GitHub Actions workflows
2. Set up Linear API connections and MCP servers
3. Write extensive documentation for team adoption
4. Hardcode team-specific values throughout configuration files
5. Understand complex interactions between Linear, GitHub, and Claude

This creates a high barrier to entry and results in:
- Teams abandoning the setup process
- Inconsistent implementations across projects
- Poor documentation and training
- Maintenance burden for custom configurations

## Solution

A **template repository** with an **interactive Claude-powered setup wizard** that:
1. Guides users through configuration via conversational interface
2. Automatically generates all required files with user's settings
3. Sets up GitHub secrets and permissions
4. Creates comprehensive documentation tailored to their workflow
5. Validates setup and provides testing guidance

## Core Features

### 1. Interactive Setup Wizard

**Trigger:** User tells Claude "Setup Linear workflow"

**Flow:**
- Pre-flight checks (git, gh CLI, Node.js, permissions)
- 7 configuration questions (branches, statuses, formats, etc.)
- Configuration summary and confirmation
- Automated file generation
- GitHub secrets setup
- Success validation

**Experience:** Conversational, forgiving, helpful. No command-line expertise required.

### 2. Parameterized Templates

**Files to Generate:**
- `.github/workflows/linear-status-update.yml` - GitHub Actions workflow
- `docs/linear-workflow.md` - Complete workflow documentation
- `.mcp.json` - MCP server configuration
- `.linear-workflow.json` - User's configuration store
- `.git/hooks/commit-msg` - Commit validation hook
- `CLAUDE.md` section - Linear workflow instructions for Claude

**Template System:**
- Use `{{variable}}` syntax for substitution
- Support conditional sections (e.g., prod branch only if configured)
- Maintain formatting and comments
- Preserve user's existing files (backup before overwrite)

### 3. Automated Status Updates

**GitHub Actions Workflow Behavior:**

| Event | Condition | Linear Status |
|-------|-----------|---------------|
| Push to feature branch | First commit with issue ID | "In Progress" (only if not already) |
| Push subsequent commits | Issue ID in commit | No change (prevents ping-pong) |
| PR opened | Issue ID in title/body | No change (stays "In Progress") |
| PR merged to main | Issue ID referenced | User-configured status (default: "Review Required") |
| PR merged to prod | Issue ID referenced | User-configured status (default: "Done") |

**Smart Logic:**
- Extracts issue IDs from commits and PR bodies (e.g., DEV-123)
- Queries Linear for current status before updating
- Skips update if already at target status
- Adds linkback comments with commit/PR references
- Supports multiple issues per commit/PR

### 4. Claude Task Analysis Workflow

**When user says:** "Start work on DEV-123"

**Claude executes:**
1. `get_issue("DEV-123")` - Fetch full issue context
2. `list_comments("DEV-123")` - Check for existing comments
3. Reformat issue using 11-section structured format
4. Analyze codebase for implementation approach
5. Write detailed task analysis to `/docs/issues/DEV-123-name/task-analysis.md`
6. Post concise summary to Linear using `create_comment`
7. Create feature branch: `feature/dev-123-brief-description`
8. Push initial commit with task reference
9. Verify Linear status updated to "In Progress"

**Analysis Levels (User Choice):**
- **High-level:** Brief summaries for stakeholders, business focus
- **Technical:** Detailed analysis with code references (default)
- **Minimal:** Status updates only, commit references

### 5. Comprehensive Documentation

**Generated `docs/linear-workflow.md` includes:**
- Visual workflow diagrams (ASCII art)
- Step-by-step guides for common tasks
- Commit and PR format examples
- Status indicator reference
- Team feedback format (for human responses)
- Troubleshooting section
- Quick reference card

**Customized to user's config:**
- Uses their issue ID pattern (e.g., DEV-123 vs PROJ-456)
- References their branch names
- Shows their status names
- Includes their commit format

## Configuration Schema

### User Configuration Questions

#### 1. Project Location
- **Prompt:** "Where would you like to install the Linear workflow?"
- **Default:** Current directory
- **Validation:** Must be a git repository
- **Storage:** `project.path`

#### 2. GitHub Authentication
- **Check:** `gh auth status`
- **Prompt:** "Set up LINEAR_API_KEY in GitHub secrets now?"
- **Action:** Execute `gh secret set LINEAR_API_KEY`
- **Validation:** Verify secret exists

#### 3. Branch Strategy
- **Prompt:** "What branch names does your team use?"
- **Options:**
  1. Simple (main only)
  2. Standard (main + staging)
  3. Enterprise (main + staging + prod)
  4. Custom
- **Storage:** `branches.main`, `branches.staging`, `branches.prod`

#### 4. Linear Configuration

**Step 4a: API Key**
- **Prompt:** "Please provide your Linear API key"
- **Action:** Test connection, fetch workspace info
- **Validation:** Must return valid workspace

**Step 4b: Team Selection**
- **Fetch:** All teams in workspace via Linear API
- **Display:** Numbered list with team names
- **Storage:** `linear.teamKey`, `linear.teamId`, `linear.teamName`

**Step 4c: Workflow States**
- **Fetch:** Workflow states for selected team
- **Prompts:**
  - "Which status for active development (push to feature branch)?"
  - "Which status when PR merged to main?"
  - "Which status when PR merged to prod?" (if prod branch configured)
- **Storage:** `linear.statuses.inProgress`, `linear.statuses.review`, `linear.statuses.done`
- **Include IDs:** Store state UUIDs for API calls

#### 5. Commit & PR Formats

**Commit Format:**
- **Options:**
  1. `<type>: <description> (ISSUE-123)` - Conventional commits
  2. `ISSUE-123: <description>` - Issue prefix
  3. `<type>(ISSUE-123): <description>` - Issue in scope
  4. Custom
- **Storage:** `formats.commit`

**PR Title Format:**
- **Options:**
  1. `ISSUE-123: Description` - Issue prefix
  2. `[ISSUE-123] Description` - Issue in brackets
  3. Custom
- **Storage:** `formats.pr`

**Issue Pattern:**
- **Prompt:** "What's your issue ID pattern? (regex)"
- **Examples:** `DEV-\d+`, `[A-Z]+-\d+`, `GH-\d+`
- **Validation:** Test with example issue ID
- **Storage:** `formats.issuePattern`, `formats.issueExample`

#### 6. Update Detail Level
- **Options:**
  1. High-level (Stakeholder view)
  2. Technical (Developer view) - Default
  3. Minimal (Status updates only)
- **Storage:** `detail`

#### 7. Documentation Location
- **Options:**
  1. `/docs/issues/` - Default
  2. `/docs/dev-issues/`
  3. `/.linear/issues/`
  4. Custom
- **Storage:** `paths.issues`

### Configuration File Format

`.linear-workflow.json`:
```json
{
  "version": "1.0.0",
  "project": {
    "name": "my-project",
    "path": "/full/path/to/project"
  },
  "branches": {
    "main": "main",
    "staging": "staging",
    "prod": "production"
  },
  "linear": {
    "teamKey": "DEV",
    "teamId": "abc-123-uuid",
    "teamName": "Development",
    "workspaceId": "xyz-456-uuid",
    "workspaceName": "Acme Inc",
    "statuses": {
      "inProgress": "In Progress",
      "inProgressId": "state-uuid-1",
      "review": "Review Required",
      "reviewId": "state-uuid-2",
      "done": "Done",
      "doneId": "state-uuid-3"
    }
  },
  "formats": {
    "commit": "conventional-parens",
    "pr": "issue-prefix",
    "issuePattern": "[A-Z]+-\\d+",
    "issueExample": "DEV-123"
  },
  "detail": "technical",
  "paths": {
    "issues": "/docs/issues/",
    "workflow": "/.github/workflows/linear-status-update.yml"
  },
  "installed": "2025-01-11T10:30:00Z",
  "installedBy": "claude-code-cli"
}
```

## Technical Architecture

### File Structure

```
claude-linear-gh-starter/
├── README.md                     # Project overview and quick start
├── LICENSE                       # MIT license
├── CLAUDE.md                     # Instructions for Claude setup wizard
├── PROJECT-SPEC.md              # This file - detailed specification
├── .gitignore                    # Standard Node.js gitignore
├── package.json                  # Project metadata and scripts
│
├── setup/
│   ├── wizard-prompts.md         # Prompt templates for each question
│   ├── config-schema.json        # JSON Schema for validation
│   └── preflight-checks.md       # Pre-flight check instructions
│
├── templates/
│   ├── github-workflow.yml.template      # GitHub Actions workflow
│   ├── linear-workflow.md.template       # Workflow documentation
│   ├── claude-instructions.md.template   # CLAUDE.md section
│   ├── mcp-config.json.template          # MCP server config
│   ├── config-file.json.template         # .linear-workflow.json
│   └── commit-msg.template               # Git hook
│
├── scripts/
│   ├── apply-config.js           # Template renderer (replaces placeholders)
│   ├── validate-config.js        # Configuration validator
│   └── install-hooks.sh          # Git hooks installer
│
└── docs/
    ├── prerequisites.md          # System requirements
    ├── linear-setup.md           # Linear API key and permissions
    ├── github-setup.md           # GitHub CLI and repository setup
    ├── mcp-setup.md              # MCP server configuration
    ├── troubleshooting.md        # Common issues and solutions
    └── examples/
        ├── startup-workflow.md   # Simple workflow example
        ├── standard-workflow.md  # Standard workflow example
        └── enterprise-workflow.md # Enterprise workflow example
```

### Template System

**Syntax:** Mustache-style placeholders

**Example:**
```yaml
# Template file: templates/github-workflow.yml.template
name: Update Linear Issue Status

on:
  push:
    branches:
      - '**'
      - '!{{branches.main}}'
      {{#branches.prod}}- '!{{branches.prod}}'{{/branches.prod}}
```

**Rendered output:**
```yaml
name: Update Linear Issue Status

on:
  push:
    branches:
      - '**'
      - '!main'
      - '!production'
```

**Template Variables:**

| Variable | Example | Source |
|----------|---------|--------|
| `{{branches.main}}` | `main` | User config Q3 |
| `{{branches.staging}}` | `staging` | User config Q3 |
| `{{branches.prod}}` | `production` | User config Q3 |
| `{{linear.teamKey}}` | `DEV` | User config Q4b |
| `{{linear.statuses.inProgress}}` | `In Progress` | User config Q4c |
| `{{linear.statuses.inProgressId}}` | `uuid` | Linear API |
| `{{formats.issuePattern}}` | `DEV-\\d+` | User config Q5 |
| `{{formats.issueExample}}` | `DEV-123` | User config Q5 |
| `{{paths.issues}}` | `/docs/issues/` | User config Q7 |
| `{{project.name}}` | `my-project` | Detected |
| `{{detail}}` | `technical` | User config Q6 |

**Conditional Sections:**
```
{{#branches.prod}}
Content only shown if prod branch is configured
{{/branches.prod}}
```

### Dependencies

**Runtime:**
- Node.js >= 16.0.0
- Git >= 2.0.0
- GitHub CLI (`gh`) >= 2.0.0
- Linear API access (user-provided key)

**Optional:**
- Claude Code CLI (for enhanced experience)
- Claude Desktop (for MCP integration)

**No NPM dependencies initially** - Pure Node.js to keep it lightweight.

### Installation Flow (Technical)

**1. Pre-Flight Checks**
```bash
# Check git
git rev-parse --git-dir > /dev/null 2>&1 || exit 1

# Check gh CLI
gh auth status || exit 1

# Check Node.js
node --version || exit 1

# Check LINEAR_API_KEY
[ -z "$LINEAR_API_KEY" ] && echo "⚠ API key needed"
```

**2. Configuration Gathering**
- Run wizard prompts (one at a time)
- Store answers in memory (JSON object)
- Validate each answer before proceeding
- Allow user to go back and edit

**3. Configuration Validation**
```javascript
// Pseudo-code
const config = gatherUserConfig();
validateConfigSchema(config, 'setup/config-schema.json');
testLinearConnection(config.linear.apiKey);
testGitHubAccess(config.project.path);
```

**4. File Generation**
```javascript
// For each template file
const template = readFile('templates/github-workflow.yml.template');
const rendered = renderTemplate(template, config);
const targetPath = `${config.project.path}/.github/workflows/linear-status-update.yml`;

// Backup if exists
if (fileExists(targetPath)) {
  backup(targetPath, `${targetPath}.backup`);
}

writeFile(targetPath, rendered);
```

**5. GitHub Secrets Setup**
```bash
cd $PROJECT_PATH
gh secret set LINEAR_API_KEY --body "$LINEAR_API_KEY"
```

**6. Git Hooks Installation**
```bash
cp templates/commit-msg.template $PROJECT_PATH/.git/hooks/commit-msg
chmod +x $PROJECT_PATH/.git/hooks/commit-msg
```

**7. Create Documentation Folders**
```bash
mkdir -p $PROJECT_PATH/$ISSUES_PATH
```

**8. Save Configuration**
```bash
echo "$CONFIG_JSON" > $PROJECT_PATH/.linear-workflow.json
```

## Implementation Phases

### Phase 1: Core Templates (Week 1)
**Goal:** Extract and parameterize existing workflow files

**Tasks:**
- [x] Create project structure (Done in this session)
- [ ] Copy GitHub Actions workflow from mdl-admin-dev
- [ ] Parameterize workflow (replace hardcoded values)
- [ ] Copy linear-workflow.md documentation
- [ ] Parameterize documentation
- [ ] Create MCP config template
- [ ] Create commit-msg hook template
- [ ] Create CLAUDE.md section template

**Deliverables:**
- All template files in `templates/`
- Config schema in `setup/config-schema.json`
- Template variable reference documented

### Phase 2: Wizard Prompts (Week 1)
**Goal:** Design conversation flow and prompt templates

**Tasks:**
- [ ] Write wizard prompt templates in `setup/wizard-prompts.md`
- [ ] Design question flow (7 questions)
- [ ] Create pre-flight check instructions
- [ ] Write validation logic for each question
- [ ] Design configuration summary display
- [ ] Create error messages and recovery prompts

**Deliverables:**
- Complete wizard prompt templates
- Pre-flight check documentation
- Error handling guide

### Phase 3: Template Renderer (Week 2)
**Goal:** Build system to replace placeholders with user values

**Tasks:**
- [ ] Implement template rendering logic (Mustache style)
- [ ] Support conditional sections
- [ ] Handle escaped characters in values
- [ ] Create file backup system
- [ ] Implement safe file writing (atomic operations)
- [ ] Add rollback mechanism

**Deliverables:**
- `scripts/apply-config.js` - Working template renderer
- Test suite for template rendering
- Backup and rollback system

### Phase 4: GitHub Integration (Week 2)
**Goal:** Automate GitHub secrets and permissions setup

**Tasks:**
- [ ] Implement `gh secret set` wrapper
- [ ] Verify repository access
- [ ] Check branch protection rules
- [ ] Validate GitHub Actions enabled
- [ ] Test secret retrieval in workflow

**Deliverables:**
- GitHub setup automation
- Permission validation
- Error handling for GitHub issues

### Phase 5: Documentation (Week 2-3)
**Goal:** Write comprehensive guides for setup and usage

**Tasks:**
- [ ] Write `docs/prerequisites.md`
- [ ] Write `docs/linear-setup.md` (API key creation)
- [ ] Write `docs/github-setup.md` (CLI install, auth)
- [ ] Write `docs/mcp-setup.md` (Claude integration)
- [ ] Write `docs/troubleshooting.md`
- [ ] Create example workflows (startup, standard, enterprise)
- [ ] Write CONTRIBUTING.md
- [ ] Update README.md with examples

**Deliverables:**
- Complete documentation suite
- Example configurations
- Contributing guide

### Phase 6: Testing & Validation (Week 3)
**Goal:** Test on fresh repositories and gather feedback

**Tasks:**
- [ ] Test on new repository (blank slate)
- [ ] Test on existing project (with CLAUDE.md)
- [ ] Test with different Linear workspaces
- [ ] Test with different branch strategies
- [ ] Validate all generated files
- [ ] Test GitHub Actions workflow execution
- [ ] Get external beta tester feedback
- [ ] Refine UX based on feedback

**Deliverables:**
- Test report
- Bug fixes
- UX improvements
- Beta feedback summary

### Phase 7: Polish & Release (Week 3-4)
**Goal:** Prepare for public release

**Tasks:**
- [ ] Create release checklist
- [ ] Write changelog
- [ ] Create GitHub release with tags
- [ ] (Optional) Record demo video
- [ ] (Optional) Write blog post
- [ ] Share on relevant communities (Reddit, HN, Twitter)
- [ ] Monitor initial adoption and issues

**Deliverables:**
- v1.0.0 release
- Public announcement
- Community engagement

## Success Metrics

### User Experience
- ✅ Setup completes in < 10 minutes
- ✅ Zero manual file editing required
- ✅ Works with any Linear workspace
- ✅ Clear error messages with solutions
- ✅ Can run entirely through Claude

### Technical Quality
- ✅ All templates render correctly
- ✅ GitHub Actions workflow executes successfully
- ✅ Linear API calls succeed
- ✅ Configuration validates properly
- ✅ Backup and rollback work

### Adoption
- Target: 10+ teams adopt in first month
- Target: 5+ GitHub stars in first week
- Target: Positive feedback from 80%+ of users
- Target: < 5% setup failure rate

## Future Enhancements (Post v1.0)

### v1.1 - Enhanced Features
- [ ] Support multiple Linear teams in one project
- [ ] Add Slack/Discord notification integration
- [ ] Include time tracking integration
- [ ] Add custom status transition rules

### v1.2 - NPM Package
- [ ] Convert to installable npm package
- [ ] Add CLI commands: `npx claude-linear-gh-starter setup`
- [ ] Support update command: `npx claude-linear-gh-starter update`
- [ ] Add validate command: `npx claude-linear-gh-starter validate`

### v1.3 - Web Interface
- [ ] Create web-based configuration wizard
- [ ] Download generated files as ZIP
- [ ] Preview generated files before download
- [ ] Share configurations with team

### v2.0 - Platform Expansion
- [ ] Support GitLab integration
- [ ] Support Jira instead of Linear
- [ ] Support Bitbucket
- [ ] Support Azure DevOps

### v2.1 - Team Features
- [ ] Multi-project dashboard
- [ ] Shared team configurations
- [ ] Analytics and insights
- [ ] Team performance metrics

## Risk Assessment

### Technical Risks

**Risk:** Linear API changes breaking integration
**Mitigation:** Version lock API calls, monitor Linear changelog, maintain compatibility layer

**Risk:** GitHub Actions limits (workflow minutes)
**Mitigation:** Optimize workflow, add caching, document limits

**Risk:** Template rendering bugs with edge cases
**Mitigation:** Comprehensive testing, escaping strategies, validation

### User Experience Risks

**Risk:** Users confused by setup process
**Mitigation:** Clear prompts, examples, validation, help text

**Risk:** Users abandon during long setup
**Mitigation:** Progress indicators, save partial config, resume support

**Risk:** Users misconfigure and blame tool
**Mitigation:** Validation, confirmation step, easy rollback

### Adoption Risks

**Risk:** Low discoverability
**Mitigation:** SEO, community outreach, documentation, examples

**Risk:** Competing solutions emerge
**Mitigation:** Maintain quality, rapid iteration, community engagement

**Risk:** Limited team interest
**Mitigation:** Target early adopters, gather feedback, iterate quickly

## Support & Maintenance

### Community Support
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Documentation as primary support resource
- Active monitoring of issues (< 48hr response time)

### Maintenance Plan
- Weekly: Monitor new issues
- Monthly: Dependency updates
- Quarterly: Feature releases
- Annually: Major version updates

### Documentation Maintenance
- Keep docs in sync with code
- Update examples when workflow changes
- Add troubleshooting entries from common issues
- Version docs alongside releases

## Licensing & Attribution

**License:** MIT (most permissive)

**Attribution:**
- Credit MatchDay Live team as original creators
- Link to mdl-admin-dev as reference implementation
- Acknowledge community contributors

**Commercial Use:** Fully allowed, no restrictions

## Conclusion

This project aims to democratize sophisticated development workflows by making them accessible to any team through an intuitive setup process. By combining Linear's powerful issue tracking, Claude's AI assistance, and GitHub's automation capabilities, teams can achieve unprecedented development velocity and visibility.

The focus on user experience, comprehensive documentation, and robust error handling ensures high adoption rates and positive user feedback. The modular, template-based architecture allows for easy customization and future enhancements.

Success will be measured not just by technical correctness, but by the number of teams successfully adopting and benefiting from the workflow in their day-to-day development.

---

**Status:** Ready to implement
**Next Step:** Begin Phase 1 - Extract and parameterize templates
**Timeline:** 3-4 weeks to v1.0.0 release
**Owner:** Ronan Worthington
**Reviewers:** TBD
