# Error Fixes

## Wave MCP Tools

- **[tooling] MCP server must be restarted after code changes**: Cursor does not auto-reload the MCP server process. After `npm run build`, the user must manually restart the server for changes to take effect.

- **[tooling] Wave API "Node could not be found" can be transient**: The `invoiceCreate` mutation occasionally returns this error even with valid product/customer IDs. Retry the same request before debugging -- it usually succeeds on the second attempt.

- **[tooling] Many Wave MCP tools have wrong GraphQL field names**: The tools were authored without strict validation against the Wave API. Always verify tool behavior against https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference before trusting a tool. The MCP server instructions list specific broken tools.

- **[tooling] wave_create_invoice_payment was completely broken**: Original used wrong mutation (`invoicePaymentCreate` vs `invoicePaymentCreateManual`), wrong fields (`date` vs `paymentDate`, nonexistent `source`), and was missing required fields (`paymentAccountId`, `paymentMethod`, `exchangeRate`). Fixed in this session.

- **[tooling] wave_send_payment_receipt did not exist**: Added during this session. Uses `invoicePaymentReceiptSend` mutation with fields: `invoiceId`, `invoicePaymentId`, `to`, `subject`, `message`, `attachPdf`, `ccMyself`, `fromAddress`.

- **[tooling] wave_create_invoice was missing most API fields**: Original only had basic fields. Updated to include `status`, `currency`, `invoiceNumber`, `poNumber`, `exchangeRate`, `discounts`, payment disable flags, column label overrides, visibility flags, and `requireTermsOfServiceAgreement`. Item tax structure changed from `taxIds` to `taxes: [{salesTaxId}]`.

- **[tooling] wave_delete_invoice passed businessId to InvoiceDeleteInput**: `InvoiceDeleteInput` only accepts `invoiceId`. Removed `businessId` from the mutation input.
