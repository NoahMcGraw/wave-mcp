/**
 * Wave Product Tools (Products and Services)
 */

import type { WaveClient } from '../client.js';
import type { Product } from '../types/index.js';

export function registerProductTools(client: WaveClient) {
  return {
    wave_list_products: {
      description: 'List all products and services for a business',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          isSold: { type: 'boolean', description: 'Filter products that are sold' },
          isBought: { type: 'boolean', description: 'Filter products that are bought' },
          isArchived: { type: 'boolean', description: 'Include archived products (default: false)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
          pageSize: { type: 'number', description: 'Results per page (default: 50)' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetProducts($businessId: ID!, $page: Int!, $pageSize: Int!) {
            business(id: $businessId) {
              products(page: $page, pageSize: $pageSize) {
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
                    unitPrice
                    isSold
                    isBought
                    isArchived
                    incomeAccount {
                      id
                      name
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

        // Client-side filtering
        let products = result.business.products.edges.map((e: any) => e.node);
        
        if (args.isSold !== undefined) {
          products = products.filter((p: any) => p.isSold === args.isSold);
        }
        if (args.isBought !== undefined) {
          products = products.filter((p: any) => p.isBought === args.isBought);
        }
        if (args.isArchived === false) {
          products = products.filter((p: any) => !p.isArchived);
        }

        return {
          products,
          pageInfo: result.business.products.pageInfo,
        };
      },
    },

    wave_get_product: {
      description: 'Get detailed information about a specific product or service',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          productId: { type: 'string', description: 'Product ID' },
        },
        required: ['productId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetProduct($businessId: ID!, $productId: ID!) {
            business(id: $businessId) {
              product(id: $productId) {
                id
                name
                description
                unitPrice
                isSold
                isBought
                isArchived
                incomeAccount {
                  id
                  name
                  type { name }
                }
                createdAt
                modifiedAt
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          productId: args.productId,
        });

        return result.business.product;
      },
    },

    wave_create_product: {
      description: 'Create a new product or service',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          name: { type: 'string', description: 'Product/service name' },
          description: { type: 'string', description: 'Product description' },
          unitPrice: { type: 'string', description: 'Default unit price' },
          incomeAccountId: { type: 'string', description: 'Income account ID' },
          isSold: { type: 'boolean', description: 'Is this product sold to customers? (default: true)' },
          isBought: { type: 'boolean', description: 'Is this product bought from vendors? (default: false)' },
        },
        required: ['name'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation CreateProduct($input: ProductCreateInput!) {
            productCreate(input: $input) {
              product {
                id
                name
                description
                unitPrice
                isSold
                isBought
                incomeAccount {
                  id
                  name
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
            unitPrice: args.unitPrice,
            incomeAccountId: args.incomeAccountId,
            isSold: args.isSold ?? true,
            isBought: args.isBought ?? false,
          },
        });

        if (!result.productCreate.didSucceed) {
          throw new Error(`Failed to create product: ${JSON.stringify(result.productCreate.inputErrors)}`);
        }

        return result.productCreate.product;
      },
    },

    wave_update_product: {
      description: 'Update an existing product or service',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          productId: { type: 'string', description: 'Product ID' },
          name: { type: 'string', description: 'Product name' },
          description: { type: 'string', description: 'Product description' },
          unitPrice: { type: 'string', description: 'Default unit price' },
          incomeAccountId: { type: 'string', description: 'Income account ID' },
        },
        required: ['productId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation UpdateProduct($input: ProductUpdateInput!) {
            productUpdate(input: $input) {
              product {
                id
                name
                description
                unitPrice
                incomeAccount {
                  id
                  name
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
            productId: args.productId,
            name: args.name,
            description: args.description,
            unitPrice: args.unitPrice,
            incomeAccountId: args.incomeAccountId,
          },
        });

        if (!result.productUpdate.didSucceed) {
          throw new Error(`Failed to update product: ${JSON.stringify(result.productUpdate.inputErrors)}`);
        }

        return result.productUpdate.product;
      },
    },

    wave_delete_product: {
      description: 'Delete (archive) a product or service',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          productId: { type: 'string', description: 'Product ID' },
        },
        required: ['productId'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const mutation = `
          mutation ArchiveProduct($input: ProductArchiveInput!) {
            productArchive(input: $input) {
              product {
                id
                isArchived
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
            productId: args.productId,
          },
        });

        if (!result.productArchive.didSucceed) {
          throw new Error(`Failed to archive product: ${JSON.stringify(result.productArchive.inputErrors)}`);
        }

        return { success: true, message: 'Product archived successfully' };
      },
    },
  };
}
