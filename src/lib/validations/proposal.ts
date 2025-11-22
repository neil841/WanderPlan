/**
 * Proposal Validation Schemas
 *
 * Zod schemas for validating proposal API requests
 */

import { z } from 'zod';

/**
 * Line item schema
 * Validates individual proposal line items
 */
export const proposalLineItemSchema = z.object({
  id: z.string().uuid('Line item ID must be a valid UUID'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be at most 500 characters'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  total: z.number().nonnegative('Total must be non-negative'),
}).refine(
  (item) => {
    // Allow small floating point errors (within 0.01)
    const expectedTotal = item.quantity * item.unitPrice;
    return Math.abs(item.total - expectedTotal) < 0.01;
  },
  {
    message: 'Line item total must equal quantity × unitPrice',
  }
);

/**
 * Create proposal schema
 */
export const createProposalSchema = z.object({
  clientId: z.string().uuid('Client ID must be a valid UUID'),
  tripId: z.string().uuid('Trip ID must be a valid UUID').optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  lineItems: z.array(proposalLineItemSchema).min(1, 'At least one line item is required'),
  tax: z.number().nonnegative('Tax must be non-negative').optional(),
  discount: z.number().nonnegative('Discount must be non-negative').optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').optional(),
  validUntil: z.string().datetime('Invalid date format').optional(),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
  terms: z.string().max(5000, 'Terms must be at most 5000 characters').optional(),
}).refine(
  (data) => {
    // Calculate subtotal from line items
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.total, 0);

    // Validate that we have positive subtotal
    return subtotal > 0;
  },
  {
    message: 'Subtotal must be greater than zero',
  }
);

/**
 * Update proposal schema
 */
export const updateProposalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters').optional(),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional().nullable(),
  lineItems: z.array(proposalLineItemSchema).min(1, 'At least one line item is required').optional(),
  tax: z.number().nonnegative('Tax must be non-negative').optional(),
  discount: z.number().nonnegative('Discount must be non-negative').optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be DRAFT, SENT, ACCEPTED, or REJECTED' }),
  }).optional(),
  validUntil: z.string().datetime('Invalid date format').optional().nullable(),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional().nullable(),
  terms: z.string().max(5000, 'Terms must be at most 5000 characters').optional().nullable(),
});

/**
 * Query parameters schema for listing proposals
 */
export const proposalQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => {
    const parsed = val ? parseInt(val, 10) : 20;
    return Math.min(parsed, 100); // Max 100 per page
  }),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']).optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
}).transform((data) => ({
  page: Math.max(1, data.page),
  limit: Math.max(1, Math.min(100, data.limit)),
  status: data.status,
  clientId: data.clientId,
  search: data.search,
}));

/**
 * Type exports
 */
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type ProposalQueryInput = z.infer<typeof proposalQuerySchema>;
