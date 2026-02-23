import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EstimateStatus } from '../types';
import { Colors } from '@/src/core/constants/colors';
import { BorderRadius, Spacing } from '@/src/core/constants/spacing';

interface EstimateStatusBadgeProps {
  status: EstimateStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<EstimateStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: Colors.statusDraft, bg: '#F1F5F9' },
  sent: { label: 'Sent', color: Colors.statusSent, bg: '#E0F2FE' },
  accepted: { label: 'Accepted', color: Colors.statusPaid, bg: '#D1FAE5' },
  rejected: { label: 'Rejected', color: Colors.statusOverdue, bg: '#FEE2E2' },
  expired: { label: 'Expired', color: '#6B7280', bg: '#F3F4F6' },
};

export function EstimateStatusBadge({ status, size = 'sm' }: EstimateStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'md' && styles.badgeMd]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }, size === 'md' && styles.textMd]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  textMd: {
    fontSize: 13,
  },
});
