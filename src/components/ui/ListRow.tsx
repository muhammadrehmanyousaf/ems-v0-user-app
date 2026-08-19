/**
 * ListRow — one line in a hairline-separated list.
 *
 * Governed by rules.md §0.0, and it exists because of one line in the
 * reference table:
 *
 *   > **Hairline dividers** carry the structure  ·  ~~Bordered, shadowed cards everywhere~~
 *   > **Icon + two-line rows** separated by hairlines  ·  ~~Dense mixed rows~~
 *
 * The Account tab was five elevated `Card`s holding eighteen rows, each with a
 * gold-washed 34px medallion behind its icon. Eighteen gold circles on one
 * screen is eighteen colour events where the system allows one, and five
 * shadowed boxes is the exact pattern the reference replaces with rules and
 * space. Icons stay — the reference keeps them — but as plain glyphs.
 *
 * ── The `to` prop is the point of this component ──────────────────────────
 *
 * A chevron is a promise that something happens. The old rows put one on
 * "Currency · PKR (Rs)" and "Version · 1.0.0", both wired to `onPress={() => {}}`
 * — two rows that invited a tap and did nothing. That is a small lie, and it is
 * the kind a customer notices before they notice anything you got right.
 *
 * So the affordance is declared, not assumed:
 *
 *   `to="screen"`   chevron — goes somewhere in the app
 *   `to="external"` outward arrow — leaves for the browser, which is a
 *                   different promise and deserves a different glyph
 *   `to="none"`     no glyph, no press handler. A label and a fact.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { colors, haptics, layout, spacing } from '@/theme';

import { Text } from './Text';

export type RowDestination = 'screen' | 'external' | 'none';

export interface ListRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  /** The quiet right-hand fact — a setting's current value, a count. */
  value?: string;
  to?: RowDestination;
  onPress?: () => void;
  /** Suppresses the hairline. The last row in a group draws no rule, because
   *  the space below it already separates the group. */
  last?: boolean;
  urdu?: boolean;
  /** Sign-out and the like — the label goes red, the glyph goes away. */
  destructive?: boolean;
}

export function ListRow({
  icon,
  label,
  value,
  to = 'screen',
  onPress,
  last,
  urdu,
  destructive,
}: ListRowProps) {
  const inert = to === 'none' || !onPress;

  const body = (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: spacing.lg,
        // 54px: comfortably over the 44px tap target with the type centred.
        minHeight: 54,
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : layout.hairline,
        borderBottomColor: colors.border,
      }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.danger : colors.textMuted}
          style={{ width: 22, textAlign: 'center' }}
        />
      ) : null}

      <Text
        variant="body"
        urdu={urdu}
        style={{
          flex: 1,
          color: destructive ? colors.danger : colors.textPrimary,
          textAlign: urdu ? 'right' : 'left',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>

      {value ? (
        <Text variant="caption" tone="muted" urdu={urdu} numberOfLines={1}>
          {value}
        </Text>
      ) : null}

      {inert || destructive ? null : (
        <Ionicons
          name={
            to === 'external'
              ? 'open-outline'
              : urdu
                ? 'chevron-back'
                : 'chevron-forward'
          }
          size={to === 'external' ? 16 : 18}
          color={colors.textFaint}
        />
      )}
    </View>
  );

  if (inert) return body;

  return (
    <Pressable
      accessibilityRole={to === 'external' ? 'link' : 'button'}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      style={({ pressed }) => (pressed ? { opacity: 0.55 } : null)}
    >
      {body}
    </Pressable>
  );
}

/**
 * A titled run of rows. The title is a quiet overline, not the gold `label`
 * tone — a settings screen has a dozen of these and gold on every one turns
 * the accent into wallpaper.
 */
export function ListGroup({
  title,
  urdu,
  children,
}: {
  title: string;
  urdu?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text
        variant="overline"
        urdu={urdu}
        style={{
          color: colors.textMuted,
          textAlign: urdu ? 'right' : 'left',
          marginBottom: spacing.xs,
          // Latin only. Nastaliq has no case, and `textTransform` on it is
          // either a no-op or, on some Android builds, a glyph-shaping bug.
          ...(urdu ? null : { textTransform: 'uppercase' as const }),
        }}
      >
        {title}
      </Text>
      <View>{children}</View>
    </View>
  );
}
