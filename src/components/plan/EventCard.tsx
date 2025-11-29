'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2,
  GripVertical,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type GuestEvent, type EventCategory } from '@/lib/guest-mode';

interface EventCardProps {
  event: GuestEvent;
  onEdit: (event: GuestEvent) => void;
  onDelete: (eventId: string) => void;
}

const categoryConfig: Record<EventCategory, { color: string; label: string; emoji: string }> = {
  activity: { color: 'bg-blue-100 text-blue-700', label: 'Activity', emoji: '🎭' },
  food: { color: 'bg-orange-100 text-orange-700', label: 'Food', emoji: '🍜' },
  transport: { color: 'bg-purple-100 text-purple-700', label: 'Transport', emoji: '🚇' },
  accommodation: { color: 'bg-green-100 text-green-700', label: 'Accommodation', emoji: '🏨' },
  shopping: { color: 'bg-pink-100 text-pink-700', label: 'Shopping', emoji: '🛍️' },
  other: { color: 'bg-gray-100 text-gray-700', label: 'Other', emoji: '📌' },
};

/**
 * EventCard Component
 *
 * Premium card displaying a single event with edit/delete actions.
 * Features smooth animations, category badges, and hover effects.
 *
 * @component
 */
export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const categoryInfo = event.category ? categoryConfig[event.category] : categoryConfig.other;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
        {/* Drag Handle (for future drag & drop) */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>

        {/* Event Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base line-clamp-2 leading-snug">
                {event.title}
              </h3>
            </div>

            {/* Actions Menu */}
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
                <DropdownMenuItem onClick={() => onEdit(event)} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(event.id)}
                  className="gap-2 text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {/* Time */}
            {(event.startTime || event.endTime) && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  {event.startTime}
                  {event.endTime && ` - ${event.endTime}`}
                </span>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="truncate max-w-[200px]">{event.location}</span>
              </div>
            )}

            {/* Estimated Cost */}
            {event.estimatedCost && event.estimatedCost > 0 && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>${event.estimatedCost.toLocaleString()}</span>
              </div>
            )}

            {/* Category Badge */}
            {event.category && (
              <Badge variant="secondary" className={`${categoryInfo.color} gap-1 text-xs`}>
                <span>{categoryInfo.emoji}</span>
                <span>{categoryInfo.label}</span>
              </Badge>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
