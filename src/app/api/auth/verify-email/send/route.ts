/**
 * POST /api/auth/verify-email/send
 * Send (or resend) email verification link to user
 *
 * @access Protected - user must be authenticated
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { createVerificationToken } from '@/lib/auth/verification';
import { sendVerificationEmail } from '@/lib/email/client';

export async function POST() {
  try {
    // Check if user is authenticated
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const { email } = session.user;

    // Check if email is already verified
    if (session.user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }

    // Generate verification token
    const token = await createVerificationToken(email);

    // Create verification URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    // Send verification email
    await sendVerificationEmail(email, verificationUrl);

    return NextResponse.json(
      {
        message: 'Verification email sent successfully',
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    // TODO: Replace with proper error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Send verification email error:', error);
    }

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Email service')) {
        return NextResponse.json(
          {
            error: 'Failed to send email',
            details: 'Please check your email service configuration',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
