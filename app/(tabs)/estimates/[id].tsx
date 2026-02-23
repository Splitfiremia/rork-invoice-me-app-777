import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Send, CheckCircle, XCircle, FileText, MoreVertical } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { EstimateStatusBadge } from '@/src/modules/estimates/components/EstimateStatusBadge';
import { useEstimateStore } from '@/src/store/estimate.store';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/formatDate';
import { Button } from '@/src/shared/components/Button';
import { Invoice } from '@/src/modules/invoices/types';
import { generateInvoiceNumber, generateUniqueId } from '@/src/modules/invoices/utils/invoice-calculations';
import { useEstimateById } from '@/src/hooks/useStoreSelectors';
import * as Haptics from 'expo-haptics';

export default function EstimateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const estimate = useEstimateById(id as string);
  const updateEstimate = useEstimateStore((s) => s.updateEstimate);
  const addInvoice = useInvoiceStore((s) => s.addInvoice);
  const invoices = useInvoiceStore((s) => s.invoices);

  const handleSend = useCallback(() => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateEstimate(id, { status: 'sent', updatedAt: new Date().toISOString() });
    Alert.alert('Sent', 'Estimate has been sent to the client.');
  }, [id, updateEstimate]);

  const handleAccept = useCallback(() => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateEstimate(id, { status: 'accepted', updatedAt: new Date().toISOString() });
    Alert.alert('Accepted', 'Estimate marked as accepted.');
  }, [id, updateEstimate]);

  const handleReject = useCallback(() => {
    if (!id) return;
    updateEstimate(id, { status: 'rejected', updatedAt: new Date().toISOString() });
    Alert.alert('Rejected', 'Estimate marked as rejected.');
  }, [id, updateEstimate]);

  const handleConvertToInvoice = useCallback(() => {
    if (!id || !estimate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const newInvoice: Invoice = {
      id: generateUniqueId('inv'),
      invoiceNumber: generateInvoiceNumber(invoices),
      status: 'draft',
      clientId: estimate.clientId,
      clientName: estimate.clientName,
      clientEmail: estimate.clientEmail,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      lineItems: estimate.lineItems.map((li) => ({
        id: li.id,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        amount: li.amount,
      })),
      subtotal: estimate.subtotal,
      taxAmount: estimate.taxAmount,
      discount: estimate.discount,
      total: estimate.total,
      amountPaid: 0,
      amountDue: estimate.total,
      notes: estimate.notes,
      terms: 'Net 30',
      currency: estimate.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addInvoice(newInvoice);
    Alert.alert('Converted', 'Estimate has been converted to a draft invoice.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [id, estimate, invoices.length, addInvoice, router]);

  if (!estimate) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Estimate not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: estimate.estimateNumber,
          headerRight: () => (
            <TouchableOpacity style={{ padding: 4 }}>
              <MoreVertical size={20} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusHeader}>
          <EstimateStatusBadge status={estimate.status} size="md" />
          <Text style={styles.estimateNumber}>{estimate.estimateNumber}</Text>
          <Text style={styles.totalAmount}>{formatCurrency(estimate.total, estimate.currency)}</Text>
        </View>

        <View style={styles.actionsRow}>
          {estimate.status === 'draft' && (
            <ActionButton
              icon={<Send size={18} color={Colors.accent} />}
              label="Send"
              onPress={handleSend}
            />
          )}
          {(estimate.status === 'sent' || estimate.status === 'draft') && (
            <>
              <ActionButton
                icon={<CheckCircle size={18} color={Colors.success} />}
                label="Accept"
                onPress={handleAccept}
              />
              <ActionButton
                icon={<XCircle size={18} color={Colors.error} />}
                label="Reject"
                onPress={handleReject}
              />
            </>
          )}
          {estimate.status === 'accepted' && (
            <ActionButton
              icon={<FileText size={18} color={Colors.accent} />}
              label="To Invoice"
              onPress={handleConvertToInvoice}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client</Text>
          <Text style={styles.clientName}>{estimate.clientName}</Text>
          <Text style={styles.clientEmail}>{estimate.clientEmail}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dates</Text>
          <View style={styles.dateRow}>
            <View>
              <Text style={styles.dateLabel}>Issue Date</Text>
              <Text style={styles.dateValue}>{formatDate(estimate.issueDate)}</Text>
            </View>
            <View>
              <Text style={styles.dateLabel}>Expiry Date</Text>
              <Text style={styles.dateValue}>{formatDate(estimate.expiryDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {estimate.lineItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.lineItem,
                index < estimate.lineItems.length - 1 && styles.lineItemBorder,
              ]}
            >
              <View style={styles.lineItemInfo}>
                <Text style={styles.lineItemDesc}>{item.description}</Text>
                <Text style={styles.lineItemQty}>
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </Text>
              </View>
              <Text style={styles.lineItemAmountText}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(estimate.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>{formatCurrency(estimate.taxAmount)}</Text>
          </View>
          {estimate.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: Colors.error }]}>
                -{formatCurrency(estimate.discount)}
              </Text>
            </View>
          )}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelBold}>Total</Text>
            <Text style={styles.totalValueBold}>{formatCurrency(estimate.total)}</Text>
          </View>
        </View>

        {estimate.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{estimate.notes}</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

function ActionButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={actionStyles.button} onPress={onPress} activeOpacity={0.7}>
      {icon}
      <Text style={actionStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const actionStyles = StyleSheet.create({
  button: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 4 },
  label: { fontSize: 12, fontWeight: '500' as const, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.massive },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: Spacing.lg },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  statusHeader: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  estimateNumber: { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  totalAmount: { fontSize: 36, fontWeight: '700' as const, color: Colors.text, marginTop: Spacing.sm, letterSpacing: -0.5 },
  actionsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '600' as const, color: Colors.textTertiary, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: Spacing.md },
  clientName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text, marginBottom: 2 },
  clientEmail: { fontSize: 14, color: Colors.textSecondary },
  dateRow: { flexDirection: 'row', gap: Spacing.xxl },
  dateLabel: { fontSize: 12, color: Colors.textTertiary, marginBottom: 2 },
  dateValue: { fontSize: 15, fontWeight: '500' as const, color: Colors.text },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  lineItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  lineItemInfo: { flex: 1, marginRight: Spacing.md },
  lineItemDesc: { fontSize: 14, fontWeight: '500' as const, color: Colors.text, marginBottom: 2 },
  lineItemQty: { fontSize: 12, color: Colors.textSecondary },
  lineItemAmountText: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  totalsCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  totalLabel: { fontSize: 14, color: Colors.textSecondary },
  totalValue: { fontSize: 14, fontWeight: '500' as const, color: Colors.text },
  totalDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  totalLabelBold: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  totalValueBold: { fontSize: 20, fontWeight: '700' as const, color: Colors.primary },
  notesText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
});
