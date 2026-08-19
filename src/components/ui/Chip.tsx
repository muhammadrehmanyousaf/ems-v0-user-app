/**
 * Chip + ChipSelect — **v4.**
 *
 * Governed by rules.md §0.0.
 *
 * v3 filled the selected chip with saturated gold and gave every resting chip a
 * white fill plus a border. A row of eleven cities was therefore eleven boxes,
 * one of which was a solid block of the app's accent colour — so the filter row
 * competed with the primary action for the eye.
 *
 * v4 inverts it. **Resting is bare paper with a hairline; selected is INK.**
 * Ink, not gold, because selection is a state and not a call to action — and
 * because it leaves the accent free for the one thing that earns it. The result
 * reads the way the reference's filter rows read: quiet until you choose.
 *
 * Height stays 36 drawn, 44 touched. The touch target is real layout (padding
 * plus negative margin), not `hitSlop`, because `hitSlop` is native-only and
 * would be unverifiable on the one surface we can measure.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { haptics, useTheme } from '@/theme';

import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  /** Renders an ✕ and reads as "remove this filter", not "this is chosen". */
  dismissible?: boolean;
  onPress?: () => void;
  count?: number;
  disabled?: boolean;
  urdu?: boolean;
}

export function Chip({ label, selected, dismissible, onPress, count, disabled, urdu }: ChipProps) {
  const t = useTheme();

  const bg = selected ? t.colors.textPrimary : t.colors.card;
  const border = selected ? t.colors.textPrimary : t.colors.border;
  const fg = selected ? t.colors.onDark : t.colors.textBody;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        if (!onPress) return;
        haptics.selection();
        onPress();
      }}
      /**
       * The TOUCH target is 44; the DRAWN pill stays 36. Padding with matching
       * negative margin is real layout — it measures 44 on every platform,
       * unlike `hitSlop`, which react-native-web ignores. Vertical only: chips
       * sit 8px apart and a horizontal expansion would overlap its neighbour, so
       * the wrong city would select.
       */
      style={{ paddingVertical: 4, marginVertical: -4, opacity: disabled ? 0.45 : 1 }}
    >
      <View
        style={[
          styles.chip,
          { backgroundColor: bg, borderColor: border, borderRadius: t.radius.pill },
        ]}
      >
        <Text variant="label" tone="inherit" urdu={urdu} numberOfLines={1} style={{ color: fg }}>
          {label}
        </Text>
        {count != null ? (
          <Text variant="mono" tone="inherit" style={{ color: fg, fontSize: 11, opacity: 0.7 }}>
            {count.toLocaleString('en-PK')}
          </Text>
        ) : null}
        {dismissible ? <Ionicons name="close" size={14} color={fg} /> : null}
      </View>
    </Pressable>
  );
}

export interface ChipOption {
  value: string;
  label: string;
  count?: number;
}

export interface ChipSelectProps {
  options: ChipOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allLabel?: string;
  allCount?: number;
  scroll?: boolean;
  urdu?: boolean;
}

export function ChipSelect({
  options,
  value,
  onChange,
  allLabel,
  allCount,
  scroll = true,
  urdu,
}: ChipSelectProps) {
  const t = useTheme();
  const content = (
    <View style={[styles.row, { gap: t.spacing.sm }]}>
      {allLabel ? (
        <Chip
          label={allLabel}
          count={allCount}
          selected={value === null}
          onPress={() => onChange(null)}
          urdu={urdu}
        />
      ) : null}
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          count={o.count}
          selected={value === o.value}
          onPress={() => onChange(o.value)}
          urdu={urdu}
        />
      ))}
    </View>
  );
  if (!scroll) return content;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: t.spacing.xl }}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
});
