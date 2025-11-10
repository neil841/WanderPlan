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

import { auth } from '@/lib/auth/auth-options';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isProtectedRoute = [
    '/dashboard',
    '/trips',
    '/profile',
    '/settings',
  ].some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

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
