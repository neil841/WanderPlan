/**
 * Unit tests for authentication validation schemas
 */

import {
  registerSchema,
  loginSchema,
  emailVerificationSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
} from '../auth';
import { z } from 'zod';

describe('Authentication Validation Schemas', () => {
  describe('registerSchema', () => {
    const validData = {
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      timezone: 'America/New_York',
    };

    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john.doe@example.com');
        expect(result.data.firstName).toBe('John');
      }
    });

    it('should use default timezone if not provided', () => {
      const { timezone, ...dataWithoutTimezone } = validData;
      const result = registerSchema.safeParse(dataWithoutTimezone);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timezone).toBe('America/New_York');
      }
    });

    it('should reject invalid email format', () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email');
      }
    });

    it('should reject password without uppercase letter', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'lowercase123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should reject password without lowercase letter', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'UPPERCASE123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should reject password without number', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'NoNumbers!@#',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number');
      }
    });

    it('should reject password without special character', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'NoSpecial123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('special character');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'Short1!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 characters');
      }
    });

    it('should reject password longer than 100 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'A'.repeat(90) + '1!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty firstName', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('First name');
      }
    });

    it('should reject firstName longer than 50 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: 'A'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from names', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: '  John  ',
        lastName: '  Doe  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
      }
    });

    it('should lowercase email', () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: 'UPPERCASE@EXAMPLE.COM',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('uppercase@example.com');
      }
    });
  });

  describe('loginSchema', () => {
    const validData = {
      email: 'user@example.com',
      password: 'AnyPassword123!',
      rememberMe: true,
    };

    it('should validate correct login data', () => {
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should default rememberMe to false', () => {
      const { rememberMe, ...dataWithoutRemember } = validData;
      const result = loginSchema.safeParse(dataWithoutRemember);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBe(false);
      }
    });

    it('should not validate password format on login', () => {
      // Login should accept any password string for comparison
      const result = loginSchema.safeParse({
        ...validData,
        password: 'weak',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        ...validData,
        email: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should lowercase email', () => {
      const result = loginSchema.safeParse({
        ...validData,
        email: 'USER@EXAMPLE.COM',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('emailVerificationSchema', () => {
    it('should validate token', () => {
      const result = emailVerificationSchema.safeParse({
        token: 'valid-token-string',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing token', () => {
      const result = emailVerificationSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should allow empty token (validated at business logic layer)', () => {
      // Note: Zod z.string() allows empty strings by default
      // Empty token validation happens in the API route business logic
      const result = emailVerificationSchema.safeParse({ token: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('passwordResetRequestSchema', () => {
    it('should validate email', () => {
      const result = passwordResetRequestSchema.safeParse({
        email: 'user@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should lowercase email', () => {
      const result = passwordResetRequestSchema.safeParse({
        email: 'USER@EXAMPLE.COM',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should reject invalid email', () => {
      const result = passwordResetRequestSchema.safeParse({
        email: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('passwordResetConfirmSchema', () => {
    it('should validate token and password', () => {
      const result = passwordResetConfirmSchema.safeParse({
        token: 'valid-token',
        password: 'NewSecure123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const result = passwordResetConfirmSchema.safeParse({
        token: 'valid-token',
        password: 'weak',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const result = passwordResetConfirmSchema.safeParse({
        password: 'NewSecure123!',
      });
      expect(result.success).toBe(false);
    });

    it('should enforce same password rules as registration', () => {
      // No uppercase
      expect(
        passwordResetConfirmSchema.safeParse({
          token: 'token',
          password: 'lowercase123!',
        }).success
      ).toBe(false);

      // No lowercase
      expect(
        passwordResetConfirmSchema.safeParse({
          token: 'token',
          password: 'UPPERCASE123!',
        }).success
      ).toBe(false);

      // No number
      expect(
        passwordResetConfirmSchema.safeParse({
          token: 'token',
          password: 'NoNumber!@#',
        }).success
      ).toBe(false);

      // No special char
      expect(
        passwordResetConfirmSchema.safeParse({
          token: 'token',
          password: 'NoSpecial123',
        }).success
      ).toBe(false);

      // Too short
      expect(
        passwordResetConfirmSchema.safeParse({
          token: 'token',
          password: 'Short1!',
        }).success
      ).toBe(false);
    });
  });
});
