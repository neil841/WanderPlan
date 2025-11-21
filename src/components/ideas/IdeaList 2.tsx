/**
 * IdeaList Component
 *
 * Displays a list of ideas with filtering and sorting
 */

'use client';

import { IdeaCard } from './IdeaCard';
import { Loader2, Lightbulb } from 'lucide-react';
import type { IdeaWithVotes, IdeaStatus } from '@/types/idea';

interface IdeaListProps {
  ideas: IdeaWithVotes[];
  currentUserId: string;
  userRole: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  isLoading?: boolean;
  onVote: (ideaId: string, vote: number) => void;
  onEdit?: (idea: IdeaWithVotes) => void;
  onDelete?: (ideaId: string) => void;
  onAccept?: (ideaId: string) => void;
  onReject?: (ideaId: string) => void;
  sortBy?: 'recent' | 'votes';
}

export function IdeaList({
  ideas,
  currentUserId,
  userRole,
  isLoading,
  onVote,
  onEdit,
  onDelete,
  onAccept,
  onReject,
  sortBy = 'recent',
}: IdeaListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Lightbulb className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Be the first to share your suggestions for the trip. Click "Add Idea" to get started!
        </p>
      </div>
    );
  }

  // Sort ideas
  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sortBy === 'votes') {
      return b.voteCount - a.voteCount;
    }
    // Default: recent first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedIdeas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          currentUserId={currentUserId}
          userRole={userRole}
          onVote={onVote}
          onEdit={onEdit}
          onDelete={onDelete}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
