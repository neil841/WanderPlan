/**
 * NotificationItem Component
 *
 * Displays a single notification with icon, message, and actions
 */

'use client';

import { ActivityActionType } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  CalendarPlus,
  CalendarCog,
  CalendarX,
  UserPlus,
  UserMinus,
  DollarSign,
  MapPin,
  X,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (notificationId: string, isRead: boolean) => void;
  onDelete?: (notificationId: string) => void;
  className?: string;
}

/**
 * Get icon component for activity type
 */
function getActivityIcon(actionType: ActivityActionType) {
  const iconClass = 'h-4 w-4';

  switch (actionType) {
    case ActivityActionType.MESSAGE_POSTED:
      return <MessageSquare className={cn(iconClass, 'text-blue-600')} />;
    case ActivityActionType.EVENT_CREATED:
      return <CalendarPlus className={cn(iconClass, 'text-green-600')} />;
    case ActivityActionType.EVENT_UPDATED:
      return <CalendarCog className={cn(iconClass, 'text-yellow-600')} />;
    case ActivityActionType.EVENT_DELETED:
      return <CalendarX className={cn(iconClass, 'text-red-600')} />;
    case ActivityActionType.COLLABORATOR_ADDED:
      return <UserPlus className={cn(iconClass, 'text-green-600')} />;
    case ActivityActionType.COLLABORATOR_REMOVED:
      return <UserMinus className={cn(iconClass, 'text-red-600')} />;
    case ActivityActionType.EXPENSE_ADDED:
      return <DollarSign className={cn(iconClass, 'text-emerald-600')} />;
    case ActivityActionType.TRIP_UPDATED:
      return <MapPin className={cn(iconClass, 'text-purple-600')} />;
    default:
      return <MessageSquare className={cn(iconClass, 'text-gray-600')} />;
  }
}

/**
 * Format notification message
 */
function formatNotificationMessage(notification: Notification): string {
  const activity = notification.activity;
  const userName = `${activity.user.firstName} ${activity.user.lastName}`;
  const { actionType, actionData } = activity;
  const tripName = activity.trip.name;

  switch (actionType) {
    case ActivityActionType.MESSAGE_POSTED:
      return `${userName} posted a message in ${tripName}`;

    case ActivityActionType.EVENT_CREATED:
      return `${userName} created ${actionData.eventType?.toLowerCase() || 'an event'} in ${tripName}`;

    case ActivityActionType.EVENT_UPDATED:
      return `${userName} updated an event in ${tripName}`;

    case ActivityActionType.EVENT_DELETED:
      return `${userName} deleted an event in ${tripName}`;

    case ActivityActionType.COLLABORATOR_ADDED:
      return `${userName} added ${actionData.collaboratorName} to ${tripName}`;

    case ActivityActionType.COLLABORATOR_REMOVED:
      return `${userName} removed ${actionData.collaboratorName} from ${tripName}`;

    case ActivityActionType.EXPENSE_ADDED:
      return `${userName} added an expense in ${tripName}`;

    case ActivityActionType.TRIP_UPDATED:
      return `${userName} updated ${tripName}`;

    default:
      return `${userName} performed an action in ${tripName}`;
  }
}

/**
 * Get link for notification
 */
function getNotificationLink(notification: Notification): string {
  const { tripId, actionType, actionData } = notification.activity;

  switch (actionType) {
    case ActivityActionType.MESSAGE_POSTED:
      return `/trips/${tripId}/messages`;
    case ActivityActionType.EVENT_CREATED:
    case ActivityActionType.EVENT_UPDATED:
    case ActivityActionType.EVENT_DELETED:
      return `/trips/${tripId}/itinerary`;
    case ActivityActionType.EXPENSE_ADDED:
      return `/trips/${tripId}/budget`;
    case ActivityActionType.COLLABORATOR_ADDED:
    case ActivityActionType.COLLABORATOR_REMOVED:
      return `/trips/${tripId}/collaborators`;
    default:
      return `/trips/${tripId}`;
  }
}

/**
 * Get user initials for avatar fallback
 */
function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  className,
}: NotificationItemProps) {
  const message = formatNotificationMessage(notification);
  const link = getNotificationLink(notification);
  const timestamp = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const { activity } = notification;

  return (
    <div
      className={cn(
        'group flex gap-3 p-4 hover:bg-accent/50 transition-colors',
        !notification.isRead && 'bg-primary/5',
        className
      )}
    >
      {/* Icon Background */}
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {getActivityIcon(activity.actionType)}
        </div>
      </div>

      {/* Content - Clickable Link */}
      <Link href={link} className="flex-1 min-w-0 space-y-1" onClick={() => {
        if (!notification.isRead && onMarkAsRead) {
          onMarkAsRead(notification.id, true);
        }
      }}>
        <p className={cn(
          'text-sm',
          !notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
        )}>
          {message}
        </p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </Link>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onMarkAsRead?.(notification.id, true)}
            aria-label="Mark as read"
          >
            <Check className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onMarkAsRead?.(notification.id, false)}
            aria-label="Mark as unread"
          >
            <div className="h-2 w-2 rounded-full bg-primary" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={() => onDelete?.(notification.id)}
          aria-label="Delete notification"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0 flex items-center">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}
