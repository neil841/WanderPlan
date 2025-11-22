/**
 * Trip PDF Document
 *
 * Main PDF document component for trip export
 */

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';
import { Header } from './components/Header';
import { DaySection } from './components/DaySection';
import { BudgetSummary } from './components/BudgetSummary';
import { CollaboratorList } from './components/CollaboratorList';
import { Footer } from './components/Footer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 24,
  },
  overview: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.6,
    marginBottom: 20,
  },
});

interface Event {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  startDateTime: Date | string;
  endDateTime?: Date | string | null;
  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lon?: number;
  } | null;
  confirmationNumber?: string | null;
  cost?: number | null;
  currency?: string | null;
  notes?: string | null;
}

interface Collaborator {
  id: string;
  role: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Budget {
  totalBudget: number;
  currency: string;
  categoryBudgets?: Record<string, { budgeted: number; spent: number }>;
}

interface TripPDFProps {
  trip: {
    name: string;
    description?: string | null;
    startDate: Date | string | null;
    endDate: Date | string | null;
    destinations: string[];
    creator: {
      firstName: string;
      lastName: string;
    };
  };
  events: Event[];
  collaborators: Collaborator[];
  budget?: Budget | null;
  totalExpenses?: number;
  options?: {
    includeMap?: boolean;
    includeBudget?: boolean;
    includeCollaborators?: boolean;
  };
}

/**
 * Group events by day
 */
function groupEventsByDay(
  events: Event[],
  startDate: Date
): Map<number, Event[]> {
  const dayMap = new Map<number, Event[]>();

  events.forEach((event) => {
    const eventDate = new Date(event.startDateTime);
    const dayNumber = differenceInDays(eventDate, startDate) + 1;

    if (!dayMap.has(dayNumber)) {
      dayMap.set(dayNumber, []);
    }
    dayMap.get(dayNumber)!.push(event);
  });

  return dayMap;
}

/**
 * Main Trip PDF Document
 */
export function TripPDF({
  trip,
  events,
  collaborators,
  budget,
  totalExpenses = 0,
  options = {},
}: TripPDFProps) {
  const {
    includeBudget = true,
    includeCollaborators = true,
  } = options;

  const startDate = trip.startDate ? new Date(trip.startDate) : null;
  const endDate = trip.endDate ? new Date(trip.endDate) : null;
  const tripDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.startDateTime);
    const dateB = new Date(b.startDateTime);
    return dateA.getTime() - dateB.getTime();
  });

  // Group events by day
  const eventsByDay = startDate
    ? groupEventsByDay(sortedEvents, startDate)
    : new Map<number, Event[]>();

  const creatorName = `${trip.creator.firstName} ${trip.creator.lastName}`;
  const generatedDate = new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Header
          tripName={trip.name}
          startDate={startDate}
          endDate={endDate}
          destinations={trip.destinations}
        />

        {/* Trip Overview */}
        {trip.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Trip Overview</Text>
            <Text style={styles.overview}>{trip.description}</Text>
          </View>
        )}

        {/* Day-by-Day Itinerary */}
        {tripDays > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Day-by-Day Itinerary</Text>

            {Array.from({ length: tripDays }, (_, index) => {
              const dayNumber = index + 1;
              const dayDate = startDate ? addDays(startDate, index) : new Date();
              const dayEvents = eventsByDay.get(dayNumber) || [];

              return (
                <DaySection
                  key={dayNumber}
                  dayNumber={dayNumber}
                  date={dayDate}
                  events={dayEvents}
                />
              );
            })}
          </View>
        )}

        {/* Events without specific days */}
        {sortedEvents.length > 0 && tripDays === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Events</Text>
            {sortedEvents.map((event) => (
              <View key={event.id} style={{ marginBottom: 12 }}>
                <Text>{event.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Budget Summary */}
        {includeBudget && budget && (
          <BudgetSummary
            totalBudget={Number(budget.totalBudget)}
            currency={budget.currency}
            totalSpent={totalExpenses}
            categoryBreakdown={budget.categoryBudgets as Record<string, { budgeted: number; spent: number }>}
          />
        )}

        {/* Collaborators */}
        {includeCollaborators && collaborators.length > 0 && (
          <CollaboratorList
            collaborators={collaborators}
            creatorName={creatorName}
          />
        )}

        {/* Footer */}
        <Footer generatedDate={generatedDate} />
      </Page>
    </Document>
  );
}
