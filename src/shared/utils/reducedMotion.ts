/**
 * Reduced Motion Utilities
 * Respects system preferences for reduced motion
 */

import { useState, useEffect } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';

/**
 * Hook to check if user prefers reduced motion
 * Returns true if reduced motion is enabled
 */
export function useReducedMotionPreference(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check if AccessibilityInfo has the reduced motion API
    if (AccessibilityInfo.isReduceMotionEnabled) {
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        setReducedMotion(enabled ?? false);
      });

      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled) => {
          setReducedMotion(enabled);
        }
      );

      return () => {
        subscription?.remove();
      };
    }
  }, []);

  return reducedMotion;
}

/**
 * Get animation duration based on reduced motion preference
 * @param normalDuration - Normal animation duration in ms
 * @param reducedMotion - Whether reduced motion is enabled
 * @returns Animation duration (0 if reduced motion is enabled)
 */
export function getAnimationDuration(normalDuration: number, reducedMotion: boolean): number {
  return reducedMotion ? 0 : normalDuration;
}

/**
 * Create an animated timing with reduced motion support
 * @param value - Animated value
 * @param config - Animation config
 * @param reducedMotion - Whether reduced motion is enabled
 */
export function animateWithReducedMotion(
  value: Animated.Value,
  config: Omit<Animated.TimingAnimationConfig, 'toValue'> & { toValue: number },
  reducedMotion: boolean
): Animated.CompositeAnimation {
  if (reducedMotion) {
    // Instantly set the value without animation
    value.setValue(config.toValue);
    return {
      start: (callback?: Animated.EndCallback) => {
        callback?.({ finished: true });
      },
      stop: () => {},
      reset: () => {},
    } as Animated.CompositeAnimation;
  }
  
  return Animated.timing(value, config);
}

/**
 * Create a spring animation with reduced motion support
 * @param value - Animated value
 * @param config - Spring animation config
 * @param reducedMotion - Whether reduced motion is enabled
 */
export function springWithReducedMotion(
  value: Animated.Value,
  config: Omit<Animated.SpringAnimationConfig, 'toValue'> & { toValue: number },
  reducedMotion: boolean
): Animated.CompositeAnimation {
  if (reducedMotion) {
    // Instantly set the value without animation
    value.setValue(config.toValue);
    return {
      start: (callback?: Animated.EndCallback) => {
        callback?.({ finished: true });
      },
      stop: () => {},
      reset: () => {},
    } as Animated.CompositeAnimation;
  }
  
  return Animated.spring(value, config);
}
