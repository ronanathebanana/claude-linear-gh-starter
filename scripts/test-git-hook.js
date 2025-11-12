#!/usr/bin/env node

/**
 * Git Hook Tester
 *
 * Tests the commit-msg git hook to ensure it's working correctly:
 * - Hook is installed and executable
 * - Hook validates commit messages properly
 * - Hook shows appropriate error messages
 * - Hook allows valid commits
 *
 * Usage:
 *   node scripts/test-git-hook.js
 *   node scripts/test-git-hook.js --verbose
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// ============================================================================
// Test Configuration
// ============================================================================

const HOOK_PATH = '.git/hooks/commit-msg';
const CONFIG_FILE = '.linear-workflow.json';

// ============================================================================
// Test Cases
// ============================================================================

const TEST_CASES = [
  {
    name: 'Valid commit with issue in parens',
    message: 'feat: Add user authentication (DEV-123)',
    shouldPass: true,
    description: 'Should accept commit with issue ID in parentheses'
  },
  {
    name: 'Valid commit with issue prefix',
    message: 'DEV-456: Fix login bug',
    shouldPass: true,
    description: 'Should accept commit with issue ID as prefix'
  },
  {
    name: 'Valid commit with issue in scope',
    message: 'fix(DEV-789): Resolve API timeout',
    shouldPass: true,
    description: 'Should accept commit with issue ID in scope'
  },
  {
    name: 'Invalid commit without issue',
    message: 'feat: Add new feature',
    shouldPass: false,
    description: 'Should reject commit without issue ID'
  },
  {
    name: 'Invalid commit with wrong format',
    message: 'Some random commit message',
    shouldPass: false,
    description: 'Should reject commit with no issue ID'
  },
  {
    name: 'Merge commit (should skip validation)',
    message: 'Merge branch "feature/test" into main',
    shouldPass: true,
    description: 'Should allow merge commits without issue ID'
  },
  {
    name: 'Revert commit (should skip validation)',
    message: 'Revert "feat: Add user authentication"',
    shouldPass: true,
    description: 'Should allow revert commits without issue ID'
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load configuration to get issue pattern
 */
function loadConfig() {
  try {
    const content = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`✗ Could not load ${CONFIG_FILE}`);
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

/**
 * Check if hook file exists and is executable
 */
function checkHookInstalled() {
  if (!fs.existsSync(HOOK_PATH)) {
    return { installed: false, error: 'Hook file does not exist' };
  }

  try {
    const stats = fs.statSync(HOOK_PATH);
    const isExecutable = (stats.mode & 0o111) !== 0;

    if (!isExecutable) {
      return { installed: false, error: 'Hook file is not executable' };
    }

    return { installed: true };
  } catch (error) {
    return { installed: false, error: error.message };
  }
}

/**
 * Test a single commit message
 */
function testCommitMessage(message, hookPath) {
  // Create temporary commit message file
  const tempFile = '.git/COMMIT_MSG_TEST';

  try {
    fs.writeFileSync(tempFile, message, 'utf8');

    // Execute hook with temp file
    execSync(`${hookPath} ${tempFile}`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });

    // If we reach here, hook passed
    return { passed: true, output: '' };

  } catch (error) {
    // Hook failed (exit code non-zero)
    return {
      passed: false,
      output: error.stderr || error.stdout || error.message
    };

  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// ============================================================================
// Test Execution
// ============================================================================

function runTests(verbose = false) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Git Hook Validation Tests');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Step 1: Check configuration exists
  console.log('[1/4] Checking configuration...');

  const config = loadConfig();

  if (!config) {
    console.log('  ✗ Configuration not found');
    console.log('');
    console.log('Run the setup wizard first:');
    console.log('  /setup-linear');
    console.log('');
    process.exit(1);
  }

  console.log('  ✓ Configuration loaded');
  console.log(`  Pattern: ${config.formats?.issuePattern || 'Not set'}`);
  console.log(`  Example: ${config.formats?.issueExample || 'Not set'}`);
  console.log('');

  // Step 2: Check hook is installed
  console.log('[2/4] Checking hook installation...');

  const hookCheck = checkHookInstalled();

  if (!hookCheck.installed) {
    console.log(`  ✗ Hook not properly installed`);
    console.log(`  Error: ${hookCheck.error}`);
    console.log('');
    console.log('To install the hook:');
    console.log('  1. Run the setup wizard');
    console.log('  2. Or manually copy: cp templates/commit-msg.template .git/hooks/commit-msg');
    console.log('  3. Make executable: chmod +x .git/hooks/commit-msg');
    console.log('');
    process.exit(1);
  }

  console.log('  ✓ Hook is installed');
  console.log(`  Location: ${HOOK_PATH}`);
  console.log('');

  // Step 3: Verify hook content is correct
  console.log('[3/4] Verifying hook configuration...');

  const hookContent = fs.readFileSync(HOOK_PATH, 'utf8');

  if (!hookContent.includes(config.formats?.issuePattern || '')) {
    console.log('  ⚠️  Hook may not be configured correctly');
    console.log('  The issue pattern in the hook does not match your configuration');
    console.log('');
    console.log('  Expected pattern:', config.formats?.issuePattern);
    console.log('');
    console.log('  You may need to reinstall the hook with updated configuration.');
    console.log('');
  } else {
    console.log('  ✓ Hook is configured correctly');
    console.log('');
  }

  // Step 4: Run test cases
  console.log('[4/4] Running validation tests...');
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    const result = testCommitMessage(testCase.message, HOOK_PATH);

    const success = result.passed === testCase.shouldPass;

    if (success) {
      passed++;
      console.log(`  ✓ ${testCase.name}`);

      if (verbose) {
        console.log(`    Message: "${testCase.message}"`);
        console.log(`    Expected: ${testCase.shouldPass ? 'Pass' : 'Fail'}`);
        console.log(`    Result: ${result.passed ? 'Passed' : 'Failed'} ✓`);
      }
    } else {
      failed++;
      console.log(`  ✗ ${testCase.name}`);
      console.log(`    Message: "${testCase.message}"`);
      console.log(`    Expected: ${testCase.shouldPass ? 'Pass' : 'Fail'}`);
      console.log(`    Result: ${result.passed ? 'Passed' : 'Failed'} ✗`);

      if (verbose && result.output) {
        console.log('    Output:');
        result.output.split('\n').forEach(line => {
          if (line.trim()) {
            console.log(`      ${line}`);
          }
        });
      }
    }

    console.log('');
  }

  // Results summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Test Results');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Passed: ${passed}/${TEST_CASES.length}`);
  console.log(`Failed: ${failed}/${TEST_CASES.length}`);
  console.log('');

  if (failed === 0) {
    console.log('✅ All tests passed!');
    console.log('');
    console.log('Your commit-msg hook is working correctly.');
    console.log('All commits will now be validated for Linear issue IDs.');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    console.log('');
    console.log('Your commit-msg hook may not be working correctly.');
    console.log('');
    console.log('To fix:');
    console.log('  1. Check hook permissions: ls -la .git/hooks/commit-msg');
    console.log('  2. Verify configuration: cat .linear-workflow.json');
    console.log('  3. Reinstall hook: Run setup wizard');
    console.log('');
    console.log('For detailed output, run:');
    console.log('  node scripts/test-git-hook.js --verbose');
    console.log('');
    process.exit(1);
  }
}

// ============================================================================
// Main CLI
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  runTests(verbose);
}

if (require.main === module) {
  main();
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  checkHookInstalled,
  testCommitMessage,
  runTests,
  TEST_CASES
};
