import { z } from 'zod';

/**
 * Validation schemas for user profile operations
 *
 * These schemas validate profile updates, password changes,
 * and ensure data integrity for user settings.
 */

/**
 * Schema for updating basic profile information
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string({ message: 'First name is required' })
    .min(1, 'First name cannot be empty')
    .max(50, 'First name must be less than 50 characters')
    .trim()
    .optional(),

  lastName: z
    .string({ message: 'Last name is required' })
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name must be less than 50 characters')
    .trim()
    .optional(),

  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional(),

  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .trim()
    .optional()
    .nullable(),

  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (use E.164 format)')
    .optional()
    .nullable(),

  timezone: z
    .string()
    .refine(
      (tz) => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: tz });
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid timezone' }
    )
    .optional(),
});

/**
 * Schema for changing password
 * Requires current password for security
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ message: 'Current password is required' })
      .min(1, 'Current password cannot be empty'),

    newPassword: z
      .string({ message: 'New password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),

    confirmPassword: z
      .string({ message: 'Password confirmation is required' })
      .min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

/**
 * Schema for updating user preferences/settings
 */
export const updateSettingsSchema = z.object({
  notifications: z
    .object({
      email: z
        .object({
          tripInvites: z.boolean().optional(),
          tripUpdates: z.boolean().optional(),
          messages: z.boolean().optional(),
          marketing: z.boolean().optional(),
        })
        .optional(),
      push: z
        .object({
          enabled: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),

  privacy: z
    .object({
      defaultTripVisibility: z
        .enum(['PRIVATE', 'SHARED', 'PUBLIC'])
        .optional(),
      showProfile: z.boolean().optional(),
    })
    .optional(),

  preferences: z
    .object({
      defaultCurrency: z.string().length(3).optional(), // ISO 4217 currency code
      measurementUnit: z.enum(['metric', 'imperial']).optional(),
      locale: z.string().optional(), // e.g., 'en-US', 'fr-FR'
    })
    .optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

/**
 * Complete profile data type (for responses)
 */
export type ProfileData = {
  id: string;
  email: string;
  emailVerified: Date | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  timezone: string;
  settings: unknown;
  createdAt: Date;
  updatedAt: Date;
};
