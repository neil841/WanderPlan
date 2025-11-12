/**
 * Tests for Trip Sharing API
 *
 * @route POST /api/trips/[tripId]/share
 * @route GET /api/trips/[tripId]/share
 * @route DELETE /api/trips/[tripId]/share
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { POST, GET, DELETE } from '@/app/api/trips/[tripId]/share/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';

// Mock auth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('POST /api/trips/[tripId]/share', () => {
  const userId = 'user-123';
  const tripId = 'trip-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup
    await prisma.tripShareToken.deleteMany({ where: { tripId } });
  });

  it('should create share token with default settings', async () => {
    // Mock auth session
    mockAuth.mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);

    // Create test trip
    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId,
      },
    });

    // Create request
    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('token');
    expect(data.data).toHaveProperty('shareUrl');
    expect(data.data).toHaveProperty('expiresAt');
    expect(data.data.permissions).toBe('view_only');

    // Verify token was created in database
    const token = await prisma.tripShareToken.findUnique({
      where: { token: data.data.token },
    });
    expect(token).toBeDefined();
    expect(token?.isActive).toBe(true);

    // Cleanup
    await prisma.trip.delete({ where: { id: trip.id } });
  });

  it('should create share token with custom expiry', async () => {
    mockAuth.mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId,
      },
    });

    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'POST',
      body: JSON.stringify({ expiresIn: 7 }), // 7 days
    });

    const response = await POST(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(201);

    const expiresAt = new Date(data.data.expiresAt);
    const expectedExpiry = new Date();
    expectedExpiry.setDate(expectedExpiry.getDate() + 7);

    // Check expiry is within 1 minute of expected (accounting for test execution time)
    const diff = Math.abs(expiresAt.getTime() - expectedExpiry.getTime());
    expect(diff).toBeLessThan(60000); // 1 minute in milliseconds

    await prisma.trip.delete({ where: { id: trip.id } });
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req, { params: { tripId } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 404 if trip not found', async () => {
    mockAuth.mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);

    const req = new NextRequest('http://localhost/api/trips/nonexistent/share', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req, { params: { tripId: 'nonexistent' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('should return 403 if user is not owner or admin', async () => {
    const otherUserId = 'other-user-789';
    mockAuth.mockResolvedValue({
      user: { id: otherUserId, email: 'other@example.com' },
    } as any);

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId, // Different owner
      },
    });

    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Forbidden');

    await prisma.trip.delete({ where: { id: trip.id } });
  });

  it('should validate expiresIn is within range', async () => {
    mockAuth.mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId,
      },
    });

    // Test with invalid value (> 365 days)
    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'POST',
      body: JSON.stringify({ expiresIn: 400 }),
    });

    const response = await POST(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Validation failed');

    await prisma.trip.delete({ where: { id: trip.id } });
  });
});

describe('GET /api/trips/[tripId]/share', () => {
  const userId = 'user-123';
  const tripId = 'trip-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await prisma.tripShareToken.deleteMany({ where: { tripId } });
  });

  it('should list all active share tokens', async () => {
    mockAuth.mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId,
      },
    });

    // Create two share tokens
    const token1 = await prisma.tripShareToken.create({
      data: {
        tripId: trip.id,
        createdBy: userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    const token2 = await prisma.tripShareToken.create({
      data: {
        tripId: trip.id,
        createdBy: userId,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'GET',
    });

    const response = await GET(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.tokens).toHaveLength(2);
    expect(data.data.count).toBe(2);

    await prisma.trip.delete({ where: { id: trip.id } });
  });

  it('should not list revoked tokens', async () => {
    mockAuth.mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId,
      },
    });

    // Create active and revoked tokens
    await prisma.tripShareToken.create({
      data: {
        tripId: trip.id,
        createdBy: userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    await prisma.tripShareToken.create({
      data: {
        tripId: trip.id,
        createdBy: userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: false, // Revoked
        revokedAt: new Date(),
      },
    });

    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'GET',
    });

    const response = await GET(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.tokens).toHaveLength(1); // Only active token

    await prisma.trip.delete({ where: { id: trip.id } });
  });

  it('should not list expired tokens', async () => {
    mockAuth.mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId,
      },
    });

    // Create expired token
    await prisma.tripShareToken.create({
      data: {
        tripId: trip.id,
        createdBy: userId,
        expiresAt: new Date(Date.now() - 1000), // Expired
        isActive: true,
      },
    });

    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'GET',
    });

    const response = await GET(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.tokens).toHaveLength(0); // No active, non-expired tokens

    await prisma.trip.delete({ where: { id: trip.id } });
  });
});

describe('DELETE /api/trips/[tripId]/share', () => {
  const userId = 'user-123';
  const tripId = 'trip-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await prisma.tripShareToken.deleteMany({ where: { tripId } });
  });

  it('should revoke all share tokens', async () => {
    mockAuth.mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId,
      },
    });

    // Create multiple tokens
    await prisma.tripShareToken.createMany({
      data: [
        {
          tripId: trip.id,
          createdBy: userId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        {
          tripId: trip.id,
          createdBy: userId,
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      ],
    });

    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'DELETE',
    });

    const response = await DELETE(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.revokedCount).toBe(2);

    // Verify tokens are revoked
    const tokens = await prisma.tripShareToken.findMany({
      where: { tripId: trip.id },
    });
    expect(tokens.every((t) => !t.isActive)).toBe(true);
    expect(tokens.every((t) => t.revokedAt !== null)).toBe(true);

    await prisma.trip.delete({ where: { id: trip.id } });
  });

  it('should return 403 if user is not owner or admin', async () => {
    const otherUserId = 'other-user-789';
    mockAuth.mockResolvedValue({
      user: { id: otherUserId, email: 'other@example.com' },
    } as any);

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        createdBy: userId, // Different owner
      },
    });

    const req = new NextRequest('http://localhost/api/trips/trip-456/share', {
      method: 'DELETE',
    });

    const response = await DELETE(req, { params: { tripId: trip.id } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Forbidden');

    await prisma.trip.delete({ where: { id: trip.id } });
  });
});
