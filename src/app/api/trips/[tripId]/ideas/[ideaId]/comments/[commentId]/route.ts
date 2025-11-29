/**
 * Idea Comment Delete API Route
 *
 * DELETE /api/trips/[tripId]/ideas/[ideaId]/comments/[commentId] - Delete comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/trips/[tripId]/ideas/[ideaId]/comments/[commentId]
 *
 * Delete a comment (only the author can delete their own comment)
 */
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: { tripId: string; ideaId: string; commentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, ideaId, commentId } = params;

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

    // Check if comment exists and belongs to this idea
    const comment = await prisma.ideaComment.findFirst({
      where: {
        id: commentId,
        ideaId,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only the comment author can delete their comment
    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Delete the comment
    await prisma.ideaComment.delete({
      where: {
        id: commentId,
      },
    });

    return NextResponse.json(
      { message: 'Comment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
