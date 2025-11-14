/**
 * MessageInput Component
 *
 * Input field for composing and sending messages
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';
import type { MessageWithUser } from '@/types/message';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string, replyTo?: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  replyingTo?: MessageWithUser | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  className?: string;
}

export function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  replyingTo,
  onCancelReply,
  disabled,
  className,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Focus on reply
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleContentChange = (value: string) => {
    setContent(value);

    // Typing indicator logic
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop?.();
    }, 3000);
  };

  const handleSend = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    onSend(trimmedContent, replyingTo?.id);
    setContent('');
    setIsTyping(false);
    onTypingStop?.();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    if (e.key === 'Escape' && replyingTo) {
      onCancelReply?.();
    }
  };

  return (
    <div className={cn('border-t bg-background', className)}>
      {/* Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="text-muted-foreground">
              Replying to <span className="font-medium">{replyingTo.user.name || replyingTo.user.email}</span>
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-md">
              {replyingTo.content}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancelReply}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-4">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          disabled={disabled}
          className="min-h-[44px] max-h-[200px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !content.trim()}
          size="icon"
          className="shrink-0 h-11 w-11"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Helper Text */}
      <div className="px-4 pb-2 text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
