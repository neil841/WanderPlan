'use client';

/**
 * HotelForm Component
 *
 * Form component for creating/editing hotel events.
 * Includes hotel name, location, check-in/out dates.
 *
 * @component
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocationAutocomplete } from './LocationAutocomplete';
import { CostInput } from './CostInput';
import { EventLocation, EventCost } from '@/types/event';

interface HotelFormData {
  title: string;
  hotelName?: string;
  location?: EventLocation | null;
  checkIn: string;
  checkOut: string;
  cost?: EventCost | null;
  confirmationNumber?: string;
  notes?: string;
}

interface HotelFormProps {
  data: HotelFormData;
  onChange: (data: HotelFormData) => void;
  errors?: Record<string, string>;
}

/**
 * Hotel event form
 *
 * Fields:
 * - Title (auto-generated from hotel name)
 * - Hotel Name *
 * - Location * (location autocomplete)
 * - Check-in Date *
 * - Check-out Date *
 * - Cost
 * - Confirmation Number
 * - Notes
 */
export function HotelForm({ data, onChange, errors = {} }: HotelFormProps) {
  const updateField = (field: keyof HotelFormData, value: any) => {
    const updated = { ...data, [field]: value };

    // Auto-generate title if hotel name changes
    if (field === 'hotelName' && value) {
      updated.title = value;
    }

    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="hotel-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="hotel-title"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Hilton Downtown"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'hotel-title-error' : undefined}
        />
        {errors.title && (
          <p id="hotel-title-error" className="text-sm text-destructive" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Hotel Name */}
      <div className="space-y-2">
        <Label htmlFor="hotel-name">
          Hotel Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="hotel-name"
          value={data.hotelName || ''}
          onChange={(e) => updateField('hotelName', e.target.value)}
          placeholder="e.g., Hilton Downtown"
          aria-invalid={!!errors.hotelName}
        />
        {errors.hotelName && (
          <p className="text-sm text-destructive" role="alert">
            {errors.hotelName}
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
          placeholder="Search for hotel location..."
        />
        {errors.location && (
          <p className="text-sm text-destructive" role="alert">
            {errors.location}
          </p>
        )}
      </div>

      {/* Check-in Date */}
      <div className="space-y-2">
        <Label htmlFor="check-in">
          Check-in Date <span className="text-destructive">*</span>
        </Label>
        <Input
          id="check-in"
          type="datetime-local"
          value={data.checkIn}
          onChange={(e) => updateField('checkIn', e.target.value)}
          aria-invalid={!!errors.checkIn}
          aria-describedby={errors.checkIn ? 'check-in-error' : undefined}
        />
        {errors.checkIn && (
          <p id="check-in-error" className="text-sm text-destructive" role="alert">
            {errors.checkIn}
          </p>
        )}
      </div>

      {/* Check-out Date */}
      <div className="space-y-2">
        <Label htmlFor="check-out">
          Check-out Date <span className="text-destructive">*</span>
        </Label>
        <Input
          id="check-out"
          type="datetime-local"
          value={data.checkOut}
          onChange={(e) => updateField('checkOut', e.target.value)}
          aria-invalid={!!errors.checkOut}
          aria-describedby={errors.checkOut ? 'check-out-error' : undefined}
        />
        {errors.checkOut && (
          <p id="check-out-error" className="text-sm text-destructive" role="alert">
            {errors.checkOut}
          </p>
        )}
      </div>

      {/* Cost */}
      <CostInput
        value={data.cost}
        onChange={(cost) => updateField('cost', cost)}
        label="Hotel Cost (total or per night)"
      />

      {/* Confirmation Number */}
      <div className="space-y-2">
        <Label htmlFor="confirmation">Confirmation Number</Label>
        <Input
          id="confirmation"
          value={data.confirmationNumber || ''}
          onChange={(e) => updateField('confirmationNumber', e.target.value)}
          placeholder="e.g., RES123456"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Room preferences, amenities, parking info..."
          rows={3}
        />
      </div>
    </div>
  );
}
