/**
 * POST /api/auth/password-reset/request
 * Request a password reset email
 *
 * @access Public
 *
 * Request body:
 * - email: string
 *
 * Response (200):
 * - success: true
 * - message: string
 *
 * @throws {400} - Validation error
 * @throws {404} - User not found
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { createPasswordResetToken } from '@/lib/auth/verification';
import { sendPasswordResetEmail } from '@/lib/email/client';
import { passwordResetRequestSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const validated = passwordResetRequestSchema.parse(body);

    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    // Security: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      // Still return success to prevent user enumeration
      return NextResponse.json(
        {
          success: true,
          message:
            'If an account exists with that email, you will receive a password reset link shortly.',
        },
        { status: 200 }
      );
    }

    // 3. Generate password reset token
    const token = await createPasswordResetToken(user.id);

    // 4. Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // 5. Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      // In development, log the reset URL for testing
      if (process.env.NODE_ENV === 'development') {
        // TODO: Replace with proper logging service (e.g., Winston, Pino)
        console.info(`[DEV] Password reset URL: ${resetUrl}`);
      }
    } catch (emailError) {
      // Don't fail the request
      // TODO: Replace with proper error tracking service (e.g., Sentry)
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEV] Failed to send reset email:', emailError);
      }

      // Return error to user since email failed
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_SEND_FAILED',
            message:
              'Failed to send reset email. Please try again or contact support.',
          },
        },
        { status: 500 }
      );
    }

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        message:
          'If an account exists with that email, you will receive a password reset link shortly.',
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format',
            details: error.issues.map((err: z.ZodIssue) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    // TODO: Replace with proper error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Password reset request error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing your request',
        },
      },
      { status: 500 }
    );
  }
}
