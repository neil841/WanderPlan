/**
 * Trip Duplication API Route
 *
 * @route POST /api/trips/[tripId]/duplicate
 * @access Protected - User must have access to original trip
 *
 * POST: Creates a duplicate copy of an existing trip with:
 * - New trip with copied metadata (title + " (Copy)", description, destination)
 * - New date range (same duration, starting today or custom dates)
 * - Copied events with adjusted dates (maintains relative timing)
 * - Copied budget structure (no expenses)
 * - Copied tags
 * - Does NOT copy: collaborators, documents, expenses (only structure/template)
 * - User becomes owner of the duplicated trip
 *
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (no access to original trip)
 * @throws {404} - Not Found (trip doesn't exist)
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * POST /api/trips/[tripId]/duplicate
 *
 * Duplicates an existing trip with all its structure but not collaboration data.
 * The new trip will have the same duration but can start on a different date.
 *
 * @param req - Request with optional body: { startDate?: string }
 * @param params - Route parameters containing tripId
 * @returns New trip data with duplicated events, budget, and tags
 *
 * @example
 * // Duplicate trip starting today
 * POST /api/trips/trip-123/duplicate
 * Response: { message: "Trip duplicated successfully", trip: {...}, newTripId: "..." }
 *
 * @example
 * // Duplicate trip with custom start date
 * POST /api/trips/trip-123/duplicate
 * {
 *   "startDate": "2025-06-01"
 * }
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

    // 3. Parse optional request body for custom start date
    let customStartDate: Date | null = null;
    try {
      const body = await req.json();
      if (body.startDate) {
        customStartDate = new Date(body.startDate);
        if (isNaN(customStartDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid start date format' },
            { status: 400 }
          );
        }
      }
    } catch {
      // No body or invalid JSON - use default behavior (start today)
    }

    // 4. Fetch original trip with all required data
    // User must be owner or accepted collaborator to duplicate
    const originalTrip = await prisma.trip.findFirst({
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
      include: {
        events: {
          orderBy: [
            { startDateTime: 'asc' },
            { order: 'asc' },
          ],
        },
        budget: true,
        tags: true,
      },
    });

    // 5. Handle not found or no access
    if (!originalTrip) {
      const tripExists = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { id: true },
      });

      if (!tripExists) {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this trip' },
        { status: 403 }
      );
    }

    // 6. Calculate date adjustments
    let newStartDate: Date;
    let newEndDate: Date | null = null;
    let dateDifferenceMs = 0;

    if (originalTrip.startDate && originalTrip.endDate) {
      // Trip has dates - calculate duration and adjust
      const originalStart = new Date(originalTrip.startDate);
      const originalEnd = new Date(originalTrip.endDate);
      const durationMs = originalEnd.getTime() - originalStart.getTime();

      // Use custom start date or default to today
      newStartDate = customStartDate || new Date();
      newEndDate = new Date(newStartDate.getTime() + durationMs);

      // Calculate offset for adjusting event dates
      dateDifferenceMs = newStartDate.getTime() - originalStart.getTime();
    } else {
      // Trip has no dates - use custom date or today
      newStartDate = customStartDate || new Date();
    }

    // 7. Duplicate trip in a transaction for atomicity
    const duplicatedTrip = await prisma.$transaction(async (tx) => {
      // 7a. Create new trip with copied metadata
      const newTrip = await tx.trip.create({
        data: {
          name: `${originalTrip.name} (Copy)`,
          description: originalTrip.description,
          startDate: newStartDate,
          endDate: newEndDate,
          destinations: originalTrip.destinations,
          visibility: 'PRIVATE', // Always start as private
          coverImageUrl: originalTrip.coverImageUrl,
          isArchived: false, // Don't archive the copy
          createdBy: userId, // Current user becomes owner
        },
      });

      // 7b. Copy events with adjusted dates
      if (originalTrip.events.length > 0) {
        const eventsToCreate = originalTrip.events.map((event) => {
          // Adjust event dates by the calculated difference
          let newEventStartDateTime = event.startDateTime;
          let newEventEndDateTime = event.endDateTime;

          if (dateDifferenceMs !== 0) {
            newEventStartDateTime = new Date(
              event.startDateTime.getTime() + dateDifferenceMs
            );

            if (event.endDateTime) {
              newEventEndDateTime = new Date(
                event.endDateTime.getTime() + dateDifferenceMs
              );
            }
          }

          return {
            tripId: newTrip.id,
            type: event.type,
            title: event.title,
            description: event.description,
            startDateTime: newEventStartDateTime,
            endDateTime: newEventEndDateTime,
            location: event.location,
            order: event.order,
            notes: event.notes,
            confirmationNumber: event.confirmationNumber,
            cost: event.cost,
            currency: event.currency,
            createdBy: userId, // Current user owns the duplicated events
          };
        });

        await tx.event.createMany({
          data: eventsToCreate,
        });
      }

      // 7c. Copy budget structure (not expenses)
      if (originalTrip.budget) {
        await tx.budget.create({
          data: {
            tripId: newTrip.id,
            totalBudget: originalTrip.budget.totalBudget,
            currency: originalTrip.budget.currency,
            categoryBudgets: originalTrip.budget.categoryBudgets,
          },
        });
      }

      // 7d. Copy tags
      if (originalTrip.tags.length > 0) {
        const tagsToCreate = originalTrip.tags.map((tag) => ({
          tripId: newTrip.id,
          name: tag.name,
          color: tag.color,
        }));

        await tx.tag.createMany({
          data: tagsToCreate,
        });
      }

      // 7e. Fetch the complete new trip with all relations
      const completeTrip = await tx.trip.findUnique({
        where: { id: newTrip.id },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          events: {
            orderBy: [
              { startDateTime: 'asc' },
              { order: 'asc' },
            ],
          },
          budget: true,
          tags: true,
        },
      });

      return completeTrip!;
    });

    // 8. Build response
    const response = {
      id: duplicatedTrip.id,
      name: duplicatedTrip.name,
      description: duplicatedTrip.description,
      startDate: duplicatedTrip.startDate,
      endDate: duplicatedTrip.endDate,
      destinations: duplicatedTrip.destinations,
      visibility: duplicatedTrip.visibility,
      coverImageUrl: duplicatedTrip.coverImageUrl,
      isArchived: duplicatedTrip.isArchived,
      createdAt: duplicatedTrip.createdAt,
      updatedAt: duplicatedTrip.updatedAt,

      creator: {
        id: duplicatedTrip.creator.id,
        name: `${duplicatedTrip.creator.firstName} ${duplicatedTrip.creator.lastName}`,
        email: duplicatedTrip.creator.email,
        avatarUrl: duplicatedTrip.creator.avatarUrl,
      },

      events: duplicatedTrip.events.map((event) => ({
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        location: event.location,
        order: event.order,
        notes: event.notes,
        confirmationNumber: event.confirmationNumber,
        cost: event.cost ? {
          amount: event.cost,
          currency: event.currency,
        } : null,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),

      budget: duplicatedTrip.budget ? {
        id: duplicatedTrip.budget.id,
        totalBudget: duplicatedTrip.budget.totalBudget,
        currency: duplicatedTrip.budget.currency,
        categoryBudgets: duplicatedTrip.budget.categoryBudgets,
      } : null,

      tags: duplicatedTrip.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),

      stats: {
        eventCount: duplicatedTrip.events.length,
        tagCount: duplicatedTrip.tags.length,
      },
    };

    return NextResponse.json(
      {
        message: 'Trip duplicated successfully',
        trip: response,
        newTripId: duplicatedTrip.id,
        originalTripId: tripId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/trips/[tripId]/duplicate Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
