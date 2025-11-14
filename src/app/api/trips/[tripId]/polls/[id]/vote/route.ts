/**
 * Poll Vote API Route
 *
 * POST /api/trips/[tripId]/polls/[id]/vote - Vote on a poll
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { votePollSchema } from '@/lib/validations/poll';
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/types/realtime';

/**
 * POST /api/trips/[tripId]/polls/[id]/vote
 *
 * Vote on a poll (supports single and multiple choice)
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

    const { tripId, id: pollId } = params;
    const body = await request.json();

    // Validate request body
    const validation = votePollSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { optionIds } = validation.data;

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

    // Get poll details
    const poll = await prisma.poll.findFirst({
      where: {
        id: pollId,
        tripId,
      },
      include: {
        options: true,
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if poll is closed
    if (poll.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Cannot vote on a closed poll' },
        { status: 400 }
      );
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Poll has expired' },
        { status: 400 }
      );
    }

    // Validate that all option IDs belong to this poll
    const validOptionIds = poll.options.map((o) => o.id);
    const invalidOptions = optionIds.filter((id) => !validOptionIds.includes(id));

    if (invalidOptions.length > 0) {
      return NextResponse.json(
        { error: 'Invalid option IDs provided' },
        { status: 400 }
      );
    }

    // Check if multiple votes are allowed
    if (!poll.allowMultipleVotes && optionIds.length > 1) {
      return NextResponse.json(
        { error: 'This poll only allows voting for a single option' },
        { status: 400 }
      );
    }

    // Remove existing votes from this user for this poll
    await prisma.pollVote.deleteMany({
      where: {
        pollId,
        userId: session.user.id,
      },
    });

    // Create new votes
    await prisma.pollVote.createMany({
      data: optionIds.map((optionId) => ({
        pollId,
        optionId,
        userId: session.user.id,
      })),
    });

    // Get updated vote counts
    const votes = await prisma.pollVote.findMany({
      where: { pollId },
    });

    const optionVoteCounts = poll.options.map((option) => ({
      optionId: option.id,
      voteCount: votes.filter((v) => v.optionId === option.id).length,
    }));

    // Broadcast update
    broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
      pollId,
      optionVoteCounts,
      totalVotes: votes.length,
      tripId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Vote recorded successfully',
        votedOptionIds: optionIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error voting on poll:', error);
    return NextResponse.json(
      { error: 'Failed to vote on poll' },
      { status: 500 }
    );
  }
}
