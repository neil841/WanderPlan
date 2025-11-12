/**
 * useUpdateEvent Hook
 *
 * TanStack Query mutation hook for updating events with optimistic updates.
 *
 * @module useUpdateEvent
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { UpdateEventInput } from '@/lib/validations/event';
import { EventResponse } from '@/types/event';

interface UpdateEventParams {
  tripId: string;
  eventId: string;
  data: UpdateEventInput;
}

/**
 * Hook for updating events with optimistic updates and error handling
 *
 * Features:
 * - Optimistic UI update (instant feedback)
 * - Automatic rollback on error
 * - Success/error toast notifications
 * - Query invalidation on success
 *
 * @example
 * const { mutate: updateEvent } = useUpdateEvent();
 * updateEvent({ tripId, eventId, data: { title: 'New Title' } });
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tripId, eventId, data }: UpdateEventParams) => {
      const response = await fetch(`/api/trips/${tripId}/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }

      return response.json();
    },
    // Optimistic update
    onMutate: async ({ tripId, eventId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['events', tripId],
      });
      await queryClient.cancelQueries({
        queryKey: ['itinerary', tripId],
      });

      // Snapshot previous values
      const previousEvents = queryClient.getQueryData(['events', tripId]);
      const previousItinerary = queryClient.getQueryData(['itinerary', tripId]);

      // Optimistically update events cache
      queryClient.setQueryData(['events', tripId], (old: EventResponse[] | undefined) => {
        if (!old) return old;
        return old.map((event) =>
          event.id === eventId ? { ...event, ...data } : event
        );
      });

      // Optimistically update itinerary cache
      queryClient.setQueryData(['itinerary', tripId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          events: old.events?.map((event: EventResponse) =>
            event.id === eventId ? { ...event, ...data } : event
          ),
        };
      });

      // Return context with snapshot
      return { previousEvents, previousItinerary };
    },
    // Rollback on error
    onError: (error: Error, variables, context) => {
      // Restore previous state
      if (context?.previousEvents) {
        queryClient.setQueryData(['events', variables.tripId], context.previousEvents);
      }
      if (context?.previousItinerary) {
        queryClient.setQueryData(['itinerary', variables.tripId], context.previousItinerary);
      }

      // Error toast
      toast({
        variant: 'destructive',
        title: 'Failed to update event',
        description: error.message,
      });
    },
    // Refetch on success
    onSuccess: (data, variables) => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['events', variables.tripId],
      });
      queryClient.invalidateQueries({
        queryKey: ['itinerary', variables.tripId],
      });

      // Success toast
      toast({
        title: 'Event updated',
        description: `${data.title} has been updated successfully.`,
      });
    },
  });
}
