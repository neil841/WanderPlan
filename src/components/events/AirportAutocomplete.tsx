'use client';

/**
 * AirportAutocomplete Component
 *
 * Airport search component with autocomplete using local airport database.
 * Searches by IATA code, ICAO code, airport name, or city.
 *
 * @component
 */

import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Loader2, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAirportSearch, Airport } from '@/hooks/useAirportSearch';
import { EventLocation } from '@/types/event';

interface AirportAutocompleteProps {
  value?: EventLocation | null;
  onChange: (location: EventLocation | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Airport autocomplete component
 *
 * Features:
 * - Debounced search (300ms)
 * - Searches by IATA, ICAO, name, city
 * - Shows airport code + name + city
 * - Loading states
 * - Accessibility compliant
 *
 * @example
 * <AirportAutocomplete
 *   value={airport}
 *   onChange={setAirport}
 *   placeholder="Search for an airport..."
 * />
 */
export function AirportAutocomplete({
  value,
  onChange,
  placeholder = 'Search for an airport...',
  disabled = false,
}: AirportAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { results, isLoading, error } = useAirportSearch(searchQuery);

  const handleSelect = (airport: Airport) => {
    // Convert Airport to EventLocation
    const location: EventLocation = {
      name: `${airport.iata} - ${airport.name}`,
      address: `${airport.city}, ${airport.country}`,
      latitude: airport.latitude,
      longitude: airport.longitude,
    };

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
            <Plane className="h-4 w-4 shrink-0 opacity-50" />
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

            {!isLoading && !error && results.length === 0 && searchQuery.length >= 2 && (
              <CommandEmpty>No airports found.</CommandEmpty>
            )}

            {!isLoading && !error && searchQuery.length > 0 && searchQuery.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
            )}

            {results.length > 0 && (
              <CommandGroup>
                {results.map((airport) => {
                  const displayValue = `${airport.iata} - ${airport.name}`;
                  return (
                    <CommandItem
                      key={airport.iata}
                      value={displayValue}
                      onSelect={() => handleSelect(airport)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value?.name === displayValue ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {airport.iata} - {airport.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {airport.city}, {airport.country}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
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
