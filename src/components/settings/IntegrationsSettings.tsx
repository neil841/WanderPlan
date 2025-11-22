'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Link2,
  Unlink,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface IntegrationsSettingsProps {
  initialData: {
    googleCalendar: {
      isConnected: boolean;
      connectedAt?: Date;
      email?: string;
    };
  };
}

/**
 * IntegrationsSettings Component
 *
 * Displays and manages external service integrations
 *
 * Features:
 * - Google Calendar integration status
 * - Connect/disconnect buttons
 * - Confirmation dialogs
 * - Loading states
 * - Success/error toast notifications
 * - Responsive design
 * - WCAG 2.1 AA compliant
 *
 * @component
 */
export function IntegrationsSettings({ initialData }: IntegrationsSettingsProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(initialData.googleCalendar.isConnected);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Handle Google Calendar connection
   */
  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Redirect to OAuth authorization URL (without tripId for settings page)
      window.location.href = '/api/integrations/google-calendar/auth';
    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
      setIsConnecting(false);

      toast.error('Connection Failed', {
        description: 'Failed to initiate Google Calendar authorization',
        icon: <XCircle className="w-4 h-4" />,
      });
    }
  };

  /**
   * Handle Google Calendar disconnection
   */
  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    try {
      const response = await fetch('/api/integrations/google-calendar/disconnect', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to disconnect');
      }

      // Update state
      setIsConnected(false);
      setIsDisconnectDialogOpen(false);

      // Show success toast
      toast.success('Disconnected', {
        description: 'Google Calendar has been disconnected successfully',
        icon: <CheckCircle2 className="w-4 h-4" />,
      });

      // Refresh page to update connection status
      router.refresh();
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error);

      toast.error('Disconnection Failed', {
        description: error instanceof Error ? error.message : 'Failed to disconnect Google Calendar',
        icon: <XCircle className="w-4 h-4" />,
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Google Calendar Integration Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Integration Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Google Calendar
                </h3>
                {isConnected ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Sync your trip events to Google Calendar automatically
              </p>

              {/* Connected Account Info */}
              {isConnected && initialData.googleCalendar.email && (
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500 mb-3">
                  <span className="font-medium">Account:</span>
                  <span>{initialData.googleCalendar.email}</span>
                </div>
              )}

              {/* Features List */}
              <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  Export trip events to your calendar
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  Automatic event details and locations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  Color-coded by event type
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            {isConnected ? (
              <Button
                variant="outline"
                onClick={() => setIsDisconnectDialogOpen(true)}
                disabled={isDisconnecting}
                className="text-destructive hover:text-destructive"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Future Integrations Placeholder */}
      <Card className="p-6 border-dashed bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            More Integrations Coming Soon
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            We're working on adding more integrations like Outlook Calendar, Apple Calendar, and more.
          </p>
        </div>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Disconnect Google Calendar
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your Google Calendar integration?
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 py-4"
          >
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Note:</strong> This will remove your calendar authorization. Previously synced events will remain in your Google Calendar but won't be updated.
              </p>
            </div>

            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                <span>You won't be able to sync new trips until you reconnect</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Existing calendar events will not be deleted</span>
              </li>
            </ul>
          </motion.div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDisconnectDialogOpen(false)}
              disabled={isDisconnecting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full sm:w-auto"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
