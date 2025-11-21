#!/usr/bin/env node

/**
 * Secrets Validation Script
 *
 * Validates that GitHub secrets are properly set and functional:
 * - LINEAR_API_KEY is set
 * - LINEAR_API_KEY can connect to Linear API
 * - LINEAR_API_KEY has correct permissions
 *
 * Usage:
 *   node install/scripts/validate-secrets.js
 *   node install/scripts/validate-secrets.js --api-key lin_api_xxxxx
 */

const { execSync } = require('child_process');

// ============================================================================
// Linear API Validation
// ============================================================================

/**
 * Test Linear API connection with given API key
 * @param {string} apiKey - Linear API key to test
 * @returns {Promise<Object>} Validation result
 */
async function validateLinearAPIKey(apiKey) {
  const result = {
    valid: false,
    workspace: null,
    user: null,
    teams: [],
    error: null
  };

  try {
    // Test query to get viewer info and teams
    const query = JSON.stringify({
      query: `
        query ValidateAuth {
          viewer {
            id
            name
            email
          }
          organization {
            id
            name
          }
          teams {
            nodes {
              id
              key
              name
            }
          }
        }
      `
    });

    const curlCommand = [
      'curl', '-s', '-X', 'POST',
      'https://api.linear.app/graphql',
      '-H', 'Content-Type: application/json',
      '-H', `Authorization: ${apiKey}`,
      '-d', query
    ].join(' ');

    const response = execSync(curlCommand, { encoding: 'utf8' });
    const data = JSON.parse(response);

    if (data.errors) {
      result.error = data.errors[0].message;
      return result;
    }

    if (!data.data || !data.data.viewer) {
      result.error = 'Invalid response from Linear API';
      return result;
    }

    result.valid = true;
    result.user = {
      id: data.data.viewer.id,
      name: data.data.viewer.name,
      email: data.data.viewer.email
    };

    if (data.data.organization) {
      result.workspace = {
        id: data.data.organization.id,
        name: data.data.organization.name
      };
    }

    if (data.data.teams && data.data.teams.nodes) {
      result.teams = data.data.teams.nodes.map(team => ({
        id: team.id,
        key: team.key,
        name: team.name
      }));
    }

    return result;

  } catch (error) {
    result.error = error.message;
    return result;
  }
}

/**
 * Check if GitHub secret is set
 * @param {string} secretName - Name of the secret to check
 * @returns {boolean} True if secret exists
 */
function isGitHubSecretSet(secretName) {
  try {
    const output = execSync('gh secret list', { encoding: 'utf8' });
    return output.includes(secretName);
  } catch (error) {
    console.error('Error checking GitHub secrets:', error.message);
    return false;
  }
}

/**
 * Trigger a test GitHub Actions workflow to verify secret access
 * @returns {boolean} True if secret is accessible in workflow
 */
async function testSecretInWorkflow() {
  try {
    // Check if test workflow exists
    const workflows = execSync('gh workflow list', { encoding: 'utf8' });

    if (workflows.includes('test-secrets')) {
      // Trigger test workflow
      execSync('gh workflow run test-secrets.yml', { encoding: 'utf8' });

      console.log('');
      console.log('Test workflow triggered. Checking run status...');
      console.log('');

      // Wait a moment for workflow to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get latest run
      const runs = execSync('gh run list --workflow=test-secrets.yml --limit 1 --json status,conclusion', {
        encoding: 'utf8'
      });

      const runData = JSON.parse(runs);

      if (runData.length > 0) {
        const run = runData[0];
        console.log(`Workflow status: ${run.status}`);

        if (run.conclusion === 'success') {
          return true;
        } else if (run.conclusion === 'failure') {
          console.log('');
          console.log('⚠️  Workflow failed - secret may not be accessible');
          console.log('View logs: gh run view --log');
          return false;
        } else {
          console.log('Workflow is still running. Check status later:');
          console.log('  gh run list --workflow=test-secrets.yml');
          return null; // Indeterminate
        }
      }
    } else {
      console.log('ℹ️  Test workflow not found (optional)');
      return null;
    }

  } catch (error) {
    console.error('Could not test secret in workflow:', error.message);
    return null;
  }
}

// ============================================================================
// Main Validation Flow
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('GitHub Secrets Validation');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Check for --api-key flag for direct testing
  const apiKeyIndex = args.indexOf('--api-key');
  let apiKeyToTest = null;

  if (apiKeyIndex !== -1 && args[apiKeyIndex + 1]) {
    apiKeyToTest = args[apiKeyIndex + 1];
    console.log('Testing provided API key...');
  } else {
    // Check if LINEAR_API_KEY secret exists in GitHub
    console.log('[1/3] Checking GitHub repository secrets...');

    const secretExists = isGitHubSecretSet('LINEAR_API_KEY');

    if (secretExists) {
      console.log('  ✓ LINEAR_API_KEY secret is set in GitHub');
    } else {
      console.log('  ✗ LINEAR_API_KEY secret is NOT set in GitHub');
      console.log('');
      console.log('To set the secret, run:');
      console.log('  gh secret set LINEAR_API_KEY');
      console.log('');
      process.exit(1);
    }

    console.log('');

    // Check if secret is accessible (requires test workflow)
    console.log('[2/3] Checking secret accessibility in workflows...');

    const workflowTest = await testSecretInWorkflow();

    if (workflowTest === true) {
      console.log('  ✓ Secret is accessible in GitHub Actions workflows');
    } else if (workflowTest === false) {
      console.log('  ✗ Secret may not be accessible in workflows');
    } else {
      console.log('  - Workflow test skipped (optional)');
    }

    console.log('');

    // Try to get API key from environment for validation
    console.log('[3/3] Validating Linear API connection...');

    apiKeyToTest = process.env.LINEAR_API_KEY;

    if (!apiKeyToTest) {
      // Try to read from .env file
      try {
        const fs = require('fs');
        const envContent = fs.readFileSync('.env', 'utf8');
        const match = envContent.match(/LINEAR_API_KEY=(.+)/);
        if (match) {
          apiKeyToTest = match[1].trim();
        }
      } catch {
        // .env doesn't exist
      }
    }

    if (!apiKeyToTest) {
      console.log('  ⚠️  Cannot validate API key functionality');
      console.log('');
      console.log('The LINEAR_API_KEY secret is set in GitHub, but to verify');
      console.log('it actually works, we need access to the key value.');
      console.log('');
      console.log('To validate the key, run:');
      console.log('  node install/scripts/validate-secrets.js --api-key YOUR_KEY');
      console.log('');
      console.log('Or export it in your shell:');
      console.log('  export LINEAR_API_KEY=your_key');
      console.log('  node install/scripts/validate-secrets.js');
      console.log('');
      process.exit(0);
    }
  }

  // Validate the API key with Linear
  const validation = await validateLinearAPIKey(apiKeyToTest);

  if (validation.valid) {
    console.log('  ✓ Linear API key is valid');
    console.log('');
    console.log('Connection Details:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`User: ${validation.user.name} (${validation.user.email})`);

    if (validation.workspace) {
      console.log(`Workspace: ${validation.workspace.name}`);
    }

    if (validation.teams.length > 0) {
      console.log('');
      console.log('Accessible Teams:');
      validation.teams.forEach(team => {
        console.log(`  • ${team.key} - ${team.name}`);
      });
    } else {
      console.log('');
      console.log('⚠️  Warning: No teams accessible with this API key');
      console.log('   You may need to request team access in Linear');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ All validations passed!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Your LINEAR_API_KEY is properly configured and functional.');
    console.log('');

    process.exit(0);

  } else {
    console.log('  ✗ Linear API key is invalid');
    console.log('');
    console.log('Error Details:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(validation.error);
    console.log('');
    console.log('Common Issues:');
    console.log('  • API key was revoked or deleted in Linear');
    console.log('  • API key has incorrect format (should start with lin_api_)');
    console.log('  • Typo when setting the GitHub secret');
    console.log('  • Network connectivity issues');
    console.log('');
    console.log('To fix:');
    console.log('  1. Create a new API key: https://linear.app/settings/api');
    console.log('  2. Update GitHub secret: gh secret set LINEAR_API_KEY');
    console.log('  3. Run this script again to validate');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('❌ Validation failed');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    process.exit(1);
  }
}

// ============================================================================
// Export for use in other scripts
// ============================================================================

module.exports = {
  validateLinearAPIKey,
  isGitHubSecretSet,
  testSecretInWorkflow
};

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
