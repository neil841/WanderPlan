/**
 * Map Page
 *
 * Interactive map view showing all trip events with location markers.
 * Features custom markers by event type, clustering, and event popups.
 *
 * @page
 * @route /trips/[tripId]/map
 * @access Protected - Must be trip owner or collaborator
 */

'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Event, EventType } from '@/types/event';
import { POIResult } from '@/lib/search/overpass';

// Dynamic import to avoid SSR issues with Leaflet
const TripMap = dynamic(
  () => import('@/components/map/TripMap').then((mod) => ({ default: mod.TripMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
  }
);

const POISearch = dynamic(
  () => import('@/components/search/POISearch').then((mod) => ({ default: mod.POISearch })),
  { ssr: false }
);

interface MapPageProps {
  params: {
    tripId: string;
  };
}

/**
 * Fetch events for the trip
 */
async function fetchEvents(tripId: string): Promise<Event[]> {
  const response = await fetch(`/api/trips/${tripId}/events`);

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  return response.json();
}

/**
 * Map POI category to event type
 */
function categoryToEventType(category: string): EventType {
  const mapping: Record<string, EventType> = {
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

export default function MapPage({ params }: MapPageProps) {
  const { tripId } = params;
  const queryClient = useQueryClient();
  const [showPOISearch, setShowPOISearch] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20, lon: 0 }); // Default world view

  // Fetch events
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['events', tripId],
    queryFn: () => fetchEvents(tripId),
    staleTime: 30000, // 30 seconds
  });

  // Filter events with location data for stats
  const eventsWithLocation = events.filter(
    (event) =>
      event.location?.lat != null &&
      event.location?.lon != null &&
      !isNaN(event.location.lat) &&
      !isNaN(event.location.lon)
  );

  // Update map center based on events
  useEffect(() => {
    if (eventsWithLocation.length > 0) {
      const avgLat = eventsWithLocation.reduce((sum, e) => sum + e.location!.lat, 0) / eventsWithLocation.length;
      const avgLon = eventsWithLocation.reduce((sum, e) => sum + e.location!.lon, 0) / eventsWithLocation.length;
      setMapCenter({ lat: avgLat, lon: avgLon });
    }
  }, [eventsWithLocation.length]);

  // Mutation to create event from POI
  const createEventFromPOI = useMutation({
    mutationFn: async (poi: POIResult) => {
      const eventData = {
        type: categoryToEventType(poi.category),
        title: poi.name,
        location: {
          name: poi.name,
          address: poi.address || poi.name,
          lat: poi.location.lat,
          lon: poi.location.lon,
        },
        notes: poi.source === 'foursquare' && poi.rating
          ? `Rating: ${poi.rating}/5${poi.priceLevel ? `, Price: ${'$'.repeat(poi.priceLevel)}` : ''}`
          : undefined,
      };

      const response = await fetch(`/api/trips/${tripId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', tripId] });
      toast.success('POI added to itinerary');
      setShowPOISearch(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add POI');
    },
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to Load Events
          </h3>
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Trip Map</h1>
          </div>
          <Button
            onClick={() => setShowPOISearch(!showPOISearch)}
            variant={showPOISearch ? 'default' : 'outline'}
          >
            <Search className="h-4 w-4 mr-2" />
            {showPOISearch ? 'Hide' : 'Search'} POIs
          </Button>
        </div>
        <p className="text-gray-600">
          View all your trip events on an interactive map. Click markers to see event details.
        </p>

        {/* Stats */}
        {!isLoading && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {events.length}
              </span>
              <span className="text-gray-600">Total Events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-600">
                {eventsWithLocation.length}
              </span>
              <span className="text-gray-600">Events on Map</span>
            </div>
            {events.length > eventsWithLocation.length && (
              <div className="text-amber-600 text-xs">
                ({events.length - eventsWithLocation.length} events without
                location data)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="h-[calc(100vh-20rem)] min-h-[500px] relative">
          <TripMap tripId={tripId} events={events} isLoading={isLoading} />

          {/* POI Search Panel */}
          {showPOISearch && (
            <POISearch
              tripId={tripId}
              center={mapCenter}
              onSelectPOI={(poi) => createEventFromPOI.mutate(poi)}
              onClose={() => setShowPOISearch(false)}
            />
          )}
        </div>
      </div>

      {/* Help text */}
      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Tips for using the map
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Click on markers to view event details</li>
          <li>Zoom in/out using the +/- buttons or mouse wheel</li>
          <li>Drag the map to pan around</li>
          <li>
            Events without location data won't appear on the map - add
            locations to your events to see them here
          </li>
        </ul>
      </div>
    </div>
  );
}
