import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { useAuthStore } from '@/src/store/auth.store';
import * as Haptics from 'expo-haptics';

export default function TaxSettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [taxRate, setTaxRate] = useState(String(user?.taxRate ?? 0));

  const handleSave = useCallback(() => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUser({ ...user, taxRate: parseFloat(taxRate) || 0 });
    Alert.alert('Saved', 'Tax settings updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [user, taxRate, setUser, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Tax Settings' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Set your default tax rate. This will be applied to new invoices and estimates.
        </Text>
        <View style={styles.card}>
          <Input
            label="Default Tax Rate (%)"
            placeholder="0"
            value={taxRate}
            onChangeText={setTaxRate}
            keyboardType="numeric"
            testID="tax-rate"
          />
        </View>
        <View style={styles.actions}>
          <Button title="Save Changes" onPress={handleSave} size="lg" />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingVertical: Spacing.xxl, paddingBottom: Spacing.massive },
  description: {
    fontSize: 14, color: Colors.textSecondary, lineHeight: 20,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  actions: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl },
});
