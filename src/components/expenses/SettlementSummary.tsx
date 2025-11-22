/**
 * Settlement Summary Component
 *
 * Displays settlement summary with tabs and cards.
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useSettlements } from '@/hooks/useSettlements';
import { SettlementCard } from './SettlementCard';
import { formatCurrency } from '@/lib/expenses/split-helpers';

interface SettlementSummaryProps {
  tripId: string;
  currentUserId: string;
  currency?: string;
}

export function SettlementSummary({
  tripId,
  currentUserId,
  currency = 'USD',
}: SettlementSummaryProps) {
  const {
    settlements,
    settlementsYouOwe,
    settlementsOwedToYou,
    summary,
    totalYouOwe,
    totalOwedToYou,
    youOweCount,
    owedToYouCount,
    isLoading,
    error,
  } = useSettlements(tripId, currentUserId);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Settlement Summary</h2>

        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settlements skeleton */}
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/3 mb-3" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Failed to load settlements</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  // Empty state
  if (!summary) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No settlement data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settlement Summary</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" aria-hidden="true" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalAmount, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalExpenses} {summary.totalExpenses === 1 ? 'expense' : 'expenses'}
            </p>
          </CardContent>
        </Card>

        {/* You Owe */}
        <Card className="border-red-200 dark:border-red-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
              You Owe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalYouOwe, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {youOweCount} {youOweCount === 1 ? 'person' : 'people'}
            </p>
          </CardContent>
        </Card>

        {/* Owed to You */}
        <Card className="border-green-200 dark:border-green-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Owed to You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalOwedToYou, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {owedToYouCount} {owedToYouCount === 1 ? 'person' : 'people'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settlements Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All {settlements.length > 0 && `(${settlements.length})`}
          </TabsTrigger>
          <TabsTrigger value="you-owe">
            You Owe {youOweCount > 0 && `(${youOweCount})`}
          </TabsTrigger>
          <TabsTrigger value="owed-to-you">
            Owed to You {owedToYouCount > 0 && `(${owedToYouCount})`}
          </TabsTrigger>
        </TabsList>

        {/* All Settlements */}
        <TabsContent value="all" className="space-y-3 mt-4">
          {settlements.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-4xl mb-2">💸</p>
              <p className="font-medium mb-1">No settlements needed</p>
              <p className="text-sm text-muted-foreground">
                All expenses are either individual or everyone&apos;s split amounts are settled.
              </p>
            </div>
          ) : (
            settlements.map((settlement) => (
              <SettlementCard
                key={`${settlement.from}-${settlement.to}`}
                settlement={settlement}
                currentUserId={currentUserId}
                currency={currency}
              />
            ))
          )}
        </TabsContent>

        {/* You Owe */}
        <TabsContent value="you-owe" className="space-y-3 mt-4">
          {settlementsYouOwe.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-medium mb-1">You&apos;re all settled up!</p>
              <p className="text-sm text-muted-foreground">
                You don&apos;t owe anyone money.
              </p>
            </div>
          ) : (
            settlementsYouOwe.map((settlement) => (
              <SettlementCard
                key={`${settlement.from}-${settlement.to}`}
                settlement={settlement}
                currentUserId={currentUserId}
                currency={currency}
              />
            ))
          )}
        </TabsContent>

        {/* Owed to You */}
        <TabsContent value="owed-to-you" className="space-y-3 mt-4">
          {settlementsOwedToYou.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-medium mb-1">All settled!</p>
              <p className="text-sm text-muted-foreground">
                No one owes you money.
              </p>
            </div>
          ) : (
            settlementsOwedToYou.map((settlement) => (
              <SettlementCard
                key={`${settlement.from}-${settlement.to}`}
                settlement={settlement}
                currentUserId={currentUserId}
                currency={currency}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
