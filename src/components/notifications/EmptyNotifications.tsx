/**
 * EmptyNotifications Component
 *
 * Displays an empty state when there are no notifications.
 *
 * @component
 * @example
 * <EmptyNotifications />
 */

'use client';

import { Bell } from 'lucide-react';
import { EmptyState, EmptyStateSmall } from '@/components/ui/empty-state';

export function EmptyNotifications() {
  return (
    <EmptyStateSmall
      icon={Bell}
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
    />
  );
}

/**
 * EmptyNotificationsInline Component
 *
 * A more compact version for the notification dropdown.
 */
export function EmptyNotificationsInline() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <Bell className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">No new notifications</p>
    </div>
  );
}
