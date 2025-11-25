/**
 * API Authentication & Authorization Middleware
 *
 * Reusable utilities for API route authentication and permission checking.
 * Eliminates code duplication across 67+ API routes.
 *
 * @example
 * ```typescript
 * export async function GET(req: NextRequest, { params }: { params: { tripId: string } }) {
 *   const { user, error } = await authenticateRequest();
 *   if (error) return error;
 *
 *   const trip = await requireTripAccess(params.tripId, user.id);
 *   if (!trip) return unauthorizedResponse('Trip not found');
 *
 *   // Your logic here
 * }
 * ```
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * Authentication result with typed user or error response
 */
type AuthResult =
  | { user: { id: string; email: string }; error: null }
  | { user: null; error: NextResponse };

/**
 * Authenticates the current request and returns user session
 *
 * @returns {AuthResult} User data or error response
 * @example
 * const { user, error } = await authenticateRequest();
 * if (error) return error;
 * console.log(user.id); // Authenticated user ID
 */
export async function authenticateRequest(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      ),
    };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    error: null,
  };
}

/**
 * Validates that a string parameter is present and non-empty
 *
 * @param value - The parameter value to validate
 * @param paramName - Name of parameter for error message
 * @returns {NextResponse | null} Error response or null if valid
 */
export function validateParam(
  value: unknown,
  paramName: string
): NextResponse | null {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return NextResponse.json(
      { error: `Invalid ${paramName}` },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Checks if user has access to a trip (owner or accepted collaborator)
 *
 * @param tripId - Trip ID to check access for
 * @param userId - User ID to check access for
 * @returns {Promise<boolean>} True if user has access
 */
export async function hasTripAccess(
  tripId: string,
  userId: string
): Promise<boolean> {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      deletedAt: null,
      OR: [
        { createdBy: userId },
        {
          collaborators: {
            some: {
              userId,
              status: 'ACCEPTED',
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  return !!trip;
}

/**
 * Requires trip access and returns trip data or null if unauthorized
 *
 * @param tripId - Trip ID to check access for
 * @param userId - User ID to check access for
 * @param select - Optional Prisma select clause for fields to return
 * @returns {Promise<T | null>} Trip data or null if no access
 */
export async function requireTripAccess<T = { id: string }>(
  tripId: string,
  userId: string,
  select?: Record<string, boolean | object>
): Promise<T | null> {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      deletedAt: null,
      OR: [
        { createdBy: userId },
        {
          collaborators: {
            some: {
              userId,
              status: 'ACCEPTED',
            },
          },
        },
      ],
    },
    select: select || ({ id: true } as any),
  });

  return trip as T | null;
}

/**
 * Checks if user has editor or admin role for a trip
 *
 * @param tripId - Trip ID to check permissions for
 * @param userId - User ID to check permissions for
 * @returns {Promise<boolean>} True if user can edit
 */
export async function canEditTrip(
  tripId: string,
  userId: string
): Promise<boolean> {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      deletedAt: null,
      OR: [
        { createdBy: userId }, // Owner can always edit
        {
          collaborators: {
            some: {
              userId,
              status: 'ACCEPTED',
              role: {
                in: ['ADMIN', 'EDITOR'],
              },
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  return !!trip;
}

/**
 * Checks if user is trip owner
 *
 * @param tripId - Trip ID to check ownership for
 * @param userId - User ID to check ownership for
 * @returns {Promise<boolean>} True if user is owner
 */
export async function isTripOwner(
  tripId: string,
  userId: string
): Promise<boolean> {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      createdBy: userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  return !!trip;
}

/**
 * Standard error responses
 */

export function unauthorizedResponse(message = 'Unauthorized - Please log in'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden - You do not have permission'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFoundResponse(message = 'Resource not found'): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequestResponse(message = 'Bad request'): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverErrorResponse(message = 'Internal server error'): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Handles Zod validation errors with formatted response
 *
 * @param error - Zod validation error
 * @returns {NextResponse} Formatted validation error response
 */
export function handleValidationError(error: any): NextResponse {
  if (error.name === 'ZodError') {
    const formattedErrors = error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return NextResponse.json(
      {
        error: 'Validation failed',
        details: formattedErrors,
      },
      { status: 400 }
    );
  }

  return serverErrorResponse('An unexpected error occurred');
}
