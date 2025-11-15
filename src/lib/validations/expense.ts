/**
 * Expense Validation Schemas
 *
 * Zod schemas for validating expense-related requests.
 */

import { z } from 'zod';
import { ExpenseCategory } from '@/types/expense';

/**
 * Create expense schema
 */
export const createExpenseSchema = z.object({
  eventId: z.string().uuid('Invalid event ID').optional(),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters (ISO 4217)')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters'),
  date: z.string().datetime('Invalid date format'),
  receiptUrl: z.string().url('Invalid receipt URL').optional(),
});

/**
 * Update expense schema
 */
export const updateExpenseSchema = z.object({
  eventId: z.string().uuid('Invalid event ID').nullable().optional(),
  category: z
    .nativeEnum(ExpenseCategory, {
      errorMap: () => ({ message: 'Invalid expense category' }),
    })
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large')
    .optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters (ISO 4217)')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
    .optional(),
  date: z.string().datetime('Invalid date format').optional(),
  receiptUrl: z.string().url('Invalid receipt URL').nullable().optional(),
});
