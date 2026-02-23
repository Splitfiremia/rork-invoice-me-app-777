import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Estimate } from '../types';
import { EstimateStatusBadge } from './EstimateStatusBadge';
import { Colors } from '@/src/core/constants/colors';
import { BorderRadius, Spacing } from '@/src/core/constants/spacing';
import { getShadow } from '@/src/core/constants/shadows';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/formatDate';
import { useReducedMotionPreference, springWithReducedMotion } from '@/src/shared/utils/reducedMotion';

interface EstimateCardProps {
  estimate: Estimate;
  onPress: (id: string) => void;
}

export const EstimateCard = React.memo(function EstimateCard({ estimate, onPress }: EstimateCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prefersReducedMotion = useReducedMotionPreference();

  const handlePressIn = useCallback(() => {
    springWithReducedMotion(scaleAnim, { 
      toValue: 0.98, 
      useNativeDriver: true 
    }, prefersReducedMotion).start();
  }, [scaleAnim, prefersReducedMotion]);

  const handlePressOut = useCallback(() => {
    springWithReducedMotion(scaleAnim, { 
      toValue: 1, 
      useNativeDriver: true 
    }, prefersReducedMotion).start();
  }, [scaleAnim, prefersReducedMotion]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(estimate.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        testID={`estimate-card-${estimate.id}`}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Estimate ${estimate.estimateNumber} for ${estimate.clientName}`}
        accessibilityHint={`Total ${formatCurrency(estimate.total, estimate.currency)}, expires ${formatDate(estimate.expiryDate)}`}
      >
        <View style={styles.topRow}>
          <View style={styles.info}>
            <Text style={styles.number}>{estimate.estimateNumber}</Text>
            <Text style={styles.clientName}>{estimate.clientName}</Text>
          </View>
          <EstimateStatusBadge status={estimate.status} />
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.dateLabel}>Expires {formatDate(estimate.expiryDate)}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{formatCurrency(estimate.total, estimate.currency)}</Text>
            <ChevronRight size={16} color={Colors.textTertiary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...getShadow('sm'), // Use consistent elevation
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  number: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
