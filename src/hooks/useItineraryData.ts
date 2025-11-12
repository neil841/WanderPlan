/**
 * useItineraryData Hook
 *
 * Fetches and manages events data for itinerary builder.
 * Groups events by day and provides unscheduled events.
 *
 * @param tripId - The ID of the trip
 * @returns Events grouped by day and unscheduled events
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { EventResponse } from '@/types/event';
import { format, parseISO } from 'date-fns';

interface GroupedEvents {
  [date: string]: EventResponse[];
}

interface ItineraryData {
  eventsByDay: GroupedEvents;
  unscheduledEvents: EventResponse[];
  allEvents: EventResponse[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch events from API
 */
async function fetchEvents(tripId: string): Promise<EventResponse[]> {
  const response = await fetch(`/api/trips/${tripId}/events?sort=startDateTime&orderBy=asc`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch events');
  }

  const data = await response.json();
  return data.events || [];
}

/**
 * Group events by day
 */
function groupEventsByDay(events: EventResponse[]): {
  eventsByDay: GroupedEvents;
  unscheduledEvents: EventResponse[];
} {
  const eventsByDay: GroupedEvents = {};
  const unscheduledEvents: EventResponse[] = [];

  events.forEach((event) => {
    if (!event.startDateTime) {
      // No date assigned - unscheduled
      unscheduledEvents.push(event);
    } else {
      // Format date as YYYY-MM-DD for grouping
      const dateKey = format(
        typeof event.startDateTime === 'string'
          ? parseISO(event.startDateTime)
          : event.startDateTime,
        'yyyy-MM-dd'
      );

      if (!eventsByDay[dateKey]) {
        eventsByDay[dateKey] = [];
      }

      eventsByDay[dateKey].push(event);
    }
  });

  // Sort events within each day by order field, then by time
  Object.keys(eventsByDay).forEach((date) => {
    const dayEvents = eventsByDay[date];
    if (dayEvents) {
      dayEvents.sort((a, b) => {
        // First sort by order field
        if (a.order !== b.order) {
          return a.order - b.order;
        }

        // Then by time if order is same
        const timeA = a.startDateTime
          ? typeof a.startDateTime === 'string'
            ? parseISO(a.startDateTime)
            : a.startDateTime
          : new Date(0);
        const timeB = b.startDateTime
          ? typeof b.startDateTime === 'string'
            ? parseISO(b.startDateTime)
            : b.startDateTime
          : new Date(0);

        return timeA.getTime() - timeB.getTime();
      });
    }
  });

  return { eventsByDay, unscheduledEvents };
}

/**
 * Hook to fetch and manage itinerary data
 */
export function useItineraryData(tripId: string): ItineraryData {
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery<EventResponse[], Error>({
    queryKey: ['events', tripId],
    queryFn: () => fetchEvents(tripId),
    enabled: !!tripId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });

  const { eventsByDay, unscheduledEvents } = groupEventsByDay(events);

  return {
    eventsByDay,
    unscheduledEvents,
    allEvents: events,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
