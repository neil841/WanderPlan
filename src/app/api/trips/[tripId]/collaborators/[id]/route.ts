/**
 * Individual Trip Collaborator API Endpoints
 *
 * Handles individual collaborator operations (update role, remove).
 *
 * @route PATCH /api/trips/[tripId]/collaborators/[id] - Update collaborator role
 * @route DELETE /api/trips/[tripId]/collaborators/[id] - Remove collaborator
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { CollaboratorRole } from '@prisma/client';

/**
 * Update Role Schema
 */
const updateRoleSchema = z.object({
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']),
});

/**
 * PATCH /api/trips/[tripId]/collaborators/[id]
 * Update collaborator role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
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

    const { tripId, id: collaboratorId } = params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { role: newRole } = validation.data;

    // Get trip and check permissions
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        createdBy: true,
        collaborators: {
          where: {
            userId: session.user.id,
            status: 'ACCEPTED',
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const isOwner = trip.createdBy === session.user.id;
    const userRole = isOwner ? 'ADMIN' : trip.collaborators[0]?.role;

    // Check if user has permission to change roles
    if (!isOwner && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins and owners can change collaborator roles' },
        { status: 403 }
      );
    }

    // Get the collaborator being updated
    const collaborator = await prisma.tripCollaborator.findUnique({
      where: { id: collaboratorId },
      include: {
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

    if (!collaborator || collaborator.tripId !== tripId) {
      return NextResponse.json(
        { error: 'Collaborator not found' },
        { status: 404 }
      );
    }

    // Only owner can change admin roles
    if ((collaborator.role === 'ADMIN' || newRole === 'ADMIN') && !isOwner) {
      return NextResponse.json(
        { error: 'Only the trip owner can manage administrator roles' },
        { status: 403 }
      );
    }

    // Cannot change your own role
    if (collaborator.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    // Update collaborator role
    const updatedCollaborator = await prisma.tripCollaborator.update({
      where: { id: collaboratorId },
      data: {
        role: newRole,
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

    // Log activity
    await prisma.activity.create({
      data: {
        tripId,
        userId: session.user.id,
        actionType: 'COLLABORATOR_ROLE_CHANGED',
        actionData: {
          collaboratorId,
          collaboratorName: `${collaborator.user.firstName} ${collaborator.user.lastName}`,
          oldRole: collaborator.role,
          newRole,
        },
      },
    });

    return NextResponse.json({
      collaborator: updatedCollaborator,
      message: 'Collaborator role updated successfully',
    });
  } catch (error) {
    console.error('Error updating collaborator role:', error);
    return NextResponse.json(
      { error: 'Failed to update collaborator role' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[tripId]/collaborators/[id]
 * Remove collaborator from trip
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
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

    const { tripId, id: collaboratorId } = params;

    // Get trip and check permissions
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        createdBy: true,
        collaborators: {
          where: {
            userId: session.user.id,
            status: 'ACCEPTED',
          },
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const isOwner = trip.createdBy === session.user.id;
    const userCollaborator = trip.collaborators[0];
    const userRole = isOwner ? 'ADMIN' : userCollaborator?.role;

    // Get the collaborator being removed
    const collaborator = await prisma.tripCollaborator.findUnique({
      where: { id: collaboratorId },
      include: {
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

    if (!collaborator || collaborator.tripId !== tripId) {
      return NextResponse.json(
        { error: 'Collaborator not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isSelfRemoval = collaborator.userId === session.user.id;

    if (!isSelfRemoval) {
      // If not removing yourself, must be admin or owner
      if (!isOwner && userRole !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Only admins and owners can remove collaborators' },
          { status: 403 }
        );
      }

      // Only owner can remove admins
      if (collaborator.role === 'ADMIN' && !isOwner) {
        return NextResponse.json(
          { error: 'Only the trip owner can remove administrators' },
          { status: 403 }
        );
      }
    }

    // Delete collaborator
    await prisma.tripCollaborator.delete({
      where: { id: collaboratorId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        tripId,
        userId: session.user.id,
        actionType: isSelfRemoval ? 'COLLABORATOR_LEFT' : 'COLLABORATOR_REMOVED',
        actionData: {
          collaboratorId,
          collaboratorName: `${collaborator.user.firstName} ${collaborator.user.lastName}`,
          role: collaborator.role,
          isSelfRemoval,
        },
      },
    });

    return NextResponse.json({
      message: isSelfRemoval
        ? 'You have left the trip successfully'
        : 'Collaborator removed successfully',
    });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to remove collaborator' },
      { status: 500 }
    );
  }
}
