/**
 * Permission Middleware for API Routes
 *
 * Utility functions to check permissions in API route handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import {
  requirePermission,
  getTripPermissionContext,
  TripPermissionContext,
} from '@/lib/permissions/check';

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  allowed: boolean;
  context?: TripPermissionContext;
  error?: NextResponse;
}

/**
 * Middleware: Require view permission
 */
export async function requireViewPermission(
  session: Session | null,
  tripId: string
): Promise<PermissionCheckResult> {
  if (!session?.user?.id) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  try {
    const context = await requirePermission(session.user.id, tripId, 'view');
    return {
      allowed: true,
      context,
    };
  } catch (error: any) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: error.message || 'Access denied' },
        { status: 403 }
      ),
    };
  }
}

/**
 * Middleware: Require edit permission
 */
export async function requireEditPermission(
  session: Session | null,
  tripId: string
): Promise<PermissionCheckResult> {
  if (!session?.user?.id) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  try {
    const context = await requirePermission(session.user.id, tripId, 'edit');
    return {
      allowed: true,
      context,
    };
  } catch (error: any) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: error.message || 'You need EDITOR or ADMIN role to perform this action' },
        { status: 403 }
      ),
    };
  }
}

/**
 * Middleware: Require delete permission
 */
export async function requireDeletePermission(
  session: Session | null,
  tripId: string
): Promise<PermissionCheckResult> {
  if (!session?.user?.id) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  try {
    const context = await requirePermission(session.user.id, tripId, 'delete');
    return {
      allowed: true,
      context,
    };
  } catch (error: any) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: error.message || 'You need ADMIN role or be the trip owner to delete items' },
        { status: 403 }
      ),
    };
  }
}

/**
 * Middleware: Require admin permission
 */
export async function requireAdminPermission(
  session: Session | null,
  tripId: string
): Promise<PermissionCheckResult> {
  if (!session?.user?.id) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  try {
    const context = await requirePermission(session.user.id, tripId, 'admin');
    return {
      allowed: true,
      context,
    };
  } catch (error: any) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: error.message || 'Only the trip owner can perform this action' },
        { status: 403 }
      ),
    };
  }
}

/**
 * Middleware: Require collaborator management permission
 */
export async function requireCollaboratorPermission(
  session: Session | null,
  tripId: string
): Promise<PermissionCheckResult> {
  if (!session?.user?.id) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  try {
    const context = await requirePermission(session.user.id, tripId, 'collaborators');
    return {
      allowed: true,
      context,
    };
  } catch (error: any) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: error.message || 'You need ADMIN role to manage collaborators' },
        { status: 403 }
      ),
    };
  }
}

/**
 * Helper: Check if user has permission without throwing
 */
export async function checkPermission(
  userId: string,
  tripId: string,
  action: 'view' | 'edit' | 'delete' | 'admin' | 'collaborators'
): Promise<boolean> {
  try {
    await requirePermission(userId, tripId, action);
    return true;
  } catch {
    return false;
  }
}

/**
 * Example usage in API route:
 *
 * import { auth } from '@/lib/auth';
 * import { requireEditPermission } from '@/middleware/permissions';
 *
 * export async function PATCH(request: NextRequest, { params }: { params: { tripId: string } }) {
 *   const session = await auth();
 *   const permissionCheck = await requireEditPermission(session, params.tripId);
 *
 *   if (!permissionCheck.allowed) {
 *     return permissionCheck.error;
 *   }
 *
 *   // User has edit permission, proceed with operation
 *   const context = permissionCheck.context;
 *   // ...
 * }
 */
