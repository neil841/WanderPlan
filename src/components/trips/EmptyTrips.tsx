/**
 * EmptyTrips Component
 *
 * Displays an empty state when the user has no trips.
 * Includes a call-to-action to create their first trip.
 *
 * @component
 * @example
 * <EmptyTrips onCreateTrip={() => setShowCreateDialog(true)} />
 */

'use client';

import { PackageOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyTripsProps {
  onCreateTrip?: () => void;
}

export function EmptyTrips({ onCreateTrip }: EmptyTripsProps) {
  return (
    <EmptyState
      icon={PackageOpen}
      title="No trips yet"
      description="Start planning your next adventure by creating your first trip. Add destinations, events, and invite collaborators to get started."
      action={
        onCreateTrip
          ? {
              label: 'Create Your First Trip',
              onClick: onCreateTrip,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyTripsFiltered Component
 *
 * Displays when no trips match the current filter/search.
 */
export function EmptyTripsFiltered() {
  return (
    <EmptyState
      icon={PackageOpen}
      title="No trips found"
      description="Try adjusting your filters or search terms to find what you're looking for."
    />
  );
}
