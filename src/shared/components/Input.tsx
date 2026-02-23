import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { BorderRadius, Spacing, TouchTarget } from '@/src/core/constants/spacing';
import { useReducedMotionPreference, animateWithReducedMotion } from '@/src/shared/utils/reducedMotion';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  containerStyle,
  isPassword,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const prefersReducedMotion = useReducedMotionPreference();

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    animateWithReducedMotion(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }, prefersReducedMotion).start();
  }, [borderAnim, prefersReducedMotion]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    animateWithReducedMotion(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }, prefersReducedMotion).start();
  }, [borderAnim, prefersReducedMotion]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? Colors.error : Colors.border, error ? Colors.error : Colors.accent],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputWrapper,
          { borderColor },
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          testID={testID}
          style={[styles.input, leftIcon ? styles.inputWithIcon : null]}
          placeholderTextColor={Colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: props.editable === false }}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityHint="Toggles password visibility"
          >
            {showPassword ? (
              <EyeOff size={20} color={Colors.textTertiary} />
            ) : (
              <Eye size={20} color={Colors.textTertiary} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <Text 
          style={styles.error}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    minHeight: TouchTarget.comfortable, // Ensure proper touch target
  },
  inputWrapperFocused: {
    backgroundColor: Colors.surface,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    fontSize: 16, // 16dp body text standard
    color: Colors.text,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  iconLeft: {
    paddingLeft: Spacing.lg,
  },
  iconRight: {
    paddingRight: Spacing.lg,
    minWidth: TouchTarget.minimum,
    minHeight: TouchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
