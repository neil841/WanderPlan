/**
 * Individual Poll API Routes
 *
 * GET /api/trips/[tripId]/polls/[id] - Get a single poll with results
 * PATCH /api/trips/[tripId]/polls/[id] - Update poll (close/reopen)
 * DELETE /api/trips/[tripId]/polls/[id] - Delete a poll (creator only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { PollWithResults } from '@/types/poll';
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/types/realtime';

/**
 * GET /api/trips/[tripId]/polls/[id]
 *
 * Get a single poll with detailed results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, id: pollId } = params;

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

    // Get poll with all details
    const poll = await prisma.poll.findFirst({
      where: {
        id: pollId,
        tripId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        options: {
          orderBy: {
            order: 'asc',
          },
          include: {
            votes: {
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
            },
          },
        },
        votes: true,
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Calculate results
    const totalVotes = poll.votes.length;
    const userVotedOptionIds = poll.votes
      .filter((v) => v.userId === session.user.id)
      .map((v) => v.optionId);

    const optionsWithResults = poll.options.map((option) => {
      const voteCount = option.votes.length;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
      const userVoted = userVotedOptionIds.includes(option.id);

      return {
        ...option,
        voteCount,
        percentage,
        userVoted,
      };
    });

    const pollWithResults: PollWithResults = {
      ...poll,
      options: optionsWithResults,
      totalVotes,
      userHasVoted: userVotedOptionIds.length > 0,
      userVotedOptionIds,
    };

    return NextResponse.json({ poll: pollWithResults }, { status: 200 });
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/trips/[tripId]/polls/[id]
 *
 * Update poll status (close/reopen) - creator only
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

    const { tripId, id: pollId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['OPEN', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be OPEN or CLOSED' },
        { status: 400 }
      );
    }

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

    // Find the poll
    const poll = await prisma.poll.findFirst({
      where: {
        id: pollId,
        tripId,
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Only creator can close/reopen poll
    if (poll.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the poll creator can change its status' },
        { status: 403 }
      );
    }

    // Update the poll
    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: { status },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        options: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // Broadcast update
    broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
      pollId: updatedPoll.id,
      status: updatedPoll.status,
      tripId,
    });

    return NextResponse.json(
      {
        poll: updatedPoll,
        message: `Poll ${status === 'CLOSED' ? 'closed' : 'reopened'} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json(
      { error: 'Failed to update poll' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[tripId]/polls/[id]
 *
 * Delete a poll (creator only)
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

    const { tripId, id: pollId } = params;

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

    // Find the poll
    const poll = await prisma.poll.findFirst({
      where: {
        id: pollId,
        tripId,
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Only creator can delete poll
    if (poll.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the poll creator can delete it' },
        { status: 403 }
      );
    }

    // Delete the poll (cascade will delete options and votes)
    await prisma.poll.delete({
      where: { id: pollId },
    });

    // Broadcast deletion
    broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
      pollId,
      tripId,
      action: 'deleted',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Poll deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json(
      { error: 'Failed to delete poll' },
      { status: 500 }
    );
  }
}
