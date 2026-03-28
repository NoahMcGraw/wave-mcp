/**
 * Wave Reporting Tools
 */

import type { WaveClient } from '../client.js';

export function registerReportingTools(client: WaveClient) {
  return {
    wave_profit_and_loss: {
      description: 'Generate a Profit & Loss (Income Statement) report',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          startDate: { type: 'string', description: 'Report start date (YYYY-MM-DD)' },
          endDate: { type: 'string', description: 'Report end date (YYYY-MM-DD)' },
        },
        required: ['startDate', 'endDate'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetProfitAndLoss($businessId: ID!, $startDate: Date!, $endDate: Date!) {
            business(id: $businessId) {
              profitAndLoss(startDate: $startDate, endDate: $endDate) {
                startDate
                endDate
                revenue {
                  value
                  currency { code }
                }
                costOfGoodsSold {
                  value
                }
                grossProfit {
                  value
                }
                expenses {
                  value
                }
                netIncome {
                  value
                }
                sections {
                  name
                  total { value }
                  accounts {
                    account {
                      id
                      name
                    }
                    balance { value }
                  }
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          startDate: args.startDate,
          endDate: args.endDate,
        });

        return result.business.profitAndLoss;
      },
    },

    wave_balance_sheet: {
      description: 'Generate a Balance Sheet report',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          asOfDate: { type: 'string', description: 'Report as-of date (YYYY-MM-DD)' },
        },
        required: ['asOfDate'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetBalanceSheet($businessId: ID!, $asOfDate: Date!) {
            business(id: $businessId) {
              balanceSheet(asOfDate: $asOfDate) {
                asOfDate
                assets {
                  value
                  currency { code }
                }
                liabilities {
                  value
                }
                equity {
                  value
                }
                sections {
                  name
                  total { value }
                  accounts {
                    account {
                      id
                      name
                    }
                    balance { value }
                  }
                  subsections {
                    name
                    total { value }
                    accounts {
                      account {
                        id
                        name
                      }
                      balance { value }
                    }
                  }
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          asOfDate: args.asOfDate,
        });

        return result.business.balanceSheet;
      },
    },

    wave_aged_receivables: {
      description: 'Generate an Aged Receivables (A/R Aging) report',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          asOfDate: { type: 'string', description: 'Report as-of date (YYYY-MM-DD, defaults to today)' },
        },
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetAgedReceivables($businessId: ID!, $asOfDate: Date!) {
            business(id: $businessId) {
              agedReceivables(asOfDate: $asOfDate) {
                asOfDate
                total {
                  value
                  currency { code }
                }
                customers {
                  customer {
                    id
                    name
                  }
                  total { value }
                  current { value }
                  days1to30 { value }
                  days31to60 { value }
                  days61to90 { value }
                  over90 { value }
                }
              }
            }
          }
        `;

        const asOfDate = args.asOfDate || new Date().toISOString().split('T')[0];

        const result = await client.query(query, {
          businessId,
          asOfDate,
        });

        return result.business.agedReceivables;
      },
    },

    wave_tax_summary: {
      description: 'Generate a tax summary report for a date range',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          startDate: { type: 'string', description: 'Report start date (YYYY-MM-DD)' },
          endDate: { type: 'string', description: 'Report end date (YYYY-MM-DD)' },
        },
        required: ['startDate', 'endDate'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetTaxSummary($businessId: ID!, $startDate: Date!, $endDate: Date!) {
            business(id: $businessId) {
              taxSummary(startDate: $startDate, endDate: $endDate) {
                startDate
                endDate
                taxes {
                  tax {
                    id
                    name
                    rate
                  }
                  totalTaxCollected {
                    value
                    currency { code }
                  }
                  totalTaxPaid {
                    value
                  }
                  netTaxDue {
                    value
                  }
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          startDate: args.startDate,
          endDate: args.endDate,
        });

        return result.business.taxSummary;
      },
    },

    wave_cashflow: {
      description: 'Generate a cashflow statement for a date range',
      parameters: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'Business ID' },
          startDate: { type: 'string', description: 'Report start date (YYYY-MM-DD)' },
          endDate: { type: 'string', description: 'Report end date (YYYY-MM-DD)' },
        },
        required: ['startDate', 'endDate'],
      },
      handler: async (args: any) => {
        const businessId = args.businessId || client.getBusinessId();
        if (!businessId) throw new Error('businessId required');

        const query = `
          query GetCashflow($businessId: ID!, $startDate: Date!, $endDate: Date!) {
            business(id: $businessId) {
              cashflow(startDate: $startDate, endDate: $endDate) {
                startDate
                endDate
                operatingActivities {
                  value
                  currency { code }
                }
                investingActivities {
                  value
                }
                financingActivities {
                  value
                }
                netCashChange {
                  value
                }
              }
            }
          }
        `;

        const result = await client.query(query, {
          businessId,
          startDate: args.startDate,
          endDate: args.endDate,
        });

        return result.business.cashflow;
      },
    },
  };
}
