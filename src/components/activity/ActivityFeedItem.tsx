/**
 * ActivityFeedItem Component
 *
 * Displays a single activity entry with icon, message, and timestamp
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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ActivityWithUser } from '@/types/activity';

interface ActivityFeedItemProps {
  activity: ActivityWithUser;
  className?: string;
}

/**
 * Get icon component for activity type
 */
function getActivityIcon(actionType: ActivityActionType) {
  const iconClass = 'h-4 w-4';

  switch (actionType) {
    case ActivityActionType.MESSAGE_POSTED:
      return <MessageSquare className={cn(iconClass, 'text-blue-600')} aria-hidden="true" />;
    case ActivityActionType.EVENT_CREATED:
      return <CalendarPlus className={cn(iconClass, 'text-green-600')} aria-hidden="true" />;
    case ActivityActionType.EVENT_UPDATED:
      return <CalendarCog className={cn(iconClass, 'text-yellow-600')} aria-hidden="true" />;
    case ActivityActionType.EVENT_DELETED:
      return <CalendarX className={cn(iconClass, 'text-red-600')} aria-hidden="true" />;
    case ActivityActionType.COLLABORATOR_ADDED:
      return <UserPlus className={cn(iconClass, 'text-green-600')} aria-hidden="true" />;
    case ActivityActionType.COLLABORATOR_REMOVED:
      return <UserMinus className={cn(iconClass, 'text-red-600')} aria-hidden="true" />;
    case ActivityActionType.EXPENSE_ADDED:
      return <DollarSign className={cn(iconClass, 'text-emerald-600')} aria-hidden="true" />;
    case ActivityActionType.TRIP_UPDATED:
      return <MapPin className={cn(iconClass, 'text-purple-600')} aria-hidden="true" />;
    default:
      return <MessageSquare className={cn(iconClass, 'text-gray-600')} aria-hidden="true" />;
  }
}

/**
 * Format activity message based on type and data
 */
function formatActivityMessage(activity: ActivityWithUser): string {
  const userName = `${activity.user.firstName} ${activity.user.lastName}`;
  const { actionType, actionData } = activity;
  const data = actionData as any; // Type assertion for JsonValue to object access

  switch (actionType) {
    case ActivityActionType.MESSAGE_POSTED:
      return `${userName} posted a message${data.isReply ? ' (reply)' : ''}`;

    case ActivityActionType.EVENT_CREATED:
      return `${userName} created ${data.eventType?.toLowerCase() || 'event'}: "${data.eventTitle}"`;

    case ActivityActionType.EVENT_UPDATED:
      return `${userName} updated "${data.eventTitle}"`;

    case ActivityActionType.EVENT_DELETED:
      return `${userName} deleted ${data.eventType?.toLowerCase() || 'event'}: "${data.eventTitle}"`;

    case ActivityActionType.COLLABORATOR_ADDED:
      return `${userName} added ${data.collaboratorName} as ${data.role?.toLowerCase()}`;

    case ActivityActionType.COLLABORATOR_REMOVED:
      return `${userName} removed ${data.collaboratorName}`;

    case ActivityActionType.EXPENSE_ADDED:
      return `${userName} added expense: ${data.description} (${data.currency || '$'}${data.amount})`;

    case ActivityActionType.TRIP_UPDATED:
      const changesCount = data.changes?.length || 0;
      return `${userName} updated trip${changesCount > 1 ? ` (${changesCount} changes)` : ''}`;

    default:
      return `${userName} performed an action`;
  }
}

/**
 * Get user initials for avatar fallback
 */
function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function ActivityFeedItem({ activity, className }: ActivityFeedItemProps) {
  const message = formatActivityMessage(activity);
  const timestamp = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        'flex gap-3 p-4 hover:bg-accent/50 transition-colors rounded-lg',
        className
      )}
    >
      {/* Icon Background */}
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {getActivityIcon(activity.actionType)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={activity.user.avatarUrl || undefined} />
          <AvatarFallback className="text-xs">
            {getUserInitials(activity.user.firstName, activity.user.lastName)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
