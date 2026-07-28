/** Card — cream surface, beige border, gold-on-press lift. Ports web `.bridal-card`. */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { haptics, usePressScale, useTheme } from '@/theme';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, onPress, style, padded = true, elevation = 'md' }: CardProps) {
  const t = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.99);

  const base: ViewStyle = {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.md,
    padding: padded ? t.spacing.lg : 0,
    overflow: 'hidden',
  };
  const shadow = t.elevation[elevation];

  if (!onPress) return <View style={[base, shadow, style]}>{children}</View>;

  return (
    <Animated.View style={[animatedStyle, shadow]}>
      <Pressable
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
    </Animated.View>
  );
}

export const cardStyles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });
