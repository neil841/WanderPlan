/**
 * useEventReorder Hook
 *
 * Handles event reordering API calls with optimistic updates.
 * Manages auto-save on drag-and-drop completion.
 *
 * @param tripId - The ID of the trip
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventResponse } from '@/types/event';
import { toast } from 'sonner';

interface ReorderEventsInput {
  eventIds: string[];
}

/**
 * Call reorder API
 */
async function reorderEvents(
  tripId: string,
  eventIds: string[]
): Promise<{ success: boolean; events: EventResponse[] }> {
  const response = await fetch(`/api/trips/${tripId}/events/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ eventIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reorder events');
  }

  return response.json();
}

interface UseEventReorderReturn {
  reorder: (eventIds: string[]) => Promise<void>;
  isReordering: boolean;
}

/**
 * Hook to handle event reordering with optimistic updates
 */
export function useEventReorder(tripId: string): UseEventReorderReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: ReorderEventsInput) =>
      reorderEvents(tripId, input.eventIds),
    onMutate: async ({ eventIds }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events', tripId] });

      // Snapshot previous value
      const previousEvents = queryClient.getQueryData<EventResponse[]>([
        'events',
        tripId,
      ]);

      // Optimistically update events order
      if (previousEvents) {
        const eventOrderMap = new Map(
          eventIds.map((id, index) => [id, index])
        );

        const updatedEvents = [...previousEvents].sort((a, b) => {
          const orderA = eventOrderMap.get(a.id) ?? a.order;
          const orderB = eventOrderMap.get(b.id) ?? b.order;
          return orderA - orderB;
        });

        queryClient.setQueryData(['events', tripId], updatedEvents);
      }

      return { previousEvents };
    },
    onError: (error, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['events', tripId], context.previousEvents);
      }

      toast.error('Failed to reorder events', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['events', tripId] });

      toast.success('Events reordered', {
        duration: 2000,
      });
    },
  });

  const reorder = async (eventIds: string[]) => {
    try {
      await mutation.mutateAsync({ eventIds });
    } catch (error) {
      // Error already handled in onError
      console.error('Reorder error:', error);
    }
  };

  return {
    reorder,
    isReordering: mutation.isPending,
  };
}
