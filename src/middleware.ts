/**
 * Next.js Middleware
 *
 * NOTE: Auth protection is handled in server components (layouts) instead of middleware
 * to avoid Edge runtime bundle size limits with Prisma + bcryptjs dependencies.
 *
 * Each protected route group ((dashboard), (trips), etc.) has a layout.tsx that:
 * 1. Calls auth() to check session
 * 2. Redirects to /login if not authenticated
 *
 * This approach is recommended for NextAuth v5 with non-Edge-compatible dependencies.
 */

// No middleware needed - auth handled in layouts
export function middleware() {
  return;
}

export const config = {
  matcher: [],
};
