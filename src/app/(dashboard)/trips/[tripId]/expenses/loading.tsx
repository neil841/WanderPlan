/**
 * Loading state for expenses page
 * Shows skeleton loaders for expense cards and budget overview
 */

import { ExpenseCardSkeleton } from '@/components/expenses/ExpenseCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpensesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Budget Overview Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Budget */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Header */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Expense Cards List */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <ExpenseCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
