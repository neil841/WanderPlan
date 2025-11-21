/**
 * POI Search Component
 *
 * Search for Points of Interest (restaurants, hotels, attractions, etc.)
 * near the current map location. Integrates with OSM Overpass and Foursquare APIs.
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { POIResult as POIResultComponent } from './POIResult';
import { POI_CATEGORIES, POIResult } from '@/lib/search/overpass';

interface POISearchProps {
  tripId: string;
  center: { lat: number; lon: number };
  onSelectPOI?: (poi: POIResult) => void;
  onClose?: () => void;
}

interface POISearchResponse {
  results: POIResult[];
  metadata: {
    count: number;
    source: string;
    category?: string;
    location: { lat: number; lon: number };
    radius: number;
    query?: string;
  };
}

/**
 * Fetch POIs from API
 */
async function fetchPOIs(
  lat: number,
  lon: number,
  category?: string,
  query?: string,
  radius: number = 5000
): Promise<POISearchResponse> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    radius: radius.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  if (query) {
    params.append('query', query);
  }

  const response = await fetch(`/api/search/poi?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to fetch POIs');
  }

  return response.json();
}

export function POISearch({ tripId, center, onSelectPOI, onClose }: POISearchProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(5000);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch POIs
  const {
    data: poiData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pois', center.lat, center.lon, selectedCategory, searchQuery, searchRadius],
    queryFn: () =>
      fetchPOIs(center.lat, center.lon, selectedCategory || undefined, searchQuery || undefined, searchRadius),
    enabled: isSearching,
    staleTime: 3600000, // 1 hour
    retry: 1,
  });

  // Handle search
  const handleSearch = () => {
    setIsSearching(true);
    refetch();
  };

  // Handle category select
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    setSearchQuery(''); // Clear text search when selecting category
  };

  // Handle text search
  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedCategory(''); // Clear category when doing text search
      handleSearch();
    }
  };

  const pois = poiData?.results || [];

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 w-[380px] max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Search POIs</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search input */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleTextSearch} className="flex gap-2">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!searchQuery.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Category filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Categories</div>
        <div className="flex flex-wrap gap-2">
          {POI_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                handleCategorySelect(category.id);
                setIsSearching(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Radius selector */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700">Search radius:</span>
          <span className="font-medium text-gray-900">{searchRadius / 1000} km</span>
        </div>
        <input
          type="range"
          min="1000"
          max="10000"
          step="1000"
          value={searchRadius}
          onChange={(e) => setSearchRadius(parseInt(e.target.value))}
          className="w-full mt-2 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!isSearching && (
          <div className="p-8 text-center text-gray-500 text-sm">
            Select a category or search by name to find POIs
          </div>
        )}

        {isSearching && isLoading && (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-sm text-gray-600">Searching...</p>
          </div>
        )}

        {isSearching && error && (
          <div className="p-4 m-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">
              {error instanceof Error ? error.message : 'Search failed'}
            </p>
          </div>
        )}

        {isSearching && !isLoading && !error && pois.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No POIs found in this area
          </div>
        )}

        {isSearching && !isLoading && pois.length > 0 && (
          <div className="divide-y divide-gray-100">
            {pois.map((poi) => (
              <POIResultComponent
                key={poi.id}
                poi={poi}
                onSelect={onSelectPOI}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {isSearching && poiData && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
          {poiData.metadata.count} results from {poiData.metadata.source}
        </div>
      )}
    </div>
  );
}
