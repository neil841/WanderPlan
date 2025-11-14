/**
 * MessageList Component
 *
 * Displays a list of messages with infinite scroll
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import type { MessageWithUser } from '@/types/message';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: MessageWithUser[];
  currentUserId: string;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: MessageWithUser) => void;
  typingUserNames?: string[];
  className?: string;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onEdit,
  onDelete,
  onReply,
  typingUserNames = [],
  className,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Load more when scrolling to top
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onLoadMore?.();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-8">
        <p className="text-lg font-medium text-muted-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground">
          Start the conversation by sending a message below
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full overflow-y-auto', className)}>
      {/* Load More Button (top) */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center p-4">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
            >
              Load More
            </Button>
          )}
        </div>
      )}

      {/* Messages (reversed for bottom-up) */}
      <div
        className="flex flex-col gap-4 p-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages
          .slice()
          .reverse()
          .map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.userId === currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
      </div>

      {/* Typing Indicator */}
      {typingUserNames.length > 0 && (
        <div aria-live="polite" aria-atomic="true">
          <TypingIndicator userNames={typingUserNames} />
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
