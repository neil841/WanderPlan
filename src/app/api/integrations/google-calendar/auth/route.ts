/**
 * Google Calendar OAuth Authentication Endpoint
 *
 * Initiates Google OAuth flow for calendar integration.
 *
 * @endpoint GET /api/integrations/google-calendar/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getAuthorizationUrl } from '@/lib/integrations/google-calendar';

/**
 * GET /api/integrations/google-calendar/auth
 *
 * Redirects user to Google OAuth consent screen
 *
 * Query params:
 * - tripId: Trip ID to sync after authorization
 *
 * @returns Redirect to Google OAuth consent screen
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get trip ID from query params
    const searchParams = request.nextUrl.searchParams;
    const tripId = searchParams.get('tripId');

    // Create state parameter to pass trip ID through OAuth flow
    const state = JSON.stringify({
      userId: session.user.id,
      tripId: tripId || null,
      timestamp: Date.now(),
    });

    // Generate authorization URL
    const authUrl = getAuthorizationUrl(state);

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google Calendar auth error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Google Calendar authorization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
