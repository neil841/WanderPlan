'use client';

import { useState } from 'react';
import { useTrips, Trip } from '@/hooks/useTrips';
import { TripCard, TripCardSkeleton } from './TripCard';
import { TripFilters, FilterValues } from './TripFilters';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { LayoutGrid, LayoutList, Plus, PackageOpen } from 'lucide-react';
import Link from 'next/link';

/**
 * TripList component displays a paginated, filterable list of trips
 * Supports both grid and list view modes
 */
export function TripList() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    status: 'active',
    sort: 'createdAt',
    order: 'desc',
    tags: [],
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error } = useTrips({
    page: currentPage,
    limit: 12,
    ...filters,
  });

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <TripFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableTags={[]}
        />

        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
        }>
          {Array.from({ length: 6 }).map((_, i) => (
            <TripCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <PackageOpen className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Failed to load trips</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const trips = data?.data.trips || [];
  const pagination = data?.data.pagination;

  // Extract unique tags from all trips for filter
  const allTags = trips.reduce((acc: Array<{ id: string; name: string; color: string | null }>, trip: Trip) => {
    trip.tags.forEach((tag: { id: string; name: string; color: string | null }) => {
      if (!acc.find((t: { id: string; name: string; color: string | null }) => t.id === tag.id)) {
        acc.push(tag);
      }
    });
    return acc;
  }, [] as Array<{ id: string; name: string; color: string | null }>);

  // Empty state
  if (trips.length === 0 && !filters.search && filters.tags.length === 0) {
    return (
      <div className="space-y-6">
        <TripFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableTags={allTags}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20 px-4"
        >
          <div className="text-center space-y-6 max-w-lg">
            {/* Premium Illustration Circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mx-auto"
            >
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center relative overflow-hidden">
                {/* Background gradient orb */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-xl" />

                {/* Animated plane icon */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10"
                >
                  <Plane className="w-16 h-16 text-blue-600" />
                </motion.div>
              </div>
            </motion.div>

            {/* Premium Text */}
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-gray-900">
                Start Your Next{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Adventure
                </span>
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                No trips yet! Create your first trip and start planning an unforgettable journey.
              </p>
            </div>

            {/* Premium CTA Button */}
            <Link href="/trips/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Your First Trip</span>
                </span>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // No results for current filters
  if (trips.length === 0) {
    return (
      <div className="space-y-6">
        <TripFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableTags={allTags}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className="text-center space-y-5 max-w-md">
            {/* Illustration */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200">
                <PackageOpen className="w-12 h-12 text-gray-400" />
              </div>
            </motion.div>

            {/* Text */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">No Trips Found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
            </div>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleFiltersChange({
                search: '',
                status: 'active',
                sort: 'createdAt',
                order: 'desc',
                tags: [],
              })}
              className="mt-2"
            >
              Clear Filters
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {filters.status === 'archived' ? 'Archived Trips' : 'Your Trips'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination?.total || 0} trip{pagination?.total !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}
            className="border rounded-lg p-1"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="px-3">
              <LayoutList className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Create Trip Button */}
          <Link href="/trips/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <TripFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTags={allTags}
      />

      {/* Trip Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4'
      }>
        {trips.map((trip: Trip) => (
          <TripCard key={trip.id} trip={trip} viewMode={viewMode} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pagination.hasPrevious && handlePageChange(currentPage - 1)}
                  className={!pagination.hasPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                const showEllipsisAfter = page === currentPage + 2 && currentPage < pagination.totalPages - 2;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                if (!showPage) return null;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  onClick={() => pagination.hasNext && handlePageChange(currentPage + 1)}
                  className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
