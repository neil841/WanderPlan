/**
 * NextAuth.js v5 configuration
 * Configures authentication with Prisma adapter and credentials provider
 */

import NextAuth from 'next-auth';
// import { PrismaAdapter } from '@auth/prisma-adapter'; // Removed - incompatible with Credentials provider
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/db/prisma';
import { verifyPassword } from './password';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './rate-limit';

/**
 * NextAuth v5 configuration and auth() function
 *
 * Features:
 * - Prisma adapter for database persistence
 * - Credentials provider for email/password authentication
 * - JWT session strategy
 * - Custom callbacks for session and JWT
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Note: Adapter disabled for Credentials provider with JWT strategy
  // Prisma adapter is incompatible with credentials provider in NextAuth v5
  // adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      /**
       * Authorize user with email and password
       *
       * Features:
       * - Rate limiting to prevent brute force attacks
       * - Email verification check (warns but allows login)
       * - Password verification with bcrypt
       * - Detailed error messages for debugging
       *
       * @param credentials - User credentials (email, password)
       * @returns User object if authentication successful, null otherwise
       * @throws Error with specific message for different failure scenarios
       */
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        // Validate input
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        // Check rate limiting
        const rateLimitResult = checkRateLimit(email);
        if (rateLimitResult.isLimited) {
          throw new Error(
            `Too many login attempts. Please try again in ${rateLimitResult.resetInMinutes} minutes`
          );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          // Record failed attempt for rate limiting
          recordFailedAttempt(email);
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
          // Record failed attempt for rate limiting
          recordFailedAttempt(email);
          throw new Error('Invalid email or password');
        }

        // Check email verification status
        // Note: We allow login even if email is not verified,
        // but include this info in the user object for UI warnings
        const emailVerificationWarning =
          !user.emailVerified
            ? 'Your email is not verified. Some features may be limited.'
            : null;

        // Successful login - reset rate limit
        resetRateLimit(email);

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
          emailVerificationWarning,
        };
      },
    }),
  ],

  /**
   * Custom pages for authentication
   */
  pages: {
    signIn: '/login',
    error: '/login',
  },

  /**
   * Session configuration
   * Using JWT strategy for stateless sessions
   */
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  /**
   * Callback functions
   */
  callbacks: {
    /**
     * JWT callback - Add custom fields to JWT token
     *
     * @param token - JWT token
     * @param user - User object (only available on sign in)
     * @returns Modified JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        const userWithCustomFields = user as typeof user & {
          firstName?: string;
          lastName?: string;
          avatarUrl?: string | null;
          emailVerified?: Date | null;
          emailVerificationWarning?: string | null;
        };

        token.id = user.id;
        token.email = user.email!;
        token.firstName = userWithCustomFields.firstName || '';
        token.lastName = userWithCustomFields.lastName || '';
        token.avatarUrl = userWithCustomFields.avatarUrl || null;
        token.emailVerified = userWithCustomFields.emailVerified || null;
        token.emailVerificationWarning =
          userWithCustomFields.emailVerificationWarning || null;
      }
      return token;
    },

    /**
     * Session callback - Add custom fields to session
     *
     * @param session - Session object
     * @param token - JWT token
     * @returns Modified session object
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email!;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.avatarUrl = token.avatarUrl as string | null;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.emailVerificationWarning =
          token.emailVerificationWarning as string | null;
      }
      return session;
    },
  },

  /**
   * Enable debug mode in development
   */
  debug: process.env.NODE_ENV === 'development',
});
