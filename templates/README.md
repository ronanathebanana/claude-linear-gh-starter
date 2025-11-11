# Templates Directory

This directory contains parameterized template files that get rendered during setup.

## Files

- **github-workflow.yml.template** - GitHub Actions workflow for Linear status updates
- **linear-workflow.md.template** - Complete workflow documentation
- **claude-instructions.md.template** - CLAUDE.md section for Linear workflow
- **mcp-config.json.template** - MCP server configuration
- **config-file.json.template** - .linear-workflow.json structure
- **commit-msg.template** - Git commit validation hook

## Template Syntax

Uses Mustache-style placeholders:
- `{{variable}}` - Simple substitution
- `{{#condition}}...{{/condition}}` - Conditional section
- `{{^condition}}...{{/condition}}` - Inverted conditional

## Example

```yaml
branches:
  - '!{{branches.main}}'
  {{#branches.prod}}
  - '!{{branches.prod}}'
  {{/branches.prod}}
```

Renders to:
```yaml
branches:
  - '!main'
  - '!production'  # Only if prod branch configured
```
