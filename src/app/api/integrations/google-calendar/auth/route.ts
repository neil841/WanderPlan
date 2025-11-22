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
import { generateOAuthState } from '@/lib/integrations/oauth-state';

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

    // Generate cryptographically secure state token (CSRF protection)
    // This prevents OAuth CSRF attacks by ensuring state cannot be forged
    const state = generateOAuthState(session.user.id, tripId || null);

    // Generate authorization URL with secure state parameter
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
