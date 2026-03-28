/**
 * Wave Estimate Tools (Quotes/Proposals)
 */

import type { WaveClient } from '../client.js';
import type { Estimate } from '../types/index.js';

export function registerEstimateTools(client: WaveClient) {
  return {
    wave_list_estimates: {
      description: 'List estimates (quotes) for a business',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          status: { 
            type: 'string', 
            enum: ['DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED'],
            description: 'Filter by estimate status' 
          },
          customerId: { type: 'string', description: 'Filter by customer ID' },
          page: { type: 'number', description: 'Page number (default: 1)' },
          pageSize: { type: 'number', description: 'Results per page (default: 20)' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetEstimates($businessId: ID!, $page: Int!, $pageSize: Int!) {
            business(id: $businessId) {
              estimates(page: $page, pageSize: $pageSize) {
                pageInfo {
                  currentPage
                  totalPages
                  totalCount
                }
                edges {
                  node {
                    id
                    estimateNumber
                    status
                    title
                    estimateDate
                    expiryDate
                    customer {
                      id
                      name
                      email
                    }
                    total {
                      value
                      currency { code }
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
          pageSize: Math.min(args.pageSize || 20, 100),
        });

        return result.business.estimates;
      },
    },

    wave_get_estimate: {
      description: 'Get detailed information about a specific estimate',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          estimateId: { type: 'string', description: 'Estimate ID' },
        },
        required: ['estimateId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetEstimate($businessId: ID!, $estimateId: ID!) {
            business(id: $businessId) {
              estimate(id: $estimateId) {
                id
                estimateNumber
                status
                title
                subhead
                estimateDate
                expiryDate
                customer {
                  id
                  name
                  email
                  firstName
                  lastName
                }
                items {
                  description
                  quantity
                  unitPrice
                  total { value }
                  product {
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
                footer
                memo
                createdAt
                modifiedAt
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          estimateId: args.estimateId,
        });

        return result.business.estimate;
      },
    },

    wave_create_estimate: {
      description: 'Create a new estimate (quote)',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          customerId: { type: 'string', description: 'Customer ID' },
          estimateDate: { type: 'string', description: 'Estimate date (YYYY-MM-DD)' },
          expiryDate: { type: 'string', description: 'Expiry date (YYYY-MM-DD)' },
          title: { type: 'string', description: 'Estimate title' },
          subhead: { type: 'string', description: 'Estimate subhead' },
          footer: { type: 'string', description: 'Footer text' },
          memo: { type: 'string', description: 'Internal memo' },
          items: {
            type: 'array',
            description: 'Estimate line items',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string', description: 'Product ID (optional)' },
                description: { type: 'string', description: 'Line item description' },
                quantity: { type: 'number', description: 'Quantity' },
                unitPrice: { type: 'string', description: 'Unit price' },
                taxIds: { type: 'array', items: { type: 'string' }, description: 'Tax IDs to apply' },
              },
              required: ['description', 'quantity', 'unitPrice'],
            },
          },
        },
        required: ['customerId', 'estimateDate', 'items'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateEstimate($input: EstimateCreateInput!) {
            estimateCreate(input: $input) {
              estimate {
                id
                estimateNumber
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
          customerId: args.customerId,
          estimateDate: args.estimateDate,
          expiryDate: args.expiryDate,
          title: args.title,
          subhead: args.subhead,
          footer: args.footer,
          memo: args.memo,
          items: args.items,
        };

        const result = await client.mutate(mutation, { input });

        if (!result.estimateCreate.didSucceed) {
          throw new Error(`Failed to create estimate: ${JSON.stringify(result.estimateCreate.inputErrors)}`);
        }

        return result.estimateCreate.estimate;
      },
    },

    wave_update_estimate: {
      description: 'Update an existing estimate',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          estimateId: { type: 'string', description: 'Estimate ID' },
          title: { type: 'string', description: 'Estimate title' },
          subhead: { type: 'string', description: 'Estimate subhead' },
          footer: { type: 'string', description: 'Footer text' },
          memo: { type: 'string', description: 'Internal memo' },
          expiryDate: { type: 'string', description: 'Expiry date (YYYY-MM-DD)' },
        },
        required: ['estimateId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation UpdateEstimate($input: EstimateUpdateInput!) {
            estimateUpdate(input: $input) {
              estimate {
                id
                estimateNumber
                status
                title
                subhead
                footer
                memo
                expiryDate
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
            estimateId: args.estimateId,
            title: args.title,
            subhead: args.subhead,
            footer: args.footer,
            memo: args.memo,
            expiryDate: args.expiryDate,
          },
        });

        if (!result.estimateUpdate.didSucceed) {
          throw new Error(`Failed to update estimate: ${JSON.stringify(result.estimateUpdate.inputErrors)}`);
        }

        return result.estimateUpdate.estimate;
      },
    },

    wave_send_estimate: {
      description: 'Send an estimate to the customer via email',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          estimateId: { type: 'string', description: 'Estimate ID' },
          to: { type: 'array', items: { type: 'string' }, description: 'Recipient email addresses' },
          subject: { type: 'string', description: 'Email subject' },
          message: { type: 'string', description: 'Email message body' },
        },
        required: ['estimateId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation SendEstimate($input: EstimateSendInput!) {
            estimateSend(input: $input) {
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
            estimateId: args.estimateId,
            to: args.to,
            subject: args.subject,
            message: args.message,
          },
        });

        if (!result.estimateSend.didSucceed) {
          throw new Error(`Failed to send estimate: ${JSON.stringify(result.estimateSend.inputErrors)}`);
        }

        return { success: true, message: 'Estimate sent successfully' };
      },
    },

    wave_convert_estimate_to_invoice: {
      description: 'Convert an approved estimate into an invoice',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          estimateId: { type: 'string', description: 'Estimate ID' },
          invoiceDate: { type: 'string', description: 'Invoice date (YYYY-MM-DD, defaults to today)' },
          dueDate: { type: 'string', description: 'Invoice due date (YYYY-MM-DD)' },
        },
        required: ['estimateId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation ConvertEstimateToInvoice($input: EstimateConvertToInvoiceInput!) {
            estimateConvertToInvoice(input: $input) {
              invoice {
                id
                invoiceNumber
                status
                total { value currency { code } }
                viewUrl
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
            estimateId: args.estimateId,
            invoiceDate: args.invoiceDate,
            dueDate: args.dueDate,
          },
        });

        if (!result.estimateConvertToInvoice.didSucceed) {
          throw new Error(`Failed to convert estimate: ${JSON.stringify(result.estimateConvertToInvoice.inputErrors)}`);
        }

        return result.estimateConvertToInvoice.invoice;
      },
    },
  };
}
