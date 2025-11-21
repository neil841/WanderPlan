/**
 * Trip Permissions API
 *
 * GET /api/trips/[tripId]/permissions - Get user's permissions for a trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getTripPermissionContext,
  canView,
  canEdit,
  canDelete,
  canAdmin,
  canManageCollaborators,
  canPostMessage,
  canCreateIdea,
  canCreatePoll,
  canVoteOnPoll,
} from '@/lib/permissions/check';

/**
 * GET /api/trips/[tripId]/permissions
 * Get user's permissions for a trip
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // Authentication required
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tripId } = params;

    // Get permission context
    const context = await getTripPermissionContext(session.user.id, tripId);

    if (!context) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Check all permissions
    const permissions = {
      canView: canView(context),
      canEdit: canEdit(context),
      canDelete: canDelete(context),
      canAdmin: canAdmin(context),
      canManageCollaborators: canManageCollaborators(context),
      canPostMessage: canPostMessage(context),
      canCreateIdea: canCreateIdea(context),
      canCreatePoll: canCreatePoll(context),
      canVoteOnPoll: canVoteOnPoll(context),
    };

    return NextResponse.json({
      success: true,
      permissions: {
        userId: context.userId,
        tripId: context.tripId,
        isOwner: context.isOwner,
        role: context.role,
        status: context.status,
        permissions,
      },
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
