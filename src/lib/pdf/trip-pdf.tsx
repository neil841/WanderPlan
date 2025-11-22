/**
 * Trip PDF Generation using @react-pdf/renderer
 *
 * Generates a mobile-friendly PDF export of a trip with:
 * - Trip overview
 * - Day-by-day itinerary
 * - Event details with times and locations
 * - Budget summary
 * - Collaborator list
 *
 * Mobile-friendly features:
 * - A4 portrait layout (optimal for mobile viewing)
 * - Clear typography with adequate spacing
 * - Compact but readable design
 * - Single column layout
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer';
import { format, differenceInDays } from 'date-fns';

// ==========================================
// TypeScript Types
// ==========================================

interface TripEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  startDateTime: Date;
  endDateTime: Date | null;
  location: any;
  cost: {
    amount: number;
    currency: string;
  } | null;
  notes: string | null;
  confirmationNumber: string | null;
}

interface TripData {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  destinations: string[];
  coverImageUrl: string | null;
  creator: {
    name: string;
    email: string;
  };
  events: TripEvent[];
  collaborators: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  budget: {
    totalBudget: number;
    currency: string;
    categoryBudgets: Record<string, number>;
    expenseSummary: Record<string, number>;
    totalSpent: number;
  } | null;
  tags: Array<{
    name: string;
    color: string;
  }>;
}

interface PDFOptions {
  includeMap: boolean;
  includeBudget: boolean;
  includeCollaborators: boolean;
}

// ==========================================
// PDF Styles (Mobile-Friendly)
// ==========================================

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },

  // Header Section
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #3B82F6',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 3,
  },
  destinations: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: 'bold',
    marginTop: 5,
  },

  // Section Headers
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 5,
  },

  // Description
  description: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 1.5,
    marginBottom: 10,
  },

  // Day Section
  dayHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    backgroundColor: '#F3F4F6',
    padding: 8,
    marginTop: 15,
    marginBottom: 8,
    borderRadius: 4,
  },

  // Event Card
  eventCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  eventType: {
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 3,
  },
  eventLocation: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 3,
  },
  eventCost: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  eventNotes: {
    fontSize: 9,
    color: '#4B5563',
    marginTop: 5,
    fontStyle: 'italic',
  },
  confirmationNumber: {
    fontSize: 8,
    color: '#8B5CF6',
    marginTop: 3,
  },

  // Budget Section
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottom: '1px solid #F3F4F6',
  },
  budgetLabel: {
    fontSize: 10,
    color: '#4B5563',
  },
  budgetAmount: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  budgetTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 10,
    borderTop: '2px solid #1F2937',
  },
  budgetTotalLabel: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  budgetTotalAmount: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: 'bold',
  },

  // Collaborators
  collaboratorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottom: '1px solid #F3F4F6',
  },
  collaboratorName: {
    fontSize: 10,
    color: '#1F2937',
  },
  collaboratorRole: {
    fontSize: 9,
    color: '#6B7280',
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 10,
  },
});

// ==========================================
// PDF Document Component
// ==========================================

const TripPDFDocument: React.FC<{ trip: TripData; options: PDFOptions }> = ({
  trip,
  options,
}) => {
  // Group events by day
  const eventsByDay = groupEventsByDay(trip.events, trip.startDate, trip.endDate);

  // Calculate trip duration
  const duration = differenceInDays(trip.endDate, trip.startDate) + 1;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{trip.name}</Text>
          <Text style={styles.subtitle}>
            {format(trip.startDate, 'MMM dd, yyyy')} - {format(trip.endDate, 'MMM dd, yyyy')}
            {' '}({duration} {duration === 1 ? 'day' : 'days'})
          </Text>
          <Text style={styles.destinations}>
            {trip.destinations.join(' → ')}
          </Text>
        </View>

        {/* Description */}
        {trip.description && (
          <View>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{trip.description}</Text>
          </View>
        )}

        {/* Tags */}
        {trip.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {trip.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag.name}
              </Text>
            ))}
          </View>
        )}

        {/* Day-by-Day Itinerary */}
        <Text style={styles.sectionTitle}>Itinerary</Text>
        {eventsByDay.map((day, dayIndex) => (
          <View key={dayIndex}>
            <Text style={styles.dayHeader}>
              Day {dayIndex + 1} - {format(day.date, 'EEEE, MMM dd')}
            </Text>
            {day.events.length === 0 ? (
              <Text style={{ fontSize: 9, color: '#9CA3AF', marginLeft: 10, marginBottom: 10 }}>
                No events scheduled
              </Text>
            ) : (
              day.events.map((event, eventIndex) => (
                <View key={eventIndex} style={styles.eventCard}>
                  <Text style={styles.eventType}>{formatEventType(event.type)}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>

                  {/* Time */}
                  <Text style={styles.eventTime}>
                    {format(event.startDateTime, 'h:mm a')}
                    {event.endDateTime && ` - ${format(event.endDateTime, 'h:mm a')}`}
                  </Text>

                  {/* Location */}
                  {event.location && (
                    <Text style={styles.eventLocation}>
                      📍 {formatLocation(event.location)}
                    </Text>
                  )}

                  {/* Cost */}
                  {event.cost && (
                    <Text style={styles.eventCost}>
                      {event.cost.currency} {event.cost.amount.toFixed(2)}
                    </Text>
                  )}

                  {/* Confirmation Number */}
                  {event.confirmationNumber && (
                    <Text style={styles.confirmationNumber}>
                      Confirmation: {event.confirmationNumber}
                    </Text>
                  )}

                  {/* Notes */}
                  {event.notes && (
                    <Text style={styles.eventNotes}>{event.notes}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        ))}

        {/* Budget Summary */}
        {options.includeBudget && trip.budget && (
          <View break>
            <Text style={styles.sectionTitle}>Budget Summary</Text>

            {/* Category Budgets */}
            {Object.entries(trip.budget.categoryBudgets).map(([category, amount], index) => {
              const spent = trip.budget!.expenseSummary[trip.budget!.currency] || 0;
              const categorySpent = (spent / trip.budget!.totalBudget) * amount; // Proportional estimate

              return (
                <View key={index} style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>
                    {formatCategory(category)}
                  </Text>
                  <Text style={styles.budgetAmount}>
                    {trip.budget!.currency} {categorySpent.toFixed(2)} / {amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}

            {/* Total */}
            <View style={styles.budgetTotal}>
              <Text style={styles.budgetTotalLabel}>Total</Text>
              <Text style={styles.budgetTotalAmount}>
                {trip.budget.currency} {trip.budget.totalSpent.toFixed(2)} / {trip.budget.totalBudget.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Collaborators */}
        {options.includeCollaborators && trip.collaborators.length > 0 && (
          <View break>
            <Text style={styles.sectionTitle}>Trip Collaborators</Text>
            {trip.collaborators.map((collab, index) => (
              <View key={index} style={styles.collaboratorRow}>
                <Text style={styles.collaboratorName}>{collab.name}</Text>
                <Text style={styles.collaboratorRole}>{collab.role}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by WanderPlan on {format(new Date(), 'MMM dd, yyyy')} • Created by {trip.creator.name}
        </Text>
      </Page>
    </Document>
  );
};

// ==========================================
// Helper Functions
// ==========================================

/**
 * Group events by day for the itinerary
 */
function groupEventsByDay(
  events: TripEvent[],
  startDate: Date,
  endDate: Date
): Array<{ date: Date; events: TripEvent[] }> {
  const days: Array<{ date: Date; events: TripEvent[] }> = [];
  const duration = differenceInDays(endDate, startDate) + 1;

  for (let i = 0; i < duration; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.startDateTime);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === currentDate.getTime();
    });

    days.push({
      date: currentDate,
      events: dayEvents,
    });
  }

  return days;
}

/**
 * Format event type for display
 */
function formatEventType(type: string): string {
  const typeMap: Record<string, string> = {
    FLIGHT: '✈️ Flight',
    HOTEL: '🏨 Hotel',
    ACTIVITY: '🎯 Activity',
    RESTAURANT: '🍽️ Restaurant',
    TRANSPORTATION: '🚗 Transportation',
    DESTINATION: '📍 Destination',
  };
  return typeMap[type] || type;
}

/**
 * Format location object for display
 */
function formatLocation(location: any): string {
  if (typeof location === 'string') {
    return location;
  }

  if (location && typeof location === 'object') {
    if (location.name) {
      return location.address ? `${location.name}, ${location.address}` : location.name;
    }
    if (location.address) {
      return location.address;
    }
  }

  return 'Location not specified';
}

/**
 * Format category for display
 */
function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace(/_/g, ' ');
}

// ==========================================
// Main Export Function
// ==========================================

/**
 * Generate PDF buffer from trip data
 *
 * @param trip - Trip data to export
 * @param options - PDF generation options
 * @returns PDF as Buffer
 */
export async function generateTripPDF(
  trip: TripData,
  options: PDFOptions
): Promise<Buffer> {
  const pdfDocument = <TripPDFDocument trip={trip} options={options} />;
  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
