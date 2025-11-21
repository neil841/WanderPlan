/**
 * Itinerary Page
 *
 * Day-by-day itinerary builder with drag-and-drop functionality.
 * Main page for viewing and organizing trip events.
 *
 * @page
 * @route /trips/[tripId]/itinerary
 * @access Protected - Must be trip owner or collaborator
 */

import { Metadata } from 'next';
import { ItineraryBuilder } from '@/components/itinerary/ItineraryBuilder';

export const metadata: Metadata = {
  title: 'Itinerary | WanderPlan',
  description: 'Organize your trip events day by day',
};

interface ItineraryPageProps {
  params: {
    tripId: string;
  };
}

export default function ItineraryPage({ params }: ItineraryPageProps) {
  const { tripId } = params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Itinerary Builder
        </h1>
        <p className="text-gray-600">
          Organize your trip events day by day. Drag and drop to reorder or
          reschedule events.
        </p>
      </div>

      {/* Itinerary builder */}
      <ItineraryBuilder tripId={tripId} />
    </div>
  );
}
