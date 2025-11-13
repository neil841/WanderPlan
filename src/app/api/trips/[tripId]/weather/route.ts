/**
 * Trip Weather API Endpoint
 *
 * GET /api/trips/[tripId]/weather
 *
 * Fetches weather forecast for trip destination.
 * Requires OpenWeatherMap API key to be configured.
 *
 * @access Protected - Must be trip owner or collaborator
 * @returns Weather forecast for trip duration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import {
  fetchWeatherForecast,
  isWeatherApiAvailable,
  WeatherForecast,
} from '@/lib/weather/openweather';
import { differenceInDays } from 'date-fns';

/**
 * GET handler - Fetch weather forecast for trip
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

    // Check if weather API is available
    if (!isWeatherApiAvailable()) {
      return NextResponse.json(
        {
          error: 'Weather service not available',
          details: 'OpenWeatherMap API key not configured',
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Verify trip access
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { ownerId: session.user.id },
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
      select: {
        id: true,
        destination: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Check if trip has dates
    if (!trip.startDate || !trip.endDate) {
      return NextResponse.json(
        {
          error: 'Trip dates not set',
          details: 'Trip must have start and end dates for weather forecast',
        },
        { status: 400 }
      );
    }

    // Get trip destination coordinates
    // Try to get from first event with location
    const eventWithLocation = await prisma.event.findFirst({
      where: {
        tripId,
        deletedAt: null,
      },
      select: {
        location: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    let lat: number | undefined;
    let lon: number | undefined;
    let locationName = trip.destination;

    if (eventWithLocation?.location) {
      const location = eventWithLocation.location as any;
      if (
        location.lat &&
        location.lon &&
        !isNaN(location.lat) &&
        !isNaN(location.lon)
      ) {
        lat = location.lat;
        lon = location.lon;
        locationName = location.name || trip.destination;
      }
    }

    // If no coordinates from events, we can't fetch weather
    if (lat === undefined || lon === undefined) {
      return NextResponse.json(
        {
          error: 'No location data',
          details:
            'Trip must have at least one event with location data for weather forecast',
        },
        { status: 400 }
      );
    }

    // Calculate number of days in trip
    const tripDays = differenceInDays(trip.endDate, trip.startDate) + 1;

    // Fetch weather forecast
    const forecasts = await fetchWeatherForecast(lat, lon, tripDays);

    // Filter forecasts to trip dates only
    const tripStartDate = new Date(trip.startDate);
    const tripEndDate = new Date(trip.endDate);

    const filteredForecasts = forecasts.filter((forecast) => {
      const forecastDate = new Date(forecast.date);
      return forecastDate >= tripStartDate && forecastDate <= tripEndDate;
    });

    return NextResponse.json(
      {
        location: {
          name: locationName,
          lat,
          lon,
        },
        tripDates: {
          start: trip.startDate,
          end: trip.endDate,
        },
        forecasts: filteredForecasts,
      },
      {
        status: 200,
        headers: {
          // Cache for 1 hour (weather data changes frequently)
          'Cache-Control': 'private, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Weather forecast error:', error);

    if (error instanceof Error) {
      // Handle specific OpenWeatherMap errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            error: 'Weather service configuration error',
            details: error.message,
          },
          { status: 503 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'Weather service rate limit exceeded',
            details: 'Please try again later',
          },
          { status: 429 }
        );
      }

      // Handle coordinate errors
      if (error.message.includes('coordinates')) {
        return NextResponse.json(
          {
            error: 'Invalid location coordinates',
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
