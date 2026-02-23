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
import { X, Plus, Trash2 } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { InvoiceLineItem, Invoice } from '@/src/modules/invoices/types';
import {
  calculateLineItemAmount,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  generateInvoiceNumber,
  generateUniqueId,
} from '@/src/modules/invoices/utils/invoice-calculations';
import { formatCurrency } from '@/src/shared/utils/currency';
import { getToday, addDays } from '@/src/shared/utils/formatDate';
import * as Haptics from 'expo-haptics';

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const addInvoice = useInvoiceStore((s) => s.addInvoice);
  const invoices = useInvoiceStore((s) => s.invoices);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState('0');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addLineItem = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLineItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateLineItem = useCallback(
    (id: string, field: keyof InvoiceLineItem, value: string) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item };
          if (field === 'description') {
            updated.description = value;
          } else if (field === 'quantity') {
            updated.quantity = parseFloat(value) || 0;
          } else if (field === 'unitPrice') {
            updated.unitPrice = parseFloat(value) || 0;
          }
          updated.amount = calculateLineItemAmount(updated.quantity, updated.unitPrice);
          return updated;
        })
      );
    },
    []
  );

  const subtotal = calculateSubtotal(lineItems);
  const taxAmount = calculateTax(subtotal, 8.5);
  const discountNum = parseFloat(discount) || 0;
  const total = calculateTotal(subtotal, taxAmount, discountNum);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!clientEmail.trim()) newErrors.clientEmail = 'Client email is required';
    if (lineItems.every((li) => !li.description.trim() || li.unitPrice <= 0)) {
      newErrors.lineItems = 'Add at least one valid line item';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [clientName, clientEmail, lineItems]);

  const handleSave = useCallback(
    (asDraft: boolean) => {
      if (!validate()) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const today = getToday();
      const newInvoice: Invoice = {
        id: generateUniqueId('inv'),
        invoiceNumber: generateInvoiceNumber(invoices),
        status: asDraft ? 'draft' : 'sent',
        clientId: generateUniqueId('client'),
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        issueDate: today,
        dueDate: addDays(today, 30),
        lineItems: lineItems.filter((li) => li.description.trim() && li.unitPrice > 0),
        subtotal,
        taxAmount,
        discount: discountNum,
        total,
        amountPaid: 0,
        amountDue: total,
        notes: notes.trim() || undefined,
        terms: 'Net 30',
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addInvoice(newInvoice);
      Alert.alert(
        'Success',
        asDraft ? 'Invoice saved as draft.' : 'Invoice created and sent.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    [validate, invoices.length, clientName, clientEmail, lineItems, subtotal, taxAmount, discountNum, total, notes, addInvoice, router]
  );

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
            <Text style={styles.sectionTitle}>Client Details</Text>
            <View style={styles.card}>
              <Input
                label="Client Name"
                placeholder="Enter client name"
                value={clientName}
                onChangeText={setClientName}
                error={errors.clientName}
                testID="invoice-client-name"
              />
              <Input
                label="Client Email"
                placeholder="client@example.com"
                value={clientEmail}
                onChangeText={setClientEmail}
                error={errors.clientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="invoice-client-email"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <TouchableOpacity onPress={addLineItem} style={styles.addItemButton}>
                <Plus size={16} color={Colors.accent} />
                <Text style={styles.addItemText}>Add Item</Text>
              </TouchableOpacity>
            </View>
            {errors.lineItems && <Text style={styles.errorText}>{errors.lineItems}</Text>}

            {lineItems.map((item, index) => (
              <View key={item.id} style={styles.lineItemCard}>
                <View style={styles.lineItemHeader}>
                  <Text style={styles.lineItemLabel}>Item {index + 1}</Text>
                  {lineItems.length > 1 && (
                    <TouchableOpacity onPress={() => removeLineItem(item.id)}>
                      <Trash2 size={16} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <Input
                  label="Description"
                  placeholder="Service or product description"
                  value={item.description}
                  onChangeText={(v) => updateLineItem(item.id, 'description', v)}
                />
                <View style={styles.lineItemRow}>
                  <View style={styles.lineItemField}>
                    <Input
                      label="Qty"
                      placeholder="1"
                      value={item.quantity > 0 ? String(item.quantity) : ''}
                      onChangeText={(v) => updateLineItem(item.id, 'quantity', v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.lineItemField}>
                    <Input
                      label="Unit Price"
                      placeholder="0.00"
                      value={item.unitPrice > 0 ? String(item.unitPrice) : ''}
                      onChangeText={(v) => updateLineItem(item.id, 'unitPrice', v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.lineItemAmount}>
                    <Text style={styles.lineItemAmountLabel}>Amount</Text>
                    <Text style={styles.lineItemAmountValue}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional</Text>
            <View style={styles.card}>
              <Input
                label="Discount ($)"
                placeholder="0.00"
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
              />
              <Input
                label="Notes"
                placeholder="Payment terms, thank you message..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (8.5%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(taxAmount)}</Text>
            </View>
            {discountNum > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, { color: Colors.error }]}>
                  -{formatCurrency(discountNum)}
                </Text>
              </View>
            )}
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>Total</Text>
              <Text style={styles.totalValueBold}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Save as Draft"
              onPress={() => handleSave(true)}
              variant="outline"
              size="lg"
              style={styles.actionButton}
            />
            <Button
              title="Send Invoice"
              onPress={() => handleSave(false)}
              size="lg"
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.massive,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.accent,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  lineItemCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  lineItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  lineItemRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  lineItemField: {
    flex: 1,
  },
  lineItemAmount: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineItemAmountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  lineItemAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  totalsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  totalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValueBold: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
