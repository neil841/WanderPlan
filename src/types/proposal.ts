/**
 * Proposal Types
 *
 * Type definitions for proposal management features for travel agents.
 */

/**
 * Proposal status enum
 * Matching Prisma's ProposalStatus
 */
export type ProposalStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

/**
 * Line item in a proposal
 */
export interface ProposalLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // quantity * unitPrice
}

/**
 * Basic client info for proposal display
 */
export interface ClientBasic {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Basic trip info for proposal display
 */
export interface TripBasic {
  id: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Proposal from database
 */
export interface Proposal {
  id: string;
  userId: string;
  clientId: string;
  tripId: string | null;
  title: string;
  description: string | null;
  lineItems: ProposalLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: ProposalStatus;
  validUntil: Date | null;
  notes: string | null;
  terms: string | null;
  sentAt: Date | null;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  client: ClientBasic;
  trip: TripBasic | null;
}

/**
 * Create proposal request
 */
export interface CreateProposalRequest {
  clientId: string;
  tripId?: string;
  title: string;
  description?: string;
  lineItems: ProposalLineItem[];
  tax?: number;
  discount?: number;
  currency?: string;
  validUntil?: string; // ISO date string
  notes?: string;
  terms?: string;
}

/**
 * Update proposal request
 */
export interface UpdateProposalRequest {
  title?: string;
  description?: string;
  lineItems?: ProposalLineItem[];
  tax?: number;
  discount?: number;
  status?: ProposalStatus;
  validUntil?: string; // ISO date string
  notes?: string;
  terms?: string;
}

/**
 * Proposals list response
 */
export interface ProposalsResponse {
  proposals: Proposal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Single proposal response
 */
export interface ProposalResponse {
  proposal: Proposal;
}
