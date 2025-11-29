'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarDays, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EventCard } from './EventCard';
import { GuestCreateEventDialog } from './GuestCreateEventDialog';
import {
  getGuestTrip,
  getGuestEvents,
  addGuestEvent,
  updateGuestEvent,
  deleteGuestEvent,
  type GuestEvent,
  type GuestTrip,
  type EventCategory,
} from '@/lib/guest-mode';
import { format, addDays, differenceInDays } from 'date-fns';
import { useTrip } from '@/hooks/useTrip';
import { Event, EventType } from '@/types/event';

interface ItineraryTabProps {
  tripId: string;
  isAuthenticated?: boolean;
}

// Map event types to guest event categories
const EVENT_TYPE_TO_CATEGORY: Record<EventType, EventCategory> = {
  [EventType.FLIGHT]: 'transport',
  [EventType.HOTEL]: 'accommodation',
  [EventType.ACTIVITY]: 'activity',
  [EventType.RESTAURANT]: 'food',
  [EventType.TRANSPORTATION]: 'transport',
  [EventType.DESTINATION]: 'activity',
};

/**
 * ItineraryTab Component
 *
 * Premium day-by-day itinerary builder.
 * Features event management, empty states, and smooth animations.
 * Supports both Guest (localStorage) and Authenticated (DB) modes with unified UI.
 *
 * @component
 */
export function ItineraryTab({ tripId, isAuthenticated }: ItineraryTabProps) {
  const queryClient = useQueryClient();
  const isGuestTrip = tripId.startsWith('guest-');

  // Guest State
  const [guestTrip, setGuestTrip] = useState<GuestTrip | null>(null);
  const [guestEvents, setGuestEvents] = useState<GuestEvent[]>([]);

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GuestEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // --- Authenticated Data Fetching ---
  const { data: dbTrip, isLoading: isDbTripLoading } = useTrip({
    tripId,
    enabled: !isGuestTrip
  });

  // --- Authenticated Mutations ---
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/trips/${tripId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/trips/${tripId}/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trips/${tripId}/events/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete event');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    }
  });

  // --- Guest Data Loading ---
  useEffect(() => {
    if (!isGuestTrip) return;

    loadGuestData();

    // Listen for storage changes
    const handleStorageChange = () => loadGuestData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tripId, isGuestTrip]);

  const loadGuestData = () => {
    setGuestTrip(getGuestTrip(tripId));
    setGuestEvents(getGuestEvents(tripId));
  };

  // --- Data Unification ---
  let trip: GuestTrip | null = null;
  let events: GuestEvent[] = [];

  if (isGuestTrip) {
    trip = guestTrip;
    events = guestEvents;
  } else if (dbTrip) {
    // Map DB Trip
    trip = {
      id: dbTrip.id,
      name: dbTrip.name,
      description: dbTrip.description || undefined,
      startDate: dbTrip.startDate || new Date().toISOString(),
      endDate: dbTrip.endDate || new Date().toISOString(),
      destinations: dbTrip.destinations,
      tags: dbTrip.tags.map(t => t.name),
      visibility: dbTrip.visibility.toLowerCase() as 'private' | 'shared' | 'public',
      events: [],
      expenses: [],
      createdAt: dbTrip.createdAt,
      updatedAt: dbTrip.updatedAt,
    };

    // Map DB Events
    const tripStartDate = new Date(dbTrip.startDate || new Date());
    events = dbTrip.events.map(event => {
      // Calculate day
      const eventDate = new Date(event.date);
      const day = differenceInDays(eventDate, tripStartDate) + 1;

      return {
        id: event.id,
        tripId: dbTrip.id,
        day: Math.max(1, day), // Ensure day is at least 1
        title: event.name,
        startTime: event.startTime || undefined,
        endTime: event.endTime || undefined,
        location: event.location || undefined,
        description: event.description || undefined,
        estimatedCost: event.cost?.amount,
        category: EVENT_TYPE_TO_CATEGORY[event.type as EventType] || 'activity',
        type: event.type,
        order: event.order,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };
    });
  }

  const isLoading = isGuestTrip ? (!trip) : isDbTripLoading;

  // --- Handlers ---
  const handleAddEvent = (day: number) => {
    setSelectedDay(day);
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: GuestEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      if (isGuestTrip) {
        deleteGuestEvent(tripId, eventId);
        loadGuestData();
      } else {
        await deleteEventMutation.mutateAsync(eventId);
      }
    }
  };

  const handleSubmitEvent = async (eventData: Partial<GuestEvent>) => {
    if (isGuestTrip) {
      // Guest logic handled by GuestCreateEventDialog default behavior? 
      // No, we need to pass onSubmit to override it OR let it handle it.
      // But GuestCreateEventDialog logic is complex (syncing budget etc).
      // Ideally we reuse it.
      // If we don't pass onSubmit, it uses default logic.
      // So for guest, we pass undefined.
      // Wait, GuestCreateEventDialog calls onSuccess.
      // We need to reload data in onSuccess.
      loadGuestData();
    } else {
      // Auth logic
      // Map GuestEvent data back to API format
      if (!trip) return;

      const tripStartDate = new Date(trip.startDate);
      const dayOffset = (eventData.day || 1) - 1;
      const eventDate = addDays(tripStartDate, dayOffset);

      // Set time
      if (eventData.startTime) {
        const [hours, minutes] = eventData.startTime.split(':').map(Number);
        eventDate.setHours(hours, minutes, 0, 0);
      }

      const apiData = {
        type: eventData.type || 'ACTIVITY', // Default or from form
        name: eventData.title,
        description: eventData.description,
        date: eventDate.toISOString(),
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        cost: eventData.estimatedCost ? { amount: eventData.estimatedCost, currency: 'USD' } : undefined,
        notes: eventData.description, // Map description to notes as well?
      };

      if (editingEvent) {
        await updateEventMutation.mutateAsync({ id: editingEvent.id, data: apiData });
      } else {
        await createEventMutation.mutateAsync(apiData);
      }
    }
  };

  if (isLoading) {
    return (
      <TabsContent value="itinerary" className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TabsContent>
    );
  }

  if (!trip) {
    return (
      <TabsContent value="itinerary" className="space-y-6">
        <div className="text-center py-12 text-gray-500">Trip not found</div>
      </TabsContent>
    );
  }

  // Calculate trip days
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  // Group events by day
  const eventsByDay = events.reduce((acc, event) => {
    if (!acc[event.day]) {
      acc[event.day] = [];
    }
    acc[event.day].push(event);
    return acc;
  }, {} as Record<number, GuestEvent[]>);

  // Sort events by order
  Object.keys(eventsByDay).forEach((day) => {
    eventsByDay[parseInt(day)].sort((a, b) => a.order - b.order);
  });

  return (
    <>
      <TabsContent value="itinerary" className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Day-by-Day Itinerary</h2>
            <p className="text-gray-600 mt-1">
              Plan your activities, meals, and destinations for each day
            </p>
          </div>
          <Button
            onClick={() => handleAddEvent(1)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Success Tip */}
        {events.length === 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Get started!</strong> Add your first event to begin building your itinerary.
              You can add activities, meals, transport, and more.
            </AlertDescription>
          </Alert>
        )}

        {/* Days */}
        <div className="space-y-8">
          {days.map((day, index) => {
            const dayDate = addDays(startDate, index);
            const dayEvents = eventsByDay[day] || [];

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card>
                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-blue-50/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold shadow-md">
                          {day}
                        </div>
                        <div>
                          <div className="text-lg">Day {day}</div>
                          <div className="text-sm font-normal text-gray-600 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {format(dayDate, 'EEEE, MMMM d, yyyy')}
                          </div>
                        </div>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddEvent(day)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {dayEvents.length > 0 ? (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {dayEvents.map((event) => (
                            <EventCard
                              key={event.id}
                              event={event}
                              onEdit={handleEditEvent}
                              onDelete={handleDeleteEvent}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                          <CalendarDays className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No events planned yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Add activities, meals, or destinations for Day {day}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => handleAddEvent(day)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add First Event
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-4"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>
              You've planned <strong>{events.length}</strong> {events.length === 1 ? 'event' : 'events'} across{' '}
              <strong>{dayCount}</strong> {dayCount === 1 ? 'day' : 'days'}
            </span>
          </motion.div>
        )}
      </TabsContent>

      {/* Event Form Modal */}
      <GuestCreateEventDialog
        tripId={tripId}
        open={showEventForm}
        onOpenChange={setShowEventForm}
        defaultDay={selectedDay}
        mode={editingEvent ? 'edit' : 'create'}
        eventData={editingEvent || undefined}
        onSuccess={() => {
          if (isGuestTrip) loadGuestData();
          // For auth, invalidation is handled by mutation, but we might want to refetch?
          // Mutation onSuccess invalidates query, so useTrip will update automatically.
        }}
        onSubmit={isGuestTrip ? undefined : handleSubmitEvent}
      />
    </>
  );
}
