'use client';

/**
 * ActivityForm Component
 *
 * Form component for creating/editing activity events.
 * Includes activity name, location, start time, duration, and booking URL.
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

interface ActivityFormData {
  title: string;
  activityName?: string;
  location?: EventLocation | null;
  startTime: string;
  duration?: number; // in minutes
  durationUnit?: 'minutes' | 'hours';
  bookingUrl?: string;
  cost?: EventCost | null;
  confirmationNumber?: string;
  notes?: string;
}

interface ActivityFormProps {
  data: ActivityFormData;
  onChange: (data: ActivityFormData) => void;
  errors?: Record<string, string>;
}

/**
 * Activity event form
 *
 * Fields:
 * - Title (auto-generated from activity name)
 * - Activity Name *
 * - Location * (location autocomplete)
 * - Start Time *
 * - Duration (number + unit selector)
 * - Booking URL
 * - Cost
 * - Confirmation Number
 * - Notes
 */
export function ActivityForm({ data, onChange, errors = {} }: ActivityFormProps) {
  const updateField = (field: keyof ActivityFormData, value: any) => {
    const updated = { ...data, [field]: value };

    // Auto-generate title if activity name changes
    if (field === 'activityName' && value) {
      updated.title = value;
    }

    onChange(updated);
  };

  const durationValue = data.duration
    ? data.durationUnit === 'hours'
      ? data.duration / 60
      : data.duration
    : '';

  const handleDurationChange = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      updateField('duration', undefined);
      return;
    }

    const minutes = data.durationUnit === 'hours' ? num * 60 : num;
    updateField('duration', minutes);
  };

  const handleDurationUnitChange = (unit: 'minutes' | 'hours') => {
    updateField('durationUnit', unit);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="activity-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="activity-title"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., City Walking Tour"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'activity-title-error' : undefined}
        />
        {errors.title && (
          <p id="activity-title-error" className="text-sm text-destructive" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Activity Name */}
      <div className="space-y-2">
        <Label htmlFor="activity-name">
          Activity Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="activity-name"
          value={data.activityName || ''}
          onChange={(e) => updateField('activityName', e.target.value)}
          placeholder="e.g., City Walking Tour"
          aria-invalid={!!errors.activityName}
        />
        {errors.activityName && (
          <p className="text-sm text-destructive" role="alert">
            {errors.activityName}
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
          placeholder="Search for activity location..."
        />
        {errors.location && (
          <p className="text-sm text-destructive" role="alert">
            {errors.location}
          </p>
        )}
      </div>

      {/* Start Time */}
      <div className="space-y-2">
        <Label htmlFor="start-time">
          Start Time <span className="text-destructive">*</span>
        </Label>
        <Input
          id="start-time"
          type="datetime-local"
          value={data.startTime}
          onChange={(e) => updateField('startTime', e.target.value)}
          aria-invalid={!!errors.startTime}
          aria-describedby={errors.startTime ? 'start-time-error' : undefined}
        />
        {errors.startTime && (
          <p id="start-time-error" className="text-sm text-destructive" role="alert">
            {errors.startTime}
          </p>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="duration"
            type="number"
            min="0"
            step="0.5"
            placeholder="2"
            value={durationValue}
            onChange={(e) => handleDurationChange(e.target.value)}
            className="flex-1"
          />
          <Select
            value={data.durationUnit || 'hours'}
            onValueChange={handleDurationUnitChange}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Booking URL */}
      <div className="space-y-2">
        <Label htmlFor="booking-url">Booking URL</Label>
        <Input
          id="booking-url"
          type="url"
          value={data.bookingUrl || ''}
          onChange={(e) => updateField('bookingUrl', e.target.value)}
          placeholder="https://example.com/booking/123"
        />
      </div>

      {/* Cost */}
      <CostInput
        value={data.cost}
        onChange={(cost) => updateField('cost', cost)}
        label="Activity Cost"
      />

      {/* Confirmation Number */}
      <div className="space-y-2">
        <Label htmlFor="confirmation">Confirmation Number</Label>
        <Input
          id="confirmation"
          value={data.confirmationNumber || ''}
          onChange={(e) => updateField('confirmationNumber', e.target.value)}
          placeholder="e.g., BOOK123456"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="What to bring, meeting point details..."
          rows={3}
        />
      </div>
    </div>
  );
}
