'use client';

/**
 * LocationAutocomplete Component
 *
 * Location search component with autocomplete using Nominatim API.
 * Features debounced search, dropdown results, and loading states.
 *
 * @component
 */

import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { EventLocation } from '@/types/event';

interface LocationAutocompleteProps {
  value?: EventLocation | null;
  onChange: (location: EventLocation | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Location autocomplete component with Nominatim search
 *
 * Features:
 * - Debounced search (500ms)
 * - Dropdown results with addresses
 * - Loading states
 * - Accessibility compliant
 *
 * @example
 * <LocationAutocomplete
 *   value={location}
 *   onChange={setLocation}
 *   placeholder="Search for a location..."
 * />
 */
export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search for a location...',
  disabled = false,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { results, isLoading, error } = useLocationSearch(searchQuery);

  const handleSelect = (location: EventLocation) => {
    onChange(location);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {value ? value.name : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <CommandEmpty>
                <p className="text-sm text-destructive">{error}</p>
              </CommandEmpty>
            )}

            {!isLoading && !error && results.length === 0 && searchQuery.length >= 3 && (
              <CommandEmpty>No locations found.</CommandEmpty>
            )}

            {!isLoading && !error && searchQuery.length > 0 && searchQuery.length < 3 && (
              <CommandEmpty>Type at least 3 characters to search...</CommandEmpty>
            )}

            {results.length > 0 && (
              <CommandGroup>
                {results.map((location, index) => (
                  <CommandItem
                    key={index}
                    value={location.name}
                    onSelect={() => handleSelect(location)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value?.name === location.name ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{location.name}</span>
                      {location.address && (
                        <span className="text-xs text-muted-foreground truncate">
                          {location.address}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>

        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={handleClear}
            >
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
