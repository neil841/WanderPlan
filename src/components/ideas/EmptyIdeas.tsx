/**
 * EmptyIdeas Component
 *
 * Displays an empty state when a trip has no ideas/suggestions.
 * Includes a call-to-action to add the first idea.
 *
 * @component
 * @example
 * <EmptyIdeas onAddIdea={() => setShowIdeaDialog(true)} />
 */

'use client';

import { Lightbulb } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyIdeasProps {
  onAddIdea?: () => void;
}

export function EmptyIdeas({ onAddIdea }: EmptyIdeasProps) {
  return (
    <EmptyState
      icon={Lightbulb}
      title="No ideas yet"
      description="Share suggestions for activities, restaurants, or places to visit. Collaborators can vote on ideas to help decide."
      action={
        onAddIdea
          ? {
              label: 'Add First Idea',
              onClick: onAddIdea,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyIdeasFiltered Component
 *
 * Displays when no ideas match the current filter.
 */
export function EmptyIdeasFiltered() {
  return (
    <EmptyState
      icon={Lightbulb}
      title="No ideas found"
      description="Try adjusting your filters to see more ideas."
    />
  );
}
