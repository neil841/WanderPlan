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
