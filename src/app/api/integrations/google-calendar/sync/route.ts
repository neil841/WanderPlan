/**
 * Google Calendar Sync Endpoint
 *
 * Syncs trip events to Google Calendar.
 *
 * @endpoint POST /api/integrations/google-calendar/sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import {
  createAuthenticatedClient,
  createCalendarEvents,
  refreshAccessToken,
} from '@/lib/integrations/google-calendar';
import { z } from 'zod';

/**
 * Request body validation schema
 */
const syncRequestSchema = z.object({
  tripId: z.string().uuid(),
});

/**
 * POST /api/integrations/google-calendar/sync
 *
 * Syncs all trip events to Google Calendar
 *
 * Request body:
 * - tripId: UUID of the trip to sync
 *
 * @returns Sync results with success/failure counts
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = syncRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { tripId } = validationResult.data;

    // Get user with Google Calendar tokens
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        googleCalendarAccessToken: true,
        googleCalendarRefreshToken: true,
        googleCalendarTokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has connected Google Calendar
    if (!user.googleCalendarAccessToken || !user.googleCalendarRefreshToken) {
      return NextResponse.json(
        {
          error: 'Google Calendar not connected',
          message: 'Please connect your Google Calendar account first',
        },
        { status: 400 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = user.googleCalendarAccessToken;
    const tokenExpiry = user.googleCalendarTokenExpiry;

    if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
      // Token expired, refresh it
      try {
        const newTokens = await refreshAccessToken(user.googleCalendarRefreshToken);
        accessToken = newTokens.access_token;

        // Update user with new tokens
        await prisma.user.update({
          where: { id: user.id },
          data: {
            googleCalendarAccessToken: accessToken,
            googleCalendarTokenExpiry: new Date(newTokens.expiry_date),
          },
        });
      } catch (error) {
        console.error('Failed to refresh Google Calendar token:', error);
        return NextResponse.json(
          {
            error: 'Failed to refresh Google Calendar token',
            message: 'Please reconnect your Google Calendar account',
          },
          { status: 401 }
        );
      }
    }

    // Get trip with events
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        events: {
          orderBy: [
            { startDateTime: 'asc' },
            { order: 'asc' },
          ],
        },
        collaborators: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Check access permission
    const isOwner = trip.userId === session.user.id;
    const isCollaborator = trip.collaborators.length > 0;

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // If no events, return early
    if (trip.events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No events to sync',
        results: {
          total: 0,
          success: 0,
          failed: 0,
          errors: [],
        },
      });
    }

    // Create authenticated Google Calendar client
    const oauth2Client = createAuthenticatedClient(
      accessToken,
      user.googleCalendarRefreshToken,
      tokenExpiry ? new Date(tokenExpiry).getTime() : undefined
    );

    // Sync events to Google Calendar
    const syncResults = await createCalendarEvents(
      oauth2Client,
      trip.events,
      trip.title
    );

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResults.success} of ${trip.events.length} events to Google Calendar`,
      results: {
        total: trip.events.length,
        success: syncResults.success,
        failed: syncResults.failed,
        errors: syncResults.errors,
      },
    });
  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync with Google Calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
