/**
 * Invitation Details API
 *
 * GET /api/invitations/[token] - View invitation details
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/invitations/[token]
 * Get invitation details by token (TripCollaborator ID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find the invitation (TripCollaborator record)
    const invitation = await prisma.tripCollaborator.findUnique({
      where: { id: token },
      select: {
        id: true,
        role: true,
        status: true,
        invitedAt: true,
        trip: {
          select: {
            id: true,
            name: true,
            description: true,
            destinations: true,
            startDate: true,
            endDate: true,
            coverImageUrl: true,
            visibility: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        inviter: {
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

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check invitation status
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        {
          error: 'This invitation has already been accepted',
          code: 'ALREADY_ACCEPTED',
          invitation,
        },
        { status: 400 }
      );
    }

    if (invitation.status === 'DECLINED') {
      return NextResponse.json(
        {
          error: 'This invitation has been declined',
          code: 'ALREADY_DECLINED',
          invitation,
        },
        { status: 400 }
      );
    }

    // Return invitation details (status is PENDING)
    return NextResponse.json({
      success: true,
      invitation,
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation details' },
      { status: 500 }
    );
  }
}
