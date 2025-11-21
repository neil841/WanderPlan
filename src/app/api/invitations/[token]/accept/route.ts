/**
 * Invitation Accept API
 *
 * POST /api/invitations/[token]/accept - Accept invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { ActivityActionType } from '@prisma/client';

/**
 * POST /api/invitations/[token]/accept
 * Accept a trip invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Authentication required
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to accept this invitation.' },
        { status: 401 }
      );
    }

    const { token } = params;

    // Find the invitation
    const invitation = await prisma.tripCollaborator.findUnique({
      where: { id: token },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            createdBy: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Verify the invitation is for the logged-in user
    if (invitation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'This invitation is not for your account' },
        { status: 403 }
      );
    }

    // Check if already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        {
          error: 'This invitation has already been accepted',
          tripId: invitation.tripId,
        },
        { status: 400 }
      );
    }

    // Check if declined (allow re-acceptance)
    if (invitation.status === 'DECLINED') {
      // Allow re-acceptance, but log it
      console.log(`User ${session.user.id} is re-accepting a previously declined invitation ${token}`);
    }

    // Update invitation status to ACCEPTED
    const updatedInvitation = await prisma.tripCollaborator.update({
      where: { id: token },
      data: {
        status: 'ACCEPTED',
        joinedAt: new Date(),
      },
      include: {
        trip: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Log activity: COLLABORATOR_ADDED
    await prisma.activity.create({
      data: {
        tripId: invitation.tripId,
        userId: session.user.id,
        actionType: ActivityActionType.COLLABORATOR_ADDED,
        actionData: {
          collaboratorId: invitation.userId,
          collaboratorName: `${invitation.user.firstName} ${invitation.user.lastName}`,
          collaboratorEmail: invitation.user.email,
          role: invitation.role,
          acceptedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      invitation: updatedInvitation,
      tripId: invitation.tripId,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
