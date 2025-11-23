/**
 * Integration Tests: PDF Export API
 *
 * Tests the PDF export functionality for trips
 */

import { NextRequest } from 'next/server';
import { GET as pdfExportHandler } from '@/app/api/trips/[tripId]/export/pdf/route';
import { prisma } from '@/lib/db';
import * as auth from '@/lib/auth/session';

// Mock authentication
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    trip: {
      findUnique: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
    budget: {
      findMany: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
    },
    collaborator: {
      findMany: jest.fn(),
    },
  },
}));

describe('PDF Export API - Integration Tests', () => {
  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
  };

  const mockTrip = {
    id: 'trip_123',
    userId: 'user_123',
    name: 'Paris Trip',
    description: 'A wonderful trip to Paris',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-10'),
    destination: 'Paris, France',
    status: 'UPCOMING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvents = [
    {
      id: 'event_1',
      tripId: 'trip_123',
      type: 'FLIGHT',
      name: 'Flight to Paris',
      startTime: new Date('2025-06-01T10:00:00Z'),
      endTime: new Date('2025-06-01T14:00:00Z'),
      location: 'CDG Airport',
      cost: 500,
      notes: 'United Flight 123',
    },
    {
      id: 'event_2',
      tripId: 'trip_123',
      type: 'HOTEL',
      name: 'Hotel Ritz Paris',
      startTime: new Date('2025-06-01T15:00:00Z'),
      endTime: new Date('2025-06-10T11:00:00Z'),
      location: '15 Place Vendôme, Paris',
      cost: 2000,
      notes: 'Deluxe room',
    },
  ];

  const mockBudget = {
    id: 'budget_123',
    tripId: 'trip_123',
    totalBudget: 5000,
    currency: 'USD',
  };

  const mockExpenses = [
    {
      id: 'expense_1',
      budgetId: 'budget_123',
      description: 'Flight',
      amount: 500,
      category: 'TRANSPORTATION',
      createdAt: new Date(),
    },
  ];

  const mockCollaborators = [
    {
      id: 'collab_1',
      tripId: 'trip_123',
      userId: 'user_456',
      role: 'VIEWER',
      user: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);
    (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
    (prisma.budget.findMany as jest.Mock).mockResolvedValue([mockBudget]);
    (prisma.expense.findMany as jest.Mock).mockResolvedValue(mockExpenses);
    (prisma.collaborator.findMany as jest.Mock).mockResolvedValue(
      mockCollaborators
    );
  });

  describe('✅ Happy Path', () => {
    it('should generate PDF for trip owner', async () => {
      const request = new Request(
        'http://localhost:3000/api/trips/trip_123/export/pdf',
        {
          method: 'GET',
        }
      );

      const response = await pdfExportHandler(request as NextRequest, {
        params: { tripId: 'trip_123' },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/pdf');
      expect(response.headers.get('Content-Disposition')).toContain(
        'attachment'
      );
      expect(response.headers.get('Content-Disposition')).toContain(
        'Paris_Trip'
      );
    });

    it('should include all trip sections in PDF', async () => {
      const request = new Request(
        'http://localhost:3000/api/trips/trip_123/export/pdf',
        {
          method: 'GET',
        }
      );

      await pdfExportHandler(request as NextRequest, {
        params: { tripId: 'trip_123' },
      });

      // Verify all data was queried
      expect(prisma.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 'trip_123' },
        include: expect.objectContaining({
          collaborators: expect.any(Object),
        }),
      });
      expect(prisma.event.findMany).toHaveBeenCalled();
      expect(prisma.budget.findMany).toHaveBeenCalled();
      expect(prisma.expense.findMany).toHaveBeenCalled();
    });
  });

  describe('🔒 Authorization', () => {
    it('should return 401 for unauthenticated users', async () => {
      (auth.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const request = new Request(
        'http://localhost:3000/api/trips/trip_123/export/pdf',
        {
          method: 'GET',
        }
      );

      const response = await pdfExportHandler(request as NextRequest, {
        params: { tripId: 'trip_123' },
      });

      expect(response.status).toBe(401);
    });

    it('should return 403 for unauthorized users', async () => {
      (auth.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user_999',
        email: 'unauthorized@example.com',
      });

      const request = new Request(
        'http://localhost:3000/api/trips/trip_123/export/pdf',
        {
          method: 'GET',
        }
      );

      const response = await pdfExportHandler(request as NextRequest, {
        params: { tripId: 'trip_123' },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('🚧 Edge Cases', () => {
    it('should return 404 for non-existent trip', async () => {
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new Request(
        'http://localhost:3000/api/trips/nonexistent/export/pdf',
        {
          method: 'GET',
        }
      );

      const response = await pdfExportHandler(request as NextRequest, {
        params: { tripId: 'nonexistent' },
      });

      expect(response.status).toBe(404);
    });

    it('should handle trip with no events', async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        'http://localhost:3000/api/trips/trip_123/export/pdf',
        {
          method: 'GET',
        }
      );

      const response = await pdfExportHandler(request as NextRequest, {
        params: { tripId: 'trip_123' },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/pdf');
    });

    it('should handle trip with no budget', async () => {
      (prisma.budget.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        'http://localhost:3000/api/trips/trip_123/export/pdf',
        {
          method: 'GET',
        }
      );

      const response = await pdfExportHandler(request as NextRequest, {
        params: { tripId: 'trip_123' },
      });

      expect(response.status).toBe(200);
    });
  });

  describe('⚠️ Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (prisma.trip.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new Request(
        'http://localhost:3000/api/trips/trip_123/export/pdf',
        {
          method: 'GET',
        }
      );

      const response = await pdfExportHandler(request as NextRequest, {
        params: { tripId: 'trip_123' },
      });

      expect(response.status).toBe(500);
    });
  });
});
