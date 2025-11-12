/**
 * Calendar Page
 *
 * Monthly/weekly/daily calendar view of trip events with FullCalendar.
 * Provides an alternative view to the itinerary builder with drag-to-reschedule functionality.
 *
 * @page
 * @route /trips/[tripId]/calendar
 * @access Protected - Must be trip owner or collaborator
 */

import { Metadata } from 'next';
import { TripCalendar } from '@/components/calendar/TripCalendar';

export const metadata: Metadata = {
  title: 'Calendar View | WanderPlan',
  description: 'View your trip events in a calendar',
};

interface CalendarPageProps {
  params: {
    tripId: string;
  };
}

export default function CalendarPage({ params }: CalendarPageProps) {
  const { tripId } = params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar View</h1>
        <p className="text-gray-600">
          View your trip events in a monthly, weekly, or daily calendar. Drag events to
          reschedule or click to edit.
        </p>
      </div>

      {/* Calendar Component */}
      <TripCalendar
        tripId={tripId}
        canEdit={true} // TODO: Replace with actual permission check
      />
    </div>
  );
}
