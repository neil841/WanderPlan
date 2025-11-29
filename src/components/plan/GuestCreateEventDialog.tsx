'use client';

/**
 * GuestCreateEventDialog Component
 *
 * Guest-mode adapted version of CreateEventDialog that saves to localStorage.
 * Includes all 6 event types with full autocomplete functionality.
 *
 * @component
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Plane, Building2, Activity, UtensilsCrossed, Car, MapPin } from 'lucide-react';
import { FlightForm } from '@/components/events/FlightForm';
import { HotelForm } from '@/components/events/HotelForm';
import { ActivityForm as ActivityFormComponent } from '@/components/events/ActivityForm';
import { RestaurantForm } from '@/components/events/RestaurantForm';
import { TransportationForm } from '@/components/events/TransportationForm';
import { DestinationForm } from '@/components/events/DestinationForm';
import { cn } from '@/lib/utils';
import {
  addGuestEvent,
  updateGuestEvent,
  getGuestExpenses,
  addGuestExpense,
  updateGuestExpense,
  getGuestTrip,
  type GuestEvent,
  type EventCategory,
} from '@/lib/guest-mode';
import { addDays, parseISO, setHours, setMinutes } from 'date-fns';

// Event types matching the authenticated version
enum EventType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  ACTIVITY = 'ACTIVITY',
  RESTAURANT = 'RESTAURANT',
  TRANSPORTATION = 'TRANSPORTATION',
  DESTINATION = 'DESTINATION',
}

interface GuestCreateEventDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultDay?: number;
  defaultType?: EventType;
  mode?: 'create' | 'edit';
  eventData?: GuestEvent;
  onSuccess?: () => void;
  onSubmit?: (data: Partial<GuestEvent>) => Promise<void>;
}

// Icon mapping for event types
const EVENT_TYPE_CONFIG = {
  FLIGHT: { icon: Plane, label: 'Flight', color: 'text-blue-600' },
  HOTEL: { icon: Building2, label: 'Hotel', color: 'text-purple-600' },
  ACTIVITY: { icon: Activity, label: 'Activity', color: 'text-green-600' },
  RESTAURANT: { icon: UtensilsCrossed, label: 'Restaurant', color: 'text-orange-600' },
  TRANSPORTATION: { icon: Car, label: 'Transport', color: 'text-indigo-600' },
  DESTINATION: { icon: MapPin, label: 'Destination', color: 'text-red-600' },
};

// Map event types to guest event categories
const EVENT_TYPE_TO_CATEGORY: Record<EventType, EventCategory> = {
  [EventType.FLIGHT]: 'transport',
  [EventType.HOTEL]: 'accommodation',
  [EventType.ACTIVITY]: 'activity',
  [EventType.RESTAURANT]: 'food',
  [EventType.TRANSPORTATION]: 'transport',
  [EventType.DESTINATION]: 'activity',
};

/**
 * Guest event creation dialog with tabbed interface for all event types
 *
 * Features:
 * - Tabbed interface for 6 event types
 * - Type-specific forms with validation
 * - Airport autocomplete
 * - Location autocomplete
 * - Saves to localStorage
 * - Responsive design
 * - Accessibility compliant
 */
export function GuestCreateEventDialog({
  tripId,
  open,
  onOpenChange,
  defaultDate,
  defaultDay = 1,
  defaultType = EventType.ACTIVITY,
  mode = 'create',
  eventData,
  onSuccess,
  onSubmit,
}: GuestCreateEventDialogProps) {
  const isEditMode = mode === 'edit';
  const [selectedType, setSelectedType] = useState<EventType>(
    isEditMode && eventData ? (eventData.category === 'transport' ? EventType.FLIGHT : EventType.ACTIVITY) : defaultType
  );
  const [formData, setFormData] = useState<any>(
    isEditMode && eventData
      ? transformEventToFormData(eventData)
      : getInitialFormData(selectedType, defaultDate)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);

  // Reset form when type changes
  const handleTypeChange = (type: string) => {
    const eventType = type as EventType;
    setSelectedType(eventType);
    setFormData(getInitialFormData(eventType, defaultDate));
    setErrors({});
  };

  // Validate form based on event type
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Common validations
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    // Type-specific validations
    switch (selectedType) {
      case EventType.FLIGHT:
        if (!formData.departureAirport) newErrors.departureAirport = 'Departure airport is required';
        if (!formData.arrivalAirport) newErrors.arrivalAirport = 'Arrival airport is required';
        if (!formData.departureTime) newErrors.departureTime = 'Departure time is required';
        if (!formData.arrivalTime) newErrors.arrivalTime = 'Arrival time is required';
        break;

      case EventType.HOTEL:
        if (!formData.hotelName?.trim()) newErrors.hotelName = 'Hotel name is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
        if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
        break;

      case EventType.ACTIVITY:
        if (!formData.activityName?.trim()) newErrors.activityName = 'Activity name is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.startTime) newErrors.startTime = 'Start time is required';
        break;

      case EventType.RESTAURANT:
        if (!formData.restaurantName?.trim()) newErrors.restaurantName = 'Restaurant name is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.reservationTime) newErrors.reservationTime = 'Reservation time is required';
        break;

      case EventType.TRANSPORTATION:
        if (!formData.transportType) newErrors.transportType = 'Transport type is required';
        if (!formData.departureLocation) newErrors.departureLocation = 'Departure location is required';
        if (!formData.arrivalLocation) newErrors.arrivalLocation = 'Arrival location is required';
        if (!formData.departureTime) newErrors.departureTime = 'Departure time is required';
        break;

      case EventType.DESTINATION:
        if (!formData.placeName?.trim()) newErrors.placeName = 'Place name is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.visitDate) newErrors.visitDate = 'Visit date is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Transform form data to guest event format
  const transformFormData = (): Partial<GuestEvent> => {
    const baseData: Partial<GuestEvent> = {
      title: formData.title,
      day: defaultDay,
      category: EVENT_TYPE_TO_CATEGORY[selectedType],
      type: selectedType,
      description: formData.notes || undefined,
      estimatedCost: formData.cost?.amount || undefined,
      order: 0,
    };

    switch (selectedType) {
      case EventType.FLIGHT:
        return {
          ...baseData,
          title: formData.title || `${formData.airline} ${formData.flightNumber}`.trim() || 'Flight',
          startTime: formData.departureTime ? new Date(formData.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          endTime: formData.arrivalTime ? new Date(formData.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          location: formData.departureAirport?.name || formData.departureAirport?.address || undefined,
          description: `${formData.airline || ''} ${formData.flightNumber || ''}\nFrom: ${formData.departureAirport?.name || ''}\nTo: ${formData.arrivalAirport?.name || ''}\n${formData.notes || ''}`.trim(),
        };

      case EventType.HOTEL:
        return {
          ...baseData,
          title: formData.hotelName || 'Hotel',
          startTime: formData.checkIn ? new Date(formData.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          endTime: formData.checkOut ? new Date(formData.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          location: formData.location?.name || formData.location?.address || undefined,
        };

      case EventType.ACTIVITY:
        return {
          ...baseData,
          title: formData.activityName || 'Activity',
          startTime: formData.startTime ? new Date(formData.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          endTime: formData.duration
            ? new Date(new Date(formData.startTime).getTime() + formData.duration * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            : undefined,
          location: formData.location?.name || formData.location?.address || undefined,
        };

      case EventType.RESTAURANT:
        return {
          ...baseData,
          title: formData.restaurantName || 'Restaurant',
          startTime: formData.reservationTime ? new Date(formData.reservationTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          location: formData.location?.name || formData.location?.address || undefined,
          description: `${formData.cuisineType || ''}\n${formData.notes || ''}`.trim(),
        };

      case EventType.TRANSPORTATION:
        return {
          ...baseData,
          title: formData.title || `${formData.transportType} to destination`,
          startTime: formData.departureTime ? new Date(formData.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          endTime: formData.arrivalTime ? new Date(formData.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          location: formData.departureLocation?.name || formData.departureLocation?.address || undefined,
          description: `${formData.transportType || ''}\nFrom: ${formData.departureLocation?.name || ''}\nTo: ${formData.arrivalLocation?.name || ''}\n${formData.notes || ''}`.trim(),
        };

      case EventType.DESTINATION:
        return {
          ...baseData,
          title: formData.placeName || 'Destination',
          startTime: formData.visitDate ? new Date(formData.visitDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          location: formData.location?.name || formData.location?.address || undefined,
        };

      default:
        return baseData;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsPending(true);

    try {
      const submissionData = transformFormData();

      if (onSubmit) {
        await onSubmit(submissionData);
      } else {
        let savedEvent: GuestEvent | null = null;

        if (isEditMode && eventData) {
          // Update existing event
          savedEvent = updateGuestEvent(tripId, eventData.id, submissionData);
        } else {
          // Create new event
          savedEvent = addGuestEvent(tripId, submissionData as Omit<GuestEvent, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>);
        }

        // Sync with Budget
        if (savedEvent && submissionData.estimatedCost !== undefined) {
          const expenses = getGuestExpenses(tripId);
          const existingExpense = expenses.find(e => e.eventId === savedEvent!.id);

          if (submissionData.estimatedCost > 0) {
            // Calculate proper date for the expense
            let expenseDate = new Date();
            const trip = getGuestTrip(tripId);

            if (trip) {
              // Start with trip start date
              const startDate = new Date(trip.startDate);
              // Add day offset (day 1 is start date, so add day-1)
              const dayOffset = (savedEvent.day || 1) - 1;
              expenseDate = addDays(startDate, dayOffset);

              // Set time if available
              if (savedEvent.startTime) {
                const [hours, minutes] = savedEvent.startTime.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                  expenseDate = setMinutes(setHours(expenseDate, hours), minutes);
                }
              }
            }

            const expenseData = {
              description: savedEvent.title,
              amount: submissionData.estimatedCost,
              currency: 'USD',
              category: savedEvent.category || 'other',
              date: expenseDate.toISOString(),
              eventId: savedEvent.id,
            };

            if (existingExpense) {
              updateGuestExpense(tripId, existingExpense.id, expenseData);
            } else {
              addGuestExpense(tripId, expenseData);
            }
          } else if (existingExpense) {
            // If cost is 0 or removed, update expense to 0
            updateGuestExpense(tripId, existingExpense.id, { amount: 0 });
          }
        }
      }

      // Success - close dialog and reset form
      onOpenChange(false);
      setFormData(getInitialFormData(selectedType, defaultDate));
      setErrors({});

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        {/* Premium Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Event' : 'Create Event'}
            </DialogTitle>
            <DialogDescription className="text-blue-50">
              {isEditMode
                ? 'Update the event details below.'
                : 'Add a new event to your trip itinerary. Select the event type and fill in the details.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <Tabs value={selectedType} onValueChange={handleTypeChange} className="mt-4">
            <TabsList className="grid grid-cols-6 w-full">
              {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="flex flex-col items-center gap-1 py-2"
                  >
                    <Icon className={cn('h-4 w-4', selectedType === type && config.color)} />
                    <span className="text-xs hidden sm:inline">{config.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value={EventType.FLIGHT} className="mt-0">
                    <FlightForm data={formData} onChange={setFormData} errors={errors} />
                  </TabsContent>

                  <TabsContent value={EventType.HOTEL} className="mt-0">
                    <HotelForm data={formData} onChange={setFormData} errors={errors} />
                  </TabsContent>

                  <TabsContent value={EventType.ACTIVITY} className="mt-0">
                    <ActivityFormComponent data={formData} onChange={setFormData} errors={errors} />
                  </TabsContent>

                  <TabsContent value={EventType.RESTAURANT} className="mt-0">
                    <RestaurantForm data={formData} onChange={setFormData} errors={errors} />
                  </TabsContent>

                  <TabsContent value={EventType.TRANSPORTATION} className="mt-0">
                    <TransportationForm data={formData} onChange={setFormData} errors={errors} />
                  </TabsContent>

                  <TabsContent value={EventType.DESTINATION} className="mt-0">
                    <DestinationForm data={formData} onChange={setFormData} errors={errors} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>

        {/* Premium Footer with Gradient Button */}
        <DialogFooter className="border-t border-gray-200 bg-gray-50/50 p-6 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <motion.button
            onClick={handleSubmit}
            disabled={isPending}
            whileHover={{ scale: isPending ? 1 : 1.01 }}
            whileTap={{ scale: isPending ? 1 : 0.98 }}
            className="group relative flex-1 sm:flex-none overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode
                ? isPending
                  ? 'Saving...'
                  : 'Save Changes'
                : isPending
                  ? 'Creating...'
                  : 'Create Event'}
            </span>
            {/* Shine effect */}
            {!isPending && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            )}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to transform guest event to form data for editing
function transformEventToFormData(event: GuestEvent) {
  // For simplicity, create basic form data from guest event
  // Guest events have simplified structure compared to authenticated events
  return {
    title: event.title || '',
    notes: event.description || '',
    confirmationNumber: '',
    cost: event.estimatedCost ? { amount: event.estimatedCost, currency: 'USD' } : null,
    // Additional fields would be populated based on event type
  };
}

// Helper function to initialize form data based on event type
function getInitialFormData(type: EventType, defaultDate?: string) {
  const baseData = {
    title: '',
    notes: '',
    confirmationNumber: '',
    cost: null,
  };

  const date = defaultDate || new Date().toISOString().slice(0, 16);

  switch (type) {
    case EventType.FLIGHT:
      return {
        ...baseData,
        title: 'Flight',
        airline: '',
        flightNumber: '',
        departureAirport: null,
        arrivalAirport: null,
        departureTime: date,
        arrivalTime: date,
      };

    case EventType.HOTEL:
      return {
        ...baseData,
        title: 'Hotel',
        hotelName: '',
        location: null,
        checkIn: date,
        checkOut: date,
      };

    case EventType.ACTIVITY:
      return {
        ...baseData,
        title: 'Activity',
        activityName: '',
        location: null,
        startTime: date,
        duration: undefined,
        durationUnit: 'hours' as const,
        bookingUrl: '',
      };

    case EventType.RESTAURANT:
      return {
        ...baseData,
        title: 'Restaurant',
        restaurantName: '',
        location: null,
        reservationTime: date,
        cuisineType: '',
      };

    case EventType.TRANSPORTATION:
      return {
        ...baseData,
        title: 'Transport to destination',
        transportType: undefined,
        departureLocation: null,
        arrivalLocation: null,
        departureTime: date,
        arrivalTime: '',
      };

    case EventType.DESTINATION:
      return {
        ...baseData,
        title: 'Destination',
        placeName: '',
        location: null,
        visitDate: date,
      };

    default:
      return baseData;
  }
}
