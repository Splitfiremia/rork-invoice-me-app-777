import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  Clock,
  AlertTriangle,
  Users,
  Plus,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ClipboardList,
  Receipt,
  Bell,
  BarChart3,
} from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { StatCard } from '@/src/modules/dashboard/components/StatCard';
import { ActivityItem } from '@/src/modules/dashboard/components/ActivityItem';
import { useAuthStore } from '@/src/store/auth.store';
import { useNotificationStore } from '@/src/store/notification.store';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { useDashboardStats } from '@/src/hooks/useDashboardStats';
import { useRecentActivity } from '@/src/hooks/useRecentActivity';
import { formatCurrency } from '@/src/shared/utils/currency';
import * as Haptics from 'expo-haptics';

type RevenuePeriod = 'month' | 'year' | 'all';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const invoices = useInvoiceStore((s) => s.invoices);
  const stats = useDashboardStats();
  const activities = useRecentActivity();
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('all');

  const revenueByPeriod = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate revenue for this month
    const monthRevenue = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return (
          inv.status === 'paid' &&
          invDate.getMonth() === currentMonth &&
          invDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, inv) => sum + inv.amountPaid, 0);

    // Calculate revenue for last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthRevenue = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return (
          inv.status === 'paid' &&
          invDate.getMonth() === lastMonth &&
          invDate.getFullYear() === lastMonthYear
        );
      })
      .reduce((sum, inv) => sum + inv.amountPaid, 0);

    // Calculate growth percentage
    let growth = 0;
    if (lastMonthRevenue > 0) {
      growth = ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (monthRevenue > 0) {
      growth = 100; // If no revenue last month but have revenue this month, 100% growth
    }

    // Calculate revenue for this year
    const yearRevenue = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return inv.status === 'paid' && invDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.amountPaid, 0);

    return {
      month: { amount: monthRevenue, label: 'This Month', growth },
      year: { amount: yearRevenue, label: 'This Year' },
      all: { amount: stats.totalRevenue, label: 'All Time' },
    };
  }, [invoices, stats.totalRevenue]);

  const handleCreateInvoice = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/invoices/create' as any);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroContent}>
              <Text style={styles.greeting}>
                Good {getGreeting()},{' '}
                <Text style={styles.greetingName}>{user?.fullName?.split(' ')[0] ?? 'there'}</Text>
              </Text>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.bellButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/notifications' as any);
                }}
              >
                <Bell size={20} color={Colors.textInverse} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateInvoice}
                activeOpacity={0.8}
                testID="create-invoice-fab"
              >
                <Plus size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.revenuePeriodRow}>
            {(['month', 'year', 'all'] as RevenuePeriod[]).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodChip,
                  revenuePeriod === period && styles.periodChipActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setRevenuePeriod(period);
                }}
              >
                <Text
                  style={[
                    styles.periodText,
                    revenuePeriod === period && styles.periodTextActive,
                  ]}
                >
                  {revenueByPeriod[period].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.heroLabel}>Total Revenue</Text>
          <Text style={styles.heroAmount}>
            {formatCurrency(revenueByPeriod[revenuePeriod].amount)}
          </Text>
          {revenuePeriod === 'month' && (
            <View style={styles.heroSubRow}>
              {revenueByPeriod.month.growth >= 0 ? (
                <TrendingUp size={14} color="rgba(255,255,255,0.7)" />
              ) : (
                <TrendingDown size={14} color="rgba(255,255,255,0.7)" />
              )}
              <Text style={styles.heroSubText}>
                {revenueByPeriod.month.growth >= 0 ? '+' : ''}
                {revenueByPeriod.month.growth.toFixed(1)}% from last month
              </Text>
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <QuickAction
            icon={<FileText size={20} color={Colors.accent} />}
            label="Invoice"
            onPress={handleCreateInvoice}
          />
          <QuickAction
            icon={<ClipboardList size={20} color={Colors.statusPartial} />}
            label="Estimate"
            onPress={() => router.push('/(tabs)/estimates/create' as any)}
          />
          <QuickAction
            icon={<Receipt size={20} color={Colors.warning} />}
            label="Expense"
            onPress={() => router.push('/(tabs)/expenses/create' as any)}
          />
          <QuickAction
            icon={<Users size={20} color={Colors.success} />}
            label="Client"
            onPress={() => router.push('/(tabs)/clients/create' as any)}
          />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Outstanding"
              value={stats.totalOutstanding}
              icon={<Clock size={18} color={Colors.warning} />}
              color={Colors.warning}
            />
            <View style={{ width: Spacing.md }} />
            <StatCard
              title="Overdue"
              value={stats.totalOverdue}
              icon={<AlertTriangle size={18} color={Colors.error} />}
              color={Colors.error}
            />
          </View>
          <View style={[styles.statsRow, { marginTop: Spacing.md }]}>
            <StatCard
              title="Invoices"
              value={stats.invoiceCount}
              icon={<FileText size={18} color={Colors.accent} />}
              color={Colors.accent}
              isCurrency={false}
            />
            <View style={{ width: Spacing.md }} />
            <StatCard
              title="Clients"
              value={stats.clientCount}
              icon={<Users size={18} color={Colors.statusPartial} />}
              color={Colors.statusPartial}
              isCurrency={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.reportsButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/reports' as any);
          }}
          activeOpacity={0.7}
        >
          <BarChart3 size={20} color={Colors.accent} />
          <Text style={styles.reportsButtonText}>View Reports & Analytics</Text>
          <ArrowRight size={16} color={Colors.accent} />
        </TouchableOpacity>

        <View style={styles.invoiceSummary}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryDot, { backgroundColor: Colors.statusPaid }]} />
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={styles.summaryValue}>{stats.paidCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <View style={[styles.summaryDot, { backgroundColor: Colors.statusPending }]} />
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryValue}>{stats.pendingCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <View style={[styles.summaryDot, { backgroundColor: Colors.statusOverdue }]} />
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={styles.summaryValue}>{stats.overdueCount}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push('/(tabs)/invoices' as any)}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <ArrowRight size={14} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ActivityItem activity={activity} />
              {index < activities.length - 1 && <View style={styles.activityDivider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickActionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickActionIcon}>{icon}</View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  heroContent: {
    flex: 1,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textInverse,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  greetingName: {
    color: Colors.textInverse,
    fontWeight: '600' as const,
  },
  revenuePeriodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  periodChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  periodChipActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
  },
  periodTextActive: {
    color: Colors.textInverse,
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  heroSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    gap: Spacing.sm,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  statsGrid: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
  },
  reportsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportsButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.accent,
    flex: 1,
  },
  invoiceSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
});
