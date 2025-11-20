/**
 * POI Search API Endpoint
 *
 * GET /api/search/poi
 *
 * Searches for Points of Interest (POIs) near a location.
 * Uses OSM Overpass API as primary source, Foursquare as fallback.
 *
 * Query Parameters:
 * - lat: Latitude (required)
 * - lon: Longitude (required)
 * - category: POI category (optional: restaurant, hotel, attraction, etc.)
 * - radius: Search radius in meters (default: 5000, max: 10000)
 * - query: Text search query (optional, overrides category search)
 *
 * @access Protected - Must be authenticated
 * @returns Array of POI results
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  searchPOIsWithOverpass,
  searchPOIsByName,
  POI_CATEGORIES,
  POIResult,
} from '@/lib/search/overpass';
import {
  searchPOIsWithFoursquare,
  isFoursquareAvailable,
} from '@/lib/search/foursquare';

/**
 * GET handler - Search for POIs
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const category = searchParams.get('category') || undefined;
    const radiusParam = searchParams.get('radius');
    const query = searchParams.get('query') || undefined;

    // Validate required parameters
    if (!latParam || !lonParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lon' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);
    const radius = radiusParam ? Math.min(parseInt(radiusParam), 10000) : 5000;

    // Validate coordinates
    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (category) {
      const validCategory = POI_CATEGORIES.find((c) => c.id === category);
      if (!validCategory) {
        return NextResponse.json(
          {
            error: 'Invalid category',
            validCategories: POI_CATEGORIES.map((c) => c.id),
          },
          { status: 400 }
        );
      }
    }

    let results: POIResult[] = [];
    let source: 'overpass' | 'foursquare' | 'both' = 'overpass';
    let errors: string[] = [];

    // Try Overpass API first
    try {
      if (query) {
        // Text search
        results = await searchPOIsByName(query, lat, lon, radius);
      } else {
        // Category search
        results = await searchPOIsWithOverpass(lat, lon, category, radius);
      }

      if (results.length === 0) {
        throw new Error('No results from Overpass');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Overpass search failed';
      errors.push(errorMessage);

      // Fallback to Foursquare if available
      if (isFoursquareAvailable() && !query) {
        // Foursquare doesn't support text search well, only category search
        try {
          results = await searchPOIsWithFoursquare(lat, lon, category, radius);
          source = 'foursquare';
        } catch (fsqError) {
          const fsqErrorMessage =
            fsqError instanceof Error
              ? fsqError.message
              : 'Foursquare search failed';
          errors.push(fsqErrorMessage);
        }
      }
    }

    // If still no results, return error
    if (results.length === 0) {
      return NextResponse.json(
        {
          error: 'No POIs found',
          details: errors.length > 0 ? errors : ['No results from any source'],
        },
        { status: 404 }
      );
    }

    // Return results
    return NextResponse.json(
      {
        results,
        metadata: {
          count: results.length,
          source,
          category,
          location: { lat, lon },
          radius,
          query,
        },
      },
      {
        status: 200,
        headers: {
          // Cache for 1 hour (POIs don't change frequently)
          'Cache-Control': 'private, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('POI search error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'POI search failed',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
