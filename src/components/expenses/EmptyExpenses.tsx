/**
 * EmptyExpenses Component
 *
 * Displays an empty state when a trip has no expenses.
 * Includes a call-to-action to add the first expense.
 *
 * @component
 * @example
 * <EmptyExpenses onAddExpense={() => setShowExpenseDialog(true)} />
 */

'use client';

import { Receipt, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyExpensesProps {
  onAddExpense?: () => void;
}

export function EmptyExpenses({ onAddExpense }: EmptyExpensesProps) {
  return (
    <EmptyState
      icon={Receipt}
      title="No expenses yet"
      description="Track your trip spending by adding expenses. You can categorize them and split costs with collaborators."
      action={
        onAddExpense
          ? {
              label: 'Add First Expense',
              onClick: onAddExpense,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyExpensesFiltered Component
 *
 * Displays when no expenses match the current filter.
 */
export function EmptyExpensesFiltered() {
  return (
    <EmptyState
      icon={Receipt}
      title="No expenses found"
      description="Try adjusting your filters to see more expenses."
    />
  );
}

/**
 * EmptyBudget Component
 *
 * Displays when a trip has no budget set.
 */
interface EmptyBudgetProps {
  onSetBudget?: () => void;
}

export function EmptyBudget({ onSetBudget }: EmptyBudgetProps) {
  return (
    <EmptyState
      icon={Wallet}
      title="No budget set"
      description="Set a budget for your trip to track spending and stay on target. You can break it down by category."
      action={
        onSetBudget
          ? {
              label: 'Set Budget',
              onClick: onSetBudget,
            }
          : undefined
      }
    />
  );
}
