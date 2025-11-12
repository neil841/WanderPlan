/**
 * Tests for DELETE /api/trips/[tripId]
 *
 * Tests trip deletion with soft delete, permission checks, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { DELETE } from '@/app/api/trips/[tripId]/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';

// Mock NextAuth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('DELETE /api/trips/[tripId]', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    // Mock authenticated user by default
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.event.deleteMany({});
    await prisma.tripCollaborator.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.user.deleteMany({});

    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/trips/trip-123', {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: 'trip-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should return 401 if session has no user ID', async () => {
      mockAuth.mockResolvedValue({
        user: { email: 'test@example.com', name: 'Test' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const req = new NextRequest('http://localhost/api/trips/trip-123', {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: 'trip-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for invalid trip ID', async () => {
      const req = new NextRequest('http://localhost/api/trips/', {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid trip ID');
    });
  });

  describe('Permission Checks', () => {
    it('should return 404 if trip does not exist', async () => {
      const req = new NextRequest('http://localhost/api/trips/nonexistent', {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Trip not found');
    });

    it('should return 403 if user is not the trip owner', async () => {
      // Create owner and collaborator users
      const owner = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const collaborator = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'collab@example.com',
          firstName: 'Collaborator',
          lastName: 'User',
          password: 'hashed',
        },
      });

      // Create trip owned by owner, with collaborator as ADMIN
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip',
          createdBy: owner.id,
          collaborators: {
            create: {
              userId: collaborator.id,
              role: 'ADMIN',
              status: 'ACCEPTED',
              invitedBy: owner.id,
            },
          },
        },
      });

      // Try to delete as collaborator (even though admin)
      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`, {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Only the trip owner can delete');
    });

    it('should allow owner to delete their trip', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'My Trip',
          createdBy: user.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`, {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('Trip deleted successfully');
      expect(data.tripId).toBe(trip.id);
      expect(data.tripName).toBe('My Trip');
    });
  });

  describe('Soft Delete Behavior', () => {
    it('should set deletedAt timestamp instead of removing trip', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'My Trip',
          createdBy: user.id,
        },
      });

      // Delete the trip
      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`, {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: trip.id } });

      expect(response.status).toBe(200);

      // Verify trip still exists in database with deletedAt set
      const deletedTrip = await prisma.trip.findUnique({
        where: { id: trip.id },
      });

      expect(deletedTrip).not.toBeNull();
      expect(deletedTrip!.deletedAt).not.toBeNull();
      expect(deletedTrip!.deletedAt).toBeInstanceOf(Date);
    });

    it('should preserve all related data (events, collaborators, etc.)', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const collaborator = await prisma.user.create({
        data: {
          email: 'collab@example.com',
          firstName: 'Collab',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'My Trip',
          createdBy: user.id,
          events: {
            create: [
              {
                type: 'FLIGHT',
                name: 'Flight',
                date: new Date('2025-12-01'),
                order: 0,
                createdBy: user.id,
              },
            ],
          },
          collaborators: {
            create: {
              userId: collaborator.id,
              role: 'EDITOR',
              status: 'ACCEPTED',
              invitedBy: user.id,
            },
          },
          tags: {
            create: [
              {
                name: 'Europe',
                color: '#3b82f6',
                userId: user.id,
              },
            ],
          },
        },
      });

      // Delete the trip
      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`, {
        method: 'DELETE',
      });
      await DELETE(req, { params: { tripId: trip.id } });

      // Verify related data still exists
      const events = await prisma.event.findMany({
        where: { tripId: trip.id },
      });
      expect(events).toHaveLength(1);

      const collaborators = await prisma.tripCollaborator.findMany({
        where: { tripId: trip.id },
      });
      expect(collaborators).toHaveLength(1);

      const tags = await prisma.tag.findMany({
        where: { tripId: trip.id },
      });
      expect(tags).toHaveLength(1);
    });

    it('should return 410 if trip is already deleted', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      // Create trip with deletedAt already set
      const trip = await prisma.trip.create({
        data: {
          name: 'Deleted Trip',
          createdBy: user.id,
          deletedAt: new Date(),
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`, {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(410);
      expect(data.error).toContain('already been deleted');
    });
  });

  describe('Integration with Other APIs', () => {
    it('should exclude soft-deleted trips from GET /api/trips/[tripId]', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'My Trip',
          createdBy: user.id,
        },
      });

      // Delete the trip
      const deleteReq = new NextRequest(`http://localhost/api/trips/${trip.id}`, {
        method: 'DELETE',
      });
      await DELETE(deleteReq, { params: { tripId: trip.id } });

      // Try to fetch deleted trip
      const { GET } = await import('@/app/api/trips/[tripId]/route');
      const getReq = new NextRequest(`http://localhost/api/trips/${trip.id}`);
      const response = await GET(getReq, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Trip not found');
    });

    it('should exclude soft-deleted trips from trip list', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      // Create two trips
      await prisma.trip.create({
        data: {
          name: 'Active Trip',
          createdBy: user.id,
        },
      });

      const trip2 = await prisma.trip.create({
        data: {
          name: 'To Be Deleted',
          createdBy: user.id,
        },
      });

      // Delete trip2
      const deleteReq = new NextRequest(`http://localhost/api/trips/${trip2.id}`, {
        method: 'DELETE',
      });
      await DELETE(deleteReq, { params: { tripId: trip2.id } });

      // Fetch trip list
      const { tripRepository } = await import('@/lib/db/repositories/trip.repository');
      const result = await tripRepository.listTrips({
        userId: user.id,
        status: 'all',
      });

      // Should only return the active trip
      expect(result.trips).toHaveLength(1);
      expect(result.trips[0].name).toBe('Active Trip');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip',
          createdBy: user.id,
        },
      });

      // Mock prisma to throw error on update
      jest.spyOn(prisma.trip, 'update').mockRejectedValue(
        new Error('Database connection failed')
      );

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`, {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Internal server error');
    });
  });
});
