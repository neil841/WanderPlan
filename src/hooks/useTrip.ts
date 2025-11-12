/**
 * useTrip Hook
 *
 * Fetches detailed trip information including all relations (events, collaborators, budget, documents, tags)
 * Uses TanStack Query for caching, loading states, and error handling
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface TripDetails {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  destinations: string[];
  visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  coverImageUrl: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;

  creator: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };

  events: Array<{
    id: string;
    type: string;
    name: string;
    description: string | null;
    date: string;
    startTime: string | null;
    endTime: string | null;
    order: number;
    location: string | null;
    coordinates: any;
    cost: {
      amount: number;
      currency: string;
    } | null;
    notes: string | null;
    confirmation: string | null;
    bookingUrl: string | null;
    creator: {
      id: string;
      name: string;
      avatarUrl: string | null;
    } | null;
    createdAt: string;
    updatedAt: string;
  }>;

  collaborators: Array<{
    id: string;
    role: 'ADMIN' | 'EDITOR' | 'VIEWER';
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
    createdAt: string;
  }>;

  budget: {
    id: string;
    totalBudget: number;
    currency: string;
    accommodationBudget: number | null;
    transportationBudget: number | null;
    foodBudget: number | null;
    activitiesBudget: number | null;
    otherBudget: number | null;
    expenseSummary: Record<string, number>;
    totalSpent: number;
    expenseCount: number;
  } | null;

  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedBy: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    createdAt: string;
  }>;

  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;

  userRole: 'owner' | 'ADMIN' | 'EDITOR' | 'VIEWER';

  stats: {
    eventCount: number;
    collaboratorCount: number;
    documentCount: number;
    tagCount: number;
  };
}

interface UseTripOptions {
  tripId: string;
  enabled?: boolean;
}

/**
 * Fetch trip details from the API
 */
async function fetchTrip(tripId: string): Promise<TripDetails> {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch trip');
  }

  return response.json();
}

/**
 * Hook to fetch and cache trip details
 *
 * @example
 * const { data: trip, isLoading, isError, error } = useTrip({ tripId: 'trip-123' });
 */
export function useTrip({ tripId, enabled = true }: UseTripOptions) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchTrip(tripId),
    enabled: enabled && !!tripId,
    staleTime: 30000, // 30 seconds - trip details don't change frequently
    refetchOnWindowFocus: false,
  });
}

/**
 * Invalidate trip query to force refetch
 */
export function useInvalidateTrip() {
  const queryClient = useQueryClient();

  return (tripId: string) => {
    queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
  };
}
