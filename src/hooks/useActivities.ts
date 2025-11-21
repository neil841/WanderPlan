/**
 * Activity Feed Hooks
 *
 * TanStack Query hooks for activity feed operations
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { GetActivitiesResponse, ActivityWithUser } from '@/types/activity';
import type { ActivityActionType } from '@prisma/client';

/**
 * Fetch activities for a trip with pagination
 */
async function fetchActivities(
  tripId: string,
  page: number = 1,
  limit: number = 50,
  actionType?: ActivityActionType
): Promise<GetActivitiesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (actionType) {
    params.append('actionType', actionType);
  }

  const response = await fetch(
    `/api/trips/${tripId}/activities?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }

  return response.json();
}

/**
 * Hook to fetch activities with basic pagination
 */
export function useActivities(
  tripId: string,
  options?: {
    page?: number;
    limit?: number;
    actionType?: ActivityActionType;
  }
) {
  return useQuery({
    queryKey: ['activities', tripId, options?.page, options?.limit, options?.actionType],
    queryFn: () =>
      fetchActivities(
        tripId,
        options?.page || 1,
        options?.limit || 50,
        options?.actionType
      ),
    enabled: !!tripId,
  });
}

/**
 * Hook to fetch activities with infinite scroll
 */
export function useInfiniteActivities(
  tripId: string,
  options?: {
    limit?: number;
    actionType?: ActivityActionType;
  }
) {
  return useInfiniteQuery({
    queryKey: ['activities', tripId, 'infinite', options?.limit, options?.actionType],
    queryFn: ({ pageParam = 1 }) =>
      fetchActivities(
        tripId,
        pageParam,
        options?.limit || 50,
        options?.actionType
      ),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!tripId,
    initialPageParam: 1,
  });
}
