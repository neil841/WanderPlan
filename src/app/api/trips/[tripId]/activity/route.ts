/**
 * Trip Activity Feed API Routes
 *
 * GET /api/trips/[tripId]/activity - List all activity for a trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/trips/[tripId]/activity
 *
 * Fetch activity feed for a trip with filtering and pagination
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

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Filter parameters
    const actionType = searchParams.get('actionType');
    const userId = searchParams.get('userId');

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
    if (actionType) {
      where.actionType = actionType;
    }
    if (userId) {
      where.userId = userId;
    }

    // Get total count for pagination
    const totalCount = await prisma.activity.count({ where });

    // Fetch activity with user data
    const activities = await prisma.activity.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
      take: limit,
      skip: offset,
    });

    const response = {
      activities,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page < Math.ceil(totalCount / limit),
      },
    };

    // Set cache headers (30 seconds)
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=30');

    return NextResponse.json(response, { status: 200, headers });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
