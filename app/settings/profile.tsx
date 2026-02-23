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

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const handleSave = useCallback(() => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUser({
      ...user,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
    Alert.alert('Saved', 'Profile updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [user, fullName, email, phone, setUser, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
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
              label="Full Name"
              placeholder="Your name"
              value={fullName}
              onChangeText={setFullName}
              testID="profile-name"
            />
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="profile-email"
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.actions}>
            <Button title="Save Changes" onPress={handleSave} size="lg" testID="save-profile" />
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
  actions: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl },
});
