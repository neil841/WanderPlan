'use client';

/**
 * EditEventDialog Component
 *
 * Simple wrapper around CreateEventDialog that loads event data and passes it in edit mode.
 * Features loading state while fetching event data.
 *
 * @component
 * @example
 * <EditEventDialog
 *   tripId={tripId}
 *   eventId={eventId}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 */

import { useQuery } from '@tanstack/react-query';
import { CreateEventDialog } from './CreateEventDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface EditEventDialogProps {
  tripId: string;
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Edit event dialog wrapper
 *
 * Features:
 * - Fetches event data when opened
 * - Loading state while fetching
 * - Reuses CreateEventDialog in edit mode
 * - Automatic data transformation
 * - Error handling for missing events
 *
 * @param tripId - ID of the trip
 * @param eventId - ID of the event to edit
 * @param open - Dialog open state
 * @param onOpenChange - Callback to change dialog state
 */
export function EditEventDialog({
  tripId,
  eventId,
  open,
  onOpenChange,
}: EditEventDialogProps) {
  // Fetch event data when dialog opens
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', tripId, eventId],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      return response.json();
    },
    enabled: open, // Only fetch when dialog is open
    staleTime: 0, // Always fetch fresh data
  });

  // Show loading state
  if (isLoading && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Event...</DialogTitle>
            <DialogDescription>
              Fetching event details, please wait.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state
  if (isError && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Error Loading Event</DialogTitle>
            <DialogDescription>
              Failed to load event details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-red-600">
              Unable to load event. It may have been deleted or you don't have permission to view it.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show CreateEventDialog in edit mode with event data
  if (event) {
    return (
      <CreateEventDialog
        tripId={tripId}
        open={open}
        onOpenChange={onOpenChange}
        mode="edit"
        eventData={event}
      />
    );
  }

  return null;
}
