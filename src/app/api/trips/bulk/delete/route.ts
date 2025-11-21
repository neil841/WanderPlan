/**
 * Bulk Delete Trips API Route
 *
 * @route POST /api/trips/bulk/delete
 * @access Protected - User must be trip owner (only owners can delete)
 *
 * Soft deletes multiple trips at once by setting deletedAt timestamp.
 * Only trips where the user is the owner can be deleted.
 * Collaborators cannot delete trips, even if they are admins.
 * Soft deletion preserves all related data.
 *
 * Request body:
 * {
 *   tripIds: string[] // Array of trip UUIDs to delete
 * }
 *
 * Response:
 * {
 *   message: string,
 *   deleted: number,  // Count of successfully deleted trips
 *   failed: number,   // Count of failed operations
 *   results: Array<{
 *     tripId: string,
 *     success: boolean,
 *     reason?: string  // Error reason if failed
 *   }>
 * }
 *
 * @throws {400} - Validation error
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { bulkDeleteSchema } from '@/lib/validations/bulk-trip';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Parse and validate request body
    let validatedData;
    try {
      const body = await req.json();
      validatedData = bulkDeleteSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { tripIds } = validatedData;

    // 3. Process each trip and check ownership
    const results = await Promise.all(
      tripIds.map(async (tripId) => {
        try {
          // Check if trip exists and user is owner
          const trip = await prisma.trip.findFirst({
            where: {
              id: tripId,
              createdBy: userId, // Only owner can delete
            },
            select: {
              id: true,
              name: true,
              deletedAt: true,
            },
          });

          // Trip not found or not owner
          if (!trip) {
            return {
              tripId,
              success: false,
              reason: 'Trip not found or you are not the owner',
            };
          }

          // Trip already deleted
          if (trip.deletedAt) {
            return {
              tripId,
              success: true,
              reason: 'Already deleted',
            };
          }

          // Soft delete the trip
          await prisma.trip.update({
            where: { id: tripId },
            data: { deletedAt: new Date() },
          });

          return {
            tripId,
            success: true,
            tripName: trip.name,
          };
        } catch (error) {
          console.error(`[Bulk Delete] Failed for trip ${tripId}:`, error);
          return {
            tripId,
            success: false,
            reason: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    // 4. Calculate success/failure counts
    const deleted = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // 5. Determine response status
    const allSucceeded = failed === 0;
    const allFailed = deleted === 0;
    const status = allFailed ? 207 : 200; // 207 Multi-Status if partial success

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        message: allSucceeded
          ? `Successfully deleted ${deleted} trip(s)`
          : allFailed
          ? 'Failed to delete all trips'
          : `Deleted ${deleted} trip(s), failed ${failed}`,
        deleted,
        failed,
        results,
        duration: `${duration}ms`,
      },
      { status }
    );
  } catch (error) {
    console.error('[POST /api/trips/bulk/delete Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
