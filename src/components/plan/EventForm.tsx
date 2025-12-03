'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type GuestEvent, type EventCategory } from '@/lib/guest-mode';

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: Partial<GuestEvent>) => void;
  event?: GuestEvent | null;
  defaultDay?: number;
}

const categories: { value: EventCategory; label: string; emoji: string }[] = [
  { value: 'activity', label: 'Activity', emoji: '🎭' },
  { value: 'food', label: 'Food & Dining', emoji: '🍜' },
  { value: 'transport', label: 'Transport', emoji: '🚇' },
  { value: 'accommodation', label: 'Accommodation', emoji: '🏨' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'other', label: 'Other', emoji: '📌' },
];

/**
 * EventForm Component
 *
 * Premium modal form for creating/editing trip events.
 * Features smooth animations, validation, and category selection.
 *
 * @component
 */
export function EventForm({ open, onOpenChange, onSubmit, event, defaultDay = 1 }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    day: defaultDay,
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    estimatedCost: '',
    category: 'activity' as EventCategory,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        day: event.day || defaultDay,
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        location: event.location || '',
        description: event.description || '',
        estimatedCost: event.estimatedCost?.toString() || '',
        category: event.category || 'activity',
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        day: defaultDay,
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        estimatedCost: '',
        category: 'activity',
      });
    }
    setErrors({});
  }, [event, defaultDay, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.estimatedCost && isNaN(parseFloat(formData.estimatedCost))) {
      newErrors.estimatedCost = 'Must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const eventData: Partial<GuestEvent> = {
      title: formData.title.trim(),
      day: formData.day,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      location: formData.location.trim() || undefined,
      description: formData.description.trim() || undefined,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      category: formData.category,
      order: event?.order || 0,
    };

    try {
      await onSubmit(eventData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            {event ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogDescription>
            {event
              ? 'Update the details of your event'
              : 'Add a new activity, meal, or destination to your itinerary'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="required">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Visit Tokyo Tower"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Day & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">Day of Trip</Label>
              <Input
                id="day"
                type="number"
                min="1"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: EventCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={errors.endTime ? 'border-red-500' : ''}
              />
              {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Tokyo Tower, Minato City, Tokyo"
            />
          </div>

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
            <Input
              id="estimatedCost"
              type="number"
              step="0.01"
              min="0"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              placeholder="e.g., 25.00"
              className={errors.estimatedCost ? 'border-red-500' : ''}
            />
            {errors.estimatedCost && <p className="text-sm text-red-500">{errors.estimatedCost}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add notes, tips, or any details about this event..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </span>
              ) : (
                <span>{event ? 'Update Event' : 'Add Event'}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
