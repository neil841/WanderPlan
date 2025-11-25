/**
 * Activity Logging Utilities
 *
 * Helper functions to create activity log entries for various actions
 */

import { prisma } from './db';
import { ActivityActionType } from '@prisma/client';
import type {
  TripUpdatedData,
  EventCreatedData,
  EventUpdatedData,
  EventDeletedData,
  CollaboratorAddedData,
  CollaboratorRemovedData,
  ExpenseAddedData,
  MessagePostedData,
} from '@/types/activity';

/**
 * Log a trip update activity
 */
export async function logTripUpdated(
  tripId: string,
  userId: string,
  changes: TripUpdatedData['changes']
) {
  const actionData: TripUpdatedData = { changes };

  return prisma.activity.create({
    data: {
      tripId,
      userId,
      actionType: ActivityActionType.TRIP_UPDATED,
      actionData,
    },
  });
}

/**
 * Log an event creation activity
 */
export async function logEventCreated(
  tripId: string,
  userId: string,
  eventId: string,
  eventTitle: string,
  eventType: string
) {
  const actionData: EventCreatedData = {
    eventId,
    eventTitle,
    eventType,
  };

  return prisma.activity.create({
    data: {
      tripId,
      userId,
      actionType: ActivityActionType.EVENT_CREATED,
      actionData,
    },
  });
}

/**
 * Log an event update activity
 */
export async function logEventUpdated(
  tripId: string,
  userId: string,
  eventId: string,
  eventTitle: string,
  changes: EventUpdatedData['changes']
) {
  const actionData: EventUpdatedData = {
    eventId,
    eventTitle,
    changes,
  };

  return prisma.activity.create({
    data: {
      tripId,
      userId,
      actionType: ActivityActionType.EVENT_UPDATED,
      actionData,
    },
  });
}

/**
 * Log an event deletion activity
 */
export async function logEventDeleted(
  tripId: string,
  userId: string,
  eventTitle: string,
  eventType: string
) {
  const actionData: EventDeletedData = {
    eventTitle,
    eventType,
  };

  return prisma.activity.create({
    data: {
      tripId,
      userId,
      actionType: ActivityActionType.EVENT_DELETED,
      actionData,
    },
  });
}

/**
 * Log a collaborator addition activity
 */
export async function logCollaboratorAdded(
  tripId: string,
  userId: string,
  collaboratorId: string,
  collaboratorName: string,
  role: string
) {
  const actionData: CollaboratorAddedData = {
    collaboratorId,
    collaboratorName,
    role,
  };

  return prisma.activity.create({
    data: {
      tripId,
      userId,
      actionType: ActivityActionType.COLLABORATOR_ADDED,
      actionData,
    },
  });
}

/**
 * Log a collaborator removal activity
 */
export async function logCollaboratorRemoved(
  tripId: string,
  userId: string,
  collaboratorName: string,
  role: string
) {
  const actionData: CollaboratorRemovedData = {
    collaboratorName,
    role,
  };

  return prisma.activity.create({
    data: {
      tripId,
      userId,
      actionType: ActivityActionType.COLLABORATOR_REMOVED,
      actionData,
    },
  });
}

/**
 * Log an expense addition activity
 */
export async function logExpenseAdded(
  tripId: string,
  userId: string,
  expenseId: string,
  description: string,
  amount: number,
  currency: string,
  category: string
) {
  const actionData: ExpenseAddedData = {
    expenseId,
    description,
    amount,
    currency,
    category,
  };

  return prisma.activity.create({
    data: {
      tripId,
      userId,
      actionType: ActivityActionType.EXPENSE_ADDED,
      actionData,
    },
  });
}

/**
 * Log a message posting activity
 */
export async function logMessagePosted(
  tripId: string,
  userId: string,
  messageId: string,
  content: string
) {
  // Create preview (first 100 chars)
  const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;

  const actionData: MessagePostedData = {
    messageId,
    preview,
  };

  return prisma.activity.create({
    data: {
      tripId,
      userId,
      actionType: ActivityActionType.MESSAGE_POSTED,
      actionData,
    },
  });
}

/**
 * Broadcast activity to Socket.io room (for real-time updates)
 */
export function broadcastActivity(io: any, tripId: string, activity: any) {
  io.to(`trip:${tripId}`).emit('activity:new', activity);
}
