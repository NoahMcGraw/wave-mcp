# Wave MCP Server

An MCP server for [Wave Accounting](https://waveapps.com), providing access to invoicing, customers, products, transactions, bills, estimates, taxes, and financial reporting via Wave's GraphQL API.

## Features

### 54 Tools across 10 categories

| Category | Tools | Capabilities |
|---|---|---|
| **Invoices** | 10 | List, get, create, update, delete, send, approve, mark sent, list/record payments |
| **Customers** | 6 | List, get, create, update, delete, search by name/email |
| **Products** | 5 | List, get, create, update, archive products and services |
| **Accounts** | 4 | List, get, create, update chart of accounts |
| **Transactions** | 6 | List, get, create, update, categorize, list attachments |
| **Bills** | 6 | List, get, create, update, list/record bill payments |
| **Estimates** | 6 | List, get, create, update, send, convert to invoice |
| **Taxes** | 3 | List, get, create sales taxes |
| **Businesses** | 3 | List, get current, get by ID |
| **Reporting** | 5 | P&L, Balance Sheet, Aged Receivables, Tax Summary, Cashflow |

### 17 MCP App Resources

Pre-built UI layout definitions accessible via `wave://apps/{name}`:

`invoice-dashboard`, `invoice-detail`, `invoice-builder`, `customer-detail`, `customer-grid`, `product-catalog`, `chart-of-accounts`, `transaction-feed`, `transaction-categorizer`, `bill-manager`, `estimate-builder`, `tax-overview`, `profit-loss`, `balance-sheet`, `cashflow-chart`, `aging-report`, `business-overview`

## Prerequisites

1. A [Wave](https://waveapps.com) account
2. An OAuth2 access token from the [Wave Developer Portal](https://developer.waveapps.com/)

## Installation

```bash
npm install
npm run build
```

## Configuration

```bash
# Required
export WAVE_ACCESS_TOKEN=your_oauth2_access_token

# Optional — set a default business ID so you don't have to pass it every call
export WAVE_BUSINESS_ID=your_business_id
```

## Usage

### Run directly

```bash
WAVE_ACCESS_TOKEN=your_token npm run dev
```

### With Cursor / Claude Desktop

Add to your MCP config:

```json
{
  "mcpServers": {
    "wave": {
      "command": "node",
      "args": ["/path/to/wave-mcp/build/main.js"],
      "env": {
        "WAVE_ACCESS_TOKEN": "your_access_token",
        "WAVE_BUSINESS_ID": "optional_business_id"
      }
    }
  }
}
```

## Examples

```typescript
// List overdue invoices
wave_list_invoices({ status: "OVERDUE" })

// Create an invoice
wave_create_invoice({
  customerId: "customer_456",
  invoiceDate: "2026-01-15",
  items: [
    { description: "Consulting", quantity: 10, unitPrice: "150.00" }
  ]
})

// Profit & Loss report
wave_profit_and_loss({ startDate: "2026-01-01", endDate: "2026-03-31" })

// Search customers
wave_search_customers({ query: "acme" })
```

## Architecture

```
src/
├── main.ts                 # Entry point — reads env, starts server
├── server.ts               # MCP server setup, request routing
├── client.ts               # Wave GraphQL API client (gql.waveapps.com)
├── types/index.ts           # TypeScript types for all Wave entities
├── tools/
│   ├── invoices-tools.ts    # 10 invoice tools
│   ├── customers-tools.ts   # 6 customer tools
│   ├── products-tools.ts    # 5 product tools
│   ├── accounts-tools.ts    # 4 account tools
│   ├── transactions-tools.ts # 6 transaction tools
│   ├── bills-tools.ts       # 6 bill tools
│   ├── estimates-tools.ts   # 6 estimate tools
│   ├── taxes-tools.ts       # 3 tax tools
│   ├── businesses-tools.ts  # 3 business tools
│   └── reporting-tools.ts   # 5 reporting tools
└── apps/index.ts            # 17 MCP app resource definitions
```

All tools use parameterized GraphQL queries against `https://gql.waveapps.com/graphql/public`. Auth is via OAuth2 Bearer token.

## Development

```bash
npm run build     # Compile TypeScript
npm run watch     # Watch mode
npx tsc --noEmit  # Type-check without emitting
```

## License

MIT
