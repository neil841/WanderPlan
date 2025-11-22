/**
 * Landing Page Validation Schemas
 *
 * Zod schemas for validating landing page and lead requests.
 */

import { z } from 'zod';

/**
 * Block schema for landing page content
 */
const blockSchema = z.object({
  id: z.string().uuid('Invalid block ID'),
  type: z.enum(['hero', 'text', 'features', 'gallery', 'lead-capture', 'pricing'], {
    errorMap: () => ({ message: 'Invalid block type' }),
  }),
  data: z.record(z.any()),
});

/**
 * Content schema for landing page
 */
const contentSchema = z.object({
  blocks: z
    .array(blockSchema)
    .min(1, 'Landing page must have at least one content block'),
});

/**
 * Slug validation regex (lowercase letters, numbers, hyphens only)
 */
const slugRegex = /^[a-z0-9-]+$/;

/**
 * Schema for creating a landing page
 */
export const createLandingPageSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens'),

  tripId: z.string().uuid('Invalid trip ID').optional(),

  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  content: contentSchema,

  isPublished: z.boolean().optional().default(false),
});

/**
 * Schema for updating a landing page
 */
export const updateLandingPageSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),

  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),

  content: contentSchema.optional(),

  isPublished: z.boolean().optional(),
});

/**
 * Schema for creating a lead
 */
export const createLeadSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),

  email: z.string().email('Invalid email address'),

  phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),

  message: z
    .string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
});

/**
 * Schema for slug parameter
 */
export const slugParamSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(slugRegex, 'Invalid slug format'),
});

/**
 * Type exports
 */
export type CreateLandingPageInput = z.infer<typeof createLandingPageSchema>;
export type UpdateLandingPageInput = z.infer<typeof updateLandingPageSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type SlugParam = z.infer<typeof slugParamSchema>;
