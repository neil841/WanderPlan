/**
 * Notifications Hooks
 *
 * TanStack Query hooks for notification operations
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type {
  GetNotificationsResponse,
  Notification,
  MarkNotificationReadResponse,
  MarkAllReadResponse,
} from '@/types/notification';

/**
 * Fetch notifications
 */
async function fetchNotifications(
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<GetNotificationsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    unreadOnly: unreadOnly.toString(),
  });

  const response = await fetch(`/api/notifications?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
}

/**
 * Mark notification as read/unread
 */
async function markNotificationRead(
  notificationId: string,
  isRead: boolean
): Promise<MarkNotificationReadResponse> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isRead }),
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }

  return response.json();
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsRead(): Promise<MarkAllReadResponse> {
  const response = await fetch('/api/notifications/mark-all-read', {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }

  return response.json();
}

/**
 * Delete notification
 */
async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }

  return response.json();
}

/**
 * Hook to fetch notifications with pagination
 */
export function useNotifications(options?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  return useQuery({
    queryKey: ['notifications', options?.page, options?.limit, options?.unreadOnly],
    queryFn: () =>
      fetchNotifications(
        options?.page || 1,
        options?.limit || 20,
        options?.unreadOnly || false
      ),
  });
}

/**
 * Hook to fetch notifications with infinite scroll
 */
export function useInfiniteNotifications(options?: {
  limit?: number;
  unreadOnly?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ['notifications', 'infinite', options?.limit, options?.unreadOnly],
    queryFn: ({ pageParam = 1 }) =>
      fetchNotifications(
        pageParam,
        options?.limit || 20,
        options?.unreadOnly || false
      ),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Hook to get unread count
 */
export function useUnreadCount() {
  const { data } = useNotifications({ page: 1, limit: 1 });
  return data?.unreadCount || 0;
}

/**
 * Hook to mark notification as read/unread
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, isRead }: { notificationId: string; isRead: boolean }) =>
      markNotificationRead(notificationId, isRead),
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
