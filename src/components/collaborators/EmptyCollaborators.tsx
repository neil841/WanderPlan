/**
 * EmptyCollaborators Component
 *
 * Displays an empty state when a trip has no collaborators.
 * Includes a call-to-action to invite the first collaborator.
 *
 * @component
 * @example
 * <EmptyCollaborators onInvite={() => setShowInviteDialog(true)} />
 */

'use client';

import { Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyCollaboratorsProps {
  onInvite?: () => void;
}

export function EmptyCollaborators({ onInvite }: EmptyCollaboratorsProps) {
  return (
    <EmptyState
      icon={Users}
      title="No collaborators yet"
      description="Invite friends, family, or clients to collaborate on this trip. They can help plan, view itineraries, and manage expenses."
      action={
        onInvite
          ? {
              label: 'Invite Collaborator',
              onClick: onInvite,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyPendingInvitations Component
 *
 * Displays when there are no pending invitations.
 */
export function EmptyPendingInvitations() {
  return (
    <EmptyState
      icon={Users}
      title="No pending invitations"
      description="All your invitations have been accepted or declined."
    />
  );
}
