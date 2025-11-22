/**
 * PDF Footer Component
 *
 * Page footer with page numbers and branding
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTop: '1px solid #e2e8f0',
  },
  text: {
    fontSize: 8,
    color: '#94a3b8',
  },
  brand: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: 'bold',
  },
});

interface FooterProps {
  generatedDate: Date;
}

export function Footer({ generatedDate }: FooterProps) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.text}>
        Generated on {format(generatedDate, 'MMM d, yyyy')}
      </Text>
      <Text style={styles.brand}>
        WanderPlan
      </Text>
      <Text
        style={styles.text}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}
