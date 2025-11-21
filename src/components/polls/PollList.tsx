/**
 * PollList Component
 *
 * List of polls with filtering
 */

'use client';

import { PollCard } from './PollCard';
import type { PollWithResults } from '@/types/poll';
import { Loader2 } from 'lucide-react';

interface PollListProps {
  polls: PollWithResults[];
  currentUserId: string;
  userRole: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  isLoading?: boolean;
  onVote: (pollId: string, optionIds: string[]) => void;
  onClose: (pollId: string) => void;
  onReopen: (pollId: string) => void;
  onDelete: (pollId: string) => void;
}

export function PollList({
  polls,
  currentUserId,
  userRole,
  isLoading,
  onVote,
  onClose,
  onReopen,
  onDelete,
}: PollListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-muted-foreground">No polls yet</p>
        <p className="text-sm text-muted-foreground">
          Create a poll to gather opinions from your trip collaborators
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
          currentUserId={currentUserId}
          userRole={userRole}
          onVote={onVote}
          onClose={onClose}
          onReopen={onReopen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
