/**
 * Auth module - Re-exports NextAuth v5 configuration
 * This file exists for backward compatibility with imports from '@/lib/auth'
 */

export { auth, handlers, signIn, signOut } from './auth/auth-options';

// Export auth options for compatibility
export { auth as authOptions } from './auth/auth-options';
