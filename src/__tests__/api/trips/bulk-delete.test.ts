/**
 * Tests for Bulk Delete Trips API
 *
 * @route POST /api/trips/bulk/delete
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { POST } from '@/app/api/trips/bulk/delete/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import * as authModule from '@/lib/auth/auth-options';

// Mock auth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockAuth = authModule.auth as jest.MockedFunction<typeof authModule.auth>;

describe('POST /api/trips/bulk/delete', () => {
  const mockUserId = 'user-123';
  const mockTripId1 = 'trip-001';
  const mockTripId2 = 'trip-002';
  const mockTripId3 = 'trip-003';

  beforeEach(async () => {
    // Mock authenticated session
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });

    // Clean up test data
    await prisma.tag.deleteMany({
      where: {
        trip: {
          createdBy: mockUserId,
        },
      },
    });
    await prisma.trip.deleteMany({
      where: { createdBy: mockUserId },
    });

    // Create test trips
    await prisma.trip.createMany({
      data: [
        {
          id: mockTripId1,
          name: 'Test Trip 1',
          createdBy: mockUserId,
          deletedAt: null,
        },
        {
          id: mockTripId2,
          name: 'Test Trip 2',
          createdBy: mockUserId,
          deletedAt: null,
        },
        {
          id: mockTripId3,
          name: 'Test Trip 3 (Already Deleted)',
          createdBy: mockUserId,
          deletedAt: new Date('2024-01-01'),
        },
      ],
    });
  });

  afterEach(async () => {
    // Clean up
    await prisma.tag.deleteMany({
      where: {
        trip: {
          createdBy: mockUserId,
        },
      },
    });
    await prisma.trip.deleteMany({
      where: { createdBy: mockUserId },
    });
    jest.clearAllMocks();
  });

  it('should delete multiple trips successfully', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1, mockTripId2],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deleted).toBe(2);
    expect(data.failed).toBe(0);
    expect(data.results).toHaveLength(2);

    // Verify trips are soft deleted in database
    const trip1 = await prisma.trip.findUnique({
      where: { id: mockTripId1 },
      select: { deletedAt: true },
    });
    const trip2 = await prisma.trip.findUnique({
      where: { id: mockTripId2 },
      select: { deletedAt: true },
    });

    expect(trip1?.deletedAt).not.toBeNull();
    expect(trip2?.deletedAt).not.toBeNull();
  });

  it('should handle already deleted trips gracefully', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1, mockTripId3], // trip3 is already deleted
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deleted).toBe(2); // Both marked as success
    expect(data.failed).toBe(0);

    // Check that one has "Already deleted" reason
    const alreadyDeletedResult = data.results.find(
      (r: { tripId: string }) => r.tripId === mockTripId3
    );
    expect(alreadyDeletedResult?.reason).toBe('Already deleted');
  });

  it('should fail for non-existent trip IDs', async () => {
    const nonExistentId = 'non-existent-trip-id';

    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1, nonExistentId],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(207); // Multi-status for partial success
    expect(data.deleted).toBe(1); // Only trip1
    expect(data.failed).toBe(1); // non-existent trip

    const failedResult = data.results.find(
      (r: { tripId: string }) => r.tripId === nonExistentId
    );
    expect(failedResult?.success).toBe(false);
    expect(failedResult?.reason).toContain('not found or you are not the owner');
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1],
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid request body', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [], // Empty array
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 for invalid trip ID format', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: ['not-a-uuid'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should not delete trips owned by other users (even if admin collaborator)', async () => {
    const otherUserId = 'other-user-456';

    // Create trip owned by another user
    const otherUserTrip = await prisma.trip.create({
      data: {
        id: 'other-trip-001',
        name: 'Other User Trip',
        createdBy: otherUserId,
        deletedAt: null,
      },
    });

    // Add current user as admin collaborator
    await prisma.tripCollaborator.create({
      data: {
        tripId: otherUserTrip.id,
        userId: mockUserId,
        role: 'ADMIN',
        status: 'ACCEPTED',
        invitedBy: otherUserId,
      },
    });

    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1, otherUserTrip.id],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(207); // Partial success
    expect(data.deleted).toBe(1); // Only user's own trip
    expect(data.failed).toBe(1);

    // Verify other user's trip was not deleted
    const otherTrip = await prisma.trip.findUnique({
      where: { id: otherUserTrip.id },
      select: { deletedAt: true },
    });
    expect(otherTrip?.deletedAt).toBeNull();

    // Clean up
    await prisma.tripCollaborator.deleteMany({
      where: { tripId: otherUserTrip.id },
    });
    await prisma.trip.delete({ where: { id: otherUserTrip.id } });
  });

  it('should handle more than 50 trip IDs with validation error', async () => {
    const tooManyTripIds = Array.from({ length: 51 }, (_, i) => `trip-${i}`);

    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: tooManyTripIds,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should preserve trip data after soft delete', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1],
      }),
    });

    await POST(req);

    // Verify trip still exists but is soft deleted
    const trip = await prisma.trip.findUnique({
      where: { id: mockTripId1 },
      select: {
        id: true,
        name: true,
        deletedAt: true,
        createdBy: true,
      },
    });

    expect(trip).not.toBeNull();
    expect(trip?.id).toBe(mockTripId1);
    expect(trip?.name).toBe('Test Trip 1');
    expect(trip?.createdBy).toBe(mockUserId);
    expect(trip?.deletedAt).not.toBeNull();
  });
});
