/**
 * Bulk Archive Trips API Route
 *
 * @route POST /api/trips/bulk/archive
 * @access Protected - User must be trip owner or admin collaborator
 *
 * Archives multiple trips at once by setting isArchived = true.
 * Only trips where the user is owner or admin collaborator can be archived.
 * Archived trips are hidden from default trip lists but can be restored.
 *
 * Request body:
 * {
 *   tripIds: string[] // Array of trip UUIDs to archive
 * }
 *
 * Response:
 * {
 *   message: string,
 *   archived: number, // Count of successfully archived trips
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
import { bulkArchiveSchema } from '@/lib/validations/bulk-trip';
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
      validatedData = bulkArchiveSchema.parse(body);
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

    // 3. Process each trip and check permissions
    const results = await Promise.all(
      tripIds.map(async (tripId) => {
        try {
          // Check if trip exists and user has permission
          const trip = await prisma.trip.findFirst({
            where: {
              id: tripId,
              deletedAt: null, // Exclude soft-deleted trips
              // User must be owner or admin collaborator
              OR: [
                { createdBy: userId },
                {
                  collaborators: {
                    some: {
                      userId,
                      status: 'ACCEPTED',
                      role: 'ADMIN',
                    },
                  },
                },
              ],
            },
            select: {
              id: true,
              name: true,
              isArchived: true,
            },
          });

          // Trip not found or no permission
          if (!trip) {
            return {
              tripId,
              success: false,
              reason: 'Trip not found or insufficient permissions',
            };
          }

          // Trip already archived
          if (trip.isArchived) {
            return {
              tripId,
              success: true,
              reason: 'Already archived',
            };
          }

          // Archive the trip
          await prisma.trip.update({
            where: { id: tripId },
            data: { isArchived: true },
          });

          return {
            tripId,
            success: true,
            tripName: trip.name,
          };
        } catch (error) {
          console.error(`[Bulk Archive] Failed for trip ${tripId}:`, error);
          return {
            tripId,
            success: false,
            reason: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    // 4. Calculate success/failure counts
    const archived = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // 5. Determine response status
    const allSucceeded = failed === 0;
    const allFailed = archived === 0;
    const status = allFailed ? 207 : 200; // 207 Multi-Status if partial success

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        message: allSucceeded
          ? `Successfully archived ${archived} trip(s)`
          : allFailed
          ? 'Failed to archive all trips'
          : `Archived ${archived} trip(s), failed ${failed}`,
        archived,
        failed,
        results,
        duration: `${duration}ms`,
      },
      { status }
    );
  } catch (error) {
    console.error('[POST /api/trips/bulk/archive Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
