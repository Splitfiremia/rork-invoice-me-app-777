import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Plus, Search, Receipt } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { ExpenseCard } from '@/src/modules/expenses/components/ExpenseCard';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { useExpenseStore } from '@/src/store/expense.store';
import { ExpenseCategory, Expense, EXPENSE_CATEGORIES } from '@/src/modules/expenses/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import * as Haptics from 'expo-haptics';

const CATEGORY_FILTERS: { key: ExpenseCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  ...EXPENSE_CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
];

export default function ExpensesListScreen() {
  const router = useRouter();
  const expenses = useExpenseStore((s) => s.expenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ExpenseCategory | 'all'>('all');

  const filteredExpenses = useMemo(() => {
    let result = expenses;
    if (activeFilter !== 'all') {
      result = result.filter((exp) => exp.category === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.description.toLowerCase().includes(q) ||
          (exp.clientName && exp.clientName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [expenses, activeFilter, searchQuery]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  const handleExpensePress = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(tabs)/expenses/${id}` as any);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/expenses/create' as any);
  }, [router]);

  const handleFilterPress = useCallback((key: ExpenseCategory | 'all') => {
    Haptics.selectionAsync();
    setActiveFilter(key);
  }, []);

  const renderExpense = useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseCard expense={item} onPress={handleExpensePress} />
    ),
    [handleExpensePress]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleCreatePress} style={styles.headerButton}>
              <Plus size={22} color={Colors.accent} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search expenses..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="expense-search"
            />
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={CATEGORY_FILTERS}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === item.key && styles.filterChipActive,
                ]}
                onPress={() => handleFilterPress(item.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === item.key && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpense}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Receipt size={36} color={Colors.textTertiary} />}
              title="No expenses found"
              description="Start tracking your business expenses."
              actionLabel="Add Expense"
              onAction={handleCreatePress}
            />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerButton: { padding: Spacing.sm },
  totalBanner: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  totalValue: { fontSize: 28, fontWeight: '700' as const, color: Colors.textInverse, marginTop: 4 },
  searchContainer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: Spacing.sm, fontSize: 15, color: Colors.text },
  filtersContainer: { marginBottom: Spacing.md },
  filtersList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '500' as const, color: Colors.textSecondary },
  filterTextActive: { color: Colors.textInverse },
  listContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.massive },
});
