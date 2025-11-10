/**
 * Email verification token utilities
 * Handles creation and validation of email verification tokens
 */

import { randomBytes } from 'crypto';
import prisma from '@/lib/db/prisma';

/**
 * Token expiry time in hours
 */
const TOKEN_EXPIRY_HOURS = 24;

/**
 * Generate a secure random token
 *
 * @returns A random hex token
 */
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create an email verification token
 *
 * @param email - User's email address
 * @returns The generated verification token
 *
 * @example
 * const token = await createVerificationToken('user@example.com');
 */
export async function createVerificationToken(email: string): Promise<string> {
  const token = generateToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + TOKEN_EXPIRY_HOURS);

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify an email verification token
 *
 * @param token - The verification token
 * @returns The email address if token is valid, null otherwise
 *
 * @throws {Error} If token is expired or invalid
 *
 * @example
 * const email = await verifyEmailToken('abc123...');
 */
export async function verifyEmailToken(
  token: string
): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null;
  }

  // Check if token is expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    throw new Error('Verification token has expired');
  }

  // Delete used token
  await prisma.verificationToken.delete({
    where: { token },
  });

  return verificationToken.identifier;
}

/**
 * Create a password reset token
 *
 * @param userId - User's ID
 * @returns The generated reset token
 *
 * @example
 * const token = await createPasswordResetToken('user-id-123');
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // 1 hour expiry for security

  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify a password reset token
 *
 * @param token - The reset token
 * @returns The user ID if token is valid, null otherwise
 *
 * @throws {Error} If token is expired or invalid
 *
 * @example
 * const userId = await verifyPasswordResetToken('abc123...');
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return null;
  }

  // Check if token is expired
  if (resetToken.expires < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { token },
    });
    throw new Error('Reset token has expired');
  }

  // Delete used token
  await prisma.passwordResetToken.delete({
    where: { token },
  });

  return resetToken.userId;
}
