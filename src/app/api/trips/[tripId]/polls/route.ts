/**
 * Trip Polls API Routes
 *
 * POST /api/trips/[tripId]/polls - Create a new poll
 * GET /api/trips/[tripId]/polls - List polls
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createPollSchema } from '@/lib/validations/poll';
import type { PollsResponse, PollWithResults } from '@/types/poll';
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/types/realtime';

/**
 * POST /api/trips/[tripId]/polls
 *
 * Create a new poll for a trip
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = params;
    const body = await request.json();

    // Validate request body
    const validation = createPollSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { question, options, allowMultipleVotes, expiresAt } = validation.data;

    // Check if user has access to this trip (must be collaborator or owner)
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

    // Create the poll with options
    const poll = await prisma.poll.create({
      data: {
        tripId,
        question,
        allowMultipleVotes: allowMultipleVotes || false,
        expiresAt,
        createdBy: session.user.id,
        options: {
          create: options.map((text, index) => ({
            text,
            order: index,
          })),
        },
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
        options: {
          orderBy: {
            order: 'asc',
          },
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    // Broadcast to trip room
    broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
      pollId: poll.id,
      question: poll.question,
      tripId,
    });

    return NextResponse.json(
      {
        poll,
        message: 'Poll created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[tripId]/polls
 *
 * List all polls for a trip with results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'OPEN' | 'CLOSED' | null;

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

    // Build where clause
    const where: any = { tripId };
    if (status) {
      where.status = status;
    }

    // Get polls with options and votes
    const polls = await prisma.poll.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform polls to include results
    const pollsWithResults: PollWithResults[] = polls.map((poll) => {
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

      return {
        ...poll,
        options: optionsWithResults,
        totalVotes,
        userHasVoted: userVotedOptionIds.length > 0,
        userVotedOptionIds,
      };
    });

    const response: PollsResponse = {
      polls: pollsWithResults,
      total: polls.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}
