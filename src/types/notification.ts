/**
 * Notification Type Definitions
 *
 * Notifications are user-specific activity alerts
 */

import type { ActivityActionType, Prisma } from '@prisma/client';

// Notification is based on Activity but includes read status
export interface Notification {
  id: string;
  activityId: string;
  userId: string; // User receiving the notification
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
  activity: {
    id: string;
    tripId: string;
    actionType: ActivityActionType;
    actionData: Prisma.JsonValue;
    createdAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
    trip: {
      id: string;
      name: string;
    };
  };
}

// API Request/Response types
export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MarkNotificationReadRequest {
  isRead: boolean;
}

export interface MarkNotificationReadResponse {
  success: boolean;
  notification: Notification;
}

export interface MarkAllReadResponse {
  success: boolean;
  count: number;
}
