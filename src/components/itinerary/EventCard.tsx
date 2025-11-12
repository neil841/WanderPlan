/**
 * EventCard Component
 *
 * Displays an individual event card with type icon, title, time, location, and cost.
 * Shows different icons based on event type.
 * Includes edit/delete buttons for users with edit permissions.
 *
 * @component
 * @example
 * <EventCard event={event} tripId={tripId} canEdit={true} />
 */

'use client';

import { useState } from 'react';
import { EventResponse } from '@/types/event';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plane,
  Hotel,
  Calendar,
  UtensilsCrossed,
  Car,
  MapPin,
  Clock,
  DollarSign,
  Pencil,
  Trash2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditEventDialog } from '@/components/events/EditEventDialog';
import { DeleteEventDialog } from '@/components/events/DeleteEventDialog';

interface EventCardProps {
  event: EventResponse;
  tripId: string;
  isDragging?: boolean;
  canEdit?: boolean; // Permission to edit/delete events
}

/**
 * Get icon component for event type
 */
function getEventIcon(type: string) {
  const iconProps = { className: 'h-5 w-5' };

  switch (type) {
    case 'FLIGHT':
      return <Plane {...iconProps} />;
    case 'HOTEL':
      return <Hotel {...iconProps} />;
    case 'ACTIVITY':
      return <Calendar {...iconProps} />;
    case 'RESTAURANT':
      return <UtensilsCrossed {...iconProps} />;
    case 'TRANSPORTATION':
      return <Car {...iconProps} />;
    case 'DESTINATION':
      return <MapPin {...iconProps} />;
    default:
      return <Calendar {...iconProps} />;
  }
}

/**
 * Get color for event type
 */
function getEventColor(type: string): string {
  switch (type) {
    case 'FLIGHT':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'HOTEL':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'ACTIVITY':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'RESTAURANT':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'TRANSPORTATION':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    case 'DESTINATION':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Format time range
 */
function formatTimeRange(start: Date | string | null | undefined, end: Date | string | null | undefined): string {
  if (!start) return '';

  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const startTime = format(startDate, 'h:mm a');

  if (!end) return startTime;

  const endDate = typeof end === 'string' ? parseISO(end) : end;
  const endTime = format(endDate, 'h:mm a');

  return `${startTime} - ${endTime}`;
}

export function EventCard({ event, tripId, isDragging = false, canEdit = true }: EventCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const timeRange = formatTimeRange(event.startDateTime, event.endDateTime);
  const location = event.location
    ? typeof event.location === 'string'
      ? JSON.parse(event.location)
      : event.location
    : null;

  return (
    <>
      <Card
        className={cn(
          'group relative cursor-grab active:cursor-grabbing',
          'border transition-all duration-200',
          'hover:shadow-md hover:border-gray-300',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
          isDragging && 'opacity-50 shadow-lg rotate-2',
          getEventColor(event.type)
        )}
        role="listitem"
        aria-label={`${event.type} event: ${event.title}`}
      >
      <div className="flex items-start gap-3 p-4">
        {/* Event type icon */}
        <div
          className={cn(
            'flex-shrink-0 rounded-lg p-2',
            getEventColor(event.type)
          )}
          aria-hidden="true"
        >
          {getEventIcon(event.type)}
        </div>

        {/* Event details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {event.title}
          </h3>

          {/* Time */}
          {timeRange && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{timeRange}</span>
            </div>
          )}

          {/* Location */}
          {location && location.name && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{location.name}</span>
            </div>
          )}

          {/* Confirmation number */}
          {event.confirmationNumber && (
            <Badge variant="secondary" className="mt-2 text-xs">
              #{event.confirmationNumber}
            </Badge>
          )}
        </div>

        {/* Cost */}
        {event.cost && (
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
              <DollarSign className="h-4 w-4" aria-hidden="true" />
              <span>
                {event.cost.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            {event.cost.currency && event.cost.currency !== 'USD' && (
              <span className="text-xs text-gray-500">{event.cost.currency}</span>
            )}
          </div>
        )}
      </div>

      {/* Edit/Delete action buttons (shown on hover or always on mobile) */}
      {canEdit && (
        <div
          className={cn(
            'absolute top-2 right-2 flex gap-1',
            'opacity-0 md:group-hover:opacity-100 transition-opacity',
            'md:opacity-0', // Hidden on desktop until hover
            'opacity-100' // Always visible on mobile
          )}
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditDialogOpen(true);
            }}
            aria-label={`Edit ${event.title}`}
          >
            <Pencil className="h-4 w-4 text-gray-700" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-white/90 hover:bg-white hover:text-red-600 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialogOpen(true);
            }}
            aria-label={`Delete ${event.title}`}
          >
            <Trash2 className="h-4 w-4 text-gray-700" />
          </Button>
        </div>
      )}

      {/* Drag handle indicator (visible on hover) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-l"
        aria-hidden="true"
      />
    </Card>

    {/* Edit Event Dialog */}
    <EditEventDialog
      tripId={tripId}
      eventId={event.id}
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
    />

    {/* Delete Event Dialog */}
    <DeleteEventDialog
      tripId={tripId}
      event={event}
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
    />
  </>
  );
}
