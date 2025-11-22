/**
 * useInvoices Hook
 *
 * TanStack Query hooks for invoice data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import type {
  Invoice,
  InvoicesResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceStatusDB,
} from '@/types/invoice';

/**
 * Query parameters for invoice list
 */
export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatusDB;
  clientId?: string;
}

/**
 * Fetch invoices from API
 */
async function fetchInvoices(params: InvoiceQueryParams): Promise<InvoicesResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.clientId) searchParams.set('clientId', params.clientId);

  const response = await fetch(`/api/invoices?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch invoices');
  }

  return response.json();
}

/**
 * Fetch single invoice
 */
async function fetchInvoice(id: string): Promise<{ invoice: Invoice }> {
  const response = await fetch(`/api/invoices/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch invoice');
  }

  return response.json();
}

/**
 * Create a new invoice
 */
async function createInvoice(data: CreateInvoiceRequest): Promise<{ invoice: Invoice }> {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create invoice');
  }

  return response.json();
}

/**
 * Update an existing invoice
 */
async function updateInvoice(
  id: string,
  data: UpdateInvoiceRequest
): Promise<{ invoice: Invoice }> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update invoice');
  }

  return response.json();
}

/**
 * Delete an invoice
 */
async function deleteInvoice(id: string): Promise<void> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete invoice');
  }
}

/**
 * Mark invoice as paid
 */
async function markInvoiceAsPaid(id: string): Promise<{ invoice: Invoice }> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'PAID' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark invoice as paid');
  }

  return response.json();
}

/**
 * Hook to fetch invoices with filters and pagination
 */
export function useInvoices(params: InvoiceQueryParams = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => fetchInvoices(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch single invoice
 */
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}

/**
 * Hook to create a new invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      // Invalidate all invoice queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      toast({
        title: 'Invoice created',
        description: 'The invoice has been saved as draft.',
      });

      // Navigate to invoice view page
      router.push(`/crm/invoices/${data.invoice.id}`);
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
 * Hook to update an invoice
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceRequest }) =>
      updateInvoice(id, data),
    onSuccess: (data) => {
      // Invalidate all invoice queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice.id] });

      toast({
        title: 'Invoice updated',
        description: 'The invoice has been updated successfully.',
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
 * Hook to delete an invoice
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      // Invalidate all invoice queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      toast({
        title: 'Invoice deleted',
        description: 'The invoice has been deleted successfully.',
      });

      // Navigate back to invoices list
      router.push('/crm/invoices');
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
 * Hook to mark invoice as paid
 */
export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markInvoiceAsPaid,
    onSuccess: (data) => {
      // Invalidate all invoice queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice.id] });

      toast({
        title: 'Invoice marked as paid',
        description: 'The invoice has been marked as paid successfully.',
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
