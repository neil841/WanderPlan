/**
 * Tests for Public Trip Share API
 *
 * @route GET /api/trips/share/[token]
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GET } from '@/app/api/trips/share/[token]/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';

describe('GET /api/trips/share/[token]', () => {
  const userId = 'user-123';
  let tripId: string;
  let shareToken: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create test user
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashed_password',
      },
    });

    // Create test trip
    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        description: 'A test trip description',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-15'),
        destinations: ['Paris', 'London'],
        createdBy: userId,
      },
    });
    tripId = trip.id;

    // Create events
    await prisma.event.createMany({
      data: [
        {
          tripId,
          type: 'FLIGHT',
          title: 'Flight to Paris',
          startDateTime: new Date('2024-06-01T10:00:00Z'),
          order: 0,
          createdBy: userId,
        },
        {
          tripId,
          type: 'HOTEL',
          title: 'Hotel in Paris',
          startDateTime: new Date('2024-06-01T15:00:00Z'),
          order: 1,
          createdBy: userId,
        },
      ],
    });

    // Create share token
    const token = await prisma.tripShareToken.create({
      data: {
        tripId,
        createdBy: userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        permissions: 'view_only',
      },
    });
    shareToken = token.token;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.tripShareToken.deleteMany({ where: { tripId } });
    await prisma.event.deleteMany({ where: { tripId } });
    await prisma.trip.delete({ where: { id: tripId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('should return trip data with valid token', async () => {
    const req = new NextRequest(
      `http://localhost/api/trips/share/${shareToken}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(req, { params: { token: shareToken } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('name');
    expect(data.data).toHaveProperty('events');
    expect(data.data).toHaveProperty('creator');
    expect(data.data).toHaveProperty('shareInfo');

    // Verify trip details
    expect(data.data.name).toBe('Test Trip');
    expect(data.data.description).toBe('A test trip description');
    expect(data.data.destinations).toEqual(['Paris', 'London']);

    // Verify events are included
    expect(data.data.events).toHaveLength(2);
    expect(data.data.events[0].title).toBe('Flight to Paris');

    // Verify creator info (no email for public)
    expect(data.data.creator).toHaveProperty('name');
    expect(data.data.creator).not.toHaveProperty('email');

    // Verify share info
    expect(data.data.shareInfo.isReadOnly).toBe(true);
    expect(data.data.shareInfo.permissions).toBe('view_only');
  });

  it('should return 404 for invalid token', async () => {
    const req = new NextRequest(
      'http://localhost/api/trips/share/invalid-token',
      {
        method: 'GET',
      }
    );

    const response = await GET(req, { params: { token: 'invalid-token' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('should return 410 for revoked token', async () => {
    // Revoke the token
    await prisma.tripShareToken.update({
      where: { token: shareToken },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    const req = new NextRequest(
      `http://localhost/api/trips/share/${shareToken}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(req, { params: { token: shareToken } });
    const data = await response.json();

    expect(response.status).toBe(410); // Gone
    expect(data.error).toContain('revoked');
  });

  it('should return 410 for expired token', async () => {
    // Create expired token
    const expiredToken = await prisma.tripShareToken.create({
      data: {
        tripId,
        createdBy: userId,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        isActive: true,
      },
    });

    const req = new NextRequest(
      `http://localhost/api/trips/share/${expiredToken.token}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(req, {
      params: { token: expiredToken.token },
    });
    const data = await response.json();

    expect(response.status).toBe(410); // Gone
    expect(data.error).toContain('expired');
  });

  it('should return 404 for deleted trip', async () => {
    // Soft delete the trip
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        deletedAt: new Date(),
      },
    });

    const req = new NextRequest(
      `http://localhost/api/trips/share/${shareToken}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(req, { params: { token: shareToken } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not available');

    // Restore for cleanup
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        deletedAt: null,
      },
    });
  });

  it('should not include sensitive data in response', async () => {
    const req = new NextRequest(
      `http://localhost/api/trips/share/${shareToken}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(req, { params: { token: shareToken } });
    const data = await response.json();

    expect(response.status).toBe(200);

    // Should not include:
    // - Creator email
    expect(data.data.creator).not.toHaveProperty('email');

    // - Collaborators (not included in public view)
    expect(data.data).not.toHaveProperty('collaborators');

    // - Documents (sensitive)
    expect(data.data).not.toHaveProperty('documents');

    // - Detailed expenses (only budget summary)
    expect(data.data).not.toHaveProperty('expenses');

    // Should include:
    // - Trip metadata
    expect(data.data).toHaveProperty('name');
    expect(data.data).toHaveProperty('description');
    expect(data.data).toHaveProperty('events');
    expect(data.data).toHaveProperty('tags');
    expect(data.data).toHaveProperty('budget'); // Summary only
  });

  it('should calculate trip duration correctly', async () => {
    const req = new NextRequest(
      `http://localhost/api/trips/share/${shareToken}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(req, { params: { token: shareToken } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.stats.duration).toBe(14); // June 1-15 = 14 days
  });

  it('should include event location data', async () => {
    // Add location to an event
    const events = await prisma.event.findMany({ where: { tripId } });
    await prisma.event.update({
      where: { id: events[0].id },
      data: {
        location: {
          name: 'Charles de Gaulle Airport',
          address: 'Paris, France',
          lat: 49.0097,
          lon: 2.5479,
        },
      },
    });

    const req = new NextRequest(
      `http://localhost/api/trips/share/${shareToken}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(req, { params: { token: shareToken } });
    const data = await response.json();

    expect(response.status).toBe(200);
    const eventWithLocation = data.data.events.find(
      (e: any) => e.title === 'Flight to Paris'
    );
    expect(eventWithLocation.location).toBeDefined();
    expect(eventWithLocation.location.name).toBe('Charles de Gaulle Airport');
  });

  it('should include event cost information', async () => {
    // Add cost to an event
    const events = await prisma.event.findMany({ where: { tripId } });
    await prisma.event.update({
      where: { id: events[0].id },
      data: {
        cost: 350.00,
        currency: 'USD',
      },
    });

    const req = new NextRequest(
      `http://localhost/api/trips/share/${shareToken}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(req, { params: { token: shareToken } });
    const data = await response.json();

    expect(response.status).toBe(200);
    const eventWithCost = data.data.events.find(
      (e: any) => e.title === 'Flight to Paris'
    );
    expect(eventWithCost.cost).toBeDefined();
    expect(eventWithCost.cost.amount).toBe('350.00');
    expect(eventWithCost.cost.currency).toBe('USD');
  });
});
