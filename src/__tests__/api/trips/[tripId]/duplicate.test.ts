/**
 * Tests for POST /api/trips/[tripId]/duplicate
 *
 * Tests trip duplication with permission checks, date adjustments, and data copying
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { POST } from '@/app/api/trips/[tripId]/duplicate/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';

// Mock NextAuth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('POST /api/trips/[tripId]/duplicate', () => {
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

      const req = new NextRequest('http://localhost/api/trips/trip-123/duplicate', {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: 'trip-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should return 401 if session has no user ID', async () => {
      mockAuth.mockResolvedValue({
        user: { email: 'test@example.com', name: 'Test' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const req = new NextRequest('http://localhost/api/trips/trip-123/duplicate', {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: 'trip-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for invalid trip ID', async () => {
      const req = new NextRequest('http://localhost/api/trips//duplicate', {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid trip ID');
    });

    it('should return 400 for invalid custom start date', async () => {
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

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ startDate: 'invalid-date' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid start date format');
    });
  });

  describe('Permission Checks', () => {
    it('should return 404 if trip does not exist', async () => {
      const req = new NextRequest('http://localhost/api/trips/nonexistent/duplicate', {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Trip not found');
    });

    it('should return 403 if user has no access to trip', async () => {
      const owner = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const otherUser = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'other@example.com',
          firstName: 'Other',
          lastName: 'User',
          password: 'hashed',
        },
      });

      // Create private trip owned by someone else
      const trip = await prisma.trip.create({
        data: {
          name: 'Private Trip',
          visibility: 'PRIVATE',
          createdBy: owner.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should allow owner to duplicate their trip', async () => {
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
          startDate: new Date('2025-12-01'),
          endDate: new Date('2025-12-10'),
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toContain('Trip duplicated successfully');
      expect(data.newTripId).toBeDefined();
      expect(data.originalTripId).toBe(trip.id);
    });

    it('should allow accepted collaborator to duplicate trip', async () => {
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
          startDate: new Date('2025-12-01'),
          endDate: new Date('2025-12-10'),
          collaborators: {
            create: {
              userId: collaborator.id,
              role: 'EDITOR',
              status: 'ACCEPTED',
              invitedBy: owner.id,
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toContain('Trip duplicated successfully');
      expect(data.trip.creator.id).toBe(collaborator.id); // Collaborator becomes owner
    });
  });

  describe('Trip Metadata Duplication', () => {
    it('should append " (Copy)" to trip name', async () => {
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
          name: 'Summer Vacation',
          createdBy: user.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.name).toBe('Summer Vacation (Copy)');
    });

    it('should copy trip description and destinations', async () => {
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
          name: 'Europe Tour',
          description: 'A wonderful journey through Europe',
          destinations: ['Paris', 'Rome', 'Barcelona'],
          createdBy: user.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.description).toBe('A wonderful journey through Europe');
      expect(data.trip.destinations).toEqual(['Paris', 'Rome', 'Barcelona']);
    });

    it('should set duplicated trip as PRIVATE', async () => {
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
          name: 'Public Trip',
          visibility: 'PUBLIC',
          createdBy: user.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.visibility).toBe('PRIVATE');
    });

    it('should not archive duplicated trip even if original is archived', async () => {
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
          name: 'Archived Trip',
          isArchived: true,
          createdBy: user.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.isArchived).toBe(false);
    });

    it('should set current user as owner of duplicated trip', async () => {
      const owner = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const duplicator = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'duplicator@example.com',
          firstName: 'Duplicator',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'Original Trip',
          createdBy: owner.id,
          collaborators: {
            create: {
              userId: duplicator.id,
              role: 'VIEWER',
              status: 'ACCEPTED',
              invitedBy: owner.id,
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.creator.id).toBe(duplicator.id);
      expect(data.trip.creator.email).toBe('duplicator@example.com');
    });
  });

  describe('Date Adjustment', () => {
    it('should use today as start date if no custom date provided', async () => {
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
          name: 'Past Trip',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-10'),
          createdBy: user.id,
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);

      const duplicatedStartDate = new Date(data.trip.startDate);
      duplicatedStartDate.setHours(0, 0, 0, 0);

      expect(duplicatedStartDate.getTime()).toBe(today.getTime());
    });

    it('should maintain trip duration when adjusting dates', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const originalStart = new Date('2024-06-01');
      const originalEnd = new Date('2024-06-10');
      const durationDays = 9; // 9 days

      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          startDate: originalStart,
          endDate: originalEnd,
          createdBy: user.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);

      const newStart = new Date(data.trip.startDate);
      const newEnd = new Date(data.trip.endDate);
      const newDurationMs = newEnd.getTime() - newStart.getTime();
      const newDurationDays = newDurationMs / (1000 * 60 * 60 * 24);

      expect(newDurationDays).toBe(durationDays);
    });

    it('should use custom start date if provided', async () => {
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
          name: 'Trip',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-10'),
          createdBy: user.id,
        },
      });

      const customStartDate = '2025-08-15';

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ startDate: customStartDate }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);

      const duplicatedStart = new Date(data.trip.startDate);
      const expectedStart = new Date(customStartDate);

      expect(duplicatedStart.toISOString().split('T')[0]).toBe(
        expectedStart.toISOString().split('T')[0]
      );
    });
  });

  describe('Event Duplication', () => {
    it('should copy all events with adjusted dates', async () => {
      const user = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const originalStartDate = new Date('2024-06-01T00:00:00Z');
      const trip = await prisma.trip.create({
        data: {
          name: 'Trip with Events',
          startDate: originalStartDate,
          endDate: new Date('2024-06-05T00:00:00Z'),
          createdBy: user.id,
          events: {
            create: [
              {
                type: 'FLIGHT',
                title: 'Outbound Flight',
                startDateTime: new Date('2024-06-01T10:00:00Z'),
                endDateTime: new Date('2024-06-01T14:00:00Z'),
                order: 0,
                createdBy: user.id,
              },
              {
                type: 'HOTEL',
                title: 'Hotel Check-in',
                startDateTime: new Date('2024-06-01T15:00:00Z'),
                order: 1,
                createdBy: user.id,
              },
            ],
          },
        },
      });

      const customStartDate = '2025-07-01';
      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ startDate: customStartDate }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.events).toHaveLength(2);
      expect(data.trip.events[0].title).toBe('Outbound Flight');
      expect(data.trip.events[1].title).toBe('Hotel Check-in');

      // Verify relative timing is maintained
      const event1Start = new Date(data.trip.events[0].startDateTime);
      const event2Start = new Date(data.trip.events[1].startDateTime);
      const timeDiff = event2Start.getTime() - event1Start.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      expect(hoursDiff).toBe(5); // Original events were 5 hours apart
    });

    it('should copy event metadata and properties', async () => {
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
          name: 'Trip',
          createdBy: user.id,
          events: {
            create: {
              type: 'FLIGHT',
              title: 'Flight to Paris',
              description: 'Direct flight',
              startDateTime: new Date('2024-06-01T10:00:00Z'),
              location: { name: 'CDG Airport', lat: 48.8566, lon: 2.3522 },
              notes: 'Window seat requested',
              confirmationNumber: 'ABC123',
              cost: 450.00,
              currency: 'EUR',
              order: 0,
              createdBy: user.id,
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.events).toHaveLength(1);

      const copiedEvent = data.trip.events[0];
      expect(copiedEvent.title).toBe('Flight to Paris');
      expect(copiedEvent.description).toBe('Direct flight');
      expect(copiedEvent.location).toEqual({ name: 'CDG Airport', lat: 48.8566, lon: 2.3522 });
      expect(copiedEvent.notes).toBe('Window seat requested');
      expect(copiedEvent.confirmationNumber).toBe('ABC123');
      expect(copiedEvent.cost.amount).toBe('450.00');
      expect(copiedEvent.cost.currency).toBe('EUR');
      expect(copiedEvent.order).toBe(0);
    });

    it('should set current user as creator of duplicated events', async () => {
      const owner = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const duplicator = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'duplicator@example.com',
          firstName: 'Duplicator',
          lastName: 'User',
          password: 'hashed',
        },
      });

      const trip = await prisma.trip.create({
        data: {
          name: 'Trip',
          createdBy: owner.id,
          collaborators: {
            create: {
              userId: duplicator.id,
              role: 'VIEWER',
              status: 'ACCEPTED',
              invitedBy: owner.id,
            },
          },
          events: {
            create: {
              type: 'ACTIVITY',
              title: 'Museum Visit',
              startDateTime: new Date('2024-06-01T10:00:00Z'),
              order: 0,
              createdBy: owner.id,
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);

      // Verify event exists in database with correct creator
      const newTrip = await prisma.trip.findUnique({
        where: { id: data.newTripId },
        include: { events: true },
      });

      expect(newTrip?.events[0].createdBy).toBe(duplicator.id);
    });
  });

  describe('Budget Duplication', () => {
    it('should copy budget structure without expenses', async () => {
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
          name: 'Trip with Budget',
          createdBy: user.id,
          budget: {
            create: {
              totalBudget: 5000.00,
              currency: 'USD',
              categoryBudgets: {
                accommodation: { budgeted: 2000, spent: 0, remaining: 2000 },
                transportation: { budgeted: 1500, spent: 0, remaining: 1500 },
                food: { budgeted: 1000, spent: 0, remaining: 1000 },
              },
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.budget).toBeDefined();
      expect(data.trip.budget.totalBudget).toBe('5000.00');
      expect(data.trip.budget.currency).toBe('USD');
      expect(data.trip.budget.categoryBudgets).toEqual({
        accommodation: { budgeted: 2000, spent: 0, remaining: 2000 },
        transportation: { budgeted: 1500, spent: 0, remaining: 1500 },
        food: { budgeted: 1000, spent: 0, remaining: 1000 },
      });
    });

    it('should NOT copy expenses', async () => {
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
          name: 'Trip with Expenses',
          createdBy: user.id,
          budget: {
            create: {
              totalBudget: 5000.00,
              currency: 'USD',
              categoryBudgets: {},
            },
          },
        },
      });

      // Add expense to original trip
      await prisma.expense.create({
        data: {
          tripId: trip.id,
          category: 'FOOD',
          description: 'Restaurant dinner',
          amount: 75.00,
          currency: 'USD',
          date: new Date('2024-06-01'),
          paidBy: user.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);

      // Verify no expenses copied
      const expenses = await prisma.expense.findMany({
        where: { tripId: data.newTripId },
      });
      expect(expenses).toHaveLength(0);
    });
  });

  describe('Tag Duplication', () => {
    it('should copy all tags', async () => {
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
          name: 'Trip with Tags',
          createdBy: user.id,
          tags: {
            create: [
              { name: 'Europe', color: '#3b82f6' },
              { name: 'Summer', color: '#f59e0b' },
              { name: 'Family', color: '#10b981' },
            ],
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.tags).toHaveLength(3);

      const tagNames = data.trip.tags.map((tag: { name: string }) => tag.name);
      expect(tagNames).toContain('Europe');
      expect(tagNames).toContain('Summer');
      expect(tagNames).toContain('Family');

      const europeTag = data.trip.tags.find((tag: { name: string }) => tag.name === 'Europe');
      expect(europeTag?.color).toBe('#3b82f6');
    });
  });

  describe('Data Exclusions', () => {
    it('should NOT copy collaborators', async () => {
      const owner = await prisma.user.create({
        data: {
          id: mockUserId,
          email: 'owner@example.com',
          firstName: 'Owner',
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
          name: 'Trip with Collaborators',
          createdBy: owner.id,
          collaborators: {
            create: {
              userId: collaborator.id,
              role: 'EDITOR',
              status: 'ACCEPTED',
              invitedBy: owner.id,
            },
          },
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);

      // Verify no collaborators on new trip
      const newTripCollaborators = await prisma.tripCollaborator.findMany({
        where: { tripId: data.newTripId },
      });
      expect(newTripCollaborators).toHaveLength(0);
    });

    it('should NOT copy documents', async () => {
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
          name: 'Trip with Documents',
          createdBy: user.id,
        },
      });

      await prisma.document.create({
        data: {
          tripId: trip.id,
          name: 'Passport Copy',
          type: 'PASSPORT',
          fileUrl: 'https://example.com/passport.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          uploadedBy: user.id,
        },
      });

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(201);

      // Verify no documents copied
      const documents = await prisma.document.findMany({
        where: { tripId: data.newTripId },
      });
      expect(documents).toHaveLength(0);
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

      // Mock prisma to throw error
      jest.spyOn(prisma, '$transaction').mockRejectedValue(
        new Error('Database connection failed')
      );

      const req = new NextRequest(`http://localhost/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });
      const response = await POST(req, { params: { tripId: trip.id } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Internal server error');
    });
  });
});
