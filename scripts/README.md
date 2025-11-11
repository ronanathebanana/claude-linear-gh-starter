# Scripts Directory

This directory contains utility scripts for configuration and installation.

## Files

- **apply-config.js** - Template rendering engine (replaces placeholders with user values)
- **validate-config.js** - Configuration validator using JSON Schema
- **install-hooks.sh** - Git hooks installation script

## Usage

These scripts are called during the setup process:

1. User completes wizard questions
2. Configuration validated via `validate-config.js`
3. Templates rendered via `apply-config.js`
4. Git hooks installed via `install-hooks.sh`

## Development

Run scripts directly for testing:

```bash
# Validate a config file
node scripts/validate-config.js /path/to/.linear-workflow.json

# Render templates
node scripts/apply-config.js /path/to/.linear-workflow.json /path/to/project
```
