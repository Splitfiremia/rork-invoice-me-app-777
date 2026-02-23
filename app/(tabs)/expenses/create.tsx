import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { useExpenseStore } from '@/src/store/expense.store';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/src/modules/expenses/types';
import { getToday } from '@/src/shared/utils/formatDate';
import * as Haptics from 'expo-haptics';

export default function CreateExpenseScreen() {
  const router = useRouter();
  const addExpense = useExpenseStore((s) => s.addExpense);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('0');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!amount.trim() || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [description, amount]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      category,
      description: description.trim(),
      amount: parseFloat(amount),
      taxAmount: parseFloat(taxAmount) || 0,
      date: getToday(),
      clientName: clientName.trim() || undefined,
      notes: notes.trim() || undefined,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addExpense(newExpense);
    Alert.alert('Success', 'Expense added successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [validate, category, description, amount, taxAmount, clientName, notes, addExpense, router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <X size={22} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryChip,
                    category === cat.key && styles.categoryChipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat.key);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.key && styles.categoryTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.card}>
              <Input
                label="Description"
                placeholder="What was this expense for?"
                value={description}
                onChangeText={setDescription}
                error={errors.description}
                testID="expense-description"
              />
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Input
                    label="Amount ($)"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    error={errors.amount}
                    keyboardType="numeric"
                    testID="expense-amount"
                  />
                </View>
                <View style={styles.halfField}>
                  <Input
                    label="Tax ($)"
                    placeholder="0.00"
                    value={taxAmount}
                    onChangeText={setTaxAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <Input
                label="Client (optional)"
                placeholder="Assign to client"
                value={clientName}
                onChangeText={setClientName}
              />
              <Input
                label="Notes"
                placeholder="Additional details..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button title="Save Expense" onPress={handleSave} size="lg" testID="save-expense" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingVertical: Spacing.lg, paddingBottom: Spacing.massive },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: 17, fontWeight: '600' as const, color: Colors.text,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: 13, fontWeight: '500' as const, color: Colors.textSecondary },
  categoryTextActive: { color: Colors.textInverse },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },
  actions: { paddingHorizontal: Spacing.lg },
});
