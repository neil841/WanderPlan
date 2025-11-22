/**
 * PDF Budget Summary Component
 *
 * Displays trip budget and expenses
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    border: '1px solid #86efac',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: '#166534',
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  },
  total: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid #86efac',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  remaining: {
    marginTop: 4,
  },
  remainingLabel: {
    fontSize: 9,
    color: '#166534',
  },
  remainingValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});

interface BudgetSummaryProps {
  totalBudget: number;
  currency: string;
  totalSpent: number;
  categoryBreakdown?: Record<string, { budgeted: number; spent: number }>;
}

export function BudgetSummary({
  totalBudget,
  currency,
  totalSpent,
  categoryBreakdown,
}: BudgetSummaryProps) {
  const remaining = totalBudget - totalSpent;
  const percentageSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <View style={styles.section} break>
      <Text style={styles.title}>💰 Budget Summary</Text>

      {/* Category breakdown */}
      {categoryBreakdown && Object.entries(categoryBreakdown).map(([category, amounts]) => (
        <View key={category} style={styles.row}>
          <Text style={styles.label}>
            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
          </Text>
          <Text style={styles.value}>
            {currency} {amounts.spent.toFixed(2)} / {amounts.budgeted.toFixed(2)}
          </Text>
        </View>
      ))}

      {/* Total */}
      <View style={[styles.row, styles.total]}>
        <Text style={styles.totalLabel}>Total Budget</Text>
        <Text style={styles.totalValue}>{currency} {totalBudget.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total Spent</Text>
        <Text style={styles.totalValue}>{currency} {totalSpent.toFixed(2)}</Text>
      </View>

      {/* Remaining */}
      <View style={[styles.row, styles.remaining]}>
        <Text style={styles.remainingLabel}>Remaining</Text>
        <Text
          style={[
            styles.remainingValue,
            { color: remaining >= 0 ? '#15803d' : '#dc2626' },
          ]}
        >
          {currency} {Math.abs(remaining).toFixed(2)}
          {remaining < 0 && ' (Over Budget)'}
        </Text>
      </View>

      <View style={[styles.row, styles.remaining]}>
        <Text style={styles.remainingLabel}>Budget Used</Text>
        <Text style={styles.remainingValue}>
          {percentageSpent.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
}
