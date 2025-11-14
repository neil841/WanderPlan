/**
 * Notification Settings Page
 *
 * Allows users to manage their email and push notification preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Mail, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type {
  UserNotificationSettings,
  EmailNotificationFrequency,
} from '@/types/email-settings';

export default function NotificationSettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserNotificationSettings | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/notification-settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch('/api/user/notification-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: settings.email,
          push: settings.push,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Settings saved',
          description: 'Your notification preferences have been updated',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEmailPreference = (key: keyof UserNotificationSettings['email'], value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container max-w-4xl py-8">
        <p className="text-center text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground">
              Manage how you receive notifications
            </p>
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Choose what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Email Frequency</Label>
            <Select
              value={settings.email.frequency}
              onValueChange={(value: EmailNotificationFrequency) =>
                updateEmailPreference('frequency', value)
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant (as they happen)</SelectItem>
                <SelectItem value="daily">Daily Digest (once per day)</SelectItem>
                <SelectItem value="off">Off (no emails)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {settings.email.frequency === 'instant' &&
                'Receive an email immediately when notifications occur'}
              {settings.email.frequency === 'daily' &&
                'Receive a summary of notifications once per day'}
              {settings.email.frequency === 'off' &&
                'You will not receive any email notifications'}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t pt-6">
            <p className="text-sm font-medium mb-4">Notification Types</p>
            <div className="space-y-4">
              {/* Trip Invites */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tripInvites">Trip Invitations</Label>
                  <p className="text-sm text-muted-foreground">
                    When someone invites you to collaborate on a trip
                  </p>
                </div>
                <Switch
                  id="tripInvites"
                  checked={settings.email.tripInvites}
                  onCheckedChange={(checked) =>
                    updateEmailPreference('tripInvites', checked)
                  }
                  disabled={settings.email.frequency === 'off'}
                />
              </div>

              {/* Trip Updates */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tripUpdates">Trip Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    When events, expenses, or trip details are updated
                  </p>
                </div>
                <Switch
                  id="tripUpdates"
                  checked={settings.email.tripUpdates}
                  onCheckedChange={(checked) =>
                    updateEmailPreference('tripUpdates', checked)
                  }
                  disabled={settings.email.frequency === 'off'}
                />
              </div>

              {/* Messages */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="messages">Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    When someone posts a message in your trips
                  </p>
                </div>
                <Switch
                  id="messages"
                  checked={settings.email.messages}
                  onCheckedChange={(checked) =>
                    updateEmailPreference('messages', checked)
                  }
                  disabled={settings.email.frequency === 'off'}
                />
              </div>

              {/* Ideas */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ideas">Ideas & Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    When ideas are created or voted on
                  </p>
                </div>
                <Switch
                  id="ideas"
                  checked={settings.email.ideas}
                  onCheckedChange={(checked) => updateEmailPreference('ideas', checked)}
                  disabled={settings.email.frequency === 'off'}
                />
              </div>

              {/* Polls */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="polls">Polls</Label>
                  <p className="text-sm text-muted-foreground">
                    When new polls are created in your trips
                  </p>
                </div>
                <Switch
                  id="polls"
                  checked={settings.email.polls}
                  onCheckedChange={(checked) => updateEmailPreference('polls', checked)}
                  disabled={settings.email.frequency === 'off'}
                />
              </div>

              {/* Collaborator Changes */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="collaboratorChanges">Collaborator Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    When collaborators are added or removed
                  </p>
                </div>
                <Switch
                  id="collaboratorChanges"
                  checked={settings.email.collaboratorChanges}
                  onCheckedChange={(checked) =>
                    updateEmailPreference('collaboratorChanges', checked)
                  }
                  disabled={settings.email.frequency === 'off'}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Browser push notifications (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushEnabled">Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              id="pushEnabled"
              checked={settings.push.enabled}
              disabled
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  push: { enabled: checked },
                })
              }
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Push notifications are not yet available. We'll notify you when this feature is ready!
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
