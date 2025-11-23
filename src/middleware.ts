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
import { auth } from '@/lib/auth/auth-options';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated using NextAuth v5 auth() function
  const session = await auth();

  // If accessing protected route without authentication
  if (!session?.user) {
    // Build login URL with redirect
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check email verification for non-API routes
  if (!pathname.startsWith('/api')) {
    // Allow profile, settings, dashboard, and trips pages for unverified users
    const allowedPaths = ['/settings/profile', '/settings', '/dashboard', '/trips'];
    const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));

    if (!session.user.emailVerified && !isAllowedPath) {
      // Redirect unverified users to settings/profile page with warning
      const profileUrl = new URL('/settings/profile', request.url);
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
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/trips/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
