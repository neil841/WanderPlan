import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  destinations: string[];
  visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  coverImageUrl: string | null;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  collaboratorCount: number;
  eventCount: number;
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TripListResponse {
  success: boolean;
  data: {
    trips: Trip[];
    pagination: PaginationMetadata;
  };
}

export interface TripQueryParams {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'startDate' | 'endDate' | 'name';
  order?: 'asc' | 'desc';
  status?: 'active' | 'archived' | 'all';
  search?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export interface CreateTripInput {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  destinations?: string[];
  tags?: string[];
  visibility?: 'private' | 'shared' | 'public';
}

export interface UpdateTripInput {
  name?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  destinations?: string[];
  tags?: string[];
  visibility?: 'private' | 'shared' | 'public';
  isArchived?: boolean;
  coverImageUrl?: string | null;
}

/**
 * Custom hook to fetch trips with filtering, sorting, and pagination
 */
export function useTrips(params: TripQueryParams = {}) {
  const queryKey = ['trips', params];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<TripListResponse> => {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.tags && params.tags.length > 0) {
        queryParams.append('tags', params.tags.join(','));
      }
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await fetch(`/api/trips?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch trips');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Custom hook to create a new trip
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTripInput): Promise<Trip> => {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create trip');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      // Invalidate all trip queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * Custom hook to update an existing trip
 */
export function useUpdateTrip(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTripInput): Promise<Trip> => {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update trip');
      }

      const data = await response.json();
      return data.trip;
    },
    onSuccess: () => {
      // Invalidate trip queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}
