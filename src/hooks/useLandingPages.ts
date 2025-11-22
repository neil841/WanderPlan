/**
 * useLandingPages Hook
 *
 * TanStack Query hooks for landing page data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import type {
  LandingPage,
  LandingPageListResponse,
  LandingPageResponse,
  CreateLandingPageRequest,
  UpdateLandingPageRequest,
  LeadResponse,
  CreateLeadRequest,
} from '@/types/landing-page';

/**
 * Query parameters for landing page list
 */
export interface LandingPageQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: 'all' | 'published' | 'draft';
  sort?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'asc' | 'desc';
}

/**
 * Fetch landing pages from API
 */
async function fetchLandingPages(params: LandingPageQueryParams): Promise<LandingPageListResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.q) searchParams.set('q', params.q);
  if (params.status && params.status !== 'all') {
    searchParams.set('isPublished', params.status === 'published' ? 'true' : 'false');
  }
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);

  const response = await fetch(`/api/landing-pages?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch landing pages');
  }

  return response.json();
}

/**
 * Fetch a single landing page by slug
 */
async function fetchLandingPageBySlug(slug: string): Promise<LandingPage> {
  const response = await fetch(`/api/landing-pages/${slug}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch landing page');
  }

  const data: LandingPageResponse = await response.json();
  return data.data;
}

/**
 * Create a new landing page
 */
async function createLandingPage(data: CreateLandingPageRequest): Promise<{ data: LandingPage }> {
  const response = await fetch('/api/landing-pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create landing page');
  }

  return response.json();
}

/**
 * Update an existing landing page
 */
async function updateLandingPage(slug: string, data: UpdateLandingPageRequest): Promise<{ data: LandingPage }> {
  const response = await fetch(`/api/landing-pages/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update landing page');
  }

  return response.json();
}

/**
 * Delete a landing page
 */
async function deleteLandingPage(slug: string): Promise<void> {
  const response = await fetch(`/api/landing-pages/${slug}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete landing page');
  }
}

/**
 * Submit a lead via landing page
 */
async function submitLead(slug: string, data: CreateLeadRequest): Promise<LeadResponse> {
  const response = await fetch(`/api/landing-pages/${slug}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit lead');
  }

  return response.json();
}

/**
 * Hook to fetch landing pages list with filters
 */
export function useLandingPages(params: LandingPageQueryParams = {}) {
  return useQuery({
    queryKey: ['landing-pages', params],
    queryFn: () => fetchLandingPages(params),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single landing page by slug
 */
export function useLandingPage(slug: string) {
  return useQuery({
    queryKey: ['landing-page', slug],
    queryFn: () => fetchLandingPageBySlug(slug),
    enabled: !!slug,
    staleTime: 30000,
  });
}

/**
 * Hook to create a new landing page
 */
export function useCreateLandingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createLandingPage,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast({
        title: 'Success',
        description: 'Landing page created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an existing landing page
 */
export function useUpdateLandingPage(slug: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateLandingPageRequest) => updateLandingPage(slug, data),
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['landing-page', slug] });
      const previousData = queryClient.getQueryData(['landing-page', slug]);

      queryClient.setQueryData(['landing-page', slug], (old: LandingPage | undefined) => {
        if (!old) return old;
        return { ...old, ...newData };
      });

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page', slug] });
      toast({
        title: 'Success',
        description: 'Landing page updated successfully',
      });
    },
    onError: (error: Error, _newData, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['landing-page', slug], context.previousData);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a landing page
 */
export function useDeleteLandingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteLandingPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast({
        title: 'Success',
        description: 'Landing page deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });
}

/**
 * Hook to submit a lead (public, no authentication)
 */
export function useSubmitLead(slug: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => submitLead(slug, data),
    onSuccess: () => {
      toast({
        title: 'Thank you!',
        description: "We've received your request and will contact you soon.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });
}
