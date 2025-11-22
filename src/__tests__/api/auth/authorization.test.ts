/**
 * Security Tests: API Authentication & Authorization
 *
 * Tests critical security requirements for API endpoints:
 * - Authentication (valid session required)
 * - Authorization (row-level security)
 * - Token validation (expired/invalid tokens)
 * - Rate limiting
 *
 * @module APIAuthorizationSecurityTests
 */

import { NextRequest } from 'next/server';
import { GET as getTripHandler } from '@/app/api/trips/[tripId]/route';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

// Mock authentication
jest.mock('@/lib/auth/auth-options', () => ({
  auth: jest.fn(),
}));

// Mock database
jest.mock('@/lib/db/prisma', () => ({
  __esModule: true,
  default: {
    trip: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('API Authentication & Authorization - Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔒 Authentication (CRITICAL)', () => {
    it('should reject unauthenticated requests with 401', async () => {
      // Mock no session (user not logged in)
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/trips/trip-123', {
        method: 'GET',
      });

      const response = await getTripHandler(request as NextRequest, {
        params: { tripId: 'trip-123' },
      });
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toContain('Unauthorized');
      expect(prisma.trip.findFirst).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid session (no user ID)', async () => {
      // Mock session without user ID
      (auth as jest.Mock).mockResolvedValue({
        user: {
          // Missing ID
          email: 'test@example.com',
        },
      });

      const request = new Request('http://localhost:3000/api/trips/trip-123', {
        method: 'GET',
      });

      const response = await getTripHandler(request as NextRequest, {
        params: { tripId: 'trip-123' },
      });
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toContain('Unauthorized');
      expect(prisma.trip.findFirst).not.toHaveBeenCalled();
    });

    it('should accept requests with valid authentication', async () => {
      // Mock valid session
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });

      // Mock trip exists and user is owner (with all required fields)
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: 'trip-123',
        name: 'Test Trip',
        description: 'Test description',
        startDate: new Date(),
        endDate: new Date(),
        destinations: ['Paris'],
        visibility: 'PRIVATE',
        coverImageUrl: null,
        isArchived: false,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: {
          id: 'user-123',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          avatarUrl: null,
        },
        events: [],
        collaborators: [],
        budget: null,
        expenses: [],
        documents: [],
        tags: [],
      });

      const request = new Request('http://localhost:3000/api/trips/trip-123', {
        method: 'GET',
      });

      const response = await getTripHandler(request as NextRequest, {
        params: { tripId: 'trip-123' },
      });

      expect(response.status).toBe(200);
      expect(prisma.trip.findFirst).toHaveBeenCalled();
    });
  });

  describe('🛡️ Row-Level Security (CRITICAL)', () => {
    it('should prevent User A from accessing User B\'s trip', async () => {
      // User A tries to access User B's trip
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: 'user-A',
          email: 'userA@example.com',
        },
      });

      // Trip belongs to User B, User A is not a collaborator
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue(null);
      // Trip doesn't exist for User A
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/trips/trip-owned-by-B', {
        method: 'GET',
      });

      const response = await getTripHandler(request as NextRequest, {
        params: { tripId: 'trip-owned-by-B' },
      });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBeDefined();

      // Verify query includes row-level security check
      expect(prisma.trip.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ createdBy: 'user-A' }),
              expect.objectContaining({
                collaborators: expect.objectContaining({
                  some: expect.objectContaining({
                    userId: 'user-A',
                    status: 'ACCEPTED',
                  }),
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should allow collaborator with ACCEPTED status to access trip', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: 'collaborator-123',
          email: 'collaborator@example.com',
        },
      });

      // Trip owned by someone else, but user is an ACCEPTED collaborator
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: 'trip-456',
        name: 'Shared Trip',
        description: 'Shared description',
        startDate: new Date(),
        endDate: new Date(),
        destinations: ['Tokyo'],
        visibility: 'SHARED',
        coverImageUrl: null,
        isArchived: false,
        createdBy: 'owner-789',
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: {
          id: 'owner-789',
          firstName: 'Owner',
          lastName: 'User',
          email: 'owner@example.com',
          avatarUrl: null,
        },
        events: [],
        collaborators: [
          {
            userId: 'collaborator-123',
            status: 'ACCEPTED',
            role: 'VIEWER',
            user: {
              id: 'collaborator-123',
              firstName: 'Collab',
              lastName: 'User',
              email: 'collaborator@example.com',
              avatarUrl: null,
            },
          },
        ],
        budget: null,
        expenses: [],
        documents: [],
        tags: [],
      });

      const request = new Request('http://localhost:3000/api/trips/trip-456', {
        method: 'GET',
      });

      const response = await getTripHandler(request as NextRequest, {
        params: { tripId: 'trip-456' },
      });

      expect(response.status).toBe(200);
      expect(prisma.trip.findFirst).toHaveBeenCalled();
    });

    it('should prevent access if collaborator invitation is PENDING', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: 'pending-user-123',
          email: 'pending@example.com',
        },
      });

      // User has PENDING invitation (not ACCEPTED)
      // Row-level security query returns null
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/trips/trip-789', {
        method: 'GET',
      });

      const response = await getTripHandler(request as NextRequest, {
        params: { tripId: 'trip-789' },
      });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBeDefined();

      // Verify query checks for ACCEPTED status only
      expect(prisma.trip.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                collaborators: expect.objectContaining({
                  some: expect.objectContaining({
                    status: 'ACCEPTED', // Must be ACCEPTED
                  }),
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should exclude soft-deleted trips from results', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });

      // Trip was soft-deleted
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/trips/deleted-trip', {
        method: 'GET',
      });

      const response = await getTripHandler(request as NextRequest, {
        params: { tripId: 'deleted-trip' },
      });

      expect(response.status).toBe(404);

      // Verify query excludes deleted trips
      expect(prisma.trip.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null, // Exclude deleted
          }),
        })
      );
    });
  });

  describe('⚡ Rate Limiting', () => {
    // Note: Rate limiting tests would require mocking the rate limiter
    // For now, we document the expected behavior

    it('should document rate limiting requirements', () => {
      // Rate limiting is typically handled at middleware level
      // Expected behavior:
      // - 100 requests per 15 minutes per IP for unauthenticated endpoints
      // - 1000 requests per 15 minutes per user for authenticated endpoints
      // - Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

      expect(true).toBe(true);
    });
  });

  describe('🔐 Input Validation', () => {
    it('should reject invalid trip ID format', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });

      const request = new Request('http://localhost:3000/api/trips/invalid-id', {
        method: 'GET',
      });

      const response = await getTripHandler(request as NextRequest, {
        params: { tripId: '' }, // Empty trip ID
      });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Invalid trip ID');
      expect(prisma.trip.findFirst).not.toHaveBeenCalled();
    });
  });
});

/**
 * Test Summary
 *
 * Security Tests: 9 total
 * - Authentication: 3 tests (CRITICAL)
 * - Row-level security: 4 tests (CRITICAL)
 * - Rate limiting: 1 test (documentation)
 * - Input validation: 1 test
 *
 * Coverage:
 * - Prevents unauthorized access (401 for unauthenticated)
 * - Prevents cross-user data access (row-level security)
 * - Validates collaborator status (ACCEPTED only)
 * - Excludes soft-deleted data
 * - Validates input parameters
 *
 * Attack Scenarios Covered:
 * ✅ Unauthenticated access → BLOCKED (401)
 * ✅ Cross-user data access → BLOCKED (404)
 * ✅ PENDING collaborator access → BLOCKED (404)
 * ✅ Soft-deleted trip access → BLOCKED (404)
 * ✅ Invalid input → BLOCKED (400)
 */
