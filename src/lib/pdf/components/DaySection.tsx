/**
 * PDF Day Section Component
 *
 * Groups events for a single day
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { EventCard } from './EventCard';

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '1px solid #cbd5e1',
  },
  dayNumber: {
    color: '#3b82f6',
    marginRight: 8,
  },
  noEvents: {
    fontSize: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginLeft: 12,
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

interface DaySectionProps {
  dayNumber: number;
  date: Date;
  events: Event[];
}

export function DaySection({ dayNumber, date, events }: DaySectionProps) {
  return (
    <View style={styles.section}>
      {/* Day Header */}
      <Text style={styles.dayHeader}>
        <Text style={styles.dayNumber}>Day {dayNumber}</Text>
        {format(date, 'EEEE, MMMM d, yyyy')}
      </Text>

      {/* Events */}
      {events.length === 0 ? (
        <Text style={styles.noEvents}>No events scheduled</Text>
      ) : (
        events.map((event) => (
          <EventCard
            key={event.id}
            type={event.type}
            title={event.title}
            description={event.description || undefined}
            startDateTime={event.startDateTime}
            endDateTime={event.endDateTime}
            location={event.location}
            confirmationNumber={event.confirmationNumber}
            cost={event.cost ? Number(event.cost) : null}
            currency={event.currency}
            notes={event.notes}
          />
        ))
      )}
    </View>
  );
}
