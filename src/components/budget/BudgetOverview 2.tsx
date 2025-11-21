/**
 * Budget Overview Component
 *
 * Displays total budget summary with spent/remaining amounts and over-budget warnings
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { BudgetResponse } from '@/types/budget';
import { cn } from '@/lib/utils';

interface BudgetOverviewProps {
  budgetData: BudgetResponse;
  className?: string;
}

export function BudgetOverview({ budgetData, className }: BudgetOverviewProps) {
  const { budget, totalSpent, totalRemaining, percentageSpent, isOverBudget } = budgetData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: budget.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Over-budget warning */}
      {isOverBudget && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            You have exceeded your budget by {formatCurrency(Math.abs(totalRemaining))}
          </AlertDescription>
        </Alert>
      )}

      {/* Total budget card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>Total Budget</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Budgeted</p>
              <p className="text-2xl font-bold">{formatCurrency(budget.totalBudget)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className={cn(
                'text-2xl font-bold',
                isOverBudget ? 'text-destructive' : 'text-foreground'
              )}>
                {formatCurrency(totalSpent)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={cn(
                'text-2xl font-bold flex items-center gap-1',
                isOverBudget ? 'text-destructive' : 'text-green-600'
              )}>
                {isOverBudget ? (
                  <TrendingDown className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <TrendingUp className="h-5 w-5" aria-hidden="true" />
                )}
                {formatCurrency(Math.abs(totalRemaining))}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget usage</span>
              <span className={cn(
                'font-medium',
                percentageSpent > 100 ? 'text-destructive' : percentageSpent > 80 ? 'text-yellow-600' : 'text-green-600'
              )}>
                {percentageSpent.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(percentageSpent, 100)}
              className={cn(
                'h-3',
                percentageSpent > 100 ? '[&>div]:bg-destructive' : percentageSpent > 80 ? '[&>div]:bg-yellow-600' : '[&>div]:bg-green-600'
              )}
              aria-label={`Budget usage: ${percentageSpent.toFixed(1)}%`}
            />
            {percentageSpent > 80 && percentageSpent <= 100 && (
              <p className="text-xs text-yellow-600">
                ⚠️ You've used {percentageSpent.toFixed(1)}% of your budget
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
