/**
 * Activity Feed API Routes
 *
 * GET /api/trips/[tripId]/activities - List trip activities
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ActivityActionType } from '@prisma/client';
import type { GetActivitiesResponse } from '@/types/activity';

/**
 * GET /api/trips/[tripId]/activities
 *
 * List all activities for a trip with pagination
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 * - actionType: ActivityActionType (optional filter)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tripId } = params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const actionTypeParam = searchParams.get('actionType');

    // 2. Verify user has access to trip
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        createdBy: true,
        collaborators: {
          where: {
            userId: session.user.id,
            status: 'ACCEPTED',
          },
          select: { id: true },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const isOwner = trip.createdBy === session.user.id;
    const isCollaborator = trip.collaborators.length > 0;

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: 'You do not have access to this trip' },
        { status: 403 }
      );
    }

    // 3. Build query filter
    const whereClause: any = {
      tripId,
    };

    // Filter by action type if provided
    if (actionTypeParam && Object.values(ActivityActionType).includes(actionTypeParam as ActivityActionType)) {
      whereClause.actionType = actionTypeParam as ActivityActionType;
    }

    // 4. Get total count for pagination
    const total = await prisma.activity.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // 5. Fetch activities with user information
    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // 6. Format response
    const response: GetActivitiesResponse = {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
