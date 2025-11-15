/**
 * Budget Types
 *
 * Type definitions for budget management and expense tracking.
 */

/**
 * Budget categories
 */
export enum BudgetCategory {
  ACCOMMODATION = 'accommodation',
  FOOD = 'food',
  ACTIVITIES = 'activities',
  TRANSPORT = 'transport',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

/**
 * Category budget breakdown
 */
export interface CategoryBudget {
  budgeted: number;
  spent: number;
  remaining: number;
}

/**
 * Category budgets map
 */
export type CategoryBudgets = {
  [K in BudgetCategory]: CategoryBudget;
};

/**
 * Budget from database
 */
export interface Budget {
  id: string;
  tripId: string;
  totalBudget: number;
  currency: string;
  categoryBudgets: CategoryBudgets;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update budget request
 */
export interface UpdateBudgetRequest {
  totalBudget?: number;
  currency?: string;
  categoryBudgets?: Partial<{
    [K in BudgetCategory]: {
      budgeted: number;
    };
  }>;
}

/**
 * Budget response
 */
export interface BudgetResponse {
  budget: Budget;
  totalSpent: number;
  totalRemaining: number;
  percentageSpent: number;
  isOverBudget: boolean;
}
