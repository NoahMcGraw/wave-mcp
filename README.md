# Wave MCP Server

A complete Model Context Protocol (MCP) server for Wave Accounting, providing comprehensive access to invoicing, customers, products, transactions, bills, estimates, taxes, and financial reporting.

## Features

### 🔧 **45+ Tools** across 10 categories:

#### Invoices (10 tools)
- List, get, create, update, delete invoices
- Send invoices via email
- Approve and mark invoices as sent
- List and record invoice payments

#### Customers (6 tools)
- List, get, create, update, delete customers
- Search customers by name or email

#### Products (5 tools)
- List, get, create, update, archive products and services
- Filter by sold/bought status

#### Accounts (4 tools)
- List, get, create, update chart of accounts
- Filter by account type (ASSET, LIABILITY, EQUITY, INCOME, EXPENSE)

#### Transactions (6 tools)
- List, get, create, update transactions
- Categorize transactions to accounts
- List transaction attachments

#### Bills (7 tools)
- List, get, create, update bills (accounts payable)
- List and record bill payments

#### Estimates (6 tools)
- List, get, create, update, send estimates
- Convert estimates to invoices

#### Taxes (3 tools)
- List, get, create sales taxes

#### Businesses (3 tools)
- List businesses
- Get current or specific business details

#### Reporting (5 tools)
- Profit & Loss (Income Statement)
- Balance Sheet
- Aged Receivables (A/R Aging)
- Tax Summary
- Cashflow Statement

### 📱 **17 MCP Apps** - Pre-built UI workflows:

1. **invoice-dashboard** - Overview of invoices with status breakdown
2. **invoice-detail** - Detailed invoice view with payments and actions
3. **invoice-builder** - Create/edit invoices with line items
4. **customer-detail** - Customer profile with invoice history
5. **customer-grid** - Searchable customer grid
6. **product-catalog** - Product/service management
7. **chart-of-accounts** - Account tree view
8. **transaction-feed** - Real-time transaction stream
9. **transaction-categorizer** - Bulk transaction categorization
10. **bill-manager** - Track and pay bills
11. **estimate-builder** - Create and manage quotes
12. **tax-overview** - Tax configuration and summary
13. **profit-loss** - P&L report with visualization
14. **balance-sheet** - Balance sheet report
15. **cashflow-chart** - Cashflow waterfall chart
16. **aging-report** - Aged receivables report
17. **business-overview** - Business dashboard with quick actions

## Installation

```bash
cd servers/wave
npm install
npm run build
```

## Configuration

### Prerequisites

1. **Wave Account**: You need a Wave account at [waveapps.com](https://waveapps.com)
2. **API Access Token**: Get an OAuth2 access token from [Wave Developer Portal](https://developer.waveapps.com/)

### Environment Variables

```bash
# Required
WAVE_ACCESS_TOKEN=your_oauth2_access_token

# Optional - set a default business ID
WAVE_BUSINESS_ID=your_business_id
```

## Usage

### As MCP Server

Run the server:

```bash
WAVE_ACCESS_TOKEN=your_token npm run dev
```

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wave": {
      "command": "node",
      "args": ["/path/to/mcpengine-repo/servers/wave/build/main.js"],
      "env": {
        "WAVE_ACCESS_TOKEN": "your_access_token",
        "WAVE_BUSINESS_ID": "optional_business_id"
      }
    }
  }
}
```

### With NPX

```bash
npx @mcpengine/wave-server
```

## Tool Examples

### List Invoices

```typescript
// List all invoices
wave_list_invoices({ businessId: "business_123" })

// Filter by status
wave_list_invoices({ 
  businessId: "business_123",
  status: "OVERDUE"
})

// Filter by customer
wave_list_invoices({
  businessId: "business_123", 
  customerId: "customer_456"
})
```

### Create Invoice

```typescript
wave_create_invoice({
  businessId: "business_123",
  customerId: "customer_456",
  invoiceDate: "2025-01-15",
  dueDate: "2025-02-15",
  title: "January Services",
  items: [
    {
      description: "Consulting Services",
      quantity: 10,
      unitPrice: "150.00",
      taxIds: ["tax_789"]
    },
    {
      productId: "product_101",
      description: "Software License",
      quantity: 1,
      unitPrice: "500.00"
    }
  ]
})
```

### Create Customer

```typescript
wave_create_customer({
  businessId: "business_123",
  name: "Acme Corporation",
  email: "billing@acme.com",
  addressLine1: "123 Main Street",
  city: "San Francisco",
  provinceCode: "CA",
  countryCode: "US",
  postalCode: "94105"
})
```

### Generate Reports

```typescript
// Profit & Loss
wave_profit_and_loss({
  businessId: "business_123",
  startDate: "2025-01-01",
  endDate: "2025-01-31"
})

// Balance Sheet
wave_balance_sheet({
  businessId: "business_123",
  asOfDate: "2025-01-31"
})

// Aged Receivables
wave_aged_receivables({
  businessId: "business_123",
  asOfDate: "2025-01-31"
})
```

## API Architecture

### GraphQL-Based

Wave uses a GraphQL API, not REST. The server handles:

- **Authentication**: OAuth2 Bearer token
- **Error Handling**: GraphQL error parsing and network error detection
- **Type Safety**: Full TypeScript types for all Wave entities
- **Pagination**: Automatic page handling for large result sets

### Client Implementation

```typescript
// client.ts
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('https://gql.waveapps.com/graphql/public', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});
```

## Tool Organization

```
src/tools/
├── invoices-tools.ts      # 10 tools for invoice management
├── customers-tools.ts     # 6 tools for customer management
├── products-tools.ts      # 5 tools for product/service catalog
├── accounts-tools.ts      # 4 tools for chart of accounts
├── transactions-tools.ts  # 6 tools for transaction management
├── bills-tools.ts         # 7 tools for bills payable
├── estimates-tools.ts     # 6 tools for estimates/quotes
├── taxes-tools.ts         # 3 tools for sales tax management
├── businesses-tools.ts    # 3 tools for business info
└── reporting-tools.ts     # 5 tools for financial reports
```

## Type System

Complete TypeScript types for all Wave entities:

```typescript
// types/index.ts
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'APPROVED';
  items: InvoiceItem[];
  total: Money;
  amountDue: Money;
  amountPaid: Money;
  // ... full type definitions
}
```

## Error Handling

The server provides comprehensive error handling:

```typescript
try {
  const invoice = await wave_get_invoice({ invoiceId: "inv_123" });
} catch (error) {
  // GraphQL errors
  if (error.graphQLErrors) {
    console.error('GraphQL errors:', error.graphQLErrors);
  }
  
  // Network errors
  if (error.networkError) {
    console.error('Network error:', error.networkError);
  }
  
  // HTTP status codes
  if (error.statusCode) {
    console.error('HTTP status:', error.statusCode);
  }
}
```

## MCP Apps

Apps are accessed via resources:

```typescript
// List all apps
const apps = await readResource({ uri: "wave://apps" });

// Load specific app
const invoiceDashboard = await readResource({ 
  uri: "wave://apps/invoice-dashboard" 
});
```

Each app includes:
- **Display name and description**
- **Default tools** to load
- **Layout configuration** for UI rendering
- **Workflow steps** (for process-driven apps)

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Type Checking

```bash
npx tsc --noEmit
```

## License

MIT

## Links

- [Wave Developer Portal](https://developer.waveapps.com/)
- [Wave GraphQL API Docs](https://developer.waveapps.com/hc/en-us/articles/360019762711)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [MCPEngine Repository](https://github.com/BusyBee3333/mcpengine)

## Contributing

Contributions welcome! Please see the main [MCPEngine repository](https://github.com/BusyBee3333/mcpengine) for guidelines.

## Support

For issues or questions:
- Wave API issues: [Wave Developer Support](https://developer.waveapps.com/hc/en-us)
- MCP Server issues: [GitHub Issues](https://github.com/BusyBee3333/mcpengine/issues)
