/**
 * Expense Types
 *
 * Type definitions for expense tracking and management.
 */

/**
 * Expense categories (aligned with budget categories)
 * Re-export Prisma's ExpenseCategory to ensure type compatibility
 */
export { ExpenseCategory } from '@prisma/client';
import type { ExpenseCategory } from '@prisma/client';

/**
 * Expense split information
 */
export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  createdAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}

/**
 * Expense from database
 */
export interface Expense {
  id: string;
  tripId: string;
  eventId: string | null;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  paidBy: string;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  payer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  event?: {
    id: string;
    title: string;
  } | null;
  splits?: ExpenseSplit[];
}

/**
 * Split type enum
 */
export type SplitType = 'EQUAL' | 'CUSTOM';

/**
 * Custom split input (either amount or percentage)
 */
export interface CustomSplitInput {
  userId: string;
  amount?: number;
  percentage?: number;
}

/**
 * Create expense request
 */
export interface CreateExpenseRequest {
  eventId?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: string; // ISO date string
  receiptUrl?: string;
  splitType?: SplitType;
  splits?: CustomSplitInput[];
  splitWithUserIds?: string[];
}

/**
 * Update expense request
 */
export interface UpdateExpenseRequest {
  eventId?: string | null;
  category?: ExpenseCategory;
  description?: string;
  amount?: number;
  currency?: string;
  date?: string; // ISO date string
  receiptUrl?: string | null;
}

/**
 * Expenses list response
 */
export interface ExpensesResponse {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalAmount: number;
    byCategory: {
      [key in ExpenseCategory]: number;
    };
  };
}

/**
 * Single expense response
 */
export interface ExpenseResponse {
  expense: Expense;
}

/**
 * User basic info for settlements
 */
export interface UserBasic {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

/**
 * Settlement between two users
 */
export interface Settlement {
  from: string; // userId who owes
  to: string; // userId who should receive
  amount: number;
  fromUser: UserBasic;
  toUser: UserBasic;
}

/**
 * Settlements response
 */
export interface SettlementsResponse {
  settlements: Settlement[];
  summary: {
    totalExpenses: number;
    totalAmount: number;
    participantCount: number;
  };
}
