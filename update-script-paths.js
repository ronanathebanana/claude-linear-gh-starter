#!/usr/bin/env node

/**
 * Updates all script paths after reorganization
 * Run this AFTER prepare-for-release.sh
 */

const fs = require('fs');
const path = require('path');

// Path mappings after reorganization
const PATH_UPDATES = {
  // Template paths
  'templates/github-workflow.yml.template': 'install/templates/workflow/github-workflow.yml.template',
  'templates/linear-workflow.md.template': 'install/templates/workflow/linear-workflow.md.template',
  'templates/commit-msg.template': 'install/templates/workflow/commit-msg.template',
  'templates/claude-instructions.md.template': 'install/templates/workflow/claude-instructions.md.template',
  'templates/config-file.json.template': 'install/templates/config/config-file.json.template',
  'templates/mcp-config.json.template': 'install/templates/config/mcp-config.json.template',
  'templates/commands/': 'install/templates/commands/',

  // Script paths
  'scripts/': 'install/scripts/',
  '../scripts/': '../',
  './scripts/': './install/scripts/',

  // Config paths
  'setup/config-profiles.json': 'install/config/profiles.json',
  'setup/config-schema.json': 'install/config/schema.json',
};

// Files to update
const FILES_TO_UPDATE = [
  'install/scripts/*.js',
  'CLAUDE.md',
  '.claude/commands/*.md',
  'docs/*.md',
  'docs/examples/*.md'
];

function updatePaths(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Apply path updates
  for (const [oldPath, newPath] of Object.entries(PATH_UPDATES)) {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const originalContent = content;
    content = content.replace(regex, newPath);

    if (content !== originalContent) {
      updated = true;
      console.log(`  ✓ Updated ${oldPath} → ${newPath}`);
    }
  }

  // Special case: Update require paths in JavaScript files
  if (filePath.endsWith('.js')) {
    // Update relative requires
    content = content.replace(/require\(['"]\.\.\/([^'"]+)['"]\)/g, (match, p1) => {
      if (p1.startsWith('scripts/')) {
        return `require('./${p1.replace('scripts/', '')}')`;
      }
      return match;
    });

    // Update template paths in code
    content = content.replace(/['"]templates\/([^'"]+)['"]/g, (match, p1) => {
      if (p1.includes('commands/')) {
        return `'install/templates/${p1}'`;
      }
      if (p1.endsWith('.template')) {
        const category = p1.includes('workflow') ? 'workflow' :
                        p1.includes('config') ? 'config' : 'workflow';
        return `'install/templates/${category}/${p1}'`;
      }
      return match;
    });
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
  }
}

function findFiles(pattern) {
  const glob = require('glob');
  return glob.sync(pattern);
}

console.log('Updating paths in scripts and documentation...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Process each file pattern
for (const pattern of FILES_TO_UPDATE) {
  const files = findFiles(pattern);
  for (const file of files) {
    updatePaths(file);
  }
}

// Update CLAUDE.md specifically
console.log('\nUpdating CLAUDE.md paths...');
const claudeMdPath = 'CLAUDE.md';
if (fs.existsSync(claudeMdPath)) {
  let content = fs.readFileSync(claudeMdPath, 'utf8');

  // Update setup tool path references
  content = content.replace(/\{\{setupToolPath\}\}/g, '.');
  content = content.replace(/templates\/commands\//g, 'install/templates/commands/');
  content = content.replace(/templates\//g, 'install/templates/workflow/');
  content = content.replace(/scripts\//g, 'install/scripts/');
  content = content.replace(/setup\//g, 'install/config/');

  fs.writeFileSync(claudeMdPath, content);
  console.log('✓ Updated CLAUDE.md');
}

console.log('\n✅ Path updates complete!');
console.log('\nIMPORTANT: You still need to:');
console.log('  1. Test the setup wizard after reorganization');
console.log('  2. Verify all template paths work correctly');
console.log('  3. Update any hardcoded paths in documentation');