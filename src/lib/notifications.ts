/**
 * Notification Utilities
 *
 * Helper functions to create notifications for trip activities
 */

import { prisma } from './db';
import { ActivityActionType } from '@prisma/client';
import { sendEmailNotification } from './notifications/email';

/**
 * Create notifications for an activity
 *
 * Notifications are created for all trip collaborators except the user who performed the action
 */
export async function createNotificationsForActivity(
  activityId: string,
  tripId: string,
  actionUserId: string,
  actionType: ActivityActionType
): Promise<number> {
  try {
    // 1. Get all collaborators for the trip (excluding the action performer)
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        createdBy: true,
        collaborators: {
          where: {
            status: 'ACCEPTED',
          },
          select: {
            userId: true,
          },
        },
      },
    });

    if (!trip) {
      console.error('Trip not found:', tripId);
      return 0;
    }

    // 2. Build list of users to notify
    const userIdsToNotify = new Set<string>();

    // Add trip owner
    if (trip.createdBy !== actionUserId) {
      userIdsToNotify.add(trip.createdBy);
    }

    // Add collaborators
    for (const collab of trip.collaborators) {
      if (collab.userId !== actionUserId) {
        userIdsToNotify.add(collab.userId);
      }
    }

    // 3. Filter based on action type preferences
    // Some activities should only notify specific users
    const filteredUserIds = filterNotificationsByPreference(
      Array.from(userIdsToNotify),
      actionType
    );

    // 4. Create notifications for each user
    const notifications = filteredUserIds.map((userId) => ({
      activityId,
      userId,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true, // Avoid duplicate notifications
      });

      // 5. Send email notifications (async, don't block)
      // Fetch the created notifications with full activity data
      const createdNotifications = await prisma.notification.findMany({
        where: {
          activityId,
          userId: { in: filteredUserIds },
        },
        include: {
          activity: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
              trip: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Send email notifications asynchronously (don't await to avoid blocking)
      for (const notification of createdNotifications) {
        sendEmailNotification(notification.userId, notification as any).catch((error) => {
          console.error('Failed to send email notification:', error);
        });
      }
    }

    return notifications.length;
  } catch (error) {
    console.error('Error creating notifications:', error);
    // Don't throw - notifications are not critical
    return 0;
  }
}

/**
 * Filter users based on notification preferences
 *
 * In the future, this could check user notification settings.
 * For now, we apply basic filtering logic.
 */
function filterNotificationsByPreference(
  userIds: string[],
  actionType: ActivityActionType
): string[] {
  // For now, all users get all notification types
  // In the future, check user preferences here

  // Example: Don't notify for MESSAGE_POSTED if user disabled message notifications
  // const preferences = await getUserNotificationPreferences(userId);
  // if (!preferences.messages && actionType === ActivityActionType.MESSAGE_POSTED) {
  //   return [];
  // }

  return userIds;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Delete old read notifications (cleanup utility)
 *
 * Delete notifications that were read more than 30 days ago
 */
export async function cleanupOldNotifications(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return prisma.notification.deleteMany({
    where: {
      isRead: true,
      readAt: {
        lt: cutoffDate,
      },
    },
  });
}
