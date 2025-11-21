# Linear Workflow Command Cheat Sheet

Quick reference for all 21 Linear workflow commands in Claude Code.

## 📝 Issue Creation (6 commands)

| Command | Description | Example |
|---------|------------|---------|
| `/bug-linear` | Quick bug report (auto-uses Bug template) | `/bug-linear Login timeout too short` |
| `/improvement-linear` | Quick improvement (auto-uses Improvement template) | `/improvement-linear Optimize database queries` |
| `/feature-linear` | Quick feature request (auto-uses Feature template) | `/feature-linear Add user profile page` |
| `/create-linear-issue` | Create any issue with template selection | `/create-linear-issue Add CSV export` |
| `/create-blocker-linear` | Create blocking issue for current work | `/create-blocker-linear Database indexes needed` |
| `/create-subtask-linear` | Create sub-task linked to current issue | `/create-subtask-linear Add login form UI` |

## 🔄 Workflow & Status (8 commands)

| Command | Description | Example |
|---------|------------|---------|
| `/start-issue` | Start work on existing issue | `/start-issue DEV-123` |
| `/feedback-linear` | Request feedback/clarification from teammates | `/feedback-linear Should this support mobile?` |
| `/get-feedback-linear` | Retrieve and show recent feedback comments | `/get-feedback-linear` |
| `/pause-linear` | Pause work and commit WIP safely | `/pause-linear End of day` |
| `/blocked-linear` | Mark as blocked by external dependency | `/blocked-linear Waiting for API deployment` |
| `/my-work-linear` | Show your active/paused/blocked issues | `/my-work-linear` |
| `/team-work-linear` | Show team's active work | `/team-work-linear` |
| `/high-priority-linear` | Show high priority items across team | `/high-priority-linear` |

## 🚀 Progress & Delivery (3 commands)

| Command | Description | Example |
|---------|------------|---------|
| `/create-pr` | Create pull request with Linear integration | `/create-pr` |
| `/create-release-approval` | Create release approval issue for production | `/create-release-approval v1.2.0` |
| `/progress-update` | Post progress update to Linear | `/progress-update` |

## 🔧 Maintenance & Diagnostics (2 commands)

| Command | Description | Example |
|---------|------------|---------|
| `/workflow-status` | Check workflow health and diagnose issues | `/workflow-status` |
| `/cleanup-branches` | Clean up merged and stale branches | `/cleanup-branches --dry-run` |

## 🎓 Help & Learning (2 commands)

| Command | Description | Example |
|---------|------------|---------|
| `/tutorial` | Interactive tutorial to learn the workflow | `/tutorial` |
| `/linear-help` | Interactive command launcher (select and run commands) | `/linear-help` |

## 💬 Natural Language Alternatives

You can also use natural language instead of slash commands:

| Instead of... | Say... |
|--------------|--------|
| `/start-issue DEV-123` | "Let's get to work on DEV-123" |
| `/my-work-linear` | "What am I working on?" |
| `/high-priority-linear` | "Show me high priority issues" |
| `/bug-linear` | "I found a bug - mobile menu doesn't close" |
| `/create-blocker-linear` | "Create a blocker for this" |
| `/create-pr` | "Ready for review" |
| `/pause-linear` | "Pause work on this" |
| `/progress-update` | "Add progress update" |

## ⚡ Quick Tips

1. **Most commands work without parameters** - they'll prompt for what's needed
2. **Issue IDs are auto-detected** - if you're on a feature branch, commands know which issue
3. **Natural language is often faster** - Claude understands context
4. **Use `/linear-help` to browse commands** - interactive menu to find what you need
5. **Commands are context-aware** - they know if you're already working on an issue

## 🔗 Workflow Examples

### Starting fresh work:
```bash
/start-issue DEV-456
# Creates branch, analyzes issue, posts to Linear
```

### Creating and starting new issue:
```bash
/feature-linear Add dark mode toggle
# Creates issue, then asks if you want to start work immediately
```

### When stuck:
```bash
/blocked-linear Waiting for design approval
# Updates status, posts to Linear, commits WIP
```

### Ready to ship:
```bash
/create-pr
# Creates PR, posts summary to Linear, updates status
```

## 🎯 Pro Tips

- **Chain commands**: Start issue → work → create PR → all automated
- **Use templates**: `/bug-linear` is faster than `/create-linear-issue` for bugs
- **Check health regularly**: `/workflow-status` catches issues early
- **Clean up weekly**: `/cleanup-branches` keeps repo tidy
- **Take the tutorial**: `/tutorial` teaches advanced workflows

---

*Need more help? Run `/linear-help` for an interactive command browser!*