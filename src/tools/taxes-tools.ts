/**
 * Wave Tax Tools
 */

import type { WaveClient } from '../client.js';
import type { Tax } from '../types/index.js';

export function registerTaxTools(client: WaveClient) {
  return {
    wave_list_taxes: {
      description: 'List all sales taxes configured for a business',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          isArchived: { type: 'boolean', description: 'Include archived taxes (default: false)' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetTaxes($businessId: ID!) {
            business(id: $businessId) {
              taxes {
                id
                name
                abbreviation
                description
                rate
                isArchived
              }
            }
          }
        `;

        const result = await client.query(query, { businessId });

        let taxes = result.business.taxes;

        if (args.isArchived === false) {
          taxes = taxes.filter((t: any) => !t.isArchived);
        }

        return taxes;
      },
    },

    wave_get_tax: {
      description: 'Get detailed information about a specific tax',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          taxId: { type: 'string', description: 'Tax ID' },
        },
        required: ['taxId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetTax($businessId: ID!, $taxId: ID!) {
            business(id: $businessId) {
              tax(id: $taxId) {
                id
                name
                abbreviation
                description
                rate
                isArchived
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          taxId: args.taxId,
        });

        return result.business.tax;
      },
    },

    wave_create_tax: {
      description: 'Create a new sales tax',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          name: { type: 'string', description: 'Tax name (e.g., "Sales Tax")' },
          abbreviation: { type: 'string', description: 'Tax abbreviation (e.g., "ST")' },
          rate: { type: 'string', description: 'Tax rate as decimal (e.g., "0.0875" for 8.75%)' },
          description: { type: 'string', description: 'Tax description' },
        },
        required: ['name', 'rate'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateTax($input: TaxCreateInput!) {
            taxCreate(input: $input) {
              tax {
                id
                name
                abbreviation
                rate
                description
              }
              didSucceed
              inputErrors {
                message
                path
              }
            }
          }
        `;

        const result = await client.mutate(mutation, {
          input: {
            businessId,
            name: args.name,
            abbreviation: args.abbreviation,
            rate: args.rate,
            description: args.description,
          },
        });

        if (!result.taxCreate.didSucceed) {
          throw new Error(`Failed to create tax: ${JSON.stringify(result.taxCreate.inputErrors)}`);
        }

        return result.taxCreate.tax;
      },
    },
  };
}
