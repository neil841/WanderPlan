/**
 * Google Calendar Disconnect Endpoint
 *
 * Disconnects Google Calendar integration by:
 * 1. Revoking the OAuth token with Google (prevents continued access if token stolen)
 * 2. Removing stored tokens from database
 *
 * SECURITY: Token revocation is critical - simply deleting from database
 * leaves tokens valid if compromised.
 *
 * @endpoint POST /api/integrations/google-calendar/disconnect
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { revokeGoogleToken } from '@/lib/integrations/google-calendar';

/**
 * POST /api/integrations/google-calendar/disconnect
 *
 * Removes Google Calendar integration for the current user
 *
 * Process:
 * 1. Fetch user's current refresh token
 * 2. Revoke token with Google (invalidates all access tokens)
 * 3. Delete tokens from database
 *
 * @returns Success message
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 1. Get current refresh token before deleting
    // We need this to revoke with Google
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleCalendarRefreshToken: true },
    });

    // 2. Revoke token with Google
    // SECURITY: This invalidates the token server-side, preventing
    // continued access if the token was stolen or compromised
    if (user?.googleCalendarRefreshToken) {
      await revokeGoogleToken(user.googleCalendarRefreshToken);
    }

    // 3. Remove Google Calendar tokens from database
    // Even if revocation fails, we still delete from DB (fail-safe)
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleCalendarAccessToken: null,
        googleCalendarRefreshToken: null,
        googleCalendarTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Google Calendar integration disconnected successfully',
    });
  } catch (error) {
    console.error('Google Calendar disconnect error:', error);
    return NextResponse.json(
      {
        error: 'Failed to disconnect Google Calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
