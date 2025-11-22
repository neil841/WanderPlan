/**
 * useClientFilters Hook
 *
 * Manages client list filters with URL synchronization
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ClientStatus } from '@/types/crm';

export interface ClientFilters {
  page: number;
  search: string;
  status: ClientStatus | 'all';
  tags: string[];
  sort: 'createdAt' | 'firstName' | 'lastName' | 'email';
  order: 'asc' | 'desc';
}

/**
 * Hook to manage client filters with URL sync
 */
export function useClientFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse current filters from URL
  const filters = useMemo<ClientFilters>(() => {
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('q') || '';
    const status = (searchParams.get('status') as ClientStatus) || 'all';
    const tagsParam = searchParams.get('tags') || '';
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
    const sort = (searchParams.get('sort') as ClientFilters['sort']) || 'createdAt';
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

    return { page, search, status, tags, sort, order };
  }, [searchParams]);

  // Update URL with new filters
  const updateFilters = useCallback(
    (updates: Partial<ClientFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update page
      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete('page');
        } else {
          params.set('page', updates.page.toString());
        }
      }

      // Update search
      if (updates.search !== undefined) {
        if (updates.search === '') {
          params.delete('q');
        } else {
          params.set('q', updates.search);
        }
        // Reset to page 1 when search changes
        params.delete('page');
      }

      // Update status
      if (updates.status !== undefined) {
        if (updates.status === 'all') {
          params.delete('status');
        } else {
          params.set('status', updates.status);
        }
        // Reset to page 1 when filter changes
        params.delete('page');
      }

      // Update tags
      if (updates.tags !== undefined) {
        if (updates.tags.length === 0) {
          params.delete('tags');
        } else {
          params.set('tags', updates.tags.join(','));
        }
        // Reset to page 1 when filter changes
        params.delete('page');
      }

      // Update sort
      if (updates.sort !== undefined) {
        params.set('sort', updates.sort);
      }

      // Update order
      if (updates.order !== undefined) {
        params.set('order', updates.order);
      }

      // Update URL
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(window.location.pathname);
  }, [router]);

  // Set search query
  const setSearch = useCallback(
    (search: string) => {
      updateFilters({ search });
    },
    [updateFilters]
  );

  // Set status filter
  const setStatus = useCallback(
    (status: ClientStatus | 'all') => {
      updateFilters({ status });
    },
    [updateFilters]
  );

  // Set tag filters
  const setTags = useCallback(
    (tags: string[]) => {
      updateFilters({ tags });
    },
    [updateFilters]
  );

  // Set page
  const setPage = useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  // Set sort
  const setSort = useCallback(
    (sort: ClientFilters['sort'], order?: 'asc' | 'desc') => {
      updateFilters({ sort, order });
    },
    [updateFilters]
  );

  return {
    filters,
    updateFilters,
    clearFilters,
    setSearch,
    setStatus,
    setTags,
    setPage,
    setSort,
  };
}
