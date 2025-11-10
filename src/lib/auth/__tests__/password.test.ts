/**
 * Unit tests for password hashing and verification utilities
 */

import { hashPassword, verifyPassword } from '../password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a plain text password', async () => {
      const password = 'MySecurePassword123!';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'SamePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // bcrypt uses random salt
    });

    it('should hash passwords of different lengths', async () => {
      const shortPassword = 'Short1!';
      const longPassword = 'ThisIsAVeryLongPassword123!@#$%^&*()';

      const shortHashed = await hashPassword(shortPassword);
      const longHashed = await hashPassword(longPassword);

      expect(shortHashed).toBeDefined();
      expect(longHashed).toBeDefined();
      expect(shortHashed.length).toBeGreaterThan(50);
      expect(longHashed.length).toBeGreaterThan(50);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'CorrectPassword123!';
      const hashed = await hashPassword(password);

      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashed = await hashPassword(correctPassword);

      const isValid = await verifyPassword(wrongPassword, hashed);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);

      const isValid = await verifyPassword('', hashed);
      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'MyPassword123!';
      const hashed = await hashPassword(password);

      const isValidSameCase = await verifyPassword('MyPassword123!', hashed);
      const isValidDifferentCase = await verifyPassword('mypassword123!', hashed);

      expect(isValidSameCase).toBe(true);
      expect(isValidDifferentCase).toBe(false);
    });

    it('should handle special characters correctly', async () => {
      const password = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hashed = await hashPassword(password);

      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should hash and verify password flow', async () => {
      const password = 'UserPassword123!';

      // Step 1: Hash password (registration)
      const hashed = await hashPassword(password);
      expect(hashed).toBeDefined();

      // Step 2: Verify password (login)
      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);

      // Step 3: Reject wrong password
      const isInvalid = await verifyPassword('WrongPassword456!', hashed);
      expect(isInvalid).toBe(false);
    });
  });
});
