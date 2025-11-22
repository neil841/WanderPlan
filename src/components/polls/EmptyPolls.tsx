/**
 * EmptyPolls Component
 *
 * Displays an empty state when a trip has no polls.
 * Includes a call-to-action to create the first poll.
 *
 * @component
 * @example
 * <EmptyPolls onCreatePoll={() => setShowPollDialog(true)} />
 */

'use client';

import { BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyPollsProps {
  onCreatePoll?: () => void;
}

export function EmptyPolls({ onCreatePoll }: EmptyPollsProps) {
  return (
    <EmptyState
      icon={BarChart3}
      title="No polls yet"
      description="Create polls to make group decisions about dates, activities, restaurants, and more. Everyone can vote on their preferences."
      action={
        onCreatePoll
          ? {
              label: 'Create First Poll',
              onClick: onCreatePoll,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyActivePolls Component
 *
 * Displays when there are no active polls.
 */
export function EmptyActivePolls() {
  return (
    <EmptyState
      icon={BarChart3}
      title="No active polls"
      description="All polls have been closed. You can view closed polls in the archive."
    />
  );
}
