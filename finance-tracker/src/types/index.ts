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

// Investment Type (Self, Combined, Other)
export const INVESTMENT_TYPES = [
  'Self',
  'Combined',
  'Other'
] as const;

export type InvestmentType = typeof INVESTMENT_TYPES[number];

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
  investmentType: InvestmentType;
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
  displayOrder?: number;
  isCompleted?: boolean; // Track if expense is marked as done
  createdAt: Date;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  category: InvestmentCategory;
  investmentType: InvestmentType;
  month: Date;
  sourceType: 'manual' | 'template';
  monthlyTemplateInstanceId?: string;
  displayOrder?: number;
  isCompleted?: boolean; // Track if investment is marked as done
  createdAt: Date;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Credit Card Entry
export interface CreditCardEntry {
  id: string;
  description: string;
  amount: number;
  month: Date;
  displayOrder?: number;
  createdAt: Date;
}

// Income Entry
export interface Income {
  id: string;
  source: string;
  amount: number;
  month: Date;
  createdAt: Date;
}

// External Investment Buffer Entry
export interface ExternalInvestmentBuffer {
  id: string;
  description: string;
  amount: number;
  month: Date;
  createdAt: Date;
}

