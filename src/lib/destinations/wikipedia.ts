/**
 * Wikipedia API integration for destination guides
 *
 * Uses the Wikipedia REST API to fetch destination information.
 * Free to use with no API key required.
 *
 * API Documentation: https://www.mediawiki.org/wiki/API:Main_page
 */

export interface WikipediaPage {
  title: string;
  extract: string;
  description?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  coordinates?: {
    lat: number;
    lon: number;
  };
  url: string;
}

export interface DestinationGuide {
  name: string;
  description: string;
  overview: string;
  imageUrl?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  topAttractions?: string[];
  bestTimeToVisit?: string;
  budgetTips?: string[];
  wikiUrl: string;
}

/**
 * Wikipedia API base URL
 */
const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1';

/**
 * Fetch Wikipedia page summary for a destination
 *
 * @param destination - Destination name (e.g., "Paris", "Tokyo", "New York City")
 * @returns Wikipedia page data
 */
export async function fetchWikipediaPage(
  destination: string
): Promise<WikipediaPage> {
  // Encode destination for URL
  const encodedDest = encodeURIComponent(destination);

  try {
    const response = await fetch(
      `${WIKIPEDIA_API_BASE}/page/summary/${encodedDest}`,
      {
        headers: {
          'User-Agent': 'WanderPlan/1.0 (Travel Planning App)',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No Wikipedia page found for "${destination}"`);
      }
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      title: data.title,
      extract: data.extract,
      description: data.description,
      thumbnail: data.thumbnail
        ? {
            source: data.thumbnail.source,
            width: data.thumbnail.width,
            height: data.thumbnail.height,
          }
        : undefined,
      coordinates: data.coordinates
        ? {
            lat: data.coordinates.lat,
            lon: data.coordinates.lon,
          }
        : undefined,
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodedDest}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Wikipedia data: ${error.message}`);
    }
    throw new Error('Failed to fetch Wikipedia data: Unknown error');
  }
}

/**
 * Create a destination guide from Wikipedia data
 *
 * @param destination - Destination name
 * @returns Structured destination guide
 */
export async function createDestinationGuide(
  destination: string
): Promise<DestinationGuide> {
  const wikiPage = await fetchWikipediaPage(destination);

  // Extract sections from the extract (simple text parsing)
  const overview = wikiPage.extract;

  // Generate destination guide
  return {
    name: wikiPage.title,
    description: wikiPage.description || `Travel guide for ${wikiPage.title}`,
    overview,
    imageUrl: wikiPage.thumbnail?.source,
    coordinates: wikiPage.coordinates,
    wikiUrl: wikiPage.url,
    // These would ideally come from structured data or a travel API
    // For now, we'll provide generic content
    bestTimeToVisit: generateBestTimeToVisit(wikiPage.title),
    budgetTips: generateBudgetTips(wikiPage.title),
  };
}

/**
 * Generate best time to visit content (placeholder)
 * In a real app, this would come from a travel API or curated content
 */
function generateBestTimeToVisit(destination: string): string {
  return `The best time to visit ${destination} depends on your preferences for weather, crowds, and activities. Research seasonal patterns for optimal planning.`;
}

/**
 * Generate budget tips (placeholder)
 * In a real app, this would come from a travel API or curated content
 */
function generateBudgetTips(destination: string): string[] {
  return [
    'Book accommodations in advance for better rates',
    'Use public transportation instead of taxis',
    'Eat at local restaurants away from tourist areas',
    'Look for free walking tours and attractions',
    'Purchase attraction passes for multiple sites',
  ];
}

/**
 * Search for destinations by name
 *
 * @param query - Search query
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of search results
 */
export async function searchDestinations(
  query: string,
  limit: number = 10
): Promise<Array<{ title: string; description?: string }>> {
  const encodedQuery = encodeURIComponent(query);

  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodedQuery}&limit=${limit}&namespace=0&format=json`,
      {
        headers: {
          'User-Agent': 'WanderPlan/1.0 (Travel Planning App)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Wikipedia search error: ${response.status}`);
    }

    const data = await response.json();

    // OpenSearch API returns [query, [titles], [descriptions], [urls]]
    const titles = data[1] || [];
    const descriptions = data[2] || [];

    return titles.map((title: string, index: number) => ({
      title,
      description: descriptions[index] || undefined,
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search destinations: ${error.message}`);
    }
    throw new Error('Failed to search destinations: Unknown error');
  }
}

/**
 * Convert destination name to URL slug
 *
 * @param destination - Destination name
 * @returns URL-safe slug
 */
export function destinationToSlug(destination: string): string {
  return destination
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert slug back to destination name
 *
 * @param slug - URL slug
 * @returns Destination name (title case)
 */
export function slugToDestination(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
