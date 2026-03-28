import { WaveClient } from '../client/wave-client.js';
import type { 
  Business, Customer, Product, Invoice, Account, Transaction, 
  Bill, SalesTax, Vendor, Estimate, Country, Currency 
} from '../types/index.js';

export const waveTools = {
  // ========== BUSINESS TOOLS ==========
  
  listBusinesses: {
    name: 'wave_list_businesses',
    description: 'List all businesses associated with the Wave account',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (client: WaveClient, _args: any) => {
      const query = `
        query {
          user {
            id
            businesses(page: 1, pageSize: 50) {
              edges {
                node {
                  id
                  name
                  currency {
                    code
                    symbol
                  }
                  organizationSubtype
                  isClassicAccounting
                  isClassicInvoicing
                  isPersonal
                }
              }
            }
          }
        }
      `;
      const result = await client.query(query);
      return result.user.businesses.edges.map((e: any) => e.node);
    },
  },

  getBusiness: {
    name: 'wave_get_business',
    description: 'Get details of a specific business',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!) {
          business(id: $businessId) {
            id
            name
            currency {
              code
              symbol
            }
            organizationSubtype
            isClassicAccounting
            isClassicInvoicing
            isPersonal
          }
        }
      `;
      const result = await client.query(query, { businessId });
      return result.business;
    },
  },

  // ========== CUSTOMER TOOLS ==========

  listCustomers: {
    name: 'wave_list_customers',
    description: 'List all customers for a business',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        pageSize: { type: 'number', description: 'Items per page (default: 50, max: 100)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string; page?: number; pageSize?: number }) => {
      const businessId = args.businessId || client.getBusinessId();
      const page = args.page || 1;
      const pageSize = args.pageSize || 50;
      const query = `
        query($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            customers(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  name
                  firstName
                  lastName
                  email
                  mobile
                  phone
                  currency {
                    code
                  }
                  address {
                    addressLine1
                    addressLine2
                    city
                    postalCode
                    province { code name }
                    country { code name }
                  }
                }
              }
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, page, pageSize });
      return {
        customers: result.business.customers.edges.map((e: any) => e.node),
        pageInfo: result.business.customers.pageInfo,
      };
    },
  },

  getCustomer: {
    name: 'wave_get_customer',
    description: 'Get details of a specific customer',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        customerId: { type: 'string', description: 'Customer ID', required: true },
      },
      required: ['customerId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; customerId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!, $customerId: ID!) {
          business(id: $businessId) {
            customer(id: $customerId) {
              id
              name
              firstName
              lastName
              email
              mobile
              phone
              fax
              website
              internalNotes
              currency { code }
              address {
                addressLine1
                addressLine2
                city
                postalCode
                province { code name }
                country { code name }
              }
              shippingDetails {
                name
                phone
                instructions
                address {
                  addressLine1
                  addressLine2
                  city
                  postalCode
                  province { code name }
                  country { code name }
                }
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, customerId: args.customerId });
      return result.business.customer;
    },
  },

  createCustomer: {
    name: 'wave_create_customer',
    description: 'Create a new customer',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        name: { type: 'string', description: 'Customer name', required: true },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email address' },
        mobile: { type: 'string', description: 'Mobile phone' },
        phone: { type: 'string', description: 'Phone number' },
        fax: { type: 'string', description: 'Fax number' },
        website: { type: 'string', description: 'Website URL' },
        internalNotes: { type: 'string', description: 'Internal notes' },
        currency: { type: 'string', description: 'Currency code (e.g., USD)' },
        address: {
          type: 'object',
          description: 'Customer address',
          properties: {
            addressLine1: { type: 'string' },
            addressLine2: { type: 'string' },
            city: { type: 'string' },
            postalCode: { type: 'string' },
            countryCode: { type: 'string' },
            provinceCode: { type: 'string' },
          },
        },
      },
      required: ['name'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: CustomerCreateInput!) {
          customerCreate(input: { businessId: $businessId, customer: $input }) {
            customer {
              id
              name
              email
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const input: any = {
        name: args.name,
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
        mobile: args.mobile,
        phone: args.phone,
        fax: args.fax,
        website: args.website,
        internalNotes: args.internalNotes,
        currency: args.currency,
      };
      if (args.address) {
        input.address = args.address;
      }
      const result = await client.mutate(mutation, { businessId, input });
      return result.customerCreate;
    },
  },

  updateCustomer: {
    name: 'wave_update_customer',
    description: 'Update an existing customer',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        customerId: { type: 'string', description: 'Customer ID', required: true },
        name: { type: 'string', description: 'Customer name' },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email address' },
        mobile: { type: 'string', description: 'Mobile phone' },
        phone: { type: 'string', description: 'Phone number' },
        website: { type: 'string', description: 'Website URL' },
        internalNotes: { type: 'string', description: 'Internal notes' },
      },
      required: ['customerId'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $customerId: ID!, $input: CustomerPatchInput!) {
          customerPatch(input: { businessId: $businessId, customerId: $customerId, customer: $input }) {
            customer {
              id
              name
              email
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, customerId: args.customerId, input: args });
      return result.customerPatch;
    },
  },

  deleteCustomer: {
    name: 'wave_delete_customer',
    description: 'Delete a customer',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        customerId: { type: 'string', description: 'Customer ID', required: true },
      },
      required: ['customerId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; customerId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $customerId: ID!) {
          customerDelete(input: { businessId: $businessId, customerId: $customerId }) {
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, customerId: args.customerId });
      return result.customerDelete;
    },
  },

  // ========== PRODUCT TOOLS ==========

  listProducts: {
    name: 'wave_list_products',
    description: 'List all products and services',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        pageSize: { type: 'number', description: 'Items per page (default: 50)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string; page?: number; pageSize?: number }) => {
      const businessId = args.businessId || client.getBusinessId();
      const page = args.page || 1;
      const pageSize = args.pageSize || 50;
      const query = `
        query($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            products(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  name
                  description
                  unitPrice
                  isSold
                  isBought
                  incomeAccount { id name }
                  expenseAccount { id name }
                }
              }
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, page, pageSize });
      return {
        products: result.business.products.edges.map((e: any) => e.node),
        pageInfo: result.business.products.pageInfo,
      };
    },
  },

  getProduct: {
    name: 'wave_get_product',
    description: 'Get details of a specific product',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        productId: { type: 'string', description: 'Product ID', required: true },
      },
      required: ['productId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; productId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!, $productId: ID!) {
          business(id: $businessId) {
            product(id: $productId) {
              id
              name
              description
              unitPrice
              isSold
              isBought
              incomeAccount { id name }
              expenseAccount { id name }
              defaultSalesTaxes {
                id
                name
                rate
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, productId: args.productId });
      return result.business.product;
    },
  },

  createProduct: {
    name: 'wave_create_product',
    description: 'Create a new product or service',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        name: { type: 'string', description: 'Product name', required: true },
        description: { type: 'string', description: 'Product description' },
        unitPrice: { type: 'number', description: 'Unit price' },
        isSold: { type: 'boolean', description: 'Is this product sold?' },
        isBought: { type: 'boolean', description: 'Is this product bought?' },
        incomeAccountId: { type: 'string', description: 'Income account ID' },
        expenseAccountId: { type: 'string', description: 'Expense account ID' },
      },
      required: ['name'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: ProductCreateInput!) {
          productCreate(input: { businessId: $businessId, product: $input }) {
            product {
              id
              name
              unitPrice
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, input: args });
      return result.productCreate;
    },
  },

  updateProduct: {
    name: 'wave_update_product',
    description: 'Update an existing product',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        productId: { type: 'string', description: 'Product ID', required: true },
        name: { type: 'string', description: 'Product name' },
        description: { type: 'string', description: 'Product description' },
        unitPrice: { type: 'number', description: 'Unit price' },
      },
      required: ['productId'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $productId: ID!, $input: ProductPatchInput!) {
          productPatch(input: { businessId: $businessId, productId: $productId, product: $input }) {
            product {
              id
              name
              unitPrice
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, productId: args.productId, input: args });
      return result.productPatch;
    },
  },

  deleteProduct: {
    name: 'wave_delete_product',
    description: 'Archive a product',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        productId: { type: 'string', description: 'Product ID', required: true },
      },
      required: ['productId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; productId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $productId: ID!) {
          productArchive(input: { businessId: $businessId, productId: $productId }) {
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, productId: args.productId });
      return result.productArchive;
    },
  },

  // ========== INVOICE TOOLS ==========

  listInvoices: {
    name: 'wave_list_invoices',
    description: 'List all invoices with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        pageSize: { type: 'number', description: 'Items per page (default: 50)' },
        status: { 
          type: 'string', 
          description: 'Filter by status (DRAFT, SAVED, SENT, VIEWED, APPROVED, PAID, PARTIAL, OVERDUE, UNPAID)',
        },
        customerId: { type: 'string', description: 'Filter by customer ID' },
      },
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const page = args.page || 1;
      const pageSize = args.pageSize || 50;
      const query = `
        query($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            invoices(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  createdAt
                  modifiedAt
                  invoiceNumber
                  invoiceDate
                  dueDate
                  status
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
                  amountPaid {
                    value
                    currency { code }
                  }
                  viewUrl
                  pdfUrl
                }
              }
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, page, pageSize });
      return {
        invoices: result.business.invoices.edges.map((e: any) => e.node),
        pageInfo: result.business.invoices.pageInfo,
      };
    },
  },

  getInvoice: {
    name: 'wave_get_invoice',
    description: 'Get detailed information about a specific invoice',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        invoiceId: { type: 'string', description: 'Invoice ID', required: true },
      },
      required: ['invoiceId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; invoiceId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!, $invoiceId: ID!) {
          business(id: $businessId) {
            invoice(id: $invoiceId) {
              id
              createdAt
              modifiedAt
              invoiceNumber
              invoiceDate
              dueDate
              status
              title
              customer {
                id
                name
                email
                address {
                  addressLine1
                  city
                  postalCode
                  country { name }
                }
              }
              items {
                product { id name }
                description
                quantity
                unitPrice
                subtotal { value currency { code } }
                total { value currency { code } }
                taxes {
                  salesTax { id name rate }
                  amount { value }
                }
              }
              memo
              footer
              subtotal { value currency { code } }
              total { value currency { code } }
              amountDue { value currency { code } }
              amountPaid { value currency { code } }
              taxTotal { value currency { code } }
              viewUrl
              pdfUrl
              lastSentAt
              lastSentVia
              lastViewedAt
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, invoiceId: args.invoiceId });
      return result.business.invoice;
    },
  },

  createInvoice: {
    name: 'wave_create_invoice',
    description: 'Create a new invoice',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        customerId: { type: 'string', description: 'Customer ID', required: true },
        items: {
          type: 'array',
          description: 'Invoice line items',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'Product ID' },
              description: { type: 'string', description: 'Item description' },
              quantity: { type: 'number', description: 'Quantity' },
              unitPrice: { type: 'number', description: 'Unit price' },
            },
          },
          required: true,
        },
        invoiceDate: { type: 'string', description: 'Invoice date (YYYY-MM-DD)' },
        dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
        title: { type: 'string', description: 'Invoice title' },
        memo: { type: 'string', description: 'Memo/notes' },
        footer: { type: 'string', description: 'Footer text' },
      },
      required: ['customerId', 'items'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: InvoiceCreateInput!) {
          invoiceCreate(input: { businessId: $businessId, invoice: $input }) {
            invoice {
              id
              invoiceNumber
              status
              total { value currency { code } }
              viewUrl
              pdfUrl
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, input: args });
      return result.invoiceCreate;
    },
  },

  updateInvoice: {
    name: 'wave_update_invoice',
    description: 'Update an existing invoice',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        invoiceId: { type: 'string', description: 'Invoice ID', required: true },
        title: { type: 'string', description: 'Invoice title' },
        memo: { type: 'string', description: 'Memo/notes' },
        footer: { type: 'string', description: 'Footer text' },
        dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
      },
      required: ['invoiceId'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $invoiceId: ID!, $input: InvoicePatchInput!) {
          invoicePatch(input: { businessId: $businessId, invoiceId: $invoiceId, invoice: $input }) {
            invoice {
              id
              status
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, invoiceId: args.invoiceId, input: args });
      return result.invoicePatch;
    },
  },

  deleteInvoice: {
    name: 'wave_delete_invoice',
    description: 'Delete an invoice',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        invoiceId: { type: 'string', description: 'Invoice ID', required: true },
      },
      required: ['invoiceId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; invoiceId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $invoiceId: ID!) {
          invoiceDelete(input: { businessId: $businessId, invoiceId: $invoiceId }) {
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, invoiceId: args.invoiceId });
      return result.invoiceDelete;
    },
  },

  sendInvoice: {
    name: 'wave_send_invoice',
    description: 'Send an invoice to customer via email',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        invoiceId: { type: 'string', description: 'Invoice ID', required: true },
        to: { type: 'array', items: { type: 'string' }, description: 'Email addresses to send to' },
        subject: { type: 'string', description: 'Email subject' },
        message: { type: 'string', description: 'Email message' },
      },
      required: ['invoiceId'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $invoiceId: ID!, $input: InvoiceSendInput!) {
          invoiceSend(input: { businessId: $businessId, invoiceId: $invoiceId, sendMethod: $input }) {
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { 
        businessId, 
        invoiceId: args.invoiceId,
        input: {
          to: args.to,
          subject: args.subject,
          message: args.message,
        },
      });
      return result.invoiceSend;
    },
  },

  approveInvoice: {
    name: 'wave_approve_invoice',
    description: 'Approve a draft invoice',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        invoiceId: { type: 'string', description: 'Invoice ID', required: true },
      },
      required: ['invoiceId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; invoiceId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $invoiceId: ID!) {
          invoiceApprove(input: { businessId: $businessId, invoiceId: $invoiceId }) {
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, invoiceId: args.invoiceId });
      return result.invoiceApprove;
    },
  },

  markInvoiceSent: {
    name: 'wave_mark_invoice_sent',
    description: 'Mark an invoice as sent',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        invoiceId: { type: 'string', description: 'Invoice ID', required: true },
      },
      required: ['invoiceId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; invoiceId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $invoiceId: ID!) {
          invoiceMarkSent(input: { businessId: $businessId, invoiceId: $invoiceId }) {
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, invoiceId: args.invoiceId });
      return result.invoiceMarkSent;
    },
  },

  // ========== ACCOUNT TOOLS ==========

  listAccounts: {
    name: 'wave_list_accounts',
    description: 'List all accounts (chart of accounts)',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        pageSize: { type: 'number', description: 'Items per page (default: 100)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string; page?: number; pageSize?: number }) => {
      const businessId = args.businessId || client.getBusinessId();
      const page = args.page || 1;
      const pageSize = args.pageSize || 100;
      const query = `
        query($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            accounts(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  name
                  description
                  displayId
                  type {
                    name
                    normalBalanceType
                    value
                  }
                  subtype {
                    name
                    value
                  }
                  currency { code }
                  isArchived
                  sequence
                }
              }
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, page, pageSize });
      return {
        accounts: result.business.accounts.edges.map((e: any) => e.node),
        pageInfo: result.business.accounts.pageInfo,
      };
    },
  },

  getAccount: {
    name: 'wave_get_account',
    description: 'Get details of a specific account',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        accountId: { type: 'string', description: 'Account ID', required: true },
      },
      required: ['accountId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; accountId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!, $accountId: ID!) {
          business(id: $businessId) {
            account(id: $accountId) {
              id
              name
              description
              displayId
              type {
                name
                normalBalanceType
                value
              }
              subtype {
                name
                value
              }
              currency { code }
              isArchived
              sequence
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, accountId: args.accountId });
      return result.business.account;
    },
  },

  createAccount: {
    name: 'wave_create_account',
    description: 'Create a new account',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        name: { type: 'string', description: 'Account name', required: true },
        type: { type: 'string', description: 'Account type', required: true },
        subtype: { type: 'string', description: 'Account subtype', required: true },
        description: { type: 'string', description: 'Account description' },
        currency: { type: 'string', description: 'Currency code' },
      },
      required: ['name', 'type', 'subtype'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: AccountCreateInput!) {
          accountCreate(input: { businessId: $businessId, account: $input }) {
            account {
              id
              name
              type { name }
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, input: args });
      return result.accountCreate;
    },
  },

  // ========== TRANSACTION TOOLS ==========

  listTransactions: {
    name: 'wave_list_transactions',
    description: 'List transactions with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        pageSize: { type: 'number', description: 'Items per page (default: 50)' },
        accountId: { type: 'string', description: 'Filter by account ID' },
      },
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const page = args.page || 1;
      const pageSize = args.pageSize || 50;
      const query = `
        query($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            accountTransactions(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  date
                  description
                  source
                  debits {
                    account { id name }
                    amount { value currency { code } }
                  }
                  credits {
                    account { id name }
                    amount { value currency { code } }
                  }
                }
              }
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, page, pageSize });
      return {
        transactions: result.business.accountTransactions.edges.map((e: any) => e.node),
        pageInfo: result.business.accountTransactions.pageInfo,
      };
    },
  },

  getTransaction: {
    name: 'wave_get_transaction',
    description: 'Get details of a specific transaction',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        transactionId: { type: 'string', description: 'Transaction ID', required: true },
      },
      required: ['transactionId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; transactionId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!, $transactionId: ID!) {
          business(id: $businessId) {
            accountTransaction(id: $transactionId) {
              id
              date
              description
              notes
              source
              sourceUrl
              debits {
                id
                account { id name }
                amount { value currency { code } }
              }
              credits {
                id
                account { id name }
                amount { value currency { code } }
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, transactionId: args.transactionId });
      return result.business.accountTransaction;
    },
  },

  createTransaction: {
    name: 'wave_create_transaction',
    description: 'Create a manual transaction (journal entry)',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        date: { type: 'string', description: 'Transaction date (YYYY-MM-DD)', required: true },
        description: { type: 'string', description: 'Description' },
        debits: {
          type: 'array',
          description: 'Debit entries',
          items: {
            type: 'object',
            properties: {
              accountId: { type: 'string' },
              amount: { type: 'number' },
            },
          },
          required: true,
        },
        credits: {
          type: 'array',
          description: 'Credit entries',
          items: {
            type: 'object',
            properties: {
              accountId: { type: 'string' },
              amount: { type: 'number' },
            },
          },
          required: true,
        },
      },
      required: ['date', 'debits', 'credits'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: MoneyTransactionCreateInput!) {
          moneyTransactionCreate(input: { businessId: $businessId, transaction: $input }) {
            transaction {
              id
              date
              description
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, input: args });
      return result.moneyTransactionCreate;
    },
  },

  // ========== BILL TOOLS ==========

  listBills: {
    name: 'wave_list_bills',
    description: 'List all bills',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        pageSize: { type: 'number', description: 'Items per page (default: 50)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string; page?: number; pageSize?: number }) => {
      const businessId = args.businessId || client.getBusinessId();
      const page = args.page || 1;
      const pageSize = args.pageSize || 50;
      const query = `
        query($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            bills(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  createdAt
                  status
                  billNumber
                  invoiceNumber
                  billDate
                  dueDate
                  vendor { id name }
                  total { value currency { code } }
                  amountDue { value currency { code } }
                }
              }
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, page, pageSize });
      return {
        bills: result.business.bills.edges.map((e: any) => e.node),
        pageInfo: result.business.bills.pageInfo,
      };
    },
  },

  getBill: {
    name: 'wave_get_bill',
    description: 'Get details of a specific bill',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        billId: { type: 'string', description: 'Bill ID', required: true },
      },
      required: ['billId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; billId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!, $billId: ID!) {
          business(id: $businessId) {
            bill(id: $billId) {
              id
              createdAt
              modifiedAt
              status
              billNumber
              invoiceNumber
              billDate
              dueDate
              vendor { id name email }
              currency { code }
              items {
                description
                quantity
                unitPrice
                account { id name }
                total { value currency { code } }
                taxes {
                  salesTax { id name }
                  amount { value }
                }
              }
              memo
              subtotal { value currency { code } }
              total { value currency { code } }
              amountDue { value currency { code } }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, billId: args.billId });
      return result.business.bill;
    },
  },

  createBill: {
    name: 'wave_create_bill',
    description: 'Create a new bill',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        vendorId: { type: 'string', description: 'Vendor ID', required: true },
        billDate: { type: 'string', description: 'Bill date (YYYY-MM-DD)', required: true },
        dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
        items: {
          type: 'array',
          description: 'Bill line items',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
              accountId: { type: 'string' },
            },
          },
          required: true,
        },
      },
      required: ['vendorId', 'billDate', 'items'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: BillCreateInput!) {
          billCreate(input: { businessId: $businessId, bill: $input }) {
            bill {
              id
              billNumber
              status
              total { value currency { code } }
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, input: args });
      return result.billCreate;
    },
  },

  // ========== VENDOR TOOLS ==========

  listVendors: {
    name: 'wave_list_vendors',
    description: 'List all vendors',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        pageSize: { type: 'number', description: 'Items per page (default: 50)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string; page?: number; pageSize?: number }) => {
      const businessId = args.businessId || client.getBusinessId();
      const page = args.page || 1;
      const pageSize = args.pageSize || 50;
      const query = `
        query($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            vendors(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  name
                  email
                  currency { code }
                  address {
                    addressLine1
                    city
                    country { name }
                  }
                }
              }
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, page, pageSize });
      return {
        vendors: result.business.vendors.edges.map((e: any) => e.node),
        pageInfo: result.business.vendors.pageInfo,
      };
    },
  },

  createVendor: {
    name: 'wave_create_vendor',
    description: 'Create a new vendor',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        name: { type: 'string', description: 'Vendor name', required: true },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        website: { type: 'string', description: 'Website URL' },
        currency: { type: 'string', description: 'Currency code' },
      },
      required: ['name'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: VendorCreateInput!) {
          vendorCreate(input: { businessId: $businessId, vendor: $input }) {
            vendor {
              id
              name
              email
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, input: args });
      return result.vendorCreate;
    },
  },

  // ========== SALES TAX TOOLS ==========

  listSalesTaxes: {
    name: 'wave_list_sales_taxes',
    description: 'List all sales taxes',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!) {
          business(id: $businessId) {
            salesTaxes {
              id
              name
              abbreviation
              description
              rate
              isArchived
              isCompound
              isRecoverable
              showTaxNumber
            }
          }
        }
      `;
      const result = await client.query(query, { businessId });
      return result.business.salesTaxes;
    },
  },

  createSalesTax: {
    name: 'wave_create_sales_tax',
    description: 'Create a new sales tax',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        name: { type: 'string', description: 'Tax name', required: true },
        abbreviation: { type: 'string', description: 'Tax abbreviation' },
        rate: { type: 'number', description: 'Tax rate (e.g., 0.05 for 5%)', required: true },
        description: { type: 'string', description: 'Tax description' },
      },
      required: ['name', 'rate'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: SalesTaxCreateInput!) {
          salesTaxCreate(input: { businessId: $businessId, salesTax: $input }) {
            salesTax {
              id
              name
              rate
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, input: args });
      return result.salesTaxCreate;
    },
  },

  // ========== ESTIMATE TOOLS ==========

  listEstimates: {
    name: 'wave_list_estimates',
    description: 'List all estimates/quotes',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        pageSize: { type: 'number', description: 'Items per page (default: 50)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string; page?: number; pageSize?: number }) => {
      const businessId = args.businessId || client.getBusinessId();
      const page = args.page || 1;
      const pageSize = args.pageSize || 50;
      const query = `
        query($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            estimates(page: $page, pageSize: $pageSize) {
              edges {
                node {
                  id
                  createdAt
                  estimateNumber
                  estimateDate
                  expiryDate
                  status
                  customer { id name }
                  total { value currency { code } }
                  viewUrl
                  pdfUrl
                }
              }
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, page, pageSize });
      return {
        estimates: result.business.estimates.edges.map((e: any) => e.node),
        pageInfo: result.business.estimates.pageInfo,
      };
    },
  },

  createEstimate: {
    name: 'wave_create_estimate',
    description: 'Create a new estimate/quote',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        customerId: { type: 'string', description: 'Customer ID', required: true },
        items: {
          type: 'array',
          description: 'Estimate line items',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              description: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
            },
          },
          required: true,
        },
        estimateDate: { type: 'string', description: 'Estimate date (YYYY-MM-DD)' },
        expiryDate: { type: 'string', description: 'Expiry date (YYYY-MM-DD)' },
        title: { type: 'string', description: 'Estimate title' },
        memo: { type: 'string', description: 'Memo/notes' },
      },
      required: ['customerId', 'items'],
    },
    handler: async (client: WaveClient, args: any) => {
      const businessId = args.businessId || client.getBusinessId();
      const mutation = `
        mutation($businessId: ID!, $input: EstimateCreateInput!) {
          estimateCreate(input: { businessId: $businessId, estimate: $input }) {
            estimate {
              id
              estimateNumber
              status
              total { value currency { code } }
            }
            didSucceed
            inputErrors {
              path
              message
            }
          }
        }
      `;
      const result = await client.mutate(mutation, { businessId, input: args });
      return result.estimateCreate;
    },
  },

  // ========== REPORTING TOOLS ==========

  getAccountBalances: {
    name: 'wave_get_account_balances',
    description: 'Get current balances for all accounts',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
      },
    },
    handler: async (client: WaveClient, args: { businessId?: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!) {
          business(id: $businessId) {
            accounts(page: 1, pageSize: 200) {
              edges {
                node {
                  id
                  name
                  type { name }
                  subtype { name }
                  currency { code }
                  isArchived
                }
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId });
      return result.business.accounts.edges.map((e: any) => e.node);
    },
  },

  getProfitAndLoss: {
    name: 'wave_get_profit_and_loss',
    description: 'Get Profit & Loss (Income Statement) report',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)', required: true },
      },
      required: ['startDate', 'endDate'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; startDate: string; endDate: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      // This is a simplified version - Wave's actual P&L query is more complex
      const query = `
        query($businessId: ID!, $startDate: Date!, $endDate: Date!) {
          business(id: $businessId) {
            id
            name
          }
        }
      `;
      const result = await client.query(query, { businessId, startDate: args.startDate, endDate: args.endDate });
      return { 
        message: 'P&L report generation - requires additional implementation',
        business: result.business,
        period: { startDate: args.startDate, endDate: args.endDate },
      };
    },
  },

  getBalanceSheet: {
    name: 'wave_get_balance_sheet',
    description: 'Get Balance Sheet report',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        date: { type: 'string', description: 'Report date (YYYY-MM-DD)', required: true },
      },
      required: ['date'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; date: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!) {
          business(id: $businessId) {
            id
            name
          }
        }
      `;
      const result = await client.query(query, { businessId });
      return { 
        message: 'Balance sheet generation - requires additional implementation',
        business: result.business,
        date: args.date,
      };
    },
  },

  // ========== UTILITY TOOLS ==========

  listCountries: {
    name: 'wave_list_countries',
    description: 'List all available countries',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (client: WaveClient, _args: any) => {
      const query = `
        query {
          countries {
            code
            name
            currency {
              code
              symbol
              name
            }
          }
        }
      `;
      const result = await client.query(query);
      return result.countries;
    },
  },

  listCurrencies: {
    name: 'wave_list_currencies',
    description: 'List all available currencies',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (client: WaveClient, _args: any) => {
      const query = `
        query {
          currencies {
            code
            symbol
            name
            plural
            exponent
          }
        }
      `;
      const result = await client.query(query);
      return result.currencies;
    },
  },

  getInvoicePdf: {
    name: 'wave_get_invoice_pdf',
    description: 'Get PDF URL for an invoice',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        invoiceId: { type: 'string', description: 'Invoice ID', required: true },
      },
      required: ['invoiceId'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; invoiceId: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      const query = `
        query($businessId: ID!, $invoiceId: ID!) {
          business(id: $businessId) {
            invoice(id: $invoiceId) {
              id
              invoiceNumber
              pdfUrl
              viewUrl
            }
          }
        }
      `;
      const result = await client.query(query, { businessId, invoiceId: args.invoiceId });
      return result.business.invoice;
    },
  },

  searchCustomers: {
    name: 'wave_search_customers',
    description: 'Search customers by name or email',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID (optional if set in config)' },
        searchTerm: { type: 'string', description: 'Search term (name or email)', required: true },
      },
      required: ['searchTerm'],
    },
    handler: async (client: WaveClient, args: { businessId?: string; searchTerm: string }) => {
      const businessId = args.businessId || client.getBusinessId();
      // Note: Wave's GraphQL API doesn't have built-in search, so we'll list and filter
      const query = `
        query($businessId: ID!) {
          business(id: $businessId) {
            customers(page: 1, pageSize: 100) {
              edges {
                node {
                  id
                  name
                  firstName
                  lastName
                  email
                }
              }
            }
          }
        }
      `;
      const result = await client.query(query, { businessId });
      const allCustomers = result.business.customers.edges.map((e: any) => e.node);
      const searchLower = args.searchTerm.toLowerCase();
      const filtered = allCustomers.filter((c: any) => 
        c.name?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.firstName?.toLowerCase().includes(searchLower) ||
        c.lastName?.toLowerCase().includes(searchLower)
      );
      return filtered;
    },
  },
};

export type WaveTool = keyof typeof waveTools;
