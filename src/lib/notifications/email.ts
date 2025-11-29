/**
 * Email Notification Utilities
 *
 * Functions for sending email notifications based on user preferences
 */

import { prisma } from '../db';
import type { Notification } from '@/types/notification';
import type { EmailNotificationFrequency, UserNotificationSettings } from '@/types/email-settings';
import { ActivityActionType } from '@prisma/client';

/**
 * Send email notification based on user preferences
 *
 * @param userId - User to send notification to
 * @param notification - Notification to send
 */
export async function sendEmailNotification(
  userId: string,
  notification: Notification
): Promise<boolean> {
  try {
    // 1. Get user settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        settings: true,
      },
    });

    if (!user) {
      console.error('User not found:', userId);
      return false;
    }

    const settings = user.settings as unknown as UserNotificationSettings;
    const emailPrefs = settings.email;

    // 2. Check if email notifications are enabled
    if (emailPrefs.frequency === 'off') {
      return false; // User has disabled email notifications
    }

    // 3. Check if this notification type should be sent
    if (!shouldSendNotification(notification.activity.actionType, emailPrefs)) {
      return false;
    }

    // 4. For instant notifications, send immediately
    if (emailPrefs.frequency === 'instant') {
      return await sendInstantNotification(user, notification);
    }

    // 5. For daily digest, notifications will be batched and sent by cron job
    // Mark notification as pending email
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        // We could add a field like `emailSent: false` to track this
        // For now, daily digest will query unread notifications
      },
    });

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Check if notification should be sent based on user preferences
 */
function shouldSendNotification(
  actionType: ActivityActionType,
  preferences: UserNotificationSettings['email']
): boolean {
  switch (actionType) {
    case ActivityActionType.MESSAGE_POSTED:
      return preferences.messages;
    case ActivityActionType.EVENT_CREATED:
    case ActivityActionType.EVENT_UPDATED:
    case ActivityActionType.EVENT_DELETED:
      return preferences.tripUpdates;
    case ActivityActionType.COLLABORATOR_ADDED:
    case ActivityActionType.COLLABORATOR_REMOVED:
      return preferences.collaboratorChanges;
    case ActivityActionType.EXPENSE_ADDED:
      return preferences.tripUpdates;
    case ActivityActionType.TRIP_UPDATED:
      return preferences.tripUpdates;
    default:
      return false;
  }
}

/**
 * Send instant email notification
 */
async function sendInstantNotification(
  user: { email: string; firstName: string },
  notification: Notification
): Promise<boolean> {
  try {
    const { sendEmail } = await import('../email/resend-client');
    const { formatInstantNotificationEmail } = await import('../email/templates/notification-email');

    const html = formatInstantNotificationEmail(user.firstName, notification);

    return await sendEmail({
      to: user.email,
      subject: `New activity in ${notification.activity.trip.name}`,
      html,
    });
  } catch (error) {
    console.error('Error sending instant notification:', error);
    return false;
  }
}

/**
 * Format notification message for email
 */
function formatNotificationForEmail(notification: Notification): string {
  const activity = notification.activity;
  const userName = `${activity.user.firstName} ${activity.user.lastName}`;
  const tripName = activity.trip.name;
  const { actionType, actionData } = activity;

  // Type-safe helper to access JsonValue properties
  const getData = (key: string): any => {
    if (actionData && typeof actionData === 'object' && !Array.isArray(actionData)) {
      return (actionData as Record<string, any>)[key];
    }
    return undefined;
  };

  switch (actionType) {
    case ActivityActionType.MESSAGE_POSTED:
      return `${userName} posted a message in ${tripName}`;
    case ActivityActionType.EVENT_CREATED:
      return `${userName} created ${getData('eventType')?.toLowerCase() || 'an event'} in ${tripName}`;
    case ActivityActionType.EVENT_UPDATED:
      return `${userName} updated an event in ${tripName}`;
    case ActivityActionType.EVENT_DELETED:
      return `${userName} deleted an event in ${tripName}`;
    case ActivityActionType.COLLABORATOR_ADDED:
      return `${userName} added ${getData('collaboratorName')} to ${tripName}`;
    case ActivityActionType.COLLABORATOR_REMOVED:
      return `${userName} removed ${getData('collaboratorName')} from ${tripName}`;
    case ActivityActionType.EXPENSE_ADDED:
      return `${userName} added an expense in ${tripName}`;
    case ActivityActionType.TRIP_UPDATED:
      return `${userName} updated ${tripName}`;
    default:
      return `${userName} performed an action in ${tripName}`;
  }
}

/**
 * Send daily digest email to users
 *
 * This function would be called by a cron job (e.g., every day at 9 AM)
 * to send a digest of all unread notifications
 */
export async function sendDailyDigests(): Promise<void> {
  try {
    // 1. Find all users with daily digest enabled
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        settings: true,
      },
    });

    for (const user of users) {
      const settings = user.settings as unknown as UserNotificationSettings;

      // Skip if not daily digest
      if (settings.email.frequency !== 'daily') {
        continue;
      }

      // 2. Get unread notifications from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const notifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
          isRead: false,
          createdAt: {
            gte: yesterday,
          },
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      // 3. Skip if no notifications
      if (notifications.length === 0) {
        continue;
      }

      // 4. Send digest email
      await sendDigestEmail(user, notifications);

      console.log(`📧 Sent daily digest to ${user.email} (${notifications.length} notifications)`);
    }
  } catch (error) {
    console.error('Error sending daily digests:', error);
  }
}

/**
 * Send digest email
 */
async function sendDigestEmail(
  user: { email: string; firstName: string; lastName: string },
  notifications: Notification[]
): Promise<void> {
  try {
    const { sendEmail } = await import('../email/resend-client');
    const { formatDailyDigestEmail } = await import('../email/templates/notification-email');

    const html = formatDailyDigestEmail(user.firstName, notifications);

    await sendEmail({
      to: user.email,
      subject: `Your WanderPlan Daily Digest - ${notifications.length} new notification${notifications.length === 1 ? '' : 's'}`,
      html,
    });

    console.log(`✅ Sent daily digest to ${user.email} (${notifications.length} notifications)`);
  } catch (error) {
    console.error('Error sending digest email:', error);
  }
}
