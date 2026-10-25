/**
 * Wave Transaction Tools
 */

import type { WaveClient } from '../client.js';
import type { Transaction } from '../types/index.js';

export function registerTransactionTools(client: WaveClient) {
  return {
    wave_list_transactions: {
      description:
        'UNSUPPORTED: Wave\'s public GraphQL API has no transaction-listing endpoint. ' +
        'Use wave_get_account_balances to verify balances, or export transactions from the Wave UI.',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        throw new Error(
          'wave_list_transactions is not supported by the Wave public API. ' +
          'The API cannot list transactions (only create them and read account balances). ' +
          'Use wave_get_account_balances, or export from the Wave UI.'
        );
      },
    },

    wave_get_transaction: {
      description:
        'UNSUPPORTED: Wave\'s public GraphQL API cannot read individual transactions.',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        throw new Error(
          'wave_get_transaction is not supported by the Wave public API. ' +
          'The API cannot read transactions (only create them and read account balances).'
        );
      },
    },

    wave_create_transaction: {
      description:
        'Create a double-entry transaction (journal entry) in Wave. ' +
        'Simple form: provide `bankAccountId` (cash/bank account — the anchor), `accountId` (category), `amount`, `direction`. ' +
        'Full form: provide `bankAccountId` (anchor) plus `lineItems` for complex entries.',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          description: { type: 'string', description: 'Transaction description' },
          date: { type: 'string', description: 'Transaction date (YYYY-MM-DD)' },
          notes: { type: 'string', description: 'Optional internal notes' },
          amount: { type: 'string', description: 'Amount' },
          bankAccountId: { type: 'string', description: 'Cash/bank account ID (the money anchor)' },
          accountId: { type: 'string', description: 'Category account ID (income/expense/etc.)' },
          direction: {
            type: 'string',
            enum: ['DEPOSIT', 'WITHDRAWAL'],
            description: 'DEPOSIT = money into bank (category credited); WITHDRAWAL = money out of bank (category debited)',
          },
          lineItems: {
            type: 'array',
            description: 'Optional extra line items (full double-entry). Each: { accountId, amount, balance (DEBIT|CREDIT) }',
            items: {
              type: 'object',
              properties: {
                accountId: { type: 'string' },
                amount: { type: 'string' },
                balance: { type: 'string', enum: ['DEBIT', 'CREDIT'] },
                description: { type: 'string' },
              },
              required: ['accountId', 'amount', 'balance'],
            },
          },
        },
        required: ['date', 'description', 'bankAccountId', 'amount'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        if (!args.bankAccountId || !args.amount) {
          throw new Error('bankAccountId and amount are required.');
        }

        const direction: 'DEPOSIT' | 'WITHDRAWAL' = (args.direction || 'WITHDRAWAL').toUpperCase();

        // Line items carry the categorization (opposite leg of the bank anchor).
        let lineItems: any[];
        if (Array.isArray(args.lineItems) && args.lineItems.length > 0) {
          lineItems = args.lineItems;
        } else if (args.accountId) {
          // Single category leg.
          lineItems = [
            {
              accountId: args.accountId,
              amount: args.amount,
              balance: direction === 'DEPOSIT' ? 'CREDIT' : 'DEBIT',
              description: args.description,
            },
          ];
        } else {
          throw new Error('Provide either `accountId` (simple) or `lineItems` (full double-entry).');
        }

        const input = {
          businessId,
          externalId: `ext_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
          date: args.date,
          description: args.description,
          notes: args.notes,
          anchor: {
            accountId: args.bankAccountId,
            amount: args.amount,
            direction,
          },
          lineItems,
        };

        const mutation = `
          mutation CreateTransaction($input: MoneyTransactionCreateInput!) {
            moneyTransactionCreate(input: $input) {
              transaction {
                id
              }
              didSucceed
              inputErrors {
                message
                path
              }
            }
          }
        `;

        const result = await client.mutate(mutation, { input });

        if (!result.moneyTransactionCreate.didSucceed) {
          throw new Error(`Failed to create transaction: ${JSON.stringify(result.moneyTransactionCreate.inputErrors)}`);
        }

        return result.moneyTransactionCreate.transaction;
      },
    },

    wave_get_account_balances: {
      description: 'Read current balances for a business accounts (the API exposes balances even though it cannot list transactions)',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          accountId: { type: 'string', description: 'Optional: single account ID to query' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetAccountBalances($businessId: ID!, $page: Int!, $pageSize: Int!) {
            business(id: $businessId) {
              accounts(page: $page, pageSize: $pageSize) {
                pageInfo { totalCount }
                edges {
                  node {
                    id
                    name
                    type { name }
                    balance
                    balanceInBusinessCurrency
                  }
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          page: 1,
          pageSize: 200,
        });

        let accounts = result.business.accounts.edges.map((e: any) => e.node);
        if (args.accountId) {
          accounts = accounts.filter((a: any) => a.id === args.accountId);
        }

        return { accounts, pageInfo: result.business.accounts.pageInfo };
      },
    },

    wave_update_transaction: {
      description:
        'UNSUPPORTED: Wave\'s public GraphQL API has no transaction-update mutation.',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        throw new Error(
          'wave_update_transaction is not supported by the Wave public API. ' +
          'The API cannot read or update existing transactions.'
        );
      },
    },

    wave_categorize_transaction: {
      description:
        'UNSUPPORTED: Wave\'s public GraphQL API has no transaction-categorize mutation.',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        throw new Error(
          'wave_categorize_transaction is not supported by the Wave public API. ' +
          'The API cannot read or update existing transactions.'
        );
      },
    },

    wave_list_transaction_attachments: {
      description:
        'UNSUPPORTED: Wave\'s public GraphQL API cannot read transaction attachments.',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        throw new Error(
          'wave_list_transaction_attachments is not supported by the Wave public API. ' +
          'The API cannot read transactions or their attachments.'
        );
      },
    },
  };
}
