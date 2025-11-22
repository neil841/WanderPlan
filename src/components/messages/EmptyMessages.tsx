/**
 * EmptyMessages Component
 *
 * Displays an empty state when a trip has no messages.
 * Encourages users to start a conversation with collaborators.
 *
 * @component
 * @example
 * <EmptyMessages />
 */

'use client';

import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export function EmptyMessages() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No messages yet"
      description="Start a conversation with your trip collaborators. Share ideas, ask questions, and coordinate your plans."
    />
  );
}

/**
 * EmptyMessageThread Component
 *
 * Displays when a specific message thread is empty.
 */
export function EmptyMessageThread() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No replies yet"
      description="Be the first to reply to this message thread."
    />
  );
}
