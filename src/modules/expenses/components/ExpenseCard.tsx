import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import {
  Plane,
  Briefcase,
  Monitor,
  Megaphone,
  UtensilsCrossed,
  Zap,
  Wrench,
  GraduationCap,
  Shield,
  MoreHorizontal,
} from 'lucide-react-native';
import { Expense, ExpenseCategory } from '../types';
import { Colors } from '@/src/core/constants/colors';
import { BorderRadius, Spacing } from '@/src/core/constants/spacing';
import { getShadow } from '@/src/core/constants/shadows';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/formatDate';
import { useReducedMotionPreference, springWithReducedMotion } from '@/src/shared/utils/reducedMotion';

interface ExpenseCardProps {
  expense: Expense;
  onPress: (id: string) => void;
}

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  travel: <Plane size={18} color="#0EA5E9" />,
  office: <Briefcase size={18} color="#8B5CF6" />,
  software: <Monitor size={18} color="#F59E0B" />,
  marketing: <Megaphone size={18} color="#EC4899" />,
  meals: <UtensilsCrossed size={18} color="#10B981" />,
  utilities: <Zap size={18} color="#F97316" />,
  equipment: <Wrench size={18} color="#6366F1" />,
  professional: <GraduationCap size={18} color="#14B8A6" />,
  insurance: <Shield size={18} color="#EF4444" />,
  other: <MoreHorizontal size={18} color="#6B7280" />,
};

const categoryColors: Record<ExpenseCategory, string> = {
  travel: '#E0F2FE',
  office: '#EDE9FE',
  software: '#FEF3C7',
  marketing: '#FCE7F3',
  meals: '#D1FAE5',
  utilities: '#FFEDD5',
  equipment: '#E0E7FF',
  professional: '#CCFBF1',
  insurance: '#FEE2E2',
  other: '#F3F4F6',
};

const categoryLabels: Record<ExpenseCategory, string> = {
  travel: 'Travel',
  office: 'Office',
  software: 'Software',
  marketing: 'Marketing',
  meals: 'Meals',
  utilities: 'Utilities',
  equipment: 'Equipment',
  professional: 'Professional',
  insurance: 'Insurance',
  other: 'Other',
};

export const ExpenseCard = React.memo(function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
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
        onPress={() => onPress(expense.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        testID={`expense-card-${expense.id}`}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Expense: ${expense.description}, ${formatCurrency(expense.amount)}`}
        accessibilityHint={`${categoryLabels[expense.category]}, ${formatDate(expense.date)}${expense.clientName ? `, for ${expense.clientName}` : ''}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: categoryColors[expense.category] }]}>
          {categoryIcons[expense.category]}
        </View>
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={1}>{expense.description}</Text>
          <Text style={styles.meta}>
            {categoryLabels[expense.category]} · {formatDate(expense.date)}
          </Text>
          {expense.clientName && (
            <Text style={styles.client} numberOfLines={1}>{expense.clientName}</Text>
          )}
        </View>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...getShadow('sm'), // Use consistent elevation
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  description: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  client: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
