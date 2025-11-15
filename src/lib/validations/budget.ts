/**
 * Budget Validation Schemas
 *
 * Zod schemas for validating budget-related requests.
 */

import { z } from 'zod';
import { BudgetCategory } from '@/types/budget';

/**
 * Category budget schema
 */
const categoryBudgetSchema = z.object({
  budgeted: z.number().min(0, 'Budget amount must be non-negative'),
});

/**
 * Update budget schema
 */
export const updateBudgetSchema = z.object({
  totalBudget: z
    .number()
    .min(0, 'Total budget must be non-negative')
    .optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters (ISO 4217)')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
    .optional(),
  categoryBudgets: z
    .object({
      [BudgetCategory.ACCOMMODATION]: categoryBudgetSchema.optional(),
      [BudgetCategory.FOOD]: categoryBudgetSchema.optional(),
      [BudgetCategory.ACTIVITIES]: categoryBudgetSchema.optional(),
      [BudgetCategory.TRANSPORT]: categoryBudgetSchema.optional(),
      [BudgetCategory.SHOPPING]: categoryBudgetSchema.optional(),
      [BudgetCategory.OTHER]: categoryBudgetSchema.optional(),
    })
    .optional(),
});
