/**
 * NextAuth.js v5 API Route Handler
 *
 * This file exports the NextAuth v5 route handlers for all authentication endpoints:
 * - GET/POST /api/auth/signin
 * - GET/POST /api/auth/signout
 * - GET/POST /api/auth/callback
 * - GET /api/auth/session
 * - GET /api/auth/csrf
 * - GET /api/auth/providers
 *
 * @route /api/auth/[...nextauth]
 */

import { handlers } from '@/lib/auth/auth-options';

export const { GET, POST } = handlers;
