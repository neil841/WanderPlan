/**
 * PollCard Component
 *
 * Displays a poll with voting options and results
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Lock, Unlock, Trash2, CheckCircle2 } from 'lucide-react';
import type { PollWithResults } from '@/types/poll';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PollCardProps {
  poll: PollWithResults;
  currentUserId: string;
  userRole: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  onVote: (pollId: string, optionIds: string[]) => void;
  onClose: (pollId: string) => void;
  onReopen: (pollId: string) => void;
  onDelete: (pollId: string) => void;
}

export function PollCard({
  poll,
  currentUserId,
  userRole,
  onVote,
  onClose,
  onReopen,
  onDelete,
}: PollCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    poll.userVotedOptionIds
  );

  const isCreator = poll.createdBy === currentUserId;
  const canManage = isCreator;
  const canVote = poll.status === 'OPEN' && !poll.expiresAt || (poll.expiresAt && new Date(poll.expiresAt) > new Date());
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  const handleOptionToggle = (optionId: string) => {
    if (!canVote) return;

    let newSelection: string[];

    if (poll.allowMultipleVotes) {
      // Multiple choice: toggle selection
      newSelection = selectedOptions.includes(optionId)
        ? selectedOptions.filter((id) => id !== optionId)
        : [...selectedOptions, optionId];
    } else {
      // Single choice: replace selection
      newSelection = selectedOptions.includes(optionId) ? [] : [optionId];
    }

    setSelectedOptions(newSelection);
    onVote(poll.id, newSelection);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{poll.question}</h3>
              {poll.status === 'CLOSED' && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Closed
                </Badge>
              )}
              {isExpired && poll.status === 'OPEN' && (
                <Badge variant="destructive">Expired</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                by {poll.creator.firstName} {poll.creator.lastName}
              </span>
              <span>
                {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
              </span>
              <span>{poll.totalVotes} votes</span>
              {poll.allowMultipleVotes && (
                <Badge variant="outline" className="text-xs">
                  Multiple Choice
                </Badge>
              )}
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Poll actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {poll.status === 'OPEN' ? (
                  <DropdownMenuItem onClick={() => onClose(poll.id)}>
                    <Lock className="mr-2 h-4 w-4" />
                    Close Poll
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onReopen(poll.id)}>
                    <Unlock className="mr-2 h-4 w-4" />
                    Reopen Poll
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(poll.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Poll
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {poll.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);

            return (
              <div
                key={option.id}
                className={cn(
                  'relative rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent/50',
                  isSelected && 'border-primary bg-accent',
                  !canVote && 'cursor-not-allowed'
                )}
                onClick={() => handleOptionToggle(option.id)}
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 bg-primary/10 rounded-lg transition-all"
                  style={{ width: `${option.percentage}%` }}
                />

                {/* Content */}
                <div className="relative flex items-center gap-3">
                  {/* Checkbox/Radio */}
                  <div className="flex-shrink-0">
                    {poll.allowMultipleVotes ? (
                      <Checkbox
                        checked={isSelected}
                        disabled={!canVote}
                        aria-label={`Vote for ${option.text}`}
                      />
                    ) : (
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        )}
                        aria-label={`Vote for ${option.text}`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{option.text}</p>
                  </div>

                  {/* Vote count and percentage */}
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {option.userVoted && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-muted-foreground">
                      {option.voteCount}
                    </span>
                    <span className="min-w-[3rem] text-right">
                      {option.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expiration info */}
        {poll.expiresAt && (
          <p className="mt-4 text-sm text-muted-foreground">
            {isExpired
              ? 'Expired'
              : `Expires ${formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
