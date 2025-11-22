/**
 * useSettlements Hook
 *
 * Custom hook for fetching and managing trip settlements.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SettlementsResponse, Settlement } from '@/types/expense';

/**
 * Fetch settlements for a trip
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
 * Hook return type
 */
export interface UseSettlementsReturn {
  // Data
  settlements: Settlement[];
  settlementsYouOwe: Settlement[];
  settlementsOwedToYou: Settlement[];
  summary: {
    totalExpenses: number;
    totalAmount: number;
    participantCount: number;
  } | undefined;

  // Computed
  totalYouOwe: number;
  totalOwedToYou: number;
  youOweCount: number;
  owedToYouCount: number;

  // Query state
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching and managing settlements
 */
export function useSettlements(
  tripId: string,
  userId: string
): UseSettlementsReturn {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['settlements', tripId],
    queryFn: () => fetchSettlements(tripId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Filter settlements where current user owes
  const settlementsYouOwe = useMemo(
    () => data?.settlements.filter((s) => s.from === userId) || [],
    [data, userId]
  );

  // Filter settlements where current user is owed
  const settlementsOwedToYou = useMemo(
    () => data?.settlements.filter((s) => s.to === userId) || [],
    [data, userId]
  );

  // Calculate total you owe
  const totalYouOwe = useMemo(
    () => settlementsYouOwe.reduce((sum, s) => sum + s.amount, 0),
    [settlementsYouOwe]
  );

  // Calculate total owed to you
  const totalOwedToYou = useMemo(
    () => settlementsOwedToYou.reduce((sum, s) => sum + s.amount, 0),
    [settlementsOwedToYou]
  );

  // Count of people you owe
  const youOweCount = settlementsYouOwe.length;

  // Count of people who owe you
  const owedToYouCount = settlementsOwedToYou.length;

  return {
    // Data
    settlements: data?.settlements || [],
    settlementsYouOwe,
    settlementsOwedToYou,
    summary: data?.summary,

    // Computed
    totalYouOwe,
    totalOwedToYou,
    youOweCount,
    owedToYouCount,

    // Query state
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
