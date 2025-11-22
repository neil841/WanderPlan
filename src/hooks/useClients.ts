/**
 * useClients Hook
 *
 * TanStack Query hooks for CRM client data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import type {
  Client,
  ClientsResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from '@/types/crm';

/**
 * Query parameters for client list
 */
export interface ClientQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  tags?: string;
  sort?: 'createdAt' | 'firstName' | 'lastName' | 'email';
  order?: 'asc' | 'desc';
}

/**
 * Fetch clients from API
 */
async function fetchClients(params: ClientQueryParams): Promise<ClientsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.q) searchParams.set('q', params.q);
  if (params.status) searchParams.set('status', params.status);
  if (params.tags) searchParams.set('tags', params.tags);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);

  const response = await fetch(`/api/crm/clients?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch clients');
  }

  return response.json();
}

/**
 * Create a new client
 */
async function createClient(data: CreateClientRequest): Promise<{ client: Client }> {
  const response = await fetch('/api/crm/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create client');
  }

  return response.json();
}

/**
 * Update an existing client
 */
async function updateClient(id: string, data: UpdateClientRequest): Promise<{ client: Client }> {
  const response = await fetch(`/api/crm/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update client');
  }

  return response.json();
}

/**
 * Delete a client
 */
async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/crm/clients/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete client');
  }
}

/**
 * Hook to fetch clients with filters and pagination
 */
export function useClients(params: ClientQueryParams = {}) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => fetchClients(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      // Invalidate all client queries
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      toast({
        title: 'Client created',
        description: 'The client has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update a client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientRequest }) =>
      updateClient(id, data),
    onSuccess: () => {
      // Invalidate all client queries
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      toast({
        title: 'Client updated',
        description: 'The client has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      // Invalidate all client queries
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      toast({
        title: 'Client deleted',
        description: 'The client has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
