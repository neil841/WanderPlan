/**
 * useCreateEvent Hook
 *
 * TanStack Query mutation hook for creating events with optimistic updates.
 *
 * @module useCreateEvent
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { CreateEventInput } from '@/lib/validations/event';

interface CreateEventParams {
  tripId: string;
  data: CreateEventInput;
}

/**
 * Hook for creating events with optimistic updates and error handling
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tripId, data }: CreateEventParams) => {
      const response = await fetch(`/api/trips/${tripId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch events
      queryClient.invalidateQueries({
        queryKey: ['events', variables.tripId],
      });

      // Invalidate itinerary data
      queryClient.invalidateQueries({
        queryKey: ['itinerary', variables.tripId],
      });

      // Success toast
      toast({
        title: 'Event created',
        description: `${data.title} has been added to your itinerary.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create event',
        description: error.message,
      });
    },
  });
}
