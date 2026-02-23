import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import {
  DollarSign,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  CheckCheck,
} from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { useNotificationStore } from '@/src/store/notification.store';
import { AppNotification, NotificationType } from '@/src/modules/notifications/types';
import { formatRelativeTime } from '@/src/shared/utils/formatDate';
import { EmptyState } from '@/src/shared/components/EmptyState';
import * as Haptics from 'expo-haptics';

const iconMap: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  invoice_paid: { icon: <DollarSign size={18} color={Colors.success} />, color: '#D1FAE5' },
  invoice_viewed: { icon: <Eye size={18} color={Colors.accent} />, color: '#E0F2FE' },
  invoice_overdue: { icon: <AlertTriangle size={18} color={Colors.error} />, color: '#FEE2E2' },
  payment_received: { icon: <CheckCircle size={18} color={Colors.success} />, color: '#D1FAE5' },
  estimate_accepted: { icon: <CheckCircle size={18} color={Colors.statusPaid} />, color: '#D1FAE5' },
  estimate_rejected: { icon: <XCircle size={18} color={Colors.error} />, color: '#FEE2E2' },
  reminder: { icon: <Bell size={18} color={Colors.warning} />, color: '#FEF3C7' },
};

export default function NotificationsScreen() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      markAsRead(notification.id);
    },
    [markAsRead]
  );

  const handleMarkAllRead = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markAllAsRead();
  }, [markAllAsRead]);

  const renderNotification = useCallback(
    ({ item }: { item: AppNotification }) => {
      const iconConfig = iconMap[item.type];

      return (
        <TouchableOpacity
          style={[styles.notifCard, !item.read && styles.notifCardUnread]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.notifIcon, { backgroundColor: iconConfig.color }]}>
            {iconConfig.icon}
          </View>
          <View style={styles.notifContent}>
            <View style={styles.notifHeader}>
              <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
                {item.title}
              </Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notifMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.notifTime}>{formatRelativeTime(item.timestamp)}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [handleNotificationPress]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () =>
            unreadCount > 0 ? (
              <TouchableOpacity onPress={handleMarkAllRead} style={{ padding: 4 }}>
                <CheckCheck size={20} color={Colors.accent} />
              </TouchableOpacity>
            ) : null,
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Bell size={36} color={Colors.textTertiary} />}
              title="No notifications"
              description="You're all caught up! Notifications will appear here."
            />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.massive },
  notifCard: {
    flexDirection: 'row', backgroundColor: Colors.surface, padding: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, borderRadius: BorderRadius.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  notifCardUnread: { backgroundColor: '#F0F9FF' },
  notifIcon: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  notifTitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  notifTitleUnread: { color: Colors.primary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  notifMessage: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: Colors.textTertiary },
});
