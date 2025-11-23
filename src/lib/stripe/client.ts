/**
 * Stripe Client Configuration
 *
 * Initializes Stripe SDK with API credentials.
 * Used for creating Checkout sessions and handling payments.
 */

import Stripe from 'stripe';

/**
 * Stripe client instance
 *
 * Configured with:
 * - Latest API version (2025-02-24.acacia)
 * - TypeScript support enabled
 * - Server-side only (never expose secret key to client)
 *
 * Note: Stripe is optional. If not configured, payment features will be disabled.
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  : null;
