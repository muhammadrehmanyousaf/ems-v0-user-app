/**
 * Badge — spec: docs/05-UI-SPEC.md §6.
 *
 * Height 22, radius pill, icon 11, `overline` at 9. Tones now include the two
 * trust tiers the research made load-bearing (`verified`, `elite`) — a
 * marketplace's verified mark is a conversion instrument, not a decoration, and
 * it needs a fixed appearance everywhere it lands.
 *
 * `iconOnly` exists because at 2-up on 360px the card body is ~140px: spelling
 * out "VERIFIED" beside a category pushed "VENUES" to "VENU…". A gold check is
 * already the platform's established symbol, so the word is the part that goes.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { goldScale, useTheme } from '@/theme';

import { Text } from './Text';

export type BadgeTone =
  | 'gold'
  | 'verified'
  | 'elite'
  | 'shaadi'
  | 'rose' // alias of shaadi, kept so v1 call sites stay correct
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'dark';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Drop the label, keep the icon — for cards under ~170px wide. */
  iconOnly?: boolean;
  urdu?: boolean;
}

/** Tones that carry their own icon, so callers don't have to remember it. */
const IMPLIED_ICON: Partial<Record<BadgeTone, keyof typeof Ionicons.glyphMap>> = {
  verified: 'checkmark-circle',
  elite: 'star',
};

export function Badge({ label, tone = 'gold', icon, iconOnly, urdu }: BadgeProps) {
  const t = useTheme();

  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    gold: { bg: goldScale.subtle, fg: t.colors.goldDark },
    verified: { bg: goldScale.subtle, fg: t.colors.goldDark },
    elite: { bg: t.colors.gold, fg: t.colors.onPrimary },
    shaadi: { bg: t.colors.blush, fg: t.colors.shaadi },
    rose: { bg: t.colors.blush, fg: t.colors.shaadi },
    success: { bg: t.colors.successBg, fg: t.colors.success },
    warning: { bg: t.colors.warningBg, fg: t.colors.warning },
    danger: { bg: t.colors.dangerBg, fg: t.colors.danger },
    info: { bg: t.colors.infoBg, fg: t.colors.info },
    neutral: { bg: t.colors.sunken, fg: t.colors.textSoft },
    dark: { bg: t.colors.surfaceInverse, fg: t.colors.onDark },
  };

  const c = map[tone];
  const glyph = icon ?? IMPLIED_ICON[tone];

  return (
    <View
      accessibilityLabel={iconOnly ? label : undefined}
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          borderRadius: t.radius.pill,
          paddingHorizontal: iconOnly ? 5 : 8,
        },
      ]}
    >
      {glyph ? <Ionicons name={glyph} size={11} color={c.fg} /> : null}
      {!iconOnly ? (
        <Text
          variant="overline"
          tone="inherit"
          urdu={urdu}
          numberOfLines={1}
          style={{ color: c.fg, fontSize: 9, letterSpacing: 1.1 }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
});
