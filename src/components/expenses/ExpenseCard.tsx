/**
 * Expense Card Component
 *
 * Displays individual expense with details and actions
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Receipt,
  Calendar,
  User,
  Tag,
  Users,
} from 'lucide-react';
import type { Expense, ExpenseCategory } from '@/types/expense';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/expenses/split-helpers';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  canEdit?: boolean;
  className?: string;
}

const categoryColors: Record<ExpenseCategory, string> = {
  ACCOMMODATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  TRANSPORTATION: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  FOOD: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  ACTIVITIES: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  SHOPPING: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const categoryLabels: Record<ExpenseCategory, string> = {
  ACCOMMODATION: 'Accommodation',
  TRANSPORTATION: 'Transportation',
  FOOD: 'Food & Dining',
  ACTIVITIES: 'Activities',
  SHOPPING: 'Shopping',
  OTHER: 'Other',
};

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  canEdit = false,
  className,
}: ExpenseCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Details */}
          <div className="flex-1 space-y-2">
            {/* Description and Amount */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{expense.description}</h4>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(expense.amount, expense.currency)}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {/* Category Badge */}
              <Badge
                variant="secondary"
                className={cn('gap-1', categoryColors[expense.category])}
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                {categoryLabels[expense.category]}
              </Badge>

              {/* Date */}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                <span>{formatDate(expense.date)}</span>
              </div>

              {/* Split Indicator Badge with Tooltip */}
              {expense.splits && expense.splits.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-help bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        <Users className="h-3 w-3" aria-hidden="true" />
                        Split ({expense.splits.length})
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">Split Details</p>
                        <div className="text-sm space-y-1">
                          {expense.splits.map((split) => (
                            <div
                              key={split.id}
                              className="flex justify-between gap-3"
                            >
                              <span>
                                {split.user
                                  ? `${split.user.firstName} ${split.user.lastName}`
                                  : 'Unknown'}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(split.amount, expense.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground">
                          Total: {formatCurrency(expense.amount, expense.currency)} (
                          {expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}
                          )
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Payer */}
              {expense.payer && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" aria-hidden="true" />
                  <span>
                    Paid by {expense.payer.firstName} {expense.payer.lastName}
                  </span>
                </div>
              )}

              {/* Event */}
              {expense.event && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  <span>{expense.event.title}</span>
                </div>
              )}

              {/* Receipt */}
              {expense.receiptUrl && (
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Receipt className="h-3 w-3" aria-hidden="true" />
                  <span>View Receipt</span>
                </a>
              )}
            </div>
          </div>

          {/* Right side: Actions */}
          {canEdit && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Expense options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(expense)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(expense)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
