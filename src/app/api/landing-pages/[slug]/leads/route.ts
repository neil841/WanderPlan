/**
 * Landing Page Lead Capture API
 *
 * Handles lead capture from landing pages.
 *
 * @route POST /api/landing-pages/[slug]/leads - Capture a lead (public endpoint)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createLeadSchema, slugParamSchema } from '@/lib/validations/landing-page';
import prisma from '@/lib/db/prisma';
import { checkGenericRateLimit } from '@/lib/auth/rate-limit';

/**
 * POST /api/landing-pages/[slug]/leads
 *
 * Captures a lead from a landing page.
 * - Public endpoint (no authentication required)
 * - Only works for published landing pages
 * - Creates a new lead in the database
 *
 * @access Public
 *
 * Request body:
 * - firstName: First name (required, 1-100 chars)
 * - lastName: Last name (required, 1-100 chars)
 * - email: Email address (required, valid email)
 * - phone: Phone number (optional, max 20 chars)
 * - message: Message (optional, max 1000 chars)
 *
 * @returns 201 - Lead captured successfully
 * @returns 400 - Validation error
 * @returns 404 - Landing page not found or not published
 * @returns 500 - Server error
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Rate limiting (PUBLIC endpoint - prevent spam/DoS)
    const identifier = req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
    const { isLimited, resetInMinutes } = checkGenericRateLimit(
      `lead-capture:${identifier}`,
      10, // Max 10 lead submissions
      15 * 60 * 1000 // per 15 minutes
    );

    if (isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many submissions. Please try again in ${resetInMinutes} minutes.`,
          },
        },
        { status: 429 }
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

    // Check if landing page exists and is published
    const landingPage = await prisma.landingPage.findUnique({
      where: { slug: validatedSlug.slug },
      select: {
        id: true,
        isPublished: true,
        deletedAt: true,
        userId: true,
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

    if (!landingPage.isPublished) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_PUBLISHED',
            message: 'This landing page is not published',
          },
        },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = createLeadSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid lead data',
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

    // Create lead with source set to landing page slug
    await prisma.lead.create({
      data: {
        landingPageId: landingPage.id,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message || null,
        source: `landing-page:${validatedSlug.slug}`,
        status: 'NEW',
        assignedToId: landingPage.userId, // Assign to landing page owner
      },
    });

    // Return success without exposing lead data (privacy)
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your interest! We will be in touch soon.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/landing-pages/[slug]/leads] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while submitting your information',
        },
      },
      { status: 500 }
    );
  }
}
