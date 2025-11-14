/**
 * Permission Checking Utilities
 *
 * Functions to check if a user has permission to perform actions on trips
 */

import { CollaboratorRole, CollaboratorStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

/**
 * Permission context for a user on a trip
 */
export interface TripPermissionContext {
  userId: string;
  tripId: string;
  isOwner: boolean;
  role: CollaboratorRole | null;
  status: CollaboratorStatus | null;
}

/**
 * Get permission context for a user on a trip
 */
export async function getTripPermissionContext(
  userId: string,
  tripId: string
): Promise<TripPermissionContext | null> {
  // Get trip with user's collaborator status
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      deletedAt: null,
    },
    select: {
      id: true,
      createdBy: true,
      collaborators: {
        where: {
          userId,
        },
        select: {
          role: true,
          status: true,
        },
        take: 1,
      },
    },
  });

  if (!trip) {
    return null;
  }

  const isOwner = trip.createdBy === userId;
  const collaborator = trip.collaborators[0];

  return {
    userId,
    tripId,
    isOwner,
    role: collaborator?.role || null,
    status: collaborator?.status || null,
  };
}

/**
 * Check if user has access to view the trip
 */
export function canView(context: TripPermissionContext): boolean {
  // Owner can always view
  if (context.isOwner) {
    return true;
  }

  // Accepted collaborators can view
  if (context.status === 'ACCEPTED') {
    return true;
  }

  // No access
  return false;
}

/**
 * Check if user can edit trip details, events, expenses
 */
export function canEdit(context: TripPermissionContext): boolean {
  // Owner can always edit
  if (context.isOwner) {
    return true;
  }

  // EDITOR or ADMIN collaborators can edit
  if (context.status === 'ACCEPTED' && (context.role === 'EDITOR' || context.role === 'ADMIN')) {
    return true;
  }

  // No edit access
  return false;
}

/**
 * Check if user can delete items (events, expenses, documents)
 */
export function canDelete(context: TripPermissionContext): boolean {
  // Owner can always delete
  if (context.isOwner) {
    return true;
  }

  // Only ADMIN collaborators can delete
  if (context.status === 'ACCEPTED' && context.role === 'ADMIN') {
    return true;
  }

  // No delete access
  return false;
}

/**
 * Check if user can manage collaborators (invite, remove, change roles)
 */
export function canManageCollaborators(context: TripPermissionContext): boolean {
  // Owner can always manage collaborators
  if (context.isOwner) {
    return true;
  }

  // Only ADMIN collaborators can manage collaborators
  if (context.status === 'ACCEPTED' && context.role === 'ADMIN') {
    return true;
  }

  // No collaborator management access
  return false;
}

/**
 * Check if user has admin privileges (delete trip, change settings)
 */
export function canAdmin(context: TripPermissionContext): boolean {
  // Only the owner has full admin privileges
  return context.isOwner;
}

/**
 * Check if user can post messages
 */
export function canPostMessage(context: TripPermissionContext): boolean {
  // Owner can always post
  if (context.isOwner) {
    return true;
  }

  // EDITOR or ADMIN collaborators can post
  if (context.status === 'ACCEPTED' && (context.role === 'EDITOR' || context.role === 'ADMIN')) {
    return true;
  }

  // VIEWER collaborators cannot post
  return false;
}

/**
 * Check if user can create ideas
 */
export function canCreateIdea(context: TripPermissionContext): boolean {
  // Owner can always create ideas
  if (context.isOwner) {
    return true;
  }

  // All accepted collaborators can create ideas
  if (context.status === 'ACCEPTED') {
    return true;
  }

  return false;
}

/**
 * Check if user can vote on polls
 */
export function canVoteOnPoll(context: TripPermissionContext): boolean {
  // Owner can always vote
  if (context.isOwner) {
    return true;
  }

  // All accepted collaborators can vote
  if (context.status === 'ACCEPTED') {
    return true;
  }

  return false;
}

/**
 * Check if user can create polls
 */
export function canCreatePoll(context: TripPermissionContext): boolean {
  // Owner can always create polls
  if (context.isOwner) {
    return true;
  }

  // EDITOR or ADMIN collaborators can create polls
  if (context.status === 'ACCEPTED' && (context.role === 'EDITOR' || context.role === 'ADMIN')) {
    return true;
  }

  return false;
}

/**
 * Get permission error message
 */
export function getPermissionErrorMessage(action: string): string {
  const messages: Record<string, string> = {
    view: 'You do not have permission to view this trip',
    edit: 'You need EDITOR or ADMIN role to edit this trip',
    delete: 'You need ADMIN role or be the trip owner to delete items',
    admin: 'Only the trip owner can perform this action',
    collaborators: 'You need ADMIN role to manage collaborators',
    message: 'You need EDITOR or ADMIN role to post messages',
    idea: 'You need to be a collaborator to create ideas',
    poll: 'You need EDITOR or ADMIN role to create polls',
    vote: 'You need to be a collaborator to vote on polls',
  };

  return messages[action] || 'You do not have permission to perform this action';
}

/**
 * Middleware helper: Check permissions and throw error if insufficient
 */
export async function requirePermission(
  userId: string,
  tripId: string,
  action: 'view' | 'edit' | 'delete' | 'admin' | 'collaborators'
): Promise<TripPermissionContext> {
  const context = await getTripPermissionContext(userId, tripId);

  if (!context) {
    throw new Error('Trip not found');
  }

  let hasPermission = false;

  switch (action) {
    case 'view':
      hasPermission = canView(context);
      break;
    case 'edit':
      hasPermission = canEdit(context);
      break;
    case 'delete':
      hasPermission = canDelete(context);
      break;
    case 'admin':
      hasPermission = canAdmin(context);
      break;
    case 'collaborators':
      hasPermission = canManageCollaborators(context);
      break;
  }

  if (!hasPermission) {
    throw new Error(getPermissionErrorMessage(action));
  }

  return context;
}
