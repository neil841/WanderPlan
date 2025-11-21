/**
 * Idea Validation Schemas
 *
 * Zod schemas for validating idea-related requests
 */

import { z } from 'zod';

/**
 * Schema for creating a new idea
 */
export const createIdeaSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5,000 characters')
    .trim(),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;

/**
 * Schema for updating an idea
 */
export const updateIdeaSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5,000 characters')
    .trim()
    .optional(),
  status: z.enum(['OPEN', 'ACCEPTED', 'REJECTED']).optional(),
});

export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;

/**
 * Schema for voting on an idea
 */
export const voteIdeaSchema = z.object({
  vote: z.number().int().min(-1).max(1), // -1 (downvote), 0 (remove vote), 1 (upvote)
});

export type VoteIdeaInput = z.infer<typeof voteIdeaSchema>;
