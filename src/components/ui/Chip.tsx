/** Chip + ChipSelect — sand chip; selected → gold. */
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { haptics, useTheme } from '@/theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  count?: number;
}

export function Chip({ label, selected, onPress, count }: ChipProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress?.();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? t.colors.primary : t.colors.sand,
          borderColor: selected ? t.colors.primary : t.colors.border,
          borderRadius: t.radius.pill,
        },
      ]}
    >
      <Text variant="label" tone="inherit" style={{ color: selected ? t.colors.onPrimary : t.colors.textSoft }}>
        {label}
        {count != null ? `  ${count}` : ''}
      </Text>
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
  scroll?: boolean;
}

export function ChipSelect({ options, value, onChange, allLabel, scroll = true }: ChipSelectProps) {
  const t = useTheme();
  const content = (
    <View style={[styles.row, { gap: t.spacing.sm }]}>
      {allLabel ? <Chip label={allLabel} selected={value === null} onPress={() => onChange(null)} /> : null}
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          count={o.count}
          selected={value === o.value}
          onPress={() => onChange(o.value)}
        />
      ))}
    </View>
  );
  if (!scroll) return content;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: t.spacing.lg }}>
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
