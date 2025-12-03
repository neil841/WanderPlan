/**
 * Trip Ideas API Routes
 *
 * POST /api/trips/[tripId]/ideas - Create a new idea
 * GET /api/trips/[tripId]/ideas - List ideas
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createIdeaSchema } from '@/lib/validations/idea';
import type { IdeasResponse, IdeaWithVotes } from '@/types/idea';
import { broadcastToTrip, SocketEvent } from '@/lib/realtime/server';

/**
 * POST /api/trips/[tripId]/ideas
 *
 * Create a new idea for a trip
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
    const validation = createIdeaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { title, description } = validation.data;

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

    // Create the idea
    const idea = await prisma.idea.create({
      data: {
        tripId,
        title,
        description,
        createdBy: session.user.id,
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
        votes: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        tripId,
        userId: session.user.id,
        actionType: 'EVENT_CREATED', // Using generic event type
        actionData: {
          ideaId: idea.id,
          title: idea.title,
          userName: session.user.name || session.user.email,
        },
      },
    });

    // Broadcast to trip room
    broadcastToTrip(tripId, SocketEvent.ACTIVITY_CREATED, {
      ideaId: idea.id,
      title: idea.title,
      tripId,
    });

    return NextResponse.json(
      {
        idea,
        message: 'Idea created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[tripId]/ideas
 *
 * List all ideas for a trip with vote counts (optimized with database aggregation)
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
    const status = searchParams.get('status') as 'OPEN' | 'ACCEPTED' | 'REJECTED' | null;

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
    const totalCount = await prisma.idea.count({ where });

    // Get ideas with ONLY current user's vote (not all votes)
    // Use database aggregation for vote counts
    const ideas = await prisma.idea.findMany({
      where,
      take: limit,
      skip: offset,
      select: {
        id: true,
        tripId: true,
        title: true,
        description: true,
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
        // Only fetch current user's vote
        votes: {
          where: {
            userId: session.user.id,
          },
          select: {
            vote: true,
          },
          take: 1,
        },
        // Use aggregation for vote counts and comments
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Now we need to get vote counts per idea using raw query for efficiency
    // This uses a single query with aggregation instead of N+1 queries
    const voteStats = await prisma.$queryRaw<
      Array<{
        ideaId: string;
        upvoteCount: bigint;
        downvoteCount: bigint;
      }>
    >`
      SELECT
        "idea_id" as "ideaId",
        COUNT(CASE WHEN vote = 1 THEN 1 END)::int as "upvoteCount",
        COUNT(CASE WHEN vote = -1 THEN 1 END)::int as "downvoteCount"
      FROM "idea_votes"
      WHERE "idea_id" = ANY(${ideas.map((i) => i.id)})
      GROUP BY "idea_id"
    `;

    // Create a map for quick lookup
    const voteStatsMap = new Map(
      voteStats.map((stat) => [
        stat.ideaId,
        {
          upvoteCount: Number(stat.upvoteCount),
          downvoteCount: Number(stat.downvoteCount),
        },
      ])
    );

    // Get all voters for these ideas with user information
    const allVoters = await prisma.ideaVote.findMany({
      where: {
        ideaId: {
          in: ideas.map((i) => i.id),
        },
        vote: 1, // Only upvotes
      },
      select: {
        id: true,
        ideaId: true,
        userId: true,
        vote: true,
        createdAt: true,
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

    // Create a map of ideaId to voters
    const votersMap = new Map<string, IdeaVote[]>();
    allVoters.forEach((vote) => {
      if (!votersMap.has(vote.ideaId)) {
        votersMap.set(vote.ideaId, []);
      }
      votersMap.get(vote.ideaId)!.push(vote as IdeaVote);
    });

    // Transform ideas to include vote counts
    const ideasWithVotes: IdeaWithVotes[] = ideas.map((idea) => {
      const stats = voteStatsMap.get(idea.id) || { upvoteCount: 0, downvoteCount: 0 };
      const voteCount = stats.upvoteCount - stats.downvoteCount;
      const currentUserVote = idea.votes[0]?.vote ?? null;
      const voters = votersMap.get(idea.id) || [];

      return {
        id: idea.id,
        tripId: idea.tripId,
        title: idea.title,
        description: idea.description,
        status: idea.status,
        createdBy: idea.createdBy,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
        creator: idea.creator,
        votes: voters, // Include voters with user info
        voteCount,
        upvoteCount: stats.upvoteCount,
        downvoteCount: stats.downvoteCount,
        currentUserVote,
        _count: idea._count,
      };
    });

    const response: IdeasResponse = {
      ideas: ideasWithVotes,
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
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}
