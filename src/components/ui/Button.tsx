/**
 * Button — **v4. The single colour event on a screen.**
 *
 * Governed by rules.md §0.0. Spec: docs/05-UI-SPEC.md §1.
 *
 * ── What changed and why ──────────────────────────────────────────────────
 *
 * v3's primary was a three-stop gold gradient with a champagne glow beneath it.
 * Two problems, and they are the same problem in different clothes:
 *
 * 1. **A gradient plus a glow reads as plastic, not as gold.** Real metal in
 *    print and in good product design is a FLAT field with a crisp edge; the
 *    sheen comes from the edge, not from a baked-in highlight. The reference's
 *    CTA is a flat fill with nothing on it at all.
 * 2. **A glow is a second colour event.** If the button radiates, the area
 *    around it is also coloured, and the rule is one event per screen.
 *
 * So: flat `gold`, ink label, and **a 1px `goldDeep` rim**. The rim is not
 * decoration — it is an accessibility requirement. Gold on paper is 2.36:1,
 * under the 3:1 WCAG asks for a control's boundary, and darkening the gold far
 * enough to pass turns it to mustard. The rim carries the edge at 5.6:1 and
 * happens to be the brand's signature line. The contrast gate checks it.
 *
 * Height goes 48 → **54** on `md`. The reference's CTA is a big, confident,
 * pill-shaped target; ours read as a web form button.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, type PressableProps, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { haptics, usePressScale, useTheme } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  fullWidth?: boolean;
  urdu?: boolean;
}

/** Generous, and pill on every size — a 10px radius reads as a web form. */
const SIZES: Record<Size, { height: number; padH: number; icon: number }> = {
  sm: { height: 40, padH: 18, icon: 16 },
  md: { height: 54, padH: 26, icon: 18 },
  lg: { height: 58, padH: 30, icon: 19 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  urdu,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const t = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.97);
  const s = SIZES[size];
  const off = disabled || loading;

  /**
   * Four variants, and only ONE of them is allowed to carry colour. `secondary`
   * is a hairline outline on paper — no fill, no tint — because a second filled
   * button beside the first destroys the hierarchy the fill exists to create.
   */
  const skin: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: t.colors.primary, fg: t.colors.onPrimary, border: t.colors.goldDark },
    secondary: { bg: 'transparent', fg: t.colors.textPrimary, border: t.colors.borderStrong },
    ghost: { bg: 'transparent', fg: t.colors.textPrimary, border: 'transparent' },
    danger: { bg: t.colors.danger, fg: t.colors.white, border: t.colors.danger },
  };
  const { bg, fg, border } = skin[variant];

  /**
   * The label keeps its width while loading, so the button cannot shrink
   * mid-press and move whatever sits beside it. The spinner is laid over a
   * transparent copy of the label rather than replacing it.
   */
  const content = loading ? (
    <View style={styles.loadingWrap}>
      <Text variant="button" tone="inherit" urdu={urdu} style={{ color: 'transparent' }}>
        {label}
      </Text>
      <ActivityIndicator color={fg} size="small" style={StyleSheet.absoluteFill} />
    </View>
  ) : (
    <>
      {icon ? <Ionicons name={icon} size={s.icon} color={fg} /> : null}
      <Text variant="button" tone="inherit" urdu={urdu} numberOfLines={1} style={{ color: fg }}>
        {label}
      </Text>
      {iconRight ? <Ionicons name={iconRight} size={s.icon} color={fg} /> : null}
    </>
  );

  return (
    <Animated.View style={[animatedStyle, fullWidth ? { alignSelf: 'stretch' } : undefined]}>
      <Pressable
        {...rest}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!off, busy: !!loading }}
        disabled={off}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={(e) => {
          if (off) return;
          haptics.medium();
          onPress?.(e);
        }}
        style={{
          height: s.height,
          paddingHorizontal: s.padH,
          borderRadius: t.radius.pill,
          backgroundColor: off && variant === 'primary' ? t.colors.disabledFill : bg,
          borderWidth: variant === 'ghost' ? 0 : 1,
          borderColor: off && variant === 'primary' ? t.colors.border : border,
          flexDirection: urdu ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.spacing.sm,
          opacity: off ? 0.65 : 1,
        }}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { alignItems: 'center', justifyContent: 'center' },
});
