/**
 * Events Collection API Routes
 *
 * @route POST /api/trips/[tripId]/events
 * @route GET /api/trips/[tripId]/events
 * @access Protected - User must be trip owner or collaborator with EDITOR or ADMIN role
 *
 * POST: Creates a new event in the trip
 * - Supports all 6 event types (FLIGHT, HOTEL, ACTIVITY, RESTAURANT, TRANSPORTATION, DESTINATION)
 * - Validates user has edit permission (owner, admin, or editor)
 * - Stores type-specific data in description/notes
 * - Handles location data as JSON
 * - Tracks event cost
 *
 * GET: Retrieves all events for a trip with filtering
 * - Filter by event type(s)
 * - Filter by date range (startDate to endDate)
 * - Search by title/description
 * - Sort by startDateTime, order, or createdAt
 * - Returns events with creator info
 *
 * @throws {400} - Validation error
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (no edit access)
 * @throws {404} - Not Found (trip doesn't exist)
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import {
  createEventSchema,
  eventListQuerySchema,
} from '@/lib/validations/event';
import { ZodError } from 'zod';
import { EventType } from '@prisma/client';

/**
 * POST /api/trips/[tripId]/events
 *
 * Creates a new event in the specified trip.
 * User must have EDITOR or ADMIN role, or be the trip owner.
 */
export async function POST(
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
    let eventData;
    try {
      const body = await req.json();
      eventData = createEventSchema.parse(body);
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
          error: 'Forbidden - You need EDITOR or ADMIN access to create events',
        },
        { status: 403 }
      );
    }

    // 6. Get the maximum order value for events in this trip
    const maxOrderEvent = await prisma.event.findFirst({
      where: { tripId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = maxOrderEvent ? maxOrderEvent.order + 1 : 0;

    // 7. Create the event
    const newEvent = await prisma.event.create({
      data: {
        tripId,
        type: eventData.type,
        title: eventData.title,
        description: eventData.description,
        startDateTime: eventData.startDateTime,
        endDateTime: eventData.endDateTime,
        location: eventData.location as unknown as object | null,
        cost: eventData.cost?.amount,
        currency: eventData.cost?.currency,
        order: eventData.order ?? nextOrder,
        notes: eventData.notes,
        confirmationNumber: eventData.confirmationNumber,
        createdBy: userId,
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

    // 8. Build response
    const response = {
      id: newEvent.id,
      tripId: newEvent.tripId,
      type: newEvent.type,
      title: newEvent.title,
      description: newEvent.description,
      startDateTime: newEvent.startDateTime,
      endDateTime: newEvent.endDateTime,
      location: newEvent.location,
      cost: newEvent.cost
        ? {
            amount: Number(newEvent.cost),
            currency: newEvent.currency,
          }
        : null,
      order: newEvent.order,
      notes: newEvent.notes,
      confirmationNumber: newEvent.confirmationNumber,
      creator: {
        id: newEvent.creator.id,
        name: `${newEvent.creator.firstName} ${newEvent.creator.lastName}`,
        avatarUrl: newEvent.creator.avatarUrl,
      },
      createdAt: newEvent.createdAt,
      updatedAt: newEvent.updatedAt,
    };

    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: response,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/trips/[tripId]/events Error]:', error);

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
 * GET /api/trips/[tripId]/events
 *
 * Retrieves all events for a trip with optional filtering.
 * User must be trip owner or accepted collaborator.
 */
export async function GET(
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

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      type: searchParams.get('type') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || 'startDateTime',
      orderBy: searchParams.get('orderBy') || 'asc',
    };

    let filters;
    try {
      filters = eventListQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid query parameters',
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

    // 4. Check if trip exists and user has access
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

    // 5. Build query filters
    const whereClause: {
      tripId: string;
      type?: { in: EventType[] };
      startDateTime?: { gte?: Date; lte?: Date };
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      tripId,
    };

    // Filter by type(s)
    if (filters.type && filters.type.length > 0) {
      whereClause.type = { in: filters.type };
    }

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      whereClause.startDateTime = {};
      if (filters.startDate) {
        whereClause.startDateTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.startDateTime.lte = filters.endDate;
      }
    }

    // Search in title and description
    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // 6. Fetch events with filters
    const events = await prisma.event.findMany({
      where: whereClause,
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
        [filters.sort]: filters.orderBy,
      },
    });

    // 7. Build response
    const response = events.map((event) => ({
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
        events: response,
        total: response.length,
        filters: {
          type: filters.type,
          startDate: filters.startDate,
          endDate: filters.endDate,
          search: filters.search,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/trips/[tripId]/events Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
