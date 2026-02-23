import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/core/constants/colors';
import { BorderRadius, Spacing } from '@/src/core/constants/spacing';
import { getShadow } from '@/src/core/constants/shadows';
import { formatCurrency } from '@/src/shared/utils/currency';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isCurrency?: boolean;
}

export function StatCard({ title, value, icon, color, isCurrency = true }: StatCardProps) {
  return (
    <View 
      style={styles.card}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${title}: ${isCurrency ? formatCurrency(value) : value}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={styles.value}>
        {isCurrency ? formatCurrency(value) : value.toString()}
      </Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...getShadow('sm'), // Use consistent elevation
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
