/**
 * Tags API Routes
 *
 * Handles tag management for trip organization.
 *
 * @route GET /api/tags - List user's tags across all trips
 * @route POST /api/tags - Create a new tag for a trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * Validation schema for creating a tag
 */
const createTagSchema = z.object({
  tripId: z.string().uuid('Trip ID must be a valid UUID'),
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be at most 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)')
    .optional(),
});

/**
 * GET /api/tags
 *
 * Lists all unique tags across user's accessible trips.
 * Returns aggregated tag data with usage counts.
 *
 * @access Protected - Requires authentication
 *
 * Query parameters:
 * - tripId: Filter tags by specific trip ID (optional)
 *
 * @returns 200 - List of tags with usage information
 * @returns 401 - Unauthorized (no valid session)
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

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');

    // Build query to get tags from trips user has access to
    const whereClause: any = {
      trip: {
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
    };

    // Filter by specific trip if provided
    if (tripId) {
      whereClause.tripId = tripId;
    }

    // Fetch tags with trip information
    const tags = await prisma.tag.findMany({
      where: whereClause,
      include: {
        trip: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });

    // Aggregate tags by name for autocomplete suggestions
    const tagAggregation = tags.reduce((acc: Record<string, any>, tag) => {
      if (!acc[tag.name]) {
        acc[tag.name] = {
          name: tag.name,
          color: tag.color,
          count: 0,
          tripIds: [],
        };
      }
      acc[tag.name].count += 1;
      acc[tag.name].tripIds.push(tag.tripId);
      // Use most recent color if multiple
      if (tag.color) {
        acc[tag.name].color = tag.color;
      }
      return acc;
    }, {});

    const aggregatedTags = Object.values(tagAggregation);

    return NextResponse.json(
      {
        success: true,
        data: {
          tags: tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            tripId: tag.tripId,
            tripName: tag.trip.name,
            createdAt: tag.createdAt,
          })),
          aggregated: aggregatedTags,
          total: tags.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/tags] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch tags',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 *
 * Creates a new tag for a specific trip.
 * User must have access to the trip (owner or collaborator).
 *
 * @access Protected - Requires authentication
 *
 * Request body:
 * - tripId: string (UUID) - The trip to add tag to
 * - name: string - Tag name (1-50 chars, alphanumeric)
 * - color: string (optional) - Hex color code (e.g., #FF5733)
 *
 * @returns 201 - Tag created successfully
 * @returns 400 - Validation error
 * @returns 401 - Unauthorized (no valid session)
 * @returns 403 - Forbidden (no access to trip)
 * @returns 404 - Trip not found
 * @returns 409 - Conflict (tag already exists for this trip)
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

    const userId = session.user.id;

    // Parse and validate request body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = createTagSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid tag data',
              details: error.errors.map((err) => ({
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

    const { tripId, name, color } = validatedData;

    // Check if trip exists and user has access
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        collaborators: {
          where: {
            userId,
            status: 'ACCEPTED',
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Trip not found',
          },
        },
        { status: 404 }
      );
    }

    // Check authorization - must be owner or editor/admin collaborator
    const isOwner = trip.createdBy === userId;
    const isCollaborator = trip.collaborators.length > 0;
    const hasEditAccess =
      isOwner ||
      trip.collaborators.some((collab) => ['EDITOR', 'ADMIN'].includes(collab.role));

    if (!hasEditAccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to add tags to this trip',
          },
        },
        { status: 403 }
      );
    }

    // Create tag (Prisma will enforce unique constraint on tripId + name)
    try {
      const tag = await prisma.tag.create({
        data: {
          tripId,
          name: name.trim(),
          color: color || null,
        },
        include: {
          trip: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            tripId: tag.tripId,
            tripName: tag.trip.name,
            createdAt: tag.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CONFLICT',
              message: `Tag "${name}" already exists for this trip`,
            },
          },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('[POST /api/tags] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create tag',
        },
      },
      { status: 500 }
    );
  }
}
