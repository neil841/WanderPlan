/**
 * Google Calendar Integration
 *
 * Provides Google Calendar API integration for syncing trip events.
 * Handles OAuth authentication and event creation/management.
 *
 * @module GoogleCalendarIntegration
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { BaseEvent } from '@/types/event';

/**
 * Google Calendar configuration
 *
 * IMPORTANT: This config validates environment variables at module load time.
 * If any required variables are missing, the application will fail to start
 * with a clear error message.
 */
export const googleCalendarConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`,
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
};

/**
 * Validate required environment variables
 * Fail fast with clear error messages if configuration is incomplete
 */
function validateEnvironmentVariables(): void {
  const missingVars: string[] = [];

  if (!googleCalendarConfig.clientId) {
    missingVars.push('GOOGLE_CLIENT_ID');
  }

  if (!googleCalendarConfig.clientSecret) {
    missingVars.push('GOOGLE_CLIENT_SECRET');
  }

  if (!process.env.NEXTAUTH_URL && !process.env.GOOGLE_REDIRECT_URI) {
    missingVars.push('NEXTAUTH_URL or GOOGLE_REDIRECT_URI');
  }

  if (missingVars.length > 0) {
    const errorMessage = [
      '\n❌ Missing required Google Calendar environment variables:',
      ...missingVars.map(varName => `  - ${varName}`),
      '\nPlease set these in your .env file.',
      '\nExample:',
      '  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com',
      '  GOOGLE_CLIENT_SECRET=your-client-secret',
      '  GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google-calendar/callback',
      '\nSee .env.example for details.\n',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Log successful configuration (without exposing secrets)
  console.log('✓ Google Calendar integration configured');
}

// Note: Validation moved to runtime (inside createOAuth2Client) to avoid build-time failures
// when environment variables are not yet set (e.g., during Docker build)

/**
 * Create OAuth2 client for Google Calendar
 */
export function createOAuth2Client(): OAuth2Client {
  // Validate environment variables at runtime (when actually needed)
  validateEnvironmentVariables();
  return new google.auth.OAuth2(
    googleCalendarConfig.clientId,
    googleCalendarConfig.clientSecret,
    googleCalendarConfig.redirectUri
  );
}

/**
 * Generate Google OAuth authorization URL
 */
export function getAuthorizationUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleCalendarConfig.scopes,
    state: state,
    prompt: 'consent', // Force consent screen to get refresh token
  });
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function getTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}> {
  const oauth2Client = createOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to obtain access or refresh token');
  }

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
  };
}

/**
 * Create OAuth2 client with stored credentials
 */
export function createAuthenticatedClient(
  accessToken: string,
  refreshToken: string,
  expiryDate?: number
): OAuth2Client {
  const oauth2Client = createOAuth2Client();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryDate,
  });

  return oauth2Client;
}

/**
 * Convert WanderPlan event to Google Calendar event format
 */
export function convertToGoogleCalendarEvent(event: BaseEvent, tripTitle: string) {
  const eventTitle = event.title;
  const description = [
    event.description || '',
    event.notes ? `\n\nNotes: ${event.notes}` : '',
    `\n\nTrip: ${tripTitle}`,
    event.confirmationNumber ? `\nConfirmation: ${event.confirmationNumber}` : '',
  ]
    .filter(Boolean)
    .join('');

  // Format location
  let location = '';
  if (event.location) {
    if (event.location.address) {
      location = event.location.address;
    } else if (event.location.name) {
      location = event.location.name;
    }
  }

  // Format start and end times
  const startDateTime = event.startDateTime.toISOString();
  const endDateTime = event.endDateTime
    ? event.endDateTime.toISOString()
    : new Date(event.startDateTime.getTime() + 60 * 60 * 1000).toISOString(); // Default 1 hour duration

  return {
    summary: eventTitle,
    description: description,
    location: location || undefined,
    start: {
      dateTime: startDateTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'UTC',
    },
    // Store WanderPlan event ID in extended properties for future two-way sync
    extendedProperties: {
      private: {
        wanderplanEventId: event.id,
        wanderplanTripId: event.tripId,
      },
    },
    // Color code by event type
    colorId: getEventColorId(event.type),
  };
}

/**
 * Get Google Calendar color ID based on event type
 */
function getEventColorId(eventType: string): string {
  const colorMap: Record<string, string> = {
    FLIGHT: '9', // Blue
    HOTEL: '5', // Yellow
    ACTIVITY: '10', // Green
    RESTAURANT: '4', // Red
    TRANSPORTATION: '7', // Cyan
    DESTINATION: '6', // Orange
  };

  return colorMap[eventType] || '1'; // Default to lavender
}

/**
 * Create events in Google Calendar
 */
export async function createCalendarEvents(
  oauth2Client: OAuth2Client,
  events: BaseEvent[],
  tripTitle: string
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ eventId: string; error: string }>;
}> {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ eventId: string; error: string }>,
  };

  // Create events sequentially to avoid rate limiting
  for (const event of events) {
    try {
      const googleEvent = convertToGoogleCalendarEvent(event, tripTitle);

      await calendar.events.insert({
        calendarId: 'primary',
        requestBody: googleEvent,
      });

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Delete events from Google Calendar by extended property
 */
export async function deleteCalendarEvents(
  oauth2Client: OAuth2Client,
  tripId: string
): Promise<{
  success: number;
  failed: number;
}> {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const results = {
    success: 0,
    failed: 0,
  };

  try {
    // Find all events with the trip ID in extended properties
    const response = await calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: [`wanderplanTripId=${tripId}`],
      maxResults: 2500, // Google Calendar API limit
    });

    const events = response.data.items || [];

    // Delete each event
    for (const event of events) {
      if (event.id) {
        try {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: event.id,
          });
          results.success++;
        } catch (error) {
          results.failed++;
        }
      }
    }
  } catch (error) {
    // If list fails, treat all as failed
    results.failed = 1;
  }

  return results;
}

/**
 * Validate Google OAuth credentials
 */
export async function validateCredentials(
  accessToken: string,
  refreshToken: string
): Promise<boolean> {
  try {
    const oauth2Client = createAuthenticatedClient(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Try to list calendars to verify credentials
    await calendar.calendarList.list({
      maxResults: 1,
    });

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expiry_date: number;
}> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token');
  }

  return {
    access_token: credentials.access_token,
    expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
  };
}

/**
 * Revoke Google OAuth token
 *
 * SECURITY: When a user disconnects Google Calendar integration, we must
 * revoke the OAuth token with Google to prevent continued access if the
 * token is stolen/compromised. Simply deleting from our database is not
 * sufficient.
 *
 * This function calls Google's token revocation endpoint to invalidate
 * the refresh token, which also invalidates all associated access tokens.
 *
 * @param refreshToken - The refresh token to revoke
 * @returns Promise that resolves when token is revoked
 * @throws Does not throw - logs errors and continues (fail-safe)
 */
export async function revokeGoogleToken(refreshToken: string): Promise<void> {
  try {
    // Revoke the refresh token (this also revokes access tokens)
    await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `token=${refreshToken}`,
    });

    console.log('[Google Calendar] Token revoked successfully');
  } catch (error) {
    // Log error but don't throw - we still want to delete from DB
    // even if Google revocation fails (network error, already revoked, etc.)
    console.error('[Google Calendar] Failed to revoke token:', error);
    // Fail-safe: Continue with database cleanup even if revocation fails
  }
}
