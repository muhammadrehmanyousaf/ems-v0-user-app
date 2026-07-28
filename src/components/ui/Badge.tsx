/** Badge — verified/featured/status pill. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type BadgeTone = 'gold' | 'rose' | 'success' | 'danger' | 'info' | 'neutral' | 'dark';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Badge({ label, tone = 'gold', icon }: BadgeProps) {
  const t = useTheme();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    gold: { bg: 'rgba(201,149,106,0.16)', fg: t.colors.goldDark },
    rose: { bg: 'rgba(242,181,192,0.28)', fg: '#A34E60' },
    success: { bg: t.colors.successBg, fg: t.colors.success },
    danger: { bg: t.colors.dangerBg, fg: t.colors.danger },
    info: { bg: t.colors.infoBg, fg: t.colors.info },
    neutral: { bg: t.colors.sand, fg: t.colors.textSoft },
    dark: { bg: t.colors.charcoalSurface, fg: t.colors.onDark },
  };
  const c = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderRadius: t.radius.pill }]}>
      {icon ? <Ionicons name={icon} size={12} color={c.fg} style={{ marginRight: 4 }} /> : null}
      <Text variant="overline" tone="inherit" style={{ color: c.fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
});
