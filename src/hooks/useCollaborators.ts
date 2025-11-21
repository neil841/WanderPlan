/**
 * Collaborators Data Hook
 *
 * Custom hook for fetching and managing trip collaborators.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Collaborator, InviteCollaboratorRequest, UpdateCollaboratorRoleRequest } from '@/types/collaborator';
import { CollaboratorRole } from '@prisma/client';

interface CollaboratorsResponse {
  collaborators: Collaborator[];
  owner: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  totalCount: number;
  pendingCount: number;
  acceptedCount: number;
}

/**
 * Fetch collaborators for a trip
 */
async function fetchCollaborators(
  tripId: string,
  status?: 'pending' | 'accepted' | 'declined'
): Promise<CollaboratorsResponse> {
  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(
    `/api/trips/${tripId}/collaborators?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch collaborators');
  }

  return response.json();
}

/**
 * Invite a collaborator
 */
async function inviteCollaborator(
  tripId: string,
  data: InviteCollaboratorRequest
): Promise<{ collaborator: Collaborator; message: string }> {
  const response = await fetch(`/api/trips/${tripId}/collaborators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to invite collaborator');
  }

  return response.json();
}

/**
 * Update collaborator role
 */
async function updateCollaboratorRole(
  tripId: string,
  collaboratorId: string,
  data: UpdateCollaboratorRoleRequest
): Promise<{ collaborator: Collaborator; message: string }> {
  const response = await fetch(
    `/api/trips/${tripId}/collaborators/${collaboratorId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update collaborator role');
  }

  return response.json();
}

/**
 * Remove collaborator
 */
async function removeCollaborator(
  tripId: string,
  collaboratorId: string
): Promise<{ message: string }> {
  const response = await fetch(
    `/api/trips/${tripId}/collaborators/${collaboratorId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove collaborator');
  }

  return response.json();
}

/**
 * Hook to fetch collaborators
 */
export function useCollaborators(
  tripId: string,
  status?: 'pending' | 'accepted' | 'declined'
) {
  return useQuery({
    queryKey: ['collaborators', tripId, status],
    queryFn: () => fetchCollaborators(tripId, status),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to invite a collaborator
 */
export function useInviteCollaborator(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteCollaboratorRequest) =>
      inviteCollaborator(tripId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', tripId] });
      toast.success(result.message || 'Invitation sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to update collaborator role
 */
export function useUpdateCollaboratorRole(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collaboratorId,
      role,
    }: {
      collaboratorId: string;
      role: CollaboratorRole;
    }) => updateCollaboratorRole(tripId, collaboratorId, { role }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', tripId] });
      toast.success(result.message || 'Role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to remove a collaborator
 */
export function useRemoveCollaborator(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collaboratorId: string) =>
      removeCollaborator(tripId, collaboratorId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', tripId] });
      toast.success(result.message || 'Collaborator removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
