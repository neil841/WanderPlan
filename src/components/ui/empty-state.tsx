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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
      role="region"
      aria-label={title}
    >
      {/* Premium Icon Circle with Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative mb-6"
      >
        <div
          className={cn(
            'relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center overflow-hidden',
            iconClassName
          )}
        >
          {/* Background gradient orb */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl" />

          {/* Static icon - PERFORMANCE OPTIMIZED */}
          <div className="relative z-10">
            <Icon className="h-12 w-12 text-blue-600" aria-hidden="true" />
          </div>
        </div>
      </motion.div>

      {/* Premium Typography */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-3"
      >
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="max-w-md text-base text-gray-600">
          {description}
        </p>
      </motion.div>

      {/* Premium CTA Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8"
        >
          {action.variant === 'outline' ? (
            <Button
              variant="outline"
              onClick={action.onClick}
              size="lg"
              className="gap-2"
            >
              {action.label}
            </Button>
          ) : (
            <motion.button
              onClick={action.onClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
            >
              <span className="relative z-10">{action.label}</span>
            </motion.button>
          )}
        </motion.div>
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-8 px-4 text-center',
        className
      )}
      role="region"
      aria-label={title}
    >
      {/* Compact premium icon */}
      <div className="relative mb-4">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-xl" />
          <Icon className="h-7 w-7 text-blue-600 relative z-10" aria-hidden="true" />
        </div>
      </div>

      <h4 className="mb-2 text-base font-semibold text-gray-900">{title}</h4>
      {description && (
        <p className="max-w-xs text-sm text-gray-600">{description}</p>
      )}
    </motion.div>
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
