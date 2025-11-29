'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';

interface FullCalendarWrapperProps {
  events: EventInput[];
  initialDate?: string;
  height?: string | number;
}

/**
 * FullCalendarWrapper Component
 *
 * Wrapper for FullCalendar to handle dynamic imports and SSR
 */
export default function FullCalendarWrapper({
  events,
  initialDate,
  height = 'auto',
}: FullCalendarWrapperProps) {
  return (
    <div className="fullcalendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={initialDate}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        editable={false} // Guest mode is read-only
        droppable={false}
        height={height}
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
        timeZone="local"
        nowIndicator={true}
        navLinks={true}
        dayMaxEvents={3}
        moreLinkClick="day"
        contentHeight="auto"
        aspectRatio={1.8}
        eventClassNames="cursor-pointer"
      />

      {/* FullCalendar Custom Styles */}
      <style jsx global>{`
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

        .fc-button-primary:not(:disabled):active,
        .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

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
      `}</style>
    </div>
  );
}
