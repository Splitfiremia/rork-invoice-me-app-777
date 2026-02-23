import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  FileText,
  Globe,
  Palette,
  Trash2,
  BarChart3,
} from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { useAuthStore } from '@/src/store/auth.store';
import { authService } from '@/src/services/authService';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = useCallback(async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          try {
            await authService.signOut();
            logout();
            router.replace('/(auth)/login' as any);
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  }, [logout, router]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert('Account Deletion', 'Account deletion will be available when connected to the backend.');
          },
        },
      ]
    );
  }, []);

  const initials = user?.fullName
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() ?? 'U';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => router.push('/settings/profile' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName ?? 'User'}</Text>
              <Text style={styles.profileBusiness}>{user?.businessName ?? ''}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<User size={18} color={Colors.accent} />}
              title="Profile"
              onPress={() => router.push('/settings/profile' as any)}
            />
            <SettingsRow
              icon={<Building2 size={18} color={Colors.statusPartial} />}
              title="Business Details"
              subtitle={user?.businessName}
              onPress={() => router.push('/settings/business' as any)}
            />
            <SettingsRow
              icon={<FileText size={18} color={Colors.success} />}
              title="Invoice Templates"
              onPress={() => Alert.alert('Templates', 'Invoice templates will be available soon.')}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<Globe size={18} color={Colors.warning} />}
              title="Currency"
              subtitle={user?.currency ?? 'USD'}
              onPress={() => router.push('/settings/currency' as any)}
            />
            <SettingsRow
              icon={<Bell size={18} color={Colors.error} />}
              title="Notifications"
              onPress={() => router.push('/notifications' as any)}
            />
            <SettingsRow
              icon={<Palette size={18} color={Colors.statusPartial} />}
              title="Appearance"
              onPress={() => router.push('/settings/appearance' as any)}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PAYMENTS & TAX</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<CreditCard size={18} color={Colors.success} />}
              title="Payment Methods"
              onPress={() => Alert.alert('Payments', 'Payment methods will be available when connected to backend.')}
            />
            <SettingsRow
              icon={<Shield size={18} color={Colors.accent} />}
              title="Tax Settings"
              subtitle={`${user?.taxRate ?? 0}%`}
              onPress={() => router.push('/settings/tax' as any)}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<BarChart3 size={18} color={Colors.accent} />}
              title="Reports & Analytics"
              onPress={() => router.push('/reports' as any)}
            />
            <SettingsRow
              icon={<FileText size={18} color={Colors.textSecondary} />}
              title="Export Data"
              onPress={() => Alert.alert('Export', 'Data export will be available when connected to backend.')}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<HelpCircle size={18} color={Colors.textSecondary} />}
              title="Help & Support"
              onPress={() => Alert.alert('Help', 'Support will be available soon.')}
            />
            <SettingsRow
              icon={<Mail size={18} color={Colors.textSecondary} />}
              title="Contact Us"
              onPress={() => Alert.alert('Contact', 'Contact form will be available soon.')}
              isLast
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Trash2 size={16} color={Colors.error} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Invoice Me v1.0.0</Text>
      </ScrollView>
    </>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  isLast,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[rowStyles.container, !isLast && rowStyles.border]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={rowStyles.iconContainer}>{icon}</View>
      <View style={rowStyles.content}>
        <Text style={rowStyles.title}>{title}</Text>
        {subtitle && <Text style={rowStyles.subtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.massive,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textInverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textInverse,
  },
  profileBusiness: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  section: {
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxxl,
    marginHorizontal: Spacing.lg,
    paddingVertical: 14,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
  },
});
