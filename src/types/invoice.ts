/**
 * Invoice Types
 *
 * Type definitions for invoice management features for travel agents.
 */

import type { ClientBasic, TripBasic } from './proposal';

/**
 * Invoice status enum
 * Matching Prisma's InvoiceStatus
 * Note: OVERDUE is calculated dynamically, not stored in database
 */
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

/**
 * Database invoice status (what's actually stored)
 */
export type InvoiceStatusDB = 'DRAFT' | 'SENT' | 'PAID';

/**
 * Line item in an invoice
 */
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // quantity * unitPrice
}

/**
 * Invoice from database
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  clientId: string;
  tripId: string | null;
  title: string;
  description: string | null;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: InvoiceStatus; // Includes dynamic OVERDUE
  issueDate: Date;
  dueDate: Date;
  paidAt: Date | null;
  notes: string | null;
  terms: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  client: ClientBasic;
  trip: TripBasic | null;
}

/**
 * Create invoice request
 */
export interface CreateInvoiceRequest {
  clientId: string;
  tripId?: string;
  title: string;
  description?: string;
  lineItems: InvoiceLineItem[];
  tax?: number;
  discount?: number;
  currency?: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  notes?: string;
  terms?: string;
}

/**
 * Update invoice request
 */
export interface UpdateInvoiceRequest {
  title?: string;
  description?: string;
  lineItems?: InvoiceLineItem[];
  tax?: number;
  discount?: number;
  status?: InvoiceStatusDB; // Cannot set OVERDUE directly
  issueDate?: string; // ISO date string
  dueDate?: string; // ISO date string
  notes?: string;
  terms?: string;
}

/**
 * Invoices list response
 */
export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Single invoice response
 */
export interface InvoiceResponse {
  invoice: Invoice;
}
