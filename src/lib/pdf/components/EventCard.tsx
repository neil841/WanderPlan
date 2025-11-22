/**
 * PDF Event Card Component
 *
 * Single event card with details
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '1px solid #e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  type: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 9,
    color: '#64748b',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 6,
  },
  details: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  cost: {
    fontSize: 9,
    color: '#059669',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

// Get emoji for event type
function getEventTypeEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    FLIGHT: '✈️',
    HOTEL: '🏨',
    ACTIVITY: '🎭',
    RESTAURANT: '🍽️',
    TRANSPORTATION: '🚗',
    DESTINATION: '📍',
  };
  return emojiMap[type] || '📅';
}

interface Location {
  name?: string;
  address?: string;
  lat?: number;
  lon?: number;
}

interface EventCardProps {
  type: string;
  title: string;
  description?: string;
  startDateTime: Date | string;
  endDateTime?: Date | string | null;
  location?: Location | null;
  confirmationNumber?: string | null;
  cost?: number | null;
  currency?: string | null;
  notes?: string | null;
}

export function EventCard({
  type,
  title,
  description,
  startDateTime,
  endDateTime,
  location,
  confirmationNumber,
  cost,
  currency,
  notes,
}: EventCardProps) {
  const timeRange = endDateTime
    ? `${format(new Date(startDateTime), 'h:mm a')} - ${format(new Date(endDateTime), 'h:mm a')}`
    : format(new Date(startDateTime), 'h:mm a');

  return (
    <View style={styles.card}>
      {/* Header with type and time */}
      <View style={styles.header}>
        <Text style={styles.type}>{getEventTypeEmoji(type)} {type.replace('_', ' ')}</Text>
        <Text style={styles.time}>{timeRange}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Description */}
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {/* Location */}
      {location && (location as Location).name && (
        <Text style={styles.details}>
          📍 {(location as Location).name}
          {(location as Location).address && ` - ${(location as Location).address}`}
        </Text>
      )}

      {/* Confirmation Number */}
      {confirmationNumber && (
        <Text style={styles.details}>
          🎫 Confirmation: {confirmationNumber}
        </Text>
      )}

      {/* Notes */}
      {notes && (
        <Text style={styles.details}>
          📝 {notes}
        </Text>
      )}

      {/* Cost */}
      {cost && (
        <Text style={styles.cost}>
          💰 {currency || 'USD'} {Number(cost).toFixed(2)}
        </Text>
      )}
    </View>
  );
}
