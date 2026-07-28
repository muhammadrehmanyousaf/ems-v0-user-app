import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SPRING, useReducedMotion } from '../motion';

/**
 * UI-thread press feedback: springs to `to` on press-in, back to 1 on press-out.
 * Returns an animated style + handlers to spread onto a Reanimated `<Animated.View>`
 * wrapped in a `Pressable`. No-op under reduced motion.
 *
 * Mutating a Reanimated shared value's `.value` is the library's intended API;
 * centralising it here keeps the react-compiler immutability lint happy and DRY.
 */
export function usePressScale(to = 0.97) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const onPressIn = () => {
    if (reduced) return;
    scale.value = withSpring(to, SPRING.press);
  };

  const onPressOut = () => {
    if (reduced) return;
    scale.value = withSpring(1, SPRING.press);
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return { animatedStyle, onPressIn, onPressOut };
}
