/**
 * Tests for GET /api/trips/[tripId]
 *
 * Tests trip details retrieval with access control, relations, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GET } from '@/app/api/trips/[tripId]/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';

// Mock NextAuth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('GET /api/trips/[tripId]', () => {
  const mockUserId = 'user-123';
  const mockTripId = 'trip-456';
  const otherUserId = 'user-789';

  beforeEach(() => {
    // Mock authenticated user by default
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);
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

      const req = new NextRequest('http://localhost/api/trips/trip-123');
      const response = await GET(req, { params: { tripId: 'trip-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should return 401 if session has no user ID', async () => {
      mockAuth.mockResolvedValue({
        user: { email: 'test@example.com', name: 'Test' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as any);

      const req = new NextRequest('http://localhost/api/trips/trip-123');
      const response = await GET(req, { params: { tripId: 'trip-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for invalid trip ID', async () => {
      const req = new NextRequest('http://localhost/api/trips/');
      const response = await GET(req, { params: { tripId: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid trip ID');
    });
  });

  describe('Access Control', () => {
    it('should return 404 if trip does not exist', async () => {
      const req = new NextRequest('http://localhost/api/trips/nonexistent');
      const response = await GET(req, { params: { tripId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Trip not found');
    });

    it('should return 403 if user does not have access to trip', async () => {
      // Create user and trip owned by another user
      const owner = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'Private Trip',
          createdBy: owner.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`);
      const response = await GET(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should allow access to trip owner', async () => {
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

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`);
      const response = await GET(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(trip.id);
      expect(data.userRole).toBe('owner');
    });

    it('should allow access to accepted collaborators', async () => {
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

      const trip = await prisma.trip.create({
        data: {
          name: 'Shared Trip',
          createdBy: owner.id,
          collaborators: {
            create: {
              userId: collaborator.id,
              role: 'EDITOR',
              status: 'ACCEPTED',
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`);
      const response = await GET(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(trip.id);
      expect(data.userRole).toBe('EDITOR');
    });

    it('should not allow access to pending collaborators', async () => {
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

      const trip = await prisma.trip.create({
        data: {
          name: 'Shared Trip',
          createdBy: owner.id,
          collaborators: {
            create: {
              userId: collaborator.id,
              role: 'EDITOR',
              status: 'PENDING',
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`);
      const response = await GET(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });
  });

  describe('Trip Data Retrieval', () => {
    it('should return complete trip with all relations', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const collaboratorUser = await prisma.user.create({
        data: {
          email: 'collab@example.com',
          firstName: 'Collab',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip',
          description: 'A test trip',
          startDate: new Date('2025-12-01'),
          endDate: new Date('2025-12-10'),
          destinations: ['Paris', 'London'],
          createdBy: user.id,
          budget: {
            create: {
              totalBudget: 5000,
              currency: 'USD',
              accommodationBudget: 2000,
              transportationBudget: 1000,
              foodBudget: 1000,
              activitiesBudget: 800,
              otherBudget: 200,
            },
          },
          tags: {
            create: [
              { name: 'Europe', color: '#3b82f6', userId: user.id },
              { name: 'Adventure', color: '#10b981', userId: user.id },
            ],
          },
          events: {
            create: [
              {
                type: 'FLIGHT',
                name: 'Flight to Paris',
                date: new Date('2025-12-01'),
                order: 0,
                createdBy: user.id,
              },
              {
                type: 'HOTEL',
                name: 'Paris Hotel',
                date: new Date('2025-12-01'),
                order: 1,
                createdBy: user.id,
              },
            ],
          },
          collaborators: {
            create: {
              userId: collaboratorUser.id,
              role: 'EDITOR',
              status: 'ACCEPTED',
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`);
      const response = await GET(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);

      // Trip metadata
      expect(data.id).toBe(trip.id);
      expect(data.name).toBe('Test Trip');
      expect(data.description).toBe('A test trip');
      expect(data.destinations).toEqual(['Paris', 'London']);

      // Creator
      expect(data.creator.name).toBe('Test User');
      expect(data.creator.email).toBe('test@example.com');

      // Events
      expect(data.events).toHaveLength(2);
      expect(data.events[0].name).toBe('Flight to Paris');
      expect(data.events[0].type).toBe('FLIGHT');
      expect(data.events[1].name).toBe('Paris Hotel');

      // Collaborators
      expect(data.collaborators).toHaveLength(1);
      expect(data.collaborators[0].user.name).toBe('Collab User');
      expect(data.collaborators[0].role).toBe('EDITOR');

      // Budget
      expect(data.budget).toBeDefined();
      expect(data.budget.totalBudget).toBe(5000);
      expect(data.budget.currency).toBe('USD');

      // Tags
      expect(data.tags).toHaveLength(2);
      expect(data.tags.map((t: any) => t.name)).toContain('Europe');
      expect(data.tags.map((t: any) => t.name)).toContain('Adventure');

      // Stats
      expect(data.stats.eventCount).toBe(2);
      expect(data.stats.collaboratorCount).toBe(1);
      expect(data.stats.tagCount).toBe(2);

      // User role
      expect(data.userRole).toBe('owner');
    });

    it('should return events ordered by date and order field', async () => {
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
          events: {
            create: [
              {
                type: 'HOTEL',
                name: 'Hotel',
                date: new Date('2025-12-01'),
                order: 1,
                createdBy: user.id,
              },
              {
                type: 'FLIGHT',
                name: 'Flight',
                date: new Date('2025-12-01'),
                order: 0,
                createdBy: user.id,
              },
              {
                type: 'ACTIVITY',
                name: 'Activity',
                date: new Date('2025-12-02'),
                order: 0,
                createdBy: user.id,
              },
            ],
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`);
      const response = await GET(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toHaveLength(3);

      // Events should be ordered by date first, then by order
      expect(data.events[0].name).toBe('Flight'); // Dec 1, order 0
      expect(data.events[1].name).toBe('Hotel');  // Dec 1, order 1
      expect(data.events[2].name).toBe('Activity'); // Dec 2, order 0
    });

    it('should calculate expense summary correctly', async () => {
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
          budget: {
            create: {
              totalBudget: 5000,
              currency: 'USD',
              expenses: {
                create: [
                  {
                    description: 'Hotel',
                    amount: 1000,
                    currency: 'USD',
                    category: 'ACCOMMODATION',
                    date: new Date('2025-12-01'),
                    paidBy: user.id,
                    tripId: '',
                  },
                  {
                    description: 'Flight',
                    amount: 500,
                    currency: 'USD',
                    category: 'TRANSPORTATION',
                    date: new Date('2025-12-01'),
                    paidBy: user.id,
                    tripId: '',
                  },
                  {
                    description: 'Food',
                    amount: 200,
                    currency: 'EUR',
                    category: 'FOOD',
                    date: new Date('2025-12-02'),
                    paidBy: user.id,
                    tripId: '',
                  },
                ],
              },
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}`);
      const response = await GET(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.budget.expenseCount).toBe(3);
      expect(data.budget.expenseSummary.USD).toBe(1500);
      expect(data.budget.expenseSummary.EUR).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock prisma to throw error
      jest.spyOn(prisma.trip, 'findFirst').mockRejectedValue(
        new Error('Database connection failed')
      );

      const req = new NextRequest('http://localhost/api/trips/trip-123');
      const response = await GET(req, { params: { tripId: 'trip-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Internal server error');
    });
  });
});
