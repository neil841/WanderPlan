/**
 * EmptyProposals Component
 *
 * Displays an empty state when there are no proposals.
 * Includes a call-to-action to create the first proposal.
 *
 * @component
 * @example
 * <EmptyProposals onCreateProposal={() => navigate('/crm/proposals/new')} />
 */

'use client';

import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyProposalsProps {
  onCreateProposal?: () => void;
}

export function EmptyProposals({ onCreateProposal }: EmptyProposalsProps) {
  return (
    <EmptyState
      icon={FileText}
      title="No proposals yet"
      description="Create professional trip proposals for your clients with detailed itineraries, pricing, and terms."
      action={
        onCreateProposal
          ? {
              label: 'Create First Proposal',
              onClick: onCreateProposal,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyProposalsFiltered Component
 *
 * Displays when no proposals match the current filter.
 */
export function EmptyProposalsFiltered() {
  return (
    <EmptyState
      icon={FileText}
      title="No proposals found"
      description="Try adjusting your filters to see more proposals."
    />
  );
}
