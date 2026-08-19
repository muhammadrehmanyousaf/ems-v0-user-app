/**
 * Card — **v4. Mostly, the answer is not a card.**
 *
 * Governed by rules.md §0.0.
 *
 * v3 offered `flat | rise | focus`, and every one of them drew a background, a
 * 1px border AND a shadow. With 277 containers on screen against 282 text
 * nodes, the app was roughly one box per line of type — the single biggest
 * reason it read as dated. The reference uses almost no cards at all: structure
 * comes from hairlines and space.
 *
 * v4 keeps the API and changes what the variants MEAN:
 *
 *   `flat`  → **no background, no border, no shadow.** Grouping by space alone.
 *             This is what most call sites actually want.
 *   `rise`  → a white surface on paper with the barely-there card shadow and no
 *             border. White on near-white separates by edge, so a border on top
 *             of a fill is saying the same thing twice.
 *   `focus` → the ONE focal element on a screen: white, gold hairline, overlay
 *             shadow, generous radius.
 *
 * `raised`/`feature` remain as aliases so no call site breaks.
 */
import type { ReactNode } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { goldScale, haptics, usePressScale, useTheme } from '@/theme';

export type CardVariant = 'flat' | 'rise' | 'focus' | 'raised' | 'feature';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
  variant?: CardVariant;
  /** Escape hatch when a screen needs a specific step on the elevation scale. */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  onPress,
  style,
  padded = true,
  variant = 'rise',
  elevation,
}: CardProps) {
  const t = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.99);

  const isFocus = variant === 'focus' || variant === 'feature';
  const isFlat = variant === 'flat';

  const shadowKey = elevation ?? (isFlat ? 'none' : isFocus ? 'lg' : 'sm');
  const shadow = t.elevation[shadowKey];

  const base: ViewStyle = {
    // `flat` draws nothing at all — it is a grouping, not an object.
    backgroundColor: isFlat ? 'transparent' : t.colors.card,
    borderWidth: isFocus ? 1 : 0,
    borderColor: isFocus ? goldScale.hairline : 'transparent',
    borderRadius: isFocus ? t.radius.xxl : t.radius.lg,
    padding: padded ? t.spacing.xl : 0,
    overflow: 'hidden',
  };

  const inner = onPress ? (
    /**
     * `accessibilityRole="button"` — a pressable Card had no role at all, so
     * TalkBack announced the Guides card on Home as plain text with no hint that
     * it did anything. A component that is only *sometimes* a button is easy to
     * forget is *ever* one.
     */
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptics.light();
        onPress();
      }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[base, style]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={[base, style]}>{children}</View>
  );

  return onPress ? (
    <Animated.View style={[animatedStyle, shadow]}>{inner}</Animated.View>
  ) : (
    <View style={shadow}>{inner}</View>
  );
}
