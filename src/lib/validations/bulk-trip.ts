/**
 * Validation schemas for bulk trip operations
 *
 * These schemas validate requests for bulk archive, delete, and tag operations
 * on multiple trips at once.
 */

import { z } from 'zod';

/**
 * Schema for bulk archive operation
 * Validates array of trip IDs to be archived
 */
export const bulkArchiveSchema = z.object({
  tripIds: z
    .array(z.string().uuid('Invalid trip ID format'))
    .min(1, 'At least one trip ID is required')
    .max(100, 'Cannot archive more than 100 trips at once'),
});

/**
 * Schema for bulk delete operation
 * Validates array of trip IDs to be deleted
 */
export const bulkDeleteSchema = z.object({
  tripIds: z
    .array(z.string().uuid('Invalid trip ID format'))
    .min(1, 'At least one trip ID is required')
    .max(50, 'Cannot delete more than 50 trips at once'),
});

/**
 * Schema for bulk tag operation
 * Validates array of trip IDs and tag names to be added
 */
export const bulkTagSchema = z.object({
  tripIds: z
    .array(z.string().uuid('Invalid trip ID format'))
    .min(1, 'At least one trip ID is required')
    .max(100, 'Cannot tag more than 100 trips at once'),
  tagNames: z
    .array(
      z
        .string()
        .min(1, 'Tag name cannot be empty')
        .max(50, 'Tag name cannot exceed 50 characters')
    )
    .min(1, 'At least one tag name is required')
    .max(10, 'Cannot add more than 10 tags at once'),
  tagColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format')
    .optional(),
});

// Type exports
export type BulkArchiveInput = z.infer<typeof bulkArchiveSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type BulkTagInput = z.infer<typeof bulkTagSchema>;
