/**
 * Individual Landing Page API Routes
 *
 * Handles operations on a specific landing page.
 *
 * @route GET /api/landing-pages/[slug] - Get landing page by slug
 * @route PATCH /api/landing-pages/[slug] - Update landing page
 * @route DELETE /api/landing-pages/[slug] - Delete landing page (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth-options';
import { updateLandingPageSchema, slugParamSchema } from '@/lib/validations/landing-page';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/landing-pages/[slug]
 *
 * Gets a landing page by slug.
 * - If published: accessible to everyone (no auth required)
 * - If not published: accessible only to owner
 *
 * @access Public (if published) or Protected (if not published)
 *
 * @returns 200 - Landing page data
 * @returns 401 - Unauthorized (for unpublished pages)
 * @returns 403 - Forbidden (not the owner)
 * @returns 404 - Landing page not found
 * @returns 500 - Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate slug parameter
    let validatedSlug;
    try {
      validatedSlug = slugParamSchema.parse({ slug: params.slug });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid slug format',
            },
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Fetch landing page
    const landingPage = await prisma.landingPage.findUnique({
      where: {
        slug: validatedSlug.slug,
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
        deletedAt: true,
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

    if (!landingPage || landingPage.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Landing page not found',
          },
        },
        { status: 404 }
      );
    }

    // If published, allow public access
    if (landingPage.isPublished) {
      // Remove sensitive fields for public access
      const { userId, deletedAt, ...publicData } = landingPage;

      return NextResponse.json(
        {
          success: true,
          data: publicData,
        },
        { status: 200 }
      );
    }

    // If not published, require authentication and ownership
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to view unpublished pages',
          },
        },
        { status: 401 }
      );
    }

    if (landingPage.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this landing page',
          },
        },
        { status: 403 }
      );
    }

    // Remove deletedAt from response
    const { deletedAt, ...responseData } = landingPage;

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/landing-pages/[slug]] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching the landing page',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/landing-pages/[slug]
 *
 * Updates a landing page.
 * - Only the owner can update
 * - Sets publishedAt when isPublished changes to true
 *
 * @access Protected - Requires authentication and ownership
 *
 * Request body:
 * - slug: New slug (optional, must be unique)
 * - title: New title (optional)
 * - description: New description (optional)
 * - content: New content (optional)
 * - isPublished: Publication status (optional)
 *
 * @returns 200 - Landing page updated successfully
 * @returns 400 - Validation error
 * @returns 401 - Unauthorized
 * @returns 403 - Forbidden (not the owner)
 * @returns 404 - Landing page not found
 * @returns 409 - New slug already exists
 * @returns 500 - Server error
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Validate slug parameter
    let validatedSlug;
    try {
      validatedSlug = slugParamSchema.parse({ slug: params.slug });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid slug format',
            },
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Check if landing page exists and user owns it
    const existingPage = await prisma.landingPage.findUnique({
      where: { slug: validatedSlug.slug },
      select: { id: true, userId: true, deletedAt: true, isPublished: true },
    });

    if (!existingPage || existingPage.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Landing page not found',
          },
        },
        { status: 404 }
      );
    }

    if (existingPage.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this landing page',
          },
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = updateLandingPageSchema.parse(body);
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

    // If slug is being changed, check uniqueness
    if (validatedData.slug && validatedData.slug !== validatedSlug.slug) {
      const slugExists = await prisma.landingPage.findUnique({
        where: { slug: validatedData.slug },
        select: { id: true, deletedAt: true },
      });

      if (slugExists && !slugExists.deletedAt) {
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

    // Determine if we should set publishedAt
    const shouldSetPublishedAt =
      validatedData.isPublished === true && !existingPage.isPublished;

    // Update landing page
    const updatedPage = await prisma.landingPage.update({
      where: { slug: validatedSlug.slug },
      data: {
        ...(validatedData.slug && { slug: validatedData.slug }),
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.content && { content: validatedData.content }),
        ...(validatedData.isPublished !== undefined && {
          isPublished: validatedData.isPublished,
        }),
        ...(shouldSetPublishedAt && { publishedAt: new Date() }),
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
        data: updatedPage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/landing-pages/[slug]] Error:', error);

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
          message: 'An error occurred while updating the landing page',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/landing-pages/[slug]
 *
 * Soft deletes a landing page.
 * - Only the owner can delete
 * - Sets deletedAt timestamp instead of actually deleting
 *
 * @access Protected - Requires authentication and ownership
 *
 * @returns 200 - Landing page deleted successfully
 * @returns 401 - Unauthorized
 * @returns 403 - Forbidden (not the owner)
 * @returns 404 - Landing page not found
 * @returns 500 - Server error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Validate slug parameter
    let validatedSlug;
    try {
      validatedSlug = slugParamSchema.parse({ slug: params.slug });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid slug format',
            },
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Check if landing page exists and user owns it
    const existingPage = await prisma.landingPage.findUnique({
      where: { slug: validatedSlug.slug },
      select: { id: true, userId: true, deletedAt: true },
    });

    if (!existingPage || existingPage.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Landing page not found',
          },
        },
        { status: 404 }
      );
    }

    if (existingPage.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this landing page',
          },
        },
        { status: 403 }
      );
    }

    // Soft delete the landing page
    await prisma.landingPage.update({
      where: { slug: validatedSlug.slug },
      data: {
        deletedAt: new Date(),
        isPublished: false, // Unpublish when deleting
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Landing page deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/landing-pages/[slug]] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while deleting the landing page',
        },
      },
      { status: 500 }
    );
  }
}
