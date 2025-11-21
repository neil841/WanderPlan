'use client';

/**
 * RestaurantForm Component
 *
 * Form component for creating/editing restaurant events.
 * Includes restaurant name, location, reservation time, and cuisine type.
 *
 * @component
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationAutocomplete } from './LocationAutocomplete';
import { CostInput } from './CostInput';
import { EventLocation, EventCost } from '@/types/event';

interface RestaurantFormData {
  title: string;
  restaurantName?: string;
  location?: EventLocation | null;
  reservationTime: string;
  cuisineType?: string;
  cost?: EventCost | null;
  confirmationNumber?: string;
  notes?: string;
}

interface RestaurantFormProps {
  data: RestaurantFormData;
  onChange: (data: RestaurantFormData) => void;
  errors?: Record<string, string>;
}

const CUISINE_TYPES = [
  'Italian',
  'French',
  'Japanese',
  'Chinese',
  'Mexican',
  'Indian',
  'Thai',
  'Mediterranean',
  'American',
  'Spanish',
  'Korean',
  'Vietnamese',
  'Greek',
  'Middle Eastern',
  'Seafood',
  'Steakhouse',
  'Vegetarian',
  'Vegan',
  'Fusion',
  'Other',
];

/**
 * Restaurant event form
 *
 * Fields:
 * - Title (auto-generated from restaurant name)
 * - Restaurant Name *
 * - Location * (location autocomplete)
 * - Reservation Time *
 * - Cuisine Type (select)
 * - Cost
 * - Confirmation Number
 * - Notes
 */
export function RestaurantForm({ data, onChange, errors = {} }: RestaurantFormProps) {
  const updateField = (field: keyof RestaurantFormData, value: any) => {
    const updated = { ...data, [field]: value };

    // Auto-generate title if restaurant name changes
    if (field === 'restaurantName' && value) {
      updated.title = value;
    }

    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="restaurant-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="restaurant-title"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., La Bella Vista"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'restaurant-title-error' : undefined}
        />
        {errors.title && (
          <p id="restaurant-title-error" className="text-sm text-destructive" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Restaurant Name */}
      <div className="space-y-2">
        <Label htmlFor="restaurant-name">
          Restaurant Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="restaurant-name"
          value={data.restaurantName || ''}
          onChange={(e) => updateField('restaurantName', e.target.value)}
          placeholder="e.g., La Bella Vista"
          aria-invalid={!!errors.restaurantName}
        />
        {errors.restaurantName && (
          <p className="text-sm text-destructive" role="alert">
            {errors.restaurantName}
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
          placeholder="Search for restaurant location..."
        />
        {errors.location && (
          <p className="text-sm text-destructive" role="alert">
            {errors.location}
          </p>
        )}
      </div>

      {/* Reservation Time */}
      <div className="space-y-2">
        <Label htmlFor="reservation-time">
          Reservation Time <span className="text-destructive">*</span>
        </Label>
        <Input
          id="reservation-time"
          type="datetime-local"
          value={data.reservationTime}
          onChange={(e) => updateField('reservationTime', e.target.value)}
          aria-invalid={!!errors.reservationTime}
          aria-describedby={errors.reservationTime ? 'reservation-time-error' : undefined}
        />
        {errors.reservationTime && (
          <p id="reservation-time-error" className="text-sm text-destructive" role="alert">
            {errors.reservationTime}
          </p>
        )}
      </div>

      {/* Cuisine Type */}
      <div className="space-y-2">
        <Label htmlFor="cuisine-type">Cuisine Type</Label>
        <Select
          value={data.cuisineType || ''}
          onValueChange={(value) => updateField('cuisineType', value)}
        >
          <SelectTrigger id="cuisine-type">
            <SelectValue placeholder="Select cuisine type..." />
          </SelectTrigger>
          <SelectContent>
            {CUISINE_TYPES.map((cuisine) => (
              <SelectItem key={cuisine} value={cuisine}>
                {cuisine}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cost */}
      <CostInput
        value={data.cost}
        onChange={(cost) => updateField('cost', cost)}
        label="Estimated Cost"
      />

      {/* Confirmation Number */}
      <div className="space-y-2">
        <Label htmlFor="confirmation">Confirmation Number</Label>
        <Input
          id="confirmation"
          value={data.confirmationNumber || ''}
          onChange={(e) => updateField('confirmationNumber', e.target.value)}
          placeholder="e.g., RES789012"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Dietary restrictions, dress code, special requests..."
          rows={3}
        />
      </div>
    </div>
  );
}
