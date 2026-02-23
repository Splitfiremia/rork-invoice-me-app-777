import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Check, Sun, Moon, Smartphone } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { useTheme } from '@/src/core/theme';
import * as Haptics from 'expo-haptics';

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { key: ThemeOption; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'light',
    label: 'Light',
    description: 'Use light theme always',
    icon: <Sun size={24} color={Colors.accent} />,
  },
  {
    key: 'dark',
    label: 'Dark',
    description: 'Use dark theme always',
    icon: <Moon size={24} color={Colors.primary} />,
  },
  {
    key: 'system',
    label: 'System',
    description: 'Match system settings',
    icon: <Smartphone size={24} color={Colors.success} />,
  },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleThemeSelect = useCallback((selectedTheme: ThemeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(selectedTheme);
  }, [setTheme]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Appearance',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Theme</Text>
        <Text style={styles.sectionDescription}>
          Choose how InvoiceMe looks. Select a theme or match your device's settings.
        </Text>

        <View style={styles.optionsContainer}>
          {THEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.option,
                theme === option.key && styles.optionActive,
              ]}
              onPress={() => handleThemeSelect(option.key)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} theme`}
              accessibilityHint={option.description}
              accessibilityState={{ selected: theme === option.key }}
            >
              <View style={styles.optionIcon}>{option.icon}</View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              {theme === option.key && (
                <View style={styles.checkContainer}>
                  <Check size={20} color={Colors.primary} strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Themes</Text>
          <Text style={styles.infoText}>
            Dark mode reduces eye strain in low-light environments and can help save battery on OLED screens.
          </Text>
          <Text style={styles.infoText}>
            System theme automatically switches between light and dark based on your device settings.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.massive,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
});
