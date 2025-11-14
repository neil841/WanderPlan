/**
 * Poll Validation Schemas
 *
 * Zod schemas for validating poll-related requests
 */

import { z } from 'zod';

/**
 * Schema for creating a new poll
 */
export const createPollSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .max(500, 'Question must be less than 500 characters')
    .trim(),
  options: z
    .array(
      z.string().min(1, 'Option text is required').max(200, 'Option must be less than 200 characters').trim()
    )
    .min(2, 'At least 2 options are required')
    .max(10, 'Maximum 10 options allowed'),
  allowMultipleVotes: z.boolean().optional().default(false),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;

/**
 * Schema for voting on a poll
 */
export const votePollSchema = z.object({
  optionIds: z
    .array(z.string().uuid('Invalid option ID'))
    .min(1, 'At least one option must be selected')
    .max(10, 'Maximum 10 options can be selected'),
});

export type VotePollInput = z.infer<typeof votePollSchema>;
