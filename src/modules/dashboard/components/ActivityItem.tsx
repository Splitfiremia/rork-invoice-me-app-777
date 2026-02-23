import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileText, CreditCard, Send, UserPlus, DollarSign } from 'lucide-react-native';
import { RecentActivity } from '../types';
import { Colors } from '@/src/core/constants/colors';
import { Spacing } from '@/src/core/constants/spacing';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatRelativeTime } from '@/src/shared/utils/formatDate';

interface ActivityItemProps {
  activity: RecentActivity;
}

const activityConfig: Record<
  RecentActivity['type'],
  { icon: React.ReactNode; color: string }
> = {
  invoice_created: {
    icon: <FileText size={16} color={Colors.accent} />,
    color: Colors.accent,
  },
  invoice_paid: {
    icon: <CreditCard size={16} color={Colors.success} />,
    color: Colors.success,
  },
  invoice_sent: {
    icon: <Send size={16} color={Colors.statusSent} />,
    color: Colors.statusSent,
  },
  client_added: {
    icon: <UserPlus size={16} color={Colors.statusPartial} />,
    color: Colors.statusPartial,
  },
  payment_received: {
    icon: <DollarSign size={16} color={Colors.success} />,
    color: Colors.success,
  },
};

export function ActivityItem({ activity }: ActivityItemProps) {
  const config = activityConfig[activity.type];

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: config.color + '15' }]}>
        {config.icon}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.description} numberOfLines={1}>{activity.description}</Text>
      </View>
      <View style={styles.right}>
        {activity.amount !== undefined && (
          <Text style={styles.amount}>{formatCurrency(activity.amount)}</Text>
        )}
        <Text style={styles.time}>{formatRelativeTime(activity.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  time: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
