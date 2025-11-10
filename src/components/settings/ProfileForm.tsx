'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  Save,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProfileData {
  id: string;
  email: string;
  emailVerified: Date | null;
  firstName: string;
  lastName: string;
  bio: string | null;
  phone: string | null;
  timezone: string;
}

interface ProfileFormProps {
  initialData?: ProfileData;
  onSuccess?: () => void;
}

/**
 * Profile Information Form Component
 *
 * Features:
 * - Update basic profile information (name, email, bio, phone)
 * - Timezone selector with common timezones
 * - Real-time validation
 * - Loading, error, and success states
 * - Email change triggers re-verification
 * - Smooth animations with Framer Motion
 * - WCAG 2.1 AA compliant
 * - Fully responsive (mobile-first)
 *
 * @component
 * @example
 * <ProfileForm initialData={userData} onSuccess={handleSuccess} />
 */
export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    bio: initialData?.bio || '',
    phone: initialData?.phone || '',
    timezone: initialData?.timezone || 'America/New_York',
  });

  // Common timezones for the selector
  const commonTimezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Track if email changed
    if (field === 'email' && initialData && value !== initialData.email) {
      setEmailChanged(true);
    } else if (field === 'email' && initialData && value === initialData.email) {
      setEmailChanged(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update profile');
      }

      setSuccess(true);

      // Show success message for longer if email changed
      const successDuration = result.emailChangeRequiresVerification ? 5000 : 3000;

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();

        // Refresh page to get updated data
        router.refresh();
      }, successDuration);

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
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
              <User className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Profile Information
            </h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Update your personal information and preferences
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
                  Profile updated!
                </AlertTitle>
                <AlertDescription className="text-success-800 dark:text-success-200">
                  {emailChanged
                    ? 'Your profile has been updated. Please check your new email address to verify it.'
                    : 'Your changes have been saved successfully.'}
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
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="space-y-2"
            >
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={isLoading}
                  className="pl-10 transition-all duration-200"
                  placeholder="John"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="space-y-2"
            >
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Last Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={isLoading}
                  className="pl-10 transition-all duration-200"
                  placeholder="Doe"
                  required
                />
              </div>
            </motion.div>
          </div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="space-y-2"
          >
            <Label
              htmlFor="email"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Email Address
              {emailChanged && (
                <span className="ml-2 text-xs text-warning-600 dark:text-warning-400">
                  (will require verification)
                </span>
              )}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isLoading}
                className="pl-10 transition-all duration-200"
                placeholder="john@example.com"
                required
              />
            </div>
            {initialData && !initialData.emailVerified && (
              <p className="text-xs text-warning-600 dark:text-warning-400">
                Your current email is not verified. Check your inbox for the verification link.
              </p>
            )}
          </motion.div>

          {/* Bio Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="space-y-2"
          >
            <Label
              htmlFor="bio"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Bio <span className="text-neutral-500 font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('bio', e.target.value)}
                disabled={isLoading}
                className="pl-10 min-h-[100px] transition-all duration-200"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {formData.bio.length}/500 characters
            </p>
          </motion.div>

          {/* Phone Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="space-y-2"
          >
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Phone Number <span className="text-neutral-500 font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={isLoading}
                className="pl-10 transition-all duration-200"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Use international format (E.164)
            </p>
          </motion.div>

          {/* Timezone Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="space-y-2"
          >
            <Label
              htmlFor="timezone"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Timezone
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
              <Select
                value={formData.timezone}
                onValueChange={(value: string) => handleChange('timezone', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {commonTimezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="pt-4"
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <motion.div
                className="flex items-center justify-center gap-2"
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </motion.div>
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
