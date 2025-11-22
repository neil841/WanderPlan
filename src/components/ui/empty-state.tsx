/**
 * EmptyState Component
 *
 * A reusable empty state component with icon, title, description, and optional CTA button.
 * Follows WanderPlan's design patterns with Framer Motion animations and dark mode support.
 *
 * @component
 * @example
 * <EmptyState
 *   icon={PackageOpen}
 *   title="No trips yet"
 *   description="Start planning your next adventure by creating your first trip."
 *   action={{
 *     label: "Create Trip",
 *     onClick: () => console.log("Create trip"),
 *   }}
 * />
 */

'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="region"
      aria-label={title}
    >
      <div
        className={cn(
          'mb-4 rounded-full bg-muted p-6',
          iconClassName
        )}
      >
        <Icon className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

/**
 * EmptyStateSmall Component
 *
 * A compact version of the empty state for smaller areas like sidebars or cards.
 */
interface EmptyStateSmallProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyStateSmall({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateSmallProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 px-4 text-center',
        className
      )}
      role="region"
      aria-label={title}
    >
      <div className="mb-3 rounded-full bg-muted/50 p-3">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>

      <h4 className="mb-1 text-sm font-medium text-foreground">{title}</h4>
      {description && (
        <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/**
 * EmptyStateInline Component
 *
 * An inline version for use within lists or tables.
 */
interface EmptyStateInlineProps {
  icon: LucideIcon;
  message: string;
  className?: string;
}

export function EmptyStateInline({
  icon: Icon,
  message,
  className,
}: EmptyStateInlineProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground',
        className
      )}
      role="status"
      aria-label={message}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
