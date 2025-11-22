/**
 * EmptyEvents Component
 *
 * Displays an empty state when a trip has no events.
 * Includes a call-to-action to add the first event.
 *
 * @component
 * @example
 * <EmptyEvents onAddEvent={() => setShowEventDialog(true)} />
 */

'use client';

import { Calendar, MapPin } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyEventsProps {
  onAddEvent?: () => void;
}

export function EmptyEvents({ onAddEvent }: EmptyEventsProps) {
  return (
    <EmptyState
      icon={Calendar}
      title="No events yet"
      description="Start building your itinerary by adding flights, hotels, activities, and more to your trip."
      action={
        onAddEvent
          ? {
              label: 'Add First Event',
              onClick: onAddEvent,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyEventsCalendar Component
 *
 * Displays in calendar view when there are no events.
 */
export function EmptyEventsCalendar({ onAddEvent }: EmptyEventsProps) {
  return (
    <EmptyState
      icon={Calendar}
      title="No events scheduled"
      description="Your trip calendar is empty. Click on a date to add your first event."
      action={
        onAddEvent
          ? {
              label: 'Add Event',
              onClick: onAddEvent,
              variant: 'outline',
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyEventsMap Component
 *
 * Displays in map view when there are no events with locations.
 */
export function EmptyEventsMap({ onAddEvent }: EmptyEventsProps) {
  return (
    <EmptyState
      icon={MapPin}
      title="No locations yet"
      description="Add events with locations to see them on the map and plan your route."
      action={
        onAddEvent
          ? {
              label: 'Add Event',
              onClick: onAddEvent,
              variant: 'outline',
            }
          : undefined
      }
    />
  );
}
