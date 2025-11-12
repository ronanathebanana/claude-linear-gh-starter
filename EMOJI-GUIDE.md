# Emoji Usage Guidelines

This document establishes consistent emoji usage across the claude-linear-gh-starter project.

---

## Philosophy

**Use emojis to enhance clarity, not decorate.**

Emojis should:
- ✅ Provide visual anchors for scanning
- ✅ Indicate status or type at a glance
- ✅ Improve accessibility (when paired with text)
- ❌ Not replace clear text descriptions
- ❌ Not be used excessively

---

## Standard Emoji Set

### Status Indicators

| Emoji | Meaning | Usage |
|-------|---------|-------|
| ✅ | Success / Completed | Successful operations, passed tests |
| ✓ | Checkmark (text) | Terminal output, logs |
| ⚠️ | Warning | Non-critical issues, deprecations |
| ❌ | Error / Failed | Failed operations, blockers |
| ✗ | X-mark (text) | Terminal output, logs |
| 🔄 | In Progress | Ongoing operations |
| ⏳ | Waiting | Pending operations |
| 📝 | Note / Info | Additional information |
| 💡 | Tip / Suggestion | Helpful hints |
| 🚨 | Critical | Security issues, breaking changes |

### File & Document Types

| Emoji | Meaning | Usage |
|-------|---------|-------|
| 📖 | Documentation | General docs, guides |
| 📚 | Documentation Set | Multiple docs, knowledge base |
| 📄 | File | Generic file reference |
| 📁 | Folder | Directory reference |
| 📦 | Package | Installed components, modules |
| ⚙️ | Configuration | Config files, settings |
| 🔐 | Secret / Security | API keys, credentials |
| 🔒 | Private / Protected | Branch protection, private repos |

### Actions & Processes

| Emoji | Meaning | Usage |
|-------|---------|-------|
| 🚀 | Launch / Deploy | Installation, deployment |
| ⚡ | Fast / Automated | Quick actions, automation |
| 🔧 | Tool / Utility | Scripts, helper tools |
| 🎯 | Goal / Target | Objectives, targets |
| 🔍 | Search / Inspect | Validation, checks |
| 🧪 | Test / Experiment | Testing, validation |
| 🎨 | Design / UI | Interface, styling |
| 🔌 | Integration / Plugin | External integrations |

### Team & Communication

| Emoji | Meaning | Usage |
|-------|---------|-------|
| 👥 | Team | Team features, collaboration |
| 🤖 | AI / Automation | Claude AI, automated processes |
| 💬 | Communication | Comments, discussions |
| 📡 | Broadcast / Sync | Status updates, sync operations |
| 🔗 | Link / Connection | URLs, references |
| ⭐ | Important / Favorite | Key features, highlights |

---

## Usage by File Type

### README Files

**Allowed:**
- Section headers (max 1 per section)
- Status badges (✅ ⚠️ ❌)
- Feature highlights (max 1 per feature)
- Quick reference icons

**Example:**
```markdown
## ⚡ Quick Start

✅ **Production-Ready** - Automated pre-flight checks
```

**Not Allowed:**
- Multiple emojis per line
- Decorative-only emojis
- Emojis in code blocks

### Documentation (docs/)

**Minimal Usage:**
- Status indicators only (✅ ⚠️ ❌)
- Section markers (📖 🔧 🔍)
- Important callouts (💡 🚨)

**Example:**
```markdown
💡 **Tip**: Use auto-detection for fastest setup

⚠️ **Warning**: This will overwrite existing configuration
```

### CLAUDE.md (Setup Wizard)

**Very Limited:**
- Progress indicators: `[✓]` `[ ]` `[✗]`
- Time estimates: `⏱️` (sparingly)
- Status: `⚠️` `✅` `❌`
- Interactive steps: `🌐` (for browser auth only)

**Not Allowed:**
- Decorative emojis
- Multiple emojis per section
- Emojis in configuration examples

**Example:**
```markdown
[✓] Configured Linear team
[✓] Set up branch strategy
[ ] Install git hooks
```

### Scripts & Code

**None in Code:**
- Avoid emojis in JavaScript/Node.js code
- Use text status indicators in terminal output
- Exception: Comments may use sparingly for clarity

**Terminal Output:**
```javascript
console.log('✓ Installation complete');  // Acceptable
console.log('⚠️  Warning: Missing config'); // Acceptable
```

### Commit Messages

**Conventional Commits Only:**
```
feat: ✨ Add new feature      // ❌ No emoji
feat: Add new feature         // ✅ Correct
```

**Exception:** Tool-generated commits may include at end:
```
feat: Add Linear workflow integration

🤖 Generated with Claude Code
```

---

## Context-Specific Rules

### Setup Wizard Output

Use ASCII alternatives when possible for better terminal compatibility:

| Instead of | Use |
|------------|-----|
| ✅ | `✓` |
| ❌ | `✗` |
| ⚠️ | `⚠` (text warning) |
| ⏳ | `...` or `(pending)` |

**Example:**
```
[1/4] Checking configuration...
      ✓ Configuration loaded
      ✓ All required fields present

[2/4] Validating pattern...
      ✗ Pattern mismatch detected
```

### Error Messages

**Do Use:**
```
❌ Installation Failed

Error in phase: Generate GitHub Actions workflow
```

**Don't Use:**
```
❌😱💥 OH NO! Installation Failed! 😭🔥
```

### Success Messages

**Do Use:**
```
✅ Setup Complete!

All components installed successfully.
```

**Don't Use:**
```
🎉🎊✨ AMAZING! Setup Complete! 🚀⚡🎯
```

---

## Language-Specific Guidelines

### User-Facing Documentation

**English (Primary):**
- Use emojis sparingly
- Prioritize accessibility
- Ensure emoji + text, never emoji alone

**Non-English:**
- Maintain same emoji set for consistency
- Emojis should enhance, not replace translations

---

## Accessibility Considerations

### Screen Reader Compatibility

**Do:**
```markdown
✅ **Success**: Installation complete
```
Screen readers say: "Success: Installation complete"

**Don't:**
```markdown
✅ Installation complete
```
Screen readers say: "Check mark Installation complete" (confusing)

### Alternative Text

When emoji conveys critical meaning, always include text:

**Good:**
```markdown
⚠️ Warning: This action cannot be undone
```

**Bad:**
```markdown
⚠️ This action cannot be undone
```

---

## Testing Emoji Usage

### Checklist

Before adding an emoji, ask:

1. ☐ Does it add clarity or just decoration?
2. ☐ Is there already an emoji nearby (avoid clustering)?
3. ☐ Does it follow our standard emoji set?
4. ☐ Will it work in terminals / markdown renderers?
5. ☐ Is there accompanying text for screen readers?

### Examples

**✅ Good Usage:**
```markdown
## 🚀 Quick Start

Follow these steps to install:

1. Run pre-flight checks
   ✓ All systems ready

2. Execute setup wizard
   ⏳ Installation in progress...

3. Review and merge
   ✅ Installation complete!
```

**❌ Poor Usage:**
```markdown
## 🚀🎯⚡ Quick Start 🔥💯✨

Follow these steps 👇😊:

1. 🏃‍♂️ Run pre-flight checks 🔍
   ✓✓✓ All systems ready!!! 🎉🎊

2. 🧙‍♂️ Execute setup wizard ✨🪄
   ⏳⏳⏳ Installation in progress... 🙏🤞

3. 👀 Review and merge 🔀
   ✅✅✅ Installation complete!!! 🥳🎈🎁
```

---

## Enforcement

### During Development

- Pre-commit hooks validate emoji usage (future enhancement)
- Code reviews check for excessive emoji use
- Documentation PRs require emoji guideline compliance

### Migration

For existing files with non-compliant emoji usage:
1. Create issue for each file
2. Prioritize user-facing documentation
3. Update gradually during normal maintenance

---

## Quick Reference

### Most Common

**Status:**
- ✅ Success
- ⚠️ Warning
- ❌ Error

**Progress:**
- `[✓]` Done
- `[ ]` Pending
- `[✗]` Failed

**Callouts:**
- 💡 Tip
- 🚨 Critical
- 📝 Note

**Actions:**
- 🚀 Start/Deploy
- 🔍 Check/Validate
- 🔧 Configure/Fix

---

## Summary

**Golden Rules:**

1. **Less is More** - Every emoji should serve a purpose
2. **Consistency** - Use the standard set, don't invent new meanings
3. **Accessibility** - Always pair with descriptive text
4. **Context** - More formal docs = fewer emojis
5. **Terminal-Friendly** - Prefer ASCII alternatives in CLI output

**When in Doubt:** Leave it out. Clear text is better than decorative emoji.

---

**Questions?** See [CONTRIBUTING.md](CONTRIBUTING.md) or open a discussion.
