/**
 * CommentsDialog Component
 *
 * Dialog for viewing and adding comments to an idea
 */

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
}

interface CommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  ideaId: string;
  ideaTitle: string;
  currentUserId?: string;
}

export function CommentsDialog({
  open,
  onOpenChange,
  tripId,
  ideaId,
  ideaTitle,
  currentUserId,
}: CommentsDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, ideaId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/trips/${tripId}/ideas/${ideaId}/comments`
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/trips/${tripId}/ideas/${ideaId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      setComments((prev) => [...prev, data.comment]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/trips/${tripId}/ideas/${ideaId}/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>{ideaTitle}</DialogDescription>
        </DialogHeader>

        {/* Comments List */}
        <ScrollArea className="flex-1 pr-4 max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                      {comment.user.firstName?.charAt(0) ||
                        comment.user.email?.charAt(0) ||
                        '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(
                          new Date(comment.createdAt),
                          'MMM d, yyyy h:mm a'
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>

                  {/* Delete button - only show for comment author */}
                  {currentUserId === comment.userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-gray-400 hover:text-red-600"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Comment Input */}
        <form onSubmit={handleSubmitComment} className="space-y-3 pt-4 border-t">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4" />
              Post Comment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
