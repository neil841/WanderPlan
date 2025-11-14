/**
 * Idea Vote API Route
 *
 * POST /api/trips/[tripId]/ideas/[id]/vote - Vote on an idea
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { voteIdeaSchema } from '@/lib/validations/idea';
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/types/realtime';

/**
 * POST /api/trips/[tripId]/ideas/[id]/vote
 *
 * Vote on an idea (1 = upvote, -1 = downvote, 0 = remove vote)
 */
export async function POST(
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
    const validation = voteIdeaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { vote } = validation.data;

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

    // Check if idea exists
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

    // Handle vote logic
    if (vote === 0) {
      // Remove vote
      await prisma.ideaVote.deleteMany({
        where: {
          ideaId,
          userId: session.user.id,
        },
      });

      // Get updated vote counts
      const votes = await prisma.ideaVote.findMany({
        where: { ideaId },
      });

      const upvoteCount = votes.filter((v) => v.vote === 1).length;
      const downvoteCount = votes.filter((v) => v.vote === -1).length;
      const voteCount = upvoteCount - downvoteCount;

      // Broadcast update
      broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
        ideaId,
        voteCount,
        upvoteCount,
        downvoteCount,
        tripId,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Vote removed',
          voteCount,
          upvoteCount,
          downvoteCount,
        },
        { status: 200 }
      );
    } else {
      // Upsert vote (update if exists, create if doesn't)
      await prisma.ideaVote.upsert({
        where: {
          ideaId_userId: {
            ideaId,
            userId: session.user.id,
          },
        },
        update: {
          vote,
        },
        create: {
          ideaId,
          userId: session.user.id,
          vote,
        },
      });

      // Get updated vote counts
      const votes = await prisma.ideaVote.findMany({
        where: { ideaId },
      });

      const upvoteCount = votes.filter((v) => v.vote === 1).length;
      const downvoteCount = votes.filter((v) => v.vote === -1).length;
      const voteCount = upvoteCount - downvoteCount;

      // Broadcast update
      broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
        ideaId,
        voteCount,
        upvoteCount,
        downvoteCount,
        tripId,
      });

      return NextResponse.json(
        {
          success: true,
          message: vote === 1 ? 'Upvoted' : 'Downvoted',
          voteCount,
          upvoteCount,
          downvoteCount,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error voting on idea:', error);
    return NextResponse.json(
      { error: 'Failed to vote on idea' },
      { status: 500 }
    );
  }
}
