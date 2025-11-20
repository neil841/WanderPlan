/**
 * MessageBubble Component
 *
 * Displays a single message with sender info, timestamp, and actions
 */

'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Pencil, Trash2, Reply, Check, X } from 'lucide-react';
import type { MessageWithUser } from '@/types/message';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: MessageWithUser;
  isCurrentUser: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: MessageWithUser) => void;
  className?: string;
}

export function MessageBubble({
  message,
  isCurrentUser,
  onEdit,
  onDelete,
  onReply,
  className,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit?.(message.id, editedContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const userName = `${message.user.firstName} ${message.user.lastName}`;
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : message.user.email.slice(0, 2).toUpperCase();

  const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        'flex gap-3 group',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={message.user.avatarUrl || undefined} alt={userName || message.user.email} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col gap-1 max-w-[70%]',
          isCurrentUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender Name & Timestamp */}
        <div
          className={cn(
            'flex items-center gap-2 text-xs text-muted-foreground',
            isCurrentUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span className="font-medium">{userName || message.user.email}</span>
          <span>{formattedTime}</span>
          {message.isEdited && <span className="italic">(edited)</span>}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-2 break-words',
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {isEditing ? (
            <div className="space-y-2 min-w-[200px]">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[80px] resize-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editedContent.trim() || editedContent === message.content}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          )}
        </div>

        {/* Actions (shown on hover) */}
        {!isEditing && (
          <div
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1',
              isCurrentUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {onReply && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={() => onReply(message)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {isCurrentUser && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    aria-label="Message options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isCurrentUser ? 'end' : 'start'}>
                  {onEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
