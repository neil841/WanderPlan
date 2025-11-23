/**
 * useAirportSearch Hook
 *
 * Hook for searching airports using a local database with debouncing.
 * Searches by airport code (IATA/ICAO), name, or city.
 *
 * @module useAirportSearch
 */

import { useState, useEffect } from 'react';

export interface Airport {
  iata: string; // 3-letter code (e.g., JFK)
  icao: string; // 4-letter code (e.g., KJFK)
  name: string; // Airport name
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

/**
 * Hook for airport autocomplete
 * Searches a curated list of major airports
 */
export function useAirportSearch(query: string, delay: number = 300) {
  const [results, setResults] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset if query is too short
    if (!query || query.length < 2) {
      setResults([]);
      return undefined;
    }

    // Debounce search
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/airports/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error('Failed to search airports');
        }

        const data = await response.json();
        setResults(data.airports || []);
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
