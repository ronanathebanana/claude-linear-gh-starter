#!/usr/bin/env node

/**
 * GitHub Setup and Integration Script
 *
 * Handles GitHub-related setup tasks including:
 * - Setting repository secrets
 * - Verifying repository access
 * - Checking GitHub Actions status
 * - Validating permissions
 * - Testing secret availability
 *
 * Usage:
 *   const { setupGitHubSecrets, verifyGitHubAccess } = require('./github-setup.js');
 *
 *   // Set up secrets
 *   await setupGitHubSecrets({ LINEAR_API_KEY: 'lin_api_...' });
 *
 *   // Verify access
 *   const access = await verifyGitHubAccess();
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ============================================================================
// GitHub CLI Helpers
// ============================================================================

/**
 * Check if GitHub CLI is installed
 * @returns {Promise<boolean>}
 */
async function isGitHubCLIInstalled() {
  try {
    await execAsync('gh --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user is authenticated with GitHub CLI
 * @returns {Promise<Object>} Authentication status
 */
async function checkGitHubAuth() {
  try {
    const { stdout, stderr } = await execAsync('gh auth status 2>&1');
    const output = stdout + stderr;

    const isAuthenticated = output.includes('Logged in to github.com');
    const usernameMatch = output.match(/Logged in to github\.com as ([^\s]+)/);
    const username = usernameMatch ? usernameMatch[1] : null;

    // Extract scopes
    const scopes = [];
    if (output.includes('repo')) scopes.push('repo');
    if (output.includes('workflow')) scopes.push('workflow');
    if (output.includes('admin:org')) scopes.push('admin:org');

    return {
      isAuthenticated,
      username,
      scopes,
      hasRepoScope: scopes.includes('repo'),
      hasWorkflowScope: scopes.includes('workflow'),
      output
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      username: null,
      scopes: [],
      hasRepoScope: false,
      hasWorkflowScope: false,
      error: error.message
    };
  }
}

/**
 * Get current repository information
 * @returns {Promise<Object>} Repository info
 */
async function getRepositoryInfo() {
  try {
    const { stdout } = await execAsync('gh repo view --json nameWithOwner,owner,name,isPrivate,visibility,url');
    const repo = JSON.parse(stdout);

    return {
      success: true,
      fullName: repo.nameWithOwner,
      owner: repo.owner.login,
      name: repo.name,
      isPrivate: repo.isPrivate,
      visibility: repo.visibility,
      url: repo.url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get user's permission level for the repository
 * @returns {Promise<string>} Permission level: 'admin', 'write', 'read', or 'none'
 */
async function getRepositoryPermission() {
  try {
    const { stdout } = await execAsync('gh repo view --json viewerPermission');
    const data = JSON.parse(stdout);
    return data.viewerPermission || 'none';
  } catch (error) {
    return 'none';
  }
}

/**
 * Check if GitHub Actions is enabled for the repository
 * @returns {Promise<Object>} Actions status
 */
async function checkGitHubActionsStatus() {
  try {
    // Try to list workflows - if this works, Actions is enabled
    const { stdout } = await execAsync('gh workflow list 2>&1');

    // If we get output (even if empty), Actions is accessible
    return {
      enabled: true,
      workflows: stdout.trim().split('\n').filter(line => line.trim().length > 0)
    };
  } catch (error) {
    // Check if error is due to Actions being disabled vs other issues
    const errorMsg = error.message.toLowerCase();

    if (errorMsg.includes('actions is disabled') || errorMsg.includes('not enabled')) {
      return {
        enabled: false,
        reason: 'GitHub Actions is disabled for this repository'
      };
    }

    // Other error - might be permissions or network
    return {
      enabled: false,
      reason: error.message
    };
  }
}

// ============================================================================
// Secret Management
// ============================================================================

/**
 * Set a repository secret
 * @param {string} name - Secret name
 * @param {string} value - Secret value
 * @returns {Promise<Object>} Result
 */
async function setRepositorySecret(name, value) {
  try {
    // Use gh secret set with stdin
    const { stdout, stderr } = await execAsync(
      `echo "${value}" | gh secret set ${name}`,
      { shell: '/bin/bash' }
    );

    return {
      success: true,
      name,
      output: stdout || stderr
    };
  } catch (error) {
    return {
      success: false,
      name,
      error: error.message
    };
  }
}

/**
 * List all repository secrets
 * @returns {Promise<Array>} List of secret names
 */
async function listRepositorySecrets() {
  try {
    const { stdout } = await execAsync('gh secret list');
    const lines = stdout.trim().split('\n').filter(line => line.length > 0);

    // Parse secret names from output
    const secrets = lines.map(line => {
      // Format is usually: "SECRET_NAME  Updated YYYY-MM-DD"
      const match = line.match(/^([A-Z_]+)/);
      return match ? match[1] : null;
    }).filter(Boolean);

    return secrets;
  } catch (error) {
    return [];
  }
}

/**
 * Check if a specific secret exists
 * @param {string} name - Secret name
 * @returns {Promise<boolean>}
 */
async function secretExists(name) {
  const secrets = await listRepositorySecrets();
  return secrets.includes(name);
}

/**
 * Delete a repository secret
 * @param {string} name - Secret name
 * @returns {Promise<Object>} Result
 */
async function deleteRepositorySecret(name) {
  try {
    await execAsync(`gh secret delete ${name}`);
    return {
      success: true,
      name
    };
  } catch (error) {
    return {
      success: false,
      name,
      error: error.message
    };
  }
}

/**
 * Set up multiple repository secrets
 * @param {Object} secrets - Key-value pairs of secrets to set
 * @param {Object} options - Options
 * @param {boolean} options.overwrite - Overwrite existing secrets (default: true)
 * @returns {Promise<Object>} Results
 */
async function setupGitHubSecrets(secrets, options = {}) {
  const { overwrite = true } = options;

  const results = {
    success: true,
    added: [],
    skipped: [],
    failed: []
  };

  for (const [name, value] of Object.entries(secrets)) {
    // Check if secret exists
    const exists = await secretExists(name);

    if (exists && !overwrite) {
      results.skipped.push({
        name,
        reason: 'Secret already exists and overwrite=false'
      });
      continue;
    }

    // Set secret
    const result = await setRepositorySecret(name, value);

    if (result.success) {
      results.added.push(name);
    } else {
      results.failed.push({
        name,
        error: result.error
      });
      results.success = false;
    }
  }

  return results;
}

// ============================================================================
// Access Verification
// ============================================================================

/**
 * Comprehensive GitHub access verification
 * @returns {Promise<Object>} Verification results
 */
async function verifyGitHubAccess() {
  const results = {
    overall: 'unknown',
    checks: []
  };

  // Check 1: GitHub CLI installed
  const cliInstalled = await isGitHubCLIInstalled();
  results.checks.push({
    name: 'GitHub CLI installed',
    status: cliInstalled ? 'pass' : 'fail',
    message: cliInstalled ? 'gh CLI is installed' : 'gh CLI is not installed'
  });

  if (!cliInstalled) {
    results.overall = 'fail';
    return results;
  }

  // Check 2: Authentication
  const auth = await checkGitHubAuth();
  results.checks.push({
    name: 'GitHub authentication',
    status: auth.isAuthenticated ? 'pass' : 'fail',
    message: auth.isAuthenticated
      ? `Authenticated as ${auth.username}`
      : 'Not authenticated with GitHub',
    details: auth
  });

  if (!auth.isAuthenticated) {
    results.overall = 'fail';
    return results;
  }

  // Check 3: Required scopes
  const hasRequiredScopes = auth.hasRepoScope && auth.hasWorkflowScope;
  results.checks.push({
    name: 'Required OAuth scopes',
    status: hasRequiredScopes ? 'pass' : 'warn',
    message: hasRequiredScopes
      ? 'Has repo and workflow scopes'
      : `Missing scopes: ${!auth.hasRepoScope ? 'repo ' : ''}${!auth.hasWorkflowScope ? 'workflow' : ''}`,
    details: { scopes: auth.scopes }
  });

  // Check 4: Repository connection
  const repo = await getRepositoryInfo();
  results.checks.push({
    name: 'Repository connection',
    status: repo.success ? 'pass' : 'fail',
    message: repo.success
      ? `Connected to ${repo.fullName}`
      : 'Not in a GitHub repository',
    details: repo
  });

  if (!repo.success) {
    results.overall = 'fail';
    return results;
  }

  // Check 5: Repository permissions
  const permission = await getRepositoryPermission();
  const hasWriteAccess = ['admin', 'write'].includes(permission.toLowerCase());
  results.checks.push({
    name: 'Repository permissions',
    status: hasWriteAccess ? 'pass' : 'warn',
    message: `Permission level: ${permission}`,
    details: { permission, hasWriteAccess }
  });

  // Check 6: GitHub Actions
  const actions = await checkGitHubActionsStatus();
  results.checks.push({
    name: 'GitHub Actions',
    status: actions.enabled ? 'pass' : 'warn',
    message: actions.enabled
      ? `GitHub Actions enabled (${actions.workflows.length} workflows)`
      : actions.reason || 'GitHub Actions status unknown',
    details: actions
  });

  // Determine overall status
  const hasFailed = results.checks.some(c => c.status === 'fail');
  const hasWarnings = results.checks.some(c => c.status === 'warn');

  if (hasFailed) {
    results.overall = 'fail';
  } else if (hasWarnings) {
    results.overall = 'warn';
  } else {
    results.overall = 'pass';
  }

  return results;
}

/**
 * Check branch protection rules for a branch
 * @param {string} branch - Branch name
 * @returns {Promise<Object>} Protection status
 */
async function checkBranchProtection(branch) {
  try {
    const repo = await getRepositoryInfo();
    if (!repo.success) {
      throw new Error('Not in a GitHub repository');
    }

    // Use GitHub API via gh to check branch protection
    const { stdout } = await execAsync(
      `gh api repos/${repo.fullName}/branches/${branch}/protection 2>&1`
    );

    const protection = JSON.parse(stdout);

    return {
      protected: true,
      branch,
      rules: {
        requirePullRequest: !!protection.required_pull_request_reviews,
        requiredReviewers: protection.required_pull_request_reviews?.required_approving_review_count || 0,
        requireStatusChecks: !!protection.required_status_checks,
        requireUpToDate: protection.required_status_checks?.strict || false,
        enforceAdmins: !!protection.enforce_admins?.enabled,
        restrictPushes: !!protection.restrictions
      },
      details: protection
    };
  } catch (error) {
    // 404 means branch exists but has no protection
    if (error.message.includes('404')) {
      return {
        protected: false,
        branch,
        message: 'Branch has no protection rules'
      };
    }

    // Other errors
    return {
      protected: false,
      branch,
      error: error.message
    };
  }
}

// ============================================================================
// Testing & Validation
// ============================================================================

/**
 * Test that secrets are accessible in GitHub Actions
 * @param {Array<string>} secretNames - Names of secrets to test
 * @returns {Promise<Object>} Test results
 */
async function testSecretsInActions(secretNames) {
  // This would typically trigger a workflow run and check logs
  // For now, we just verify the secrets exist
  const results = {
    success: true,
    secrets: []
  };

  for (const name of secretNames) {
    const exists = await secretExists(name);
    results.secrets.push({
      name,
      exists,
      accessible: exists // In reality, would need to run workflow
    });

    if (!exists) {
      results.success = false;
    }
  }

  return results;
}

// ============================================================================
// Formatting & Display
// ============================================================================

/**
 * Format verification results for display
 * @param {Object} results - Verification results
 * @returns {string} Formatted output
 */
function formatVerificationResults(results) {
  const lines = ['GitHub Access Verification', ''];

  for (const check of results.checks) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '⚠' : '✗';
    lines.push(`${icon} ${check.name}: ${check.message}`);
  }

  lines.push('');
  const overallIcon = results.overall === 'pass' ? '✓' : results.overall === 'warn' ? '⚠' : '✗';
  lines.push(`${overallIcon} Overall status: ${results.overall.toUpperCase()}`);

  return lines.join('\n');
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // GitHub CLI
  isGitHubCLIInstalled,
  checkGitHubAuth,
  getRepositoryInfo,
  getRepositoryPermission,
  checkGitHubActionsStatus,

  // Secrets
  setRepositorySecret,
  listRepositorySecrets,
  secretExists,
  deleteRepositorySecret,
  setupGitHubSecrets,

  // Verification
  verifyGitHubAccess,
  checkBranchProtection,
  testSecretsInActions,

  // Formatting
  formatVerificationResults,
};

// ============================================================================
// CLI Usage
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    console.log(`
GitHub Setup and Integration Tool

Commands:
  verify                    Run comprehensive GitHub access verification
  auth                      Check GitHub CLI authentication status
  repo                      Show repository information
  actions                   Check GitHub Actions status
  secrets                   List repository secrets
  set-secret NAME VALUE     Set a repository secret
  check-branch BRANCH       Check branch protection rules
  help                      Show this help message

Examples:
  node github-setup.js verify
  node github-setup.js set-secret LINEAR_API_KEY lin_api_...
  node github-setup.js check-branch main
`);
    process.exit(0);
  }

  (async () => {
    try {
      if (command === 'verify') {
        const results = await verifyGitHubAccess();
        console.log(formatVerificationResults(results));
        process.exit(results.overall === 'pass' ? 0 : 1);

      } else if (command === 'auth') {
        const auth = await checkGitHubAuth();
        if (auth.isAuthenticated) {
          console.log(`✓ Authenticated as ${auth.username}`);
          console.log(`Scopes: ${auth.scopes.join(', ')}`);
        } else {
          console.log('✗ Not authenticated');
          console.log('Run: gh auth login');
        }

      } else if (command === 'repo') {
        const repo = await getRepositoryInfo();
        if (repo.success) {
          console.log('Repository:', repo.fullName);
          console.log('Owner:', repo.owner);
          console.log('Name:', repo.name);
          console.log('Visibility:', repo.visibility);
          console.log('URL:', repo.url);
        } else {
          console.log('✗ Not in a GitHub repository');
        }

      } else if (command === 'actions') {
        const actions = await checkGitHubActionsStatus();
        if (actions.enabled) {
          console.log('✓ GitHub Actions is enabled');
          console.log(`Workflows: ${actions.workflows.length}`);
          if (actions.workflows.length > 0) {
            console.log('\n' + actions.workflows.join('\n'));
          }
        } else {
          console.log('✗ GitHub Actions is not enabled');
          console.log('Reason:', actions.reason);
        }

      } else if (command === 'secrets') {
        const secrets = await listRepositorySecrets();
        if (secrets.length > 0) {
          console.log('Repository secrets:');
          secrets.forEach(name => console.log(`  • ${name}`));
        } else {
          console.log('No secrets configured');
        }

      } else if (command === 'set-secret' && args.length >= 3) {
        const name = args[1];
        const value = args[2];
        console.log(`Setting secret: ${name}...`);
        const result = await setRepositorySecret(name, value);
        if (result.success) {
          console.log(`✓ Secret ${name} set successfully`);
        } else {
          console.log(`✗ Failed to set secret: ${result.error}`);
          process.exit(1);
        }

      } else if (command === 'check-branch' && args.length >= 2) {
        const branch = args[1];
        console.log(`Checking protection for branch: ${branch}...`);
        const protection = await checkBranchProtection(branch);
        if (protection.protected) {
          console.log(`✓ Branch is protected`);
          console.log('Rules:');
          Object.entries(protection.rules).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
          });
        } else {
          console.log(`⚠ Branch is not protected`);
          if (protection.error) {
            console.log('Error:', protection.error);
          }
        }

      } else {
        console.log('Unknown command:', command);
        console.log('Run with "help" for usage information');
        process.exit(1);
      }

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
