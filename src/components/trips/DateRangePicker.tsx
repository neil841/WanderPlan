'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  disabled?: boolean;
}

/**
 * DateRangePicker Component
 *
 * Premium date range picker for selecting trip start and end dates.
 *
 * Features:
 * - Dual calendar interface (start and end date)
 * - Visual date range selection
 * - Responsive layout
 * - WCAG 2.1 AA compliant
 * - Smooth animations
 *
 * @component
 * @example
 * <DateRangePicker
 *   startDate={startDate}
 *   endDate={endDate}
 *   onStartDateChange={setStartDate}
 *   onEndDateChange={setEndDate}
 * />
 */
export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
}: DateRangePickerProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Start Date Picker */}
      <div className="space-y-2">
        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal transition-all duration-200',
                !startDate && 'text-muted-foreground'
              )}
              aria-label="Select start date"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {format(startDate, 'PPP')}
                </motion.span>
              ) : (
                <span>Start date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  onStartDateChange(date);
                  setIsStartOpen(false);

                  // If end date is before start date, update end date
                  if (endDate && date > endDate) {
                    onEndDateChange(date);
                  }
                }
              }}
              disabled={(date) => {
                // Disable dates in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date Picker */}
      <div className="space-y-2">
        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled || !startDate}
              className={cn(
                'w-full justify-start text-left font-normal transition-all duration-200',
                !endDate && 'text-muted-foreground'
              )}
              aria-label="Select end date"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {format(endDate, 'PPP')}
                </motion.span>
              ) : (
                <span>End date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                if (date) {
                  onEndDateChange(date);
                  setIsEndOpen(false);
                }
              }}
              disabled={(date) => {
                // Disable dates before start date
                if (!startDate) return true;
                return date < startDate;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
