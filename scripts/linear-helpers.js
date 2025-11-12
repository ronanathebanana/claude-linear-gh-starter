#!/usr/bin/env node

/**
 * Linear API Helpers
 *
 * Helper functions for interacting with Linear API, including:
 * - Fetching team members
 * - Getting user IDs
 * - Listing workflow states
 * - Validating API keys
 *
 * Usage:
 *   const { getTeamMembers, getUserByEmail } = require('./linear-helpers.js');
 */

const https = require('https');

// ============================================================================
// Linear API Client
// ============================================================================

/**
 * Make a GraphQL request to Linear API
 * @param {string} apiKey - Linear API key
 * @param {string} query - GraphQL query
 * @param {Object} variables - GraphQL variables
 * @returns {Promise<Object>} API response data
 */
async function linearRequest(apiKey, query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });

    const options = {
      hostname: 'api.linear.app',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': apiKey
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);

          if (parsed.errors) {
            reject(new Error(parsed.errors[0].message));
            return;
          }

          resolve(parsed.data);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// ============================================================================
// Team Members
// ============================================================================

/**
 * Get all team members from a Linear team
 * @param {string} apiKey - Linear API key
 * @param {string} teamId - Team UUID
 * @returns {Promise<Array>} Array of team members
 */
async function getTeamMembers(apiKey, teamId) {
  const query = `
    query GetTeamMembers($teamId: String!) {
      team(id: $teamId) {
        members {
          nodes {
            id
            name
            email
            displayName
            active
            admin
          }
        }
      }
    }
  `;

  const data = await linearRequest(apiKey, query, { teamId });
  return data.team.members.nodes;
}

/**
 * Get all users in the workspace
 * @param {string} apiKey - Linear API key
 * @returns {Promise<Array>} Array of users
 */
async function getWorkspaceUsers(apiKey) {
  const query = `
    query GetUsers {
      users {
        nodes {
          id
          name
          email
          displayName
          active
          admin
        }
      }
    }
  `;

  const data = await linearRequest(apiKey, query);
  return data.users.nodes;
}

/**
 * Get user by email address
 * @param {string} apiKey - Linear API key
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
async function getUserByEmail(apiKey, email) {
  const users = await getWorkspaceUsers(apiKey);
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Get user by name
 * @param {string} apiKey - Linear API key
 * @param {string} name - User name or display name
 * @returns {Promise<Object|null>} User object or null
 */
async function getUserByName(apiKey, name) {
  const users = await getWorkspaceUsers(apiKey);
  const nameLower = name.toLowerCase();
  return users.find(u =>
    u.name.toLowerCase() === nameLower ||
    (u.displayName && u.displayName.toLowerCase() === nameLower)
  ) || null;
}

// ============================================================================
// Workspace & Teams
// ============================================================================

/**
 * Get current viewer information (the authenticated user)
 * @param {string} apiKey - Linear API key
 * @returns {Promise<Object>} Viewer object
 */
async function getViewer(apiKey) {
  const query = `
    query GetViewer {
      viewer {
        id
        name
        email
        displayName
      }
    }
  `;

  const data = await linearRequest(apiKey, query);
  return data.viewer;
}

/**
 * Get all teams in workspace
 * @param {string} apiKey - Linear API key
 * @returns {Promise<Array>} Array of teams
 */
async function getTeams(apiKey) {
  const query = `
    query GetTeams {
      teams {
        nodes {
          id
          key
          name
          description
        }
      }
    }
  `;

  const data = await linearRequest(apiKey, query);
  return data.teams.nodes;
}

/**
 * Get workflow states for a team
 * @param {string} apiKey - Linear API key
 * @param {string} teamId - Team UUID
 * @returns {Promise<Array>} Array of workflow states
 */
async function getWorkflowStates(apiKey, teamId) {
  const query = `
    query GetWorkflowStates($teamId: String!) {
      team(id: $teamId) {
        states {
          nodes {
            id
            name
            type
            color
            position
          }
        }
      }
    }
  `;

  const data = await linearRequest(apiKey, query);
  return data.team.states.nodes;
}

// ============================================================================
// Display Helpers
// ============================================================================

/**
 * Format team members for display
 * @param {Array} members - Array of team member objects
 * @returns {string} Formatted string
 */
function formatTeamMembers(members) {
  const lines = ['Team Members:', ''];

  const activeMembers = members.filter(m => m.active);

  activeMembers.forEach((member, index) => {
    const name = member.displayName || member.name;
    const admin = member.admin ? ' (Admin)' : '';
    lines.push(`${index + 1}. ${name}${admin}`);
    lines.push(`   Email: ${member.email}`);
    lines.push(`   ID: ${member.id}`);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Display team members in a selectable list
 * @param {Array} members - Array of team member objects
 * @returns {string} Formatted numbered list
 */
function displayTeamMembersList(members) {
  const lines = [];

  const activeMembers = members.filter(m => m.active);

  activeMembers.forEach((member, index) => {
    const name = member.displayName || member.name;
    const admin = member.admin ? ' (Admin)' : '';
    lines.push(`${index + 1}. ${name} - ${member.email}${admin}`);
  });

  return lines.join('\n');
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // API client
  linearRequest,

  // Team members
  getTeamMembers,
  getWorkspaceUsers,
  getUserByEmail,
  getUserByName,

  // Workspace & teams
  getViewer,
  getTeams,
  getWorkflowStates,

  // Display helpers
  formatTeamMembers,
  displayTeamMembersList
};

// ============================================================================
// CLI Usage
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  // Show help without requiring API key
  if (!command || command === 'help') {
    console.log(`
Linear API Helpers

Usage:
  LINEAR_API_KEY=lin_api_... node linear-helpers.js <command> [args]

Commands:
  viewer                  Show current user info
  teams                   List all teams
  team-members TEAM_ID    List team members
  users                   List all workspace users
  find-user EMAIL         Find user by email
  states TEAM_ID          List workflow states for team

Examples:
  node linear-helpers.js viewer
  node linear-helpers.js team-members abc-123-uuid
  node linear-helpers.js find-user user@example.com
`);
    process.exit(0);
  }

  // Require API key for all other commands
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    console.error('Error: LINEAR_API_KEY environment variable not set');
    console.error('Usage: LINEAR_API_KEY=lin_api_... node linear-helpers.js <command>');
    process.exit(1);
  }

  (async () => {
    try {
      if (command === 'viewer') {
        const viewer = await getViewer(apiKey);
        console.log('Current User:');
        console.log(`  Name: ${viewer.displayName || viewer.name}`);
        console.log(`  Email: ${viewer.email}`);
        console.log(`  ID: ${viewer.id}`);

      } else if (command === 'teams') {
        const teams = await getTeams(apiKey);
        console.log('Teams:\n');
        teams.forEach((team, index) => {
          console.log(`${index + 1}. ${team.key} - ${team.name}`);
          console.log(`   ID: ${team.id}`);
          if (team.description) {
            console.log(`   Description: ${team.description}`);
          }
          console.log('');
        });

      } else if (command === 'team-members' && args.length >= 2) {
        const teamId = args[1];
        const members = await getTeamMembers(apiKey, teamId);
        console.log(formatTeamMembers(members));

      } else if (command === 'users') {
        const users = await getWorkspaceUsers(apiKey);
        console.log('Workspace Users:\n');
        users.filter(u => u.active).forEach((user, index) => {
          const name = user.displayName || user.name;
          console.log(`${index + 1}. ${name} - ${user.email}`);
          console.log(`   ID: ${user.id}`);
          console.log('');
        });

      } else if (command === 'find-user' && args.length >= 2) {
        const email = args[1];
        const user = await getUserByEmail(apiKey, email);

        if (user) {
          console.log('User Found:');
          console.log(`  Name: ${user.displayName || user.name}`);
          console.log(`  Email: ${user.email}`);
          console.log(`  ID: ${user.id}`);
          console.log(`  Active: ${user.active}`);
          console.log(`  Admin: ${user.admin}`);
        } else {
          console.log(`User not found: ${email}`);
        }

      } else if (command === 'states' && args.length >= 2) {
        const teamId = args[1];
        const states = await getWorkflowStates(apiKey, teamId);
        console.log('Workflow States:\n');
        states.forEach((state, index) => {
          console.log(`${index + 1}. ${state.name} (${state.type})`);
          console.log(`   ID: ${state.id}`);
          console.log('');
        });

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
