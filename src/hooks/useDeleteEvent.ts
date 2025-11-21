/**
 * useDeleteEvent Hook
 *
 * TanStack Query mutation hook for deleting events with optimistic updates.
 *
 * @module useDeleteEvent
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { EventResponse } from '@/types/event';

interface DeleteEventParams {
  tripId: string;
  eventId: string;
  eventTitle?: string;
}

/**
 * Hook for deleting events with optimistic updates and error handling
 *
 * Features:
 * - Optimistic UI update (instant removal)
 * - Automatic restore on error
 * - Success/error toast notifications
 * - Query invalidation on success
 *
 * @example
 * const { mutate: deleteEvent } = useDeleteEvent();
 * deleteEvent({ tripId, eventId, eventTitle: 'My Event' });
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tripId, eventId }: DeleteEventParams) => {
      const response = await fetch(`/api/trips/${tripId}/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }

      return response.json();
    },
    // Optimistic update
    onMutate: async ({ tripId, eventId }) => {
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

      // Optimistically remove event from cache
      queryClient.setQueryData(['events', tripId], (old: EventResponse[] | undefined) => {
        if (!old) return old;
        return old.filter((event) => event.id !== eventId);
      });

      // Optimistically remove from itinerary cache
      queryClient.setQueryData(['itinerary', tripId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          events: old.events?.filter((event: EventResponse) => event.id !== eventId),
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
        title: 'Failed to delete event',
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
        title: 'Event deleted',
        description: variables.eventTitle
          ? `"${variables.eventTitle}" has been deleted successfully.`
          : 'Event has been deleted successfully.',
      });
    },
  });
}
