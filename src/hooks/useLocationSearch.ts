/**
 * useLocationSearch Hook
 *
 * Hook for searching locations using Nominatim API with debouncing.
 *
 * @module useLocationSearch
 */

import { useState, useEffect } from 'react';
import { EventLocation } from '@/types/event';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}

/**
 * Hook for location autocomplete using Nominatim API
 */
export function useLocationSearch(query: string, delay: number = 500) {
  const [results, setResults] = useState<EventLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset if query is too short
    if (!query || query.length < 3) {
      setResults([]);
      return undefined;
    }

    // Debounce search
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'WanderPlan/1.0',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to search locations');
        }

        const data: NominatimResult[] = await response.json();

        // Transform to EventLocation format
        const locations: EventLocation[] = data.map((result) => {
          const locationName = result.name ?? result.display_name.split(',')[0] ?? 'Unknown';
          return {
            name: locationName.trim(),
            address: result.display_name,
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
          };
        });

        setResults(locations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, delay]);

  return { results, isLoading, error };
}
