/**
 * usePermissions Hook
 *
 * React hook for checking user permissions on trips in UI components
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { CollaboratorRole, CollaboratorStatus } from '@prisma/client';

/**
 * Permission context from API
 */
export interface UserPermissions {
  userId: string;
  tripId: string;
  isOwner: boolean;
  role: CollaboratorRole | null;
  status: CollaboratorStatus | null;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAdmin: boolean;
    canManageCollaborators: boolean;
    canPostMessage: boolean;
    canCreateIdea: boolean;
    canCreatePoll: boolean;
    canVoteOnPoll: boolean;
  };
}

/**
 * Fetch user permissions for a trip
 */
async function fetchTripPermissions(tripId: string): Promise<UserPermissions> {
  const response = await fetch(`/api/trips/${tripId}/permissions`);

  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }

  const data = await response.json();
  return data.permissions;
}

/**
 * Hook to get user permissions for a trip
 */
export function usePermissions(tripId: string | undefined) {
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: ['trip-permissions', tripId],
    queryFn: () => {
      if (!tripId) {
        throw new Error('Trip ID is required');
      }
      return fetchTripPermissions(tripId);
    },
    enabled: !!session?.user?.id && !!tripId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    permissions: query.data?.permissions || null,
    isOwner: query.data?.isOwner || false,
    role: query.data?.role || null,
    status: query.data?.status || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Simple hook to check if user is trip owner
 */
export function useIsTripOwner(tripId: string | undefined) {
  const { isOwner, isLoading } = usePermissions(tripId);
  return { isOwner, isLoading };
}

/**
 * Hook to check if user can edit
 */
export function useCanEdit(tripId: string | undefined) {
  const { permissions, isLoading } = usePermissions(tripId);
  return {
    canEdit: permissions?.canEdit || false,
    isLoading,
  };
}

/**
 * Hook to check if user can delete
 */
export function useCanDelete(tripId: string | undefined) {
  const { permissions, isLoading } = usePermissions(tripId);
  return {
    canDelete: permissions?.canDelete || false,
    isLoading,
  };
}

/**
 * Hook to check if user can manage collaborators
 */
export function useCanManageCollaborators(tripId: string | undefined) {
  const { permissions, isLoading } = usePermissions(tripId);
  return {
    canManageCollaborators: permissions?.canManageCollaborators || false,
    isLoading,
  };
}
