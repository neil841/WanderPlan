/**
 * Stripe Client Configuration
 *
 * Initializes Stripe SDK with API credentials.
 * Used for creating Checkout sessions and handling payments.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY is required. Please set it in your .env file.'
  );
}

/**
 * Stripe client instance
 *
 * Configured with:
 * - Latest API version (2025-02-24.acacia)
 * - TypeScript support enabled
 * - Server-side only (never expose secret key to client)
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});
