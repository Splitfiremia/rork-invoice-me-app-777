import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { useAuthStore } from '@/src/store/auth.store';
import * as Haptics from 'expo-haptics';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
];

export default function CurrencySettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [selected, setSelected] = useState(user?.currency ?? 'USD');

  const handleSelect = useCallback(
    (code: string) => {
      Haptics.selectionAsync();
      setSelected(code);
      if (user) {
        setUser({ ...user, currency: code });
      }
      Alert.alert('Currency Updated', `Default currency set to ${code}.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    [user, setUser, router]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Currency' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {CURRENCIES.map((cur, index) => (
            <TouchableOpacity
              key={cur.code}
              style={[
                styles.row,
                index < CURRENCIES.length - 1 && styles.rowBorder,
              ]}
              onPress={() => handleSelect(cur.code)}
              activeOpacity={0.6}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencySymbol}>{cur.symbol}</Text>
                <View>
                  <Text style={styles.currencyCode}>{cur.code}</Text>
                  <Text style={styles.currencyName}>{cur.name}</Text>
                </View>
              </View>
              {selected === cur.code && <Check size={20} color={Colors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingVertical: Spacing.xxl, paddingBottom: Spacing.massive },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg, paddingHorizontal: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  currencyInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  currencySymbol: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceSecondary,
    textAlign: 'center', lineHeight: 36, fontSize: 16, fontWeight: '600' as const, color: Colors.text,
    overflow: 'hidden',
  },
  currencyCode: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  currencyName: { fontSize: 12, color: Colors.textTertiary },
});
