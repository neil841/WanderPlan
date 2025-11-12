'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FilterValues {
  search: string;
  status: 'active' | 'archived' | 'all';
  sort: 'createdAt' | 'startDate' | 'endDate' | 'name';
  order: 'asc' | 'desc';
  tags: string[];
}

interface TripFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableTags?: Array<{ id: string; name: string; color: string | null }>;
  showAdvanced?: boolean;
}

/**
 * TripFilters component provides search, filtering, and sorting controls
 * Features debounced search and tag filtering
 */
export function TripFilters({
  filters,
  onFiltersChange,
  availableTags = [],
  showAdvanced = false,
}: TripFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(showAdvanced);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleStatusChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      status: value as 'active' | 'archived' | 'all',
    });
  }, [filters, onFiltersChange]);

  const handleSortChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      sort: value as 'createdAt' | 'startDate' | 'endDate' | 'name',
    });
  }, [filters, onFiltersChange]);

  const handleOrderChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      order: value as 'asc' | 'desc',
    });
  }, [filters, onFiltersChange]);

  const handleTagToggle = useCallback((tagName: string) => {
    const newTags = filters.tags.includes(tagName)
      ? filters.tags.filter((t) => t !== tagName)
      : [...filters.tags, tagName];

    onFiltersChange({
      ...filters,
      tags: newTags,
    });
  }, [filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      status: 'active',
      sort: 'createdAt',
      order: 'desc',
      tags: [],
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'active' ||
    filters.sort !== 'createdAt' ||
    filters.order !== 'desc' ||
    filters.tags.length > 0;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search trips by name or destination..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active Trips</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All Trips</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={filters.sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="startDate">Start Date</SelectItem>
            <SelectItem value="endDate">End Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={filters.order} onValueChange={handleOrderChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        {/* Toggle Advanced Filters */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-primary/10' : ''}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = filters.tags.includes(tag.name);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={
                        isSelected && tag.color
                          ? { backgroundColor: tag.color, borderColor: tag.color }
                          : !isSelected && tag.color
                          ? { borderColor: tag.color, color: tag.color }
                          : undefined
                      }
                      onClick={() => handleTagToggle(tag.name)}
                    >
                      {tag.name}
                      {isSelected && <X className="ml-1 w-3 h-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary">
              Search: {filters.search}
              <button
                onClick={() => setSearchValue('')}
                className="ml-1 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.status !== 'active' && (
            <Badge variant="secondary">
              Status: {filters.status}
              <button
                onClick={() => handleStatusChange('active')}
                className="ml-1 hover:text-foreground"
                aria-label="Reset status"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              Tag: {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:text-foreground"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
