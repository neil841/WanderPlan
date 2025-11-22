/**
 * Loading state for activity feed page
 * Shows skeleton loaders for activity items
 */

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* Activity Timeline */}
      <div className="space-y-8">
        {/* Day Group */}
        {Array.from({ length: 3 }).map((_, dayIndex) => (
          <div key={dayIndex} className="space-y-4">
            {/* Date Header */}
            <Skeleton className="h-5 w-32" />

            {/* Activity Items */}
            <div className="space-y-4 ml-4 border-l-2 border-neutral-200 dark:border-neutral-700 pl-6">
              {Array.from({ length: 4 }).map((_, itemIndex) => (
                <div key={itemIndex} className="relative">
                  {/* Timeline Dot */}
                  <Skeleton className="absolute -left-[29px] top-2 h-3 w-3 rounded-full" />

                  {/* Activity Card */}
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-3 w-16" />
                        </div>

                        {/* Details */}
                        {itemIndex % 2 === 0 && (
                          <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5 mt-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="mt-8 flex justify-center">
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}
