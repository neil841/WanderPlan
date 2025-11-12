/**
 * DraggableEvent Component
 *
 * Wraps EventCard with dnd-kit sortable functionality.
 * Enables drag-and-drop for event reordering.
 *
 * @component
 * @example
 * <DraggableEvent event={event} />
 */

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EventResponse } from '@/types/event';
import { EventCard } from './EventCard';

interface DraggableEventProps {
  event: EventResponse;
}

export function DraggableEvent({ event }: DraggableEventProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: event.id,
    data: {
      type: 'event',
      event,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`Drag ${event.title} to reorder`}
      onKeyDown={(e) => {
        // Allow keyboard navigation
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Focus handling for keyboard users
        }
      }}
    >
      <EventCard event={event} isDragging={isDragging} />
    </div>
  );
}
