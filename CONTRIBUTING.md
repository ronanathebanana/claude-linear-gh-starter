# Contributing to Claude Linear GitHub Starter

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Testing Guidelines](#testing-guidelines)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

###Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

---

## How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**
- Check the [troubleshooting guide](./docs/troubleshooting.md)
- Search [existing issues](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)
- Try the latest version

**When submitting a bug report, include:**
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- System information (OS, Node version, etc.)
- Error messages and logs
- Screenshots if applicable

**Use this template:**
```markdown
### Bug Description
Clear description of what the bug is.

### To Reproduce
1. Run setup wizard
2. Choose these options: ...
3. See error

### Expected Behavior
What should happen.

### Actual Behavior
What actually happens.

### Environment
- OS: macOS 14.0
- Node: v18.17.0
- GitHub CLI: v2.40.0

### Error Output
```
Paste error messages here
```

### Additional Context
Any other relevant information.
```

---

### Suggesting Enhancements

**Before suggesting an enhancement:**
- Check if it already exists
- Check if it's in the roadmap
- Consider if it fits the project scope

**When suggesting an enhancement:**
- Use a clear title
- Provide detailed description
- Explain the use case
- Provide examples if possible

**Use this template:**
```markdown
### Enhancement Description
Clear description of the feature.

### Problem It Solves
What problem does this address?

### Proposed Solution
How should it work?

### Alternatives Considered
Other approaches you've thought about.

### Additional Context
Any other relevant information, mockups, etc.
```

---

### Documentation Improvements

Documentation contributions are highly valued!

**Areas needing documentation:**
- Clarifying existing docs
- Adding examples
- Fixing typos
- Translating to other languages
- Adding troubleshooting entries
- Improving setup guides

**For documentation changes:**
1. Fork the repository
2. Make changes to markdown files
3. Test that links work
4. Submit PR with clear description

---

### Code Contributions

**Good first issues:**
- Look for `good first issue` label
- Check `help wanted` label
- Simple bug fixes
- Test improvements
- Documentation

**Larger contributions:**
- Discuss in an issue first
- Break into smaller PRs if possible
- Follow existing patterns
- Add tests
- Update documentation

---

## Development Setup

### Prerequisites

**Required:**
- Node.js 16+ ([installation guide](./docs/prerequisites.md))
- Git 2.0+ ([installation guide](./docs/prerequisites.md))
- GitHub CLI ([installation guide](./docs/prerequisites.md))

**Recommended:**
- Claude Code CLI (for testing wizard)
- Linear account (for testing integration)

---

### Initial Setup

**1. Fork and clone:**
```bash
gh repo fork YOUR_USERNAME/claude-linear-gh-starter --clone
cd claude-linear-gh-starter
```

**2. Install dependencies:**
```bash
npm install
```

**3. Run tests:**
```bash
npm test
```

---

### Project Structure

```
claude-linear-gh-starter/
├── docs/                    # User documentation
│   ├── prerequisites.md
│   ├── linear-setup.md
│   ├── github-setup.md
│   ├── mcp-setup.md
│   ├── troubleshooting.md
│   └── examples/           # Workflow examples
│
├── scripts/                # Core functionality
│   ├── apply-config.js     # Template renderer
│   ├── validate-config.js  # Config validator
│   ├── github-setup.js     # GitHub integration
│   ├── validate-workflow.js # Workflow validator
│   ├── test-integration.js  # Test suite
│   └── example-usage.js    # Usage example
│
├── setup/                  # Wizard configuration
│   ├── wizard-prompts.md   # Prompt templates
│   ├── preflight-checks.md # Pre-flight validation
│   ├── error-handling.md   # Error recovery
│   └── config-schema.json  # JSON schema
│
├── templates/              # File templates
│   ├── github-workflow.yml.template
│   ├── linear-workflow.md.template
│   ├── claude-instructions.md.template
│   ├── mcp-config.json.template
│   ├── config-file.json.template
│   └── commit-msg.template
│
├── CLAUDE.md              # Claude instructions
├── README.md              # Main documentation
├── PROJECT-SPEC.md        # Technical specification
└── CONTRIBUTING.md        # This file
```

---

## Making Changes

### Creating a Branch

```bash
# Start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Test improvements
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

---

### Development Workflow

**1. Make your changes:**
```bash
# Edit files
vim scripts/apply-config.js

# Test locally
node scripts/apply-config.js test
```

**2. Write tests:**
```bash
# Add tests to test-integration.js
# Or create new test files

# Run tests
npm test
```

**3. Update documentation:**
```bash
# If you changed APIs, update docs
vim docs/relevant-doc.md

# Update README if needed
vim README.md
```

**4. Commit your changes:**
```bash
git add .
git commit -m "feat: add new template rendering feature"
```

See [Commit Message Guidelines](#commit-message-guidelines) below.

---

### Testing Your Changes

**Run all tests:**
```bash
npm test
```

**Run specific tests:**
```bash
# Template rendering tests
node scripts/apply-config.js test

# Configuration validation
node scripts/validate-config.js test-config.json

# Integration tests
node scripts/test-integration.js

# GitHub integration
node scripts/github-setup.js verify
```

**Manual testing:**
```bash
# Test with dry-run
node scripts/example-usage.js --dry-run

# Test wizard (requires Claude)
# In Claude: "Setup Linear workflow"
```

---

## Submitting Changes

### Creating a Pull Request

**1. Push your branch:**
```bash
git push origin feature/your-feature-name
```

**2. Create PR:**
```bash
gh pr create --title "feat: add new feature" \
  --body "Description of changes"
```

**3. Fill in PR template:**
```markdown
## Description
Clear description of what this PR does.

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Added/updated tests
- [ ] All tests pass
- [ ] Manually tested

## Documentation
- [ ] Updated relevant docs
- [ ] Added inline code comments
- [ ] Updated README if needed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added
- [ ] Documentation updated
```

---

### PR Review Process

**What to expect:**
1. Automated checks run (tests, linting)
2. Maintainer reviews your code
3. You may be asked for changes
4. Once approved, PR will be merged

**Timeline:**
- Initial review: Within 3 business days
- Follow-up: Within 2 business days
- Merge: After all checks pass and approval

**During review:**
- Be responsive to feedback
- Make requested changes
- Ask questions if unclear
- Be patient and respectful

---

## Style Guidelines

### Code Style

**JavaScript/Node.js:**
- Use modern JavaScript (ES6+)
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for functions
- Handle errors explicitly
- No unused variables

**Example:**
```javascript
/**
 * Render a template with configuration data
 * @param {string} template - Template string
 * @param {Object} config - Configuration object
 * @returns {string} Rendered template
 */
function renderTemplate(template, config) {
  if (!template || !config) {
    throw new Error('Template and config are required');
  }

  // Implementation...
  return renderedOutput;
}
```

**Bash Scripts:**
- Use `#!/bin/bash` shebang
- Add set -e for error handling
- Comment complex logic
- Use meaningful variable names
- Quote variables: `"$VAR"`

---

### Commit Message Guidelines

**Format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code restructuring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Scope (optional):**
- `wizard`: Setup wizard
- `templates`: Template files
- `scripts`: Script files
- `docs`: Documentation
- `ci`: CI/CD configuration

**Examples:**
```
feat(wizard): add branch strategy selection

fix(templates): correct GitHub workflow syntax

docs(setup): improve Linear setup guide

test: add integration tests for template rendering

chore: update dependencies
```

**Guidelines:**
- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Keep subject under 50 characters
- Wrap body at 72 characters
- Reference issues in footer

---

### Documentation Style

**Markdown:**
- Use ATX-style headers (`# Header`)
- Add blank line before/after headers
- Use backticks for `code`
- Use fenced code blocks with language
- Add blank line before/after code blocks
- Use meaningful link text (not "click here")

**Writing style:**
- Use active voice
- Be concise
- Use examples
- Define acronyms on first use
- Write for international audience

**Example:**
```markdown
# Feature Name

Brief description of the feature.

## Usage

```bash
# Example command
npm run feature
```

## Options

- `--option1` - Description of option 1
- `--option2` - Description of option 2
```

---

## Testing Guidelines

### Test Coverage

**Aim for:**
- All new code has tests
- Critical paths fully covered
- Edge cases tested
- Error conditions tested

**Types of tests:**
- Unit tests (individual functions)
- Integration tests (multiple components)
- End-to-end tests (full workflow)

---

### Writing Tests

**Good test structure:**
```javascript
test('descriptive test name', async () => {
  // Arrange - Set up test data
  const config = { ... };

  // Act - Execute the code
  const result = renderTemplate(template, config);

  // Assert - Check the results
  assert(result.includes('expected content'));
  assert(!result.includes('{{variables}}'));
});
```

**Test naming:**
- Be descriptive
- Describe what is being tested
- Include expected outcome

**Examples:**
```javascript
test('renderTemplate replaces simple variables')
test('renderTemplate handles nested properties')
test('renderTemplate throws error for invalid config')
test('validateConfig detects missing required fields')
```

---

### Running Tests Locally

**Before submitting PR:**
```bash
# Run all tests
npm test

# Check for errors
npm run lint

# Validate all templates render
node scripts/test-integration.js

# Test with example config
node scripts/example-usage.js --dry-run
```

---

## Release Process

**For maintainers:**

### Version Numbering

We use [Semantic Versioning](https://semver.org/):
- MAJOR.MINOR.PATCH (e.g., 1.2.3)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Creating a Release

```bash
# Update version
npm version patch  # or minor, or major

# Update CHANGELOG.md
vim CHANGELOG.md

# Commit and tag
git add CHANGELOG.md package.json
git commit -m "chore: release v1.2.3"
git tag v1.2.3

# Push
git push origin main --tags

# Create GitHub release
gh release create v1.2.3 \
  --title "v1.2.3" \
  --notes "See CHANGELOG.md"
```

---

## Getting Help

### Questions

**For questions about:**
- Using the tool: [GitHub Discussions](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/discussions)
- Contributing: [GitHub Discussions](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/discussions/categories/contributors)
- Bugs: [GitHub Issues](https://github.com/YOUR_USERNAME/claude-linear-gh-starter/issues)

### Community

**Where to find us:**
- GitHub Discussions: Q&A and general chat
- GitHub Issues: Bug reports and feature requests
- Pull Requests: Code review and collaboration

---

## Recognition

Contributors are recognized in:
- README.md contributors section
- GitHub contributors graph
- Release notes (for significant contributions)

Thank you for contributing! 🎉

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

See [LICENSE](./LICENSE) for details.
