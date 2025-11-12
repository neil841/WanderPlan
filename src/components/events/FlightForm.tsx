'use client';

/**
 * FlightForm Component
 *
 * Form component for creating/editing flight events.
 * Includes airline, flight number, airports, and times.
 *
 * @component
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocationAutocomplete } from './LocationAutocomplete';
import { CostInput } from './CostInput';
import { EventLocation, EventCost } from '@/types/event';

interface FlightFormData {
  title: string;
  airline?: string;
  flightNumber?: string;
  departureAirport?: EventLocation | null;
  arrivalAirport?: EventLocation | null;
  departureTime: string;
  arrivalTime: string;
  cost?: EventCost | null;
  confirmationNumber?: string;
  notes?: string;
}

interface FlightFormProps {
  data: FlightFormData;
  onChange: (data: FlightFormData) => void;
  errors?: Record<string, string>;
}

/**
 * Flight event form
 *
 * Fields:
 * - Title (auto-generated from airline + flight number)
 * - Airline
 * - Flight Number
 * - Departure Airport (location autocomplete)
 * - Arrival Airport (location autocomplete)
 * - Departure Time (datetime)
 * - Arrival Time (datetime)
 * - Cost
 * - Confirmation Number
 * - Notes
 */
export function FlightForm({ data, onChange, errors = {} }: FlightFormProps) {
  const updateField = (field: keyof FlightFormData, value: any) => {
    const updated = { ...data, [field]: value };

    // Auto-generate title if airline or flight number changes
    if (field === 'airline' || field === 'flightNumber') {
      const airline = field === 'airline' ? value : data.airline;
      const flightNumber = field === 'flightNumber' ? value : data.flightNumber;
      updated.title = [airline, flightNumber].filter(Boolean).join(' ') || 'Flight';
    }

    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="flight-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="flight-title"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Delta 1234"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'flight-title-error' : undefined}
        />
        {errors.title && (
          <p id="flight-title-error" className="text-sm text-destructive" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Airline */}
      <div className="space-y-2">
        <Label htmlFor="airline">Airline</Label>
        <Input
          id="airline"
          value={data.airline || ''}
          onChange={(e) => updateField('airline', e.target.value)}
          placeholder="e.g., Delta, United, American"
        />
      </div>

      {/* Flight Number */}
      <div className="space-y-2">
        <Label htmlFor="flight-number">Flight Number</Label>
        <Input
          id="flight-number"
          value={data.flightNumber || ''}
          onChange={(e) => updateField('flightNumber', e.target.value)}
          placeholder="e.g., 1234"
        />
      </div>

      {/* Departure Airport */}
      <div className="space-y-2">
        <Label>
          Departure Airport <span className="text-destructive">*</span>
        </Label>
        <LocationAutocomplete
          value={data.departureAirport}
          onChange={(location) => updateField('departureAirport', location)}
          placeholder="Search for departure airport..."
        />
        {errors.departureAirport && (
          <p className="text-sm text-destructive" role="alert">
            {errors.departureAirport}
          </p>
        )}
      </div>

      {/* Arrival Airport */}
      <div className="space-y-2">
        <Label>
          Arrival Airport <span className="text-destructive">*</span>
        </Label>
        <LocationAutocomplete
          value={data.arrivalAirport}
          onChange={(location) => updateField('arrivalAirport', location)}
          placeholder="Search for arrival airport..."
        />
        {errors.arrivalAirport && (
          <p className="text-sm text-destructive" role="alert">
            {errors.arrivalAirport}
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
        <Label htmlFor="arrival-time">
          Arrival Time <span className="text-destructive">*</span>
        </Label>
        <Input
          id="arrival-time"
          type="datetime-local"
          value={data.arrivalTime}
          onChange={(e) => updateField('arrivalTime', e.target.value)}
          aria-invalid={!!errors.arrivalTime}
          aria-describedby={errors.arrivalTime ? 'arrival-time-error' : undefined}
        />
        {errors.arrivalTime && (
          <p id="arrival-time-error" className="text-sm text-destructive" role="alert">
            {errors.arrivalTime}
          </p>
        )}
      </div>

      {/* Cost */}
      <CostInput
        value={data.cost}
        onChange={(cost) => updateField('cost', cost)}
        label="Flight Cost"
      />

      {/* Confirmation Number */}
      <div className="space-y-2">
        <Label htmlFor="confirmation">Confirmation Number</Label>
        <Input
          id="confirmation"
          value={data.confirmationNumber || ''}
          onChange={(e) => updateField('confirmationNumber', e.target.value)}
          placeholder="e.g., ABC123"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Additional details about the flight..."
          rows={3}
        />
      </div>
    </div>
  );
}
