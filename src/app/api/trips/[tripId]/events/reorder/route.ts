/**
 * Event Reordering API Route
 *
 * @route PATCH /api/trips/[tripId]/events/reorder
 * @access Protected - User must be trip owner or collaborator with EDITOR or ADMIN role
 *
 * PATCH: Reorders events within a trip (for drag-and-drop functionality)
 * - Accepts array of event IDs in desired order
 * - Updates order field for each event atomically
 * - Validates all events belong to the trip
 * - Uses Prisma transaction (all-or-nothing)
 * - Returns updated events sorted by new order
 *
 * @throws {400} - Validation error (invalid IDs, duplicates, empty array)
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (no edit access)
 * @throws {404} - Not Found (trip or events don't exist)
 * @throws {500} - Server error (transaction failure)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { reorderEventsSchema } from '@/lib/validations/event';
import { ZodError } from 'zod';

/**
 * PATCH /api/trips/[tripId]/events/reorder
 *
 * Reorders events within a trip by updating their order field.
 * All updates happen atomically in a transaction.
 *
 * @param req - Request containing eventIds array in body
 * @param params - Route params containing tripId
 * @returns Updated events array or error
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { tripId } = params;

    // 2. Validate tripId
    if (!tripId || typeof tripId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    // 3. Parse and validate request body
    let reorderData;
    try {
      const body = await req.json();
      reorderData = reorderEventsSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { eventIds } = reorderData;

    // 4. Check if trip exists and verify user has edit permission
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
      },
      include: {
        collaborators: {
          where: {
            userId,
            status: 'ACCEPTED',
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // 5. Check permissions: Must be owner, admin, or editor
    const isOwner = trip.createdBy === userId;
    const userCollaborator = trip.collaborators[0];
    const hasEditPermission =
      isOwner ||
      userCollaborator?.role === 'ADMIN' ||
      userCollaborator?.role === 'EDITOR';

    if (!hasEditPermission) {
      return NextResponse.json(
        {
          error:
            'Forbidden - You need EDITOR or ADMIN access to reorder events',
        },
        { status: 403 }
      );
    }

    // 6. Fetch all events to verify they belong to this trip
    const existingEvents = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
      },
      select: {
        id: true,
        tripId: true,
      },
    });

    // 7. Validate that all event IDs exist
    if (existingEvents.length !== eventIds.length) {
      const foundIds = new Set(existingEvents.map((e) => e.id));
      const missingIds = eventIds.filter((id) => !foundIds.has(id));

      return NextResponse.json(
        {
          error: 'Invalid event IDs',
          details: `The following event IDs were not found: ${missingIds.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 8. Validate that all events belong to this trip
    const eventsFromDifferentTrip = existingEvents.filter(
      (event) => event.tripId !== tripId
    );

    if (eventsFromDifferentTrip.length > 0) {
      const invalidIds = eventsFromDifferentTrip.map((e) => e.id);

      return NextResponse.json(
        {
          error: 'Invalid event IDs',
          details: `The following events do not belong to this trip: ${invalidIds.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 9. Update event orders atomically using Prisma transaction
    await prisma.$transaction(
      eventIds.map((eventId, index) =>
        prisma.event.update({
          where: { id: eventId },
          data: { order: index },
        })
      )
    );

    // 10. Fetch updated events with creator info
    const updatedEvents = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // 11. Build response
    const response = updatedEvents.map((event) => ({
      id: event.id,
      tripId: event.tripId,
      type: event.type,
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      location: event.location,
      cost: event.cost
        ? {
            amount: Number(event.cost),
            currency: event.currency,
          }
        : null,
      order: event.order,
      notes: event.notes,
      confirmationNumber: event.confirmationNumber,
      creator: {
        id: event.creator.id,
        name: `${event.creator.firstName} ${event.creator.lastName}`,
        avatarUrl: event.creator.avatarUrl,
      },
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        message: `Successfully reordered ${eventIds.length} events`,
        events: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/trips/[tripId]/events/reorder Error]:', error);

    // Handle Prisma transaction errors specifically
    if (error instanceof Error && error.message.includes('transaction')) {
      return NextResponse.json(
        {
          error: 'Transaction failed',
          message:
            'Failed to update event order. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
