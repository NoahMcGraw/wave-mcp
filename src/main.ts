#!/usr/bin/env node

/**
 * Wave MCP Server Entry Point
 */

import { WaveMCPServer } from './server.js';

async function main() {
  const accessToken = process.env.WAVE_ACCESS_TOKEN;
  const businessId = process.env.WAVE_BUSINESS_ID;

  if (!accessToken) {
    console.error('Error: WAVE_ACCESS_TOKEN environment variable is required');
    console.error('');
    console.error('To get your Wave access token:');
    console.error('1. Go to https://developer.waveapps.com/');
    console.error('2. Create an application or use an existing one');
    console.error('3. Generate an OAuth2 access token');
    console.error('4. Set WAVE_ACCESS_TOKEN environment variable');
    console.error('');
    console.error('Example usage:');
    console.error('  WAVE_ACCESS_TOKEN=your_token wave-mcp');
    console.error('  WAVE_ACCESS_TOKEN=your_token WAVE_BUSINESS_ID=business_id wave-mcp');
    process.exit(1);
  }

  const server = new WaveMCPServer(accessToken, businessId);

  console.error('Wave MCP Server starting...');
  console.error(`Access token: ${accessToken.substring(0, 10)}...`);
  if (businessId) {
    console.error(`Default business ID: ${businessId}`);
  }
  console.error('Server ready. Awaiting requests...');

  await server.run();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
