import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, FileText } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { useAuthStore } from '@/src/store/auth.store';
import { authService } from '@/src/services/authService';
import { isValidEmail } from '@/src/shared/utils/validators';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback(() => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!isValidEmail(email)) newErrors.email = 'Invalid email address';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const session = await authService.signIn(email, password);
      setUser(session.user);
      router.replace('/(tabs)/dashboard' as any);
    } catch (error) {
      setErrors({ email: 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  }, [validate, email, password, setUser, router]);

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <FileText size={32} color={Colors.textInverse} />
              </View>
              <Text style={styles.title}>Invoice Me</Text>
              <Text style={styles.subtitle}>Sign in to manage your invoices</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="you@company.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={Colors.textTertiary} />}
                testID="login-email"
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                isPassword
                leftIcon={<Lock size={18} color={Colors.textTertiary} />}
                testID="login-password"
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password' as any)}
                style={styles.forgotLink}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                size="lg"
                testID="login-button"
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don{"'"}t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  footerLink: {
    fontSize: 15,
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
