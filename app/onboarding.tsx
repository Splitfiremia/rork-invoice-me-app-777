import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  Building2,
  Globe,
  Percent,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { useAuthStore } from '@/src/store/auth.store';
import * as Haptics from 'expo-haptics';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL'];

export default function OnboardingScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState(user?.businessName ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'USD');
  const [taxRate, setTaxRate] = useState(String(user?.taxRate ?? '0'));

  const progressAnim = useRef(new Animated.Value(0)).current;
  const totalSteps = 3;

  const animateProgress = useCallback(
    (toStep: number) => {
      Animated.timing(progressAnim, {
        toValue: (toStep + 1) / totalSteps,
        duration: 300,
        useNativeDriver: false,
      }).start();
    },
    [progressAnim]
  );

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < totalSteps - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      animateProgress(nextStep);
    } else {
      if (user) {
        setUser({
          ...user,
          businessName: businessName.trim() || user.businessName,
          currency,
          taxRate: parseFloat(taxRate) || 0,
        });
      }
      router.replace('/(tabs)/dashboard' as any);
    }
  }, [step, user, businessName, currency, taxRate, setUser, router, animateProgress]);

  const handleSkip = useCallback(() => {
    router.replace('/(tabs)/dashboard' as any);
  }, [router]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Building2 size={32} color={Colors.primary} />
              </View>
              <Text style={styles.stepTitle}>Your Business</Text>
              <Text style={styles.stepSubtitle}>
                Tell us about your business so we can personalize your invoices.
              </Text>
              <View style={styles.formSection}>
                <Input
                  label="Business Name"
                  placeholder="Your business name"
                  value={businessName}
                  onChangeText={setBusinessName}
                  testID="onboarding-business-name"
                />
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Globe size={32} color={Colors.primary} />
              </View>
              <Text style={styles.stepTitle}>Currency</Text>
              <Text style={styles.stepSubtitle}>
                Select your default currency for invoices and expenses.
              </Text>
              <View style={styles.currencyGrid}>
                {CURRENCIES.map((cur) => (
                  <TouchableOpacity
                    key={cur}
                    style={[
                      styles.currencyChip,
                      currency === cur && styles.currencyChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setCurrency(cur);
                    }}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        currency === cur && styles.currencyTextActive,
                      ]}
                    >
                      {cur}
                    </Text>
                    {currency === cur && <Check size={14} color={Colors.textInverse} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Percent size={32} color={Colors.primary} />
              </View>
              <Text style={styles.stepTitle}>Tax Rate</Text>
              <Text style={styles.stepSubtitle}>
                Set your default tax rate. You can change this later in settings.
              </Text>
              <View style={styles.formSection}>
                <Input
                  label="Default Tax Rate (%)"
                  placeholder="0"
                  value={taxRate}
                  onChangeText={setTaxRate}
                  keyboardType="numeric"
                  testID="onboarding-tax-rate"
                />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={step === totalSteps - 1 ? 'Get Started' : 'Continue'}
            onPress={handleNext}
            size="lg"
            icon={
              step < totalSteps - 1 ? (
                <ChevronRight size={18} color={Colors.textInverse} />
              ) : undefined
            }
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg, gap: Spacing.lg,
  },
  progressBar: {
    flex: 1, height: 4, backgroundColor: Colors.borderLight, borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  skipText: { fontSize: 14, fontWeight: '500' as const, color: Colors.textTertiary },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xxxl },
  stepContent: { alignItems: 'center' },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xxl,
  },
  stepTitle: { fontSize: 26, fontWeight: '700' as const, color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  stepSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxxl },
  formSection: { width: '100%' },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center', width: '100%' },
  currencyChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    minWidth: 90, justifyContent: 'center',
  },
  currencyChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  currencyText: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  currencyTextActive: { color: Colors.textInverse },
  footer: { paddingHorizontal: Spacing.xxl, paddingBottom: 40, paddingTop: Spacing.lg },
});
