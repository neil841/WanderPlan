/**
 * Settlement Summary Component
 *
 * Displays all settlements and summary statistics
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SettlementCard } from './SettlementCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import type { Settlement, SettlementsResponse } from '@/types/expense';

interface SettlementSummaryProps {
  tripId: string;
  currentUserId: string;
  currency?: string;
}

/**
 * Fetch settlements from API
 */
async function fetchSettlements(tripId: string): Promise<SettlementsResponse> {
  const response = await fetch(`/api/trips/${tripId}/expenses/settlements`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch settlements');
  }

  return response.json();
}

/**
 * Mark settlement as paid (placeholder - API not implemented yet)
 */
async function markSettlementPaid(
  tripId: string,
  settlement: Settlement
): Promise<void> {
  // TODO: Implement API endpoint for marking settlements as paid
  // For now, this is a placeholder
  throw new Error('Mark as paid functionality not yet implemented');
}

export function SettlementSummary({
  tripId,
  currentUserId,
  currency = 'USD',
}: SettlementSummaryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'owe' | 'owed'>('all');
  const queryClient = useQueryClient();

  // Fetch settlements
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['settlements', tripId],
    queryFn: () => fetchSettlements(tripId),
    staleTime: 30000, // 30 seconds
  });

  // Mark settlement as paid mutation (placeholder)
  const markPaidMutation = useMutation({
    mutationFn: (settlement: Settlement) =>
      markSettlementPaid(tripId, settlement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', tripId] });
      toast.success('Settlement marked as paid');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Calculate user-specific data
  const userSettlementData = useMemo(() => {
    if (!data?.settlements) {
      return {
        youOwe: [],
        owedToYou: [],
        totalYouOwe: 0,
        totalOwedToYou: 0,
        netBalance: 0,
      };
    }

    const youOwe = data.settlements.filter(s => s.from === currentUserId);
    const owedToYou = data.settlements.filter(s => s.to === currentUserId);

    const totalYouOwe = youOwe.reduce((sum, s) => sum + s.amount, 0);
    const totalOwedToYou = owedToYou.reduce((sum, s) => sum + s.amount, 0);
    const netBalance = totalOwedToYou - totalYouOwe;

    return {
      youOwe,
      owedToYou,
      totalYouOwe,
      totalOwedToYou,
      netBalance,
    };
  }, [data, currentUserId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleMarkSettled = (settlement: Settlement) => {
    markPaidMutation.mutate(settlement);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">
            Failed to load settlements. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.settlements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Settlements</CardTitle>
          <CardDescription>Track who owes what</CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No settlements yet</p>
            <p className="text-sm mt-2">
              Split expenses with trip members to see settlements here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">{data.summary.participantCount}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">You Owe</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(userSettlementData.totalYouOwe)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Owed to You</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(userSettlementData.totalOwedToYou)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Balance */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Your Net Balance</p>
              <p className="text-sm text-muted-foreground mt-1">
                {userSettlementData.netBalance > 0
                  ? 'You are owed'
                  : userSettlementData.netBalance < 0
                  ? 'You owe'
                  : 'You are settled up'}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-3xl font-bold ${
                  userSettlementData.netBalance > 0
                    ? 'text-green-600'
                    : userSettlementData.netBalance < 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {formatCurrency(Math.abs(userSettlementData.netBalance))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Settlements List */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Details</CardTitle>
          <CardDescription>
            View all settlements and mark them as paid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {data.settlements.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="owe">
                You Owe
                <Badge variant="secondary" className="ml-2">
                  {userSettlementData.youOwe.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="owed">
                Owed to You
                <Badge variant="secondary" className="ml-2">
                  {userSettlementData.owedToYou.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 space-y-3">
              {data.settlements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No settlements to display
                </p>
              ) : (
                data.settlements.map((settlement, index) => (
                  <SettlementCard
                    key={index}
                    settlement={settlement}
                    onMarkSettled={handleMarkSettled}
                    isSettled={false}
                    currency={currency}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="owe" className="mt-4 space-y-3">
              {userSettlementData.youOwe.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  You don't owe anyone. Great!
                </p>
              ) : (
                userSettlementData.youOwe.map((settlement, index) => (
                  <SettlementCard
                    key={index}
                    settlement={settlement}
                    onMarkSettled={handleMarkSettled}
                    isSettled={false}
                    currency={currency}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="owed" className="mt-4 space-y-3">
              {userSettlementData.owedToYou.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No one owes you money
                </p>
              ) : (
                userSettlementData.owedToYou.map((settlement, index) => (
                  <SettlementCard
                    key={index}
                    settlement={settlement}
                    isSettled={false}
                    currency={currency}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
