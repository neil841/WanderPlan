import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/integrations/google-calendar/status
 *
 * Check if user has connected Google Calendar integration
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     isAuthenticated: boolean,
 *     email: string | null
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to check calendar status',
          },
        },
        { status: 401 }
      );
    }

    // 2. Fetch user's Google Calendar tokens from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        googleCalendarAccessToken: true,
        googleCalendarRefreshToken: true,
        googleCalendarTokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // 3. Check if tokens exist and are valid
    const isAuthenticated =
      !!user.googleCalendarAccessToken &&
      !!user.googleCalendarRefreshToken &&
      !!user.googleCalendarTokenExpiry &&
      user.googleCalendarTokenExpiry > new Date();

    // 4. Return status
    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated,
        email: isAuthenticated ? user.email : null,
      },
    });
  } catch (error) {
    console.error('[Calendar Status] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while checking calendar status',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
