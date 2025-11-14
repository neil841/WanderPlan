/**
 * Polls Hooks
 *
 * TanStack Query hooks for polls and voting
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Poll,
  PollWithResults,
  PollsResponse,
  CreatePollRequest,
  VotePollRequest,
  PollStatus,
} from '@/types/poll';

const API_BASE = '/api/trips';

/**
 * Fetch polls for a trip
 */
async function fetchPolls(
  tripId: string,
  status?: PollStatus
): Promise<PollsResponse> {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }

  const url = `${API_BASE}/${tripId}/polls${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch polls');
  }

  return response.json();
}

/**
 * Create a new poll
 */
async function createPoll(
  tripId: string,
  data: CreatePollRequest
): Promise<PollWithResults> {
  const response = await fetch(`${API_BASE}/${tripId}/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create poll');
  }

  const result = await response.json();
  return result.poll;
}

/**
 * Vote on a poll
 */
async function votePoll(
  tripId: string,
  pollId: string,
  data: VotePollRequest
): Promise<PollWithResults> {
  const response = await fetch(`${API_BASE}/${tripId}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to vote on poll');
  }

  const result = await response.json();
  return result.poll;
}

/**
 * Close or reopen a poll
 */
async function updatePollStatus(
  tripId: string,
  pollId: string,
  status: PollStatus
): Promise<PollWithResults> {
  const response = await fetch(`${API_BASE}/${tripId}/polls/${pollId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update poll status');
  }

  const result = await response.json();
  return result.poll;
}

/**
 * Delete a poll
 */
async function deletePoll(tripId: string, pollId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${tripId}/polls/${pollId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete poll');
  }
}

/**
 * Hook to fetch polls
 */
export function usePolls(tripId: string, status?: PollStatus) {
  return useQuery({
    queryKey: ['polls', tripId, status],
    queryFn: () => fetchPolls(tripId, status),
  });
}

/**
 * Hook to create a poll
 */
export function useCreatePoll(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePollRequest) => createPoll(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    },
  });
}

/**
 * Hook to vote on a poll with optimistic updates
 */
export function useVotePoll(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, vote }: { pollId: string; vote: VotePollRequest }) =>
      votePoll(tripId, pollId, vote),
    onMutate: async ({ pollId, vote }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['polls', tripId] });

      // Snapshot previous value
      const previousPolls = queryClient.getQueryData<PollsResponse>(['polls', tripId]);

      // Optimistically update
      if (previousPolls) {
        queryClient.setQueryData<PollsResponse>(['polls', tripId], {
          ...previousPolls,
          polls: previousPolls.polls.map((poll) => {
            if (poll.id !== pollId) return poll;

            // Update options with new vote
            const updatedOptions = poll.options.map((option) => {
              const wasVoted = poll.userVotedOptionIds.includes(option.id);
              const isNowVoted = vote.optionIds.includes(option.id);

              let voteCount = option.voteCount;
              if (!wasVoted && isNowVoted) voteCount++;
              if (wasVoted && !isNowVoted) voteCount--;

              const totalVotes = poll.totalVotes + (isNowVoted && !wasVoted ? 1 : wasVoted && !isNowVoted ? -1 : 0);
              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

              return {
                ...option,
                voteCount,
                percentage,
                userVoted: isNowVoted,
              };
            });

            return {
              ...poll,
              options: updatedOptions,
              userVotedOptionIds: vote.optionIds,
              userHasVoted: vote.optionIds.length > 0,
            };
          }),
        });
      }

      return { previousPolls };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousPolls) {
        queryClient.setQueryData(['polls', tripId], context.previousPolls);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    },
  });
}

/**
 * Hook to update poll status
 */
export function useUpdatePollStatus(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, status }: { pollId: string; status: PollStatus }) =>
      updatePollStatus(tripId, pollId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    },
  });
}

/**
 * Hook to delete a poll
 */
export function useDeletePoll(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pollId: string) => deletePoll(tripId, pollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    },
  });
}
