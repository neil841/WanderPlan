/**
 * Message Validation Schemas
 *
 * Zod schemas for validating message-related requests
 */

import { z } from 'zod';

/**
 * Schema for creating a new message
 */
export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(10000, 'Message content must be less than 10,000 characters')
    .trim(),
  replyTo: z.string().uuid('Invalid reply message ID').optional().nullable(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

/**
 * Schema for updating a message
 */
export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(10000, 'Message content must be less than 10,000 characters')
    .trim(),
});

export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

/**
 * Schema for message pagination query params
 */
export const messagePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  threadId: z.string().uuid().optional(), // Get replies for a specific message
});

export type MessagePaginationInput = z.infer<typeof messagePaginationSchema>;
