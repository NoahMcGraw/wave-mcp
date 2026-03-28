/**
 * Wave Transaction Tools
 */

import type { WaveClient } from '../client.js';
import type { Transaction } from '../types/index.js';

export function registerTransactionTools(client: WaveClient) {
  return {
    wave_list_transactions: {
      description: 'List transactions for a business with filtering options',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          accountId: { type: 'string', description: 'Filter by specific account ID' },
          startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
          pageSize: { type: 'number', description: 'Results per page (default: 50)' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetTransactions($businessId: ID!, $page: Int!, $pageSize: Int!) {
            business(id: $businessId) {
              transactions(page: $page, pageSize: $pageSize) {
                pageInfo {
                  currentPage
                  totalPages
                  totalCount
                }
                edges {
                  node {
                    id
                    description
                    amount {
                      value
                      currency { code }
                    }
                    date
                    accountTransaction {
                      account {
                        id
                        name
                        type { name }
                      }
                      amount { value }
                    }
                    createdAt
                    modifiedAt
                  }
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          page: args.page || 1,
          pageSize: Math.min(args.pageSize || 50, 100),
        });

        let transactions = result.business.transactions.edges.map((e: any) => e.node);

        // Client-side filtering
        if (args.accountId) {
          transactions = transactions.filter((t: any) => 
            t.accountTransaction?.account?.id === args.accountId
          );
        }

        if (args.startDate) {
          transactions = transactions.filter((t: any) => t.date >= args.startDate);
        }

        if (args.endDate) {
          transactions = transactions.filter((t: any) => t.date <= args.endDate);
        }

        return {
          transactions,
          pageInfo: result.business.transactions.pageInfo,
        };
      },
    },

    wave_get_transaction: {
      description: 'Get detailed information about a specific transaction',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          transactionId: { type: 'string', description: 'Transaction ID' },
        },
        required: ['transactionId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetTransaction($businessId: ID!, $transactionId: ID!) {
            business(id: $businessId) {
              transaction(id: $transactionId) {
                id
                description
                amount {
                  value
                  currency { code symbol }
                }
                date
                accountTransaction {
                  account {
                    id
                    name
                    type { name }
                  }
                  amount { value }
                }
                createdAt
                modifiedAt
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          transactionId: args.transactionId,
        });

        return result.business.transaction;
      },
    },

    wave_create_transaction: {
      description: 'Create a new transaction',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          description: { type: 'string', description: 'Transaction description' },
          date: { type: 'string', description: 'Transaction date (YYYY-MM-DD)' },
          amount: { type: 'string', description: 'Transaction amount' },
          accountId: { type: 'string', description: 'Account ID for categorization' },
        },
        required: ['description', 'date', 'amount', 'accountId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateTransaction($input: TransactionCreateInput!) {
            transactionCreate(input: $input) {
              transaction {
                id
                description
                amount {
                  value
                  currency { code }
                }
                date
                accountTransaction {
                  account {
                    id
                    name
                  }
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
            description: args.description,
            date: args.date,
            amount: args.amount,
            accountId: args.accountId,
          },
        });

        if (!result.transactionCreate.didSucceed) {
          throw new Error(`Failed to create transaction: ${JSON.stringify(result.transactionCreate.inputErrors)}`);
        }

        return result.transactionCreate.transaction;
      },
    },

    wave_update_transaction: {
      description: 'Update an existing transaction',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          transactionId: { type: 'string', description: 'Transaction ID' },
          description: { type: 'string', description: 'Transaction description' },
          date: { type: 'string', description: 'Transaction date (YYYY-MM-DD)' },
        },
        required: ['transactionId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation UpdateTransaction($input: TransactionUpdateInput!) {
            transactionUpdate(input: $input) {
              transaction {
                id
                description
                date
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
            transactionId: args.transactionId,
            description: args.description,
            date: args.date,
          },
        });

        if (!result.transactionUpdate.didSucceed) {
          throw new Error(`Failed to update transaction: ${JSON.stringify(result.transactionUpdate.inputErrors)}`);
        }

        return result.transactionUpdate.transaction;
      },
    },

    wave_categorize_transaction: {
      description: 'Categorize/recategorize a transaction to a different account',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          transactionId: { type: 'string', description: 'Transaction ID' },
          accountId: { type: 'string', description: 'New account ID for categorization' },
        },
        required: ['transactionId', 'accountId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CategorizeTransaction($input: TransactionCategorizeInput!) {
            transactionCategorize(input: $input) {
              transaction {
                id
                accountTransaction {
                  account {
                    id
                    name
                    type { name }
                  }
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
            transactionId: args.transactionId,
            accountId: args.accountId,
          },
        });

        if (!result.transactionCategorize.didSucceed) {
          throw new Error(`Failed to categorize transaction: ${JSON.stringify(result.transactionCategorize.inputErrors)}`);
        }

        return result.transactionCategorize.transaction;
      },
    },

    wave_list_transaction_attachments: {
      description: 'List attachments (receipts, documents) for a transaction',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          transactionId: { type: 'string', description: 'Transaction ID' },
        },
        required: ['transactionId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetTransactionAttachments($businessId: ID!, $transactionId: ID!) {
            business(id: $businessId) {
              transaction(id: $transactionId) {
                id
                attachments {
                  id
                  filename
                  url
                  mimeType
                  size
                  createdAt
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          transactionId: args.transactionId,
        });

        return result.business.transaction.attachments;
      },
    },
  };
}
