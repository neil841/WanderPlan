/**
 * UnscheduledEvents Component
 *
 * Displays events without assigned dates.
 * Users can drag these events to day columns to schedule them.
 *
 * @component
 * @example
 * <UnscheduledEvents events={unscheduledEvents} />
 */

'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { EventResponse } from '@/types/event';
import { DraggableEvent } from './DraggableEvent';
import { Calendar, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnscheduledEventsProps {
  events: EventResponse[];
}

export function UnscheduledEvents({ events }: UnscheduledEventsProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unscheduled',
    data: {
      type: 'unscheduled',
    },
  });

  // Get event IDs for sortable context
  const eventIds = events.map((event) => event.id);

  return (
    <div
      className={cn(
        'flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm',
        'transition-all duration-200',
        isOver && 'ring-2 ring-orange-500 ring-offset-2 bg-orange-50/30'
      )}
      role="region"
      aria-label="Unscheduled events"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50/50 rounded-t-lg">
        <Calendar className="h-5 w-5 text-gray-600" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-gray-900">
          Unscheduled Events
        </h2>
        <span
          className="ml-auto text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded"
          aria-label={`${events.length} unscheduled events`}
        >
          {events.length}
        </span>
      </div>

      {/* Events list */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-4 space-y-3 min-h-[200px]',
          isOver && 'bg-orange-50/20'
        )}
      >
        {events.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
            role="status"
          >
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Inbox className="h-8 w-8 text-gray-400" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              All events scheduled
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              All your events have been assigned to specific days
            </p>
          </div>
        ) : (
          <SortableContext items={eventIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3" role="list" aria-label="Unscheduled events">
              {events.map((event) => (
                <DraggableEvent key={event.id} event={event} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {/* Helper text */}
      {events.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-orange-50/30 rounded-b-lg">
          <p className="text-xs text-gray-600 text-center">
            💡 Drag events to a day to schedule them
          </p>
        </div>
      )}
    </div>
  );
}
