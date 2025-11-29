/**
 * Email Templates for Notifications
 *
 * These templates format notification data into HTML emails
 */

import type { Notification } from '@/types/notification';

/**
 * Base email template with WanderPlan branding
 */
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WanderPlan Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .notification-card {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .notification-meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    .notification-message {
      font-size: 14px;
      color: #333;
      margin: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 500;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ WanderPlan</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>
        You're receiving this email because you're subscribed to notifications from WanderPlan.
        <br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/notifications">Manage notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Format instant notification email
 */
export function formatInstantNotificationEmail(
  userName: string,
  notification: Notification
): string {
  const activity = notification.activity;
  const actorName = `${activity.user.firstName} ${activity.user.lastName}`;
  const tripName = activity.trip.name;
  const tripUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/trips/${activity.trip.id}`;

  const message = formatNotificationMessage(notification);

  const content = `
    <h2>Hi ${userName}! 👋</h2>
    <p>You have a new notification:</p>

    <div class="notification-card">
      <div class="notification-meta">
        <strong>${actorName}</strong> • ${tripName} • ${formatDate(activity.createdAt)}
      </div>
      <p class="notification-message">${message}</p>
    </div>

    <a href="${tripUrl}" class="button">View Trip</a>

    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Stay organized and never miss an update with WanderPlan.
    </p>
  `;

  return baseTemplate(content);
}

/**
 * Format daily digest email
 */
export function formatDailyDigestEmail(
  userName: string,
  notifications: Notification[]
): string {
  const notificationCards = notifications
    .map((notification) => {
      const activity = notification.activity;
      const actorName = `${activity.user.firstName} ${activity.user.lastName}`;
      const tripName = activity.trip.name;
      const message = formatNotificationMessage(notification);

      return `
      <div class="notification-card">
        <div class="notification-meta">
          <strong>${actorName}</strong> • ${tripName} • ${formatDate(activity.createdAt)}
        </div>
        <p class="notification-message">${message}</p>
      </div>
      `;
    })
    .join('');

  const content = `
    <h2>Hi ${userName}! 👋</h2>
    <p>Here's your daily summary of ${notifications.length} notification${notifications.length === 1 ? '' : 's'}:</p>

    ${notificationCards}

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">View All Trips</a>

    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      You're receiving this daily digest because you've enabled it in your notification settings.
    </p>
  `;

  return baseTemplate(content);
}

/**
 * Format notification message
 */
function formatNotificationMessage(notification: Notification): string {
  const activity = notification.activity;
  const { actionType, actionData } = activity;

  const getData = (key: string): any => {
    if (actionData && typeof actionData === 'object' && !Array.isArray(actionData)) {
      return (actionData as Record<string, any>)[key];
    }
    return undefined;
  };

  switch (actionType) {
    case 'MESSAGE_POSTED':
      return `Posted a message: "${getData('message') || ''}"`;
    case 'EVENT_CREATED':
      return `Created ${getData('eventType')?.toLowerCase() || 'an event'}: ${getData('eventName') || ''}`;
    case 'EVENT_UPDATED':
      return `Updated an event: ${getData('eventName') || ''}`;
    case 'EVENT_DELETED':
      return `Deleted an event: ${getData('eventName') || ''}`;
    case 'COLLABORATOR_ADDED':
      return `Added ${getData('collaboratorName')} as a collaborator`;
    case 'COLLABORATOR_REMOVED':
      return `Removed ${getData('collaboratorName')} from the trip`;
    case 'EXPENSE_ADDED':
      return `Added expense: ${getData('description') || ''} ($${getData('amount') || '0'})`;
    case 'TRIP_UPDATED':
      return `Updated trip details`;
    default:
      return 'Performed an action';
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
