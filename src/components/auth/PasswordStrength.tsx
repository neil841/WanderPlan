'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

/**
 * Password strength indicator component
 *
 * Features:
 * - Visual strength meter with color coding
 * - Individual requirement checklist
 * - Real-time validation feedback
 * - Smooth animations
 * - Accessibility-friendly
 *
 * @component
 * @example
 * <PasswordStrength password={passwordValue} />
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character',
      met: /[@$!%*?&]/.test(password),
    },
  ];

  const metRequirements = requirements.filter((r) => r.met).length;
  const strength = (metRequirements / requirements.length) * 100;

  const getStrengthLabel = (): string => {
    if (metRequirements === 0) return 'No password';
    if (metRequirements <= 2) return 'Weak';
    if (metRequirements <= 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = (): string => {
    if (metRequirements === 0) return 'bg-neutral-200';
    if (metRequirements <= 2) return 'bg-error-500';
    if (metRequirements <= 4) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getStrengthTextColor = (): string => {
    if (metRequirements === 0) return 'text-neutral-500';
    if (metRequirements <= 2) return 'text-error-600';
    if (metRequirements <= 4) return 'text-warning-600';
    return 'text-success-600';
  };

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password Strength
          </span>
          <span
            className={`text-sm font-semibold ${getStrengthTextColor()}`}
            aria-live="polite"
          >
            {getStrengthLabel()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <motion.div
            className={`h-full rounded-full ${getStrengthColor()} transition-colors duration-300`}
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div
        className="space-y-1.5"
        role="list"
        aria-label="Password requirements"
      >
        {requirements.map((requirement, index) => (
          <motion.div
            key={requirement.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2"
            role="listitem"
          >
            {requirement.met ? (
              <Check
                className="h-4 w-4 text-success-600"
                aria-hidden="true"
              />
            ) : (
              <X className="h-4 w-4 text-neutral-400" aria-hidden="true" />
            )}
            <span
              className={`text-sm ${
                requirement.met
                  ? 'text-success-700 dark:text-success-400'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {requirement.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
