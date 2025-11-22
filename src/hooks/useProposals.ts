/**
 * useProposals Hook
 *
 * TanStack Query hooks for proposal data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import type {
  Proposal,
  ProposalsResponse,
  CreateProposalRequest,
  UpdateProposalRequest,
} from '@/types/proposal';

/**
 * Query parameters for proposal list
 */
export interface ProposalQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  clientId?: string;
}

/**
 * Fetch proposals from API
 */
async function fetchProposals(params: ProposalQueryParams): Promise<ProposalsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.clientId) searchParams.set('clientId', params.clientId);

  const response = await fetch(`/api/proposals?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch proposals');
  }

  return response.json();
}

/**
 * Fetch single proposal
 */
async function fetchProposal(id: string): Promise<{ proposal: Proposal }> {
  const response = await fetch(`/api/proposals/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch proposal');
  }

  return response.json();
}

/**
 * Create a new proposal
 */
async function createProposal(data: CreateProposalRequest): Promise<{ proposal: Proposal }> {
  const response = await fetch('/api/proposals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create proposal');
  }

  return response.json();
}

/**
 * Update an existing proposal
 */
async function updateProposal(
  id: string,
  data: UpdateProposalRequest
): Promise<{ proposal: Proposal }> {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update proposal');
  }

  return response.json();
}

/**
 * Delete a proposal
 */
async function deleteProposal(id: string): Promise<void> {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete proposal');
  }
}

/**
 * Send proposal to client
 */
async function sendProposal(id: string): Promise<{ proposal: Proposal }> {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'SENT' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send proposal');
  }

  return response.json();
}

/**
 * Hook to fetch proposals with filters and pagination
 */
export function useProposals(params: ProposalQueryParams = {}) {
  return useQuery({
    queryKey: ['proposals', params],
    queryFn: () => fetchProposals(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch single proposal
 */
export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: () => fetchProposal(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}

/**
 * Hook to create a new proposal
 */
export function useCreateProposal() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createProposal,
    onSuccess: (data) => {
      // Invalidate all proposal queries
      queryClient.invalidateQueries({ queryKey: ['proposals'] });

      toast({
        title: 'Proposal created',
        description: 'The proposal has been saved as draft.',
      });

      // Navigate to proposal view page
      router.push(`/crm/proposals/${data.proposal.id}`);
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
 * Hook to update a proposal
 */
export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProposalRequest }) =>
      updateProposal(id, data),
    onSuccess: (data) => {
      // Invalidate all proposal queries
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', data.proposal.id] });

      toast({
        title: 'Proposal updated',
        description: 'The proposal has been updated successfully.',
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
 * Hook to delete a proposal
 */
export function useDeleteProposal() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteProposal,
    onSuccess: () => {
      // Invalidate all proposal queries
      queryClient.invalidateQueries({ queryKey: ['proposals'] });

      toast({
        title: 'Proposal deleted',
        description: 'The proposal has been deleted successfully.',
      });

      // Navigate back to proposals list
      router.push('/crm/proposals');
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
 * Hook to send a proposal to client
 */
export function useSendProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendProposal,
    onSuccess: (data) => {
      // Invalidate all proposal queries
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', data.proposal.id] });

      toast({
        title: 'Proposal sent',
        description: 'The proposal has been sent to the client via email.',
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
