/**
 * Collaborator Types
 *
 * Type definitions for trip collaborators, invitations, and permissions.
 */

import { CollaboratorRole, CollaboratorStatus } from '@prisma/client';

/**
 * Collaborator with user details
 */
export interface Collaborator {
  id: string;
  tripId: string;
  userId: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  invitedBy: string;
  invitedAt: Date;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  inviter: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Collaborator invitation request
 */
export interface InviteCollaboratorRequest {
  email: string;
  role: CollaboratorRole;
  message?: string;
}

/**
 * Collaborator role update request
 */
export interface UpdateCollaboratorRoleRequest {
  role: CollaboratorRole;
}

/**
 * Collaborator invitation response
 */
export interface InvitationResponse {
  id: string;
  action: 'accept' | 'decline';
}

/**
 * Permission check helpers
 */
export type Permission =
  | 'view_trip'
  | 'edit_trip'
  | 'delete_trip'
  | 'manage_collaborators'
  | 'change_admin_role'
  | 'create_events'
  | 'edit_events'
  | 'delete_events'
  | 'manage_budget'
  | 'manage_documents'
  | 'send_messages';

/**
 * Role permissions map
 */
export const ROLE_PERMISSIONS: Record<
  CollaboratorRole,
  Permission[]
> = {
  VIEWER: ['view_trip'],
  EDITOR: [
    'view_trip',
    'edit_trip',
    'create_events',
    'edit_events',
    'send_messages',
  ],
  ADMIN: [
    'view_trip',
    'edit_trip',
    'delete_trip',
    'manage_collaborators',
    'create_events',
    'edit_events',
    'delete_events',
    'manage_budget',
    'manage_documents',
    'send_messages',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: CollaboratorRole | 'OWNER',
  permission: Permission
): boolean {
  if (role === 'OWNER') {
    return true; // Owner has all permissions
  }

  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if user can manage a specific role
 * Only ADMIN and OWNER can manage roles
 * Only OWNER can change ADMIN roles
 */
export function canManageRole(
  userRole: CollaboratorRole | 'OWNER',
  targetRole: CollaboratorRole
): boolean {
  if (userRole === 'OWNER') {
    return true; // Owner can manage all roles
  }

  if (userRole === 'ADMIN') {
    return targetRole !== 'ADMIN'; // Admin cannot manage other admins
  }

  return false; // Editors and viewers cannot manage roles
}

/**
 * Get displayable role name
 */
export function getRoleDisplayName(role: CollaboratorRole | 'OWNER'): string {
  const roleNames: Record<CollaboratorRole | 'OWNER', string> = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    EDITOR: 'Editor',
    VIEWER: 'Viewer',
  };

  return roleNames[role];
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: CollaboratorRole | 'OWNER'): string {
  const roleColors: Record<CollaboratorRole | 'OWNER', string> = {
    OWNER: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
    ADMIN: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    EDITOR: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    VIEWER: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
  };

  return roleColors[role];
}
