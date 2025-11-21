'use client';

/**
 * DestinationForm Component
 *
 * Form component for creating/editing destination events.
 * Includes place name, location, and visit date.
 *
 * @component
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocationAutocomplete } from './LocationAutocomplete';
import { EventLocation } from '@/types/event';

interface DestinationFormData {
  title: string;
  placeName?: string;
  location?: EventLocation | null;
  visitDate: string;
  notes?: string;
}

interface DestinationFormProps {
  data: DestinationFormData;
  onChange: (data: DestinationFormData) => void;
  errors?: Record<string, string>;
}

/**
 * Destination event form
 *
 * Fields:
 * - Title (auto-generated from place name)
 * - Place Name *
 * - Location * (location autocomplete)
 * - Visit Date *
 * - Notes
 */
export function DestinationForm({ data, onChange, errors = {} }: DestinationFormProps) {
  const updateField = (field: keyof DestinationFormData, value: any) => {
    const updated = { ...data, [field]: value };

    // Auto-generate title if place name changes
    if (field === 'placeName' && value) {
      updated.title = value;
    }

    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="destination-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="destination-title"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Eiffel Tower"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'destination-title-error' : undefined}
        />
        {errors.title && (
          <p id="destination-title-error" className="text-sm text-destructive" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Place Name */}
      <div className="space-y-2">
        <Label htmlFor="place-name">
          Place Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="place-name"
          value={data.placeName || ''}
          onChange={(e) => updateField('placeName', e.target.value)}
          placeholder="e.g., Eiffel Tower"
          aria-invalid={!!errors.placeName}
        />
        {errors.placeName && (
          <p className="text-sm text-destructive" role="alert">
            {errors.placeName}
          </p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>
          Location <span className="text-destructive">*</span>
        </Label>
        <LocationAutocomplete
          value={data.location}
          onChange={(location) => updateField('location', location)}
          placeholder="Search for destination location..."
        />
        {errors.location && (
          <p className="text-sm text-destructive" role="alert">
            {errors.location}
          </p>
        )}
      </div>

      {/* Visit Date */}
      <div className="space-y-2">
        <Label htmlFor="visit-date">
          Visit Date <span className="text-destructive">*</span>
        </Label>
        <Input
          id="visit-date"
          type="datetime-local"
          value={data.visitDate}
          onChange={(e) => updateField('visitDate', e.target.value)}
          aria-invalid={!!errors.visitDate}
          aria-describedby={errors.visitDate ? 'visit-date-error' : undefined}
        />
        {errors.visitDate && (
          <p id="visit-date-error" className="text-sm text-destructive" role="alert">
            {errors.visitDate}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Things to see, tips, opening hours..."
          rows={3}
        />
      </div>
    </div>
  );
}
