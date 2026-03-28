/**
 * Wave API Types
 * Based on Wave GraphQL Public API
 */

export interface WaveConfig {
  accessToken: string;
  businessId?: string;
}

export interface Business {
  id: string;
  name: string;
  currency: {
    code: string;
    symbol: string;
  };
  timezone: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    provinceCode?: string;
    countryCode?: string;
    postalCode?: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    provinceCode?: string;
    countryCode?: string;
    postalCode?: string;
  };
  currency?: {
    code: string;
  };
  createdAt: string;
  modifiedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'APPROVED';
  title?: string;
  subhead?: string;
  invoiceDate: string;
  dueDate?: string;
  amountDue: {
    value: string;
    currency: {
      code: string;
    };
  };
  amountPaid: {
    value: string;
  };
  total: {
    value: string;
  };
  items: InvoiceItem[];
  footer?: string;
  memo?: string;
  createdAt: string;
  modifiedAt: string;
  viewUrl?: string;
  pdfUrl?: string;
}

export interface InvoiceItem {
  product?: Product;
  description: string;
  quantity: number;
  unitPrice: string;
  subtotal: {
    value: string;
  };
  total: {
    value: string;
  };
  taxes?: Tax[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unitPrice?: string;
  incomeAccount?: Account;
  isSold: boolean;
  isBought: boolean;
  isArchived: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface Account {
  id: string;
  name: string;
  description?: string;
  type: {
    name: string;
    normalBalanceType: 'DEBIT' | 'CREDIT';
  };
  subtype: {
    name: string;
    value: string;
  };
  currency: {
    code: string;
  };
  balance?: string;
  isArchived: boolean;
}

export interface Transaction {
  id: string;
  description?: string;
  amount: {
    value: string;
    currency: {
      code: string;
    };
  };
  date: string;
  account?: Account;
  accountTransaction?: {
    account: Account;
    amount: {
      value: string;
    };
  };
  createdAt: string;
  modifiedAt: string;
}

export interface Bill {
  id: string;
  vendor: Vendor;
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'PARTIAL';
  billNumber?: string;
  billDate: string;
  dueDate?: string;
  amountDue: {
    value: string;
    currency: {
      code: string;
    };
  };
  amountPaid: {
    value: string;
  };
  total: {
    value: string;
  };
  items: BillItem[];
  memo?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: string;
  total: {
    value: string;
  };
  account?: Account;
  taxes?: Tax[];
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    provinceCode?: string;
    countryCode?: string;
    postalCode?: string;
  };
  currency?: {
    code: string;
  };
  createdAt: string;
  modifiedAt: string;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  customer: Customer;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'REJECTED';
  title?: string;
  subhead?: string;
  estimateDate: string;
  expiryDate?: string;
  total: {
    value: string;
    currency: {
      code: string;
    };
  };
  items: EstimateItem[];
  footer?: string;
  memo?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface EstimateItem {
  product?: Product;
  description: string;
  quantity: number;
  unitPrice: string;
  total: {
    value: string;
  };
  taxes?: Tax[];
}

export interface Tax {
  id: string;
  name: string;
  abbreviation?: string;
  description?: string;
  rate: string;
  isArchived: boolean;
}

export interface Payment {
  id: string;
  amount: {
    value: string;
    currency: {
      code: string;
    };
  };
  date: string;
  source?: string;
  createdAt: string;
}

export interface ProfitAndLossReport {
  startDate: string;
  endDate: string;
  revenue: {
    value: string;
  };
  costOfGoodsSold: {
    value: string;
  };
  grossProfit: {
    value: string;
  };
  expenses: {
    value: string;
  };
  netIncome: {
    value: string;
  };
  sections: ReportSection[];
}

export interface BalanceSheetReport {
  asOfDate: string;
  assets: {
    value: string;
  };
  liabilities: {
    value: string;
  };
  equity: {
    value: string;
  };
  sections: ReportSection[];
}

export interface ReportSection {
  name: string;
  total: {
    value: string;
  };
  accounts: ReportAccountLine[];
  subsections?: ReportSection[];
}

export interface ReportAccountLine {
  account: Account;
  balance: {
    value: string;
  };
}

export interface AgedReceivablesReport {
  asOfDate: string;
  total: {
    value: string;
  };
  customers: AgedReceivablesCustomer[];
}

export interface AgedReceivablesCustomer {
  customer: Customer;
  total: {
    value: string;
  };
  current: {
    value: string;
  };
  days1to30: {
    value: string;
  };
  days31to60: {
    value: string;
  };
  days61to90: {
    value: string;
  };
  over90: {
    value: string;
  };
}

export interface CashflowReport {
  startDate: string;
  endDate: string;
  operatingActivities: {
    value: string;
  };
  investingActivities: {
    value: string;
  };
  financingActivities: {
    value: string;
  };
  netCashChange: {
    value: string;
  };
}

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: any;
  };
}

export class WaveError extends Error {
  graphQLErrors?: GraphQLError[];
  networkError?: Error;
  statusCode?: number;

  constructor(message: string) {
    super(message);
    this.name = 'WaveError';
  }
}
