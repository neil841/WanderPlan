/**
 * CRM Types
 *
 * Type definitions for CRM (Customer Relationship Management) features
 * for travel agents to manage their clients.
 */

/**
 * Client status enum
 * Matching Prisma's ClientStatus (LEAD | ACTIVE | INACTIVE)
 */
export type ClientStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

/**
 * CRM Client from database
 */
export interface Client {
  id: string;
  userId: string; // Travel agent who owns this client
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: ClientStatus;
  source: string | null; // How they found the agent
  tags: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client with agent info
 */
export interface ClientWithAgent extends Client {
  agent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}

/**
 * Create client request
 */
export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: ClientStatus;
  source?: string;
  tags?: string[];
  notes?: string;
}

/**
 * Update client request
 */
export interface UpdateClientRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  status?: ClientStatus;
  source?: string | null;
  tags?: string[];
  notes?: string | null;
}

/**
 * Clients list response
 */
export interface ClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Single client response
 */
export interface ClientResponse {
  client: Client;
}
