'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Sparkles, Info } from 'lucide-react';

import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getGuestTrip, getGuestEvents, type GuestEvent } from '@/lib/guest-mode';
import { parseISO, format } from 'date-fns';

// Dynamic import for FullCalendar to avoid SSR issues
import dynamic from 'next/dynamic';

// Lazy load FullCalendar
const FullCalendarWrapper = dynamic(
  () => import('@/components/calendar/FullCalendarWrapper'),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
);

interface CalendarTabProps {
  tripId: string;
}

/**
 * CalendarSkeleton Component
 * Loading state for calendar
 */
function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}

/**
 * CalendarTab Component
 *
 * Premium calendar view for guest trip events.
 * Converts guest events from localStorage to FullCalendar format.
 *
 * @component
 */
export function CalendarTab({ tripId }: CalendarTabProps) {
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

  // Convert guest events to FullCalendar event format
  const calendarEvents = useMemo(() => {
    if (!trip) return [];

    const startDate = parseISO(trip.startDate);

    return events.map((event) => {
      // Calculate the date based on day number
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + (event.day - 1));

      // Format date string (YYYY-MM-DD)
      const dateStr = format(eventDate, 'yyyy-MM-dd');

      // Combine date with time if available
      let start: string;
      let end: string | undefined;

      if (event.startTime) {
        start = `${dateStr}T${event.startTime}:00`;
      } else {
        start = dateStr;
      }

      if (event.endTime) {
        end = `${dateStr}T${event.endTime}:00`;
      }

      // Determine color based on category
      const colorMap: Record<string, string> = {
        activity: '#3b82f6', // blue
        food: '#f59e0b', // amber
        transport: '#6366f1', // indigo
        accommodation: '#8b5cf6', // purple
        shopping: '#ec4899', // pink
        other: '#6b7280', // gray
      };

      return {
        id: event.id,
        title: event.title,
        start,
        end,
        allDay: !event.startTime,
        backgroundColor: colorMap[event.category || 'other'],
        borderColor: colorMap[event.category || 'other'],
        extendedProps: {
          description: event.description,
          location: event.location,
          estimatedCost: event.estimatedCost,
          category: event.category,
        },
      };
    });
  }, [trip, events]);

  if (!trip) {
    return (
      <TabsContent value="calendar" className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="calendar" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-blue-600" />
            Calendar View
          </h2>
          <p className="text-gray-600 mt-1">
            See all your events in a monthly, weekly, or daily calendar
          </p>
        </div>
      </div>

      {/* Info Alert for Empty State */}
      {events.length === 0 && !isLoading && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>No events yet!</strong> Add events in the Itinerary tab to see them on your calendar.
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Trip Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CalendarSkeleton />
            ) : (
              <div className="min-h-[600px]">
                <FullCalendarWrapper
                  events={calendarEvents}
                  initialDate={trip.startDate}
                  height="600px"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      {events.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-sm text-gray-600"
        >
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>
            Showing <strong>{events.length}</strong> {events.length === 1 ? 'event' : 'events'} on your calendar
          </span>
        </motion.div>
      )}
    </TabsContent>
  );
}
