import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Briefcase, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { useAuthStore } from '@/src/store/auth.store';
import { authService } from '@/src/services/authService';
import { isValidEmail, validatePassword } from '@/src/shared/utils/validators';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!isValidEmail(email)) newErrors.email = 'Invalid email address';
    const pwResult = validatePassword(password);
    if (!pwResult.valid) newErrors.password = pwResult.message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fullName, email, password]);

  const handleRegister = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const session = await authService.signUp({
        email,
        password,
        fullName,
        businessName,
      });
      setUser(session.user);
      router.replace('/(tabs)/dashboard' as any);
    } catch (error) {
      setErrors({ email: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [validate, email, password, fullName, businessName, setUser, router]);

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.textInverse} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start invoicing in minutes</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
                leftIcon={<User size={18} color={Colors.textTertiary} />}
                testID="register-name"
              />
              <Input
                label="Email"
                placeholder="you@company.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={Colors.textTertiary} />}
                testID="register-email"
              />
              <Input
                label="Password"
                placeholder="Minimum 8 characters"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                isPassword
                leftIcon={<Lock size={18} color={Colors.textTertiary} />}
                testID="register-password"
              />
              <Input
                label="Business Name (Optional)"
                placeholder="Your Business LLC"
                value={businessName}
                onChangeText={setBusinessName}
                leftIcon={<Briefcase size={18} color={Colors.textTertiary} />}
                testID="register-business"
              />

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                size="lg"
                testID="register-button"
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
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
