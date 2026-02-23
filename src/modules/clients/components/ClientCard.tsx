import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronRight, Building2 } from 'lucide-react-native';
import { Client } from '../types';
import { Colors } from '@/src/core/constants/colors';
import { BorderRadius, Spacing } from '@/src/core/constants/spacing';
import { getShadow } from '@/src/core/constants/shadows';
import { formatCurrency } from '@/src/shared/utils/currency';
import { useReducedMotionPreference, springWithReducedMotion } from '@/src/shared/utils/reducedMotion';

interface ClientCardProps {
  client: Client;
  onPress: (id: string) => void;
}

export const ClientCard = React.memo(function ClientCard({ client, onPress }: ClientCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prefersReducedMotion = useReducedMotionPreference();

  const handlePressIn = useCallback(() => {
    springWithReducedMotion(scaleAnim, { 
      toValue: 0.98, 
      useNativeDriver: true 
    }, prefersReducedMotion).start();
  }, [scaleAnim, prefersReducedMotion]);

  const handlePressOut = useCallback(() => {
    springWithReducedMotion(scaleAnim, { 
      toValue: 1, 
      useNativeDriver: true 
    }, prefersReducedMotion).start();
  }, [scaleAnim, prefersReducedMotion]);

  const initials = client.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarColors = ['#0EA5E9', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];
  const colorIndex = client.name.charCodeAt(0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(client.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        testID={`client-card-${client.id}`}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Client ${client.name}${client.company ? ` from ${client.company}` : ''}`}
        accessibilityHint={`Outstanding balance: ${formatCurrency(client.totalOutstanding)}`}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{client.name}</Text>
          {client.company && (
            <View style={styles.companyRow}>
              <Building2 size={12} color={Colors.textTertiary} />
              <Text style={styles.company} numberOfLines={1}>{client.company}</Text>
            </View>
          )}
          <Text style={styles.email} numberOfLines={1}>{client.email}</Text>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.amount}>{formatCurrency(client.totalOutstanding)}</Text>
          <Text style={styles.amountLabel}>outstanding</Text>
          <ChevronRight size={16} color={Colors.textTertiary} style={styles.chevron} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...getShadow('sm'), // Use consistent elevation
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  info: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  company: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  email: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  amountLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  chevron: {
    marginTop: 4,
  },
});
