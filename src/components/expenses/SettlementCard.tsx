/**
 * Settlement Card Component
 *
 * Displays an individual settlement (who owes who)
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check } from 'lucide-react';
import type { Settlement } from '@/types/expense';
import { cn } from '@/lib/utils';

interface SettlementCardProps {
  settlement: Settlement;
  onMarkSettled?: (settlement: Settlement) => void;
  isSettled?: boolean;
  className?: string;
  currency?: string;
}

export function SettlementCard({
  settlement,
  onMarkSettled,
  isSettled = false,
  className,
  currency = 'USD',
}: SettlementCardProps) {
  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const fromUser = settlement.fromUser;
  const toUser = settlement.toUser;

  if (!fromUser || !toUser) {
    return null;
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* From User */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm">
                {getInitials(fromUser.firstName, fromUser.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {fromUser.firstName} {fromUser.lastName}
              </p>
              <p className="text-xs text-muted-foreground">Owes</p>
            </div>
          </div>

          {/* Arrow and Amount */}
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-bold text-primary">
              {formatCurrency(settlement.amount, currency)}
            </span>
          </div>

          {/* To User */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-sm">
                {toUser.firstName} {toUser.lastName}
              </p>
              <p className="text-xs text-muted-foreground">Is owed</p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm">
                {getInitials(toUser.firstName, toUser.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Action and Status */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          {isSettled ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <Check className="h-3 w-3 mr-1" />
              Settled
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
              Pending
            </Badge>
          )}

          {!isSettled && onMarkSettled && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkSettled(settlement)}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark as Paid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
