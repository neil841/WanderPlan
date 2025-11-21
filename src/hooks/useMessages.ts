/**
 * useMessages Hook
 *
 * TanStack Query hooks for managing messages
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type {
  Message,
  MessageWithUser,
  MessagesResponse,
  CreateMessageRequest,
  UpdateMessageRequest,
} from '@/types/message';

/**
 * Fetch messages for a trip
 */
async function fetchMessages(
  tripId: string,
  page: number = 1,
  pageSize: number = 50,
  threadId?: string
): Promise<MessagesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (threadId) {
    params.append('threadId', threadId);
  }

  const response = await fetch(`/api/trips/${tripId}/messages?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch messages');
  }

  return response.json();
}

/**
 * Create a new message
 */
async function createMessage(
  tripId: string,
  data: CreateMessageRequest
): Promise<{ message: MessageWithUser }> {
  const response = await fetch(`/api/trips/${tripId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
}

/**
 * Update a message
 */
async function updateMessage(
  tripId: string,
  messageId: string,
  data: UpdateMessageRequest
): Promise<{ message: MessageWithUser }> {
  const response = await fetch(`/api/trips/${tripId}/messages/${messageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update message');
  }

  return response.json();
}

/**
 * Delete a message
 */
async function deleteMessage(
  tripId: string,
  messageId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/trips/${tripId}/messages/${messageId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete message');
  }

  return response.json();
}

/**
 * Hook to fetch messages with infinite scroll support
 */
export function useMessages(tripId: string, threadId?: string) {
  return useInfiniteQuery({
    queryKey: ['messages', tripId, threadId],
    queryFn: ({ pageParam = 1 }) => fetchMessages(tripId, pageParam, 50, threadId),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage(tripId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateMessageRequest) => createMessage(tripId, data),
    onSuccess: () => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
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
 * Hook to update a message
 */
export function useUpdateMessage(tripId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      updateMessage(tripId, messageId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
      toast({
        title: 'Success',
        description: 'Message updated successfully',
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
 * Hook to delete a message
 */
export function useDeleteMessage(tripId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(tripId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
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
 * Hook to optimistically add a message to the cache
 */
export function useOptimisticMessage(tripId: string) {
  const queryClient = useQueryClient();

  const addOptimisticMessage = (tempMessage: MessageWithUser) => {
    queryClient.setQueryData(
      ['messages', tripId],
      (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: MessagesResponse, index: number) => {
            // Add to first page
            if (index === 0) {
              return {
                ...page,
                messages: [tempMessage, ...page.messages],
                pagination: {
                  ...page.pagination,
                  total: page.pagination.total + 1,
                },
              };
            }
            return page;
          }),
        };
      }
    );
  };

  return { addOptimisticMessage };
}
