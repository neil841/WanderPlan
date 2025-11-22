/**
 * Landing Pages API Routes
 *
 * Handles landing page listing and creation.
 *
 * @route GET /api/landing-pages - List user's landing pages
 * @route POST /api/landing-pages - Create a new landing page
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth-options';
import { createLandingPageSchema } from '@/lib/validations/landing-page';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/landing-pages
 *
 * Lists landing pages created by the authenticated user.
 *
 * @access Protected - Requires authentication
 *
 * @returns 200 - List of landing pages
 * @returns 401 - Unauthorized
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

    // Fetch user's landing pages (exclude soft-deleted)
    const landingPages = await prisma.landingPage.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        userId: true,
        tripId: true,
        title: true,
        description: true,
        content: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        trip: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            destinations: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          landingPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/landing-pages] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching landing pages',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/landing-pages
 *
 * Creates a new landing page.
 *
 * @access Protected - Requires authentication
 *
 * Request body:
 * - slug: URL-safe slug (required, 3-100 chars, lowercase letters/numbers/hyphens)
 * - tripId: Associated trip ID (optional, UUID)
 * - title: Page title (required, 1-200 chars)
 * - description: Meta description (optional, max 500 chars)
 * - content: Page content with blocks (required, min 1 block)
 * - isPublished: Publication status (optional, default: false)
 *
 * @returns 201 - Landing page created successfully
 * @returns 400 - Validation error or duplicate slug
 * @returns 401 - Unauthorized
 * @returns 404 - Trip not found
 * @returns 409 - Slug already exists
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
      validatedData = createLandingPageSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid landing page data',
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

    // Check if slug already exists
    const existingPage = await prisma.landingPage.findUnique({
      where: { slug: validatedData.slug },
      select: { id: true, deletedAt: true },
    });

    if (existingPage && !existingPage.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SLUG_ALREADY_EXISTS',
            message: 'A landing page with this slug already exists',
          },
        },
        { status: 409 }
      );
    }

    // If tripId provided, verify it exists and user has access
    if (validatedData.tripId) {
      const trip = await prisma.trip.findFirst({
        where: {
          id: validatedData.tripId,
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
        select: { id: true },
      });

      if (!trip) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TRIP_NOT_FOUND',
              message: 'Trip not found or access denied',
            },
          },
          { status: 404 }
        );
      }
    }

    // Create landing page
    const landingPage = await prisma.landingPage.create({
      data: {
        slug: validatedData.slug,
        userId: session.user.id,
        tripId: validatedData.tripId,
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        isPublished: validatedData.isPublished || false,
        publishedAt: validatedData.isPublished ? new Date() : null,
      },
      select: {
        id: true,
        slug: true,
        userId: true,
        tripId: true,
        title: true,
        description: true,
        content: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        trip: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            destinations: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: landingPage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/landing-pages] Error:', error);

    // Handle Prisma unique constraint violations
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SLUG_ALREADY_EXISTS',
              message: 'A landing page with this slug already exists',
            },
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while creating the landing page',
        },
      },
      { status: 500 }
    );
  }
}
