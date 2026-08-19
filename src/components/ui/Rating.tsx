/**
 * Rating — **v4.**
 *
 * Governed by rules.md §0.0. Sheet row: `components/ui/Rating.tsx`.
 *
 * v3 drew five gold stars plus a number plus a review count. Five gold glyphs
 * per vendor, repeated down a list, is the accent colour used as texture — and
 * four of the five stars carry no information the number does not already give.
 *
 * v4 follows the reference: **one filled star, the score in tabular figures,
 * and the count.** Ink, not gold. It is smaller, it is scannable in a column,
 * and it stops competing with the CTA.
 *
 * A vendor with no reviews renders "New" rather than a zero or an empty rail of
 * stars — ~98% of listings are unclaimed imports, so this is the common case,
 * and five hollow stars reads as a bad score rather than as no score.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export interface RatingProps {
  value: number; // 0..5
  reviewCount?: number;
  size?: number;
  urdu?: boolean;
}

export function Rating({ value, reviewCount, size = 14, urdu }: RatingProps) {
  const t = useTheme();
  /**
   * `undefined` means "no count to show", NOT "no reviews".
   *
   * The gate was `(reviewCount ?? 0) > 0`, which collapsed those two cases: a
   * caller rendering ONE review's own score — where a "(1)" beside it would be
   * noise — got the "New" empty state instead of the score it passed in. Only
   * an explicit `0` means unrated.
   */
  const unrated = reviewCount === 0;

  if (unrated) {
    return (
      <Text variant="caption" tone="muted" urdu={urdu}>
        New
      </Text>
    );
  }

  return (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Ionicons name="star" size={size} color={t.colors.textPrimary} />
      <Text variant="mono" style={{ fontSize: size }}>
        {value.toFixed(2)}
      </Text>
      {reviewCount != null && reviewCount > 0 ? (
        <Text variant="caption" tone="muted" style={{ fontSize: size - 1 }}>
          {`(${reviewCount.toLocaleString('en-PK')})`}
        </Text>
      ) : null}
    </View>
  );
}
