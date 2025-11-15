/**
 * Category Breakdown Component
 *
 * Displays budget breakdown by category with progress bars and spending details
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Home,
  UtensilsCrossed,
  Ticket,
  Car,
  ShoppingBag,
  MoreHorizontal,
} from 'lucide-react';
import type { CategoryBudgets, BudgetCategory } from '@/types/budget';
import { cn } from '@/lib/utils';

interface CategoryBreakdownProps {
  categoryBudgets: CategoryBudgets;
  currency: string;
  className?: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  accommodation: Home,
  food: UtensilsCrossed,
  activities: Ticket,
  transport: Car,
  shopping: ShoppingBag,
  other: MoreHorizontal,
};

const categoryLabels: Record<string, string> = {
  accommodation: 'Accommodation',
  food: 'Food & Dining',
  activities: 'Activities',
  transport: 'Transportation',
  shopping: 'Shopping',
  other: 'Other',
};

export function CategoryBreakdown({
  categoryBudgets,
  currency,
  className,
}: CategoryBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Budget by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(categoryBudgets).map(([categoryKey, categoryData]) => {
            const Icon = categoryIcons[categoryKey] || MoreHorizontal;
            const label = categoryLabels[categoryKey] || categoryKey;
            const percentageSpent =
              categoryData.budgeted > 0
                ? (categoryData.spent / categoryData.budgeted) * 100
                : 0;
            const isOverBudget = categoryData.spent > categoryData.budgeted;
            const hasNoBudget = categoryData.budgeted === 0;

            return (
              <div key={categoryKey} className="space-y-2">
                {/* Category header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>

                  <div className="text-sm text-right">
                    {hasNoBudget ? (
                      <span className="text-muted-foreground">No budget set</span>
                    ) : (
                      <span className={cn(
                        'font-medium',
                        isOverBudget ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {formatCurrency(categoryData.spent)} / {formatCurrency(categoryData.budgeted)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {!hasNoBudget && (
                  <>
                    <Progress
                      value={Math.min(percentageSpent, 100)}
                      className={cn(
                        'h-2',
                        isOverBudget
                          ? '[&>div]:bg-destructive'
                          : percentageSpent > 80
                          ? '[&>div]:bg-yellow-600'
                          : '[&>div]:bg-primary'
                      )}
                      aria-label={`${label}: ${percentageSpent.toFixed(1)}% spent`}
                    />

                    {/* Remaining amount */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={cn(
                          isOverBudget ? 'text-destructive' : 'text-muted-foreground'
                        )}
                      >
                        {isOverBudget
                          ? `Over budget by ${formatCurrency(Math.abs(categoryData.remaining))}`
                          : `${formatCurrency(categoryData.remaining)} remaining`}
                      </span>
                      <span
                        className={cn(
                          'font-medium',
                          isOverBudget
                            ? 'text-destructive'
                            : percentageSpent > 80
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        )}
                      >
                        {percentageSpent.toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}

                {/* No budget message */}
                {hasNoBudget && categoryData.spent > 0 && (
                  <p className="text-xs text-yellow-600">
                    ⚠️ {formatCurrency(categoryData.spent)} spent without budget
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
