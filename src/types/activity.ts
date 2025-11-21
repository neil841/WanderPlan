/**
 * Activity Type Definitions
 */

import type { ActivityActionType, Prisma } from '@prisma/client';
import type { User } from './user';

// Base Activity type from database
export interface Activity {
  id: string;
  tripId: string;
  userId: string;
  actionType: ActivityActionType;
  actionData: Prisma.JsonValue;
  createdAt: Date;
}

// Activity with user information
export interface ActivityWithUser extends Activity {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

// Action data types for different activity types
export interface TripUpdatedData {
  changes: {
    field: string;
    oldValue: string | null;
    newValue: string | null;
  }[];
  [key: string]: any;
}

export interface EventCreatedData {
  eventId: string;
  eventTitle: string;
  eventType: string;
  [key: string]: any;
}

export interface EventUpdatedData {
  eventId: string;
  eventTitle: string;
  changes: {
    field: string;
    oldValue: string | null;
    newValue: string | null;
  }[];
  [key: string]: any;
}

export interface EventDeletedData {
  eventTitle: string;
  eventType: string;
  [key: string]: any;
}

export interface CollaboratorAddedData {
  collaboratorId: string;
  collaboratorName: string;
  role: string;
  [key: string]: any;
}

export interface CollaboratorRemovedData {
  collaboratorName: string;
  role: string;
  [key: string]: any;
}

export interface ExpenseAddedData {
  expenseId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  [key: string]: any;
}

export interface MessagePostedData {
  messageId: string;
  preview: string; // First 100 chars of message
  [key: string]: any;
}

// API Request/Response types
export interface GetActivitiesRequest {
  page?: number;
  limit?: number;
  actionType?: ActivityActionType;
}

export interface GetActivitiesResponse {
  activities: ActivityWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
