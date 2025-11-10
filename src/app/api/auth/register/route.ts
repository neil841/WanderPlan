/**
 * User Registration API Endpoint
 *
 * @route POST /api/auth/register
 * @access Public
 *
 * Request body:
 * - email: string (required, valid email)
 * - password: string (required, min 8 chars, must contain uppercase, lowercase, number, special char)
 * - firstName: string (required, 1-50 chars)
 * - lastName: string (required, 1-50 chars)
 * - timezone: string (optional, IANA timezone, defaults to America/New_York)
 *
 * Response: 201 Created
 * {
 *   success: true,
 *   message: "Account created. Please check your email to verify your account.",
 *   data: {
 *     userId: string,
 *     email: string,
 *     emailVerified: false
 *   }
 * }
 *
 * @throws {400} - Validation error
 * @throws {409} - Email already exists
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createVerificationToken } from '@/lib/auth/verification';
import { sendVerificationEmail } from '@/lib/email/client';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // 2. Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
          },
        },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(validated.password);

    // 4. Create user in database
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        firstName: validated.firstName,
        lastName: validated.lastName,
        timezone: validated.timezone,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
      },
    });

    // 5. Generate email verification token
    const verificationToken = await createVerificationToken(user.email);

    // 6. Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail(user.email, verificationUrl);
      console.log(`[Registration] Verification email sent to: ${user.email}`);
    } catch (emailError) {
      // Log error but don't fail registration if email fails
      console.error('[Registration] Failed to send verification email:', emailError);
      // Still log the token in development for manual verification
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Verification URL: ${verificationUrl}`);
      }
    }

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        message:
          'Account created. Please check your email to verify your account.',
        data: {
          userId: user.id,
          email: user.email,
          emailVerified: user.emailVerified !== null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.issues.map((err) => ({
              field: String(err.path.join('.')),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      // P2002 is Prisma's unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'An account with this email already exists',
            },
          },
          { status: 409 }
        );
      }
    }

    // Log unexpected errors
    console.error('[Registration Error]:', error);

    // Return generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating your account',
        },
      },
      { status: 500 }
    );
  }
}
