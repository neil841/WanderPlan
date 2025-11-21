/**
 * Individual Event API Routes
 *
 * @route GET /api/trips/[tripId]/events/[eventId]
 * @route PATCH /api/trips/[tripId]/events/[eventId]
 * @route DELETE /api/trips/[tripId]/events/[eventId]
 * @access Protected - User must be trip owner or collaborator
 *
 * GET: Retrieves a single event with full details
 * - Returns event with creator info
 * - User must have access to the trip
 *
 * PATCH: Updates an existing event
 * - Supports partial updates
 * - User must have EDITOR or ADMIN role
 * - Validates all updated fields
 *
 * DELETE: Deletes an event
 * - Permanent deletion (hard delete)
 * - User must have EDITOR or ADMIN role
 * - Cascades to related data
 *
 * @throws {400} - Validation error
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (no edit access)
 * @throws {404} - Not Found (event or trip doesn't exist)
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { updateEventSchema } from '@/lib/validations/event';
import { ZodError } from 'zod';

/**
 * GET /api/trips/[tripId]/events/[eventId]
 *
 * Retrieves a single event with full details.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { tripId: string; eventId: string } }
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
    const { tripId, eventId } = params;

    // 2. Validate IDs
    if (!tripId || typeof tripId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // 3. Check if trip exists and user has access
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
        OR: [
          { createdBy: userId },
          {
            collaborators: {
              some: {
                userId,
                status: 'ACCEPTED',
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or you do not have access' },
        { status: 404 }
      );
    }

    // 4. Fetch event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        tripId,
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
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 5. Build response
    const response = {
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
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[GET /api/trips/[tripId]/events/[eventId] Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/trips/[tripId]/events/[eventId]
 *
 * Updates an existing event with permission checks.
 * Supports partial updates - only provided fields will be updated.
 * User must have EDITOR or ADMIN role, or be the trip owner.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { tripId: string; eventId: string } }
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
    const { tripId, eventId } = params;

    // 2. Validate IDs
    if (!tripId || typeof tripId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // 3. Parse and validate request body
    let updateData;
    try {
      const body = await req.json();
      updateData = updateEventSchema.parse(body);
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

    // 4. Check if trip exists and user has edit permission
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
          error: 'Forbidden - You need EDITOR or ADMIN access to update events',
        },
        { status: 403 }
      );
    }

    // 6. Check if event exists and belongs to this trip
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        tripId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 7. Prepare update data
    const prismaUpdateData: {
      type?: typeof updateData.type;
      title?: string;
      description?: string | null;
      startDateTime?: Date;
      endDateTime?: Date | null;
      location?: object | null;
      cost?: number | null;
      currency?: string | null;
      order?: number;
      notes?: string | null;
      confirmationNumber?: string | null;
    } = {};

    if (updateData.type !== undefined) prismaUpdateData.type = updateData.type;
    if (updateData.title !== undefined) prismaUpdateData.title = updateData.title;
    if (updateData.description !== undefined)
      prismaUpdateData.description = updateData.description;
    if (updateData.startDateTime !== undefined)
      prismaUpdateData.startDateTime = updateData.startDateTime;
    if (updateData.endDateTime !== undefined)
      prismaUpdateData.endDateTime = updateData.endDateTime;
    if (updateData.location !== undefined)
      prismaUpdateData.location = updateData.location as unknown as object | null;
    if (updateData.cost !== undefined) {
      prismaUpdateData.cost = updateData.cost?.amount ?? null;
      prismaUpdateData.currency = updateData.cost?.currency ?? null;
    }
    if (updateData.order !== undefined) prismaUpdateData.order = updateData.order;
    if (updateData.notes !== undefined) prismaUpdateData.notes = updateData.notes;
    if (updateData.confirmationNumber !== undefined)
      prismaUpdateData.confirmationNumber = updateData.confirmationNumber;

    // 8. Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: prismaUpdateData,
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
    });

    // 9. Build response
    const response = {
      id: updatedEvent.id,
      tripId: updatedEvent.tripId,
      type: updatedEvent.type,
      title: updatedEvent.title,
      description: updatedEvent.description,
      startDateTime: updatedEvent.startDateTime,
      endDateTime: updatedEvent.endDateTime,
      location: updatedEvent.location,
      cost: updatedEvent.cost
        ? {
            amount: Number(updatedEvent.cost),
            currency: updatedEvent.currency,
          }
        : null,
      order: updatedEvent.order,
      notes: updatedEvent.notes,
      confirmationNumber: updatedEvent.confirmationNumber,
      creator: {
        id: updatedEvent.creator.id,
        name: `${updatedEvent.creator.firstName} ${updatedEvent.creator.lastName}`,
        avatarUrl: updatedEvent.creator.avatarUrl,
      },
      createdAt: updatedEvent.createdAt,
      updatedAt: updatedEvent.updatedAt,
    };

    return NextResponse.json(
      {
        message: 'Event updated successfully',
        event: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/trips/[tripId]/events/[eventId] Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[tripId]/events/[eventId]
 *
 * Deletes an event permanently (hard delete).
 * User must have EDITOR or ADMIN role, or be the trip owner.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { tripId: string; eventId: string } }
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
    const { tripId, eventId } = params;

    // 2. Validate IDs
    if (!tripId || typeof tripId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // 3. Check if trip exists and user has edit permission
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

    // 4. Check permissions: Must be owner, admin, or editor
    const isOwner = trip.createdBy === userId;
    const userCollaborator = trip.collaborators[0];
    const hasEditPermission =
      isOwner ||
      userCollaborator?.role === 'ADMIN' ||
      userCollaborator?.role === 'EDITOR';

    if (!hasEditPermission) {
      return NextResponse.json(
        {
          error: 'Forbidden - You need EDITOR or ADMIN access to delete events',
        },
        { status: 403 }
      );
    }

    // 5. Check if event exists and belongs to this trip
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        tripId,
      },
      select: {
        id: true,
        title: true,
        type: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 6. Delete the event (hard delete with cascade)
    await prisma.event.delete({
      where: { id: eventId },
    });

    // 7. Return success response
    return NextResponse.json(
      {
        message: 'Event deleted successfully',
        eventId,
        eventTitle: existingEvent.title,
        eventType: existingEvent.type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/trips/[tripId]/events/[eventId] Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
