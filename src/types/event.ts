/**
 * Event Type Definitions
 *
 * TypeScript types for all event types and their specific fields.
 * Based on Prisma schema and API specifications.
 *
 * @module EventTypes
 */

import { EventType } from '@prisma/client';

// Re-export EventType for use in other modules
export { EventType };

/**
 * Location data structure stored as JSON in database
 */
export interface EventLocation {
  name: string;
  address?: string;
  lat?: number;
  lon?: number;
}

/**
 * Cost data structure stored as JSON in database
 */
export interface EventCost {
  amount: number;
  currency: string;
}

/**
 * Base event fields common to all event types
 */
export interface BaseEvent {
  id: string;
  tripId: string;
  type: EventType;
  title: string;
  description?: string | null;
  startDateTime: Date;
  endDateTime?: Date | null;
  location?: EventLocation | null;
  order: number;
  notes?: string | null;
  confirmationNumber?: string | null;
  cost?: EventCost | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Flight-specific fields
 */
export interface FlightEvent extends BaseEvent {
  type: 'FLIGHT';
  flightDetails?: {
    airline?: string;
    flightNumber?: string;
    departureAirport?: string;
    arrivalAirport?: string;
  };
}

/**
 * Hotel-specific fields
 */
export interface HotelEvent extends BaseEvent {
  type: 'HOTEL';
  hotelDetails?: {
    hotelName?: string;
    checkInDate?: Date;
    checkOutDate?: Date;
    confirmationNumber?: string;
  };
}

/**
 * Activity-specific fields
 */
export interface ActivityEvent extends BaseEvent {
  type: 'ACTIVITY';
  activityDetails?: {
    activityName?: string;
    duration?: number; // in minutes
    bookingUrl?: string;
  };
}

/**
 * Restaurant-specific fields
 */
export interface RestaurantEvent extends BaseEvent {
  type: 'RESTAURANT';
  restaurantDetails?: {
    restaurantName?: string;
    cuisine?: string;
    reservationTime?: Date;
  };
}

/**
 * Transportation-specific fields
 */
export interface TransportationEvent extends BaseEvent {
  type: 'TRANSPORTATION';
  transportationDetails?: {
    transportType?: 'car' | 'train' | 'bus' | 'other';
    departureLocation?: string;
    arrivalLocation?: string;
  };
}

/**
 * Destination-specific fields
 */
export interface DestinationEvent extends BaseEvent {
  type: 'DESTINATION';
  destinationDetails?: {
    placeName?: string;
    visitDate?: Date;
  };
}

/**
 * Union type for all event types
 */
export type Event =
  | FlightEvent
  | HotelEvent
  | ActivityEvent
  | RestaurantEvent
  | TransportationEvent
  | DestinationEvent;

/**
 * Event creation input (without system-generated fields)
 */
export type CreateEventInput = Omit<
  BaseEvent,
  'id' | 'createdBy' | 'createdAt' | 'updatedAt'
> & {
  // Type-specific fields are optional in the JSON description or notes
  description?: string | null;
};

/**
 * Event update input (all fields optional except ID)
 */
export type UpdateEventInput = Partial<
  Omit<BaseEvent, 'id' | 'tripId' | 'createdBy' | 'createdAt' | 'updatedAt'>
>;

/**
 * Event filter options for GET /api/trips/[tripId]/events
 */
export interface EventFilters {
  type?: EventType | EventType[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

/**
 * Event response with creator info
 */
export interface EventResponse extends BaseEvent {
  creator?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}
