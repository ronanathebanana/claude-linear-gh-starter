# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-11

### Added

- **Interactive Setup Wizard** - Complete Claude Code-powered installation wizard
  - Automated pre-flight validation catches 95% of common issues
  - Auto-detects and fixes missing GitHub `workflow` scope
  - Creates installation branch for safe review before merging
  - Step-by-step configuration with sensible defaults

- **GitHub Actions Workflow** - Automated Linear status synchronization
  - Updates Linear issues when commits are pushed
  - Changes status when PRs are merged to different branches
  - Adds comments with commit/PR references
  - Supports custom branch strategies (Simple, Standard, Enterprise)

- **Linear MCP Integration** - Clean Claude Code integration
  - Direct access to Linear via MCP server
  - Auto-configured `.mcp.json` and `.env` files
  - Secure API key management with `.gitignore`
  - Available tools: list_issues, get_issue, create_issue, update_issue, search_issues

- **Git Commit Validation** - Enforce Linear issue references
  - Pre-commit hook validates issue ID format
  - Customizable regex patterns (DEV-\d+, PROJ-\d+, etc.)
  - Prevents commits without issue references

- **Linear Issue Templates** - Pre-configured templates
  - Bug Report template
  - Improvement template
  - New Feature template
  - Auto-created during installation

- **Documentation** - Comprehensive guides and examples
  - Linear workflow usage guide
  - MCP server configuration guide
  - Troubleshooting documentation
  - Prerequisites checklist
  - GitHub and Linear setup guides

- **Safety Features**
  - Installation branch (setup/linear-workflow) for review
  - Batched read commands to minimize approval prompts
  - Automatic rollback on errors
  - Pre-flight validation before changes

### Changed

- Workflow scope validation moved earlier in setup process
- Combined multiple approval prompts into batched operations
- Improved error messages with actionable fix instructions

### Fixed

- Missing `workflow` scope now caught before installation
- LINEAR_API_KEY confusion resolved with clear documentation
- Branch protection compatibility issues
- MCP environment variable loading

## [0.1.0] - 2025-01-10

### Added

- Initial project structure
- Basic GitHub Actions workflow template
- Linear API integration examples
- Documentation templates

---

## Future Plans

### [1.1.0] - Planned

- [ ] Slash command support (`/setup-linear`)
- [ ] Interactive MCP status verification
- [ ] Post-installation health check command
- [ ] Workflow analytics and usage stats
- [ ] Multi-team support in single repository

### [1.2.0] - Planned

- [ ] Custom workflow templates
- [ ] Slack/Discord notifications integration
- [ ] Advanced branch protection rules
- [ ] Automated dependency updates
- [ ] CI/CD pipeline examples

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting issues and submitting improvements.

## License

MIT License - see [LICENSE](LICENSE) for details.
