/**
 * Individual Idea API Routes
 *
 * PATCH /api/trips/[tripId]/ideas/[id] - Update an idea
 * DELETE /api/trips/[tripId]/ideas/[id] - Delete an idea
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateIdeaSchema } from '@/lib/validations/idea';
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/types/realtime';

/**
 * PATCH /api/trips/[tripId]/ideas/[id]
 *
 * Update an idea (title/description by author, status by owner/admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, id: ideaId } = params;
    const body = await request.json();

    // Validate request body
    const validation = updateIdeaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { title, description, status } = validation.data;

    // Get trip and check user's role
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
      },
      include: {
        collaborators: {
          where: {
            userId: session.user.id,
            status: 'ACCEPTED',
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
    const collaborator = trip.collaborators[0];
    const isAdmin = collaborator?.role === 'ADMIN';
    const hasAccess = isOwner || !!collaborator;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Find the idea
    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        tripId,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check permissions:
    // - Author can update title/description
    // - Owner/Admin can update status
    const isAuthor = idea.createdBy === session.user.id;

    if (status !== undefined && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Only trip owner or admin can change idea status' },
        { status: 403 }
      );
    }

    if ((title !== undefined || description !== undefined) && !isAuthor && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Only idea author, owner, or admin can edit idea content' },
        { status: 403 }
      );
    }

    // Update the idea
    const updatedIdea = await prisma.idea.update({
      where: { id: ideaId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        votes: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    // Broadcast update to trip room
    broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
      ideaId: updatedIdea.id,
      title: updatedIdea.title,
      status: updatedIdea.status,
      tripId,
    });

    return NextResponse.json(
      {
        idea: updatedIdea,
        message: 'Idea updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[tripId]/ideas/[id]
 *
 * Delete an idea (author, owner, or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, id: ideaId } = params;

    // Get trip and check user's role
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
      },
      include: {
        collaborators: {
          where: {
            userId: session.user.id,
            status: 'ACCEPTED',
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
    const collaborator = trip.collaborators[0];
    const isAdmin = collaborator?.role === 'ADMIN';
    const hasAccess = isOwner || !!collaborator;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Find the idea
    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        tripId,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check permissions: Author, Owner, or Admin can delete
    const isAuthor = idea.createdBy === session.user.id;
    const canDelete = isAuthor || isOwner || isAdmin;

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this idea' },
        { status: 403 }
      );
    }

    // Delete the idea (cascade will delete votes)
    await prisma.idea.delete({
      where: { id: ideaId },
    });

    // Broadcast deletion to trip room
    broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
      ideaId,
      tripId,
      action: 'deleted',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Idea deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
