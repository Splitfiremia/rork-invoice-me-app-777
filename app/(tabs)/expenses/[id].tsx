import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { useExpenseStore } from '@/src/store/expense.store';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/formatDate';
import { Button } from '@/src/shared/components/Button';
import { EXPENSE_CATEGORIES } from '@/src/modules/expenses/types';
import { useExpenseById } from '@/src/hooks/useStoreSelectors';
import * as Haptics from 'expo-haptics';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const expense = useExpenseById(id as string);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          if (id) deleteExpense(id);
          router.back();
        },
      },
    ]);
  }, [id, deleteExpense, router]);

  if (!expense) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Expense not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  const categoryLabel = EXPENSE_CATEGORIES.find((c) => c.key === expense.category)?.label ?? expense.category;

  return (
    <>
      <Stack.Screen options={{ title: 'Expense Details' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
          <Text style={styles.date}>{formatDate(expense.date)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.descriptionText}>{expense.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{formatCurrency(expense.amount)}</Text>
          </View>
          {expense.taxAmount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tax</Text>
              <Text style={styles.detailValue}>{formatCurrency(expense.taxAmount)}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValueBold}>
              {formatCurrency(expense.amount + expense.taxAmount)}
            </Text>
          </View>
        </View>

        {expense.clientName && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Client</Text>
            <Text style={styles.clientName}>{expense.clientName}</Text>
          </View>
        )}

        {expense.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{expense.notes}</Text>
          </View>
        )}

        <View style={styles.deleteSection}>
          <Button
            title="Delete Expense"
            onPress={handleDelete}
            variant="danger"
            size="lg"
            icon={<Trash2 size={18} color={Colors.textInverse} />}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.massive },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: Spacing.lg },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  header: { alignItems: 'center', paddingVertical: Spacing.xxl },
  amount: { fontSize: 36, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.5 },
  categoryBadge: {
    backgroundColor: Colors.surfaceSecondary, paddingHorizontal: Spacing.md,
    paddingVertical: 4, borderRadius: BorderRadius.full, marginTop: Spacing.sm,
  },
  categoryText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  date: { fontSize: 14, color: Colors.textTertiary, marginTop: Spacing.sm },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: {
    fontSize: 13, fontWeight: '600' as const, color: Colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: Spacing.md,
  },
  descriptionText: { fontSize: 16, fontWeight: '500' as const, color: Colors.text },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6,
  },
  detailLabel: { fontSize: 14, color: Colors.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '500' as const, color: Colors.text },
  detailValueBold: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  clientName: { fontSize: 16, fontWeight: '500' as const, color: Colors.text },
  notesText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  deleteSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl },
});
