/**
 * Trip Details API Route
 *
 * @route GET /api/trips/[tripId]
 * @route PATCH /api/trips/[tripId]
 * @route DELETE /api/trips/[tripId]
 * @access Protected - User must be trip owner or collaborator
 *
 * GET: Returns detailed trip information with all related data:
 * - Events (ordered by date and order field)
 * - Collaborators with user details
 * - Budget with expense summary
 * - Documents
 * - Tags
 *
 * PATCH: Updates trip metadata (owner or admin collaborator only)
 * - Supports partial updates
 * - Updates trip fields, cover image, tags
 * - Validates permissions
 *
 * DELETE: Soft deletes a trip (owner only)
 * - Sets deletedAt timestamp
 * - Preserves all related data
 * - Only owner can delete
 *
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (no access to this trip)
 * @throws {404} - Not Found (trip doesn't exist)
 * @throws {410} - Gone (trip already deleted)
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { updateTripSchema } from '@/lib/validations/trip';
import { ZodError } from 'zod';

/**
 * GET /api/trips/[tripId]
 *
 * Retrieves complete trip details with all relations
 */
export async function GET(
  _req: NextRequest,
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

    // 3. Fetch trip with all relations and access control
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null, // Exclude soft-deleted trips
        // Row-level security: user must be owner or accepted collaborator
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
        // Creator info
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },

        // Events ordered by startDateTime and order field
        events: {
          orderBy: [
            { startDateTime: 'asc' },
            { order: 'asc' },
          ],
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
        },

        // Collaborators with user details
        collaborators: {
          where: {
            status: 'ACCEPTED',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },

        // Budget
        budget: true,

        // Expenses for budget calculations
        expenses: {
          select: {
            id: true,
            amount: true,
            currency: true,
            category: true,
          },
        },

        // Documents
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            uploader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },

        // Tags
        tags: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    // 4. Handle not found
    if (!trip) {
      // Check if trip exists at all
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

      // Trip exists but user doesn't have access
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this trip' },
        { status: 403 }
      );
    }

    // 5. Calculate expense summary
    const expenseSummary = trip.expenses.reduce(
      (acc, expense) => {
        const key = expense.currency;
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += Number(expense.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    // 6. Determine user's role
    const isOwner = trip.createdBy === userId;
    const userCollaboration = trip.collaborators.find(
      (c) => c.userId === userId
    );
    const userRole = isOwner ? 'owner' : (userCollaboration?.role || 'VIEWER');

    // 7. Build response
    const response = {
      // Trip metadata
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      destinations: trip.destinations,
      visibility: trip.visibility,
      coverImageUrl: trip.coverImageUrl,
      isArchived: trip.isArchived,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,

      // Creator
      creator: {
        id: trip.creator.id,
        name: `${trip.creator.firstName} ${trip.creator.lastName}`,
        email: trip.creator.email,
        avatarUrl: trip.creator.avatarUrl,
      },

      // Events with full details
      events: trip.events.map((event) => ({
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        order: event.order,
        location: event.location,
        cost: event.cost ? {
          amount: event.cost,
          currency: event.currency,
        } : null,
        notes: event.notes,
        confirmationNumber: event.confirmationNumber,
        creator: event.creator ? {
          id: event.creator.id,
          name: `${event.creator.firstName} ${event.creator.lastName}`,
          avatarUrl: event.creator.avatarUrl,
        } : null,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),

      // Collaborators
      collaborators: trip.collaborators.map((collab) => ({
        id: collab.id,
        role: collab.role,
        status: collab.status,
        user: {
          id: collab.user.id,
          name: `${collab.user.firstName} ${collab.user.lastName}`,
          email: collab.user.email,
          avatarUrl: collab.user.avatarUrl,
        },
        createdAt: collab.createdAt,
      })),

      // Budget
      budget: trip.budget ? {
        id: trip.budget.id,
        totalBudget: trip.budget.totalBudget,
        currency: trip.budget.currency,
        categoryBudgets: trip.budget.categoryBudgets,
        expenseSummary,
        totalSpent: Object.values(expenseSummary).reduce(
          (sum, val) => sum + val,
          0
        ),
        expenseCount: trip.expenses.length,
      } : null,

      // Documents
      documents: trip.documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        size: doc.size,
        uploadedBy: {
          id: doc.uploader.id,
          name: `${doc.uploader.firstName} ${doc.uploader.lastName}`,
          avatarUrl: doc.uploader.avatarUrl,
        },
        createdAt: doc.createdAt,
      })),

      // Tags
      tags: trip.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),

      // User's role in this trip
      userRole,

      // Quick stats
      stats: {
        eventCount: trip.events.length,
        collaboratorCount: trip.collaborators.length,
        documentCount: trip.documents.length,
        tagCount: trip.tags.length,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[GET /api/trips/[tripId] Error]:', error);

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
 * PATCH /api/trips/[tripId]
 *
 * Updates trip metadata with permission checks.
 * Supports partial updates - only provided fields will be updated.
 * Only the trip owner or admin collaborators can update trips.
 *
 * @param req - Request with update data in body
 * @param params - Route parameters containing tripId
 * @returns Updated trip data or error response
 *
 * @example
 * // Update trip title and dates
 * PATCH /api/trips/123
 * {
 *   "name": "Updated Trip Name",
 *   "startDate": "2024-06-01",
 *   "endDate": "2024-06-15"
 * }
 *
 * @example
 * // Update cover image only
 * PATCH /api/trips/123
 * {
 *   "coverImageUrl": "https://example.com/new-image.jpg"
 * }
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
    let updateData;
    try {
      const body = await req.json();
      updateData = updateTripSchema.parse(body);
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

    // 4. Check if trip exists and verify permissions
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null, // Exclude soft-deleted trips
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

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // 5. Check permissions: Must be owner or admin collaborator
    const isOwner = existingTrip.createdBy === userId;
    const isAdminCollaborator =
      existingTrip.collaborators && existingTrip.collaborators.length > 0 &&
      existingTrip.collaborators[0].role === 'ADMIN';

    if (!isOwner && !isAdminCollaborator) {
      return NextResponse.json(
        {
          error: 'Forbidden - Only trip owner or admin collaborators can update this trip',
        },
        { status: 403 }
      );
    }

    // 6. Prepare update data - convert lowercase visibility to uppercase enum
    const { tags, visibility, ...tripUpdateData } = updateData;

    const prismaUpdateData: {
      name?: string;
      description?: string | null;
      startDate?: Date;
      endDate?: Date;
      destinations?: string[];
      visibility?: 'PRIVATE' | 'SHARED' | 'PUBLIC';
      isArchived?: boolean;
      coverImageUrl?: string | null;
    } = tripUpdateData;

    if (visibility) {
      prismaUpdateData.visibility = visibility.toUpperCase() as 'PRIVATE' | 'SHARED' | 'PUBLIC';
    }

    // 7. Update trip in transaction (handles tags separately if provided)
    const updatedTrip = await prisma.$transaction(async (tx) => {
      // Update trip fields
      const trip = await tx.trip.update({
        where: { id: tripId },
        data: prismaUpdateData,
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
          collaborators: {
            where: {
              status: 'ACCEPTED',
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          tags: true,
        },
      });

      // Handle tag updates if provided
      if (tags !== undefined && Array.isArray(tags)) {
        // Delete existing tags for this trip
        await tx.tag.deleteMany({
          where: { tripId },
        });

        // Create new tags
        if (tags.length > 0) {
          await tx.tag.createMany({
            data: tags.map((tagName) => ({
              tripId,
              name: tagName,
              color: generateRandomColor(),
            })),
          });
        }

        // Fetch updated trip with new tags
        const tripWithTags = await tx.trip.findUnique({
          where: { id: tripId },
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
            collaborators: {
              where: {
                status: 'ACCEPTED',
              },
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            tags: true,
          },
        });

        return tripWithTags!;
      }

      return trip;
    });

    // 8. Build response
    const response = {
      id: updatedTrip.id,
      name: updatedTrip.name,
      description: updatedTrip.description,
      startDate: updatedTrip.startDate,
      endDate: updatedTrip.endDate,
      destinations: updatedTrip.destinations,
      visibility: updatedTrip.visibility,
      coverImageUrl: updatedTrip.coverImageUrl,
      isArchived: updatedTrip.isArchived,
      createdAt: updatedTrip.createdAt,
      updatedAt: updatedTrip.updatedAt,

      creator: {
        id: updatedTrip.creator.id,
        name: `${updatedTrip.creator.firstName} ${updatedTrip.creator.lastName}`,
        email: updatedTrip.creator.email,
        avatarUrl: updatedTrip.creator.avatarUrl,
      },

      collaborators: updatedTrip.collaborators.map((collab) => ({
        id: collab.id,
        role: collab.role,
        status: collab.status,
        user: {
          id: collab.user.id,
          name: `${collab.user.firstName} ${collab.user.lastName}`,
          email: collab.user.email,
          avatarUrl: collab.user.avatarUrl,
        },
      })),

      tags: updatedTrip.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),
    };

    return NextResponse.json(
      {
        message: 'Trip updated successfully',
        trip: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/trips/[tripId] Error]:', error);

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
 * DELETE /api/trips/[tripId]
 *
 * Soft deletes a trip by setting the deletedAt timestamp.
 * Only the trip owner can delete a trip.
 * Related data (events, collaborators, expenses, etc.) are preserved but hidden.
 *
 * @param _req - Request object (no body required)
 * @param params - Route parameters containing tripId
 * @returns Success confirmation or error response
 *
 * @example
 * // Delete a trip
 * DELETE /api/trips/123
 * Response: { message: "Trip deleted successfully" }
 *
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (only owner can delete)
 * @throws {404} - Not Found (trip doesn't exist)
 * @throws {500} - Server error
 */
export async function DELETE(
  _req: NextRequest,
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

    // 3. Check if trip exists and verify ownership
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        name: true,
        createdBy: true,
        deletedAt: true,
      },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // 4. Check if trip is already deleted
    if (existingTrip.deletedAt) {
      return NextResponse.json(
        { error: 'Trip has already been deleted' },
        { status: 410 } // 410 Gone - resource existed but is no longer available
      );
    }

    // 5. Check permissions: Only owner can delete
    const isOwner = existingTrip.createdBy === userId;

    if (!isOwner) {
      return NextResponse.json(
        {
          error: 'Forbidden - Only the trip owner can delete this trip',
        },
        { status: 403 }
      );
    }

    // 6. Soft delete the trip by setting deletedAt timestamp
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        deletedAt: new Date(),
      },
    });

    // 7. Return success response
    return NextResponse.json(
      {
        message: 'Trip deleted successfully',
        tripId,
        tripName: existingTrip.name,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[DELETE /api/trips/[tripId] Error]:', error);

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
 * Generates a random color for tags
 * @returns A hex color string
 */
function generateRandomColor(): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
