/**
 * Tests for PATCH /api/trips/[tripId]
 * Trip Update API with permission checks and partial updates
 */

import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/trips/[tripId]/route';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

// Mock dependencies
jest.mock('@/lib/auth/auth-options');
jest.mock('@/lib/db/prisma', () => ({
  __esModule: true,
  default: {
    trip: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tag: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('PATCH /api/trips/[tripId]', () => {
  const mockUserId = 'user-123';
  const mockTripId = 'trip-456';
  const mockSession = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockExistingTrip = {
    id: mockTripId,
    name: 'Original Trip',
    description: 'Original description',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-10'),
    destinations: ['Paris', 'London'],
    visibility: 'PRIVATE' as const,
    coverImageUrl: null,
    isArchived: false,
    createdBy: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    collaborators: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(mockSession);
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Trip' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized - Please log in');
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid trip ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/trips/', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Trip' }),
      });

      const response = await PATCH(request, { params: { tripId: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid trip ID');
    });

    it('should return 400 for invalid request body', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(mockExistingTrip);

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({
          name: '', // Invalid: empty name
        }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should return 400 if endDate is before startDate', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(mockExistingTrip);

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({
          startDate: '2024-06-10',
          endDate: '2024-06-01', // Before start date
        }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('Permissions', () => {
    it('should return 404 if trip does not exist', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Trip' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trip not found');
    });

    it('should return 403 if user is not owner and not admin collaborator', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        ...mockExistingTrip,
        createdBy: 'different-user-id',
        collaborators: [
          {
            id: 'collab-1',
            role: 'VIEWER',
          },
        ],
      } as any);

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Trip' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should allow owner to update trip', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(mockExistingTrip);

      const updatedTrip = {
        ...mockExistingTrip,
        name: 'Updated Trip Name',
        creator: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue(updatedTrip),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Trip Name' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Trip updated successfully');
      expect(data.trip.name).toBe('Updated Trip Name');
    });

    it('should allow admin collaborator to update trip', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        ...mockExistingTrip,
        createdBy: 'different-user-id',
        collaborators: [
          {
            id: 'collab-1',
            role: 'ADMIN',
          },
        ],
      } as any);

      const updatedTrip = {
        ...mockExistingTrip,
        name: 'Updated Trip Name',
        createdBy: 'different-user-id',
        creator: {
          id: 'different-user-id',
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue(updatedTrip),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Trip Name' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });

      expect(response.status).toBe(200);
    });
  });

  describe('Partial Updates', () => {
    beforeEach(() => {
      mockPrisma.trip.findUnique.mockResolvedValue(mockExistingTrip);
    });

    it('should update only trip name', async () => {
      const updatedTrip = {
        ...mockExistingTrip,
        name: 'New Trip Name',
        creator: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue(updatedTrip),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Trip Name' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trip.name).toBe('New Trip Name');
    });

    it('should update trip dates', async () => {
      const updatedTrip = {
        ...mockExistingTrip,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-15'),
        creator: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue(updatedTrip),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({
          startDate: '2024-07-01',
          endDate: '2024-07-15',
        }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trip.startDate).toBeDefined();
      expect(data.trip.endDate).toBeDefined();
    });

    it('should update cover image', async () => {
      const updatedTrip = {
        ...mockExistingTrip,
        coverImageUrl: 'https://example.com/new-image.jpg',
        creator: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue(updatedTrip),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({
          coverImageUrl: 'https://example.com/new-image.jpg',
        }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trip.coverImageUrl).toBe('https://example.com/new-image.jpg');
    });

    it('should update visibility', async () => {
      const updatedTrip = {
        ...mockExistingTrip,
        visibility: 'PUBLIC' as const,
        creator: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue(updatedTrip),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ visibility: 'public' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trip.visibility).toBe('PUBLIC');
    });

    it('should archive trip', async () => {
      const updatedTrip = {
        ...mockExistingTrip,
        isArchived: true,
        creator: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue(updatedTrip),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ isArchived: true }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trip.isArchived).toBe(true);
    });
  });

  describe('Tag Updates', () => {
    beforeEach(() => {
      mockPrisma.trip.findUnique.mockResolvedValue(mockExistingTrip);
    });

    it('should update trip tags', async () => {
      const updatedTrip = {
        ...mockExistingTrip,
        creator: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [
          { id: 'tag-1', name: 'beach', color: '#3B82F6', createdAt: new Date() },
          { id: 'tag-2', name: 'adventure', color: '#10B981', createdAt: new Date() },
        ],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue({
              ...mockExistingTrip,
              creator: updatedTrip.creator,
              collaborators: [],
              tags: [],
            }),
            findUnique: jest.fn().mockResolvedValue(updatedTrip),
          },
          tag: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({
          tags: ['beach', 'adventure'],
        }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trip.tags).toHaveLength(2);
      expect(data.trip.tags[0].name).toBe('beach');
      expect(data.trip.tags[1].name).toBe('adventure');
    });

    it('should clear tags when empty array provided', async () => {
      const updatedTrip = {
        ...mockExistingTrip,
        creator: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
        collaborators: [],
        tags: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          trip: {
            update: jest.fn().mockResolvedValue(updatedTrip),
            findUnique: jest.fn().mockResolvedValue(updatedTrip),
          },
          tag: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        });
      });

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ tags: [] }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trip.tags).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.trip.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Trip' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle transaction errors', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(mockExistingTrip);
      mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      const request = new NextRequest('http://localhost:3000/api/trips/trip-456', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Trip' }),
      });

      const response = await PATCH(request, { params: { tripId: mockTripId } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
