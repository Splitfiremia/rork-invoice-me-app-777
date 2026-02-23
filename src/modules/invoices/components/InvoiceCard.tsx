import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Invoice } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Colors } from '@/src/core/constants/colors';
import { BorderRadius, Spacing } from '@/src/core/constants/spacing';
import { getShadow } from '@/src/core/constants/shadows';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/formatDate';
import { useReducedMotionPreference, springWithReducedMotion } from '@/src/shared/utils/reducedMotion';

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: (id: string) => void;
}

export const InvoiceCard = React.memo(function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
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
        onPress={() => onPress(invoice.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        testID={`invoice-card-${invoice.id}`}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Invoice ${invoice.invoiceNumber} for ${invoice.clientName}`}
        accessibilityHint={`Total ${formatCurrency(invoice.total, invoice.currency)}, due ${formatDate(invoice.dueDate)}`}
      >
        <View style={styles.topRow}>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.clientName}>{invoice.clientName}</Text>
          </View>
          <InvoiceStatusBadge status={invoice.status} />
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Due {formatDate(invoice.dueDate)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{formatCurrency(invoice.total, invoice.currency)}</Text>
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
  invoiceInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '600',
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
  dateInfo: {},
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
    fontWeight: '700',
    color: Colors.text,
  },
});
