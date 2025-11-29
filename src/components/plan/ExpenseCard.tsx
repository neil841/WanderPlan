'use client';

import { motion } from 'framer-motion';
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type GuestExpense } from '@/lib/guest-mode';
import { format } from 'date-fns';

interface ExpenseCardProps {
  expense: GuestExpense;
  onEdit: (expense: GuestExpense) => void;
  onDelete: (expenseId: string) => void;
}

const categoryColors: Record<string, string> = {
  accommodation: 'bg-green-100 text-green-700',
  food: 'bg-orange-100 text-orange-700',
  transport: 'bg-purple-100 text-purple-700',
  activities: 'bg-blue-100 text-blue-700',
  shopping: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

/**
 * ExpenseCard Component
 *
 * Premium card displaying a single expense with edit/delete actions.
 * Features smooth animations and category badges.
 *
 * @component
 */
export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const categoryColor = categoryColors[expense.category.toLowerCase()] || categoryColors.other;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
        {/* Amount */}
        <div className="flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900">
            ${expense.amount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">{expense.currency}</div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {expense.description}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
            </div>
            <Badge variant="secondary" className={`${categoryColor} text-xs capitalize`}>
              {expense.category}
            </Badge>
            {expense.paidBy && (
              <span className="text-xs text-gray-500">Paid by: {expense.paidBy}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(expense)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(expense.id)}
              className="gap-2 text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
