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
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/types/realtime';

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
        { error: 'Invalid request data', details: validation.error.errors },
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
 * List all ideas for a trip with vote counts
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

    // Get ideas with vote information
    const ideas = await prisma.idea.findMany({
      where,
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
        votes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform ideas to include vote counts and current user's vote
    const ideasWithVotes: IdeaWithVotes[] = ideas.map((idea) => {
      const upvoteCount = idea.votes.filter((v) => v.vote === 1).length;
      const downvoteCount = idea.votes.filter((v) => v.vote === -1).length;
      const voteCount = upvoteCount - downvoteCount;
      const currentUserVote = idea.votes.find((v) => v.userId === session.user.id)?.vote ?? null;

      return {
        ...idea,
        voteCount,
        upvoteCount,
        downvoteCount,
        currentUserVote,
      };
    });

    const response: IdeasResponse = {
      ideas: ideasWithVotes,
      total: ideas.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}
