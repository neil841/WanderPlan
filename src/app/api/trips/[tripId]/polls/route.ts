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
 * List all polls for a trip with results (optimized with database aggregation)
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

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
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

    // Build where clause
    const where: any = { tripId };
    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const totalCount = await prisma.poll.count({ where });

    // Get polls with ONLY current user's votes (not all votes)
    const polls = await prisma.poll.findMany({
      where,
      take: limit,
      skip: offset,
      select: {
        id: true,
        tripId: true,
        question: true,
        allowMultipleVotes: true,
        expiresAt: true,
        status: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
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
          select: {
            id: true,
            pollId: true,
            text: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        // Only fetch current user's votes
        votes: {
          where: {
            userId: session.user.id,
          },
          select: {
            optionId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get all option IDs for database aggregation
    const allOptionIds = polls.flatMap((poll) => poll.options.map((opt) => opt.id));

    // Use database aggregation to get vote counts per option
    const voteStats = await prisma.$queryRaw<
      Array<{
        optionId: string;
        voteCount: bigint;
      }>
    >`
      SELECT
        "option_id" as "optionId",
        COUNT(*)::int as "voteCount"
      FROM "poll_votes"
      WHERE "option_id" = ANY(${allOptionIds})
      GROUP BY "option_id"
    `;

    // Get total votes per poll
    const pollIds = polls.map((p) => p.id);
    const pollVoteStats = await prisma.$queryRaw<
      Array<{
        pollId: string;
        totalVotes: bigint;
      }>
    >`
      SELECT
        "poll_id" as "pollId",
        COUNT(*)::int as "totalVotes"
      FROM "poll_votes"
      WHERE "poll_id" = ANY(${pollIds})
      GROUP BY "poll_id"
    `;

    // Create maps for quick lookup
    const voteStatsMap = new Map(
      voteStats.map((stat) => [stat.optionId, Number(stat.voteCount)])
    );

    const pollVoteStatsMap = new Map(
      pollVoteStats.map((stat) => [stat.pollId, Number(stat.totalVotes)])
    );

    // Transform polls to include results
    const pollsWithResults: PollWithResults[] = polls.map((poll) => {
      const totalVotes = pollVoteStatsMap.get(poll.id) || 0;
      const userVotedOptionIds = poll.votes.map((v) => v.optionId);

      const optionsWithResults = poll.options.map((option) => {
        const voteCount = voteStatsMap.get(option.id) || 0;
        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
        const userVoted = userVotedOptionIds.includes(option.id);

        return {
          ...option,
          votes: [], // Don't expose all votes
          voteCount,
          percentage,
          userVoted,
        };
      });

      return {
        id: poll.id,
        tripId: poll.tripId,
        question: poll.question,
        allowMultipleVotes: poll.allowMultipleVotes,
        expiresAt: poll.expiresAt,
        status: poll.status,
        createdBy: poll.createdBy,
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt,
        creator: poll.creator,
        options: optionsWithResults,
        votes: [], // Don't expose all votes
        totalVotes,
        userHasVoted: userVotedOptionIds.length > 0,
        userVotedOptionIds,
      };
    });

    const response: PollsResponse = {
      polls: pollsWithResults,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };

    // Set cache headers (30 seconds)
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=30');

    return NextResponse.json(response, { status: 200, headers });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}
