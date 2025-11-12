/**
 * Trip Validation Schemas
 *
 * Zod schemas for validating trip-related requests based on API specs.
 * All schemas follow the OpenAPI specification defined in api-specs.yaml.
 *
 * @module TripValidations
 */

import { z } from 'zod';

/**
 * Query parameters for listing trips (GET /api/trips)
 */
export const tripListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1).default(1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100).default(20)),

  sort: z
    .enum(['createdAt', 'startDate', 'endDate', 'name'])
    .optional()
    .default('createdAt'),

  order: z.enum(['asc', 'desc']).optional().default('desc'),

  status: z.enum(['active', 'archived', 'all']).optional().default('active'),

  search: z.string().optional(),

  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((t) => t.trim()) : undefined)),

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
});

/**
 * Trip creation request body (POST /api/trips)
 */
export const createTripSchema = z.object({
  name: z
    .string()
    .min(1, 'Trip name is required')
    .max(200, 'Trip name must be less than 200 characters'),

  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),

  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid start date format')
    .transform((val) => new Date(val)),

  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid end date format')
    .transform((val) => new Date(val)),

  destinations: z.array(z.string()).optional().default([]),

  tags: z.array(z.string()).optional().default([]),

  visibility: z
    .enum(['private', 'shared', 'public'])
    .optional()
    .default('private'),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

/**
 * Trip update request body (PATCH /api/trips/[tripId])
 */
export const updateTripSchema = createTripSchema.partial().extend({
  isArchived: z.boolean().optional(),
  coverImageUrl: z
    .string()
    .url('Invalid URL format for cover image')
    .optional()
    .nullable(),
});

/**
 * Trip ID parameter validation
 */
export const tripIdParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip ID format'),
});

/**
 * Bulk delete trips request body
 */
export const bulkDeleteTripsSchema = z.object({
  tripIds: z
    .array(z.string().uuid('Invalid trip ID'))
    .min(1, 'At least one trip ID required')
    .max(50, 'Cannot delete more than 50 trips at once'),
});

/**
 * Bulk archive trips request body
 */
export const bulkArchiveTripsSchema = z.object({
  tripIds: z
    .array(z.string().uuid('Invalid trip ID'))
    .min(1, 'At least one trip ID required')
    .max(50, 'Cannot archive more than 50 trips at once'),
  isArchived: z.boolean(),
});

/**
 * Type exports for use in API routes
 */
export type TripListQuery = z.infer<typeof tripListQuerySchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type TripIdParam = z.infer<typeof tripIdParamSchema>;
export type BulkDeleteTripsInput = z.infer<typeof bulkDeleteTripsSchema>;
export type BulkArchiveTripsInput = z.infer<typeof bulkArchiveTripsSchema>;
