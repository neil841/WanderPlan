/**
 * Trip Repository Tests
 *
 * Unit tests for TripRepository class covering:
 * - Listing trips with pagination
 * - Filtering by status, search, tags, dates
 * - Row-level security (access control)
 * - Metadata calculation (counts, user role)
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { prisma } from '@/lib/db';
import { TripRepository } from '@/lib/db/repositories/trip.repository';

describe('TripRepository', () => {
  const repository = new TripRepository();

  // Test users
  let ownerId: string;
  let collaboratorId: string;
  let unauthorizedUserId: string;

  // Test trips
  let tripId1: string;
  let tripId2: string;
  let tripId3: string;

  beforeAll(async () => {
    // Create test users
    const owner = await prisma.user.create({
      data: {
        email: 'trip-owner@test.com',
        firstName: 'Owner',
        lastName: 'User',
        password: 'hashedpassword',
      },
    });
    ownerId = owner.id;

    const collaborator = await prisma.user.create({
      data: {
        email: 'trip-collab@test.com',
        firstName: 'Collaborator',
        lastName: 'User',
        password: 'hashedpassword',
      },
    });
    collaboratorId = collaborator.id;

    const unauthorized = await prisma.user.create({
      data: {
        email: 'trip-unauth@test.com',
        firstName: 'Unauthorized',
        lastName: 'User',
        password: 'hashedpassword',
      },
    });
    unauthorizedUserId = unauthorized.id;
  });

  beforeEach(async () => {
    // Create test trips
    const trip1 = await prisma.trip.create({
      data: {
        name: 'Europe Adventure',
        description: 'Summer trip to Europe',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-15'),
        destinations: ['Paris', 'Amsterdam', 'Berlin'],
        visibility: 'PRIVATE',
        createdBy: ownerId,
        isArchived: false,
      },
    });
    tripId1 = trip1.id;

    // Add tags
    await prisma.tag.createMany({
      data: [
        { name: 'europe', tripId: tripId1 },
        { name: 'backpacking', tripId: tripId1 },
      ],
    });

    // Add collaborator
    await prisma.tripCollaborator.create({
      data: {
        tripId: tripId1,
        userId: collaboratorId,
        role: 'EDITOR',
        status: 'ACCEPTED',
        invitedBy: ownerId,
      },
    });

    // Add some events
    await prisma.event.createMany({
      data: [
        {
          tripId: tripId1,
          type: 'FLIGHT',
          title: 'Flight to Paris',
          startDateTime: new Date('2025-07-01T10:00:00Z'),
          createdBy: ownerId,
        },
        {
          tripId: tripId1,
          type: 'HOTEL',
          title: 'Hotel in Paris',
          startDateTime: new Date('2025-07-01T15:00:00Z'),
          createdBy: ownerId,
        },
      ],
    });

    const trip2 = await prisma.trip.create({
      data: {
        name: 'Asia Trip',
        description: 'Exploring Asia',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-20'),
        destinations: ['Tokyo', 'Bangkok'],
        visibility: 'SHARED',
        createdBy: ownerId,
        isArchived: false,
      },
    });
    tripId2 = trip2.id;

    await prisma.tag.create({
      data: { name: 'asia', tripId: tripId2 },
    });

    const trip3 = await prisma.trip.create({
      data: {
        name: 'Archived Trip',
        description: 'Old trip',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        destinations: ['London'],
        visibility: 'PRIVATE',
        createdBy: ownerId,
        isArchived: true,
      },
    });
    tripId3 = trip3.id;
  });

  afterEach(async () => {
    // Cleanup in correct order due to foreign keys
    await prisma.event.deleteMany();
    await prisma.tripCollaborator.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.trip.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'trip-owner@test.com',
            'trip-collab@test.com',
            'trip-unauth@test.com',
          ],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('listTrips', () => {
    it('should return paginated trips for owner', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
      });

      expect(result.trips).toHaveLength(2); // Not archived trips
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should include archived trips when status=all', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
        status: 'all',
      });

      expect(result.trips).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
    });

    it('should filter only archived trips when status=archived', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
        status: 'archived',
      });

      expect(result.trips).toHaveLength(1);
      expect(result.trips[0].name).toBe('Archived Trip');
    });

    it('should filter by search query in name', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
        search: 'Europe',
      });

      expect(result.trips).toHaveLength(1);
      expect(result.trips[0].name).toBe('Europe Adventure');
    });

    it('should filter by search query in destinations', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
        search: 'Tokyo',
      });

      expect(result.trips).toHaveLength(1);
      expect(result.trips[0].name).toBe('Asia Trip');
    });

    it('should filter by tags', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
        tags: ['europe'],
      });

      expect(result.trips).toHaveLength(1);
      expect(result.trips[0].name).toBe('Europe Adventure');
      expect(result.trips[0].tags).toContain('europe');
    });

    it('should filter by start date', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
        startDate: new Date('2025-08-01'),
      });

      expect(result.trips).toHaveLength(1);
      expect(result.trips[0].name).toBe('Asia Trip');
    });

    it('should sort by startDate', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
        sort: 'startDate',
        order: 'asc',
      });

      expect(result.trips[0].name).toBe('Europe Adventure');
      expect(result.trips[1].name).toBe('Asia Trip');
    });

    it('should include metadata (counts)', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 10,
      });

      const europeTrip = result.trips.find((t) => t.name === 'Europe Adventure');
      expect(europeTrip).toBeDefined();
      expect(europeTrip!.collaboratorCount).toBe(1);
      expect(europeTrip!.eventCount).toBe(2);
      expect(europeTrip!.userRole).toBe('owner');
      expect(europeTrip!.ownerName).toBe('Owner User');
    });

    it('should return trips where user is collaborator', async () => {
      const result = await repository.listTrips({
        userId: collaboratorId,
        page: 1,
        limit: 10,
      });

      expect(result.trips).toHaveLength(1);
      expect(result.trips[0].name).toBe('Europe Adventure');
      expect(result.trips[0].userRole).toBe('editor');
    });

    it('should not return trips user has no access to', async () => {
      const result = await repository.listTrips({
        userId: unauthorizedUserId,
        page: 1,
        limit: 10,
      });

      expect(result.trips).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      const page1 = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 1,
      });

      expect(page1.trips).toHaveLength(1);
      expect(page1.pagination.hasNext).toBe(true);
      expect(page1.pagination.hasPrevious).toBe(false);

      const page2 = await repository.listTrips({
        userId: ownerId,
        page: 2,
        limit: 1,
      });

      expect(page2.trips).toHaveLength(1);
      expect(page2.pagination.hasNext).toBe(false);
      expect(page2.pagination.hasPrevious).toBe(true);
    });

    it('should enforce max limit of 100', async () => {
      const result = await repository.listTrips({
        userId: ownerId,
        page: 1,
        limit: 200, // Exceeds max
      });

      expect(result.pagination.limit).toBe(100);
    });
  });

  describe('getTripById', () => {
    it('should return trip by ID for owner', async () => {
      const trip = await repository.getTripById(tripId1, ownerId);

      expect(trip).not.toBeNull();
      expect(trip!.id).toBe(tripId1);
      expect(trip!.name).toBe('Europe Adventure');
      expect(trip!.userRole).toBe('owner');
    });

    it('should return trip for collaborator', async () => {
      const trip = await repository.getTripById(tripId1, collaboratorId);

      expect(trip).not.toBeNull();
      expect(trip!.userRole).toBe('editor');
    });

    it('should return null for unauthorized user', async () => {
      const trip = await repository.getTripById(tripId1, unauthorizedUserId);

      expect(trip).toBeNull();
    });

    it('should include metadata', async () => {
      const trip = await repository.getTripById(tripId1, ownerId);

      expect(trip!.collaboratorCount).toBe(1);
      expect(trip!.eventCount).toBe(2);
      expect(trip!.tags).toEqual(expect.arrayContaining(['europe', 'backpacking']));
    });
  });

  describe('hasAccess', () => {
    it('should return true for owner', async () => {
      const hasAccess = await repository.hasAccess(tripId1, ownerId);

      expect(hasAccess).toBe(true);
    });

    it('should return true for collaborator', async () => {
      const hasAccess = await repository.hasAccess(tripId1, collaboratorId);

      expect(hasAccess).toBe(true);
    });

    it('should return false for unauthorized user', async () => {
      const hasAccess = await repository.hasAccess(tripId1, unauthorizedUserId);

      expect(hasAccess).toBe(false);
    });

    it('should return false for non-existent trip', async () => {
      const hasAccess = await repository.hasAccess('non-existent-id', ownerId);

      expect(hasAccess).toBe(false);
    });
  });
});
