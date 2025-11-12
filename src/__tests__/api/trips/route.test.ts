/**
 * Trip API Integration Tests
 *
 * Tests for /api/trips endpoints:
 * - GET /api/trips - List trips
 * - POST /api/trips - Create trip
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/trips/route';
import { prisma } from '@/lib/db';
import * as nextAuth from 'next-auth';

// Mock NextAuth
jest.mock('next-auth');
const mockGetServerSession = nextAuth.getServerSession as jest.MockedFunction<
  typeof nextAuth.getServerSession
>;

describe('GET /api/trips', () => {
  let testUserId: string;
  let tripId1: string;
  let tripId2: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'trips-api-test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
      },
    });
    testUserId = user.id;
  });

  beforeEach(async () => {
    // Create test trips
    const trip1 = await prisma.trip.create({
      data: {
        name: 'Test Trip 1',
        description: 'First test trip',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-15'),
        destinations: ['Paris'],
        visibility: 'PRIVATE',
        createdBy: testUserId,
      },
    });
    tripId1 = trip1.id;

    const trip2 = await prisma.trip.create({
      data: {
        name: 'Test Trip 2',
        description: 'Second test trip',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-15'),
        destinations: ['Berlin'],
        visibility: 'PRIVATE',
        createdBy: testUserId,
        isArchived: true,
      },
    });
    tripId2 = trip2.id;

    // Mock authenticated session
    mockGetServerSession.mockResolvedValue({
      user: { id: testUserId, email: 'trips-api-test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);
  });

  afterEach(async () => {
    await prisma.trip.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: 'trips-api-test@example.com' },
    });
    await prisma.$disconnect();
  });

  it('should return 401 if not authenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/trips');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return list of active trips', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.trips).toHaveLength(1);
    expect(data.data.trips[0].name).toBe('Test Trip 1');
    expect(data.data.trips[0].isArchived).toBe(false);
  });

  it('should return all trips when status=all', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips?status=all');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.trips).toHaveLength(2);
  });

  it('should filter archived trips when status=archived', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips?status=archived');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.trips).toHaveLength(1);
    expect(data.data.trips[0].isArchived).toBe(true);
  });

  it('should search trips by name', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips?search=Trip 1');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.trips).toHaveLength(1);
    expect(data.data.trips[0].name).toBe('Test Trip 1');
  });

  it('should search trips by destination', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips?search=Berlin');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.trips).toHaveLength(1);
    expect(data.data.trips[0].destinations).toContain('Berlin');
  });

  it('should support pagination', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips?page=1&limit=1');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.trips).toHaveLength(1);
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(1);
    expect(data.data.pagination.total).toBe(1);
  });

  it('should support sorting', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/trips?sort=name&order=asc&status=all'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.trips[0].name).toBe('Test Trip 1');
  });

  it('should return 400 for invalid query params', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips?page=invalid');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should include pagination metadata', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips');
    const response = await GET(req);
    const data = await response.json();

    expect(data.data.pagination).toHaveProperty('page');
    expect(data.data.pagination).toHaveProperty('limit');
    expect(data.data.pagination).toHaveProperty('total');
    expect(data.data.pagination).toHaveProperty('totalPages');
    expect(data.data.pagination).toHaveProperty('hasNext');
    expect(data.data.pagination).toHaveProperty('hasPrevious');
  });

  it('should include trip metadata', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips');
    const response = await GET(req);
    const data = await response.json();

    const trip = data.data.trips[0];
    expect(trip).toHaveProperty('id');
    expect(trip).toHaveProperty('name');
    expect(trip).toHaveProperty('ownerName');
    expect(trip).toHaveProperty('collaboratorCount');
    expect(trip).toHaveProperty('eventCount');
    expect(trip).toHaveProperty('userRole');
    expect(trip.userRole).toBe('owner');
  });
});

describe('POST /api/trips', () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'trips-post-test@example.com',
        firstName: 'Post',
        lastName: 'User',
        password: 'hashedpassword',
      },
    });
    testUserId = user.id;

    mockGetServerSession.mockResolvedValue({
      user: { id: testUserId, email: 'trips-post-test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);
  });

  afterEach(async () => {
    await prisma.tag.deleteMany();
    await prisma.trip.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: 'trips-post-test@example.com' },
    });
    await prisma.$disconnect();
  });

  it('should return 401 if not authenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Trip',
        startDate: '2025-07-01',
        endDate: '2025-07-15',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('should create a new trip', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Trip',
        description: 'A new adventure',
        startDate: '2025-07-01',
        endDate: '2025-07-15',
        destinations: ['Paris', 'London'],
        tags: ['vacation', 'europe'],
        visibility: 'private',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('New Trip');
    expect(data.data.description).toBe('A new adventure');
    expect(data.data.destinations).toEqual(['Paris', 'London']);
    expect(data.data.tags).toEqual(['vacation', 'europe']);
    expect(data.data.userRole).toBe('owner');
    expect(data.data.collaboratorCount).toBe(0);
    expect(data.data.eventCount).toBe(0);
  });

  it('should create trip with minimal required fields', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Minimal Trip',
        startDate: '2025-07-01',
        endDate: '2025-07-15',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.name).toBe('Minimal Trip');
    expect(data.data.visibility).toBe('private'); // default
  });

  it('should return 400 for missing required fields', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Incomplete Trip',
        // Missing startDate and endDate
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toBeDefined();
  });

  it('should return 400 if endDate is before startDate', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invalid Dates',
        startDate: '2025-07-15',
        endDate: '2025-07-01', // Before start date
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid date format', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invalid Date Format',
        startDate: 'not-a-date',
        endDate: '2025-07-15',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for name exceeding max length', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'A'.repeat(201), // Exceeds 200 char limit
        startDate: '2025-07-01',
        endDate: '2025-07-15',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should create trip and associate tags', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Tagged Trip',
        startDate: '2025-07-01',
        endDate: '2025-07-15',
        tags: ['beach', 'relax'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.tags).toEqual(['beach', 'relax']);

    // Verify tags were created in DB
    const tags = await prisma.tag.findMany({
      where: { tripId: data.data.id },
    });
    expect(tags).toHaveLength(2);
  });

  it('should set ownership correctly', async () => {
    const req = new NextRequest('http://localhost:3000/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Owner Test',
        startDate: '2025-07-01',
        endDate: '2025-07-15',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.data.ownerId).toBe(testUserId);
    expect(data.data.ownerName).toBe('Post User');
    expect(data.data.userRole).toBe('owner');
  });
});
