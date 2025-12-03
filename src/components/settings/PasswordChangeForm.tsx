'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

/**
 * Password Change Form Component
 *
 * Features:
 * - Secure password change with current password verification
 * - Real-time password strength indicator
 * - Password requirements checklist with live validation
 * - Show/hide password toggles
 * - Password confirmation matching
 * - Loading, error, and success states
 * - Smooth animations with Framer Motion
 * - WCAG 2.1 AA compliant
 * - Fully responsive (mobile-first)
 *
 * @component
 * @example
 * <PasswordChangeForm onSuccess={handleSuccess} />
 */
export function PasswordChangeForm({ onSuccess }: PasswordChangeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password strength calculation
  const getPasswordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let strength = 0;

    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 12.5;
    if (/[A-Z]/.test(pwd)) strength += 12.5;
    if (/\d/.test(pwd)) strength += 12.5;
    if (/[@$!%*?&]/.test(pwd)) strength += 12.5;

    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return 'bg-error-500';
    if (strength < 70) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Good';
    return 'Strong';
  };

  // Password requirements checklist
  const requirements = [
    { label: 'At least 8 characters', met: formData.newPassword.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.newPassword) },
    { label: 'Contains number', met: /\d/.test(formData.newPassword) },
    { label: 'Contains special character', met: /[@$!%*?&]/.test(formData.newPassword) },
    {
      label: 'Passwords match',
      met: formData.newPassword === formData.confirmPassword && formData.confirmPassword.length > 0,
    },
    {
      label: 'Different from current',
      met: formData.currentPassword !== formData.newPassword && formData.newPassword.length > 0,
    },
  ];

  const allRequirementsMet = requirements.every((req) => req.met);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to change password');
      }

      setSuccess(true);

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
    >
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-900/5 border border-gray-200/50 p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Change Password
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Success Alert */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <Alert className="bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800">
                <CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-400" />
                <AlertTitle className="text-success-900 dark:text-success-100">
                  Password changed!
                </AlertTitle>
                <AlertDescription className="text-success-800 dark:text-success-200">
                  Your password has been updated successfully.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="space-y-2"
          >
            <Label
              htmlFor="currentPassword"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Current Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-10 transition-all duration-200"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* New Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="space-y-2"
          >
            <Label
              htmlFor="newPassword"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-10 transition-all duration-200"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Password strength:
                  </span>
                  <span
                    className={`font-medium ${
                      passwordStrength < 40
                        ? 'text-error-600 dark:text-error-400'
                        : passwordStrength < 70
                          ? 'text-warning-600 dark:text-warning-400'
                          : 'text-success-600 dark:text-success-400'
                    }`}
                  >
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full ${getStrengthColor(passwordStrength)} transition-colors`}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="space-y-2"
          >
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-10 transition-all duration-200"
                placeholder="Re-enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Password Requirements */}
          {formData.newPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="space-y-2 pt-2"
            >
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password must meet the following requirements:
              </p>
              <div className="space-y-1.5">
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                  >
                    {req.met ? (
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-success-600 dark:text-success-400" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center">
                        <X className="h-2.5 w-2.5 text-neutral-400" />
                      </div>
                    )}
                    <span className={req.met ? 'text-success-700 dark:text-success-300' : ''}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="pt-4"
          >
            <motion.button
              type="submit"
              disabled={isLoading || !allRequirementsMet}
              whileHover={{ scale: (isLoading || !allRequirementsMet) ? 1 : 1.01 }}
              whileTap={{ scale: (isLoading || !allRequirementsMet) ? 1 : 0.98 }}
              className="group relative w-full sm:w-auto overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span>{isLoading ? 'Changing Password...' : 'Change Password'}</span>
              </span>
              {/* Shine effect */}
              {!isLoading && allRequirementsMet && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
