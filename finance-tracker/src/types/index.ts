// Predefined expense categories
export const EXPENSE_CATEGORIES = [
  'Rent/Mortgage',
  'Utilities',
  'Food & Groceries',
  'Transportation',
  'Healthcare',
  'Insurance',
  'Education',
  'Entertainment',
  'Subscriptions',
  'Shopping',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// Investment categories
export const INVESTMENT_CATEGORIES = [
  'Stocks',
  'Mutual Funds',
  'Fixed Deposits',
  'Real Estate',
  'Gold',
  'Cryptocurrency',
  'Bonds',
  'PPF',
  'ELSS',
  'Other'
] as const;

export type InvestmentCategory = typeof INVESTMENT_CATEGORIES[number];

// Central Template - Single template system
export interface CentralTemplate {
  id: string;
  items: TemplateItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateItem {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
}

// Investment Template Item
export interface InvestmentTemplateItem {
  id: string;
  name: string;
  amount: number;
  category: InvestmentCategory;
}

// Central Investment Template
export interface CentralInvestmentTemplate {
  id: string;
  items: InvestmentTemplateItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Monthly Template Instance - copied from central template
export interface MonthlyTemplateInstance {
  id: string;
  centralTemplateId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  month: Date;
  createdAt: Date;
  lastSyncedAt: Date; // When it was last copied from central
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  month: Date;
  sourceType: 'manual' | 'template';
  monthlyTemplateInstanceId?: string; // Link to template instance
  createdAt: Date;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  category: InvestmentCategory;
  month: Date;
  sourceType: 'manual' | 'template';
  monthlyTemplateInstanceId?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  content: string;
  month: Date;
  createdAt: Date;
  updatedAt: Date;
}

