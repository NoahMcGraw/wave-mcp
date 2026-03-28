/**
 * Wave Bill Tools (Bills Payable)
 */

import type { WaveClient } from '../client.js';
import type { Bill } from '../types/index.js';

export function registerBillTools(client: WaveClient) {
  return {
    wave_list_bills: {
      description: 'List bills (accounts payable) for a business',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          status: { 
            type: 'string', 
            enum: ['DRAFT', 'APPROVED', 'PAID', 'PARTIAL'],
            description: 'Filter by bill status' 
          },
          vendorId: { type: 'string', description: 'Filter by vendor ID' },
          page: { type: 'number', description: 'Page number (default: 1)' },
          pageSize: { type: 'number', description: 'Results per page (default: 20)' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetBills($businessId: ID!, $page: Int!, $pageSize: Int!) {
            business(id: $businessId) {
              bills(page: $page, pageSize: $pageSize) {
                pageInfo {
                  currentPage
                  totalPages
                  totalCount
                }
                edges {
                  node {
                    id
                    billNumber
                    status
                    billDate
                    dueDate
                    vendor {
                      id
                      name
                      email
                    }
                    total {
                      value
                      currency { code }
                    }
                    amountDue {
                      value
                      currency { code }
                    }
                    amountPaid { value }
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
          pageSize: Math.min(args.pageSize || 20, 100),
        });

        return result.business.bills;
      },
    },

    wave_get_bill: {
      description: 'Get detailed information about a specific bill',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          billId: { type: 'string', description: 'Bill ID' },
        },
        required: ['billId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetBill($businessId: ID!, $billId: ID!) {
            business(id: $businessId) {
              bill(id: $billId) {
                id
                billNumber
                status
                billDate
                dueDate
                vendor {
                  id
                  name
                  email
                }
                items {
                  description
                  quantity
                  unitPrice
                  total { value }
                  account {
                    id
                    name
                  }
                  taxes {
                    id
                    name
                    rate
                  }
                }
                total {
                  value
                  currency { code symbol }
                }
                amountDue {
                  value
                  currency { code }
                }
                amountPaid { value }
                memo
                createdAt
                modifiedAt
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          billId: args.billId,
        });

        return result.business.bill;
      },
    },

    wave_create_bill: {
      description: 'Create a new bill',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          vendorId: { type: 'string', description: 'Vendor ID' },
          billDate: { type: 'string', description: 'Bill date (YYYY-MM-DD)' },
          dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
          billNumber: { type: 'string', description: 'Bill number/reference' },
          memo: { type: 'string', description: 'Internal memo' },
          items: {
            type: 'array',
            description: 'Bill line items',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string', description: 'Line item description' },
                quantity: { type: 'number', description: 'Quantity' },
                unitPrice: { type: 'string', description: 'Unit price' },
                accountId: { type: 'string', description: 'Expense account ID' },
                taxIds: { type: 'array', items: { type: 'string' }, description: 'Tax IDs to apply' },
              },
              required: ['description', 'quantity', 'unitPrice', 'accountId'],
            },
          },
        },
        required: ['vendorId', 'billDate', 'items'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateBill($input: BillCreateInput!) {
            billCreate(input: $input) {
              bill {
                id
                billNumber
                status
                total { value currency { code } }
              }
              didSucceed
              inputErrors {
                message
                path
              }
            }
          }
        `;

        const input = {
          businessId,
          vendorId: args.vendorId,
          billDate: args.billDate,
          dueDate: args.dueDate,
          billNumber: args.billNumber,
          memo: args.memo,
          items: args.items,
        };

        const result = await client.mutate(mutation, { input });

        if (!result.billCreate.didSucceed) {
          throw new Error(`Failed to create bill: ${JSON.stringify(result.billCreate.inputErrors)}`);
        }

        return result.billCreate.bill;
      },
    },

    wave_update_bill: {
      description: 'Update an existing bill',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          billId: { type: 'string', description: 'Bill ID' },
          billNumber: { type: 'string', description: 'Bill number' },
          dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
          memo: { type: 'string', description: 'Internal memo' },
        },
        required: ['billId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation UpdateBill($input: BillUpdateInput!) {
            billUpdate(input: $input) {
              bill {
                id
                billNumber
                dueDate
                memo
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
            billId: args.billId,
            billNumber: args.billNumber,
            dueDate: args.dueDate,
            memo: args.memo,
          },
        });

        if (!result.billUpdate.didSucceed) {
          throw new Error(`Failed to update bill: ${JSON.stringify(result.billUpdate.inputErrors)}`);
        }

        return result.billUpdate.bill;
      },
    },

    wave_list_bill_payments: {
      description: 'List payments made for a specific bill',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          billId: { type: 'string', description: 'Bill ID' },
        },
        required: ['billId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetBillPayments($businessId: ID!, $billId: ID!) {
            business(id: $businessId) {
              bill(id: $billId) {
                id
                payments {
                  id
                  amount {
                    value
                    currency { code }
                  }
                  date
                  source
                  createdAt
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          billId: args.billId,
        });

        return result.business.bill.payments;
      },
    },

    wave_create_bill_payment: {
      description: 'Record a payment made for a bill',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          billId: { type: 'string', description: 'Bill ID' },
          amount: { type: 'string', description: 'Payment amount' },
          date: { type: 'string', description: 'Payment date (YYYY-MM-DD)' },
          source: { type: 'string', description: 'Payment source/method' },
        },
        required: ['billId', 'amount', 'date'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateBillPayment($input: BillPaymentCreateInput!) {
            billPaymentCreate(input: $input) {
              payment {
                id
                amount {
                  value
                  currency { code }
                }
                date
                source
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
            billId: args.billId,
            amount: args.amount,
            date: args.date,
            source: args.source,
          },
        });

        if (!result.billPaymentCreate.didSucceed) {
          throw new Error(`Failed to create payment: ${JSON.stringify(result.billPaymentCreate.inputErrors)}`);
        }

        return result.billPaymentCreate.payment;
      },
    },
  };
}
