# Scripts Directory

This directory contains utility scripts for the Linear workflow setup and installation.

## Overview

The scripts in this directory handle template rendering, configuration validation, and installation tasks. They are designed to be used both programmatically (by Claude during the setup wizard) and manually (for debugging or custom installations).

## Scripts

### apply-config.js

**Purpose:** Template rendering engine that processes Mustache-style templates

**Features:**
- Variable substitution: `{{variable}}`, `{{object.nested}}`
- Conditional sections: `{{#condition}}...{{/condition}}`
- Inverted sections: `{{^condition}}...{{/condition}}`
- Array iteration
- File backup before overwriting
- Atomic file writes (write to temp, then rename)
- Rollback mechanism

**Usage:**

```bash
# Run built-in tests
node install/scripts/apply-config.js test

# Render a template to stdout
node install/scripts/apply-config.js render install/templates/workflow/github-workflow.yml.template config.json

# Apply template to file
node install/scripts/apply-config.js apply install/templates/workflow/github-workflow.yml.template output.yml config.json
```

**Programmatic usage:**

```javascript
const { applyConfig, renderTemplate, rollback } = require('./apply-config.js');

// Render template string
const output = renderTemplate(templateContent, config);

// Apply template file
await applyConfig(
  'templates/github-workflow.yml.template',
  '.github/workflows/linear-status-update.yml',
  config
);

// Rollback on error
await rollback({ deleteBackups: false });
```

### validate-config.js

**Purpose:** Validates user configuration against schema and business rules

**Features:**
- Required field validation
- Type checking (string, number, boolean)
- Format validation (branch names, regex patterns, paths)
- Business logic validation (unique branch names, matching issue patterns)
- Schema validation (JSON Schema support)
- Detailed error messages with field paths

**Usage:**

```bash
# Validate a config file
node scripts/validate-config.js .linear-workflow.json

# Validate against specific schema
node scripts/validate-config.js config.json setup/config-schema.json
```

**Programmatic usage:**

```javascript
const { validateConfig, formatErrors } = require('./validate-config.js');

const errors = validateConfig(config);
if (errors.length > 0) {
  console.error(formatErrors(errors));
  process.exit(1);
}
```

### example-usage.js

**Purpose:** Complete example demonstrating end-to-end workflow installation

**Features:**
- Example configuration object
- Template mapping
- Validation
- Installation with error handling
- Rollback on failure
- Cleanup of backup files

**Usage:**

```bash
# Dry run (preview without writing files)
node scripts/example-usage.js --dry-run

# Full installation with example config
node scripts/example-usage.js

# Install and cleanup backups
node scripts/example-usage.js --cleanup

# Continue even if some templates fail
node scripts/example-usage.js --continue-on-error
```

**Programmatic usage:**

```javascript
const { installWorkflow, cleanupBackups } = require('./example-usage.js');

// Install workflow
const result = await installWorkflow(config, {
  dryRun: false,
  continueOnError: false,
  backup: true
});

// Cleanup if successful
if (result.success) {
  await cleanupBackups();
}
```

### install-hooks.sh

**Purpose:** Install git hooks for commit message validation

**Features:**
- Installs commit-msg hook
- Backs up existing hooks
- Makes hooks executable
- Validates hook installation
- Interactive prompts for conflicts

**Usage:**

```bash
# Install in current directory
./scripts/install-hooks.sh

# Install in specific project
./scripts/install-hooks.sh /path/to/project
```

**Interactive mode:**
- Prompts if hook already exists
- Options: backup, skip, or overwrite
- Verifies installation after completion

### github-setup.js

**Purpose:** GitHub integration and secret management

**Features:**
- Check GitHub CLI installation and authentication
- Verify repository access and permissions
- Manage repository secrets (set, list, delete)
- Check GitHub Actions status
- Validate branch protection rules
- Comprehensive access verification

**Usage:**

```bash
# Run comprehensive verification
node scripts/github-setup.js verify

# Check authentication
node scripts/github-setup.js auth

# Show repository info
node scripts/github-setup.js repo

# Check GitHub Actions status
node scripts/github-setup.js actions

# List secrets
node scripts/github-setup.js secrets

# Set a secret
node scripts/github-setup.js set-secret LINEAR_API_KEY lin_api_...

# Check branch protection
node scripts/github-setup.js check-branch main
```

**Programmatic usage:**

```javascript
const {
  verifyGitHubAccess,
  setupGitHubSecrets,
  checkBranchProtection
} = require('./github-setup.js');

// Verify access
const results = await verifyGitHubAccess();
console.log(results.overall); // 'pass', 'warn', or 'fail'

// Set up secrets
await setupGitHubSecrets({
  LINEAR_API_KEY: 'lin_api_...'
});

// Check branch protection
const protection = await checkBranchProtection('main');
console.log(protection.protected);
```

### validate-workflow.js

**Purpose:** Validate GitHub Actions workflow files

**Features:**
- YAML syntax validation
- Workflow structure checking
- Required fields verification
- Security issue detection (hardcoded secrets, injection risks)
- Deprecation warnings
- Performance suggestions
- GitHub CLI validation integration

**Usage:**

```bash
# Validate workflow file
node scripts/validate-workflow.js .github/workflows/linear-status-update.yml
```

**Checks performed:**
- Valid YAML syntax
- Required fields (name, on, jobs)
- Event triggers configured
- Steps properly formatted
- Secrets referenced correctly
- No hardcoded credentials
- No deprecated syntax

**Programmatic usage:**

```javascript
const { validateWorkflow } = require('./validate-workflow.js');

const results = await validateWorkflow('path/to/workflow.yml');
console.log(results.valid); // true/false
console.log(results.errors); // Array of errors
console.log(results.warnings); // Array of warnings
```

### test-integration.js

**Purpose:** Comprehensive integration testing suite

**Features:**
- Configuration validation tests
- Template rendering tests
- Template file tests
- File operation tests
- GitHub integration tests
- Complete workflow tests
- Automatic test running and reporting

**Usage:**

```bash
# Run all integration tests
node scripts/test-integration.js
```

**Test categories:**
- Configuration validation (5 tests)
- Template rendering (7 tests)
- Template files (12 tests)
- File operations (4 tests)
- GitHub integration (4 tests)
- Complete workflow (3 tests)

**Output:**
- ✓ Passed tests
- ✗ Failed tests
- ⊘ Skipped tests
- Summary with pass/fail counts

## Setup Process Flow

During the Linear workflow setup, these scripts are used in this order:

```
1. User completes wizard questions (CLAUDE.md instructions)
   ↓
2. Configuration object created from answers
   ↓
3. validate-config.js - Validate configuration
   ↓
4. apply-config.js - Render and write template files
   ├── GitHub Actions workflow
   ├── Documentation
   ├── MCP config
   ├── Git hook
   └── Configuration file
   ↓
5. install-hooks.sh - Install git hooks
   ↓
6. Verify installation
   ↓
7. Show success message and next steps
```

## Template Variables

Templates use Mustache-style syntax:

**Simple substitution:**
```
{{variable}}
{{object.nested.property}}
```

**Conditional sections:**
```
{{#condition}}
  This is shown if condition is truthy
{{/condition}}

{{^condition}}
  This is shown if condition is falsy
{{/condition}}
```

**Array iteration:**
```
{{#items}}
  Name: {{name}}
{{/items}}
```

## Configuration Schema

Configuration must match this structure:

```json
{
  "version": "1.0.0",
  "project": {
    "name": "string",
    "path": "string"
  },
  "branches": {
    "main": "string (required)",
    "staging": "string (optional)",
    "prod": "string (optional)"
  },
  "linear": {
    "teamKey": "string",
    "teamId": "string",
    "teamName": "string",
    "workspaceId": "string",
    "workspaceName": "string",
    "statuses": {
      "inProgress": "string",
      "inProgressId": "string",
      "review": "string",
      "reviewId": "string",
      "done": "string",
      "doneId": "string"
    }
  },
  "formats": {
    "commit": "conventional-parens|issue-prefix|issue-scope|custom",
    "pr": "issue-prefix|issue-brackets|custom",
    "issuePattern": "string (regex)",
    "issueExample": "string"
  },
  "detail": "high-level|technical|minimal",
  "paths": {
    "issues": "string (directory path)",
    "workflow": "string (file path)"
  },
  "installed": "string (ISO 8601 date)",
  "installedBy": "string"
}
```

## Error Handling

All scripts implement comprehensive error handling:

**apply-config.js:**
- Backs up files before overwriting
- Atomic writes (temp file + rename)
- Rollback mechanism on failure
- Detailed error messages

**validate-config.js:**
- Field-level error messages
- Multiple error reporting (doesn't stop at first error)
- Formatted output for display

**install-hooks.sh:**
- Pre-flight checks (git repo, permissions)
- Interactive conflict resolution
- Verification after installation

## Testing

**Test template renderer:**
```bash
node install/scripts/apply-config.js test
```

**Test with example config:**
```bash
node scripts/example-usage.js --dry-run
```

**Validate example config:**
```bash
# Create example config first
cat > /tmp/test-config.json << 'EOF'
{
  "version": "1.0.0",
  "project": { "name": "test", "path": "/tmp/test" },
  "branches": { "main": "main" },
  "linear": {
    "teamKey": "DEV",
    "teamId": "abc-123",
    "teamName": "Dev",
    "workspaceId": "xyz-456",
    "workspaceName": "Test",
    "statuses": {
      "inProgress": "In Progress",
      "inProgressId": "uuid-1",
      "review": "Review",
      "reviewId": "uuid-2",
      "done": "Done",
      "doneId": "uuid-3"
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
  }
}
EOF

# Validate
node scripts/validate-config.js /tmp/test-config.json
```

## Development

**Adding new templates:**

1. Create template file in `templates/` with `.template` extension
2. Use `{{variable}}` syntax for placeholders
3. Add template mapping in `example-usage.js`
4. Test with `--dry-run` flag

**Adding new validation rules:**

1. Add validation function in `validate-config.js`
2. Call from `validateConfig()` function
3. Return `ValidationError` objects
4. Test with invalid config

**Extending template renderer:**

The template renderer supports custom functions and filters. To add new features:

1. Add function to `apply-config.js`
2. Document in this README
3. Add tests
4. Update example usage

## Troubleshooting

**"Template not found" error:**
- Ensure you're running from repository root
- Check template path is relative to templates/ directory

**"Invalid configuration" error:**
- Run validator: `node scripts/validate-config.js your-config.json`
- Check error messages for specific field issues

**"Permission denied" error:**
- Ensure output directory is writable
- Check git hooks directory permissions
- Run install-hooks.sh with appropriate permissions

**Rollback failed:**
- Backup files are in `.backup` files
- Manually restore if needed
- Check disk space and permissions

## Reference

Full documentation:
- [CLAUDE.md](../CLAUDE.md) - Setup wizard instructions
- [setup/wizard-prompts.md](../setup/wizard-prompts.md) - Prompt templates
- [setup/preflight-checks.md](../setup/preflight-checks.md) - Pre-flight validation
- [setup/error-handling.md](../setup/error-handling.md) - Error recovery
