/**
 * Individual Event API Tests
 *
 * Tests for GET, PATCH, DELETE /api/trips/[tripId]/events/[eventId]
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  GET,
  PATCH,
  DELETE,
} from '@/app/api/trips/[tripId]/events/[eventId]/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';
import { EventType } from '@prisma/client';

// Mock auth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe('GET /api/trips/[tripId]/events/[eventId]', () => {
  let testUserId: string;
  let testTripId: string;
  let testEventId: string;

  beforeEach(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-event-detail@example.com',
        firstName: 'Event',
        lastName: 'Detail',
        password: 'hashedpassword',
      },
    });
    testUserId = testUser.id;

    // Create test trip
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Event Detail Trip',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-15'),
        createdBy: testUserId,
      },
    });
    testTripId = testTrip.id;

    // Create test event
    const testEvent = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.FLIGHT,
        title: 'Flight to Paris',
        description: 'Air France AF123',
        startDateTime: new Date('2024-06-01T08:00:00Z'),
        endDateTime: new Date('2024-06-01T16:00:00Z'),
        location: { name: 'CDG Airport', address: 'Paris' },
        cost: 450,
        currency: 'USD',
        order: 0,
        confirmationNumber: 'AF123456',
        createdBy: testUserId,
      },
    });
    testEventId = testEvent.id;
  });

  afterEach(async () => {
    await prisma.event.deleteMany({ where: { tripId: testTripId } });
    await prisma.trip.deleteMany({ where: { id: testTripId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it('should retrieve event details successfully', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`
    );

    const response = await GET(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(testEventId);
    expect(data.type).toBe(EventType.FLIGHT);
    expect(data.title).toBe('Flight to Paris');
    expect(data.description).toBe('Air France AF123');
    expect(data.location).toEqual({ name: 'CDG Airport', address: 'Paris' });
    expect(data.cost.amount).toBe(450);
    expect(data.cost.currency).toBe('USD');
    expect(data.confirmationNumber).toBe('AF123456');
    expect(data.creator).toHaveProperty('name');
  });

  it('should return 401 for unauthenticated requests', async () => {
    mockedAuth.mockResolvedValue(null);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`
    );

    const response = await GET(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 404 for non-existent event', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const fakeEventId = '00000000-0000-0000-0000-000000000000';
    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${fakeEventId}`
    );

    const response = await GET(req, {
      params: { tripId: testTripId, eventId: fakeEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });
});

describe('PATCH /api/trips/[tripId]/events/[eventId]', () => {
  let testUserId: string;
  let testTripId: string;
  let testEventId: string;
  let editorUserId: string;
  let viewerUserId: string;

  beforeEach(async () => {
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        email: 'test-event-update@example.com',
        firstName: 'Event',
        lastName: 'Updater',
        password: 'hashedpassword',
      },
    });
    testUserId = testUser.id;

    const editor = await prisma.user.create({
      data: {
        email: 'editor-event-update@example.com',
        firstName: 'Event',
        lastName: 'Editor',
        password: 'hashedpassword',
      },
    });
    editorUserId = editor.id;

    const viewer = await prisma.user.create({
      data: {
        email: 'viewer-event-update@example.com',
        firstName: 'Event',
        lastName: 'Viewer',
        password: 'hashedpassword',
      },
    });
    viewerUserId = viewer.id;

    // Create test trip
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Event Update Trip',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-15'),
        createdBy: testUserId,
      },
    });
    testTripId = testTrip.id;

    // Add collaborators
    await prisma.tripCollaborator.create({
      data: {
        tripId: testTripId,
        userId: editorUserId,
        role: 'EDITOR',
        status: 'ACCEPTED',
        invitedBy: testUserId,
      },
    });

    await prisma.tripCollaborator.create({
      data: {
        tripId: testTripId,
        userId: viewerUserId,
        role: 'VIEWER',
        status: 'ACCEPTED',
        invitedBy: testUserId,
      },
    });

    // Create test event
    const testEvent = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.HOTEL,
        title: 'Original Hotel',
        startDateTime: new Date('2024-06-01T15:00:00Z'),
        order: 0,
        createdBy: testUserId,
      },
    });
    testEventId = testEvent.id;
  });

  afterEach(async () => {
    await prisma.event.deleteMany({ where: { tripId: testTripId } });
    await prisma.tripCollaborator.deleteMany({ where: { tripId: testTripId } });
    await prisma.trip.deleteMany({ where: { id: testTripId } });
    await prisma.user.deleteMany({
      where: { id: { in: [testUserId, editorUserId, viewerUserId] } },
    });
  });

  it('should update event title successfully as owner', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const requestBody = {
      title: 'Updated Hotel Name',
    };

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await PATCH(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Event updated successfully');
    expect(data.event.title).toBe('Updated Hotel Name');
  });

  it('should update multiple fields simultaneously', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const requestBody = {
      title: 'Paris Marriott',
      description: 'Luxury hotel in central Paris',
      location: {
        name: 'Marriott Paris Champs Elysees',
        address: '70 Avenue des Champs-Élysées',
        lat: 48.8698,
        lon: 2.3059,
      },
      cost: {
        amount: 850,
        currency: 'USD',
      },
      confirmationNumber: 'MAR12345',
    };

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await PATCH(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.event.title).toBe('Paris Marriott');
    expect(data.event.description).toBe('Luxury hotel in central Paris');
    expect(data.event.location.name).toBe('Marriott Paris Champs Elysees');
    expect(data.event.cost.amount).toBe(850);
    expect(data.event.confirmationNumber).toBe('MAR12345');
  });

  it('should allow EDITOR to update events', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: editorUserId, email: 'editor@example.com' },
    } as any);

    const requestBody = {
      title: 'Updated by Editor',
    };

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await PATCH(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.event.title).toBe('Updated by Editor');
  });

  it('should forbid VIEWER from updating events', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: viewerUserId, email: 'viewer@example.com' },
    } as any);

    const requestBody = {
      title: 'Attempted Update by Viewer',
    };

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await PATCH(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('EDITOR or ADMIN access');
  });

  it('should validate updated endDateTime is after startDateTime', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const requestBody = {
      startDateTime: '2024-06-01T16:00:00Z',
      endDateTime: '2024-06-01T08:00:00Z', // Before start
    };

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await PATCH(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 404 for non-existent event', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const fakeEventId = '00000000-0000-0000-0000-000000000000';
    const requestBody = {
      title: 'Update Non-existent',
    };

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${fakeEventId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await PATCH(req, {
      params: { tripId: testTripId, eventId: fakeEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });
});

describe('DELETE /api/trips/[tripId]/events/[eventId]', () => {
  let testUserId: string;
  let testTripId: string;
  let testEventId: string;
  let editorUserId: string;
  let viewerUserId: string;

  beforeEach(async () => {
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        email: 'test-event-delete@example.com',
        firstName: 'Event',
        lastName: 'Deleter',
        password: 'hashedpassword',
      },
    });
    testUserId = testUser.id;

    const editor = await prisma.user.create({
      data: {
        email: 'editor-event-delete@example.com',
        firstName: 'Event',
        lastName: 'EditorDelete',
        password: 'hashedpassword',
      },
    });
    editorUserId = editor.id;

    const viewer = await prisma.user.create({
      data: {
        email: 'viewer-event-delete@example.com',
        firstName: 'Event',
        lastName: 'ViewerDelete',
        password: 'hashedpassword',
      },
    });
    viewerUserId = viewer.id;

    // Create test trip
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Event Delete Trip',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-15'),
        createdBy: testUserId,
      },
    });
    testTripId = testTrip.id;

    // Add collaborators
    await prisma.tripCollaborator.create({
      data: {
        tripId: testTripId,
        userId: editorUserId,
        role: 'EDITOR',
        status: 'ACCEPTED',
        invitedBy: testUserId,
      },
    });

    await prisma.tripCollaborator.create({
      data: {
        tripId: testTripId,
        userId: viewerUserId,
        role: 'VIEWER',
        status: 'ACCEPTED',
        invitedBy: testUserId,
      },
    });
  });

  afterEach(async () => {
    await prisma.event.deleteMany({ where: { tripId: testTripId } });
    await prisma.tripCollaborator.deleteMany({ where: { tripId: testTripId } });
    await prisma.trip.deleteMany({ where: { id: testTripId } });
    await prisma.user.deleteMany({
      where: { id: { in: [testUserId, editorUserId, viewerUserId] } },
    });
  });

  it('should delete event successfully as owner', async () => {
    // Create event to delete
    const testEvent = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.ACTIVITY,
        title: 'Event to Delete',
        startDateTime: new Date('2024-06-02T10:00:00Z'),
        order: 0,
        createdBy: testUserId,
      },
    });
    testEventId = testEvent.id;

    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Event deleted successfully');
    expect(data.eventId).toBe(testEventId);

    // Verify event is actually deleted
    const deletedEvent = await prisma.event.findUnique({
      where: { id: testEventId },
    });
    expect(deletedEvent).toBeNull();
  });

  it('should allow EDITOR to delete events', async () => {
    // Create event to delete
    const testEvent = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.RESTAURANT,
        title: 'Event to Delete by Editor',
        startDateTime: new Date('2024-06-02T19:00:00Z'),
        order: 0,
        createdBy: testUserId,
      },
    });
    testEventId = testEvent.id;

    mockedAuth.mockResolvedValue({
      user: { id: editorUserId, email: 'editor@example.com' },
    } as any);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Event deleted successfully');
  });

  it('should forbid VIEWER from deleting events', async () => {
    // Create event to attempt delete
    const testEvent = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.DESTINATION,
        title: 'Event Viewer Cannot Delete',
        startDateTime: new Date('2024-06-03T10:00:00Z'),
        order: 0,
        createdBy: testUserId,
      },
    });
    testEventId = testEvent.id;

    mockedAuth.mockResolvedValue({
      user: { id: viewerUserId, email: 'viewer@example.com' },
    } as any);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('EDITOR or ADMIN access');

    // Verify event is NOT deleted
    const stillExists = await prisma.event.findUnique({
      where: { id: testEventId },
    });
    expect(stillExists).not.toBeNull();
  });

  it('should return 404 for non-existent event', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const fakeEventId = '00000000-0000-0000-0000-000000000000';
    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${fakeEventId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: { tripId: testTripId, eventId: fakeEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('should return 401 for unauthenticated requests', async () => {
    // Create event
    const testEvent = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.TRANSPORTATION,
        title: 'Unauthorized Delete Attempt',
        startDateTime: new Date('2024-06-04T10:00:00Z'),
        order: 0,
        createdBy: testUserId,
      },
    });
    testEventId = testEvent.id;

    mockedAuth.mockResolvedValue(null);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events/${testEventId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, {
      params: { tripId: testTripId, eventId: testEventId },
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });
});
