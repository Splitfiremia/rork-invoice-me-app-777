import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Send,
  Download,
  MoreVertical,
  CheckCircle,
  Copy,
  DollarSign,
  X,
} from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { InvoiceStatusBadge } from '@/src/modules/invoices/components/InvoiceStatusBadge';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { usePaymentStore } from '@/src/store/payment.store';
import { useInvoiceById } from '@/src/hooks/useStoreSelectors';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate, getToday } from '@/src/shared/utils/formatDate';
import { Button } from '@/src/shared/components/Button';
import { Input } from '@/src/shared/components/Input';
import { Invoice } from '@/src/modules/invoices/types';
import { Payment, PaymentMethod, PAYMENT_METHODS } from '@/src/modules/payments/types';
import { generateInvoiceNumber, generateUniqueId } from '@/src/modules/invoices/utils/invoice-calculations';
import * as Haptics from 'expo-haptics';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const invoice = useInvoiceById(id as string);
  const invoices = useInvoiceStore((s) => s.invoices);
  const updateInvoice = useInvoiceStore((s) => s.updateInvoice);
  const addInvoice = useInvoiceStore((s) => s.addInvoice);
  const allPayments = usePaymentStore((s) => s.payments);
  const addPayment = usePaymentStore((s) => s.addPayment);

  const payments = useMemo(() => allPayments.filter((p) => p.invoiceId === id), [allPayments, id]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [paymentNotes, setPaymentNotes] = useState('');

  const handleMarkPaid = useCallback(() => {
    if (!id || !invoice) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Mark as Paid', 'Confirm this invoice has been fully paid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          const payment: Payment = {
            id: generateUniqueId('pay'),
            invoiceId: id,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            amount: invoice.amountDue,
            method: 'bank_transfer',
            date: getToday(),
            currency: invoice.currency,
            createdAt: new Date().toISOString(),
          };
          addPayment(payment);
          updateInvoice(id, {
            status: 'paid',
            amountPaid: invoice.total,
            amountDue: 0,
            updatedAt: new Date().toISOString(),
          });
          Alert.alert('Done', 'Invoice marked as paid.');
        },
      },
    ]);
  }, [id, invoice, updateInvoice, addPayment]);

  const handleRecordPartialPayment = useCallback(() => {
    if (!id || !invoice) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid', 'Please enter a valid payment amount.');
      return;
    }
    if (amount > invoice.amountDue) {
      Alert.alert('Invalid', 'Payment amount cannot exceed the balance due.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const payment: Payment = {
      id: generateUniqueId('pay'),
      invoiceId: id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      amount,
      method: paymentMethod,
      date: getToday(),
      notes: paymentNotes.trim() || undefined,
      currency: invoice.currency,
      createdAt: new Date().toISOString(),
    };

    addPayment(payment);

    const newAmountPaid = invoice.amountPaid + amount;
    const newAmountDue = invoice.total - newAmountPaid;
    const newStatus = newAmountDue <= 0 ? 'paid' as const : 'partial' as const;

    updateInvoice(id, {
      status: newStatus,
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
      updatedAt: new Date().toISOString(),
    });

    setShowPaymentModal(false);
    setPaymentAmount('');
    setPaymentNotes('');
    Alert.alert('Payment Recorded', `${formatCurrency(amount)} payment recorded.`);
  }, [id, invoice, paymentAmount, paymentMethod, paymentNotes, addPayment, updateInvoice]);

  const handleSend = useCallback(() => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateInvoice(id, {
      status: 'sent',
      updatedAt: new Date().toISOString(),
    });
    Alert.alert('Sent', 'Invoice has been sent to the client.');
  }, [id, updateInvoice]);

  const handleDuplicate = useCallback(() => {
    if (!invoice) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const duplicated: Invoice = {
      ...invoice,
      id: generateUniqueId('inv'),
      invoiceNumber: generateInvoiceNumber(invoices),
      status: 'draft',
      amountPaid: 0,
      amountDue: invoice.total,
      issueDate: getToday(),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addInvoice(duplicated);
    Alert.alert('Duplicated', `Invoice ${duplicated.invoiceNumber} created as draft.`, [
      { text: 'OK' },
    ]);
  }, [invoice, invoices.length, addInvoice]);

  if (!invoice) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Invoice not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: invoice.invoiceNumber,
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
          <InvoiceStatusBadge status={invoice.status} size="md" />
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          <Text style={styles.totalAmount}>{formatCurrency(invoice.total, invoice.currency)}</Text>
          {invoice.amountDue > 0 && (
            <Text style={styles.dueText}>
              {formatCurrency(invoice.amountDue)} due
            </Text>
          )}
        </View>

        <View style={styles.actionsRow}>
          {invoice.status === 'draft' && (
            <ActionButton
              icon={<Send size={18} color={Colors.accent} />}
              label="Send"
              onPress={handleSend}
            />
          )}
          {invoice.status !== 'paid' && (
            <ActionButton
              icon={<CheckCircle size={18} color={Colors.success} />}
              label="Mark Paid"
              onPress={handleMarkPaid}
            />
          )}
          {invoice.status !== 'paid' && invoice.status !== 'draft' && (
            <ActionButton
              icon={<DollarSign size={18} color={Colors.statusPartial} />}
              label="Payment"
              onPress={() => setShowPaymentModal(true)}
            />
          )}
          <ActionButton
            icon={<Download size={18} color={Colors.textSecondary} />}
            label="PDF"
            onPress={() => Alert.alert('Export', 'PDF export will be available when connected to backend.')}
          />
          <ActionButton
            icon={<Copy size={18} color={Colors.textSecondary} />}
            label="Duplicate"
            onPress={handleDuplicate}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client</Text>
          <Text style={styles.clientName}>{invoice.clientName}</Text>
          <Text style={styles.clientEmail}>{invoice.clientEmail}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dates</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Issue Date</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Due Date</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {invoice.lineItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.lineItem,
                index < invoice.lineItems.length - 1 && styles.lineItemBorder,
              ]}
            >
              <View style={styles.lineItemInfo}>
                <Text style={styles.lineItemDesc}>{item.description}</Text>
                <Text style={styles.lineItemQty}>
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </Text>
              </View>
              <Text style={styles.lineItemAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
          </View>
          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: Colors.error }]}>
                -{formatCurrency(invoice.discount)}
              </Text>
            </View>
          )}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelBold}>Total</Text>
            <Text style={styles.totalValueBold}>{formatCurrency(invoice.total)}</Text>
          </View>
          {invoice.amountPaid > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Amount Paid</Text>
                <Text style={[styles.totalValue, { color: Colors.success }]}>
                  {formatCurrency(invoice.amountPaid)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabelBold}>Balance Due</Text>
                <Text style={[styles.totalValueBold, { color: Colors.error }]}>
                  {formatCurrency(invoice.amountDue)}
                </Text>
              </View>
            </>
          )}
        </View>

        {payments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment History</Text>
            {payments.map((payment, index) => (
              <View
                key={payment.id}
                style={[
                  styles.paymentRow,
                  index < payments.length - 1 && styles.paymentRowBorder,
                ]}
              >
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                  <Text style={styles.paymentMethod}>
                    {PAYMENT_METHODS.find((m) => m.key === payment.method)?.label ?? payment.method}
                  </Text>
                </View>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(payment.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {invoice.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Record Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.balanceText}>
              Balance due: {formatCurrency(invoice.amountDue)}
            </Text>

            <Input
              label="Payment Amount ($)"
              placeholder="0.00"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              testID="payment-amount"
            />

            <Text style={modalStyles.methodLabel}>Payment Method</Text>
            <View style={modalStyles.methodGrid}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.key}
                  style={[
                    modalStyles.methodChip,
                    paymentMethod === method.key && modalStyles.methodChipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPaymentMethod(method.key);
                  }}
                >
                  <Text
                    style={[
                      modalStyles.methodText,
                      paymentMethod === method.key && modalStyles.methodTextActive,
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Notes (optional)"
              placeholder="Payment reference..."
              value={paymentNotes}
              onChangeText={setPaymentNotes}
            />

            <Button
              title="Record Payment"
              onPress={handleRecordPartialPayment}
              size="lg"
              testID="record-payment"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={actionStyles.button} onPress={onPress} activeOpacity={0.7}>
      {icon}
      <Text style={actionStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const actionStyles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  balanceText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  methodChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  methodText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  methodTextActive: {
    color: Colors.textInverse,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.massive },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: Spacing.lg },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  statusHeader: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  invoiceNumber: { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  totalAmount: { fontSize: 36, fontWeight: '700' as const, color: Colors.text, marginTop: Spacing.sm, letterSpacing: -0.5 },
  dueText: { fontSize: 14, color: Colors.error, fontWeight: '500' as const, marginTop: 4 },
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
  cardTitle: {
    fontSize: 13, fontWeight: '600' as const, color: Colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: Spacing.md,
  },
  clientName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text, marginBottom: 2 },
  clientEmail: { fontSize: 14, color: Colors.textSecondary },
  dateRow: { flexDirection: 'row', gap: Spacing.xxl },
  dateItem: {},
  dateLabel: { fontSize: 12, color: Colors.textTertiary, marginBottom: 2 },
  dateValue: { fontSize: 15, fontWeight: '500' as const, color: Colors.text },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  lineItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  lineItemInfo: { flex: 1, marginRight: Spacing.md },
  lineItemDesc: { fontSize: 14, fontWeight: '500' as const, color: Colors.text, marginBottom: 2 },
  lineItemQty: { fontSize: 12, color: Colors.textSecondary },
  lineItemAmount: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
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
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  paymentRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  paymentInfo: {},
  paymentDate: { fontSize: 14, fontWeight: '500' as const, color: Colors.text },
  paymentMethod: { fontSize: 12, color: Colors.textTertiary },
  paymentAmount: { fontSize: 15, fontWeight: '600' as const, color: Colors.success },
  notesText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
});
