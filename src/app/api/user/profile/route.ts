/**
 * GET /api/user/profile
 * Get current user's profile information
 *
 * @access Protected (requires authentication)
 *
 * Response (200):
 * - Profile data including all user fields except password
 *
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {404} - User not found
 * @throws {500} - Server error
 */

/**
 * PATCH /api/user/profile
 * Update current user's profile information
 *
 * @access Protected (requires authentication)
 *
 * Request body:
 * - firstName?: string
 * - lastName?: string
 * - email?: string (triggers re-verification)
 * - bio?: string | null
 * - phone?: string | null
 * - timezone?: string
 *
 * Response (200):
 * - Updated profile data
 * - emailChangeRequiresVerification?: boolean
 *
 * @throws {400} - Validation error or email already in use
 * @throws {401} - Unauthorized
 * @throws {404} - User not found
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';
import {
  updateProfileSchema,
  changePasswordSchema,
  type ProfileData,
} from '@/lib/validations/profile';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createVerificationToken } from '@/lib/auth/verification';
import { sendVerificationEmail } from '@/lib/email/client';

/**
 * GET handler - Fetch current user's profile
 */
export async function GET() {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view your profile',
          },
        },
        { status: 401 }
      );
    }

    // 2. Fetch user profile from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        timezone: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found',
          },
        },
        { status: 404 }
      );
    }

    // 3. Return profile data
    return NextResponse.json(
      {
        success: true,
        data: user as ProfileData,
      },
      { status: 200 }
    );
  } catch (error) {
    // TODO: Replace with proper error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Get profile error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching your profile',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler - Update current user's profile
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update your profile',
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    // 3. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found',
          },
        },
        { status: 404 }
      );
    }

    // 4. Check if email is being changed
    let emailChangeRequiresVerification = false;
    let newEmail: string | undefined;

    if (validated.email && validated.email !== existingUser.email) {
      newEmail = validated.email;

      // Check if new email is already in use
      const emailExists = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EMAIL_IN_USE',
              message: 'This email address is already registered',
            },
          },
          { status: 400 }
        );
      }

      emailChangeRequiresVerification = true;
    }

    // 5. Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validated.firstName && { firstName: validated.firstName }),
        ...(validated.lastName && { lastName: validated.lastName }),
        ...(newEmail && {
          email: newEmail,
          emailVerified: null, // Reset email verification
        }),
        ...(validated.bio !== undefined && { bio: validated.bio }),
        ...(validated.phone !== undefined && { phone: validated.phone }),
        ...(validated.timezone && { timezone: validated.timezone }),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        timezone: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 6. If email changed, send verification email
    if (newEmail) {
      try {
        const verificationToken = await createVerificationToken(newEmail);
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

        await sendVerificationEmail(newEmail, verificationUrl);

        // In development, log the verification URL for testing
        if (process.env.NODE_ENV === 'development') {
          // TODO: Replace with proper logging service (e.g., Winston, Pino)
          console.info(`[DEV] Verification URL: ${verificationUrl}`);
        }
      } catch (emailError) {
        // Don't fail the request if email fails
        // TODO: Replace with proper error tracking service (e.g., Sentry)
        if (process.env.NODE_ENV === 'development') {
          console.error('[DEV] Failed to send verification email:', emailError);
        }
      }
    }

    // 7. Return updated profile
    return NextResponse.json(
      {
        success: true,
        data: updatedUser as ProfileData,
        emailChangeRequiresVerification,
        message: emailChangeRequiresVerification
          ? 'Profile updated successfully. Please check your new email address to verify it.'
          : 'Profile updated successfully',
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
            message: 'Invalid profile data',
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
      console.error('[DEV] Update profile error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating your profile',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Change user password
 * (Alternative endpoint for password changes)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to change your password',
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const validated = changePasswordSchema.parse(body);

    // 3. Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found or no password set',
          },
        },
        { status: 404 }
      );
    }

    // 4. Verify current password
    const isPasswordValid = await verifyPassword(
      validated.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Current password is incorrect',
          },
        },
        { status: 400 }
      );
    }

    // 5. Hash new password
    const hashedPassword = await hashPassword(validated.newPassword);

    // 6. Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 7. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
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
            message: 'Invalid password data',
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
      console.error('[DEV] Change password error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while changing your password',
        },
      },
      { status: 500 }
    );
  }
}
