/**
 * IdeaCard Component
 *
 * Displays a single idea with voting, status, and actions
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { IdeaWithVotes } from '@/types/idea';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface IdeaCardProps {
  idea: IdeaWithVotes;
  currentUserId: string;
  userRole: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  onVote: (ideaId: string, vote: number) => void;
  onEdit?: (idea: IdeaWithVotes) => void;
  onDelete?: (ideaId: string) => void;
  onAccept?: (ideaId: string) => void;
  onReject?: (ideaId: string) => void;
  className?: string;
}

export function IdeaCard({
  idea,
  currentUserId,
  userRole,
  onVote,
  onEdit,
  onDelete,
  onAccept,
  onReject,
  className,
}: IdeaCardProps) {
  const isAuthor = idea.createdBy === currentUserId;
  const canEditContent = isAuthor || userRole === 'OWNER' || userRole === 'ADMIN';
  const canChangeStatus = userRole === 'OWNER' || userRole === 'ADMIN';
  const canDelete = isAuthor || userRole === 'OWNER' || userRole === 'ADMIN';

  const creatorName = `${idea.creator.firstName} ${idea.creator.lastName}`;
  const initials = creatorName
    ? creatorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : idea.creator.email.slice(0, 2).toUpperCase();

  const formattedTime = formatDistanceToNow(new Date(idea.createdAt), {
    addSuffix: true,
  });

  const handleUpvote = () => {
    const newVote = idea.currentUserVote === 1 ? 0 : 1;
    onVote(idea.id, newVote);
  };

  const handleDownvote = () => {
    const newVote = idea.currentUserVote === -1 ? 0 : -1;
    onVote(idea.id, newVote);
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* Avatar and Info */}
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={idea.creator.avatarUrl || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-lg leading-tight">{idea.title}</h3>
              <p className="text-sm text-muted-foreground">
                by {creatorName || idea.creator.email} · {formattedTime}
              </p>
            </div>
          </div>

          {/* Status Badge and Actions */}
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            {idea.status === 'ACCEPTED' && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Accepted
              </Badge>
            )}
            {idea.status === 'REJECTED' && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Rejected
              </Badge>
            )}
            {idea.status === 'OPEN' && (
              <Badge variant="outline">Pending</Badge>
            )}

            {/* Actions Menu */}
            {(canEditContent || canChangeStatus || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label="Idea options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditContent && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(idea)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}

                  {canChangeStatus && idea.status !== 'ACCEPTED' && onAccept && (
                    <DropdownMenuItem onClick={() => onAccept(idea.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </DropdownMenuItem>
                  )}

                  {canChangeStatus && idea.status !== 'REJECTED' && onReject && (
                    <DropdownMenuItem onClick={() => onReject(idea.id)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                  )}

                  {(canEditContent || canChangeStatus) && canDelete && <DropdownMenuSeparator />}

                  {canDelete && onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(idea.id)}
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
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {idea.description}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center gap-2">
          {/* Upvote Button */}
          <Button
            size="sm"
            variant={idea.currentUserVote === 1 ? 'default' : 'outline'}
            onClick={handleUpvote}
            className="gap-1"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="font-medium">{idea.upvoteCount}</span>
          </Button>

          {/* Downvote Button */}
          <Button
            size="sm"
            variant={idea.currentUserVote === -1 ? 'destructive' : 'outline'}
            onClick={handleDownvote}
            className="gap-1"
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="font-medium">{idea.downvoteCount}</span>
          </Button>

          {/* Net Vote Count */}
          <div className="ml-2 text-sm text-muted-foreground">
            {idea.voteCount > 0 && '+'}
            {idea.voteCount} net votes
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
