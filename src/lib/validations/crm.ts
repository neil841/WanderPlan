/**
 * CRM Validation Schemas
 *
 * Zod schemas for validating CRM client management requests.
 */

import { z } from 'zod';

/**
 * Create client validation schema
 */
export const createClientSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less'),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be 255 characters or less'),
  phone: z
    .string()
    .max(20, 'Phone number must be 20 characters or less')
    .optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional().default('LEAD'),
  source: z
    .string()
    .max(100, 'Source must be 100 characters or less')
    .optional(),
  tags: z.array(z.string()).optional().default([]),
  notes: z
    .string()
    .max(5000, 'Notes must be 5000 characters or less')
    .optional(),
});

/**
 * Update client validation schema
 */
export const updateClientSchema = createClientSchema.partial();

/**
 * Client query params validation
 */
export const clientQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(), // Search query
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(), // Filter by status
  tags: z.string().optional(), // Comma-separated tags to filter
  sort: z.enum(['createdAt', 'firstName', 'lastName', 'email']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});
