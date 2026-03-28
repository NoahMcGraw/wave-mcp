---
description: When working with invoices, payments, or receipts — recording payments, sending receipts, creating invoices, or any invoice processing workflow
globs:
  - invoicing-config.json
  - src/tools/invoices-tools.ts
alwaysApply: true
---

# Invoicing Workflow Config

Before processing payments, sending receipts, creating invoices, or performing any invoicing task, read `invoicing-config.json` in the project root. It contains all saved defaults (IDs, accounts, email templates, workflows, overtime rules, etc.) and step-by-step workflows so you don't need to look anything up.

Key sections:
- `invoiceWorkflow` -- end-to-end create + approve + send pipeline
- `paymentWorkflow` -- mark paid + send receipts pipeline
- `_overtimeRule` -- how to determine standard vs overtime products across accounts
- `_hoursRule` -- how to vary daily hours within a week
- `accounts` -- per-account Slack channels, products, and creation workflows
