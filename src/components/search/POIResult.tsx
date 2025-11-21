/**
 * POI Result Component
 *
 * Displays a single POI search result with name, category, location, and rating.
 * Allows adding the POI to the trip itinerary as an event.
 */

'use client';

import { MapPin, Star, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POIResult as POIResultType } from '@/lib/search/overpass';
import { eventIcons } from '@/lib/map/icons';

interface POIResultProps {
  poi: POIResultType;
  onSelect?: (poi: POIResultType) => void;
}

/**
 * Map POI category to event type
 */
function categoryToEventType(category: string): string {
  const mapping: Record<string, string> = {
    restaurant: 'RESTAURANT',
    cafe: 'RESTAURANT',
    hotel: 'HOTEL',
    attraction: 'ACTIVITY',
    museum: 'ACTIVITY',
    park: 'ACTIVITY',
    bar: 'RESTAURANT',
    shopping: 'ACTIVITY',
  };

  return mapping[category] || 'DESTINATION';
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: string): string {
  const eventType = categoryToEventType(category);
  return eventIcons[eventType as keyof typeof eventIcons] || '📍';
}

export function POIResult({ poi, onSelect }: POIResultProps) {
  const emoji = getCategoryEmoji(poi.category);

  return (
    <div className="p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">
          {emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and source */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
              {poi.name}
            </h4>
            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase font-medium">
              {poi.source}
            </span>
          </div>

          {/* Category */}
          <div className="text-xs text-gray-500 capitalize mb-1">{poi.category}</div>

          {/* Address */}
          {poi.address && (
            <div className="flex items-start gap-1 text-xs text-gray-600 mb-2">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{poi.address}</span>
            </div>
          )}

          {/* Rating and price */}
          <div className="flex items-center gap-3 mb-2">
            {poi.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium text-gray-700">
                  {poi.rating.toFixed(1)}
                </span>
              </div>
            )}

            {poi.priceLevel && (
              <div className="flex items-center gap-0.5 text-gray-600">
                {Array.from({ length: poi.priceLevel }).map((_, i) => (
                  <DollarSign key={i} className="h-3 w-3" />
                ))}
              </div>
            )}
          </div>

          {/* Add to itinerary button */}
          {onSelect && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelect(poi)}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add to Itinerary
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
