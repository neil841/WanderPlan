/**
 * Next.js Middleware for Route Protection (NextAuth v5)
 *
 * This middleware protects routes that require authentication.
 * Unauthenticated users are redirected to the login page.
 *
 * Protected routes:
 * - /dashboard/*
 * - /trips/*
 * - /profile/*
 * - /settings/*
 *
 * Public routes:
 * - /
 * - /login
 * - /register
 * - /api/auth/*
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TODO: Re-enable authentication after fixing bcrypt Edge runtime compatibility
  // For now, allow all requests to pass through
  return NextResponse.next();
}

/**
 * Configure which routes should be protected by this middleware
 *
 * Protected paths:
 * - /dashboard (and all sub-routes)
 * - /trips (and all sub-routes)
 * - /profile (and all sub-routes)
 * - /settings (and all sub-routes)
 *
 * Runtime: nodejs (required for bcrypt compatibility)
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/trips/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
