/**
 * Integration Tests: Trip Management APIs
 *
 * Tests CRUD operations for trips
 */

import { NextRequest } from 'next/server';
import {
  GET as listTripsHandler,
  POST as createTripHandler,
} from '@/app/api/trips/route';
import {
  GET as getTripHandler,
  PUT as updateTripHandler,
  DELETE as deleteTripHandler,
} from '@/app/api/trips/[tripId]/route';
import { prisma } from '@/lib/db';
import * as auth from '@/lib/auth/session';

// Mock authentication
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    trip: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Trip Management APIs - Integration Tests', () => {
  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
  };

  const mockTrips = [
    {
      id: 'trip_1',
      userId: 'user_123',
      name: 'Paris Trip',
      description: 'Summer vacation in Paris',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-10'),
      destination: 'Paris, France',
      status: 'UPCOMING',
      isArchived: false,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 'trip_2',
      userId: 'user_123',
      name: 'Tokyo Trip',
      description: 'Cherry blossom season',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-04-10'),
      destination: 'Tokyo, Japan',
      status: 'UPCOMING',
      isArchived: false,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (prisma.trip.findMany as jest.Mock).mockResolvedValue(mockTrips);
    (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrips[0]);
  });

  describe('GET /api/trips - List Trips', () => {
    describe('✅ Happy Path', () => {
      it('should return all trips for authenticated user', async () => {
        const request = new Request('http://localhost:3000/api/trips', {
          method: 'GET',
        });

        const response = await listTripsHandler(request as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toHaveLength(2);
        expect(json[0].name).toBe('Paris Trip');
        expect(json[1].name).toBe('Tokyo Trip');
      });

      it('should filter trips by status', async () => {
        const request = new Request(
          'http://localhost:3000/api/trips?status=UPCOMING',
          {
            method: 'GET',
          }
        );

        await listTripsHandler(request as NextRequest);

        expect(prisma.trip.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: 'UPCOMING',
            }),
          })
        );
      });

      it('should exclude archived trips by default', async () => {
        const request = new Request('http://localhost:3000/api/trips', {
          method: 'GET',
        });

        await listTripsHandler(request as NextRequest);

        expect(prisma.trip.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              isArchived: false,
            }),
          })
        );
      });
    });

    describe('🔒 Authorization', () => {
      it('should return 401 for unauthenticated users', async () => {
        (auth.getCurrentUser as jest.Mock).mockResolvedValue(null);

        const request = new Request('http://localhost:3000/api/trips', {
          method: 'GET',
        });

        const response = await listTripsHandler(request as NextRequest);

        expect(response.status).toBe(401);
      });

      it('should only return trips owned by the user', async () => {
        const request = new Request('http://localhost:3000/api/trips', {
          method: 'GET',
        });

        await listTripsHandler(request as NextRequest);

        expect(prisma.trip.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              userId: 'user_123',
            }),
          })
        );
      });
    });

    describe('🚧 Edge Cases', () => {
      it('should return empty array when user has no trips', async () => {
        (prisma.trip.findMany as jest.Mock).mockResolvedValue([]);

        const request = new Request('http://localhost:3000/api/trips', {
          method: 'GET',
        });

        const response = await listTripsHandler(request as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual([]);
      });
    });
  });

  describe('POST /api/trips - Create Trip', () => {
    const validTripData = {
      name: 'New Trip',
      description: 'A new adventure',
      startDate: '2025-07-01',
      endDate: '2025-07-10',
      destination: 'Barcelona, Spain',
    };

    describe('✅ Happy Path', () => {
      it('should create trip with valid data', async () => {
        (prisma.trip.create as jest.Mock).mockResolvedValue({
          id: 'trip_new',
          ...validTripData,
          userId: 'user_123',
          status: 'UPCOMING',
        });

        const request = new Request('http://localhost:3000/api/trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validTripData),
        });

        const response = await createTripHandler(request as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json.name).toBe('New Trip');
        expect(prisma.trip.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: 'user_123',
              name: 'New Trip',
            }),
          })
        );
      });
    });

    describe('📋 Input Validation', () => {
      it('should reject request with missing name', async () => {
        const request = new Request('http://localhost:3000/api/trips', {
          method: 'POST',
          body: JSON.stringify({
            ...validTripData,
            name: undefined,
          }),
        });

        const response = await createTripHandler(request as NextRequest);

        expect(response.status).toBe(400);
      });

      it('should reject request with invalid date range', async () => {
        const request = new Request('http://localhost:3000/api/trips', {
          method: 'POST',
          body: JSON.stringify({
            ...validTripData,
            startDate: '2025-07-10',
            endDate: '2025-07-01', // End before start
          }),
        });

        const response = await createTripHandler(request as NextRequest);

        expect(response.status).toBe(400);
      });

      it('should reject request with very long name', async () => {
        const request = new Request('http://localhost:3000/api/trips', {
          method: 'POST',
          body: JSON.stringify({
            ...validTripData,
            name: 'a'.repeat(300), // Too long
          }),
        });

        const response = await createTripHandler(request as NextRequest);

        expect(response.status).toBe(400);
      });
    });

    describe('🔒 Authorization', () => {
      it('should return 401 for unauthenticated users', async () => {
        (auth.getCurrentUser as jest.Mock).mockResolvedValue(null);

        const request = new Request('http://localhost:3000/api/trips', {
          method: 'POST',
          body: JSON.stringify(validTripData),
        });

        const response = await createTripHandler(request as NextRequest);

        expect(response.status).toBe(401);
        expect(prisma.trip.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('GET /api/trips/[tripId] - Get Single Trip', () => {
    describe('✅ Happy Path', () => {
      it('should return trip details for owner', async () => {
        const request = new Request(
          'http://localhost:3000/api/trips/trip_1',
          {
            method: 'GET',
          }
        );

        const response = await getTripHandler(request as NextRequest, {
          params: { tripId: 'trip_1' },
        });
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.id).toBe('trip_1');
        expect(json.name).toBe('Paris Trip');
      });
    });

    describe('🔒 Authorization', () => {
      it('should return 401 for unauthenticated users', async () => {
        (auth.getCurrentUser as jest.Mock).mockResolvedValue(null);

        const request = new Request(
          'http://localhost:3000/api/trips/trip_1',
          {
            method: 'GET',
          }
        );

        const response = await getTripHandler(request as NextRequest, {
          params: { tripId: 'trip_1' },
        });

        expect(response.status).toBe(401);
      });

      it('should return 403 for unauthorized users', async () => {
        (auth.getCurrentUser as jest.Mock).mockResolvedValue({
          id: 'other_user',
          email: 'other@example.com',
        });

        const request = new Request(
          'http://localhost:3000/api/trips/trip_1',
          {
            method: 'GET',
          }
        );

        const response = await getTripHandler(request as NextRequest, {
          params: { tripId: 'trip_1' },
        });

        expect(response.status).toBe(403);
      });
    });

    describe('🚧 Edge Cases', () => {
      it('should return 404 for non-existent trip', async () => {
        (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

        const request = new Request(
          'http://localhost:3000/api/trips/nonexistent',
          {
            method: 'GET',
          }
        );

        const response = await getTripHandler(request as NextRequest, {
          params: { tripId: 'nonexistent' },
        });

        expect(response.status).toBe(404);
      });
    });
  });

  describe('PUT /api/trips/[tripId] - Update Trip', () => {
    const updateData = {
      name: 'Updated Paris Trip',
      description: 'Updated description',
    };

    describe('✅ Happy Path', () => {
      it('should update trip for owner', async () => {
        (prisma.trip.update as jest.Mock).mockResolvedValue({
          ...mockTrips[0],
          ...updateData,
        });

        const request = new Request(
          'http://localhost:3000/api/trips/trip_1',
          {
            method: 'PUT',
            body: JSON.stringify(updateData),
          }
        );

        const response = await updateTripHandler(request as NextRequest, {
          params: { tripId: 'trip_1' },
        });
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.name).toBe('Updated Paris Trip');
        expect(prisma.trip.update).toHaveBeenCalled();
      });
    });

    describe('🔒 Authorization', () => {
      it('should return 403 for unauthorized users', async () => {
        (auth.getCurrentUser as jest.Mock).mockResolvedValue({
          id: 'other_user',
          email: 'other@example.com',
        });

        const request = new Request(
          'http://localhost:3000/api/trips/trip_1',
          {
            method: 'PUT',
            body: JSON.stringify(updateData),
          }
        );

        const response = await updateTripHandler(request as NextRequest, {
          params: { tripId: 'trip_1' },
        });

        expect(response.status).toBe(403);
        expect(prisma.trip.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('DELETE /api/trips/[tripId] - Delete Trip', () => {
    describe('✅ Happy Path', () => {
      it('should delete trip for owner', async () => {
        (prisma.trip.delete as jest.Mock).mockResolvedValue(mockTrips[0]);

        const request = new Request(
          'http://localhost:3000/api/trips/trip_1',
          {
            method: 'DELETE',
          }
        );

        const response = await deleteTripHandler(request as NextRequest, {
          params: { tripId: 'trip_1' },
        });

        expect(response.status).toBe(204);
        expect(prisma.trip.delete).toHaveBeenCalledWith({
          where: { id: 'trip_1' },
        });
      });
    });

    describe('🔒 Authorization', () => {
      it('should return 403 for unauthorized users', async () => {
        (auth.getCurrentUser as jest.Mock).mockResolvedValue({
          id: 'other_user',
          email: 'other@example.com',
        });

        const request = new Request(
          'http://localhost:3000/api/trips/trip_1',
          {
            method: 'DELETE',
          }
        );

        const response = await deleteTripHandler(request as NextRequest, {
          params: { tripId: 'trip_1' },
        });

        expect(response.status).toBe(403);
        expect(prisma.trip.delete).not.toHaveBeenCalled();
      });
    });
  });

  describe('⚠️ Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (prisma.trip.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new Request('http://localhost:3000/api/trips', {
        method: 'GET',
      });

      const response = await listTripsHandler(request as NextRequest);

      expect(response.status).toBe(500);
    });
  });
});
