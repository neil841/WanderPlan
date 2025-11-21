/**
 * Notifications Page
 *
 * View and manage all notifications
 */

'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Loader2 } from 'lucide-react';
import {
  useInfiniteNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [filterUnread, setFilterUnread] = useState(false);

  // Fetch notifications with infinite scroll
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteNotifications({
    unreadOnly: filterUnread,
    limit: 50,
  });

  // Mutations
  const markNotificationReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Infinite scroll
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten paginated notifications
  const notifications = data?.pages.flatMap((page) => page.notifications) || [];
  const unreadCount = data?.pages[0]?.unreadCount || 0;

  const handleMarkAsRead = (notificationId: string, isRead: boolean) => {
    markNotificationReadMutation.mutate({ notificationId, isRead });
  };

  const handleDelete = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={filterUnread ? 'unread' : 'all'}
        onValueChange={(value) => setFilterUnread(value === 'unread')}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">
            All {data?.pages[0]?.pagination.total ? `(${data.pages[0].pagination.total})` : ''}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 rounded-full bg-muted">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  {filterUnread ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {filterUnread
                    ? 'All caught up!'
                    : 'Notifications about trip updates will appear here'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center p-4 border-t">
                  {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchNextPage()}
                      className="w-full"
                    >
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
