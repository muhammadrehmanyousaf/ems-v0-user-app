/**
 * Skeleton — **v4.**
 *
 * Governed by rules.md §0.0. Sheet row: `components/ui/Skeleton.tsx`.
 *
 * The change is the motion, not the colour. v3 pulsed opacity between 0.5 and 1
 * on a warm sand block — a slab of the page breathing, which draws the eye to
 * the emptiness rather than away from it.
 *
 * v4 uses a **shimmer that travels**: a soft highlight sweeping left to right
 * across a `sunken` block. It reads as "arriving" instead of "throbbing", it is
 * what every modern loading state does, and it holds a steady average
 * brightness so a grid of skeletons does not flicker as a whole.
 *
 * Reduced motion is honoured — the sweep stops and the block sits still, which
 * is the correct fallback: a static placeholder still communicates shape.
 */
import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { alpha, useReducedMotion, useTheme } from '@/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    // 1200ms and linear: a sweep that eases looks like it is hesitating.
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress, reduced]);

  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: `${-100 + progress.value * 200}%` }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius ?? t.radius.sm,
          backgroundColor: t.colors.sunken,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {reduced ? null : (
        <Animated.View
          style={[
            {
              width: '60%',
              height: '100%',
              backgroundColor: alpha(t.palette.white, 0.85),
            },
            sweep,
          ]}
        />
      )}
    </View>
  );
}
