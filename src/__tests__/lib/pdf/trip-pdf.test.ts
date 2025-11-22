/**
 * Tests for PDF generation functionality
 */

import { generateTripPDF } from '@/lib/pdf/trip-pdf';

describe('generateTripPDF', () => {
  it('should generate PDF buffer for basic trip data', async () => {
    const tripData = {
      id: 'test-trip-1',
      name: 'Test Trip to Paris',
      description: 'A wonderful trip to Paris',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-07'),
      destinations: ['Paris', 'Versailles'],
      coverImageUrl: null,
      creator: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      events: [
        {
          id: 'event-1',
          type: 'FLIGHT',
          title: 'Flight to Paris',
          description: 'Direct flight from NYC to CDG',
          startDateTime: new Date('2024-06-01T08:00:00'),
          endDateTime: new Date('2024-06-01T20:00:00'),
          location: {
            name: 'Charles de Gaulle Airport',
            address: 'Paris, France',
          },
          cost: {
            amount: 450,
            currency: 'USD',
          },
          notes: 'Check in 3 hours early',
          confirmationNumber: 'ABC123',
        },
        {
          id: 'event-2',
          type: 'HOTEL',
          title: 'Hotel Check-in',
          description: 'Central Paris Hotel',
          startDateTime: new Date('2024-06-01T22:00:00'),
          endDateTime: null,
          location: {
            name: 'Hotel Paris',
            address: '123 Champs-Élysées',
          },
          cost: {
            amount: 200,
            currency: 'USD',
          },
          notes: null,
          confirmationNumber: 'HOTEL456',
        },
      ],
      collaborators: [
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'EDITOR',
        },
      ],
      budget: {
        totalBudget: 2000,
        currency: 'USD',
        categoryBudgets: {
          ACCOMMODATION: 800,
          TRANSPORTATION: 600,
          FOOD: 400,
          ACTIVITIES: 200,
        },
        expenseSummary: {
          USD: 650,
        },
        totalSpent: 650,
      },
      tags: [
        {
          name: 'Vacation',
          color: '#3B82F6',
        },
        {
          name: 'Europe',
          color: '#10B981',
        },
      ],
    };

    const options = {
      includeMap: false,
      includeBudget: true,
      includeCollaborators: true,
    };

    const pdfBuffer = await generateTripPDF(tripData, options);

    // Verify PDF buffer is generated
    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);

    // Verify PDF starts with PDF header
    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    expect(pdfHeader).toBe('%PDF');
  });

  it('should generate PDF without budget when includeBudget is false', async () => {
    const tripData = {
      id: 'test-trip-2',
      name: 'Simple Trip',
      description: null,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-03'),
      destinations: ['London'],
      coverImageUrl: null,
      creator: {
        name: 'Test User',
        email: 'test@example.com',
      },
      events: [],
      collaborators: [],
      budget: null,
      tags: [],
    };

    const options = {
      includeMap: false,
      includeBudget: false,
      includeCollaborators: false,
    };

    const pdfBuffer = await generateTripPDF(tripData, options);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle trip with multiple days', async () => {
    const tripData = {
      id: 'test-trip-3',
      name: 'Week-long Adventure',
      description: 'A full week of exploration',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-07'),
      destinations: ['Rome', 'Florence', 'Venice'],
      coverImageUrl: null,
      creator: {
        name: 'Adventure Seeker',
        email: 'seeker@example.com',
      },
      events: [
        {
          id: 'event-1',
          type: 'ACTIVITY',
          title: 'Colosseum Tour',
          description: 'Guided tour of the Colosseum',
          startDateTime: new Date('2024-08-02T10:00:00'),
          endDateTime: new Date('2024-08-02T12:00:00'),
          location: {
            name: 'Colosseum',
            address: 'Rome, Italy',
          },
          cost: {
            amount: 50,
            currency: 'EUR',
          },
          notes: 'Book tickets online',
          confirmationNumber: null,
        },
        {
          id: 'event-2',
          type: 'RESTAURANT',
          title: 'Dinner at Trattoria',
          description: 'Traditional Italian cuisine',
          startDateTime: new Date('2024-08-03T19:00:00'),
          endDateTime: new Date('2024-08-03T21:00:00'),
          location: {
            name: 'Trattoria Roma',
            address: 'Via Roma, Florence',
          },
          cost: null,
          notes: 'Reservation required',
          confirmationNumber: 'REST789',
        },
      ],
      collaborators: [],
      budget: {
        totalBudget: 3000,
        currency: 'EUR',
        categoryBudgets: {
          FOOD: 800,
          ACTIVITIES: 500,
        },
        expenseSummary: {
          EUR: 50,
        },
        totalSpent: 50,
      },
      tags: [],
    };

    const options = {
      includeMap: false,
      includeBudget: true,
      includeCollaborators: false,
    };

    const pdfBuffer = await generateTripPDF(tripData, options);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
  });
});
