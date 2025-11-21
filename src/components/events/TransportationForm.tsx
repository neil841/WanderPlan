'use client';

/**
 * TransportationForm Component
 *
 * Form component for creating/editing transportation events.
 * Includes transport type, departure/arrival locations and times.
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

interface TransportationFormData {
  title: string;
  transportType?: 'car' | 'train' | 'bus' | 'ferry' | 'other';
  departureLocation?: EventLocation | null;
  arrivalLocation?: EventLocation | null;
  departureTime: string;
  arrivalTime?: string;
  cost?: EventCost | null;
  confirmationNumber?: string;
  notes?: string;
}

interface TransportationFormProps {
  data: TransportationFormData;
  onChange: (data: TransportationFormData) => void;
  errors?: Record<string, string>;
}

const TRANSPORT_TYPES = [
  { value: 'car', label: 'Car/Taxi' },
  { value: 'train', label: 'Train' },
  { value: 'bus', label: 'Bus' },
  { value: 'ferry', label: 'Ferry' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * Transportation event form
 *
 * Fields:
 * - Title (auto-generated from transport type + destination)
 * - Transport Type * (select: car, train, bus, ferry, other)
 * - Departure Location * (location autocomplete)
 * - Arrival Location * (location autocomplete)
 * - Departure Time *
 * - Arrival Time (optional)
 * - Cost
 * - Confirmation Number
 * - Notes
 */
export function TransportationForm({ data, onChange, errors = {} }: TransportationFormProps) {
  const updateField = (field: keyof TransportationFormData, value: any) => {
    const updated = { ...data, [field]: value };

    // Auto-generate title if transport type or arrival location changes
    if (field === 'transportType' || field === 'arrivalLocation') {
      const type = field === 'transportType' ? value : data.transportType;
      const arrival = field === 'arrivalLocation' ? value : data.arrivalLocation;

      const typeLabel = TRANSPORT_TYPES.find((t) => t.value === type)?.label || 'Transport';
      const destination = arrival?.name || 'destination';

      updated.title = `${typeLabel} to ${destination}`;
    }

    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="transport-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="transport-title"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Train to Paris"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'transport-title-error' : undefined}
        />
        {errors.title && (
          <p id="transport-title-error" className="text-sm text-destructive" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Transport Type */}
      <div className="space-y-2">
        <Label htmlFor="transport-type">
          Transport Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.transportType || ''}
          onValueChange={(value: any) => updateField('transportType', value)}
        >
          <SelectTrigger id="transport-type">
            <SelectValue placeholder="Select transport type..." />
          </SelectTrigger>
          <SelectContent>
            {TRANSPORT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.transportType && (
          <p className="text-sm text-destructive" role="alert">
            {errors.transportType}
          </p>
        )}
      </div>

      {/* Departure Location */}
      <div className="space-y-2">
        <Label>
          Departure Location <span className="text-destructive">*</span>
        </Label>
        <LocationAutocomplete
          value={data.departureLocation}
          onChange={(location) => updateField('departureLocation', location)}
          placeholder="Search for departure location..."
        />
        {errors.departureLocation && (
          <p className="text-sm text-destructive" role="alert">
            {errors.departureLocation}
          </p>
        )}
      </div>

      {/* Arrival Location */}
      <div className="space-y-2">
        <Label>
          Arrival Location <span className="text-destructive">*</span>
        </Label>
        <LocationAutocomplete
          value={data.arrivalLocation}
          onChange={(location) => updateField('arrivalLocation', location)}
          placeholder="Search for arrival location..."
        />
        {errors.arrivalLocation && (
          <p className="text-sm text-destructive" role="alert">
            {errors.arrivalLocation}
          </p>
        )}
      </div>

      {/* Departure Time */}
      <div className="space-y-2">
        <Label htmlFor="departure-time">
          Departure Time <span className="text-destructive">*</span>
        </Label>
        <Input
          id="departure-time"
          type="datetime-local"
          value={data.departureTime}
          onChange={(e) => updateField('departureTime', e.target.value)}
          aria-invalid={!!errors.departureTime}
          aria-describedby={errors.departureTime ? 'departure-time-error' : undefined}
        />
        {errors.departureTime && (
          <p id="departure-time-error" className="text-sm text-destructive" role="alert">
            {errors.departureTime}
          </p>
        )}
      </div>

      {/* Arrival Time */}
      <div className="space-y-2">
        <Label htmlFor="arrival-time">Arrival Time (optional)</Label>
        <Input
          id="arrival-time"
          type="datetime-local"
          value={data.arrivalTime || ''}
          onChange={(e) => updateField('arrivalTime', e.target.value)}
        />
      </div>

      {/* Cost */}
      <CostInput
        value={data.cost}
        onChange={(cost) => updateField('cost', cost)}
        label="Transport Cost"
      />

      {/* Confirmation Number */}
      <div className="space-y-2">
        <Label htmlFor="confirmation">Confirmation Number</Label>
        <Input
          id="confirmation"
          value={data.confirmationNumber || ''}
          onChange={(e) => updateField('confirmationNumber', e.target.value)}
          placeholder="e.g., TICKET123"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Platform number, pickup details, special instructions..."
          rows={3}
        />
      </div>
    </div>
  );
}
