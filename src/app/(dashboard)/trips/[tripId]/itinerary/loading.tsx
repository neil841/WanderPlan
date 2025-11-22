/**
 * Loading state for itinerary page
 * Shows skeleton loaders for day columns and events
 */

import { EventCardSkeleton } from '@/components/itinerary/EventCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ItineraryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Day Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, dayIndex) => (
          <Card key={dayIndex} className="h-fit">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Event Card Skeletons */}
              {Array.from({ length: 3 }).map((_, eventIndex) => (
                <EventCardSkeleton key={eventIndex} />
              ))}

              {/* Add Event Button Skeleton */}
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unscheduled Events Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
