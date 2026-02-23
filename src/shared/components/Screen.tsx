import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/src/core/constants/colors';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  useSafeArea?: boolean; // Control SafeArea usage
}

export function Screen({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  refreshing,
  onRefresh,
  useSafeArea = true,
}: ScreenProps) {
  const content = scrollable ? (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, styles.content, style]}>{children}</View>
  );

  if (useSafeArea) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
});
