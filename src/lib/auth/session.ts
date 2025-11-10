/**
 * Session utility functions
 * Helper functions for getting and managing user sessions
 */

import { auth } from './auth-options';

/**
 * Get current user session (server-side)
 *
 * @returns User session or null if not authenticated
 *
 * @example
 * const session = await getCurrentUser();
 * if (!session) {
 *   return redirect('/login');
 * }
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get current user session and throw if not authenticated
 *
 * @returns User session
 * @throws Error if user is not authenticated
 *
 * @example
 * const user = await requireAuth();
 * // user is guaranteed to exist here
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized - Please sign in');
  }

  return user;
}

/**
 * Check if user is authenticated
 *
 * @returns True if user is authenticated, false otherwise
 *
 * @example
 * const isAuthenticated = await isAuth();
 * if (!isAuthenticated) {
 *   return <LoginPrompt />;
 * }
 */
export async function isAuth(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
