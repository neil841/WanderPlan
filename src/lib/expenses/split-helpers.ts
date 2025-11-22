/**
 * Expense Split Helper Functions
 *
 * Client-side utilities for split calculations and validation.
 */

import type { CustomSplitInput } from '@/types/expense';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Calculate per-person amount for equal split
 */
export function calculatePerPersonAmount(
  total: number,
  peopleCount: number
): number {
  if (peopleCount === 0) return 0;
  // Round to 2 decimal places
  return Math.floor((total / peopleCount) * 100) / 100;
}

/**
 * Validate split amounts or percentages
 */
export function validateSplitAmounts(
  total: number,
  splits: CustomSplitInput[]
): ValidationResult {
  if (splits.length === 0) {
    return { isValid: false, error: 'No splits defined' };
  }

  const hasAmounts = splits.some((s) => s.amount !== undefined);
  const hasPercentages = splits.some((s) => s.percentage !== undefined);

  // Check for mixed types
  if (hasAmounts && hasPercentages) {
    return {
      isValid: false,
      error: 'Cannot mix amounts and percentages',
    };
  }

  // Validate amounts
  if (hasAmounts) {
    const sum = splits.reduce((s, a) => s + (a.amount || 0), 0);
    const diff = Math.abs(sum - total);

    if (diff > 0.01) {
      const prefix = sum > total ? 'exceed' : 'are less than';
      return {
        isValid: false,
        error: `Split amounts ${prefix} total by $${diff.toFixed(2)}`,
      };
    }
  }

  // Validate percentages
  if (hasPercentages) {
    const sum = splits.reduce((s, a) => s + (a.percentage || 0), 0);
    const diff = Math.abs(sum - 100);

    if (diff > 0.01) {
      return {
        isValid: false,
        error: `Percentages must sum to 100%, currently ${sum.toFixed(2)}%`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Convert percentages to amounts
 */
export function convertPercentagesToAmounts(
  total: number,
  splits: CustomSplitInput[]
): CustomSplitInput[] {
  return splits.map((split) => {
    if (split.percentage !== undefined) {
      const amount = Math.floor((total * split.percentage) / 100 * 100) / 100;
      return {
        userId: split.userId,
        amount,
      };
    }
    return split;
  });
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate amount from percentage
 */
export function calculateAmountFromPercentage(
  total: number,
  percentage: number
): number {
  return Math.floor((total * percentage) / 100 * 100) / 100;
}

/**
 * Calculate percentage from amount
 */
export function calculatePercentageFromAmount(
  total: number,
  amount: number
): number {
  if (total === 0) return 0;
  return Math.floor((amount / total) * 100 * 100) / 100;
}
