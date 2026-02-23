import React, { useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/src/core/constants/colors';
import { BorderRadius, Spacing, TouchTarget } from '@/src/core/constants/spacing';
import { useReducedMotionPreference, springWithReducedMotion } from '@/src/shared/utils/reducedMotion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prefersReducedMotion = useReducedMotionPreference();

  const handlePressIn = useCallback(() => {
    springWithReducedMotion(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }, prefersReducedMotion).start();
  }, [scaleAnim, prefersReducedMotion]);

  const handlePressOut = useCallback(() => {
    springWithReducedMotion(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }, prefersReducedMotion).start();
  }, [scaleAnim, prefersReducedMotion]);

  const handlePress = useCallback(() => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [loading, disabled, onPress]);

  const variantStyles = getVariantStyles(variant, disabled);
  const sizeStyles = getSizeStyles(size);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        testID={testID}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={disabled || loading}
        style={[styles.base, variantStyles.container, sizeStyles.container, style]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.loaderColor}
          />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: Colors.primary, opacity } as ViewStyle,
        text: { color: Colors.textInverse } as TextStyle,
        loaderColor: Colors.textInverse,
      };
    case 'secondary':
      return {
        container: { backgroundColor: Colors.surfaceSecondary, opacity } as ViewStyle,
        text: { color: Colors.primary } as TextStyle,
        loaderColor: Colors.primary,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: Colors.primary,
          opacity,
        } as ViewStyle,
        text: { color: Colors.primary } as TextStyle,
        loaderColor: Colors.primary,
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent', opacity } as ViewStyle,
        text: { color: Colors.accent } as TextStyle,
        loaderColor: Colors.accent,
      };
    case 'danger':
      return {
        container: { backgroundColor: Colors.error, opacity } as ViewStyle,
        text: { color: Colors.textInverse } as TextStyle,
        loaderColor: Colors.textInverse,
      };
  }
}

function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return {
        container: { 
          paddingVertical: Spacing.sm, 
          paddingHorizontal: Spacing.lg,
          minHeight: TouchTarget.minimum, // Ensure minimum touch target
        } as ViewStyle,
        text: { fontSize: 13 } as TextStyle,
      };
    case 'md':
      return {
        container: { 
          paddingVertical: Spacing.md, 
          paddingHorizontal: Spacing.xl,
          minHeight: TouchTarget.comfortable, // Comfortable touch target
        } as ViewStyle,
        text: { fontSize: 15 } as TextStyle,
      };
    case 'lg':
      return {
        container: { 
          paddingVertical: Spacing.lg, 
          paddingHorizontal: Spacing.xxl,
          minHeight: TouchTarget.large, // Large touch target
        } as ViewStyle,
        text: { fontSize: 17 } as TextStyle,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
});
