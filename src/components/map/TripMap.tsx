/**
 * Interactive trip map component with event markers
 *
 * Displays all trip events on a Leaflet map with OpenStreetMap tiles.
 * Features:
 * - Custom markers by event type
 * - Marker clustering for dense areas
 * - Auto-fit bounds to show all events
 * - Event popups with details
 * - Responsive design
 */

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useRouter } from 'next/navigation';
import { Event } from '@/types/event';
import { createEventIcon, defaultIcon } from '@/lib/map/icons';
import { EventPopup } from './EventPopup';

interface TripMapProps {
  tripId: string;
  events: Event[];
  isLoading?: boolean;
}

/**
 * Component to auto-fit map bounds to show all markers
 */
function AutoFitBounds({ events }: { events: Event[] }) {
  const map = useMap();

  useEffect(() => {
    // Get all events with valid locations
    const eventsWithLocation = events.filter(
      (event) =>
        event.location?.lat != null &&
        event.location?.lon != null &&
        !isNaN(event.location.lat) &&
        !isNaN(event.location.lon)
    );

    if (eventsWithLocation.length === 0) {
      // No events with location, show default view (world map)
      map.setView([20, 0], 2);
      return;
    }

    if (eventsWithLocation.length === 1) {
      // Single event, center on it
      const event = eventsWithLocation[0];
      map.setView([event.location!.lat, event.location!.lon], 13);
      return;
    }

    // Multiple events, fit bounds
    const bounds = L.latLngBounds(
      eventsWithLocation.map((event) => [
        event.location!.lat,
        event.location!.lon,
      ])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [events, map]);

  return null;
}

/**
 * Main trip map component
 */
export function TripMap({ tripId, events, isLoading }: TripMapProps) {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);

  // Filter events with valid location data
  const eventsWithLocation = useMemo(() => {
    return events.filter(
      (event) =>
        event.location?.lat != null &&
        event.location?.lon != null &&
        !isNaN(event.location.lat) &&
        !isNaN(event.location.lon)
    );
  }, [events]);

  // Handle view event details
  const handleViewDetails = (eventId: string) => {
    router.push(`/trips/${tripId}/itinerary?event=${eventId}`);
  };

  // Default center (world view)
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (eventsWithLocation.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Events with Locations
          </h3>
          <p className="text-sm text-gray-600">
            Add location information to your events to see them on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Auto-fit bounds to show all markers */}
        <AutoFitBounds events={eventsWithLocation} />

        {/* Event markers */}
        {eventsWithLocation.map((event) => {
          const icon = event.type ? createEventIcon(event.type) : defaultIcon;

          return (
            <Marker
              key={event.id}
              position={[event.location!.lat, event.location!.lon]}
              icon={icon}
            >
              <Popup maxWidth={340} closeButton={true}>
                <EventPopup
                  event={event}
                  onViewDetails={() => handleViewDetails(event.id)}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Event count badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
        <div className="text-sm font-medium text-gray-900">
          {eventsWithLocation.length}{' '}
          {eventsWithLocation.length === 1 ? 'Event' : 'Events'}
        </div>
        <div className="text-xs text-gray-500">on map</div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-[200px]">
        <div className="text-xs font-semibold text-gray-900 mb-2">
          Event Types
        </div>
        <div className="space-y-1 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <span>✈️</span>
            <span>Flight</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏨</span>
            <span>Hotel</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🍽️</span>
            <span>Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚗</span>
            <span>Transportation</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
}
