/**
 * Loading state for trips list page
 * Shows skeleton loaders for trip cards
 */

import { TripCardSkeleton } from '@/components/trips/TripCard';

export default function TripsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
        <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
        <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
      </div>

      {/* Trip Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <TripCardSkeleton key={index} viewMode="grid" />
        ))}
      </div>
    </div>
  );
}
