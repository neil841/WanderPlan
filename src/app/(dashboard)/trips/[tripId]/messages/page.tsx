/**
 * Trip Messages Page
 *
 * Real-time messaging interface for trip collaborators
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { MessageList } from '@/components/messages/MessageList';
import { MessageInput } from '@/components/messages/MessageInput';
import {
  useMessages,
  useSendMessage,
  useUpdateMessage,
  useDeleteMessage,
} from '@/hooks/useMessages';
import {
  useTripRoom,
  useTypingIndicator,
  useRealtimeMessages,
} from '@/hooks/useRealtime';
import type { MessageWithUser } from '@/types/message';
import { Loader2 } from 'lucide-react';
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

export default function MessagesPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: session } = useSession();
  const [replyingTo, setReplyingTo] = useState<MessageWithUser | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

  // Fetch messages with infinite scroll
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(tripId);

  // Message mutations
  const sendMessageMutation = useSendMessage(tripId);
  const updateMessageMutation = useUpdateMessage(tripId);
  const deleteMessageMutation = useDeleteMessage(tripId);

  // Real-time hooks
  const { inRoom } = useTripRoom(tripId);
  const { startTyping, stopTyping, typingUsers } = useTypingIndicator(tripId);
  const { messages: realtimeMessages } = useRealtimeMessages(tripId);

  // Combine paginated messages from all pages
  const messages = useMemo(() => {
    return data?.pages.flatMap((page) => page.messages) || [];
  }, [data]);

  // Get typing user names
  const typingUserNames = useMemo(() => {
    return typingUsers
      .filter((userId) => userId !== session?.user?.id)
      .map((userId) => {
        const user = messages.find((m) => m.userId === userId)?.user;
        return user?.name || user?.email || 'Someone';
      });
  }, [typingUsers, session?.user?.id, messages]);

  // Handle send message
  const handleSendMessage = (content: string, replyTo?: string) => {
    sendMessageMutation.mutate(
      { content, replyTo },
      {
        onSuccess: () => {
          setReplyingTo(null);
        },
      }
    );
  };

  // Handle edit message
  const handleEditMessage = (messageId: string, content: string) => {
    updateMessageMutation.mutate({ messageId, content });
  };

  // Handle delete message
  const handleDeleteMessage = (messageId: string) => {
    setDeleteMessageId(messageId);
  };

  const confirmDeleteMessage = () => {
    if (deleteMessageId) {
      deleteMessageMutation.mutate(deleteMessageId, {
        onSuccess: () => {
          setDeleteMessageId(null);
        },
      });
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
              {inRoom ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={session.user.id}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onLoadMore={() => fetchNextPage()}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          onReply={setReplyingTo}
          typingUserNames={typingUserNames}
        />
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        disabled={sendMessageMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
