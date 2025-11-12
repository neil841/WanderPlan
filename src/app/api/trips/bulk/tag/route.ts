/**
 * Bulk Tag Trips API Route
 *
 * @route POST /api/trips/bulk/tag
 * @access Protected - User must be trip owner or editor/admin collaborator
 *
 * Adds one or more tags to multiple trips at once.
 * Only trips where the user is owner, editor, or admin collaborator can be tagged.
 * Tags are created if they don't exist for a trip, or skipped if they already exist.
 *
 * Request body:
 * {
 *   tripIds: string[],    // Array of trip UUIDs to tag
 *   tagNames: string[],   // Array of tag names to add
 *   tagColor?: string     // Optional hex color for new tags (default: random)
 * }
 *
 * Response:
 * {
 *   message: string,
 *   tagged: number,   // Count of trips successfully tagged
 *   failed: number,   // Count of failed operations
 *   tagsCreated: number, // Total tags created across all trips
 *   results: Array<{
 *     tripId: string,
 *     success: boolean,
 *     tagsAdded: number,  // Number of tags added to this trip
 *     reason?: string     // Error reason if failed
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
import { bulkTagSchema } from '@/lib/validations/bulk-trip';
import { ZodError } from 'zod';

/**
 * Generates a random color for tags
 * @returns A hex color string
 */
function generateRandomColor(): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

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
      validatedData = bulkTagSchema.parse(body);
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

    const { tripIds, tagNames, tagColor } = validatedData;
    const finalColor = tagColor || generateRandomColor();

    // 3. Process each trip and add tags
    let totalTagsCreated = 0;

    const results = await Promise.all(
      tripIds.map(async (tripId) => {
        try {
          // Check if trip exists and user has edit permission
          const trip = await prisma.trip.findFirst({
            where: {
              id: tripId,
              deletedAt: null, // Exclude soft-deleted trips
              // User must be owner or editor/admin collaborator
              OR: [
                { createdBy: userId },
                {
                  collaborators: {
                    some: {
                      userId,
                      status: 'ACCEPTED',
                      role: {
                        in: ['EDITOR', 'ADMIN'],
                      },
                    },
                  },
                },
              ],
            },
            select: {
              id: true,
              name: true,
              tags: {
                select: {
                  name: true,
                },
              },
            },
          });

          // Trip not found or no permission
          if (!trip) {
            return {
              tripId,
              success: false,
              tagsAdded: 0,
              reason: 'Trip not found or insufficient permissions',
            };
          }

          // Get existing tag names for this trip
          const existingTagNames = trip.tags.map((tag) => tag.name);

          // Filter out tags that already exist
          const newTagNames = tagNames.filter(
            (name) => !existingTagNames.includes(name)
          );

          // Create new tags
          if (newTagNames.length > 0) {
            await prisma.tag.createMany({
              data: newTagNames.map((name) => ({
                tripId,
                name,
                color: finalColor,
              })),
              skipDuplicates: true, // Skip if duplicate by unique constraint
            });

            totalTagsCreated += newTagNames.length;
          }

          return {
            tripId,
            success: true,
            tagsAdded: newTagNames.length,
            tripName: trip.name,
            skipped: tagNames.length - newTagNames.length,
          };
        } catch (error) {
          console.error(`[Bulk Tag] Failed for trip ${tripId}:`, error);
          return {
            tripId,
            success: false,
            tagsAdded: 0,
            reason: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    // 4. Calculate success/failure counts
    const tagged = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // 5. Determine response status
    const allSucceeded = failed === 0;
    const allFailed = tagged === 0;
    const status = allFailed ? 207 : 200; // 207 Multi-Status if partial success

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        message: allSucceeded
          ? `Successfully tagged ${tagged} trip(s) with ${totalTagsCreated} tag(s)`
          : allFailed
          ? 'Failed to tag all trips'
          : `Tagged ${tagged} trip(s), failed ${failed}`,
        tagged,
        failed,
        tagsCreated: totalTagsCreated,
        results,
        duration: `${duration}ms`,
      },
      { status }
    );
  } catch (error) {
    console.error('[POST /api/trips/bulk/tag Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
