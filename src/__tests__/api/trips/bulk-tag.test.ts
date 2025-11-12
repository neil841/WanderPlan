/**
 * Tests for Bulk Tag Trips API
 *
 * @route POST /api/trips/bulk/tag
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { POST } from '@/app/api/trips/bulk/tag/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import * as authModule from '@/lib/auth/auth-options';

// Mock auth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockAuth = authModule.auth as jest.MockedFunction<typeof authModule.auth>;

describe('POST /api/trips/bulk/tag', () => {
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
        },
        {
          id: mockTripId2,
          name: 'Test Trip 2',
          createdBy: mockUserId,
        },
        {
          id: mockTripId3,
          name: 'Test Trip 3',
          createdBy: mockUserId,
        },
      ],
    });

    // Add existing tag to trip3
    await prisma.tag.create({
      data: {
        tripId: mockTripId3,
        name: 'Existing Tag',
        color: '#3B82F6',
      },
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

  it('should add tags to multiple trips successfully', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1, mockTripId2],
        tagNames: ['vacation', 'europe'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tagged).toBe(2);
    expect(data.failed).toBe(0);
    expect(data.tagsCreated).toBe(4); // 2 tags × 2 trips
    expect(data.results).toHaveLength(2);

    // Verify tags are created in database
    const trip1Tags = await prisma.tag.findMany({
      where: { tripId: mockTripId1 },
    });
    const trip2Tags = await prisma.tag.findMany({
      where: { tripId: mockTripId2 },
    });

    expect(trip1Tags).toHaveLength(2);
    expect(trip2Tags).toHaveLength(2);
    expect(trip1Tags.map((t) => t.name).sort()).toEqual(['europe', 'vacation']);
    expect(trip2Tags.map((t) => t.name).sort()).toEqual(['europe', 'vacation']);
  });

  it('should add tags with custom color', async () => {
    const customColor = '#FF5733';

    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1],
        tagNames: ['custom-color-tag'],
        tagColor: customColor,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tagged).toBe(1);

    // Verify tag color
    const tag = await prisma.tag.findFirst({
      where: {
        tripId: mockTripId1,
        name: 'custom-color-tag',
      },
    });

    expect(tag?.color).toBe(customColor);
  });

  it('should skip existing tags and only add new ones', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId3],
        tagNames: ['Existing Tag', 'New Tag'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tagged).toBe(1);
    expect(data.tagsCreated).toBe(1); // Only 'New Tag' is created

    const result = data.results[0];
    expect(result.tagsAdded).toBe(1);
    expect(result.skipped).toBe(1);

    // Verify only one new tag was added
    const tags = await prisma.tag.findMany({
      where: { tripId: mockTripId3 },
    });

    expect(tags).toHaveLength(2);
    expect(tags.map((t) => t.name).sort()).toEqual(['Existing Tag', 'New Tag']);
  });

  it('should fail for non-existent trip IDs', async () => {
    const nonExistentId = 'non-existent-trip-id';

    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1, nonExistentId],
        tagNames: ['test-tag'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(207); // Multi-status for partial success
    expect(data.tagged).toBe(1); // Only trip1
    expect(data.failed).toBe(1); // non-existent trip

    const failedResult = data.results.find(
      (r: { tripId: string }) => r.tripId === nonExistentId
    );
    expect(failedResult?.success).toBe(false);
    expect(failedResult?.reason).toContain('not found or insufficient permissions');
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1],
        tagNames: ['test-tag'],
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid request body', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [], // Empty array
        tagNames: ['test-tag'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 for invalid trip ID format', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: ['not-a-uuid'],
        tagNames: ['test-tag'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 for invalid tag color format', async () => {
    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1],
        tagNames: ['test-tag'],
        tagColor: 'not-a-hex-color',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should allow editor collaborators to tag trips', async () => {
    const otherUserId = 'other-user-456';

    // Create trip owned by another user
    const otherUserTrip = await prisma.trip.create({
      data: {
        id: 'other-trip-001',
        name: 'Other User Trip',
        createdBy: otherUserId,
      },
    });

    // Add current user as editor collaborator
    await prisma.tripCollaborator.create({
      data: {
        tripId: otherUserTrip.id,
        userId: mockUserId,
        role: 'EDITOR',
        status: 'ACCEPTED',
        invitedBy: otherUserId,
      },
    });

    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [otherUserTrip.id],
        tagNames: ['collab-tag'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tagged).toBe(1);

    // Verify tag was created
    const tag = await prisma.tag.findFirst({
      where: {
        tripId: otherUserTrip.id,
        name: 'collab-tag',
      },
    });
    expect(tag).not.toBeNull();

    // Clean up
    await prisma.tag.deleteMany({ where: { tripId: otherUserTrip.id } });
    await prisma.tripCollaborator.deleteMany({
      where: { tripId: otherUserTrip.id },
    });
    await prisma.trip.delete({ where: { id: otherUserTrip.id } });
  });

  it('should not allow viewer collaborators to tag trips', async () => {
    const otherUserId = 'other-user-456';

    // Create trip owned by another user
    const otherUserTrip = await prisma.trip.create({
      data: {
        id: 'other-trip-001',
        name: 'Other User Trip',
        createdBy: otherUserId,
      },
    });

    // Add current user as viewer collaborator
    await prisma.tripCollaborator.create({
      data: {
        tripId: otherUserTrip.id,
        userId: mockUserId,
        role: 'VIEWER',
        status: 'ACCEPTED',
        invitedBy: otherUserId,
      },
    });

    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [otherUserTrip.id],
        tagNames: ['viewer-tag'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(207); // Partial failure
    expect(data.failed).toBe(1);

    // Verify tag was NOT created
    const tag = await prisma.tag.findFirst({
      where: {
        tripId: otherUserTrip.id,
        name: 'viewer-tag',
      },
    });
    expect(tag).toBeNull();

    // Clean up
    await prisma.tripCollaborator.deleteMany({
      where: { tripId: otherUserTrip.id },
    });
    await prisma.trip.delete({ where: { id: otherUserTrip.id } });
  });

  it('should handle more than 100 trip IDs with validation error', async () => {
    const tooManyTripIds = Array.from({ length: 101 }, (_, i) => `trip-${i}`);

    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: tooManyTripIds,
        tagNames: ['test-tag'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should handle more than 10 tags with validation error', async () => {
    const tooManyTags = Array.from({ length: 11 }, (_, i) => `tag-${i}`);

    const req = new NextRequest('http://localhost/api/trips/bulk/tag', {
      method: 'POST',
      body: JSON.stringify({
        tripIds: [mockTripId1],
        tagNames: tooManyTags,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});
