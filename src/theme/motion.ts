/**
 * Motion tokens. Buttery, restrained — matches the web's calm bridal feel.
 */
import { Easing } from 'react-native-reanimated';

export const duration = {
  fast: 150,
  base: 250,
  slow: 360, // web fade-up
  slower: 500,
  hero: 820, // cinematic reveals & the champagne light-sweep (Headspace-slow, intentional)
} as const;

export const easing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
  gentle: Easing.inOut(Easing.ease),
} as const;

/** Per-item stagger for list reveals (ms). */
export const stagger = 60;

/** Spring configs for UI-thread interactions. */
export const SPRING = {
  press: { mass: 0.6, damping: 18, stiffness: 260 },
  gentle: { mass: 1, damping: 20, stiffness: 160 },
  soft: { mass: 1, damping: 26, stiffness: 180 }, // sheet snap / card settle (no overshoot)
  bouncy: { mass: 0.8, damping: 12, stiffness: 220 }, // heart / celebratory pop (peak moments only)
} as const;

export const motion = { duration, easing, stagger, SPRING } as const;
export type Motion = typeof motion;

export { useReducedMotion } from 'react-native-reanimated';
