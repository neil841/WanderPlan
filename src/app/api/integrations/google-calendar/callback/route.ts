/**
 * Google Calendar OAuth Callback Endpoint
 *
 * Handles OAuth redirect from Google and stores tokens.
 *
 * @endpoint GET /api/integrations/google-calendar/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getTokensFromCode } from '@/lib/integrations/google-calendar';

/**
 * GET /api/integrations/google-calendar/callback
 *
 * Handles OAuth callback from Google
 *
 * Query params:
 * - code: Authorization code from Google
 * - state: State parameter with user and trip info
 * - error: Error message if authorization failed
 *
 * @returns Redirect to settings or trip page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle authorization denied
    if (error) {
      console.error('Google Calendar authorization denied:', error);
      return NextResponse.redirect(
        new URL('/settings/integrations?error=auth_denied', request.url)
      );
    }

    // Validate required parameters
    if (!code || !stateParam) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_callback', request.url)
      );
    }

    // Parse state parameter
    let state: { userId: string; tripId: string | null; timestamp: number };
    try {
      state = JSON.parse(stateParam);
    } catch (e) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_state', request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await getTokensFromCode(code);

    // Store tokens in database (update User model to include googleCalendarTokens)
    await prisma.user.update({
      where: { id: state.userId },
      data: {
        googleCalendarAccessToken: tokens.access_token,
        googleCalendarRefreshToken: tokens.refresh_token,
        googleCalendarTokenExpiry: new Date(tokens.expiry_date),
      },
    });

    // Redirect to trip page if tripId provided, otherwise to settings
    const redirectUrl = state.tripId
      ? `/trips/${state.tripId}?google_calendar=connected`
      : '/settings/integrations?google_calendar=connected';

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=callback_failed', request.url)
    );
  }
}
