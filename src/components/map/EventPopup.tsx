/**
 * Event popup component for map markers
 *
 * Displays event details in a Leaflet popup when a marker is clicked.
 * Shows event title, type, dates, location, and cost information.
 */

'use client';

import { format } from 'date-fns';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Event } from '@/types/event';
import { eventIcons } from '@/lib/map/icons';

interface EventPopupProps {
  event: Event;
  onViewDetails?: () => void;
}

export function EventPopup({ event, onViewDetails }: EventPopupProps) {
  const hasDateTime = event.startDateTime || event.endDateTime;
  const hasLocation = event.location?.name;
  const hasCost = event.cost?.amount;

  return (
    <div className="min-w-[250px] max-w-[320px] p-1">
      {/* Header with icon and title */}
      <div className="mb-3 flex items-start gap-2">
        <span className="text-2xl" role="img" aria-label={event.type}>
          {eventIcons[event.type]}
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 leading-tight">
            {event.title}
          </h3>
          <p className="text-xs text-gray-500 capitalize mt-0.5">
            {event.type.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        {/* Date and time */}
        {hasDateTime && (
          <div className="flex items-start gap-2 text-gray-700">
            <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              {event.startDateTime && (
                <div>
                  {format(new Date(event.startDateTime), 'MMM d, yyyy')}
                </div>
              )}
              {event.startDateTime && event.endDateTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.startDateTime), 'h:mm a')}
                  {' → '}
                  {format(new Date(event.endDateTime), 'h:mm a')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {hasLocation && (
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-xs leading-relaxed">
              {event.location.name}
            </div>
          </div>
        )}

        {/* Cost */}
        {hasCost && (
          <div className="flex items-center gap-2 text-gray-700">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">
              {event.cost.currency} {event.cost.amount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Notes preview */}
        {event.notes && (
          <div className="text-xs text-gray-600 mt-2 line-clamp-2 italic">
            {event.notes}
          </div>
        )}
      </div>

      {/* View details button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-3 w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      )}
    </div>
  );
}
