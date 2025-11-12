/**
 * Trip Repository
 *
 * Handles database operations for Trip model with filtering, pagination, and search.
 * Implements row-level security to ensure users only access their own trips or trips they collaborate on.
 *
 * @module TripRepository
 */

import prisma from '@/lib/db/prisma';
import { Prisma, TripVisibility } from '@prisma/client';

/**
 * Query parameters for listing trips
 */
export interface TripListParams {
  userId: string;
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'startDate' | 'endDate' | 'name';
  order?: 'asc' | 'desc';
  status?: 'active' | 'archived' | 'all';
  search?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
}

/**
 * Paginated trip list response
 */
export interface PaginatedTrips {
  trips: TripWithMetadata[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Trip with additional metadata (counts, user role)
 */
export interface TripWithMetadata {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  destinations: string[];
  visibility: TripVisibility;
  coverImageUrl: string | null;
  isArchived: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Metadata
  creator: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  ownerName: string;
  collaboratorCount: number;
  eventCount: number;
  userRole: 'owner' | 'admin' | 'editor' | 'viewer';
  tags: string[];
}

export class TripRepository {
  /**
   * Lists trips accessible to a user with filtering, pagination, and search
   *
   * @param params - Query parameters
   * @returns Paginated list of trips with metadata
   *
   * @example
   * const result = await tripRepo.listTrips({
   *   userId: 'user-123',
   *   page: 1,
   *   limit: 20,
   *   status: 'active',
   *   search: 'europe'
   * });
   */
  async listTrips(params: TripListParams): Promise<PaginatedTrips> {
    const {
      userId,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      status = 'active',
      search,
      tags,
      startDate,
      endDate,
    } = params;

    // Validate pagination params
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100); // Max 100 per page
    const skip = (safePage - 1) * safeLimit;

    // Build where clause
    const where: Prisma.TripWhereInput = {
      AND: [
        // Exclude soft-deleted trips
        { deletedAt: null },
        // Row-level security: user's own trips OR trips they collaborate on
        {
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
        // Status filter
        status === 'active' ? { isArchived: false } :
        status === 'archived' ? { isArchived: true } : {},
        // Search filter
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { destinations: { hasSome: [search] } },
              ],
            }
          : {},
        // Tag filter
        tags && tags.length > 0
          ? {
              tags: {
                some: {
                  name: {
                    in: tags,
                  },
                },
              },
            }
          : {},
        // Date range filters
        startDate ? { startDate: { gte: startDate } } : {},
        endDate ? { endDate: { lte: endDate } } : {},
      ],
    };

    // Build orderBy
    const orderBy: Prisma.TripOrderByWithRelationInput = {
      [sort]: order,
    };

    // Execute query with metadata
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          destinations: true,
          visibility: true,
          coverImageUrl: true,
          isArchived: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          collaborators: {
            where: { status: 'ACCEPTED' },
            select: {
              id: true,
            },
          },
          events: {
            select: {
              id: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    // Transform to include metadata
    const tripsWithMetadata: TripWithMetadata[] = trips.map((trip) => {
      const isOwner = trip.createdBy === userId;
      const userCollaboration = isOwner
        ? null
        : trip.collaborators.find((c: any) => c.userId === userId);

      return {
        id: trip.id,
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        destinations: trip.destinations,
        visibility: trip.visibility,
        coverImageUrl: trip.coverImageUrl,
        isArchived: trip.isArchived,
        createdBy: trip.createdBy,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        creator: {
          name: `${trip.creator.firstName} ${trip.creator.lastName}`,
          email: trip.creator.email,
          avatarUrl: trip.creator.avatarUrl,
        },
        ownerName: `${trip.creator.firstName} ${trip.creator.lastName}`,
        collaboratorCount: trip.collaborators.length,
        eventCount: trip.events.length,
        userRole: isOwner
          ? 'owner'
          : userCollaboration?.role?.toLowerCase() || 'viewer',
        tags: trip.tags.map((t: any) => t.name),
      } as TripWithMetadata;
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / safeLimit);

    return {
      trips: tripsWithMetadata,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrevious: safePage > 1,
      },
    };
  }

  /**
   * Gets a single trip by ID with access control
   *
   * @param tripId - Trip ID
   * @param userId - Current user ID
   * @returns Trip with metadata or null if not found/no access
   */
  async getTripById(
    tripId: string,
    userId: string
  ): Promise<TripWithMetadata | null> {
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
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
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        destinations: true,
        visibility: true,
        coverImageUrl: true,
        isArchived: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        collaborators: {
          where: { status: 'ACCEPTED' },
          select: {
            id: true,
            userId: true,
            role: true,
          },
        },
        events: {
          select: {
            id: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!trip) {
      return null;
    }

    const isOwner = trip.createdBy === userId;
    const userCollaboration = isOwner
      ? null
      : trip.collaborators.find((c) => c.userId === userId);

    return {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      destinations: trip.destinations,
      visibility: trip.visibility,
      coverImageUrl: trip.coverImageUrl,
      isArchived: trip.isArchived,
      createdBy: trip.createdBy,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      ownerName: `${trip.creator.firstName} ${trip.creator.lastName}`,
      collaboratorCount: trip.collaborators.length,
      eventCount: trip.events.length,
      userRole: isOwner
        ? 'owner'
        : (userCollaboration?.role?.toLowerCase() as any) || 'viewer',
      tags: trip.tags.map((t) => t.name),
    };
  }

  /**
   * Checks if a user has access to a trip
   *
   * @param tripId - Trip ID
   * @param userId - User ID
   * @returns True if user has access
   */
  async hasAccess(tripId: string, userId: string): Promise<boolean> {
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
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

    return trip !== null;
  }
}

/**
 * Singleton instance
 */
export const tripRepository = new TripRepository();
