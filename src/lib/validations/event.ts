/**
 * Event Validation Schemas
 *
 * Zod schemas for validating event-related requests for all 6 event types.
 * Includes type-specific validation and common field validation.
 *
 * @module EventValidations
 */

import { z } from 'zod';
import { EventType } from '@prisma/client';

/**
 * Location data validation
 */
export const eventLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(200),
  address: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});

/**
 * Cost data validation
 */
export const eventCostSchema = z.object({
  amount: z.number().min(0, 'Cost amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code (e.g., USD)'),
});

/**
 * Base event fields common to all types
 */
const baseEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),

  startDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid start date/time format')
    .transform((val) => new Date(val)),

  endDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid end date/time format')
    .transform((val) => new Date(val))
    .optional()
    .nullable(),

  location: eventLocationSchema.optional().nullable(),

  cost: eventCostSchema.optional().nullable(),

  order: z.number().int().min(0).default(0),

  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .nullable(),

  confirmationNumber: z
    .string()
    .max(100, 'Confirmation number must be less than 100 characters')
    .optional()
    .nullable(),
});

/**
 * Flight event type validation
 */
export const createFlightEventSchema = baseEventSchema.extend({
  type: z.literal(EventType.FLIGHT),
  // Flight-specific fields can be stored in description as JSON or in notes
  // For simplicity, we'll add them as optional top-level fields that can be parsed
});

/**
 * Hotel event type validation
 */
export const createHotelEventSchema = baseEventSchema.extend({
  type: z.literal(EventType.HOTEL),
  // Hotel-specific fields can be stored in description/notes
});

/**
 * Activity event type validation
 */
export const createActivityEventSchema = baseEventSchema.extend({
  type: z.literal(EventType.ACTIVITY),
  // Activity-specific fields can be stored in description/notes
});

/**
 * Restaurant event type validation
 */
export const createRestaurantEventSchema = baseEventSchema.extend({
  type: z.literal(EventType.RESTAURANT),
  // Restaurant-specific fields can be stored in description/notes
});

/**
 * Transportation event type validation
 */
export const createTransportationEventSchema = baseEventSchema.extend({
  type: z.literal(EventType.TRANSPORTATION),
  // Transportation-specific fields can be stored in description/notes
});

/**
 * Destination event type validation
 */
export const createDestinationEventSchema = baseEventSchema.extend({
  type: z.literal(EventType.DESTINATION),
  // Destination-specific fields can be stored in description/notes
});

/**
 * Unified event creation schema (discriminated union by type)
 */
export const createEventSchema = z.discriminatedUnion('type', [
  createFlightEventSchema,
  createHotelEventSchema,
  createActivityEventSchema,
  createRestaurantEventSchema,
  createTransportationEventSchema,
  createDestinationEventSchema,
]).refine(
  (data) => {
    // Validate that endDateTime is after startDateTime if provided
    if (data.endDateTime && data.startDateTime) {
      return new Date(data.endDateTime) >= new Date(data.startDateTime);
    }
    return true;
  },
  {
    message: 'End date/time must be after or equal to start date/time',
    path: ['endDateTime'],
  }
);

/**
 * Event update schema (all fields optional)
 */
export const updateEventSchema = z
  .object({
    type: z.nativeEnum(EventType).optional(),

    title: z
      .string()
      .min(1, 'Event title cannot be empty')
      .max(200, 'Title must be less than 200 characters')
      .optional(),

    description: z
      .string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional()
      .nullable(),

    startDateTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid start date/time format')
      .transform((val) => new Date(val))
      .optional(),

    endDateTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid end date/time format')
      .transform((val) => new Date(val))
      .optional()
      .nullable(),

    location: eventLocationSchema.optional().nullable(),

    cost: eventCostSchema.optional().nullable(),

    order: z.number().int().min(0).optional(),

    notes: z
      .string()
      .max(2000, 'Notes must be less than 2000 characters')
      .optional()
      .nullable(),

    confirmationNumber: z
      .string()
      .max(100, 'Confirmation number must be less than 100 characters')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Validate that endDateTime is after startDateTime if both provided
      if (data.endDateTime && data.startDateTime) {
        return new Date(data.endDateTime) >= new Date(data.startDateTime);
      }
      return true;
    },
    {
      message: 'End date/time must be after or equal to start date/time',
      path: ['endDateTime'],
    }
  );

/**
 * Event list query parameters validation
 */
export const eventListQuerySchema = z.object({
  type: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      // Support comma-separated list of types
      const types = val.split(',').map((t) => t.trim().toUpperCase());
      return types.filter((t) =>
        Object.values(EventType).includes(t as EventType)
      ) as EventType[];
    }),

  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Invalid date format for startDate'
    )
    .transform((val) => (val ? new Date(val) : undefined)),

  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Invalid date format for endDate'
    )
    .transform((val) => (val ? new Date(val) : undefined)),

  search: z.string().optional(),

  sort: z
    .enum(['startDateTime', 'order', 'createdAt'])
    .optional()
    .default('startDateTime'),

  orderBy: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Event ID parameter validation
 */
export const eventIdParamSchema = z.object({
  eventId: z.string().uuid('Invalid event ID format'),
});

/**
 * Trip ID parameter validation
 */
export const tripIdParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip ID format'),
});

/**
 * Type exports for use in API routes
 */
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
export type EventIdParam = z.infer<typeof eventIdParamSchema>;
export type TripIdParam = z.infer<typeof tripIdParamSchema>;
export type EventLocation = z.infer<typeof eventLocationSchema>;
export type EventCost = z.infer<typeof eventCostSchema>;
