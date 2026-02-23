import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Download,
} from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { useExpenseStore } from '@/src/store/expense.store';
import { useClientStore } from '@/src/store/client.store';
import { usePaymentStore } from '@/src/store/payment.store';
import { formatCurrency } from '@/src/shared/utils/currency';
import * as Haptics from 'expo-haptics';

type ReportPeriod = 'month' | 'quarter' | 'year' | 'all';

const PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
];

export default function ReportsScreen() {
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>('year');
  const invoices = useInvoiceStore((s) => s.invoices);
  const expenses = useExpenseStore((s) => s.expenses);
  const clients = useClientStore((s) => s.clients);
  const payments = usePaymentStore((s) => s.payments);

  const stats = useMemo(() => {
    // Helper function to determine start date for each period
    const getStartDate = (period: ReportPeriod): Date | null => {
      const now = new Date();
      if (period === 'all') return null;
      
      if (period === 'month') {
        return new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      if (period === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), currentQuarter * 3, 1);
      }
      
      if (period === 'year') {
        return new Date(now.getFullYear(), 0, 1);
      }
      
      return null;
    };

    const startDate = getStartDate(activePeriod);
    
    // Filter data by period
    const filteredInvoices = startDate
      ? invoices.filter((inv) => new Date(inv.createdAt) >= startDate)
      : invoices;
    
    const filteredExpenses = startDate
      ? expenses.filter((exp) => new Date(exp.date) >= startDate)
      : expenses;
    
    const filteredPayments = startDate
      ? payments.filter((p) => new Date(p.date) >= startDate)
      : payments;

    const totalRevenue = filteredInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalOutstanding = filteredInvoices
      .filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.amountDue, 0);

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const totalTaxCollected = filteredInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.taxAmount, 0);

    const totalTaxPaid = filteredExpenses.reduce((sum, exp) => sum + exp.taxAmount, 0);

    const netProfit = totalRevenue - totalExpenses;

    const paidInvoiceCount = filteredInvoices.filter((inv) => inv.status === 'paid').length;
    const overdueInvoiceCount = filteredInvoices.filter((inv) => inv.status === 'overdue').length;

    const topClients = clients
      .map((c) => ({
        name: c.name,
        total: c.totalInvoiced,
        paid: c.totalPaid,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const expenseByCategory = filteredExpenses.reduce<Record<string, number>>((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    return {
      totalRevenue,
      totalPaid,
      totalOutstanding,
      totalExpenses,
      totalTaxCollected,
      totalTaxPaid,
      netProfit,
      paidInvoiceCount,
      overdueInvoiceCount,
      topClients,
      expenseByCategory,
    };
  }, [invoices, expenses, clients, payments, activePeriod]);

  const handleExport = useCallback((type: 'csv' | 'pdf') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Export',
      `${type.toUpperCase()} export will be available when connected to the backend.`
    );
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Reports',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => handleExport('csv')}
              style={{ padding: 4 }}
            >
              <Download size={20} color={Colors.accent} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.periodRow}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodChip,
                activePeriod === period.key && styles.periodChipActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActivePeriod(period.key);
              }}
            >
              <Text
                style={[
                  styles.periodText,
                  activePeriod === period.key && styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Profit / Loss</Text>
          <Text
            style={[
              styles.summaryAmount,
              { color: stats.netProfit >= 0 ? Colors.success : Colors.error },
            ]}
          >
            {formatCurrency(stats.netProfit)}
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Revenue</Text>
              <Text style={[styles.summaryItemValue, { color: Colors.success }]}>
                {formatCurrency(stats.totalRevenue)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Expenses</Text>
              <Text style={[styles.summaryItemValue, { color: Colors.error }]}>
                {formatCurrency(stats.totalExpenses)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Revenue</Text>
        <View style={styles.card}>
          <ReportRow
            icon={<DollarSign size={16} color={Colors.success} />}
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
          />
          <ReportRow
            icon={<TrendingUp size={16} color={Colors.accent} />}
            label="Payments Received"
            value={formatCurrency(stats.totalPaid)}
          />
          <ReportRow
            icon={<DollarSign size={16} color={Colors.warning} />}
            label="Outstanding"
            value={formatCurrency(stats.totalOutstanding)}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Tax Summary</Text>
        <View style={styles.card}>
          <ReportRow
            icon={<Receipt size={16} color={Colors.accent} />}
            label="Tax Collected"
            value={formatCurrency(stats.totalTaxCollected)}
          />
          <ReportRow
            icon={<Receipt size={16} color={Colors.error} />}
            label="Tax on Expenses"
            value={formatCurrency(stats.totalTaxPaid)}
          />
          <ReportRow
            icon={<DollarSign size={16} color={Colors.primary} />}
            label="Net Tax"
            value={formatCurrency(stats.totalTaxCollected - stats.totalTaxPaid)}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Top Clients</Text>
        <View style={styles.card}>
          {stats.topClients.map((client, index) => (
            <View
              key={client.name}
              style={[
                styles.clientRow,
                index < stats.topClients.length - 1 && styles.clientRowBorder,
              ]}
            >
              <View style={styles.clientRank}>
                <Text style={styles.clientRankText}>{index + 1}</Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientPaid}>
                  {formatCurrency(client.paid)} paid
                </Text>
              </View>
              <Text style={styles.clientTotal}>{formatCurrency(client.total)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        <View style={styles.card}>
          {Object.entries(stats.expenseByCategory).map(([category, amount], index, arr) => (
            <View
              key={category}
              style={[
                styles.expenseRow,
                index < arr.length - 1 && styles.expenseRowBorder,
              ]}
            >
              <Text style={styles.expenseCat}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <Text style={styles.expenseAmount}>{formatCurrency(amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.exportSection}>
          <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('csv')}>
            <Download size={16} color={Colors.accent} />
            <Text style={styles.exportText}>Export as CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('pdf')}>
            <Download size={16} color={Colors.accent} />
            <Text style={styles.exportText}>Export as PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

function ReportRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[reportRowStyles.container, !isLast && reportRowStyles.border]}>
      <View style={reportRowStyles.left}>
        {icon}
        <Text style={reportRowStyles.label}>{label}</Text>
      </View>
      <Text style={reportRowStyles.value}>{value}</Text>
    </View>
  );
}

const reportRowStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontSize: 14, color: Colors.text },
  value: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.massive },
  periodRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm,
  },
  periodChip: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  periodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText: { fontSize: 12, fontWeight: '500' as const, color: Colors.textSecondary },
  periodTextActive: { color: Colors.textInverse },
  summaryCard: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, padding: Spacing.xl,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.xxl, alignItems: 'center',
  },
  summaryTitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  summaryAmount: { fontSize: 34, fontWeight: '700' as const, marginTop: Spacing.sm, letterSpacing: -0.5 },
  summaryRow: { flexDirection: 'row', marginTop: Spacing.lg, width: '100%' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryItemLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  summaryItemValue: { fontSize: 16, fontWeight: '600' as const, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: {
    fontSize: 17, fontWeight: '600' as const, color: Colors.text,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, marginTop: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  clientRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  clientRank: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  clientRankText: { fontSize: 13, fontWeight: '700' as const, color: Colors.textSecondary },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '500' as const, color: Colors.text },
  clientPaid: { fontSize: 12, color: Colors.textTertiary },
  clientTotal: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  expenseRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  expenseCat: { fontSize: 14, color: Colors.text },
  expenseAmount: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  exportSection: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.md, marginTop: Spacing.lg },
  exportButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  exportText: { fontSize: 14, fontWeight: '500' as const, color: Colors.accent },
});
