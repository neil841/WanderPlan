/**
 * PDF Header Component
 *
 * Trip header with title, dates, and destination
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2px solid #e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  destinations: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
  },
});

interface HeaderProps {
  tripName: string;
  startDate: Date | null;
  endDate: Date | null;
  destinations: string[];
}

export function Header({ tripName, startDate, endDate, destinations }: HeaderProps) {
  const dateRange = startDate && endDate
    ? `${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`
    : 'Dates TBD';

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{tripName}</Text>
      <Text style={styles.subtitle}>{dateRange}</Text>
      {destinations.length > 0 && (
        <Text style={styles.destinations}>
          📍 {destinations.join(' • ')}
        </Text>
      )}
    </View>
  );
}
