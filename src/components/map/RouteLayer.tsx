/**
 * Route visualization layer for trip map
 *
 * Displays route polyline between events using OSRM routing data.
 * Shows distance, duration, and allows toggling visibility.
 */

'use client';

import { useEffect, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { Route, Navigation, X, Loader2, Car, Bike, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RouteResult } from '@/lib/map/osrm';

interface RouteLayerProps {
  tripId: string;
  profile?: 'car' | 'bike' | 'foot';
  visible?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
}

interface RouteResponse {
  route: RouteResult;
  events: Array<{
    id: string;
    title: string;
    type: string;
    location: any;
  }>;
  profile: string;
  metadata: {
    totalEvents: number;
    eventsWithLocation: number;
    eventsUsedInRoute: number;
  };
}

/**
 * Fetch route data from API
 */
async function fetchRoute(
  tripId: string,
  profile: string
): Promise<RouteResponse> {
  const response = await fetch(
    `/api/trips/${tripId}/route?profile=${profile}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to fetch route');
  }

  return response.json();
}

/**
 * Route control panel component
 */
function RouteControl({
  visible,
  onToggle,
  profile,
  onProfileChange,
  route,
  isLoading,
  error,
}: {
  visible: boolean;
  onToggle: () => void;
  profile: 'car' | 'bike' | 'foot';
  onProfileChange: (profile: 'car' | 'bike' | 'foot') => void;
  route?: RouteResult;
  isLoading: boolean;
  error: Error | null;
}) {
  const profileIcons = {
    car: <Car className="h-4 w-4" />,
    bike: <Bike className="h-4 w-4" />,
    foot: <Footprints className="h-4 w-4" />,
  };

  const profileLabels = {
    car: 'Driving',
    bike: 'Cycling',
    foot: 'Walking',
  };

  return (
    <div className="absolute top-20 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Route</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0"
        >
          {visible ? (
            <X className="h-4 w-4" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Calculating route...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-xs text-red-600 py-2">
          {error.message}
        </div>
      )}

      {/* Route info */}
      {visible && route && !error && (
        <>
          {/* Profile selector */}
          <div className="flex gap-1 mb-3">
            {(['car', 'bike', 'foot'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onProfileChange(p)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  profile === p
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={profileLabels[p]}
              >
                {profileIcons[p]}
              </button>
            ))}
          </div>

          {/* Distance and duration */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-semibold text-gray-900">
                {route.distanceKm} km
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold text-gray-900">
                {route.durationFormatted}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Toggle hint */}
      {!visible && !isLoading && !error && (
        <div className="text-xs text-gray-500 mt-2">
          Click to show route
        </div>
      )}
    </div>
  );
}

/**
 * Main route layer component
 */
export function RouteLayer({
  tripId,
  profile: initialProfile = 'car',
  visible: initialVisible = false,
  onToggleVisibility,
}: RouteLayerProps) {
  const [visible, setVisible] = useState(initialVisible);
  const [profile, setProfile] = useState<'car' | 'bike' | 'foot'>(initialProfile);
  const map = useMap();

  // Fetch route data
  const {
    data: routeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['route', tripId, profile],
    queryFn: () => fetchRoute(tripId, profile),
    enabled: visible,
    staleTime: 300000, // 5 minutes
    retry: 1,
  });

  // Handle visibility toggle
  const handleToggle = () => {
    const newVisible = !visible;
    setVisible(newVisible);
    onToggleVisibility?.(newVisible);
  };

  // Handle profile change
  const handleProfileChange = (newProfile: 'car' | 'bike' | 'foot') => {
    setProfile(newProfile);
  };

  // Extract route coordinates
  const routeCoordinates: [number, number][] | null =
    visible && routeData?.route?.geometry?.coordinates
      ? routeData.route.geometry.coordinates.map(
          (coord) => [coord[1], coord[0]] // GeoJSON is [lon, lat], Leaflet is [lat, lon]
        )
      : null;

  // Fit bounds to route when visible
  useEffect(() => {
    if (visible && routeCoordinates && routeCoordinates.length > 0) {
      const bounds = routeCoordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        map.getBounds()
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [visible, routeCoordinates, map]);

  return (
    <>
      {/* Route control panel */}
      <RouteControl
        visible={visible}
        onToggle={handleToggle}
        profile={profile}
        onProfileChange={handleProfileChange}
        route={routeData?.route}
        isLoading={isLoading}
        error={error as Error | null}
      />

      {/* Route polyline */}
      {visible && routeCoordinates && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#2563eb', // blue-600
            weight: 4,
            opacity: 0.7,
            lineJoin: 'round',
            lineCap: 'round',
          }}
        />
      )}
    </>
  );
}
