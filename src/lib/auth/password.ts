/**
 * Password hashing and verification utilities
 * Uses bcryptjs for secure password handling (pure JavaScript, serverless-compatible)
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 *
 * @param password - Plain text password to hash
 * @returns Hashed password
 *
 * @example
 * const hashed = await hashPassword('mySecurePassword123');
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hashed password
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns True if password matches, false otherwise
 *
 * @example
 * const isValid = await verifyPassword('mySecurePassword123', hashedFromDB);
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
