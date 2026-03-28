# Patterns

## Wave API

- **[tooling] Always check MCP server instructions first**: The server returns an `instructions` string at connection time listing working workflows, data format conventions, and known broken tools. Read it before using any tool.

- **[tooling] invoicing-config.json has saved defaults**: Contains customer/business IDs, payment account, receipt email templates, and per-account invoice creation params (product IDs, Slack channels, EOD search queries). Read it before any invoicing task.

- **[tooling] Wave API amounts are Decimal strings**: Pass monetary values as strings like `"100.00"`, not numbers. GraphQL `Decimal` type.

- **[tooling] Wave API dates are YYYY-MM-DD strings**: All date fields (`invoiceDate`, `dueDate`, `paymentDate`) use this format.

- **[tooling] Invoice creation from Slack EODs**: For accounts configured in invoicing-config.json, EOD updates in Slack drive line item descriptions. EODs are sometimes posted early the next morning -- map by work day, not post timestamp. Exclude "Business Value:" lines. Preserve Trello card URLs from Slack's `<url|text>` format.

## Broken Tools to Avoid

These tools will fail with "Invalid query" or similar errors. See MCP server instructions for the full list. Do not use without fixing first:
- `wave_search_customers`, `wave_list_customers`, `wave_get_current_business`
- `wave_create_product` (passes invalid fields)
- `wave_update_invoice` (wrong mutation name)
- `wave_get_invoice` (invalid field on InvoiceItemTax)
- `wave_list_invoices` (status/customerId filters don't work)
