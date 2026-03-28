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
          businessId: { type: 'string', description: 'Business ID (uses global default if not provided)' },
          customerId: { type: 'string', description: 'Customer ID' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'SAVED'],
            description: 'Invoice status (default: DRAFT)',
          },
          currency: { type: 'string', description: 'Currency code (e.g. USD). Defaults to business currency' },
          title: { type: 'string', description: 'Invoice title. Defaults to business setting' },
          subhead: { type: 'string', description: 'Invoice subheading text. Defaults to business setting' },
          invoiceNumber: { type: 'string', description: 'Invoice number. Auto-increments if not provided' },
          poNumber: { type: 'string', description: 'Purchase order or sales order number' },
          invoiceDate: { type: 'string', description: 'Invoice date (YYYY-MM-DD). Defaults to today' },
          exchangeRate: { type: 'string', description: 'Exchange rate to business currency from invoice currency' },
          dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD). Defaults per business payment terms' },
          memo: { type: 'string', description: 'Invoice memo/notes. Defaults to business setting' },
          footer: { type: 'string', description: 'Invoice footer text. Defaults to business setting' },
          items: {
            type: 'array',
            description: 'Invoice line items',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string', description: 'Product ID (required)' },
                description: { type: 'string', description: 'Override product description' },
                quantity: { type: 'number', description: 'Number of units' },
                unitPrice: { type: 'string', description: 'Override product unit price' },
                taxes: {
                  type: 'array',
                  description: 'Sales taxes to apply',
                  items: {
                    type: 'object',
                    properties: {
                      salesTaxId: { type: 'string', description: 'Sales tax ID' },
                    },
                    required: ['salesTaxId'],
                  },
                },
              },
              required: ['productId'],
            },
          },
          discounts: {
            type: 'array',
            description: 'Invoice discounts (max 1)',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Discount name' },
                discountType: { type: 'string', enum: ['FIXED', 'PERCENTAGE'], description: 'Discount type' },
                amount: { type: 'string', description: 'Discount amount (for FIXED type)' },
                percentage: { type: 'string', description: 'Discount percentage (for PERCENTAGE type)' },
              },
              required: ['discountType'],
            },
          },
          disableAmexPayments: { type: 'boolean', description: 'Disable American Express payments for this invoice' },
          disableCreditCardPayments: { type: 'boolean', description: 'Disable credit card payments for this invoice' },
          disableBankPayments: { type: 'boolean', description: 'Disable bank payments for this invoice' },
          itemTitle: { type: 'string', description: 'Label for the Item column' },
          unitTitle: { type: 'string', description: 'Label for the Unit column' },
          priceTitle: { type: 'string', description: 'Label for the Price column' },
          amountTitle: { type: 'string', description: 'Label for the Amount column' },
          hideName: { type: 'boolean', description: 'Hide product name in line items' },
          hideDescription: { type: 'boolean', description: 'Hide description in line items' },
          hideUnit: { type: 'boolean', description: 'Hide unit in line items' },
          hidePrice: { type: 'boolean', description: 'Hide price in line items' },
          hideAmount: { type: 'boolean', description: 'Hide amount in line items' },
          requireTermsOfServiceAgreement: { type: 'boolean', description: 'Require customer to accept terms of service' },
        },
        required: ['customerId'],
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
                invoiceDate
                dueDate
                total { value currency { code } }
                amountDue { value }
                viewUrl
                pdfUrl
              }
              didSucceed
              inputErrors {
                message
                path
              }
            }
          }
        `;

        const input: any = { businessId, customerId: args.customerId };

        const optionalStrings = [
          'status', 'currency', 'title', 'subhead', 'invoiceNumber', 'poNumber',
          'invoiceDate', 'exchangeRate', 'dueDate', 'memo', 'footer',
          'itemTitle', 'unitTitle', 'priceTitle', 'amountTitle',
        ];
        for (const key of optionalStrings) {
          if (args[key] !== undefined) input[key] = args[key];
        }

        const optionalBooleans = [
          'disableAmexPayments', 'disableCreditCardPayments', 'disableBankPayments',
          'hideName', 'hideDescription', 'hideUnit', 'hidePrice', 'hideAmount',
          'requireTermsOfServiceAgreement',
        ];
        for (const key of optionalBooleans) {
          if (args[key] !== undefined) input[key] = args[key];
        }

        if (args.items) input.items = args.items;
        if (args.discounts) input.discounts = args.discounts;

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
      description: 'Record a manual payment received for an invoice',
      parameters: {
        type: 'object',
        properties: {
          invoiceId: { type: 'string', description: 'Invoice ID' },
          paymentAccountId: { type: 'string', description: 'Payment account ID (from chart of accounts)' },
          amount: { type: 'string', description: 'Payment amount (e.g. "100.00")' },
          paymentDate: { type: 'string', description: 'Payment date (YYYY-MM-DD)' },
          paymentMethod: {
            type: 'string',
            enum: ['BANK_TRANSFER', 'CASH', 'CHEQUE', 'CREDIT_CARD', 'OTHER', 'PAYPAL', 'UNSPECIFIED'],
            description: 'Payment method',
          },
          exchangeRate: { type: 'string', description: 'Exchange rate (default: "1", only needed for cross-currency)' },
          memo: { type: 'string', description: 'Payment notes/memo' },
        },
        required: ['invoiceId', 'paymentAccountId', 'amount', 'paymentDate', 'paymentMethod'],
      },
      handler: async (args: any) => {
        const mutation = `
          mutation CreateManualPayment($input: InvoicePaymentCreateManualInput!) {
            invoicePaymentCreateManual(input: $input) {
              invoicePayment {
                id
                amount
                paymentDate
                paymentMethod
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

        const input: any = {
          invoiceId: args.invoiceId,
          paymentAccountId: args.paymentAccountId,
          amount: args.amount,
          paymentDate: args.paymentDate,
          paymentMethod: args.paymentMethod,
          exchangeRate: args.exchangeRate || '1',
        };

        if (args.memo) {
          input.memo = args.memo;
        }

        const result = await client.mutate(mutation, { input });

        if (!result.invoicePaymentCreateManual.didSucceed) {
          throw new Error(`Failed to create payment: ${JSON.stringify(result.invoicePaymentCreateManual.inputErrors)}`);
        }

        return result.invoicePaymentCreateManual.invoicePayment;
      },
    },

    wave_send_payment_receipt: {
      description: 'Send a payment receipt email for an invoice payment',
      parameters: {
        type: 'object',
        properties: {
          invoiceId: { type: 'string', description: 'Invoice ID' },
          invoicePaymentId: { type: 'string', description: 'Invoice Payment ID' },
          to: { type: 'array', items: { type: 'string' }, description: 'Recipient email addresses' },
          subject: { type: 'string', description: 'Email subject' },
          message: { type: 'string', description: 'Email message body' },
          attachPdf: { type: 'boolean', description: 'Attach invoice PDF (default: false)' },
          ccMyself: { type: 'boolean', description: 'CC yourself on the email' },
          fromAddress: { type: 'string', description: 'The email address the receipt is sent from' },
        },
        required: ['invoiceId', 'invoicePaymentId', 'to'],
      },
      handler: async (args: any) => {
        const mutation = `
          mutation SendPaymentReceipt($input: InvoicePaymentReceiptSendInput!) {
            invoicePaymentReceiptSend(input: $input) {
              didSucceed
              inputErrors {
                message
                path
              }
            }
          }
        `;

        const input: any = {
          invoiceId: args.invoiceId,
          invoicePaymentId: args.invoicePaymentId,
          to: args.to,
        };

        if (args.subject) input.subject = args.subject;
        if (args.message) input.message = args.message;
        if (args.attachPdf !== undefined) input.attachPdf = args.attachPdf;
        if (args.ccMyself !== undefined) input.ccMyself = args.ccMyself;
        if (args.fromAddress) input.fromAddress = args.fromAddress;

        const result = await client.mutate(mutation, { input });

        if (!result.invoicePaymentReceiptSend.didSucceed) {
          throw new Error(`Failed to send receipt: ${JSON.stringify(result.invoicePaymentReceiptSend.inputErrors)}`);
        }

        return { success: true, message: 'Payment receipt sent successfully' };
      },
    },
  };
}
