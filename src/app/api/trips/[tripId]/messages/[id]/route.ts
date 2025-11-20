/**
 * Individual Message API Routes
 *
 * PATCH /api/trips/[tripId]/messages/[id] - Update a message
 * DELETE /api/trips/[tripId]/messages/[id] - Delete a message
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateMessageSchema } from '@/lib/validations/message';
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/lib/realtime/server';

/**
 * PATCH /api/trips/[tripId]/messages/[id]
 *
 * Update a message (only by the message author)
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

    const { tripId, id: messageId } = params;
    const body = await request.json();

    // Validate request body
    const validation = updateMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Check if user has access to this trip
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
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Find the message and verify ownership
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        tripId,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only the message author can edit their message
    if (message.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Broadcast update to trip room
    broadcastToTrip(tripId, SocketEvent.MESSAGE_UPDATED, {
      messageId: updatedMessage.id,
      content: updatedMessage.content,
      isEdited: updatedMessage.isEdited,
      updatedAt: updatedMessage.updatedAt.toISOString(),
      tripId,
    });

    return NextResponse.json(
      {
        message: updatedMessage,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[tripId]/messages/[id]
 *
 * Delete a message (only by the message author or trip owner/admin)
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

    const { tripId, id: messageId } = params;

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

    // Check if user has access to this trip
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

    // Find the message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        tripId,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check permissions:
    // - Message author can delete their own messages
    // - Trip owner can delete any message
    // - Admin collaborators can delete any message
    const isMessageAuthor = message.userId === session.user.id;
    const canDelete = isMessageAuthor || isOwner || isAdmin;

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this message' },
        { status: 403 }
      );
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId },
    });

    // Broadcast deletion to trip room
    broadcastToTrip(tripId, SocketEvent.MESSAGE_DELETED, {
      messageId,
      tripId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Message deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
