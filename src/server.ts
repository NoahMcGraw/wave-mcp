/**
 * Wave MCP Server Implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createWaveClient, WaveClient } from './client.js';
import { registerInvoiceTools } from './tools/invoices-tools.js';
import { registerCustomerTools } from './tools/customers-tools.js';
import { registerProductTools } from './tools/products-tools.js';
import { registerAccountTools } from './tools/accounts-tools.js';
import { registerTransactionTools } from './tools/transactions-tools.js';
import { registerBillTools } from './tools/bills-tools.js';
import { registerEstimateTools } from './tools/estimates-tools.js';
import { registerTaxTools } from './tools/taxes-tools.js';
import { registerBusinessTools } from './tools/businesses-tools.js';
import { registerReportingTools } from './tools/reporting-tools.js';
import { waveApps } from './apps/index.js';

export class WaveMCPServer {
  private server: Server;
  private client: WaveClient;
  private tools: Map<string, any>;

  constructor(accessToken: string, businessId?: string) {
    this.server = new Server(
      {
        name: 'wave-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.client = createWaveClient({ accessToken, businessId });
    this.tools = new Map();

    this.registerAllTools();
    this.setupHandlers();
  }

  private registerAllTools(): void {
    const toolSets = [
      registerInvoiceTools(this.client),
      registerCustomerTools(this.client),
      registerProductTools(this.client),
      registerAccountTools(this.client),
      registerTransactionTools(this.client),
      registerBillTools(this.client),
      registerEstimateTools(this.client),
      registerTaxTools(this.client),
      registerBusinessTools(this.client),
      registerReportingTools(this.client),
    ];

    for (const toolSet of toolSets) {
      for (const [name, tool] of Object.entries(toolSet)) {
        this.tools.set(name, tool);
      }
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Array.from(this.tools.entries()).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: tool.parameters?.properties || {},
          required: tool.parameters?.required || [],
        },
      }));

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const tool = this.tools.get(name);
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      try {
        const result = await tool.handler(args || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = waveApps.map((app) => ({
        uri: `wave://apps/${app.name}`,
        name: app.displayName,
        description: app.description,
        mimeType: 'application/json',
      }));

      // Add dynamic resources for businesses
      resources.push({
        uri: 'wave://businesses',
        name: 'Businesses',
        description: 'List of accessible Wave businesses',
        mimeType: 'application/json',
      });

      return { resources };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri.startsWith('wave://apps/')) {
        const appName = uri.replace('wave://apps/', '');
        const app = waveApps.find((a) => a.name === appName);

        if (!app) {
          throw new Error(`App not found: ${appName}`);
        }

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(app, null, 2),
            },
          ],
        };
      }

      if (uri === 'wave://businesses') {
        const businessesTool = this.tools.get('wave_list_businesses');
        const businesses = await businessesTool.handler({});

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(businesses, null, 2),
            },
          ],
        };
      }

      throw new Error(`Resource not found: ${uri}`);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}
