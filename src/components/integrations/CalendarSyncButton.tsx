'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarSyncButtonProps {
  tripId: string;
  tripName: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

/**
 * CalendarSyncButton Component
 *
 * Provides a button to sync trip events to Google Calendar
 * with OAuth flow and sync confirmation dialog
 *
 * Features:
 * - Google Calendar OAuth 2.0 authentication
 * - Sync confirmation dialog
 * - Loading states during sync
 * - Success/error toast notifications
 * - Responsive design (mobile-friendly)
 * - WCAG 2.1 AA compliant
 *
 * @component
 */
export function CalendarSyncButton({
  tripId,
  tripName,
  variant = 'default',
  size = 'default',
  className = '',
}: CalendarSyncButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /**
   * Check if user has already authorized Google Calendar
   */
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/integrations/google-calendar/status');
      const data = await response.json();
      return data.isAuthenticated || false;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return false;
    }
  };

  /**
   * Initiate Google Calendar OAuth flow
   */
  const handleOAuthFlow = async () => {
    setIsAuthenticating(true);

    try {
      // Redirect to OAuth authorization URL
      const authUrl = `/api/integrations/google-calendar/auth?tripId=${tripId}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
      setIsAuthenticating(false);

      toast.error('Authorization Failed', {
        description: 'Failed to initiate Google Calendar authorization',
        icon: <XCircle className="w-4 h-4" />,
      });
    }
  };

  /**
   * Sync trip events to Google Calendar
   */
  const handleSync = async () => {
    setIsSyncing(true);

    try {
      // Check if user is authenticated
      const isAuthenticated = await checkAuthStatus();

      if (!isAuthenticated) {
        // User needs to authorize first
        setIsSyncing(false);
        await handleOAuthFlow();
        return;
      }

      // Sync trip events
      const response = await fetch('/api/integrations/google-calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tripId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's an authentication error
        if (response.status === 401) {
          // Token expired, redirect to OAuth
          await handleOAuthFlow();
          return;
        }

        throw new Error(data.error?.message || 'Failed to sync events');
      }

      // Show success toast
      toast.success('Calendar Synced', {
        description: `${data.data.eventsSynced} events synced to Google Calendar`,
        icon: <CheckCircle2 className="w-4 h-4" />,
      });

      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to sync calendar:', error);

      toast.error('Sync Failed', {
        description: error instanceof Error ? error.message : 'Failed to sync events to Google Calendar',
        icon: <XCircle className="w-4 h-4" />,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsDialogOpen(true)}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Sync to Calendar
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Sync to Google Calendar
            </DialogTitle>
            <DialogDescription>
              Export all events from "{tripName}" to your Google Calendar
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 py-4"
          >
            {/* Sync Info */}
            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <p>This will create calendar events for:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All flights with departure and arrival times</li>
                <li>Hotel check-ins and check-outs</li>
                <li>Activities and restaurant reservations</li>
                <li>Transportation schedules</li>
              </ul>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Events will include location details, notes, and confirmation numbers when available.
                </p>
              </div>
            </div>

            {/* Authorization Note */}
            <div className="flex items-start gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <ExternalLink className="w-4 h-4 mt-0.5 text-neutral-500 flex-shrink-0" />
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                You'll be redirected to Google to authorize calendar access if this is your first time syncing.
              </p>
            </div>
          </motion.div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSyncing || isAuthenticating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSync}
              disabled={isSyncing || isAuthenticating}
              className="w-full sm:w-auto"
            >
              {isSyncing || isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isAuthenticating ? 'Authorizing...' : 'Syncing...'}
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Sync Events
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
