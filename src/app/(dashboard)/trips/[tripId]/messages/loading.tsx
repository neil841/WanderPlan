/**
 * Loading state for messages page
 * Shows skeleton loaders for message bubbles
 */

import { MessageBubbleSkeleton } from '@/components/messages/MessageBubble';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="p-4 border-b space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageBubbleSkeleton isCurrentUser={false} />
        <MessageBubbleSkeleton isCurrentUser={true} />
        <MessageBubbleSkeleton isCurrentUser={false} />
        <MessageBubbleSkeleton isCurrentUser={false} />
        <MessageBubbleSkeleton isCurrentUser={true} />
        <MessageBubbleSkeleton isCurrentUser={false} />
        <MessageBubbleSkeleton isCurrentUser={true} />
      </div>

      {/* Message Input Skeleton */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Skeleton className="h-20 flex-1 rounded-md" />
          <Skeleton className="h-20 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
