/**
 * OSRM (Open Source Routing Machine) API integration
 *
 * Provides route calculation between coordinates using the free OSRM API.
 * Returns GeoJSON route data with distance and duration information.
 *
 * API Documentation: http://project-osrm.org/docs/v5.24.0/api/
 */

export interface OSRMCoordinate {
  lat: number;
  lon: number;
}

export interface OSRMRouteResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: OSRMWaypoint[];
}

export interface OSRMRoute {
  geometry: string | GeoJSON.LineString; // Encoded polyline or GeoJSON
  legs: OSRMLeg[];
  distance: number; // meters
  duration: number; // seconds
  weight: number;
  weight_name: string;
}

export interface OSRMLeg {
  distance: number; // meters
  duration: number; // seconds
  steps: OSRMStep[];
  summary: string;
}

export interface OSRMStep {
  distance: number;
  duration: number;
  geometry: string | GeoJSON.LineString;
  name: string;
  mode: string;
  maneuver: {
    bearing_after: number;
    bearing_before: number;
    location: [number, number];
    type: string;
    modifier?: string;
  };
}

export interface OSRMWaypoint {
  hint: string;
  distance: number;
  name: string;
  location: [number, number]; // [lon, lat]
}

export interface RouteResult {
  geometry: GeoJSON.LineString;
  distance: number; // meters
  duration: number; // seconds
  distanceKm: number;
  durationMinutes: number;
  durationFormatted: string;
}

/**
 * OSRM public API endpoint
 * Using the public demo server (not for production use at scale)
 */
const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Calculate route between multiple coordinates
 *
 * @param coordinates - Array of coordinates (at least 2)
 * @param profile - Routing profile: 'car', 'bike', 'foot' (default: 'car')
 * @returns Route result with geometry and metadata
 */
export async function calculateRoute(
  coordinates: OSRMCoordinate[],
  profile: 'car' | 'bike' | 'foot' = 'car'
): Promise<RouteResult> {
  if (coordinates.length < 2) {
    throw new Error('At least 2 coordinates are required for routing');
  }

  // Validate coordinates
  for (const coord of coordinates) {
    if (
      coord.lat < -90 ||
      coord.lat > 90 ||
      coord.lon < -180 ||
      coord.lon > 180
    ) {
      throw new Error(`Invalid coordinate: ${coord.lat}, ${coord.lon}`);
    }
  }

  // Format coordinates as lon,lat;lon,lat;...
  const coordString = coordinates
    .map((c) => `${c.lon},${c.lat}`)
    .join(';');

  // Build OSRM API URL
  const url = `${OSRM_BASE_URL}/route/v1/${profile}/${coordString}?overview=full&geometries=geojson&steps=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'WanderPlan/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(
        `OSRM API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OSRMRouteResponse = await response.json();

    if (data.code !== 'Ok') {
      throw new Error(`OSRM routing failed: ${data.code}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found between coordinates');
    }

    const route = data.routes[0];

    // Convert distance and duration to readable formats
    const distanceKm = route.distance / 1000;
    const durationMinutes = Math.round(route.duration / 60);
    const durationFormatted = formatDuration(route.duration);

    return {
      geometry: route.geometry as GeoJSON.LineString,
      distance: route.distance,
      duration: route.duration,
      distanceKm: Math.round(distanceKm * 10) / 10, // 1 decimal place
      durationMinutes,
      durationFormatted,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to calculate route: ${error.message}`);
    }
    throw new Error('Failed to calculate route: Unknown error');
  }
}

/**
 * Format duration in seconds to human-readable string
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "2h 30m", "45m", "5h")
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Calculate route distance (as the crow flies) between two coordinates
 * Uses Haversine formula
 *
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDirectDistance(
  coord1: OSRMCoordinate,
  coord2: OSRMCoordinate
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Simplify a route by keeping only essential waypoints
 * Useful for reducing API calls and improving performance
 *
 * @param coordinates - Array of coordinates
 * @param maxWaypoints - Maximum number of waypoints (default: 25, OSRM limit: 100)
 * @returns Simplified array of coordinates
 */
export function simplifyRoute(
  coordinates: OSRMCoordinate[],
  maxWaypoints: number = 25
): OSRMCoordinate[] {
  if (coordinates.length <= maxWaypoints) {
    return coordinates;
  }

  // Always keep first and last
  const result: OSRMCoordinate[] = [coordinates[0]];

  // Calculate step size
  const step = (coordinates.length - 1) / (maxWaypoints - 1);

  // Add intermediate waypoints
  for (let i = 1; i < maxWaypoints - 1; i++) {
    const index = Math.round(i * step);
    result.push(coordinates[index]);
  }

  // Add last coordinate
  result.push(coordinates[coordinates.length - 1]);

  return result;
}
