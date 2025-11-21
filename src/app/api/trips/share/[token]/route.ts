/**
 * Public Trip Share API Route
 *
 * @route GET /api/trips/share/[token]
 * @access Public - No authentication required
 *
 * GET: Retrieves trip details using a share token
 * - Validates share token exists and is active
 * - Checks token has not expired
 * - Returns read-only trip data
 * - No sensitive information (collaborator emails, expenses, documents)
 *
 * @throws {404} - Not Found (invalid or expired token)
 * @throws {410} - Gone (token has been revoked)
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/trips/share/[token]
 *
 * Public endpoint to access trip via share token
 * Returns read-only trip data without sensitive information
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // 1. Validate token parameter
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid share token' },
        { status: 400 }
      );
    }

    // 2. Find share token
    const shareToken = await prisma.tripShareToken.findUnique({
      where: {
        token,
      },
      include: {
        trip: {
          include: {
            // Creator info (limited)
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                // No email for public access
              },
            },

            // Events ordered by date
            events: {
              orderBy: [
                { startDateTime: 'asc' },
                { order: 'asc' },
              ],
              include: {
                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },

            // Tags
            tags: {
              orderBy: {
                name: 'asc',
              },
            },

            // Budget (without detailed expenses)
            budget: true,
          },
        },
      },
    });

    // 3. Check if token exists
    if (!shareToken) {
      return NextResponse.json(
        {
          error: 'Share link not found',
          message: 'This share link is invalid or has been removed.',
        },
        { status: 404 }
      );
    }

    // 4. Check if token has been revoked
    if (!shareToken.isActive || shareToken.revokedAt) {
      return NextResponse.json(
        {
          error: 'Share link revoked',
          message: 'This share link has been revoked by the trip owner.',
        },
        { status: 410 } // 410 Gone
      );
    }

    // 5. Check if token has expired
    const now = new Date();
    if (shareToken.expiresAt < now) {
      return NextResponse.json(
        {
          error: 'Share link expired',
          message: 'This share link has expired.',
          expiresAt: shareToken.expiresAt,
        },
        { status: 410 } // 410 Gone
      );
    }

    // 6. Check if trip has been deleted
    if (shareToken.trip.deletedAt) {
      return NextResponse.json(
        {
          error: 'Trip not available',
          message: 'This trip is no longer available.',
        },
        { status: 404 }
      );
    }

    // 7. Build public trip response (read-only, no sensitive data)
    const trip = shareToken.trip;

    const response = {
      // Trip metadata
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      destinations: trip.destinations,
      coverImageUrl: trip.coverImageUrl,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,

      // Creator (limited info, no email)
      creator: {
        id: trip.creator.id,
        name: `${trip.creator.firstName} ${trip.creator.lastName}`,
        avatarUrl: trip.creator.avatarUrl,
      },

      // Events with full details
      events: trip.events.map((event) => ({
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        location: event.location,
        notes: event.notes,
        confirmationNumber: event.confirmationNumber,
        cost: event.cost
          ? {
              amount: event.cost,
              currency: event.currency,
            }
          : null,
        creator: event.creator
          ? {
              id: event.creator.id,
              name: `${event.creator.firstName} ${event.creator.lastName}`,
              avatarUrl: event.creator.avatarUrl,
            }
          : null,
      })),

      // Budget summary (no detailed expense tracking for public)
      budget: trip.budget
        ? {
            totalBudget: trip.budget.totalBudget,
            currency: trip.budget.currency,
            // Category budgets shown, but not individual expenses
            categoryBudgets: trip.budget.categoryBudgets,
          }
        : null,

      // Tags
      tags: trip.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),

      // Quick stats
      stats: {
        eventCount: trip.events.length,
        tagCount: trip.tags.length,
        duration: trip.startDate && trip.endDate
          ? Math.ceil(
              (trip.endDate.getTime() - trip.startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      },

      // Share token info
      shareInfo: {
        permissions: shareToken.permissions,
        expiresAt: shareToken.expiresAt,
        isReadOnly: true, // Always read-only for public access
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/trips/share/[token] Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
