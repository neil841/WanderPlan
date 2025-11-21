/**
 * Invitation Decline API
 *
 * POST /api/invitations/[token]/decline - Decline invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

/**
 * POST /api/invitations/[token]/decline
 * Decline a trip invitation
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
        { error: 'Unauthorized. Please log in to decline this invitation.' },
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
          error: 'Cannot decline an invitation that has already been accepted. Please leave the trip from your trip dashboard.',
        },
        { status: 400 }
      );
    }

    // Check if already declined
    if (invitation.status === 'DECLINED') {
      return NextResponse.json(
        { error: 'This invitation has already been declined' },
        { status: 400 }
      );
    }

    // Update invitation status to DECLINED
    const updatedInvitation = await prisma.tripCollaborator.update({
      where: { id: token },
      data: {
        status: 'DECLINED',
      },
      include: {
        trip: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Note: We keep the declined invitation in the database for audit purposes
    // The inviter can re-invite if needed

    return NextResponse.json({
      success: true,
      message: 'Invitation declined',
      invitation: updatedInvitation,
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
}
