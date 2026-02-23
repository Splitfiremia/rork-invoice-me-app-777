import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  retryLabel = 'Try Again' 
}: ErrorStateProps) {
  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${title}. ${message}`}
    >
      <View style={styles.iconContainer}>
        <AlertCircle size={48} color={Colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          style={styles.button}
          accessibilityLabel={`${retryLabel} button`}
          accessibilityHint="Retry the failed action"
        />
      )}
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
  },
});
