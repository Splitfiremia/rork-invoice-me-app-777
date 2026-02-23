import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { authService } from '@/src/services/authService';
import { isValidEmail } from '@/src/shared/utils/validators';
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = useCallback(async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }
    setError('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await authService.resetPassword(email);
      setSent(true);
      Alert.alert('Check Your Email', 'We sent a password reset link to your email address.');
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.textInverse} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we will send you a link to reset your password
              </Text>
            </View>

            <View style={styles.form}>
              {sent ? (
                <View style={styles.sentContainer}>
                  <View style={styles.sentIcon}>
                    <Mail size={32} color={Colors.accent} />
                  </View>
                  <Text style={styles.sentTitle}>Email Sent!</Text>
                  <Text style={styles.sentText}>
                    Check your inbox for a password reset link.
                  </Text>
                  <Button
                    title="Back to Sign In"
                    onPress={() => router.back()}
                    variant="secondary"
                    size="lg"
                  />
                </View>
              ) : (
                <>
                  <Input
                    label="Email Address"
                    placeholder="you@company.com"
                    value={email}
                    onChangeText={setEmail}
                    error={error}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Mail size={18} color={Colors.textTertiary} />}
                    testID="forgot-email"
                  />
                  <Button
                    title="Send Reset Link"
                    onPress={handleReset}
                    loading={loading}
                    size="lg"
                    testID="forgot-button"
                  />
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  sentContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  sentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sentText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
});
