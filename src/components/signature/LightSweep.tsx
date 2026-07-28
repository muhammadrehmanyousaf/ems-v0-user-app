/**
 * LightSweep — a champagne sheen that sweeps once across its children on mount,
 * echoing gota / zardozi metallic thread catching the light. The brand's motion
 * signature for the hero headline. Reduced-motion safe (renders static). Kept
 * dependency-free (Reanimated + expo-linear-gradient); can graduate to a
 * Skia gradient-masked version later for a per-glyph shimmer.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { duration, easing, gradients } from '@/theme';

/** Owns the sweep progress; writing the shared value inside a hook keeps the
 *  react-compiler immutability lint happy (same pattern as usePressScale). */
function useSweepProgress(delay: number) {
  const progress = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    progress.value = withDelay(delay, withTiming(1, { duration: duration.hero, easing: easing.decelerate }));
  }, [reduced, delay, progress]);
  return progress;
}

export function LightSweep({
  children,
  delay = 280,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const progress = useSweepProgress(delay);

  const band = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-380, 380]) }, { rotateZ: '18deg' }],
    opacity: interpolate(progress.value, [0, 0.15, 0.5, 0.85, 1], [0, 0.55, 0.85, 0.55, 0]),
  }));

  return (
    <View style={[styles.wrap, style]}>
      {children}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={[styles.strip, band]}>
          <LinearGradient
            colors={gradients.champagne}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  strip: { position: 'absolute', top: -90, bottom: -90, width: 130 },
});
