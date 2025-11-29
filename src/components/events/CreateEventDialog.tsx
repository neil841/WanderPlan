'use client';

/**
 * CreateEventDialog Component
 *
 * Main dialog component for creating events of all 6 types.
 * Features tabbed interface, type-specific forms, and validation.
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
import { FlightForm } from './FlightForm';
import { HotelForm } from './HotelForm';
import { ActivityForm as ActivityFormComponent } from './ActivityForm';
import { RestaurantForm } from './RestaurantForm';
import { TransportationForm } from './TransportationForm';
import { DestinationForm } from './DestinationForm';
import { useCreateEvent } from '@/hooks/useCreateEvent';
import { useUpdateEvent } from '@/hooks/useUpdateEvent';
import { cn } from '@/lib/utils';

// Event types enum (matching Prisma schema)
enum EventType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  ACTIVITY = 'ACTIVITY',
  RESTAURANT = 'RESTAURANT',
  TRANSPORTATION = 'TRANSPORTATION',
  DESTINATION = 'DESTINATION',
}

interface CreateEventDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string; // For pre-filling date from day view
  defaultType?: EventType;
  mode?: 'create' | 'edit'; // NEW - Edit mode support
  eventData?: any; // NEW - Event data for edit mode
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

/**
 * Event creation dialog with tabbed interface for all event types
 *
 * Features:
 * - Tabbed interface for 6 event types
 * - Type-specific forms with validation
 * - Location autocomplete
 * - Cost input with currency
 * - Loading states and error handling
 * - Responsive design
 * - Accessibility compliant
 *
 * @example
 * <CreateEventDialog
 *   tripId={tripId}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   defaultDate="2024-06-15T09:00"
 * />
 */
export function CreateEventDialog({
  tripId,
  open,
  onOpenChange,
  defaultDate,
  defaultType = EventType.ACTIVITY,
  mode = 'create',
  eventData,
}: CreateEventDialogProps) {
  const isEditMode = mode === 'edit';
  const [selectedType, setSelectedType] = useState<EventType>(
    isEditMode && eventData ? eventData.type : defaultType
  );
  const [formData, setFormData] = useState<any>(
    isEditMode && eventData
      ? transformEventToFormData(eventData)
      : getInitialFormData(selectedType, defaultDate)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();
  const isPending = isCreating || isUpdating;

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

  // Transform form data to API format
  const transformFormData = () => {
    const baseData = {
      type: selectedType,
      title: formData.title,
      notes: formData.notes || null,
      confirmationNumber: formData.confirmationNumber || null,
      cost: formData.cost || null,
    };

    switch (selectedType) {
      case EventType.FLIGHT:
        return {
          ...baseData,
          startDateTime: formData.departureTime,
          endDateTime: formData.arrivalTime,
          location: formData.departureAirport,
          description: JSON.stringify({
            airline: formData.airline,
            flightNumber: formData.flightNumber,
            departureAirport: formData.departureAirport,
            arrivalAirport: formData.arrivalAirport,
          }),
        };

      case EventType.HOTEL:
        return {
          ...baseData,
          startDateTime: formData.checkIn,
          endDateTime: formData.checkOut,
          location: formData.location,
          description: JSON.stringify({
            hotelName: formData.hotelName,
          }),
        };

      case EventType.ACTIVITY:
        return {
          ...baseData,
          startDateTime: formData.startTime,
          endDateTime: formData.duration
            ? new Date(new Date(formData.startTime).getTime() + formData.duration * 60000).toISOString()
            : null,
          location: formData.location,
          description: JSON.stringify({
            activityName: formData.activityName,
            duration: formData.duration,
            bookingUrl: formData.bookingUrl,
          }),
        };

      case EventType.RESTAURANT:
        return {
          ...baseData,
          startDateTime: formData.reservationTime,
          location: formData.location,
          description: JSON.stringify({
            restaurantName: formData.restaurantName,
            cuisine: formData.cuisineType,
          }),
        };

      case EventType.TRANSPORTATION:
        return {
          ...baseData,
          startDateTime: formData.departureTime,
          endDateTime: formData.arrivalTime || null,
          location: formData.departureLocation,
          description: JSON.stringify({
            transportType: formData.transportType,
            departureLocation: formData.departureLocation,
            arrivalLocation: formData.arrivalLocation,
          }),
        };

      case EventType.DESTINATION:
        return {
          ...baseData,
          startDateTime: formData.visitDate,
          location: formData.location,
          description: JSON.stringify({
            placeName: formData.placeName,
          }),
        };

      default:
        return baseData;
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submissionData = transformFormData();

    if (isEditMode && eventData) {
      // Update existing event
      updateEvent(
        { tripId, eventId: eventData.id, data: submissionData as any },
        {
          onSuccess: () => {
            onOpenChange(false);
            setFormData(getInitialFormData(selectedType, defaultDate));
            setErrors({});
          },
        }
      );
    } else {
      // Create new event
      createEvent(
        { tripId, data: submissionData as any },
        {
          onSuccess: () => {
            onOpenChange(false);
            setFormData(getInitialFormData(selectedType, defaultDate));
            setErrors({});
          },
        }
      );
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

// Helper function to transform event data to form data for editing
function transformEventToFormData(event: any) {
  const baseData = {
    title: event.title || '',
    notes: event.notes || '',
    confirmationNumber: event.confirmationNumber || '',
    cost: event.cost?.amount || null,
  };

  let description: any = {};
  try {
    description = event.description ? JSON.parse(event.description) : {};
  } catch {
    description = {};
  }

  switch (event.type) {
    case 'FLIGHT':
      return {
        ...baseData,
        airline: description.airline || '',
        flightNumber: description.flightNumber || '',
        departureAirport: description.departureAirport || event.location,
        arrivalAirport: description.arrivalAirport || null,
        departureTime: event.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : '',
        arrivalTime: event.endDateTime ? new Date(event.endDateTime).toISOString().slice(0, 16) : '',
      };

    case 'HOTEL':
      return {
        ...baseData,
        hotelName: description.hotelName || '',
        location: event.location,
        checkIn: event.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : '',
        checkOut: event.endDateTime ? new Date(event.endDateTime).toISOString().slice(0, 16) : '',
      };

    case 'ACTIVITY':
      return {
        ...baseData,
        activityName: description.activityName || '',
        location: event.location,
        startTime: event.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : '',
        duration: description.duration || undefined,
        durationUnit: 'hours' as const,
        bookingUrl: description.bookingUrl || '',
      };

    case 'RESTAURANT':
      return {
        ...baseData,
        restaurantName: description.restaurantName || '',
        location: event.location,
        reservationTime: event.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : '',
        cuisineType: description.cuisine || '',
      };

    case 'TRANSPORTATION':
      return {
        ...baseData,
        transportType: description.transportType || undefined,
        departureLocation: description.departureLocation || event.location,
        arrivalLocation: description.arrivalLocation || null,
        departureTime: event.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : '',
        arrivalTime: event.endDateTime ? new Date(event.endDateTime).toISOString().slice(0, 16) : '',
      };

    case 'DESTINATION':
      return {
        ...baseData,
        placeName: description.placeName || '',
        location: event.location,
        visitDate: event.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : '',
      };

    default:
      return baseData;
  }
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
