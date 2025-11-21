/**
 * TripCalendar Component
 *
 * FullCalendar-based calendar view for trip events.
 * Features:
 * - Month/Week/Day view switching
 * - Event drag-and-drop to reschedule
 * - Click event to view/edit details
 * - Click empty date to create new event
 * - Responsive design
 * - WCAG 2.1 AA compliant
 *
 * @component
 * @example
 * <TripCalendar tripId={tripId} canEdit={true} />
 */

'use client';

import { useCallback, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useUpdateEvent } from '@/hooks/useUpdateEvent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { EditEventDialog } from '@/components/events/EditEventDialog';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { toast } from 'sonner';
import { parseISO } from 'date-fns';

interface TripCalendarProps {
  tripId: string;
  canEdit?: boolean; // Permission to edit events
  timezone?: string; // Optional timezone (default: user's local timezone)
}

export function TripCalendar({ tripId, canEdit = false, timezone }: TripCalendarProps) {
  const { calendarEvents, isLoading, error, refetch } = useCalendarEvents(tripId);
  const updateEventMutation = useUpdateEvent();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState<Date | null>(null);

  const calendarRef = useRef<FullCalendar>(null);

  /**
   * Handle event click - Open edit dialog
   */
  const handleEventClick = useCallback((info: EventClickArg) => {
    if (!canEdit) {
      // View-only mode: show event details in a tooltip or read-only view
      // For now, we'll just not open the edit dialog
      toast.info('View-only mode. You cannot edit this event.');
      return;
    }

    info.jsEvent.preventDefault();
    setSelectedEventId(info.event.id);
    setEditDialogOpen(true);
  }, [canEdit]);

  /**
   * Handle date click - Create new event
   */
  const handleDateClick = useCallback((info: DateClickArg) => {
    if (!canEdit) {
      toast.info('View-only mode. You cannot create events.');
      return;
    }

    setDefaultDate(info.date);
    setCreateDialogOpen(true);
  }, [canEdit]);

  /**
   * Handle event drop - Reschedule event
   */
  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    if (!canEdit) {
      info.revert();
      toast.error('You do not have permission to edit events.');
      return;
    }

    const eventId = info.event.id;
    const newStart = info.event.start;
    const newEnd = info.event.end;

    if (!newStart) {
      info.revert();
      toast.error('Invalid date');
      return;
    }

    try {
      // Optimistic update is already applied by FullCalendar
      await updateEventMutation.mutateAsync({
        tripId,
        eventId,
        data: {
          startDateTime: newStart.toISOString() as any,
          endDateTime: newEnd?.toISOString() as any,
        },
      });

      toast.success('Event rescheduled');
      refetch(); // Refresh to ensure consistency
    } catch (error) {
      // Revert on error
      info.revert();
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule event');
    }
  }, [canEdit, updateEventMutation, refetch]);

  /**
   * Handle event resize (if enabled)
   */
  const handleEventResize = useCallback(async (info: EventResizeDoneArg) => {
    if (!canEdit) {
      info.revert();
      toast.error('You do not have permission to edit events.');
      return;
    }

    const eventId = info.event.id;
    const newEnd = info.event.end;

    if (!newEnd) {
      info.revert();
      toast.error('Invalid date');
      return;
    }

    try {
      await updateEventMutation.mutateAsync({
        tripId,
        eventId,
        data: {
          endDateTime: newEnd.toISOString() as any,
        },
      });

      toast.success('Event duration updated');
      refetch();
    } catch (error) {
      info.revert();
      toast.error(error instanceof Error ? error.message : 'Failed to update event duration');
    }
  }, [canEdit, updateEventMutation, refetch]);

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </Card>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load calendar events: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  /**
   * Empty state (no events)
   */
  if (calendarEvents.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Calendar className="h-16 w-16 text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No events scheduled</h3>
            <p className="text-sm text-gray-600 mt-2">
              Click on any date to create your first event
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => {
              setDefaultDate(new Date());
              setCreateDialogOpen(true);
            }}>
              Create Event
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 md:p-6">
        {/* Calendar */}
        <div className="fullcalendar-wrapper">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            editable={canEdit}
            droppable={canEdit}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="auto"
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            timeZone={timezone || 'local'}
            nowIndicator={true}
            navLinks={true}
            dayMaxEvents={3} // Show "+N more" link when more than 3 events
            moreLinkClick="day" // Click "+N more" to switch to day view
            // Responsive behavior
            contentHeight="auto"
            aspectRatio={1.8}
            // Accessibility
            eventClassNames="cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            // Loading
            loading={(isLoading) => {
              if (isLoading) {
                return (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                );
              }
              return null;
            }}
          />
        </div>

        {/* Help text */}
        {canEdit && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            Click an event to edit, drag to reschedule, or click an empty date to create a new event
          </p>
        )}
      </Card>

      {/* Edit Event Dialog */}
      {selectedEventId && (
        <EditEventDialog
          tripId={tripId}
          eventId={selectedEventId}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setSelectedEventId(null);
              refetch(); // Refresh calendar when dialog closes
            }
          }}
        />
      )}

      {/* Create Event Dialog */}
      <CreateEventDialog
        tripId={tripId}
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setDefaultDate(null);
            refetch(); // Refresh calendar when dialog closes
          }
        }}
        defaultDate={defaultDate?.toISOString()}
      />

      {/* FullCalendar Custom Styles */}
      <style jsx global>{`
        /* FullCalendar customizations */
        .fullcalendar-wrapper {
          font-family: inherit;
        }

        .fc {
          font-family: inherit;
        }

        .fc-theme-standard th {
          background-color: #f9fafb;
          color: #374151;
          font-weight: 600;
          border-color: #e5e7eb;
        }

        .fc-theme-standard td {
          border-color: #e5e7eb;
        }

        .fc-daygrid-day-number {
          color: #6b7280;
          padding: 0.5rem;
        }

        .fc-daygrid-day.fc-day-today {
          background-color: #fef3c7 !important;
        }

        .fc-event {
          cursor: pointer;
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
        }

        .fc-event:hover {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          transform: translateY(-1px);
        }

        .fc-event:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .fc-button {
          background-color: #ffffff;
          border-color: #e5e7eb;
          color: #374151;
          text-transform: capitalize;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }

        .fc-button:hover {
          background-color: #f9fafb;
          border-color: #d1d5db;
        }

        .fc-button:focus {
          box-shadow: 0 0 0 2px #3b82f6;
        }

        .fc-button-primary:not(:disabled):active,
        .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .fc-button-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .fc-col-header-cell-cushion {
          color: #374151;
          font-weight: 600;
        }

        .fc-daygrid-more-link {
          color: #3b82f6;
          font-weight: 500;
        }

        .fc-daygrid-more-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }

          .fc-toolbar-title {
            font-size: 1.25rem;
          }

          .fc-button {
            font-size: 0.875rem;
            padding: 0.375rem 0.75rem;
          }

          .fc-event {
            font-size: 0.75rem;
            padding: 0.125rem 0.25rem;
          }
        }

        /* Dark mode support (optional) */
        @media (prefers-color-scheme: dark) {
          .fc-theme-standard th {
            background-color: #1f2937;
            color: #f9fafb;
            border-color: #374151;
          }

          .fc-theme-standard td {
            border-color: #374151;
          }

          .fc-daygrid-day-number {
            color: #9ca3af;
          }

          .fc-toolbar-title {
            color: #f9fafb;
          }

          .fc-button {
            background-color: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .fc-button:hover {
            background-color: #4b5563;
            border-color: #6b7280;
          }
        }
      `}</style>
    </>
  );
}
