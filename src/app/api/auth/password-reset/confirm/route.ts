/**
 * POST /api/auth/password-reset/confirm
 * Confirm password reset and update user password
 *
 * @access Public
 *
 * Request body:
 * - token: string (reset token from email)
 * - password: string (new password)
 *
 * Response (200):
 * - success: true
 * - message: string
 *
 * @throws {400} - Validation error or invalid/expired token
 * @throws {404} - User not found
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyPasswordResetToken } from '@/lib/auth/verification';
import { hashPassword } from '@/lib/auth/password';
import { passwordResetConfirmSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const validated = passwordResetConfirmSchema.parse(body);

    // 2. Verify reset token
    let userId: string | null;
    try {
      userId = await verifyPasswordResetToken(validated.token);
    } catch (error) {
      if (error instanceof Error && error.message.includes('expired')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TOKEN_EXPIRED',
              message:
                'Your reset link has expired. Please request a new password reset.',
            },
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // 3. Check if token is valid
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid reset link. Please request a new password reset.',
          },
        },
        { status: 400 }
      );
    }

    // 4. Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found.',
          },
        },
        { status: 404 }
      );
    }

    // 5. Hash new password
    const hashedPassword = await hashPassword(validated.password);

    // 6. Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`[Password Reset] Password updated for user: ${user.email}`);

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successful. You can now log in with your new password.',
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
            message: 'Invalid password format',
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
    console.error('[Password Reset Confirm Error]:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while resetting your password',
        },
      },
      { status: 500 }
    );
  }
}
