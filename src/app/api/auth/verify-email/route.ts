/**
 * GET /api/auth/verify-email?token=xxx
 * Verify email address using token from verification link
 *
 * @access Public
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/auth/verification';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    // Extract token from URL query params
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token and get email
    let email: string | null;
    try {
      email = await verifyEmailToken(token);
    } catch (error) {
      if (error instanceof Error && error.message.includes('expired')) {
        return NextResponse.json(
          {
            error: 'Verification token has expired',
            message: 'Please request a new verification email',
          },
          { status: 400 }
        );
      }
      throw error;
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          message: 'Email is already verified',
          alreadyVerified: true,
        },
        { status: 200 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'Email verified successfully',
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    // TODO: Replace with proper error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Verify email error:', error);
    }

    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
