/**
 * Email Notification Settings Types
 */

export type EmailNotificationFrequency = 'instant' | 'daily' | 'off';

export interface EmailNotificationPreferences {
  tripInvites: boolean;
  tripUpdates: boolean;
  messages: boolean;
  ideas: boolean;
  polls: boolean;
  collaboratorChanges: boolean;
  frequency: EmailNotificationFrequency;
}

export interface UserNotificationSettings {
  email: EmailNotificationPreferences;
  push: {
    enabled: boolean;
  };
}

export interface UpdateNotificationSettingsRequest {
  email?: Partial<EmailNotificationPreferences>;
  push?: {
    enabled: boolean;
  };
}

export interface NotificationSettingsResponse {
  success: boolean;
  settings: UserNotificationSettings;
}
