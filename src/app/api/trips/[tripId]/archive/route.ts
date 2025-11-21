/**
 * PATCH /api/trips/[tripId]/archive
 * Toggle trip archive status
 *
 * @access Protected (requires admin or owner permission)
 *
 * Response (200):
 * - Updated trip with new isArchived status
 *
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (not admin or owner)
 * @throws {404} - Trip not found
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to archive trips',
          },
        },
        { status: 401 }
      );
    }

    const { tripId } = params;

    // 2. Check if trip exists and get user's role
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        collaborators: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRIP_NOT_FOUND',
            message: 'Trip not found',
          },
        },
        { status: 404 }
      );
    }

    // 3. Check permissions (owner or admin can archive)
    const isOwner = trip.createdBy === session.user.id;
    const isAdmin = trip.collaborators.some(
      (c) => c.userId === session.user.id && c.role === 'ADMIN'
    );

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to archive this trip',
          },
        },
        { status: 403 }
      );
    }

    // 4. Toggle archive status
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        isArchived: !trip.isArchived,
      },
      select: {
        id: true,
        name: true,
        isArchived: true,
        updatedAt: true,
      },
    });

    // 5. Return success
    return NextResponse.json(
      {
        success: true,
        data: updatedTrip,
        message: updatedTrip.isArchived
          ? 'Trip archived successfully'
          : 'Trip unarchived successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Archive Trip Error]:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while archiving the trip',
        },
      },
      { status: 500 }
    );
  }
}
