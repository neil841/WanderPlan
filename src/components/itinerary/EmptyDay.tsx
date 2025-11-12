/**
 * EmptyDay Component
 *
 * Displays an empty state for a day with no events.
 * Includes a call-to-action to add events.
 *
 * @component
 * @example
 * <EmptyDay date="2024-06-15" onAddEvent={() => {}} />
 */

'use client';

import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EmptyDayProps {
  date: string;
  onAddEvent?: () => void;
}

export function EmptyDay({ date, onAddEvent }: EmptyDayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50"
      role="region"
      aria-label={`No events for ${date}`}
    >
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Calendar className="h-8 w-8 text-gray-400" aria-hidden="true" />
      </div>

      <h3 className="text-sm font-medium text-gray-900 mb-1">No events yet</h3>
      <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
        Drag events here or add a new event to this day
      </p>

      {onAddEvent && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddEvent}
          className="gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Event
        </Button>
      )}
    </motion.div>
  );
}
