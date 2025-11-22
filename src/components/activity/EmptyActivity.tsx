/**
 * EmptyActivity Component
 *
 * Displays an empty state when a trip has no activity.
 * This is shown when there are no events, messages, or other actions in the trip yet.
 *
 * @component
 * @example
 * <EmptyActivity />
 */

'use client';

import { Activity } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export function EmptyActivity() {
  return (
    <EmptyState
      icon={Activity}
      title="No activity yet"
      description="Activity will appear here as you and your collaborators add events, send messages, create polls, and make changes to the trip."
    />
  );
}

/**
 * EmptyActivityFiltered Component
 *
 * Displays when no activity matches the current filter.
 */
export function EmptyActivityFiltered() {
  return (
    <EmptyState
      icon={Activity}
      title="No activity found"
      description="Try adjusting your filters to see more activity."
    />
  );
}
