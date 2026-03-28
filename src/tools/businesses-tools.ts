/**
 * Wave Business Tools
 */

import type { WaveClient } from '../client.js';
import type { Business } from '../types/index.js';

export function registerBusinessTools(client: WaveClient) {
  return {
    wave_list_businesses: {
      description: 'List all businesses accessible with the current access token',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async (args: any) => {
        const query = `
          query ListBusinesses($page: Int!, $pageSize: Int!) {
            businesses(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  name
                  currency {
                    code
                    symbol
                  }
                }
              }
            }
          }
        `;

        const result = await client.query(query, { page: 1, pageSize: 50 });

        return result.businesses.edges.map((e: any) => e.node);
      },
    },

    wave_get_business: {
      description: 'Get detailed information about a specific business',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
        },
        required: ['businessId'],
      },
      handler: async (args: any) => {
        const query = `
          query GetBusiness($businessId: ID!) {
            business(id: $businessId) {
              id
              name
              currency {
                code
                symbol
              }
              timezone
              address {
                addressLine1
                addressLine2
                city
                provinceCode
                countryCode
                postalCode
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId: args.businessId,
        });

        return result.business;
      },
    },

    wave_get_current_business: {
      description: 'Get the currently active business (if businessId is set globally)',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async (args: any) => {
        const businessId = client.getBusinessId();
        if (!businessId) {
          throw new Error('No business ID set. Use wave_list_businesses to see available businesses.');
        }

        const query = `
          query GetBusiness($businessId: ID!) {
            business(id: $businessId) {
              id
              name
              currency {
                code
                symbol
              }
              timezone
              address {
                addressLine1
                addressLine2
                city
                provinceCode
                countryCode
                postalCode
              }
            }
          }
        `;

        const result = await client.query(query, { businessId });

        return result.business;
      },
    },
  };
}
