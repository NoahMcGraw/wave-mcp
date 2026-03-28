/**
 * Wave Chart of Accounts Tools
 */

import type { WaveClient } from '../client.js';
import type { Account } from '../types/index.js';

export function registerAccountTools(client: WaveClient) {
  return {
    wave_list_accounts: {
      description: 'List all accounts in the chart of accounts',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          type: { 
            type: 'string', 
            description: 'Filter by account type (ASSET, LIABILITY, EQUITY, INCOME, EXPENSE)' 
          },
          isArchived: { type: 'boolean', description: 'Include archived accounts (default: false)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
          pageSize: { type: 'number', description: 'Results per page (default: 100)' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetAccounts($businessId: ID!, $page: Int!, $pageSize: Int!) {
            business(id: $businessId) {
              accounts(page: $page, pageSize: $pageSize) {
                pageInfo {
                  currentPage
                  totalPages
                  totalCount
                }
                edges {
                  node {
                    id
                    name
                    description
                    type {
                      name
                      normalBalanceType
                    }
                    subtype {
                      name
                      value
                    }
                    currency {
                      code
                      symbol
                    }
                    isArchived
                  }
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          page: args.page || 1,
          pageSize: Math.min(args.pageSize || 100, 100),
        });

        let accounts = result.business.accounts.edges.map((e: any) => e.node);

        if (args.type) {
          accounts = accounts.filter((a: any) => a.type.name === args.type);
        }

        if (args.isArchived === false) {
          accounts = accounts.filter((a: any) => !a.isArchived);
        }

        return {
          accounts,
          pageInfo: result.business.accounts.pageInfo,
        };
      },
    },

    wave_get_account: {
      description: 'Get detailed information about a specific account',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          accountId: { type: 'string', description: 'Account ID' },
        },
        required: ['accountId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetAccount($businessId: ID!, $accountId: ID!) {
            business(id: $businessId) {
              account(id: $accountId) {
                id
                name
                description
                type {
                  name
                  normalBalanceType
                }
                subtype {
                  name
                  value
                }
                currency {
                  code
                  symbol
                }
                isArchived
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          accountId: args.accountId,
        });

        return result.business.account;
      },
    },

    wave_create_account: {
      description: 'Create a new account in the chart of accounts',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          name: { type: 'string', description: 'Account name' },
          description: { type: 'string', description: 'Account description' },
          type: { 
            type: 'string', 
            description: 'Account type: ASSET, LIABILITY, EQUITY, INCOME, EXPENSE',
            enum: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']
          },
          subtype: { type: 'string', description: 'Account subtype code' },
          currency: { type: 'string', description: 'Currency code (e.g., USD)' },
        },
        required: ['name', 'type'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateAccount($input: AccountCreateInput!) {
            accountCreate(input: $input) {
              account {
                id
                name
                description
                type {
                  name
                  normalBalanceType
                }
                subtype {
                  name
                  value
                }
                currency {
                  code
                }
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
            description: args.description,
            type: args.type,
            subtype: args.subtype,
            currency: args.currency,
          },
        });

        if (!result.accountCreate.didSucceed) {
          throw new Error(`Failed to create account: ${JSON.stringify(result.accountCreate.inputErrors)}`);
        }

        return result.accountCreate.account;
      },
    },

    wave_update_account: {
      description: 'Update an existing account',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          accountId: { type: 'string', description: 'Account ID' },
          name: { type: 'string', description: 'Account name' },
          description: { type: 'string', description: 'Account description' },
        },
        required: ['accountId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation UpdateAccount($input: AccountUpdateInput!) {
            accountUpdate(input: $input) {
              account {
                id
                name
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
            accountId: args.accountId,
            name: args.name,
            description: args.description,
          },
        });

        if (!result.accountUpdate.didSucceed) {
          throw new Error(`Failed to update account: ${JSON.stringify(result.accountUpdate.inputErrors)}`);
        }

        return result.accountUpdate.account;
      },
    },
  };
}
