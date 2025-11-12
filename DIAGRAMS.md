# Workflow Diagrams

Visual representations of the Linear + GitHub + Claude workflow automation.

---

## Table of Contents

- [Setup Wizard Flow](#setup-wizard-flow)
- [Status Update Flow](#status-update-flow)
- [Auto-Assignment Logic](#auto-assignment-logic)
- [Architecture Overview](#architecture-overview)
- [Branch Strategies](#branch-strategies)
- [Error Handling Flow](#error-handling-flow)

---

## Setup Wizard Flow

Complete installation process from start to finish:

```mermaid
flowchart TD
    Start([User: /setup-linear]) --> ConfirmLocation{Confirm Project Location}
    ConfirmLocation -->|Different| AskPath[Ask for Path]
    AskPath --> ValidatePath{Path Exists?}
    ValidatePath -->|No| AskPath
    ValidatePath -->|Yes| CreateBranch
    ConfirmLocation -->|Current| CreateBranch[Create Installation Branch]

    CreateBranch --> PreFlight[Run Pre-Flight Checks]
    PreFlight --> CheckGit{Git Repo?}
    CheckGit -->|No| ErrorGit[Error: Init Git]
    CheckGit -->|Yes| CheckGH{GitHub CLI?}
    CheckGH -->|No| ErrorGH[Error: Install GH CLI]
    CheckGH -->|Yes| CheckAuth{GH Auth + workflow scope?}
    CheckAuth -->|No| FixAuth[Auto-fix: gh auth refresh]
    FixAuth --> CheckAuth
    CheckAuth -->|Yes| CheckBranch{Branch Protection?}
    CheckBranch -->|Blocks| WarnBranch[Warn + Offer Fix]
    CheckBranch -->|OK| Config
    WarnBranch --> Config

    Config[Configuration Wizard] --> Q0{Choose Profile}
    Q0 -->|Startup| Q3
    Q0 -->|Small Team| Q3
    Q0 -->|Enterprise| Q3
    Q0 -->|Custom| Q1

    Q1[Q1: Branch Strategy] --> Q2[Q2: Linear Connection]
    Q2 --> Validate{Validate API Key}
    Validate -->|Fail| Q2
    Validate -->|Pass| Q3[Q3: Status Mapping]
    Q3 --> Q4[Q4: Formats]
    Q4 --> PatternTest{Validate Pattern}
    PatternTest -->|Fail| AutoDetect[Offer Auto-Detect]
    AutoDetect --> Q4
    PatternTest -->|Pass| Q5[Q5: Detail Level]
    Q5 --> Q6[Q6: Doc Location]
    Q6 --> Q7[Q7: Auto-Assignment]

    Q7 --> Summary{Review Summary}
    Summary -->|No| Config
    Summary -->|Yes| DryRun{Run Dry-Run?}

    DryRun -->|Yes| ShowPreview[Show File Preview]
    ShowPreview --> ConfirmInstall{Proceed?}
    ConfirmInstall -->|No| Config
    DryRun -->|No| Install
    ConfirmInstall -->|Yes| Install

    Install[Execute Installation] --> Phase6[Create Files]
    Phase6 --> Phase7[Configure MCP]
    Phase7 --> MCPAuth{User Authenticates /mcp}
    MCPAuth -->|Fail| MCPAuth
    MCPAuth -->|Success| Phase8[Create Templates]
    Phase8 --> Phase9[Create Test Issue]
    Phase9 --> Phase10[Run Auto Tests]

    Phase10 --> Test1{MCP Connection?}
    Test1 -->|Fail| RollbackT[Rollback Installation]
    Test1 -->|Pass| Test2{Config Valid?}
    Test2 -->|Fail| RollbackT
    Test2 -->|Pass| Test3{Workflow YAML?}
    Test3 -->|Fail| RollbackT
    Test3 -->|Pass| Test4{Git Hook?}
    Test4 -->|Fail| RollbackT
    Test4 -->|Pass| Test5{Repo Access?}
    Test5 -->|Fail| RollbackT
    Test5 -->|Pass| FullTest{Run Full Test?}

    FullTest -->|Yes| WorkflowTest[Execute Test Workflow]
    WorkflowTest --> CommitAll
    FullTest -->|No| CommitAll[Commit & Push]

    CommitAll --> Complete([Installation Complete])
    Complete --> UserMerge[User Merges setup/linear-workflow]
    UserMerge --> Activated([Workflow Activated])

    RollbackT --> RestoreState[Restore Previous State]
    RestoreState --> ErrorEnd([Installation Failed])

    ErrorGit --> ErrorEnd
    ErrorGH --> ErrorEnd
```

---

## Status Update Flow

How issues automatically update through the development cycle:

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Git as Git
    participant GH as GitHub Actions
    participant API as Linear API
    participant Linear as Linear Issue

    Note over Dev,Linear: Feature Branch Push
    Dev->>Git: git push origin feature/DEV-123
    Git->>GH: Trigger: push event
    GH->>GH: Extract issue ID from branch
    GH->>API: POST /graphql (update status)
    API->>Linear: Status → "In Progress"
    Linear-->>Dev: Notification

    Note over Dev,Linear: Pull Request Creation
    Dev->>GH: gh pr create (DEV-123: Title)
    GH->>GH: Parse PR title for issue ID
    Note over GH: No status change (waiting for merge)

    Note over Dev,Linear: Merge to Main
    Dev->>GH: gh pr merge --merge
    GH->>GH: Trigger: push to main
    GH->>GH: Detect merged PR
    GH->>API: POST /graphql (update status)
    API->>Linear: Status → "Code Review"
    alt Auto-Assignment Enabled
        API->>Linear: Assign → Reviewer
    end
    Linear-->>Dev: Notification (status + assignment)

    Note over Dev,Linear: Staging Deployment
    Dev->>Git: git checkout staging && git merge main
    Git->>GH: Trigger: push to staging
    GH->>API: POST /graphql (update status)
    API->>Linear: Status → "QA Testing"
    alt Auto-Assignment Enabled
        API->>Linear: Assign → QA Lead
    end
    Linear-->>Dev: Notification

    Note over Dev,Linear: Production Release
    Dev->>Git: git checkout prod && git merge staging
    Git->>GH: Trigger: push to production
    GH->>API: POST /graphql (update status)
    API->>Linear: Status → "Done"
    Linear-->>Dev: Notification (completed!)
```

---

## Auto-Assignment Logic

Decision flow for automatic issue assignment:

```mermaid
flowchart TD
    Start([Status Change Detected]) --> Enabled{Auto-Assignment Enabled?}
    Enabled -->|No| End([No Assignment])
    Enabled -->|Yes| WhichStatus{Which Status?}

    WhichStatus -->|In Progress| ConfigIP{Config for In Progress?}
    WhichStatus -->|Code Review| ConfigCR{Config for Code Review?}
    WhichStatus -->|QA Testing| ConfigQA{Config for QA Testing?}
    WhichStatus -->|Done| ConfigDone{Config for Done?}

    ConfigIP -->|None| End
    ConfigIP -->|Set| CheckPreserveIP{Preserve Original?}

    ConfigCR -->|None| End
    ConfigCR -->|Set| CheckPreserveCR{Preserve Original?}

    ConfigQA -->|None| End
    ConfigQA -->|Set| CheckPreserveQA{Preserve Original?}

    ConfigDone -->|None| End
    ConfigDone -->|Set| CheckPreserveDone{Preserve Original?}

    CheckPreserveIP -->|Yes| AddIP[Add to Assignees]
    CheckPreserveIP -->|No| ReplaceIP[Replace Assignees]
    AddIP --> UpdateIP[Update Issue]
    ReplaceIP --> UpdateIP
    UpdateIP --> End

    CheckPreserveCR -->|Yes| AddCR[Add to Assignees]
    CheckPreserveCR -->|No| ReplaceCR[Replace Assignees]
    AddCR --> UpdateCR[Update Issue]
    ReplaceCR --> UpdateCR
    UpdateCR --> End

    CheckPreserveQA -->|Yes| AddQA[Add to Assignees]
    CheckPreserveQA -->|No| ReplaceQA[Replace Assignees]
    AddQA --> UpdateQA[Update Issue]
    ReplaceQA --> UpdateQA
    UpdateQA --> End

    CheckPreserveDone -->|Yes| AddDone[Add to Assignees]
    CheckPreserveDone -->|No| ReplaceDone[Replace Assignees]
    AddDone --> UpdateDone[Update Issue]
    ReplaceDone --> UpdateDone
    UpdateDone --> End
```

---

## Architecture Overview

System components and their interactions:

```mermaid
graph TB
    subgraph Developer["Developer Environment"]
        Dev[Developer]
        Claude[Claude Code CLI]
        Git[Git Repository]
    end

    subgraph GitHub["GitHub"]
        Repo[Repository]
        Actions[GitHub Actions]
        Secrets[GitHub Secrets]
        PR[Pull Requests]
    end

    subgraph Linear["Linear"]
        Workspace[Linear Workspace]
        Issues[Issues]
        API[Linear API]
        MCP[Linear MCP Server]
    end

    subgraph Config["Configuration"]
        WorkflowConfig[.linear-workflow.json]
        WorkflowFile[.github/workflows/*.yml]
        GitHook[.git/hooks/commit-msg]
        MCPConfig[.mcp.json]
    end

    %% Developer interactions
    Dev -->|Push code| Git
    Dev -->|Commands| Claude
    Claude -->|Uses| MCP
    MCP -->|OAuth| Workspace
    Claude -->|Reads| WorkflowConfig
    Claude -->|Creates| Issues

    %% Git to GitHub
    Git -->|Push| Repo
    Repo -->|Triggers| Actions
    PR -->|Merge event| Actions

    %% GitHub Actions workflow
    Actions -->|Reads| Secrets
    Actions -->|Reads| WorkflowFile
    Actions -->|Calls| API
    API -->|Updates| Issues

    %% Configuration
    WorkflowConfig -->|Defines| WorkflowFile
    WorkflowConfig -->|Configures| MCPConfig
    GitHook -->|Validates| Git

    %% Feedback
    Issues -->|Notifications| Dev

    style Dev fill:#e1f5ff
    style Claude fill:#e1f5ff
    style Actions fill:#fff3e0
    style API fill:#f3e5f5
    style MCP fill:#f3e5f5
```

---

## Branch Strategies

Visual comparison of workflow profiles:

### Startup Profile

```mermaid
gitGraph
    commit id: "Initial commit"
    branch feature/dev-123
    checkout feature/dev-123
    commit id: "feat: implement (DEV-123)" tag: "Status: In Progress"
    checkout main
    merge feature/dev-123 tag: "Status: Done"
    commit id: "Continue development"
```

### Small Team Profile

```mermaid
gitGraph
    commit id: "Initial commit"
    branch feature/dev-456
    checkout feature/dev-456
    commit id: "feat: implement (DEV-456)" tag: "Status: In Progress"
    checkout main
    merge feature/dev-456 tag: "Status: Code Review"
    branch staging
    checkout staging
    merge main tag: "Status: Done"
```

### Enterprise Profile

```mermaid
gitGraph
    commit id: "Initial commit"
    branch feature/eng-789
    checkout feature/eng-789
    commit id: "feat: implement (ENG-789)" tag: "Status: In Progress"
    checkout main
    merge feature/eng-789 tag: "Status: Code Review"
    branch staging
    checkout staging
    merge main tag: "Status: QA Testing"
    branch production
    checkout production
    merge staging tag: "Status: Done"
```

---

## Error Handling Flow

Rollback and recovery process:

```mermaid
flowchart TD
    Start([Installation Begins]) --> InitState[Initialize State File]
    InitState --> Phase1[Phase 1: Create Branch]
    Phase1 --> Check1{Success?}
    Check1 -->|No| Rollback1[Rollback: Delete Branch]
    Rollback1 --> Failed
    Check1 -->|Yes| Save1[Save State]

    Save1 --> Phase2[Phase 2: Create Config]
    Phase2 --> Check2{Success?}
    Check2 -->|No| Rollback2[Rollback: Delete Config]
    Rollback2 --> Rollback1
    Check2 -->|Yes| Save2[Save State]

    Save2 --> Phase3[Phase 3: Create Workflow]
    Phase3 --> Check3{Success?}
    Check3 -->|No| Rollback3[Rollback: Delete Workflow]
    Rollback3 --> Rollback2
    Check3 -->|Yes| Save3[Save State]

    Save3 --> Phase4[Phase 4: Install Hook]
    Phase4 --> Check4{Success?}
    Check4 -->|No| Rollback4[Rollback: Delete Hook]
    Rollback4 --> Rollback3
    Check4 -->|Yes| Save4[Save State]

    Save4 --> Phase5[Phase 5: Set Secrets]
    Phase5 --> Check5{Success?}
    Check5 -->|No| Rollback5[Rollback: Delete Secrets]
    Rollback5 --> Rollback4
    Check5 -->|Yes| Complete

    Complete([Installation Complete]) --> CleanState[Clean State File]

    Failed([Installation Failed]) --> RestoreBackups[Restore Backups]
    RestoreBackups --> CleanState

    CleanState --> End([End])
```

---

## Validation Pipeline

Comprehensive validation during setup:

```mermaid
flowchart LR
    subgraph PreFlight["Pre-Flight Checks"]
        Git[Git Repository] --> GH[GitHub CLI]
        GH --> Auth[Authentication]
        Auth --> Scope[Workflow Scope]
        Scope --> Branch[Branch Protection]
    end

    subgraph Config["Configuration"]
        Linear[Linear Connection] --> Team[Team Selection]
        Team --> Status[Status Mapping]
        Status --> Pattern[Issue Pattern]
    end

    subgraph Install["Installation"]
        Files[Create Files] --> Hook[Install Hook]
        Hook --> Secret[Set Secrets]
        Secret --> MCP[Configure MCP]
    end

    subgraph Test["Testing"]
        Test1[MCP Connection] --> Test2[Config Valid]
        Test2 --> Test3[Workflow YAML]
        Test3 --> Test4[Git Hook]
        Test4 --> Test5[Repo Access]
    end

    PreFlight --> Config
    Config --> Pattern
    Pattern --> PatternTest{Valid?}
    PatternTest -->|No| AutoFix[Auto-Fix Pattern]
    AutoFix --> Pattern
    PatternTest -->|Yes| Install
    Install --> Test
    Test --> Complete[Complete]

    style PreFlight fill:#e3f2fd
    style Config fill:#fff3e0
    style Install fill:#f3e5f5
    style Test fill:#e8f5e9
```

---

## Usage Notes

### Viewing Diagrams

These Mermaid diagrams render automatically in:
- GitHub README/documentation
- GitLab markdown files
- VS Code with Mermaid extension
- JetBrains IDEs with Mermaid plugin

### Editing Diagrams

Use the [Mermaid Live Editor](https://mermaid.live/) to:
- Preview changes in real-time
- Export as PNG/SVG if needed
- Validate syntax

### Diagram Types Used

- **Flowchart**: Setup wizard, decision trees
- **Sequence**: Status update interactions
- **Git Graph**: Branch strategies
- **Graph**: Architecture overview

---

## Integration with Documentation

These diagrams complement the text documentation:

| Diagram | Related Doc |
|---------|-------------|
| Setup Wizard Flow | [Quick Start Guide](docs/quick-start.md) |
| Status Update Flow | [Linear Workflow](docs/linear-workflow.md) |
| Auto-Assignment Logic | [Auto-Assignment](docs/auto-assignment.md) |
| Architecture Overview | [Technical Overview](docs/prerequisites.md) |
| Branch Strategies | [Configuration Profiles](setup/config-profiles.json) |
| Error Handling | [Troubleshooting](docs/troubleshooting.md) |

---

**Questions?** See the [documentation](docs/) or [open an issue](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues).
