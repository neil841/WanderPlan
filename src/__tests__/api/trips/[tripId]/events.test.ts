/**
 * Event Collection API Tests
 *
 * Tests for POST /api/trips/[tripId]/events and GET /api/trips/[tripId]/events
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { POST, GET } from '@/app/api/trips/[tripId]/events/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';
import { EventType } from '@prisma/client';

// Mock auth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe('POST /api/trips/[tripId]/events', () => {
  let testUserId: string;
  let testTripId: string;
  let collaboratorUserId: string;
  let viewerUserId: string;

  beforeEach(async () => {
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        email: 'test-event-owner@example.com',
        firstName: 'Event',
        lastName: 'Owner',
        password: 'hashedpassword',
      },
    });
    testUserId = testUser.id;

    const collaborator = await prisma.user.create({
      data: {
        email: 'test-event-editor@example.com',
        firstName: 'Event',
        lastName: 'Editor',
        password: 'hashedpassword',
      },
    });
    collaboratorUserId = collaborator.id;

    const viewer = await prisma.user.create({
      data: {
        email: 'test-event-viewer@example.com',
        firstName: 'Event',
        lastName: 'Viewer',
        password: 'hashedpassword',
      },
    });
    viewerUserId = viewer.id;

    // Create test trip
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Event Trip',
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
        userId: collaboratorUserId,
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
    // Clean up test data
    await prisma.event.deleteMany({
      where: { tripId: testTripId },
    });
    await prisma.tripCollaborator.deleteMany({
      where: { tripId: testTripId },
    });
    await prisma.trip.deleteMany({
      where: { id: testTripId },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [testUserId, collaboratorUserId, viewerUserId] },
      },
    });
  });

  it('should create a FLIGHT event successfully as trip owner', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const requestBody = {
      type: EventType.FLIGHT,
      title: 'Flight to Paris',
      description: 'Air France AF123',
      startDateTime: '2024-06-01T08:00:00Z',
      endDateTime: '2024-06-01T16:00:00Z',
      location: {
        name: 'Charles de Gaulle Airport',
        address: 'Paris, France',
        lat: 49.0097,
        lon: 2.5479,
      },
      cost: {
        amount: 450,
        currency: 'USD',
      },
      confirmationNumber: 'AF123456',
      notes: 'Window seat, check in online',
    };

    const req = new NextRequest('http://localhost/api/trips/123/events', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Event created successfully');
    expect(data.event).toHaveProperty('id');
    expect(data.event.type).toBe(EventType.FLIGHT);
    expect(data.event.title).toBe('Flight to Paris');
    expect(data.event.location.name).toBe('Charles de Gaulle Airport');
    expect(data.event.cost.amount).toBe(450);
    expect(data.event.confirmationNumber).toBe('AF123456');
  });

  it('should create a HOTEL event successfully', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const requestBody = {
      type: EventType.HOTEL,
      title: 'Hotel Reservation - Marriott',
      startDateTime: '2024-06-01T15:00:00Z',
      endDateTime: '2024-06-05T11:00:00Z',
      location: {
        name: 'Paris Marriott Champs Elysees Hotel',
        address: '70 Avenue des Champs-Élysées, Paris',
      },
      cost: {
        amount: 800,
        currency: 'USD',
      },
      confirmationNumber: 'MAR789',
    };

    const req = new NextRequest('http://localhost/api/trips/123/events', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.event.type).toBe(EventType.HOTEL);
    expect(data.event.title).toBe('Hotel Reservation - Marriott');
  });

  it('should create an ACTIVITY event successfully', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const requestBody = {
      type: EventType.ACTIVITY,
      title: 'Eiffel Tower Tour',
      startDateTime: '2024-06-02T10:00:00Z',
      endDateTime: '2024-06-02T12:00:00Z',
      location: {
        name: 'Eiffel Tower',
        address: 'Champ de Mars, Paris',
        lat: 48.8584,
        lon: 2.2945,
      },
      cost: {
        amount: 25,
        currency: 'EUR',
      },
    };

    const req = new NextRequest('http://localhost/api/trips/123/events', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.event.type).toBe(EventType.ACTIVITY);
  });

  it('should allow EDITOR collaborator to create events', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: collaboratorUserId, email: 'editor@example.com' },
    } as any);

    const requestBody = {
      type: EventType.RESTAURANT,
      title: 'Dinner at Le Jules Verne',
      startDateTime: '2024-06-02T19:00:00Z',
      location: {
        name: 'Le Jules Verne',
        address: 'Eiffel Tower, 2nd Floor',
      },
    };

    const req = new NextRequest('http://localhost/api/trips/123/events', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.event.type).toBe(EventType.RESTAURANT);
  });

  it('should forbid VIEWER from creating events', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: viewerUserId, email: 'viewer@example.com' },
    } as any);

    const requestBody = {
      type: EventType.ACTIVITY,
      title: 'Museum Visit',
      startDateTime: '2024-06-03T10:00:00Z',
    };

    const req = new NextRequest('http://localhost/api/trips/123/events', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('EDITOR or ADMIN access');
  });

  it('should return 401 for unauthenticated requests', async () => {
    mockedAuth.mockResolvedValue(null);

    const requestBody = {
      type: EventType.FLIGHT,
      title: 'Test Flight',
      startDateTime: '2024-06-01T08:00:00Z',
    };

    const req = new NextRequest('http://localhost/api/trips/123/events', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('should validate required fields', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const requestBody = {
      type: EventType.FLIGHT,
      // Missing required title and startDateTime
    };

    const req = new NextRequest('http://localhost/api/trips/123/events', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('should validate endDateTime is after startDateTime', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const requestBody = {
      type: EventType.FLIGHT,
      title: 'Invalid Flight',
      startDateTime: '2024-06-01T16:00:00Z',
      endDateTime: '2024-06-01T08:00:00Z', // Before start
    };

    const req = new NextRequest('http://localhost/api/trips/123/events', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should create events for all 6 event types', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const eventTypes: EventType[] = [
      EventType.FLIGHT,
      EventType.HOTEL,
      EventType.ACTIVITY,
      EventType.RESTAURANT,
      EventType.TRANSPORTATION,
      EventType.DESTINATION,
    ];

    for (const type of eventTypes) {
      const requestBody = {
        type,
        title: `Test ${type}`,
        startDateTime: '2024-06-01T10:00:00Z',
      };

      const req = new NextRequest('http://localhost/api/trips/123/events', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(req, { params: { tripId: testTripId } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.event.type).toBe(type);
    }
  });
});

describe('GET /api/trips/[tripId]/events', () => {
  let testUserId: string;
  let testTripId: string;
  let eventIds: string[] = [];

  beforeEach(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-event-get@example.com',
        firstName: 'Event',
        lastName: 'Getter',
        password: 'hashedpassword',
      },
    });
    testUserId = testUser.id;

    // Create test trip
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Event List Trip',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-15'),
        createdBy: testUserId,
      },
    });
    testTripId = testTrip.id;

    // Create test events
    const event1 = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.FLIGHT,
        title: 'Flight to Paris',
        startDateTime: new Date('2024-06-01T08:00:00Z'),
        order: 0,
        createdBy: testUserId,
      },
    });
    eventIds.push(event1.id);

    const event2 = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.HOTEL,
        title: 'Hotel Check-in',
        startDateTime: new Date('2024-06-01T15:00:00Z'),
        order: 1,
        createdBy: testUserId,
      },
    });
    eventIds.push(event2.id);

    const event3 = await prisma.event.create({
      data: {
        tripId: testTripId,
        type: EventType.ACTIVITY,
        title: 'Eiffel Tower',
        startDateTime: new Date('2024-06-02T10:00:00Z'),
        order: 2,
        createdBy: testUserId,
      },
    });
    eventIds.push(event3.id);
  });

  afterEach(async () => {
    await prisma.event.deleteMany({
      where: { id: { in: eventIds } },
    });
    await prisma.trip.deleteMany({
      where: { id: testTripId },
    });
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
    eventIds = [];
  });

  it('should retrieve all events for a trip', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events`
    );

    const response = await GET(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toHaveLength(3);
    expect(data.total).toBe(3);
  });

  it('should filter events by type', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events?type=FLIGHT`
    );

    const response = await GET(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toHaveLength(1);
    expect(data.events[0].type).toBe(EventType.FLIGHT);
  });

  it('should filter events by multiple types', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events?type=FLIGHT,HOTEL`
    );

    const response = await GET(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toHaveLength(2);
  });

  it('should search events by title', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events?search=Eiffel`
    );

    const response = await GET(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toHaveLength(1);
    expect(data.events[0].title).toContain('Eiffel');
  });

  it('should return 401 for unauthenticated requests', async () => {
    mockedAuth.mockResolvedValue(null);

    const req = new NextRequest(
      `http://localhost/api/trips/${testTripId}/events`
    );

    const response = await GET(req, { params: { tripId: testTripId } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 404 for non-existent trip', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: testUserId, email: 'test@example.com' },
    } as any);

    const fakeId = '00000000-0000-0000-0000-000000000000';
    const req = new NextRequest(`http://localhost/api/trips/${fakeId}/events`);

    const response = await GET(req, { params: { tripId: fakeId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });
});
