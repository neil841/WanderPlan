/**
 * Notification Settings Page
 *
 * Allows users to manage their email and push notification preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Bell, Mail, Loader2, Check, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type {
  UserNotificationSettings,
  EmailNotificationFrequency,
} from '@/types/email-settings';

export default function NotificationSettingsPage() {
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

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Notification{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Settings
                </span>
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Manage how you receive notifications
              </p>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mb-6 rounded-2xl shadow-lg shadow-gray-900/5 border-gray-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">Email Notifications</CardTitle>
                  <CardDescription className="text-gray-600">
                    Choose what email notifications you want to receive
                  </CardDescription>
                </div>
              </div>
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
      </motion.div>

        {/* Push Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="mb-6 rounded-2xl shadow-lg shadow-gray-900/5 border-gray-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">Push Notifications</CardTitle>
                  <CardDescription className="text-gray-600">
                    Browser push notifications (coming soon)
                  </CardDescription>
                </div>
              </div>
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
      </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex justify-end"
        >
          <motion.button
            onClick={saveSettings}
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.01 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </span>
            {/* Shine effect */}
            {!saving && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
