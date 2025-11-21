/**
 * Email Template: Notification Digest
 *
 * Daily digest email summarizing all notifications
 */

import type { Notification } from '@/types/notification';

interface NotificationDigestEmailProps {
  userName: string;
  notifications: Notification[];
  unsubscribeUrl: string;
}

export function NotificationDigestEmail({
  userName,
  notifications,
  unsubscribeUrl,
}: NotificationDigestEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Your WanderPlan Notifications</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#6366f1', marginBottom: '10px' }}>WanderPlan</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>Your Daily Notification Digest</p>
          </div>

          {/* Greeting */}
          <p>Hi {userName},</p>
          <p>Here's what happened in your trips today:</p>

          {/* Notifications List */}
          <div style={{ marginTop: '20px', marginBottom: '30px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '15px',
                  marginBottom: '15px',
                  backgroundColor: '#f9fafb',
                  borderLeft: '4px solid #6366f1',
                  borderRadius: '4px',
                }}
              >
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                  {notification.activity.trip.name}
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>
                  {formatNotificationMessage(notification)}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/notifications`}
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
              }}
            >
              View All Notifications
            </a>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px',
              marginTop: '30px',
              fontSize: '12px',
              color: '#999',
            }}
          >
            <p>
              You're receiving this email because you have email notifications enabled for
              WanderPlan.
            </p>
            <p>
              <a href={unsubscribeUrl} style={{ color: '#6366f1', textDecoration: 'none' }}>
                Unsubscribe
              </a>{' '}
              or{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`}
                style={{ color: '#6366f1', textDecoration: 'none' }}
              >
                manage your notification preferences
              </a>
            </p>
            <p>© {new Date().getFullYear()} WanderPlan. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  );
}

/**
 * Format notification message for email
 */
function formatNotificationMessage(notification: Notification): string {
  const activity = notification.activity;
  const userName = `${activity.user.firstName} ${activity.user.lastName}`;
  const { actionType, actionData } = activity;

  switch (actionType) {
    case 'MESSAGE_POSTED':
      return `${userName} posted a message`;
    case 'EVENT_CREATED':
      return `${userName} created ${actionData.eventType?.toLowerCase() || 'an event'}`;
    case 'EVENT_UPDATED':
      return `${userName} updated an event`;
    case 'EVENT_DELETED':
      return `${userName} deleted an event`;
    case 'COLLABORATOR_ADDED':
      return `${userName} added ${actionData.collaboratorName}`;
    case 'COLLABORATOR_REMOVED':
      return `${userName} removed ${actionData.collaboratorName}`;
    case 'EXPENSE_ADDED':
      return `${userName} added an expense`;
    case 'TRIP_UPDATED':
      return `${userName} updated the trip`;
    default:
      return `${userName} performed an action`;
  }
}
