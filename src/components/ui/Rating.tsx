/** Rating — circular gold arc + number, mirroring the web VendorCard rating. */
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme';
import { Text } from './Text';

export interface RatingProps {
  value: number; // 0..5
  reviewCount?: number;
  size?: number;
}

export function Rating({ value, reviewCount, size = 44 }: RatingProps) {
  const t = useTheme();
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / 5));
  const offset = c * (1 - pct);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.colors.border} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={t.colors.primary}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <Text variant="label" tone="gold" style={{ fontSize: size * 0.3 }}>
          {value.toFixed(1)}
        </Text>
      </View>
      {reviewCount != null ? (
        <Text variant="caption" tone="muted">
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </Text>
      ) : null}
    </View>
  );
}
