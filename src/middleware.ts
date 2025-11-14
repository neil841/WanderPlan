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
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If accessing protected route without authentication
  if (!token) {
    // Build login URL with redirect
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check email verification for non-API routes
  if (!pathname.startsWith('/api')) {
    // Allow profile and settings pages for unverified users
    const allowedPaths = ['/profile', '/settings', '/dashboard'];
    const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));

    if (!token.emailVerified && !isAllowedPath) {
      // Redirect unverified users to profile page with warning
      const profileUrl = new URL('/profile', request.url);
      return NextResponse.redirect(profileUrl);
    }
  }

  // User is authenticated, allow access
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
