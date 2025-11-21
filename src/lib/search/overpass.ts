/**
 * OSM Overpass API integration for POI search
 *
 * Overpass is a read-only API for OpenStreetMap data.
 * Free to use with rate limits (no API key required).
 *
 * API Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

export interface POICategory {
  id: string;
  name: string;
  osmKey: string;
  osmValue: string;
}

export interface POIResult {
  id: string;
  name: string;
  category: string;
  location: {
    lat: number;
    lon: number;
  };
  address?: string;
  rating?: number;
  priceLevel?: number;
  source: 'osm' | 'foursquare';
  osmType?: 'node' | 'way' | 'relation';
  osmTags?: Record<string, string>;
}

/**
 * POI categories supported by OSM
 */
export const POI_CATEGORIES: POICategory[] = [
  { id: 'restaurant', name: 'Restaurants', osmKey: 'amenity', osmValue: 'restaurant' },
  { id: 'cafe', name: 'Cafes', osmKey: 'amenity', osmValue: 'cafe' },
  { id: 'hotel', name: 'Hotels', osmKey: 'tourism', osmValue: 'hotel' },
  { id: 'attraction', name: 'Attractions', osmKey: 'tourism', osmValue: 'attraction' },
  { id: 'museum', name: 'Museums', osmKey: 'tourism', osmValue: 'museum' },
  { id: 'park', name: 'Parks', osmKey: 'leisure', osmValue: 'park' },
  { id: 'shopping', name: 'Shopping', osmKey: 'shop', osmValue: '*' },
  { id: 'bar', name: 'Bars', osmKey: 'amenity', osmValue: 'bar' },
];

/**
 * Overpass API endpoint
 */
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Build Overpass QL query for POI search
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @param radius - Search radius in meters (default: 5000)
 * @param osmKey - OSM tag key (e.g., 'amenity')
 * @param osmValue - OSM tag value (e.g., 'restaurant')
 * @returns Overpass QL query string
 */
function buildOverpassQuery(
  lat: number,
  lon: number,
  radius: number,
  osmKey: string,
  osmValue: string
): string {
  // If osmValue is *, search for any value
  const valueFilter = osmValue === '*' ? '' : `="${osmValue}"`;

  return `
[out:json][timeout:25];
(
  node["${osmKey}"${valueFilter}](around:${radius},${lat},${lon});
  way["${osmKey}"${valueFilter}](around:${radius},${lat},${lon});
  relation["${osmKey}"${valueFilter}](around:${radius},${lat},${lon});
);
out center tags 100;
  `.trim();
}

/**
 * Search for POIs near a location using OSM Overpass API
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @param category - POI category ID
 * @param radius - Search radius in meters (default: 5000)
 * @returns Array of POI results
 */
export async function searchPOIsWithOverpass(
  lat: number,
  lon: number,
  category?: string,
  radius: number = 5000
): Promise<POIResult[]> {
  // Validate coordinates
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error(`Invalid coordinates: ${lat}, ${lon}`);
  }

  // Get category info
  let categoryInfo: POICategory | undefined;
  if (category) {
    categoryInfo = POI_CATEGORIES.find((c) => c.id === category);
    if (!categoryInfo) {
      throw new Error(`Unknown category: ${category}`);
    }
  } else {
    // Default to attractions if no category specified
    categoryInfo = POI_CATEGORIES.find((c) => c.id === 'attraction');
  }

  if (!categoryInfo) {
    throw new Error('Category information not found');
  }

  // Build query
  const query = buildOverpassQuery(
    lat,
    lon,
    radius,
    categoryInfo.osmKey,
    categoryInfo.osmValue
  );

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.elements || !Array.isArray(data.elements)) {
      return [];
    }

    // Transform OSM data to POIResult format
    const results: POIResult[] = data.elements
      .filter((element: any) => {
        // Must have a name
        if (!element.tags?.name) return false;

        // Must have coordinates
        if (element.type === 'node' && element.lat && element.lon) return true;
        if (element.center && element.center.lat && element.center.lon) return true;

        return false;
      })
      .map((element: any) => {
        // Get coordinates
        const poiLat = element.lat || element.center?.lat;
        const poiLon = element.lon || element.center?.lon;

        // Build address from tags
        const addressParts = [];
        if (element.tags['addr:street']) {
          addressParts.push(element.tags['addr:street']);
        }
        if (element.tags['addr:city']) {
          addressParts.push(element.tags['addr:city']);
        }
        const address = addressParts.length > 0 ? addressParts.join(', ') : undefined;

        return {
          id: `osm-${element.type}-${element.id}`,
          name: element.tags.name,
          category: categoryInfo!.id,
          location: {
            lat: poiLat,
            lon: poiLon,
          },
          address,
          source: 'osm' as const,
          osmType: element.type,
          osmTags: element.tags,
        };
      });

    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Overpass search failed: ${error.message}`);
    }
    throw new Error('Overpass search failed: Unknown error');
  }
}

/**
 * Search for POIs by name and location
 *
 * @param query - Search query string
 * @param lat - Latitude
 * @param lon - Longitude
 * @param radius - Search radius in meters (default: 5000)
 * @returns Array of POI results
 */
export async function searchPOIsByName(
  query: string,
  lat: number,
  lon: number,
  radius: number = 5000
): Promise<POIResult[]> {
  const overpassQuery = `
[out:json][timeout:25];
(
  node["name"~"${query}",i](around:${radius},${lat},${lon});
  way["name"~"${query}",i](around:${radius},${lat},${lon});
);
out center tags 50;
  `.trim();

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.elements || !Array.isArray(data.elements)) {
      return [];
    }

    const results: POIResult[] = data.elements
      .filter((element: any) => element.tags?.name)
      .map((element: any) => {
        const poiLat = element.lat || element.center?.lat;
        const poiLon = element.lon || element.center?.lon;

        // Try to determine category from tags
        let category = 'other';
        if (element.tags.amenity) {
          const cat = POI_CATEGORIES.find(
            (c) => c.osmKey === 'amenity' && c.osmValue === element.tags.amenity
          );
          if (cat) category = cat.id;
        } else if (element.tags.tourism) {
          const cat = POI_CATEGORIES.find(
            (c) => c.osmKey === 'tourism' && c.osmValue === element.tags.tourism
          );
          if (cat) category = cat.id;
        }

        return {
          id: `osm-${element.type}-${element.id}`,
          name: element.tags.name,
          category,
          location: {
            lat: poiLat,
            lon: poiLon,
          },
          address: element.tags['addr:street']
            ? `${element.tags['addr:street']}, ${element.tags['addr:city'] || ''}`
            : undefined,
          source: 'osm' as const,
          osmType: element.type,
          osmTags: element.tags,
        };
      });

    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Overpass name search failed: ${error.message}`);
    }
    throw new Error('Overpass name search failed: Unknown error');
  }
}
