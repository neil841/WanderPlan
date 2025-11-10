/**
 * Authentication type definitions
 * Extends NextAuth types with our custom user properties
 */

import { DefaultSession } from 'next-auth';

/**
 * Extend the built-in session types
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      emailVerified: Date | null;
      emailVerificationWarning: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string | null;
    emailVerificationWarning?: string | null;
  }
}

/**
 * Extend the built-in JWT types
 */
declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    emailVerified: Date | null;
    emailVerificationWarning: string | null;
  }
}
