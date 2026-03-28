/**
 * Wave MCP Apps
 * Pre-built UI applications for common workflows
 */

export const waveApps = [
  {
    name: 'invoice-dashboard',
    displayName: 'Invoice Dashboard',
    description: 'Overview of all invoices with status breakdown, recent activity, and aging analysis',
    category: 'invoicing',
    defaultTools: ['wave_list_invoices', 'wave_get_invoice', 'wave_list_invoice_payments'],
    layout: {
      type: 'dashboard',
      widgets: [
        { type: 'status-cards', tools: ['wave_list_invoices'], groupBy: 'status' },
        { type: 'table', tool: 'wave_list_invoices', columns: ['invoiceNumber', 'customer', 'status', 'total', 'amountDue', 'dueDate'] },
        { type: 'chart', chartType: 'bar', tool: 'wave_list_invoices', x: 'status', y: 'total' },
      ],
    },
  },
  {
    name: 'invoice-detail',
    displayName: 'Invoice Detail View',
    description: 'Detailed view of a single invoice with line items, payments, and actions',
    category: 'invoicing',
    defaultTools: ['wave_get_invoice', 'wave_list_invoice_payments', 'wave_send_invoice', 'wave_create_invoice_payment'],
    layout: {
      type: 'detail',
      sections: [
        { type: 'header', fields: ['invoiceNumber', 'status', 'customer', 'total', 'amountDue'] },
        { type: 'line-items', tool: 'wave_get_invoice', path: 'items' },
        { type: 'payments', tool: 'wave_list_invoice_payments' },
        { type: 'actions', buttons: ['send', 'mark-sent', 'record-payment', 'approve'] },
      ],
    },
  },
  {
    name: 'invoice-builder',
    displayName: 'Invoice Builder',
    description: 'Create and edit invoices with line items, customer selection, and tax calculation',
    category: 'invoicing',
    defaultTools: ['wave_create_invoice', 'wave_update_invoice', 'wave_list_customers', 'wave_list_products', 'wave_list_taxes'],
    layout: {
      type: 'form',
      sections: [
        { type: 'customer-select', tool: 'wave_list_customers' },
        { type: 'date-fields', fields: ['invoiceDate', 'dueDate'] },
        { type: 'line-item-editor', productTool: 'wave_list_products', taxTool: 'wave_list_taxes' },
        { type: 'total-calculator', showTax: true, showSubtotal: true },
        { type: 'submit', createTool: 'wave_create_invoice', updateTool: 'wave_update_invoice' },
      ],
    },
  },
  {
    name: 'customer-detail',
    displayName: 'Customer Detail',
    description: 'Customer profile with contact info, invoices, and payment history',
    category: 'customers',
    defaultTools: ['wave_get_customer', 'wave_update_customer', 'wave_list_invoices'],
    layout: {
      type: 'detail',
      sections: [
        { type: 'profile', fields: ['name', 'email', 'phone', 'address'] },
        { type: 'invoices', tool: 'wave_list_invoices', filter: { customerId: 'current' } },
        { type: 'statistics', metrics: ['totalInvoiced', 'totalPaid', 'outstandingBalance'] },
      ],
    },
  },
  {
    name: 'customer-grid',
    displayName: 'Customer Grid',
    description: 'Searchable, sortable grid of all customers with quick actions',
    category: 'customers',
    defaultTools: ['wave_list_customers', 'wave_search_customers', 'wave_create_customer'],
    layout: {
      type: 'grid',
      columns: ['name', 'email', 'city', 'outstandingBalance', 'actions'],
      features: ['search', 'sort', 'filter', 'create'],
      actions: ['view', 'edit', 'create-invoice'],
    },
  },
  {
    name: 'product-catalog',
    displayName: 'Product Catalog',
    description: 'Manage products and services with pricing and account mapping',
    category: 'products',
    defaultTools: ['wave_list_products', 'wave_create_product', 'wave_update_product', 'wave_delete_product'],
    layout: {
      type: 'grid',
      columns: ['name', 'description', 'unitPrice', 'incomeAccount', 'actions'],
      features: ['search', 'filter', 'create', 'archive'],
      filters: ['isSold', 'isBought', 'isArchived'],
    },
  },
  {
    name: 'chart-of-accounts',
    displayName: 'Chart of Accounts',
    description: 'View and manage the chart of accounts with balances',
    category: 'accounting',
    defaultTools: ['wave_list_accounts', 'wave_create_account', 'wave_update_account'],
    layout: {
      type: 'tree',
      groupBy: 'type',
      columns: ['name', 'type', 'subtype', 'balance', 'actions'],
      features: ['create', 'edit', 'expand-collapse'],
    },
  },
  {
    name: 'transaction-feed',
    displayName: 'Transaction Feed',
    description: 'Real-time feed of all transactions with filtering and search',
    category: 'accounting',
    defaultTools: ['wave_list_transactions', 'wave_get_transaction', 'wave_categorize_transaction'],
    layout: {
      type: 'feed',
      columns: ['date', 'description', 'account', 'amount', 'actions'],
      features: ['date-filter', 'account-filter', 'search'],
      actions: ['view', 'categorize', 'view-attachments'],
    },
  },
  {
    name: 'transaction-categorizer',
    displayName: 'Transaction Categorizer',
    description: 'Bulk categorize uncategorized transactions',
    category: 'accounting',
    defaultTools: ['wave_list_transactions', 'wave_categorize_transaction', 'wave_list_accounts'],
    layout: {
      type: 'workflow',
      steps: [
        { type: 'filter', label: 'Select uncategorized transactions' },
        { type: 'categorize', accountTool: 'wave_list_accounts' },
        { type: 'review', showSummary: true },
        { type: 'submit', tool: 'wave_categorize_transaction', batch: true },
      ],
    },
  },
  {
    name: 'bill-manager',
    displayName: 'Bill Manager',
    description: 'Track and pay bills (accounts payable)',
    category: 'bills',
    defaultTools: ['wave_list_bills', 'wave_get_bill', 'wave_create_bill', 'wave_create_bill_payment'],
    layout: {
      type: 'dashboard',
      widgets: [
        { type: 'status-cards', tool: 'wave_list_bills', groupBy: 'status' },
        { type: 'table', tool: 'wave_list_bills', columns: ['billNumber', 'vendor', 'status', 'total', 'amountDue', 'dueDate'] },
        { type: 'actions', buttons: ['create-bill', 'record-payment'] },
      ],
    },
  },
  {
    name: 'estimate-builder',
    displayName: 'Estimate Builder',
    description: 'Create and manage estimates (quotes) for customers',
    category: 'estimates',
    defaultTools: ['wave_create_estimate', 'wave_update_estimate', 'wave_send_estimate', 'wave_convert_estimate_to_invoice'],
    layout: {
      type: 'form',
      sections: [
        { type: 'customer-select', tool: 'wave_list_customers' },
        { type: 'date-fields', fields: ['estimateDate', 'expiryDate'] },
        { type: 'line-item-editor', productTool: 'wave_list_products', taxTool: 'wave_list_taxes' },
        { type: 'total-calculator' },
        { type: 'submit', createTool: 'wave_create_estimate', updateTool: 'wave_update_estimate' },
        { type: 'actions', buttons: ['send', 'convert-to-invoice'] },
      ],
    },
  },
  {
    name: 'tax-overview',
    displayName: 'Tax Overview',
    description: 'View and manage sales taxes',
    category: 'taxes',
    defaultTools: ['wave_list_taxes', 'wave_create_tax', 'wave_tax_summary'],
    layout: {
      type: 'dashboard',
      widgets: [
        { type: 'tax-list', tool: 'wave_list_taxes' },
        { type: 'tax-summary', tool: 'wave_tax_summary', dateRange: 'current-quarter' },
        { type: 'actions', buttons: ['create-tax'] },
      ],
    },
  },
  {
    name: 'profit-loss',
    displayName: 'Profit & Loss Report',
    description: 'Income statement showing revenue, expenses, and net income',
    category: 'reporting',
    defaultTools: ['wave_profit_and_loss'],
    layout: {
      type: 'report',
      reportType: 'profitAndLoss',
      features: ['date-range-selector', 'export-pdf', 'export-csv'],
      sections: [
        { type: 'summary', metrics: ['revenue', 'expenses', 'netIncome'] },
        { type: 'breakdown', groupBy: 'section' },
      ],
    },
  },
  {
    name: 'balance-sheet',
    displayName: 'Balance Sheet',
    description: 'Statement of assets, liabilities, and equity',
    category: 'reporting',
    defaultTools: ['wave_balance_sheet'],
    layout: {
      type: 'report',
      reportType: 'balanceSheet',
      features: ['date-selector', 'export-pdf', 'export-csv'],
      sections: [
        { type: 'summary', metrics: ['assets', 'liabilities', 'equity'] },
        { type: 'breakdown', groupBy: 'section' },
      ],
    },
  },
  {
    name: 'cashflow-chart',
    displayName: 'Cashflow Chart',
    description: 'Visual cashflow statement with operating, investing, and financing activities',
    category: 'reporting',
    defaultTools: ['wave_cashflow'],
    layout: {
      type: 'chart-report',
      reportType: 'cashflow',
      chartType: 'waterfall',
      features: ['date-range-selector'],
      sections: [
        { type: 'chart', metrics: ['operatingActivities', 'investingActivities', 'financingActivities', 'netCashChange'] },
        { type: 'summary-table' },
      ],
    },
  },
  {
    name: 'aging-report',
    displayName: 'Aged Receivables Report',
    description: 'Accounts receivable aging showing overdue invoices by customer',
    category: 'reporting',
    defaultTools: ['wave_aged_receivables'],
    layout: {
      type: 'report',
      reportType: 'agedReceivables',
      features: ['date-selector', 'export-csv'],
      sections: [
        { type: 'summary', metrics: ['total', 'current', 'overdue'] },
        { type: 'table', columns: ['customer', 'total', 'current', 'days1to30', 'days31to60', 'days61to90', 'over90'] },
      ],
    },
  },
  {
    name: 'business-overview',
    displayName: 'Business Overview',
    description: 'High-level business metrics and quick access to common tasks',
    category: 'general',
    defaultTools: ['wave_get_current_business', 'wave_list_invoices', 'wave_list_bills', 'wave_profit_and_loss'],
    layout: {
      type: 'dashboard',
      widgets: [
        { type: 'business-info', tool: 'wave_get_current_business' },
        { type: 'quick-stats', metrics: ['totalRevenue', 'outstandingInvoices', 'unpaidBills'] },
        { type: 'recent-invoices', tool: 'wave_list_invoices', limit: 5 },
        { type: 'quick-actions', buttons: ['create-invoice', 'create-estimate', 'record-transaction'] },
      ],
    },
  },
];
