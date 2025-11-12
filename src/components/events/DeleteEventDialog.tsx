'use client';

/**
 * DeleteEventDialog Component
 *
 * Confirmation dialog for deleting events with destructive action styling.
 * Features optimistic updates and clear user feedback.
 *
 * @component
 * @example
 * <DeleteEventDialog
 *   tripId={tripId}
 *   event={event}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 */

import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useDeleteEvent } from '@/hooks/useDeleteEvent';
import { EventResponse } from '@/types/event';

interface DeleteEventDialogProps {
  tripId: string;
  event: EventResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Delete confirmation dialog for events
 *
 * Features:
 * - Destructive action styling (red button)
 * - Clear confirmation message with event title
 * - Cancel button (default focus for safety)
 * - Loading state during deletion
 * - Keyboard support (Escape to cancel, Enter to confirm)
 * - Optimistic updates via useDeleteEvent hook
 * - Automatic toast notifications
 * - WCAG 2.1 AA compliant
 *
 * @param tripId - ID of the trip containing the event
 * @param event - Event object to delete
 * @param open - Dialog open state
 * @param onOpenChange - Callback to change dialog state
 */
export function DeleteEventDialog({
  tripId,
  event,
  open,
  onOpenChange,
}: DeleteEventDialogProps) {
  const { mutate: deleteEvent, isPending } = useDeleteEvent();

  const handleDelete = () => {
    deleteEvent(
      {
        tripId,
        eventId: event.id,
        eventTitle: event.title,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-semibold">
                  Delete Event?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="mt-4 text-base">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                &ldquo;{event.title}&rdquo;
              </span>
              ?
              <br />
              <span className="mt-2 inline-block text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className="transition-all duration-200"
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={isPending}
                className="transition-all duration-200"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Deleting...' : 'Delete Event'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
