/**
 * Trip Route API Endpoint
 *
 * GET /api/trips/[tripId]/route
 *
 * Calculates route between trip events using OSRM API.
 * Returns GeoJSON route data with distance and duration.
 *
 * Query Parameters:
 * - profile: 'car' | 'bike' | 'foot' (default: 'car')
 * - eventIds: Comma-separated event IDs (optional, uses all events if not provided)
 *
 * @access Protected - Must be trip owner or collaborator
 * @returns RouteResult with GeoJSON geometry
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { calculateRoute, OSRMCoordinate, simplifyRoute } from '@/lib/map/osrm';

/**
 * GET handler - Calculate route for trip events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tripId } = params;
    const { searchParams } = new URL(request.url);
    const profile = (searchParams.get('profile') || 'car') as 'car' | 'bike' | 'foot';
    const eventIdsParam = searchParams.get('eventIds');

    // Verify trip access
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { createdBy: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
        deletedAt: null,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Get events with locations
    let events;

    if (eventIdsParam) {
      // Use specific events
      const eventIds = eventIdsParam.split(',');
      events = await prisma.event.findMany({
        where: {
          id: { in: eventIds },
          tripId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          startDateTime: true,
          order: true,
        },
        orderBy: [
          { startDateTime: 'asc' },
          { order: 'asc' },
        ],
      });
    } else {
      // Use all events
      events = await prisma.event.findMany({
        where: {
          tripId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          startDateTime: true,
          order: true,
        },
        orderBy: [
          { startDateTime: 'asc' },
          { order: 'asc' },
        ],
      });
    }

    // Filter events with valid location data
    const eventsWithLocation = events.filter((event) => {
      const location = event.location as any;
      return (
        location &&
        typeof location.lat === 'number' &&
        typeof location.lon === 'number' &&
        !isNaN(location.lat) &&
        !isNaN(location.lon) &&
        location.lat >= -90 &&
        location.lat <= 90 &&
        location.lon >= -180 &&
        location.lon <= 180
      );
    });

    if (eventsWithLocation.length < 2) {
      return NextResponse.json(
        {
          error: 'At least 2 events with valid locations are required to calculate a route',
          eventsCount: eventsWithLocation.length,
        },
        { status: 400 }
      );
    }

    // Extract coordinates
    const coordinates: OSRMCoordinate[] = eventsWithLocation.map((event) => {
      const location = event.location as any;
      return {
        lat: location.lat,
        lon: location.lon,
      };
    });

    // Simplify route if too many waypoints (OSRM limit is 100)
    const simplifiedCoordinates = simplifyRoute(coordinates, 25);

    // Calculate route using OSRM
    const routeResult = await calculateRoute(simplifiedCoordinates, profile);

    // Build response with event context
    const response = {
      route: routeResult,
      events: eventsWithLocation.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        location: event.location,
      })),
      profile,
      metadata: {
        totalEvents: events.length,
        eventsWithLocation: eventsWithLocation.length,
        eventsUsedInRoute: simplifiedCoordinates.length,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Cache for 5 minutes (routes don't change frequently)
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Route calculation error:', error);

    if (error instanceof Error) {
      // Handle specific OSRM errors
      if (error.message.includes('OSRM')) {
        return NextResponse.json(
          {
            error: 'Route calculation failed',
            details: error.message,
          },
          { status: 502 } // Bad Gateway
        );
      }

      // Handle validation errors
      if (error.message.includes('coordinates')) {
        return NextResponse.json(
          {
            error: 'Invalid coordinates',
            details: error.message,
          },
          { status: 400 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
