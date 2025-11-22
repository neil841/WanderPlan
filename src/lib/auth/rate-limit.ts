/**
 * Rate limiting utilities for authentication endpoints
 * Prevents brute force attacks on login attempts
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory store for rate limiting
 * In production, consider using Redis for distributed systems
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5, // Maximum login attempts
  windowMs: 15 * 60 * 1000, // 15 minutes window
  blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes after exceeding
};

/**
 * Clean up expired entries from rate limit store
 * Runs periodically to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Check if an identifier (email or IP) is rate limited
 *
 * @param identifier - Email address or IP address
 * @returns Object with isLimited status and remaining attempts
 *
 * @example
 * const result = checkRateLimit('user@example.com');
 * if (result.isLimited) {
 *   throw new Error(`Too many attempts. Try again in ${result.resetInMinutes} minutes`);
 * }
 */
export function checkRateLimit(identifier: string): {
  isLimited: boolean;
  remainingAttempts: number;
  resetInMinutes: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or expired entry - allow
  if (!entry || entry.resetAt < now) {
    return {
      isLimited: false,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      resetInMinutes: 0,
    };
  }

  // Check if limit exceeded
  const isLimited = entry.count >= RATE_LIMIT_CONFIG.maxAttempts;
  const remainingAttempts = Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - entry.count);
  const resetInMinutes = Math.ceil((entry.resetAt - now) / 60000);

  return {
    isLimited,
    remainingAttempts,
    resetInMinutes,
  };
}

/**
 * Record a failed login attempt
 *
 * @param identifier - Email address or IP address
 *
 * @example
 * recordFailedAttempt('user@example.com');
 */
export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    });
  } else {
    // Increment existing entry
    entry.count += 1;
  }
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 *
 * @param identifier - Email address or IP address
 *
 * @example
 * resetRateLimit('user@example.com');
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status for an identifier
 *
 * @param identifier - Email address or IP address
 * @returns Current attempt count and reset time
 *
 * @example
 * const status = getRateLimitStatus('user@example.com');
 * console.log(`Attempts: ${status.attempts}, Reset in: ${status.resetInMinutes}m`);
 */
export function getRateLimitStatus(identifier: string): {
  attempts: number;
  resetInMinutes: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    return { attempts: 0, resetInMinutes: 0 };
  }

  return {
    attempts: entry.count,
    resetInMinutes: Math.ceil((entry.resetAt - now) / 60000),
  };
}

/**
 * Generic rate limiting function for any endpoint
 *
 * @param identifier - Unique identifier (email, IP, userId, etc.)
 * @param maxAttempts - Maximum allowed attempts
 * @param windowMs - Time window in milliseconds
 * @returns Object with rate limit status
 *
 * @example
 * const { isLimited, resetInMinutes } = checkGenericRateLimit('lead:192.168.1.1', 10, 15 * 60 * 1000);
 * if (isLimited) {
 *   return NextResponse.json({ error: `Rate limit exceeded. Try again in ${resetInMinutes} minutes` }, { status: 429 });
 * }
 */
export function checkGenericRateLimit(
  identifier: string,
  maxAttempts: number,
  windowMs: number
): {
  isLimited: boolean;
  remainingAttempts: number;
  resetInMinutes: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or expired entry - allow and create new entry
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      isLimited: false,
      remainingAttempts: maxAttempts - 1,
      resetInMinutes: 0,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  const isLimited = entry.count > maxAttempts;
  const remainingAttempts = Math.max(0, maxAttempts - entry.count);
  const resetInMinutes = Math.ceil((entry.resetAt - now) / 60000);

  return {
    isLimited,
    remainingAttempts,
    resetInMinutes,
  };
}
