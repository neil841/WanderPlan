/**
 * DayColumn Component
 *
 * Displays events for a single day with drag-and-drop sorting.
 * Groups events by date and shows day header.
 *
 * @component
 * @example
 * <DayColumn date="2024-06-15" events={events} />
 */

'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { EventResponse } from '@/types/event';
import { DraggableEvent } from './DraggableEvent';
import { EmptyDay } from './EmptyDay';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayColumnProps {
  date: string;
  events: EventResponse[];
  tripId: string;
  onAddEvent?: () => void;
  canEdit?: boolean;
}

export function DayColumn({ date, events, tripId, onAddEvent, canEdit = true }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date}`,
    data: {
      type: 'day',
      date,
    },
  });

  // Format date for display
  const dateObj = parseISO(date);
  const dayOfWeek = format(dateObj, 'EEEE');
  const formattedDate = format(dateObj, 'MMM d, yyyy');

  // Get event IDs for sortable context
  const eventIds = events.map((event) => event.id);

  return (
    <div
      className={cn(
        'flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm',
        'transition-all duration-200',
        isOver && 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/30'
      )}
      role="region"
      aria-label={`Events for ${dayOfWeek}, ${formattedDate}`}
    >
      {/* Day header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50 rounded-t-lg">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            📅 {dayOfWeek}
          </h2>
          <p className="text-sm text-gray-600">{formattedDate}</p>
        </div>

        {onAddEvent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddEvent}
            className="gap-2"
            aria-label={`Add event to ${dayOfWeek}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add Event</span>
          </Button>
        )}
      </div>

      {/* Events list */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-4 space-y-3 min-h-[200px]',
          isOver && 'bg-blue-50/20'
        )}
      >
        {events.length === 0 ? (
          <EmptyDay date={date} onAddEvent={onAddEvent} />
        ) : (
          <SortableContext items={eventIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3" role="list" aria-label="Events">
              {events.map((event) => (
                <DraggableEvent key={event.id} event={event} tripId={tripId} canEdit={canEdit} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {/* Event count footer */}
      {events.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/30 rounded-b-lg">
          <p className="text-xs text-gray-600 text-center">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </p>
        </div>
      )}
    </div>
  );
}
