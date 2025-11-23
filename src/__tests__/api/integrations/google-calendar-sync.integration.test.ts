/**
 * Integration Tests: Google Calendar Sync API
 *
 * Tests the Google Calendar integration for syncing trip events
 */

import { NextRequest } from 'next/server';
import { POST as calendarSyncHandler } from '@/app/api/integrations/google-calendar/sync/route';
import { prisma } from '@/lib/db';
import * as auth from '@/lib/auth/session';
import { google } from 'googleapis';

// Mock authentication
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock Google API
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn(() => ({
        setCredentials: jest.fn(),
      })),
    },
    calendar: jest.fn(() => ({
      events: {
        insert: jest.fn(),
        list: jest.fn(),
      },
    })),
  },
}));

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
  },
}));

describe('Google Calendar Sync API - Integration Tests', () => {
  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    googleRefreshToken: 'mock_refresh_token',
    googleAccessToken: 'mock_access_token',
  };

  const mockTrip = {
    id: 'trip_123',
    userId: 'user_123',
    name: 'Paris Trip',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-10'),
    destination: 'Paris, France',
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
      notes: 'Check-in at 3 PM',
    },
  ];

  const mockCalendarApi = {
    events: {
      insert: jest.fn(),
      list: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user_123' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);
    (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
    (google.calendar as jest.Mock).mockReturnValue(mockCalendarApi);
    mockCalendarApi.events.insert.mockResolvedValue({
      data: { id: 'cal_event_123' },
    });
  });

  describe('✅ Happy Path', () => {
    it('should sync all trip events to Google Calendar', async () => {
      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tripId: 'trip_123',
          }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.syncedEvents).toBe(2);
      expect(mockCalendarApi.events.insert).toHaveBeenCalledTimes(2);
    });

    it('should create calendar events with correct data', async () => {
      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({
            tripId: 'trip_123',
          }),
        }
      );

      await calendarSyncHandler(request as NextRequest);

      // Verify first event created correctly
      expect(mockCalendarApi.events.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarId: 'primary',
          requestBody: expect.objectContaining({
            summary: expect.stringContaining('Flight to Paris'),
            location: 'CDG Airport',
            description: expect.stringContaining('United Flight 123'),
            start: expect.objectContaining({
              dateTime: expect.any(String),
            }),
            end: expect.objectContaining({
              dateTime: expect.any(String),
            }),
          }),
        })
      );
    });
  });

  describe('🔒 Authorization', () => {
    it('should return 401 for unauthenticated users', async () => {
      (auth.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);

      expect(response.status).toBe(401);
    });

    it('should return 403 for users without Google auth', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        googleRefreshToken: null,
      });

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);

      expect(response.status).toBe(403);
    });

    it('should return 403 for unauthorized trip access', async () => {
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue({
        ...mockTrip,
        userId: 'other_user',
      });

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);

      expect(response.status).toBe(403);
    });
  });

  describe('📋 Input Validation', () => {
    it('should reject request with missing tripId', async () => {
      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request with invalid tripId format', async () => {
      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'invalid!@#$' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);

      expect(response.status).toBe(400);
    });
  });

  describe('🚧 Edge Cases', () => {
    it('should return 404 for non-existent trip', async () => {
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'nonexistent' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);

      expect(response.status).toBe(404);
    });

    it('should handle trip with no events', async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.syncedEvents).toBe(0);
      expect(mockCalendarApi.events.insert).not.toHaveBeenCalled();
    });

    it('should handle partial sync failures', async () => {
      mockCalendarApi.events.insert
        .mockResolvedValueOnce({ data: { id: 'cal_event_1' } })
        .mockRejectedValueOnce(new Error('API error'));

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(207); // Multi-status
      expect(json.syncedEvents).toBe(1);
      expect(json.failedEvents).toBe(1);
    });
  });

  describe('⚠️ Error Handling', () => {
    it('should handle Google API errors gracefully', async () => {
      mockCalendarApi.events.insert.mockRejectedValue(
        new Error('Google Calendar API error')
      );

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);

      expect(response.status).toBe(500);
    });

    it('should handle database errors', async () => {
      (prisma.trip.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);

      expect(response.status).toBe(500);
    });

    it('should handle expired Google tokens', async () => {
      (google.calendar as jest.Mock).mockImplementation(() => {
        throw new Error('invalid_grant');
      });

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('OAUTH_TOKEN_EXPIRED');
    });
  });

  describe('🔄 Rate Limiting & Performance', () => {
    it('should handle trips with many events efficiently', async () => {
      const manyEvents = Array.from({ length: 100 }, (_, i) => ({
        id: `event_${i}`,
        tripId: 'trip_123',
        type: 'ACTIVITY',
        name: `Activity ${i}`,
        startTime: new Date(`2025-06-${String((i % 9) + 1).padStart(2, '0')}T10:00:00Z`),
        endTime: new Date(`2025-06-${String((i % 9) + 1).padStart(2, '0')}T12:00:00Z`),
        location: 'Paris',
      }));

      (prisma.event.findMany as jest.Mock).mockResolvedValue(manyEvents);
      mockCalendarApi.events.insert.mockResolvedValue({
        data: { id: 'cal_event_123' },
      });

      const startTime = Date.now();

      const request = new Request(
        'http://localhost:3000/api/integrations/google-calendar/sync',
        {
          method: 'POST',
          body: JSON.stringify({ tripId: 'trip_123' }),
        }
      );

      const response = await calendarSyncHandler(request as NextRequest);
      const json = await response.json();

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(json.syncedEvents).toBe(100);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
