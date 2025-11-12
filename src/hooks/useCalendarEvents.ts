/**
 * useCalendarEvents Hook
 *
 * Transforms WanderPlan events to FullCalendar event format.
 * Fetches events and provides them in the format required by FullCalendar.
 *
 * @param tripId - The ID of the trip
 * @returns Transformed events for FullCalendar
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { EventResponse } from '@/types/event';
import { EventInput } from '@fullcalendar/core';
import { parseISO } from 'date-fns';

/**
 * Get background color for event type (for FullCalendar)
 */
function getEventBackgroundColor(type: string): string {
  switch (type) {
    case 'FLIGHT':
      return '#2563eb'; // blue-600
    case 'HOTEL':
      return '#9333ea'; // purple-600
    case 'ACTIVITY':
      return '#16a34a'; // green-600
    case 'RESTAURANT':
      return '#ea580c'; // orange-600
    case 'TRANSPORTATION':
      return '#4f46e5'; // indigo-600
    case 'DESTINATION':
      return '#dc2626'; // red-600
    default:
      return '#6b7280'; // gray-600
  }
}

/**
 * Get border color for event type (same as background for FullCalendar)
 */
function getEventBorderColor(type: string): string {
  return getEventBackgroundColor(type);
}

/**
 * Get text color for event (white for dark backgrounds)
 */
function getEventTextColor(): string {
  return '#ffffff';
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
 * Transform WanderPlan events to FullCalendar format
 */
function transformEventsForCalendar(events: EventResponse[]): EventInput[] {
  return events
    .filter((event) => event.startDateTime) // Only include events with dates
    .map((event) => {
      const start = typeof event.startDateTime === 'string'
        ? parseISO(event.startDateTime)
        : event.startDateTime;

      const end = event.endDateTime
        ? (typeof event.endDateTime === 'string'
            ? parseISO(event.endDateTime)
            : event.endDateTime)
        : undefined;

      return {
        id: event.id,
        title: event.title,
        start: start.toISOString(),
        end: end?.toISOString(),
        backgroundColor: getEventBackgroundColor(event.type),
        borderColor: getEventBorderColor(event.type),
        textColor: getEventTextColor(),
        extendedProps: {
          type: event.type,
          location: event.location,
          cost: event.cost,
          notes: event.notes,
          confirmationNumber: event.confirmationNumber,
          description: event.description,
        },
      };
    });
}

/**
 * Hook to fetch and transform events for FullCalendar
 */
export function useCalendarEvents(tripId: string) {
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

  const calendarEvents = transformEventsForCalendar(events);

  return {
    calendarEvents,
    rawEvents: events,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
