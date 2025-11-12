/**
 * Tag API Tests
 *
 * Tests for tag CRUD operations: GET, POST, DELETE
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET as getTags, POST as createTag } from '@/app/api/tags/route';
import { DELETE as deleteTag } from '@/app/api/tags/[tagId]/route';
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth-options';

// Mock NextAuth
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('Tags API', () => {
  let testUser: any;
  let otherUser: any;
  let testTrip: any;
  let otherUserTrip: any;
  let testTag: any;

  beforeEach(async () => {
    // Clean up existing test data
    await prisma.tag.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['tagtest@example.com', 'other@example.com'],
        },
      },
    });

    // Create test users
    testUser = await prisma.user.create({
      data: {
        email: 'tagtest@example.com',
        firstName: 'Tag',
        lastName: 'Tester',
        password: 'hashed_password',
      },
    });

    otherUser = await prisma.user.create({
      data: {
        email: 'other@example.com',
        firstName: 'Other',
        lastName: 'User',
        password: 'hashed_password',
      },
    });

    // Create test trips
    testTrip = await prisma.trip.create({
      data: {
        name: 'Test Trip for Tags',
        createdBy: testUser.id,
      },
    });

    otherUserTrip = await prisma.trip.create({
      data: {
        name: 'Other User Trip',
        createdBy: otherUser.id,
      },
    });

    // Create initial tag
    testTag = await prisma.tag.create({
      data: {
        name: 'adventure',
        color: '#FF5733',
        tripId: testTrip.id,
      },
    });
  });

  afterEach(async () => {
    // Clean up
    await prisma.tag.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['tagtest@example.com', 'other@example.com'],
        },
      },
    });
    jest.clearAllMocks();
  });

  describe('GET /api/tags', () => {
    it('should return 401 if not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/api/tags');
      const response = await getTags(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should list all tags for authenticated user', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      // Create additional tags
      await prisma.tag.create({
        data: {
          name: 'beach',
          color: '#00BFFF',
          tripId: testTrip.id,
        },
      });

      const req = new NextRequest('http://localhost:3000/api/tags');
      const response = await getTags(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.tags).toHaveLength(2);
      expect(data.data.total).toBe(2);
      expect(data.data.aggregated).toHaveLength(2);
    });

    it('should filter tags by tripId', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      // Create tag for different trip
      const anotherTrip = await prisma.trip.create({
        data: {
          name: 'Another Trip',
          createdBy: testUser.id,
        },
      });

      await prisma.tag.create({
        data: {
          name: 'mountain',
          tripId: anotherTrip.id,
        },
      });

      const req = new NextRequest(
        `http://localhost:3000/api/tags?tripId=${testTrip.id}`
      );
      const response = await getTags(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.tags).toHaveLength(1);
      expect(data.data.tags[0].tripId).toBe(testTrip.id);
    });

    it('should include tags from trips where user is a collaborator', async () => {
      // Add testUser as collaborator on otherUserTrip
      await prisma.tripCollaborator.create({
        data: {
          tripId: otherUserTrip.id,
          userId: testUser.id,
          role: 'EDITOR',
          status: 'ACCEPTED',
          invitedBy: otherUser.id,
        },
      });

      // Create tag on otherUserTrip
      await prisma.tag.create({
        data: {
          name: 'shared',
          tripId: otherUserTrip.id,
        },
      });

      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags');
      const response = await getTags(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.tags.length).toBeGreaterThanOrEqual(2);

      // Should include tags from both trips
      const tripIds = data.data.tags.map((tag: any) => tag.tripId);
      expect(tripIds).toContain(testTrip.id);
      expect(tripIds).toContain(otherUserTrip.id);
    });

    it('should return aggregated tag statistics', async () => {
      // Create duplicate tag name on different trip
      const anotherTrip = await prisma.trip.create({
        data: {
          name: 'Another Trip',
          createdBy: testUser.id,
        },
      });

      await prisma.tag.create({
        data: {
          name: 'adventure', // Same name as testTag
          color: '#00FF00',
          tripId: anotherTrip.id,
        },
      });

      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags');
      const response = await getTags(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Should have aggregated data showing 'adventure' used twice
      const adventureAgg = data.data.aggregated.find(
        (tag: any) => tag.name === 'adventure'
      );
      expect(adventureAgg).toBeDefined();
      expect(adventureAgg.count).toBe(2);
      expect(adventureAgg.tripIds).toHaveLength(2);
    });
  });

  describe('POST /api/tags', () => {
    it('should return 401 if not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: testTrip.id,
          name: 'newtag',
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should create a tag for valid trip', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: testTrip.id,
          name: 'newtag',
          color: '#123456',
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('newtag');
      expect(data.data.color).toBe('#123456');
      expect(data.data.tripId).toBe(testTrip.id);
    });

    it('should return 400 for invalid tag name', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: testTrip.id,
          name: 'invalid@tag!', // Invalid characters
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid color format', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: testTrip.id,
          name: 'validtag',
          color: 'not-a-hex-color',
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent trip', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: '550e8400-e29b-41d4-a716-446655440000', // Non-existent
          name: 'newtag',
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 if user has no access to trip', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: otherUserTrip.id, // Trip owned by otherUser
          name: 'newtag',
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should allow collaborators with EDITOR role to create tags', async () => {
      // Add testUser as EDITOR collaborator
      await prisma.tripCollaborator.create({
        data: {
          tripId: otherUserTrip.id,
          userId: testUser.id,
          role: 'EDITOR',
          status: 'ACCEPTED',
          invitedBy: otherUser.id,
        },
      });

      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: otherUserTrip.id,
          name: 'collab-tag',
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should reject VIEWER collaborators from creating tags', async () => {
      // Add testUser as VIEWER collaborator
      await prisma.tripCollaborator.create({
        data: {
          tripId: otherUserTrip.id,
          userId: testUser.id,
          role: 'VIEWER',
          status: 'ACCEPTED',
          invitedBy: otherUser.id,
        },
      });

      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: otherUserTrip.id,
          name: 'viewer-tag',
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it('should return 409 if tag name already exists for trip', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: testTrip.id,
          name: 'adventure', // Already exists
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('CONFLICT');
    });

    it('should trim whitespace from tag names', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({
          tripId: testTrip.id,
          name: '  spaced  ',
        }),
      });

      const response = await createTag(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('spaced');
    });
  });

  describe('DELETE /api/tags/[tagId]', () => {
    it('should return 401 if not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new NextRequest(
        `http://localhost:3000/api/tags/${testTag.id}`,
        { method: 'DELETE' }
      );

      const response = await deleteTag(req, { params: { tagId: testTag.id } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should delete tag if user is trip owner', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest(
        `http://localhost:3000/api/tags/${testTag.id}`,
        { method: 'DELETE' }
      );

      const response = await deleteTag(req, { params: { tagId: testTag.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('adventure');

      // Verify tag was deleted
      const deletedTag = await prisma.tag.findUnique({
        where: { id: testTag.id },
      });
      expect(deletedTag).toBeNull();
    });

    it('should return 404 for non-existent tag', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const req = new NextRequest(`http://localhost:3000/api/tags/${fakeId}`, {
        method: 'DELETE',
      });

      const response = await deleteTag(req, { params: { tagId: fakeId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid tag ID format', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest(
        'http://localhost:3000/api/tags/invalid-id',
        { method: 'DELETE' }
      );

      const response = await deleteTag(req, { params: { tagId: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 403 if user has no access to trip', async () => {
      // Create tag on otherUserTrip
      const otherTag = await prisma.tag.create({
        data: {
          name: 'other-tag',
          tripId: otherUserTrip.id,
        },
      });

      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest(
        `http://localhost:3000/api/tags/${otherTag.id}`,
        { method: 'DELETE' }
      );

      const response = await deleteTag(req, { params: { tagId: otherTag.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should allow EDITOR collaborators to delete tags', async () => {
      // Create tag on otherUserTrip
      const otherTag = await prisma.tag.create({
        data: {
          name: 'collab-tag',
          tripId: otherUserTrip.id,
        },
      });

      // Add testUser as EDITOR
      await prisma.tripCollaborator.create({
        data: {
          tripId: otherUserTrip.id,
          userId: testUser.id,
          role: 'EDITOR',
          status: 'ACCEPTED',
          invitedBy: otherUser.id,
        },
      });

      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest(
        `http://localhost:3000/api/tags/${otherTag.id}`,
        { method: 'DELETE' }
      );

      const response = await deleteTag(req, { params: { tagId: otherTag.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject VIEWER collaborators from deleting tags', async () => {
      // Create tag on otherUserTrip
      const otherTag = await prisma.tag.create({
        data: {
          name: 'viewer-tag',
          tripId: otherUserTrip.id,
        },
      });

      // Add testUser as VIEWER
      await prisma.tripCollaborator.create({
        data: {
          tripId: otherUserTrip.id,
          userId: testUser.id,
          role: 'VIEWER',
          status: 'ACCEPTED',
          invitedBy: otherUser.id,
        },
      });

      mockAuth.mockResolvedValueOnce({
        user: { id: testUser.id, email: testUser.email },
      } as any);

      const req = new NextRequest(
        `http://localhost:3000/api/tags/${otherTag.id}`,
        { method: 'DELETE' }
      );

      const response = await deleteTag(req, { params: { tagId: otherTag.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });
});
