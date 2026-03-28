/**
 * Wave Invoice Tools
 */

import type { WaveClient } from '../client.js';
import type { Invoice, InvoiceItem } from '../types/index.js';

export function registerInvoiceTools(client: WaveClient) {
  return {
    wave_list_invoices: {
      description: 'List invoices for a business with optional filtering',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID (required if not set globally)' },
          status: { 
            type: 'string', 
            enum: ['DRAFT', 'SENT', 'VIEWED', 'PAID', 'PARTIAL', 'OVERDUE', 'APPROVED'],
            description: 'Filter by invoice status' 
          },
          customerId: { type: 'string', description: 'Filter by customer ID' },
          page: { type: 'number', description: 'Page number (default: 1)' },
          pageSize: { type: 'number', description: 'Results per page (default: 20, max: 100)' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetInvoices($businessId: ID!, $page: Int!, $pageSize: Int!) {
            business(id: $businessId) {
              invoices(page: $page, pageSize: $pageSize) {
                pageInfo {
                  currentPage
                  totalPages
                  totalCount
                }
                edges {
                  node {
                    id
                    invoiceNumber
                    status
                    title
                    invoiceDate
                    dueDate
                    customer {
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
                    viewUrl
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

        return result.business.invoices;
      },
    },

    wave_get_invoice: {
      description: 'Get detailed information about a specific invoice',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          invoiceId: { type: 'string', description: 'Invoice ID' },
        },
        required: ['invoiceId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetInvoice($businessId: ID!, $invoiceId: ID!) {
            business(id: $businessId) {
              invoice(id: $invoiceId) {
                id
                invoiceNumber
                status
                title
                subhead
                invoiceDate
                dueDate
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
                  subtotal { value }
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
                amountDue {
                  value
                  currency { code }
                }
                amountPaid { value }
                footer
                memo
                createdAt
                modifiedAt
                viewUrl
                pdfUrl
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          invoiceId: args.invoiceId,
        });

        return result.business.invoice;
      },
    },

    wave_create_invoice: {
      description: 'Create a new invoice',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          customerId: { type: 'string', description: 'Customer ID' },
          invoiceDate: { type: 'string', description: 'Invoice date (YYYY-MM-DD)' },
          dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
          title: { type: 'string', description: 'Invoice title' },
          subhead: { type: 'string', description: 'Invoice subhead' },
          footer: { type: 'string', description: 'Invoice footer text' },
          memo: { type: 'string', description: 'Internal memo' },
          items: {
            type: 'array',
            description: 'Invoice line items',
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
        required: ['customerId', 'invoiceDate', 'items'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateInvoice($input: InvoiceCreateInput!) {
            invoiceCreate(input: $input) {
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

        const input = {
          businessId,
          customerId: args.customerId,
          invoiceDate: args.invoiceDate,
          dueDate: args.dueDate,
          title: args.title,
          subhead: args.subhead,
          footer: args.footer,
          memo: args.memo,
          items: args.items,
        };

        const result = await client.mutate(mutation, { input });
        
        if (!result.invoiceCreate.didSucceed) {
          throw new Error(`Failed to create invoice: ${JSON.stringify(result.invoiceCreate.inputErrors)}`);
        }

        return result.invoiceCreate.invoice;
      },
    },

    wave_update_invoice: {
      description: 'Update an existing invoice',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          invoiceId: { type: 'string', description: 'Invoice ID' },
          title: { type: 'string', description: 'Invoice title' },
          subhead: { type: 'string', description: 'Invoice subhead' },
          footer: { type: 'string', description: 'Invoice footer' },
          memo: { type: 'string', description: 'Internal memo' },
          dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
        },
        required: ['invoiceId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation UpdateInvoice($input: InvoiceUpdateInput!) {
            invoiceUpdate(input: $input) {
              invoice {
                id
                invoiceNumber
                status
                title
                subhead
                footer
                memo
                dueDate
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
          invoiceId: args.invoiceId,
          title: args.title,
          subhead: args.subhead,
          footer: args.footer,
          memo: args.memo,
          dueDate: args.dueDate,
        };

        const result = await client.mutate(mutation, { input });

        if (!result.invoiceUpdate.didSucceed) {
          throw new Error(`Failed to update invoice: ${JSON.stringify(result.invoiceUpdate.inputErrors)}`);
        }

        return result.invoiceUpdate.invoice;
      },
    },

    wave_delete_invoice: {
      description: 'Delete an invoice (must be in DRAFT status)',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          invoiceId: { type: 'string', description: 'Invoice ID' },
        },
        required: ['invoiceId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation DeleteInvoice($input: InvoiceDeleteInput!) {
            invoiceDelete(input: $input) {
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
            invoiceId: args.invoiceId,
          },
        });

        if (!result.invoiceDelete.didSucceed) {
          throw new Error(`Failed to delete invoice: ${JSON.stringify(result.invoiceDelete.inputErrors)}`);
        }

        return { success: true, message: 'Invoice deleted successfully' };
      },
    },

    wave_send_invoice: {
      description: 'Send an invoice to the customer via email',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          invoiceId: { type: 'string', description: 'Invoice ID' },
          to: { type: 'array', items: { type: 'string' }, description: 'Recipient email addresses' },
          subject: { type: 'string', description: 'Email subject' },
          message: { type: 'string', description: 'Email message body' },
        },
        required: ['invoiceId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation SendInvoice($input: InvoiceSendInput!) {
            invoiceSend(input: $input) {
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
            invoiceId: args.invoiceId,
            to: args.to,
            subject: args.subject,
            message: args.message,
          },
        });

        if (!result.invoiceSend.didSucceed) {
          throw new Error(`Failed to send invoice: ${JSON.stringify(result.invoiceSend.inputErrors)}`);
        }

        return { success: true, message: 'Invoice sent successfully' };
      },
    },

    wave_approve_invoice: {
      description: 'Approve a draft invoice',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          invoiceId: { type: 'string', description: 'Invoice ID' },
        },
        required: ['invoiceId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation ApproveInvoice($input: InvoiceApproveInput!) {
            invoiceApprove(input: $input) {
              invoice {
                id
                status
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
            invoiceId: args.invoiceId,
          },
        });

        if (!result.invoiceApprove.didSucceed) {
          throw new Error(`Failed to approve invoice: ${JSON.stringify(result.invoiceApprove.inputErrors)}`);
        }

        return result.invoiceApprove.invoice;
      },
    },

    wave_mark_invoice_sent: {
      description: 'Mark an invoice as sent (without actually sending email)',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          invoiceId: { type: 'string', description: 'Invoice ID' },
        },
        required: ['invoiceId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation MarkInvoiceSent($input: InvoiceMarkSentInput!) {
            invoiceMarkSent(input: $input) {
              invoice {
                id
                status
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
            invoiceId: args.invoiceId,
          },
        });

        if (!result.invoiceMarkSent.didSucceed) {
          throw new Error(`Failed to mark invoice sent: ${JSON.stringify(result.invoiceMarkSent.inputErrors)}`);
        }

        return result.invoiceMarkSent.invoice;
      },
    },

    wave_list_invoice_payments: {
      description: 'List payments received for a specific invoice',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          invoiceId: { type: 'string', description: 'Invoice ID' },
        },
        required: ['invoiceId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetInvoicePayments($businessId: ID!, $invoiceId: ID!) {
            business(id: $businessId) {
              invoice(id: $invoiceId) {
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
          invoiceId: args.invoiceId,
        });

        return result.business.invoice.payments;
      },
    },

    wave_create_invoice_payment: {
      description: 'Record a payment received for an invoice',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          invoiceId: { type: 'string', description: 'Invoice ID' },
          amount: { type: 'string', description: 'Payment amount' },
          date: { type: 'string', description: 'Payment date (YYYY-MM-DD)' },
          source: { type: 'string', description: 'Payment source/method' },
        },
        required: ['invoiceId', 'amount', 'date'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateInvoicePayment($input: InvoicePaymentCreateInput!) {
            invoicePaymentCreate(input: $input) {
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
            invoiceId: args.invoiceId,
            amount: args.amount,
            date: args.date,
            source: args.source,
          },
        });

        if (!result.invoicePaymentCreate.didSucceed) {
          throw new Error(`Failed to create payment: ${JSON.stringify(result.invoicePaymentCreate.inputErrors)}`);
        }

        return result.invoicePaymentCreate.payment;
      },
    },
  };
}
