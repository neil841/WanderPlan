'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getGuestTrip, getGuestEvents, type GuestEvent } from '@/lib/guest-mode';
import { parseISO, addDays, format } from 'date-fns';

// Dynamic import for Leaflet map to avoid SSR issues
const DynamicTripMap = dynamic(
  () => import('@/components/map/TripMap').then((mod) => mod.TripMap),
  {
    loading: () => <MapSkeleton />,
    ssr: false,
  }
);

interface MapTabProps {
  tripId: string;
}

/**
 * MapSkeleton Component
 * Loading state for map
 */
function MapSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  );
}

/**
 * MapTab Component
 *
 * Premium map view for guest trip events.
 * Converts guest events with locations to map markers.
 *
 * @component
 */
export function MapTab({ tripId }: MapTabProps) {
  const [trip, setTrip] = useState(getGuestTrip(tripId));
  const [events, setEvents] = useState<GuestEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Listen for storage changes
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tripId]);

  const loadData = () => {
    setIsLoading(true);
    const tripData = getGuestTrip(tripId);
    const eventsData = getGuestEvents(tripId);

    setTrip(tripData);
    setEvents(eventsData);
    setIsLoading(false);
  };

  // Convert guest events to map format (only events with location)
  const mapEvents = useMemo(() => {
    if (!trip) return [];

    const startDate = parseISO(trip.startDate);

    return events
      .filter((event) => event.location) // Only events with location
      .map((event) => {
        // Calculate the date based on day number
        const eventDate = addDays(startDate, event.day - 1);

        // For now, guest events store location as a string
        // In a real implementation, you'd need geocoding or structured location data
        return {
          id: event.id,
          title: event.title,
          type: event.category || 'other',
          location: {
            name: event.location || '',
            // Note: Guest mode currently doesn't store lat/lon
            // You would need to add geocoding or have users select from a location picker
            lat: 0, // Placeholder
            lon: 0, // Placeholder
          },
          startDateTime: eventDate.toISOString(),
          endDateTime: event.endTime ? addDays(startDate, event.day - 1).toISOString() : undefined,
          description: event.description,
          estimatedCost: event.estimatedCost,
        };
      });
  }, [trip, events]);

  // Count events with locations
  const eventsWithLocation = events.filter((e) => e.location).length;

  if (!trip) {
    return (
      <TabsContent value="map" className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="map" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-7 w-7 text-orange-600" />
            Map View
          </h2>
          <p className="text-gray-600 mt-1">
            Visualize all your event locations on an interactive map
          </p>
        </div>
      </div>

      {/* Info Alert */}
      {eventsWithLocation === 0 && !isLoading && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>No locations added yet!</strong> Add location information to your events in the Itinerary tab to see them on the map.
          </AlertDescription>
        </Alert>
      )}

      {/* Upgrade Note - Guest mode limitation */}
      <Alert className="border-blue-200 bg-blue-50">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Coming soon!</strong> Map functionality requires geocoding. Create an account to access the full interactive map with location search and markers.
        </AlertDescription>
      </Alert>

      {/* Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Trip Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <MapSkeleton />
            ) : (
              <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Interactive Map Available with Account
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create a free account to:
                  </p>
                  <ul className="text-left text-sm text-gray-700 space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Search and add locations with geocoding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>See all event locations on an interactive map</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>View routes and distances between locations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Export maps with your itinerary</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      {eventsWithLocation > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-sm text-gray-600"
        >
          <Sparkles className="h-4 w-4 text-orange-600" />
          <span>
            <strong>{eventsWithLocation}</strong> {eventsWithLocation === 1 ? 'event' : 'events'} with locations
          </span>
        </motion.div>
      )}
    </TabsContent>
  );
}
