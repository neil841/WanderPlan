/**
 * OAuth State Parameter Management
 *
 * Provides cryptographically secure state parameter generation and validation
 * for OAuth flows to prevent CSRF attacks.
 *
 * @module OAuthState
 */

import crypto from 'crypto';

/**
 * State entry stored server-side
 */
interface StateEntry {
  userId: string;
  tripId: string | null;
  expiresAt: number;
}

/**
 * In-memory store for OAuth state tokens
 * In production, consider using Redis for distributed systems
 *
 * Note: This uses a Map for simplicity. For production with multiple servers,
 * use Redis or a similar distributed cache.
 */
const stateStore = new Map<string, StateEntry>();

/**
 * Clean up expired state tokens
 * Runs periodically to prevent memory leaks
 */
function cleanupExpiredStates(): void {
  const now = Date.now();
  for (const [token, entry] of stateStore.entries()) {
    if (entry.expiresAt < now) {
      stateStore.delete(token);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredStates, 5 * 60 * 1000);
}

/**
 * Generate a cryptographically secure OAuth state parameter
 *
 * @param userId - User ID initiating the OAuth flow
 * @param tripId - Optional trip ID for post-auth redirect
 * @returns Secure random state token
 *
 * @example
 * const state = generateOAuthState('user-123', 'trip-456');
 * // Returns: "a3f8b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0"
 */
export function generateOAuthState(userId: string, tripId: string | null): string {
  // Generate cryptographically random state token (64 hex characters = 32 bytes)
  const token = crypto.randomBytes(32).toString('hex');

  // Store state server-side with 10 minute expiration
  // State tokens are single-use and short-lived for security
  stateStore.set(token, {
    userId,
    tripId,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  return token;
}

/**
 * Validate an OAuth state parameter and retrieve associated data
 *
 * @param token - State token from OAuth callback
 * @returns State data if valid, null if invalid/expired
 *
 * @example
 * const state = validateOAuthState(token);
 * if (!state) {
 *   return NextResponse.json({ error: 'Invalid state' }, { status: 403 });
 * }
 */
export function validateOAuthState(token: string): StateEntry | null {
  const state = stateStore.get(token);

  if (!state) {
    // Token doesn't exist (never generated or already used)
    return null;
  }

  if (Date.now() > state.expiresAt) {
    // Token expired (OAuth flow took too long)
    stateStore.delete(token);
    return null;
  }

  // State is valid - delete it (one-time use)
  // This prevents replay attacks
  stateStore.delete(token);

  return { userId: state.userId, tripId: state.tripId, expiresAt: state.expiresAt };
}

/**
 * Clear all expired states (manual cleanup)
 * Useful for testing or manual maintenance
 *
 * @returns Number of expired states removed
 *
 * @example
 * const removed = clearExpiredStates();
 * console.log(`Removed ${removed} expired state tokens`);
 */
export function clearExpiredStates(): number {
  const now = Date.now();
  let removed = 0;

  for (const [token, entry] of stateStore.entries()) {
    if (entry.expiresAt < now) {
      stateStore.delete(token);
      removed++;
    }
  }

  return removed;
}

/**
 * Get current state store size (for monitoring/debugging)
 *
 * @returns Number of active state tokens
 *
 * @example
 * console.log(`Active OAuth states: ${getStateStoreSize()}`);
 */
export function getStateStoreSize(): number {
  return stateStore.size;
}
