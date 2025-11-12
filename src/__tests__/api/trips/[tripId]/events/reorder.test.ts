/**
 * Event Reordering API Tests
 *
 * Tests for PATCH /api/trips/[tripId]/events/reorder endpoint
 *
 * Coverage:
 * - Successful event reordering
 * - Permission validation (owner, admin, editor, viewer)
 * - Invalid event IDs
 * - Events from different trips
 * - Empty array
 * - Duplicate event IDs
 * - Authentication checks
 * - Transaction atomicity
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PATCH } from '@/app/api/trips/[tripId]/events/reorder/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';

// Mock auth module
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('PATCH /api/trips/[tripId]/events/reorder', () => {
  // Test data
  let testUser: { id: string; email: string };
  let otherUser: { id: string; email: string };
  let testTrip: { id: string; createdBy: string };
  let testEvents: Array<{
    id: string;
    tripId: string;
    title: string;
    order: number;
  }>;

  beforeEach(async () => {
    // Create test users
    testUser = await prisma.user.create({
      data: {
        email: 'reorder-test@example.com',
        firstName: 'Reorder',
        lastName: 'Tester',
        password: 'hashedpassword123',
      },
    });

    otherUser = await prisma.user.create({
      data: {
        email: 'other-reorder@example.com',
        firstName: 'Other',
        lastName: 'User',
        password: 'hashedpassword456',
      },
    });

    // Create test trip
    testTrip = await prisma.trip.create({
      data: {
        name: 'Reorder Test Trip',
        description: 'Trip for testing event reordering',
        createdBy: testUser.id,
      },
    });

    // Create test events with initial order
    const eventPromises = [
      { title: 'Event 1', order: 0 },
      { title: 'Event 2', order: 1 },
      { title: 'Event 3', order: 2 },
      { title: 'Event 4', order: 3 },
    ].map((eventData) =>
      prisma.event.create({
        data: {
          tripId: testTrip.id,
          type: 'ACTIVITY',
          title: eventData.title,
          startDateTime: new Date('2025-06-15T10:00:00Z'),
          order: eventData.order,
          createdBy: testUser.id,
        },
      })
    );

    testEvents = await Promise.all(eventPromises);
  });

  afterEach(async () => {
    // Cleanup in reverse order of dependencies
    await prisma.event.deleteMany({
      where: { tripId: testTrip.id },
    });
    await prisma.trip.deleteMany({
      where: { id: testTrip.id },
    });
    await prisma.user.deleteMany({
      where: {
        OR: [{ id: testUser.id }, { id: otherUser.id }],
      },
    });
    jest.clearAllMocks();
  });

  describe('Successful Reordering', () => {
    it('should reorder events successfully when user is trip owner', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      // Reverse the order: [0,1,2,3] -> [3,2,1,0]
      const newOrder = [
        testEvents[3].id,
        testEvents[2].id,
        testEvents[1].id,
        testEvents[0].id,
      ];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.events).toHaveLength(4);

      // Verify the order is correct
      expect(data.events[0].id).toBe(testEvents[3].id);
      expect(data.events[0].order).toBe(0);
      expect(data.events[1].id).toBe(testEvents[2].id);
      expect(data.events[1].order).toBe(1);
      expect(data.events[2].id).toBe(testEvents[1].id);
      expect(data.events[2].order).toBe(2);
      expect(data.events[3].id).toBe(testEvents[0].id);
      expect(data.events[3].order).toBe(3);
    });

    it('should reorder events when user is ADMIN collaborator', async () => {
      // Add other user as ADMIN collaborator
      await prisma.tripCollaborator.create({
        data: {
          tripId: testTrip.id,
          userId: otherUser.id,
          role: 'ADMIN',
          status: 'ACCEPTED',
          invitedBy: testUser.id,
        },
      });

      mockAuth.mockResolvedValue({
        user: { id: otherUser.id, email: otherUser.email },
      } as any);

      const newOrder = [testEvents[1].id, testEvents[0].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reorder events when user is EDITOR collaborator', async () => {
      // Add other user as EDITOR collaborator
      await prisma.tripCollaborator.create({
        data: {
          tripId: testTrip.id,
          userId: otherUser.id,
          role: 'EDITOR',
          status: 'ACCEPTED',
          invitedBy: testUser.id,
        },
      });

      mockAuth.mockResolvedValue({
        user: { id: otherUser.id, email: otherUser.email },
      } as any);

      const newOrder = [testEvents[2].id, testEvents[1].id, testEvents[0].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.events).toHaveLength(3);
    });
  });

  describe('Permission Validation', () => {
    it('should reject when user is VIEWER collaborator', async () => {
      // Add other user as VIEWER collaborator
      await prisma.tripCollaborator.create({
        data: {
          tripId: testTrip.id,
          userId: otherUser.id,
          role: 'VIEWER',
          status: 'ACCEPTED',
          invitedBy: testUser.id,
        },
      });

      mockAuth.mockResolvedValue({
        user: { id: otherUser.id, email: otherUser.email },
      } as any);

      const newOrder = [testEvents[1].id, testEvents[0].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should reject when user has no access to trip', async () => {
      mockAuth.mockResolvedValue({
        user: { id: otherUser.id, email: otherUser.email },
      } as any);

      const newOrder = [testEvents[0].id, testEvents[1].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should reject when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const newOrder = [testEvents[0].id, testEvents[1].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('Validation Errors', () => {
    it('should reject empty eventIds array', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: [] }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should reject duplicate event IDs', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      // Include duplicate ID
      const newOrder = [testEvents[0].id, testEvents[1].id, testEvents[0].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details[0].message).toContain('unique');
    });

    it('should reject invalid event ID format', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: ['invalid-id', testEvents[0].id] }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject non-existent event IDs', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
      const newOrder = [testEvents[0].id, fakeUuid];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid event IDs');
      expect(data.details).toContain(fakeUuid);
    });

    it('should reject events from different trip', async () => {
      // Create another trip with an event
      const otherTrip = await prisma.trip.create({
        data: {
          name: 'Other Trip',
          createdBy: testUser.id,
        },
      });

      const eventFromOtherTrip = await prisma.event.create({
        data: {
          tripId: otherTrip.id,
          type: 'FLIGHT',
          title: 'Other Trip Event',
          startDateTime: new Date('2025-07-01T10:00:00Z'),
          order: 0,
          createdBy: testUser.id,
        },
      });

      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      // Try to reorder with event from different trip
      const newOrder = [testEvents[0].id, eventFromOtherTrip.id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid event IDs');
      expect(data.details).toContain('do not belong to this trip');

      // Cleanup
      await prisma.event.deleteMany({ where: { tripId: otherTrip.id } });
      await prisma.trip.delete({ where: { id: otherTrip.id } });
    });

    it('should reject with invalid trip ID', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
      const newOrder = [testEvents[0].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${fakeUuid}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: fakeUuid } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trip not found');
    });
  });

  describe('Transaction Atomicity', () => {
    it('should verify all events are updated together (not partial)', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const newOrder = [
        testEvents[3].id,
        testEvents[2].id,
        testEvents[1].id,
        testEvents[0].id,
      ];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });

      expect(response.status).toBe(200);

      // Verify all events have been updated in database
      const updatedEvents = await prisma.event.findMany({
        where: { tripId: testTrip.id },
        orderBy: { order: 'asc' },
      });

      expect(updatedEvents[0].id).toBe(testEvents[3].id);
      expect(updatedEvents[0].order).toBe(0);
      expect(updatedEvents[1].id).toBe(testEvents[2].id);
      expect(updatedEvents[1].order).toBe(1);
      expect(updatedEvents[2].id).toBe(testEvents[1].id);
      expect(updatedEvents[2].order).toBe(2);
      expect(updatedEvents[3].id).toBe(testEvents[0].id);
      expect(updatedEvents[3].order).toBe(3);
    });

    it('should handle reordering with subset of events', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      // Only reorder first 2 events (others remain unchanged)
      const newOrder = [testEvents[1].id, testEvents[0].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toHaveLength(2);
      expect(data.events[0].id).toBe(testEvents[1].id);
      expect(data.events[0].order).toBe(0);
      expect(data.events[1].id).toBe(testEvents[0].id);
      expect(data.events[1].order).toBe(1);
    });
  });

  describe('Response Format', () => {
    it('should return events with correct structure', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const newOrder = [testEvents[0].id, testEvents[1].id];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('events');

      // Verify event structure
      const event = data.events[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('tripId');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('order');
      expect(event).toHaveProperty('creator');
      expect(event.creator).toHaveProperty('id');
      expect(event.creator).toHaveProperty('name');
    });

    it('should return events sorted by new order', async () => {
      mockAuth.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const newOrder = [
        testEvents[2].id,
        testEvents[0].id,
        testEvents[3].id,
        testEvents[1].id,
      ];

      const req = new NextRequest(
        `http://localhost:3000/api/trips/${testTrip.id}/events/reorder`,
        {
          method: 'PATCH',
          body: JSON.stringify({ eventIds: newOrder }),
        }
      );

      const response = await PATCH(req, { params: { tripId: testTrip.id } });
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify events are returned in correct order
      expect(data.events[0].id).toBe(testEvents[2].id);
      expect(data.events[1].id).toBe(testEvents[0].id);
      expect(data.events[2].id).toBe(testEvents[3].id);
      expect(data.events[3].id).toBe(testEvents[1].id);

      // Verify order values
      data.events.forEach((event: any, index: number) => {
        expect(event.order).toBe(index);
      });
    });
  });
});
