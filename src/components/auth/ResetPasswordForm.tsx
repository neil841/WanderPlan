'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form data type
type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

// Extended schema with password confirmation
const resetPasswordFormSchema = z
  .object({
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string({ message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Reset Password Form Component
 *
 * Features:
 * - Password and confirm password inputs with validation
 * - Password strength indicator
 * - Show/hide password toggle
 * - Real-time password match validation
 * - Token verification on mount
 * - Loading, error, and success states
 * - Smooth animations with Framer Motion
 * - WCAG 2.1 AA compliant
 * - Fully responsive (mobile-first)
 * - Auto-redirect to login after success
 *
 * @component
 * @example
 * <ResetPasswordForm />
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: 'onBlur',
  });

  const password = watch('password', '');

  // Password strength calculation
  const getPasswordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let strength = 0;

    // Length check
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;

    // Character variety
    if (/[a-z]/.test(pwd)) strength += 12.5;
    if (/[A-Z]/.test(pwd)) strength += 12.5;
    if (/\d/.test(pwd)) strength += 12.5;
    if (/[@$!%*?&]/.test(pwd)) strength += 12.5;

    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(password);

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
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
    { label: 'Contains special character', met: /[@$!%*?&]/.test(password) },
  ];

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('No reset token provided. Please request a new password reset.');
        setIsValidatingToken(false);
        return;
      }

      // Token exists, allow form to be shown
      setIsValidatingToken(false);
    };

    validateToken();
  }, [token]);

  // Auto-redirect after success
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        router.push('/login');
      }, 5000);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [success, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('No reset token provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.code === 'TOKEN_EXPIRED') {
          throw new Error(
            'Your reset link has expired. Please request a new password reset.'
          );
        }
        if (result.error?.code === 'INVALID_TOKEN') {
          throw new Error('Invalid reset link. Please request a new password reset.');
        }
        throw new Error(result.error?.message || 'Failed to reset password');
      }

      // Success
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Token validation loading state
  if (isValidatingToken) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600 dark:text-primary-400" />
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            Validating reset link...
          </p>
        </div>
      </motion.div>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 lg:p-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-error-100 dark:bg-error-900/20 text-error-600 dark:text-error-400">
              <XCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Invalid Reset Link
            </h2>
          </div>

          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{tokenError}</AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button asChild variant="default" className="w-full">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg"
          >
            <Lock className="h-8 w-8" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Create new password
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            Choose a strong password to secure your account.
          </motion.p>
        </div>

        {/* Success State */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Alert className="bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800">
                <CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-400" />
                <AlertTitle className="text-success-900 dark:text-success-100">
                  Password reset successful!
                </AlertTitle>
                <AlertDescription className="text-success-800 dark:text-success-200">
                  Your password has been updated. You can now sign in with your new
                  password.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 pt-2">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Redirecting to sign in page in 5 seconds...
                </p>

                <Button asChild className="w-full" variant="default">
                  <Link href="/login">Sign In Now</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      disabled={isLoading}
                      className={`pr-10 transition-all duration-200 ${
                        errors.password
                          ? 'border-error-500 focus:ring-error-500'
                          : 'focus:ring-primary-500'
                      }`}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
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

                  {/* Password Requirements */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="space-y-1.5 pt-1"
                    >
                      {requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                        >
                          {req.met ? (
                            <Check className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 dark:border-neutral-600" />
                          )}
                          <span className={req.met ? 'line-through opacity-60' : ''}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        id="password-error"
                        role="alert"
                        className="text-xs text-error-600 dark:text-error-400"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      disabled={isLoading}
                      className={`pr-10 transition-all duration-200 ${
                        errors.confirmPassword
                          ? 'border-error-500 focus:ring-error-500'
                          : 'focus:ring-primary-500'
                      }`}
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={
                        errors.confirmPassword ? 'confirm-password-error' : undefined
                      }
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                      aria-label={
                        showConfirmPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        id="confirm-password-error"
                        role="alert"
                        className="text-xs text-error-600 dark:text-error-400"
                      >
                        {errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{isLoading ? 'Resetting password...' : 'Reset password'}</span>
                    </motion.div>
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
