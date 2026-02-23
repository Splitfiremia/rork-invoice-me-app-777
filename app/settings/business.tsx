import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { useAuthStore } from '@/src/store/auth.store';
import * as Haptics from 'expo-haptics';

export default function BusinessSettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [businessName, setBusinessName] = useState(user?.businessName ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [state, setState] = useState(user?.state ?? '');
  const [zip, setZip] = useState(user?.zip ?? '');

  const handleSave = useCallback(() => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUser({
      ...user,
      businessName: businessName.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      zip: zip.trim() || undefined,
    });
    Alert.alert('Saved', 'Business details updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [user, businessName, address, city, state, zip, setUser, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Business Details' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Input
              label="Business Name"
              placeholder="Your business name"
              value={businessName}
              onChangeText={setBusinessName}
              testID="business-name"
            />
            <Input
              label="Street Address"
              placeholder="123 Main St"
              value={address}
              onChangeText={setAddress}
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Input label="City" placeholder="City" value={city} onChangeText={setCity} />
              </View>
              <View style={styles.halfField}>
                <Input label="State" placeholder="State" value={state} onChangeText={setState} />
              </View>
            </View>
            <Input
              label="ZIP Code"
              placeholder="00000"
              value={zip}
              onChangeText={setZip}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.actions}>
            <Button title="Save Changes" onPress={handleSave} size="lg" testID="save-business" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingVertical: Spacing.xxl, paddingBottom: Spacing.massive },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },
  actions: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl },
});
