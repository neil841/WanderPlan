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

import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Loader2 } from 'lucide-react';
import { Event } from '@/types/event';

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

export default function MapPage({ params }: MapPageProps) {
  const { tripId } = params;

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
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Trip Map</h1>
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
        <div className="h-[calc(100vh-20rem)] min-h-[500px]">
          <TripMap tripId={tripId} events={events} isLoading={isLoading} />
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
