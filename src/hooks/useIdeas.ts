/**
 * useIdeas Hook
 *
 * TanStack Query hooks for managing ideas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type {
  IdeasResponse,
  IdeaWithVotes,
  CreateIdeaRequest,
  UpdateIdeaRequest,
  VoteIdeaRequest,
  IdeaStatus,
} from '@/types/idea';

/**
 * Fetch ideas for a trip
 */
async function fetchIdeas(
  tripId: string,
  status?: IdeaStatus
): Promise<IdeasResponse> {
  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`/api/trips/${tripId}/ideas?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch ideas');
  }

  return response.json();
}

/**
 * Create a new idea
 */
async function createIdea(
  tripId: string,
  data: CreateIdeaRequest
): Promise<{ idea: IdeaWithVotes }> {
  const response = await fetch(`/api/trips/${tripId}/ideas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create idea');
  }

  return response.json();
}

/**
 * Update an idea
 */
async function updateIdea(
  tripId: string,
  ideaId: string,
  data: UpdateIdeaRequest
): Promise<{ idea: IdeaWithVotes }> {
  const response = await fetch(`/api/trips/${tripId}/ideas/${ideaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update idea');
  }

  return response.json();
}

/**
 * Delete an idea
 */
async function deleteIdea(
  tripId: string,
  ideaId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/trips/${tripId}/ideas/${ideaId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete idea');
  }

  return response.json();
}

/**
 * Vote on an idea
 */
async function voteOnIdea(
  tripId: string,
  ideaId: string,
  data: VoteIdeaRequest
): Promise<{ voteCount: number; upvoteCount: number; downvoteCount: number }> {
  const response = await fetch(`/api/trips/${tripId}/ideas/${ideaId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to vote on idea');
  }

  return response.json();
}

/**
 * Hook to fetch ideas
 */
export function useIdeas(tripId: string, status?: IdeaStatus) {
  return useQuery({
    queryKey: ['ideas', tripId, status],
    queryFn: () => fetchIdeas(tripId, status),
  });
}

/**
 * Hook to create an idea
 */
export function useCreateIdea(tripId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateIdeaRequest) => createIdea(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas', tripId] });
      toast({
        title: 'Success',
        description: 'Idea created successfully',
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
 * Hook to update an idea
 */
export function useUpdateIdea(tripId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ ideaId, data }: { ideaId: string; data: UpdateIdeaRequest }) =>
      updateIdea(tripId, ideaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas', tripId] });
      toast({
        title: 'Success',
        description: 'Idea updated successfully',
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
 * Hook to delete an idea
 */
export function useDeleteIdea(tripId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (ideaId: string) => deleteIdea(tripId, ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas', tripId] });
      toast({
        title: 'Success',
        description: 'Idea deleted successfully',
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
 * Hook to vote on an idea
 */
export function useVoteIdea(tripId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ ideaId, vote }: { ideaId: string; vote: number }) =>
      voteOnIdea(tripId, ideaId, { vote }),
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['ideas', tripId], (old: IdeasResponse | undefined) => {
        if (!old) return old;

        return {
          ...old,
          ideas: old.ideas.map((idea) =>
            idea.id === variables.ideaId
              ? {
                  ...idea,
                  voteCount: data.voteCount,
                  upvoteCount: data.upvoteCount,
                  downvoteCount: data.downvoteCount,
                  currentUserVote: variables.vote === 0 ? null : variables.vote,
                }
              : idea
          ),
        };
      });

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['ideas', tripId] });
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
