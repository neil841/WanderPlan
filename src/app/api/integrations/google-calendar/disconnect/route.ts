/**
 * Google Calendar Disconnect Endpoint
 *
 * Disconnects Google Calendar integration by removing stored tokens.
 *
 * @endpoint POST /api/integrations/google-calendar/disconnect
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * POST /api/integrations/google-calendar/disconnect
 *
 * Removes Google Calendar integration for the current user
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

    // Remove Google Calendar tokens from user
    await prisma.user.update({
      where: { id: session.user.id },
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
