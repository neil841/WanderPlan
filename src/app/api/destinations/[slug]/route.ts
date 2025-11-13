/**
 * Destination Guide API Endpoint
 *
 * GET /api/destinations/[slug]
 *
 * Fetches destination guide information from Wikipedia.
 * Public endpoint - no authentication required.
 *
 * @param slug - URL-safe destination name (e.g., "paris", "new-york-city")
 * @returns Destination guide with overview, tips, and Wikipedia data
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createDestinationGuide,
  slugToDestination,
} from '@/lib/destinations/wikipedia';

/**
 * GET handler - Fetch destination guide
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Destination slug is required' },
        { status: 400 }
      );
    }

    // Convert slug to destination name
    const destination = slugToDestination(slug);

    // Fetch destination guide from Wikipedia
    const guide = await createDestinationGuide(destination);

    return NextResponse.json(guide, {
      status: 200,
      headers: {
        // Cache for 24 hours (destination guides don't change frequently)
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=172800',
      },
    });
  } catch (error) {
    console.error('Destination guide error:', error);

    if (error instanceof Error) {
      // Handle specific Wikipedia errors
      if (error.message.includes('No Wikipedia page found')) {
        return NextResponse.json(
          {
            error: 'Destination not found',
            details: error.message,
          },
          { status: 404 }
        );
      }

      if (error.message.includes('Wikipedia API error')) {
        return NextResponse.json(
          {
            error: 'Failed to fetch destination data',
            details: error.message,
          },
          { status: 502 } // Bad Gateway
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
