/**
 * Trip API Routes
 *
 * Handles trip CRUD operations with authentication and authorization.
 *
 * @route GET /api/trips - List user's trips with filtering
 * @route POST /api/trips - Create a new trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth-options';
import { tripRepository } from '@/lib/db/repositories/trip.repository';
import { tripListQuerySchema, createTripSchema } from '@/lib/validations/trip';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/trips
 *
 * Lists trips accessible to the authenticated user with filtering, pagination, and search.
 *
 * @access Protected - Requires authentication
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 100)
 * - sort: Sort field (createdAt|startDate|endDate|name)
 * - order: Sort order (asc|desc)
 * - status: Filter by status (active|archived|all)
 * - search: Search in name, description, destinations
 * - tags: Comma-separated tag names
 * - startDate: Filter trips starting after this date
 * - endDate: Filter trips ending before this date
 *
 * @returns 200 - List of trips with pagination metadata
 * @returns 401 - Unauthorized (no valid session)
 * @returns 400 - Validation error
 * @returns 500 - Server error
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    let validatedQuery;
    try {
      validatedQuery = tripListQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid query parameters',
              details: error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Fetch trips with repository
    const result = await tripRepository.listTrips({
      userId: session.user.id,
      ...validatedQuery,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          trips: result.trips,
          pagination: result.pagination,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/trips] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching trips',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trips
 *
 * Creates a new trip for the authenticated user.
 *
 * @access Protected - Requires authentication
 *
 * Request body:
 * - name: Trip name (required, 1-200 chars)
 * - description: Trip description (optional, max 2000 chars)
 * - startDate: Start date (required, ISO date string)
 * - endDate: End date (required, ISO date string, must be >= startDate)
 * - destinations: Array of destination names (optional)
 * - tags: Array of tag names (optional)
 * - visibility: Trip visibility (private|shared|public, default: private)
 *
 * @returns 201 - Trip created successfully
 * @returns 401 - Unauthorized
 * @returns 400 - Validation error
 * @returns 500 - Server error
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate request body
    let validatedData;
    try {
      validatedData = createTripSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid trip data',
              details: error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Create trip with tags
    const trip = await prisma.$transaction(async (tx) => {
      // Create the trip
      const newTrip = await tx.trip.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          destinations: validatedData.destinations,
          visibility: validatedData.visibility.toUpperCase() as any,
          createdBy: session.user.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          destinations: true,
          visibility: true,
          coverImageUrl: true,
          isArchived: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Create or connect tags
      if (validatedData.tags && validatedData.tags.length > 0) {
        await Promise.all(
          validatedData.tags.map((tagName) =>
            tx.tag.upsert({
              where: {
                name_tripId: {
                  name: tagName,
                  tripId: newTrip.id,
                },
              },
              create: {
                name: tagName,
                tripId: newTrip.id,
              },
              update: {},
            })
          )
        );
      }

      // Fetch trip with tags
      return tx.trip.findUnique({
        where: { id: newTrip.id },
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          destinations: true,
          visibility: true,
          coverImageUrl: true,
          isArchived: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    // Transform response
    const responseData = {
      id: trip!.id,
      name: trip!.name,
      description: trip!.description,
      startDate: trip!.startDate,
      endDate: trip!.endDate,
      destinations: trip!.destinations,
      tags: trip!.tags.map((t) => t.name),
      visibility: trip!.visibility.toLowerCase(),
      coverImageUrl: trip!.coverImageUrl,
      isArchived: trip!.isArchived,
      ownerId: trip!.createdBy,
      ownerName: `${trip!.creator.firstName} ${trip!.creator.lastName}`,
      collaboratorCount: 0,
      eventCount: 0,
      userRole: 'owner' as const,
      createdAt: trip!.createdAt,
      updatedAt: trip!.updatedAt,
    };

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/trips] Error:', error);

    // Handle Prisma unique constraint violations
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_ENTRY',
              message: 'A trip with this name already exists',
            },
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while creating the trip',
        },
      },
      { status: 500 }
    );
  }
}
