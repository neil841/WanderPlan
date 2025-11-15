/**
 * Trip Expenses Page
 *
 * Displays and manages expenses for a trip
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, DollarSign } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ExpensesResponse, ExpenseCategory } from '@/types/expense';

interface ExpensesPageProps {
  params: {
    tripId: string;
  };
}

const categoryLabels: Record<ExpenseCategory, string> = {
  ACCOMMODATION: 'Accommodation',
  TRANSPORTATION: 'Transportation',
  FOOD: 'Food & Dining',
  ACTIVITIES: 'Activities',
  SHOPPING: 'Shopping',
  OTHER: 'Other',
};

export default function ExpensesPage({ params }: ExpensesPageProps) {
  const { tripId } = params;

  const {
    data: expensesData,
    isLoading,
    error,
    refetch,
  } = useQuery<ExpensesResponse>({
    queryKey: ['trip-expenses', tripId],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/expenses`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch expenses');
      }
      return response.json();
    },
  });

  // Also fetch events for linking expenses to events
  const { data: eventsData } = useQuery({
    queryKey: ['trip-events', tripId],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/events`);
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.events || [];
    },
  });

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load expenses'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Expense Tracking</h1>
        <p className="text-muted-foreground">
          Track and manage all your trip expenses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD', // TODO: Use trip currency
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(expensesData?.summary.totalAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {expensesData?.total || 0} expense{expensesData?.total !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Category */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : expensesData?.summary.byCategory ? (
              (() => {
                const topCategory = Object.entries(expensesData.summary.byCategory).reduce(
                  (max, [category, amount]) =>
                    amount > max.amount
                      ? { category: category as ExpenseCategory, amount }
                      : max,
                  { category: 'OTHER' as ExpenseCategory, amount: 0 }
                );
                return (
                  <>
                    <div className="text-2xl font-bold">
                      {categoryLabels[topCategory.category]}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(topCategory.amount)}
                    </p>
                  </>
                );
              })()
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Average per Expense */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Expense</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : expensesData && expensesData.total > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(expensesData.summary.totalAmount / expensesData.total)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per expense
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No expenses</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {expensesData?.summary.byCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(expensesData.summary.byCategory)
                .filter(([_, amount]) => amount > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm font-medium">
                      {categoryLabels[category as ExpenseCategory]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(amount)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense List */}
      <ExpenseList
        tripId={tripId}
        expenses={expensesData?.expenses || []}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        events={eventsData || []}
      />
    </div>
  );
}
