/**
 * ItineraryBuilder Component
 *
 * Main container for drag-and-drop itinerary builder.
 * Manages DndContext and event reordering logic.
 *
 * @component
 * @example
 * <ItineraryBuilder tripId={tripId} />
 */

'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useItineraryData } from '@/hooks/useItineraryData';
import { useEventReorder } from '@/hooks/useEventReorder';
import { EventResponse } from '@/types/event';
import { DayColumn } from './DayColumn';
import { UnscheduledEvents } from './UnscheduledEvents';
import { EventCard } from './EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ItineraryBuilderProps {
  tripId: string;
}

export function ItineraryBuilder({ tripId }: ItineraryBuilderProps) {
  const { eventsByDay, unscheduledEvents, allEvents, isLoading, error, refetch } =
    useItineraryData(tripId);
  const { reorder, isReordering } = useEventReorder(tripId);
  const [activeEvent, setActiveEvent] = useState<EventResponse | null>(null);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms touch hold to start drag
        tolerance: 5,
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeEventData = active.data.current?.event as EventResponse | undefined;

    if (activeEventData) {
      setActiveEvent(activeEventData);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEvent(null);

    if (!over || active.id === over.id || !allEvents) {
      return;
    }

    // Build new event order based on drag result
    const newEventOrder: EventResponse[] = [...allEvents];
    const activeIndex = newEventOrder.findIndex((e) => e.id === active.id);
    const overIndex = newEventOrder.findIndex((e) => e.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      // Reorder within same container
      const reordered = arrayMove(newEventOrder, activeIndex, overIndex);
      const eventIds = reordered.map((e) => e.id);

      // Call reorder API
      await reorder(eventIds);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load itinerary: {error.message}
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  // Get sorted day keys
  const dayKeys = Object.keys(eventsByDay).sort();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Unscheduled events section */}
        {unscheduledEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UnscheduledEvents events={unscheduledEvents} tripId={tripId} />
          </motion.div>
        )}

        {/* Day columns */}
        {dayKeys.length === 0 && unscheduledEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <AlertCircle className="h-12 w-12 text-gray-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No events yet
            </h3>
            <p className="text-gray-600 max-w-md">
              Start building your itinerary by adding events to your trip.
              Events will appear here organized by day.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, staggerChildren: 0.1 }}
          >
            {dayKeys.map((date, index) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <DayColumn date={date} events={eventsByDay[date] || []} tripId={tripId} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Loading overlay during reorder */}
        {isReordering && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm font-medium text-gray-900">
                Saving changes...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeEvent ? (
          <div className="rotate-3 scale-105">
            <EventCard event={activeEvent} tripId={tripId} isDragging={true} canEdit={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
