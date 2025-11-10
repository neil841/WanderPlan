/**
 * Authentication validation schemas
 * Zod schemas for user authentication operations (registration, login, password reset)
 */

import { z } from 'zod';

/**
 * Password validation regex
 * Requires: 8+ chars, uppercase, lowercase, number, special character
 */
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Registration schema
 *
 * @example
 * const data = registerSchema.parse({
 *   email: 'user@example.com',
 *   password: 'SecureP@ss123',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 */
export const registerSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character'
    ),

  firstName: z
    .string({ message: 'First name is required' })
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),

  lastName: z
    .string({ message: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),

  timezone: z.string().optional().default('America/New_York'),
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z.string({ message: 'Password is required' }),

  rememberMe: z.boolean().optional().default(false),
});

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string({ message: 'Verification token is required' }),
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

/**
 * Password reset confirm schema
 */
export const passwordResetConfirmSchema = z.object({
  token: z.string({ message: 'Reset token is required' }),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
});

/**
 * Type inference exports
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetConfirmInput = z.infer<
  typeof passwordResetConfirmSchema
>;
