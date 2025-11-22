/**
 * Loading state for CRM clients page
 * Shows skeleton loaders for client list
 */

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Skeleton className="h-10 flex-1 min-w-[300px] rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

                {/* Details */}
                <div className="flex-1 space-y-3">
                  {/* Name */}
                  <Skeleton className="h-5 w-3/4" />

                  {/* Email */}
                  <Skeleton className="h-4 w-full" />

                  {/* Company */}
                  <Skeleton className="h-4 w-2/3" />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 pt-2">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </div>
  );
}
