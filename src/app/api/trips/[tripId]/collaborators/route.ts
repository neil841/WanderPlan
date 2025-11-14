/**
 * Trip Collaborators API Endpoints
 *
 * Handles collaborator invitations and management.
 *
 * @route POST /api/trips/[tripId]/collaborators - Invite collaborator
 * @route GET /api/trips/[tripId]/collaborators - List collaborators
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { CollaboratorRole } from '@prisma/client';
import { sendCollaboratorInvitation } from '@/lib/email/send-invitation';

/**
 * Invite Collaborator Schema
 */
const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']),
  message: z.string().max(500).optional(),
});

/**
 * POST /api/trips/[tripId]/collaborators
 * Invite a collaborator to the trip
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tripId } = params;

    // Parse and validate request body
    const body = await request.json();
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, role, message } = validation.data;

    // Check if user has permission to invite collaborators (only owner or admin)
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
        OR: [
          { createdBy: session.user.id }, // Owner
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: 'ADMIN',
                status: 'ACCEPTED',
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        createdBy: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    const isOwner = trip.createdBy === session.user.id;

    // Only owner can invite admins
    if (role === 'ADMIN' && !isOwner) {
      return NextResponse.json(
        { error: 'Only the trip owner can invite administrators' },
        { status: 403 }
      );
    }

    // Find user by email
    const inviteeUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!inviteeUser) {
      return NextResponse.json(
        { error: 'User not found', details: 'No user exists with this email address. They need to create an account first.' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (inviteeUser.id === trip.createdBy) {
      return NextResponse.json(
        { error: 'Cannot invite the trip owner as a collaborator' },
        { status: 400 }
      );
    }

    // Check if already a collaborator
    const existingCollaborator = await prisma.tripCollaborator.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: inviteeUser.id,
        },
      },
    });

    if (existingCollaborator) {
      if (existingCollaborator.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'User is already a collaborator on this trip' },
          { status: 400 }
        );
      }

      if (existingCollaborator.status === 'PENDING') {
        return NextResponse.json(
          { error: 'An invitation has already been sent to this user' },
          { status: 400 }
        );
      }

      // If status is DECLINED, allow re-invitation
      if (existingCollaborator.status === 'DECLINED') {
        // Update existing collaborator
        const updatedCollaborator = await prisma.tripCollaborator.update({
          where: { id: existingCollaborator.id },
          data: {
            role,
            status: 'PENDING',
            invitedBy: session.user.id,
            invitedAt: new Date(),
            joinedAt: null,
          },
          include: {
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
              },
            },
          },
        });

        // Send invitation email
        await sendCollaboratorInvitation({
          to: inviteeUser.email,
          inviterName: `${session.user.firstName} ${session.user.lastName}`,
          tripTitle: trip.title,
          role,
          message,
          invitationId: updatedCollaborator.id,
        });

        return NextResponse.json({
          collaborator: updatedCollaborator,
          message: 'Invitation re-sent successfully',
        }, { status: 200 });
      }
    }

    // Create new collaborator invitation
    const collaborator = await prisma.tripCollaborator.create({
      data: {
        tripId,
        userId: inviteeUser.id,
        role,
        status: 'PENDING',
        invitedBy: session.user.id,
      },
      include: {
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
          },
        },
      },
    });

    // Send invitation email
    await sendCollaboratorInvitation({
      to: inviteeUser.email,
      inviterName: `${session.user.firstName} ${session.user.lastName}`,
      tripTitle: trip.title,
      role,
      message,
      invitationId: collaborator.id,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        tripId,
        userId: session.user.id,
        type: 'COLLABORATOR_INVITED',
        description: `Invited ${inviteeUser.firstName} ${inviteeUser.lastName} as ${role.toLowerCase()}`,
        metadata: {
          collaboratorId: collaborator.id,
          inviteeEmail: inviteeUser.email,
          role,
        },
      },
    });

    return NextResponse.json({
      collaborator,
      message: 'Invitation sent successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to invite collaborator' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[tripId]/collaborators
 * Get all collaborators for a trip
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tripId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, accepted, declined

    // Verify trip access
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
        OR: [
          { createdBy: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                status: 'ACCEPTED',
              },
            },
          },
        ],
      },
      select: {
        id: true,
        createdBy: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Build query filter
    const statusFilter = status
      ? { status: status.toUpperCase() as 'PENDING' | 'ACCEPTED' | 'DECLINED' }
      : {};

    // Get collaborators
    const collaborators = await prisma.tripCollaborator.findMany({
      where: {
        tripId,
        ...statusFilter,
      },
      include: {
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
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // ACCEPTED first, then PENDING, then DECLINED
        { role: 'desc' }, // ADMIN first, then EDITOR, then VIEWER
        { invitedAt: 'desc' },
      ],
    });

    // Get owner information
    const owner = await prisma.user.findUnique({
      where: { id: trip.createdBy },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      collaborators,
      owner,
      totalCount: collaborators.length,
      pendingCount: collaborators.filter(c => c.status === 'PENDING').length,
      acceptedCount: collaborators.filter(c => c.status === 'ACCEPTED').length,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaborators' },
      { status: 500 }
    );
  }
}
