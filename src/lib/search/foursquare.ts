/**
 * Foursquare Places API integration (fallback for POI search)
 *
 * Provides 10,000 free API calls per month.
 * Requires API key from Foursquare Developer Portal.
 *
 * API Documentation: https://docs.foursquare.com/developer/reference/places-api-overview
 */

import { POIResult } from './overpass';

/**
 * Foursquare API endpoint
 */
const FOURSQUARE_API_URL = 'https://api.foursquare.com/v3/places/search';

/**
 * Foursquare category IDs mapping
 * Full list: https://docs.foursquare.com/data-products/docs/categories
 */
const FOURSQUARE_CATEGORIES: Record<string, string> = {
  restaurant: '13065', // Dining and Drinking > Restaurant
  cafe: '13032',       // Dining and Drinking > Cafe
  hotel: '19014',      // Travel and Transportation > Hotel
  attraction: '16000', // Arts and Entertainment
  museum: '16020',     // Arts and Entertainment > Museum
  park: '16032',       // Arts and Entertainment > Park
  shopping: '17000',   // Retail
  bar: '13003',        // Dining and Drinking > Bar
};

/**
 * Foursquare API response interface
 */
interface FoursquareResponse {
  results: FoursquarePlace[];
}

interface FoursquarePlace {
  fsq_id: string;
  name: string;
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  location: {
    formatted_address?: string;
    address?: string;
    locality?: string;
    region?: string;
    country?: string;
  };
  categories: Array<{
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  rating?: number;
  price?: number; // 1-4
}

/**
 * Search for POIs using Foursquare Places API
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @param category - POI category ID
 * @param radius - Search radius in meters (max: 100000)
 * @param apiKey - Foursquare API key (from environment variable)
 * @returns Array of POI results
 */
export async function searchPOIsWithFoursquare(
  lat: number,
  lon: number,
  category?: string,
  radius: number = 5000,
  apiKey?: string
): Promise<POIResult[]> {
  // Get API key from parameter or environment variable
  const key = apiKey || process.env.FOURSQUARE_API_KEY;

  if (!key) {
    throw new Error('Foursquare API key not configured');
  }

  // Validate coordinates
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error(`Invalid coordinates: ${lat}, ${lon}`);
  }

  // Build query parameters
  const params = new URLSearchParams({
    ll: `${lat},${lon}`,
    radius: Math.min(radius, 100000).toString(), // Max 100km
    limit: '50',
  });

  // Add category if specified
  if (category && FOURSQUARE_CATEGORIES[category]) {
    params.append('categories', FOURSQUARE_CATEGORIES[category]);
  }

  try {
    const response = await fetch(`${FOURSQUARE_API_URL}?${params}`, {
      headers: {
        'Authorization': key,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Foursquare API key');
      }
      if (response.status === 429) {
        throw new Error('Foursquare rate limit exceeded');
      }
      throw new Error(`Foursquare API error: ${response.status}`);
    }

    const data: FoursquareResponse = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    // Transform Foursquare data to POIResult format
    const results: POIResult[] = data.results.map((place) => {
      // Build address
      const address = place.location.formatted_address ||
        [
          place.location.address,
          place.location.locality,
          place.location.region,
        ]
          .filter(Boolean)
          .join(', ');

      // Determine category
      let resultCategory = category || 'other';
      if (place.categories && place.categories.length > 0) {
        const fsqCategoryId = place.categories[0].id.toString();
        const matchedCategory = Object.entries(FOURSQUARE_CATEGORIES).find(
          ([_, id]) => id === fsqCategoryId
        );
        if (matchedCategory) {
          resultCategory = matchedCategory[0];
        }
      }

      return {
        id: `fsq-${place.fsq_id}`,
        name: place.name,
        category: resultCategory,
        location: {
          lat: place.geocodes.main.latitude,
          lon: place.geocodes.main.longitude,
        },
        address,
        rating: place.rating ? place.rating / 2 : undefined, // Foursquare uses 0-10, we use 0-5
        priceLevel: place.price,
        source: 'foursquare' as const,
      };
    });

    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Foursquare search failed: ${error.message}`);
    }
    throw new Error('Foursquare search failed: Unknown error');
  }
}

/**
 * Check if Foursquare API is available
 *
 * @returns True if API key is configured
 */
export function isFoursquareAvailable(): boolean {
  return !!process.env.FOURSQUARE_API_KEY;
}
