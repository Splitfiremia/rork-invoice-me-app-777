import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing } from '@/src/core/constants/spacing';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export function Loading({ message, size = 'large', color = Colors.primary }: LoadingProps) {
  return (
    <View style={styles.container} accessible={true} accessibilityRole="progressbar" accessibilityLabel={message || 'Loading'}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  message: {
    marginTop: Spacing.lg,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
