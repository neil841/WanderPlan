/**
 * Settlement Card Component
 *
 * Displays individual settlement between two users.
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/expenses/split-helpers';
import type { Settlement } from '@/types/expense';

interface SettlementCardProps {
  settlement: Settlement;
  currentUserId: string;
  currency?: string;
  onMarkAsPaid?: () => void;
}

export function SettlementCard({
  settlement,
  currentUserId,
  currency = 'USD',
  onMarkAsPaid,
}: SettlementCardProps) {
  const { from, to, amount, fromUser, toUser } = settlement;

  // Determine if current user owes or is owed
  const isYouOwe = from === currentUserId;
  const isOwedToYou = to === currentUserId;

  // Get the other user
  const otherUser = isYouOwe ? toUser : fromUser;

  // Title text
  const title = isYouOwe
    ? `You owe ${toUser.firstName} ${toUser.lastName}`
    : `${fromUser.firstName} ${fromUser.lastName} owes you`;

  // Color scheme
  const amountColor = isYouOwe
    ? 'text-red-600 dark:text-red-400'
    : 'text-green-600 dark:text-green-400';

  const borderColor = isYouOwe
    ? 'border-red-200 dark:border-red-800/50'
    : 'border-green-200 dark:border-green-800/50';

  return (
    <Card className={cn('transition-all hover:shadow-md', borderColor)}>
      <CardContent className="p-4">
        <h4 className="font-medium mb-3">{title}</h4>

        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherUser.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {otherUser.firstName[0]}
              {otherUser.lastName[0]}
            </AvatarFallback>
          </Avatar>

          {/* Details */}
          <div className="flex-1">
            {/* Direction indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{isYouOwe ? 'You' : fromUser.firstName}</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
              <span>{isYouOwe ? toUser.firstName : 'You'}</span>
            </div>

            {/* Amount */}
            <p className={cn('text-2xl font-bold', amountColor)}>
              {formatCurrency(amount, currency)}
            </p>

            {/* Email addresses */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span className="truncate max-w-[120px]">{fromUser.email}</span>
              <ArrowRight className="h-2 w-2 flex-shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[120px]">{toUser.email}</span>
            </div>
          </div>
        </div>

        {/* Mark as Paid button (disabled for now) */}
        <Button
          variant="outline"
          className="w-full mt-3"
          disabled
          aria-label={`Mark settlement with ${otherUser.firstName} as paid (coming soon)`}
        >
          Mark as Paid
          <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
        </Button>
      </CardContent>
    </Card>
  );
}
