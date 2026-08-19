/**
 * PriceHistogram — the price filter's distribution bar chart. MB14.
 *
 * Evidence: Airbnb's filter sheet draws the actual distribution of listing prices
 * behind its range slider, with min/max inputs below (docs/07-DESIGN-RESEARCH.md
 * §7b.4). A bare slider makes the customer guess where the inventory is; a
 * histogram shows them.
 *
 * ── Why this is nearly free for us ──────────────────────────────────────
 *
 * Explore's "full mode" already loads the entire category set client-side, so
 * the distribution costs no extra request. This is one of the few times a
 * best-in-class pattern is cheaper for us than for the app we copied it from.
 *
 * ── The honest part ─────────────────────────────────────────────────────
 *
 * ~98% of our listings carry NO price. A histogram drawn only over the priced
 * subset, with no other signal, would imply full coverage — so the unpriced count
 * is stated beneath it. That number is uncomfortable and it belongs on screen:
 * a customer filtering by price deserves to know how much of the catalogue the
 * filter is silently excluding.
 *
 * ── It carried its own translations, and it is not on any screen ──────────
 *
 * Both of its strings were `urdu ? '...' : '...'` ternaries written inline. It
 * was the only component in the app doing that, and it meant `urdu` here chose a
 * LANGUAGE while the same prop name chooses a FONT everywhere else. They are in
 * `strings.ts` now like everything else's.
 *
 * ── It is on a screen now, and it had to learn its own scope ─────────────
 *
 * Wired into `FilterSheet`'s budget group, fed by `deriveFacets`, which already
 * walks every vendor — so it still costs no request.
 *
 * But Explore has two modes. Until a filter or a search is active it is on
 * infinite scroll, so `vendors` is the 12 rows loaded so far, not the catalogue.
 * Drawn naively, this component announced "9 vendors have no price listed" over
 * a set of 3,274 — a false statement made by the one component whose entire
 * purpose is not making false statements about coverage.
 *
 * `sampled` fixes that. When the chart is drawn over a partial set it says so,
 * in the same breath as the number. Touching any filter flips Explore into full
 * mode, the whole set arrives, and the qualifier disappears on its own.
 */
import { useMemo } from 'react';
import { View } from 'react-native';

import { ltr } from '@/i18n/bidi';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

import { Text } from './Text';

const BUCKETS = 24;

export interface PriceHistogramProps {
  /** Every price in the current result set. Nulls/zeros filtered internally. */
  prices: (number | string | null | undefined)[];
  /** Current selected range. */
  min: number;
  max: number;
  /**
   * True when `prices` is only the slice loaded so far rather than the whole
   * result set. Drives the qualifier under the chart — see the header.
   */
  sampled?: boolean;
  urdu?: boolean;
}

export function PriceHistogram({ prices, min, max, sampled, urdu }: PriceHistogramProps) {
  const t = useTheme();
  const { t: tr } = useT();

  const { buckets, priced, unpriced, lo, hi } = useMemo(() => {
    const nums: number[] = [];
    let missing = 0;
    for (const p of prices) {
      const n = typeof p === 'string' ? Number(p) : p;
      if (n == null || !Number.isFinite(n) || n <= 0) missing += 1;
      else nums.push(n);
    }
    if (nums.length === 0) {
      return { buckets: [] as number[], priced: 0, unpriced: missing, lo: 0, hi: 0 };
    }
    nums.sort((a, b) => a - b);

    /**
     * Clip the top 2% before bucketing. One Rs 50,000,000 outlier otherwise
     * compresses every real price into the first bucket and the chart shows a
     * single spike — technically accurate, visually useless.
     */
    const loV = nums[0]!;
    const hiV = nums[Math.max(0, Math.floor(nums.length * 0.98) - 1)]!;
    const span = Math.max(1, hiV - loV);

    const counts = new Array<number>(BUCKETS).fill(0);
    for (const n of nums) {
      const idx = Math.min(BUCKETS - 1, Math.floor(((n - loV) / span) * BUCKETS));
      counts[idx] = (counts[idx] ?? 0) + 1;
    }
    return { buckets: counts, priced: nums.length, unpriced: missing, lo: loV, hi: hiV };
  }, [prices]);

  if (priced === 0) {
    return (
      <Text variant="caption" tone="muted" urdu={urdu}>
        {tr('filter.noPrices')}
      </Text>
    );
  }

  const peak = Math.max(...buckets, 1);
  const span = Math.max(1, hi - lo);

  return (
    <View style={{ gap: t.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 44, gap: 2 }}>
        {buckets.map((count, i) => {
          // A bucket is "in range" when its span overlaps the selection.
          const bucketLo = lo + (span * i) / BUCKETS;
          const bucketHi = lo + (span * (i + 1)) / BUCKETS;
          const inRange = bucketHi >= min && bucketLo <= max;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                // Floor at 2px so an empty bucket still reads as a gap in the
                // distribution rather than as missing chart.
                height: Math.max(2, (count / peak) * 44),
                borderRadius: 1.5,
                // Ink, not gold — the same call the slider directly below makes,
                // and for the same reason: the one gold event on this sheet is
                // Apply. Twenty-four gold bars is the accent used as a texture.
                backgroundColor: inRange ? t.colors.textPrimary : t.colors.border,
              }}
            />
          );
        })}
      </View>

      {unpriced > 0 ? (
        <Text variant="caption" tone="warning" urdu={urdu} style={{ fontSize: 11 }}>
          {/* `ltr` around each count: a Latin numeral in an RTL sentence is a
              bidi-neutral run that jumps to the wrong end of the line.

              When `sampled`, the sentence names the set it is actually talking
              about BEFORE the number, so the number is never read as a fact
              about the catalogue. */}
          {sampled
            ? `${tr('filter.sampledPrefix')} ${ltr((priced + unpriced).toLocaleString('en-PK'), urdu)} ${tr('filter.sampledSuffix')}, ${ltr(unpriced.toLocaleString('en-PK'), urdu)} ${tr('filter.unpricedSuffix')}`
            : `${ltr(unpriced.toLocaleString('en-PK'), urdu)} ${tr('filter.unpricedSuffix')}`}
        </Text>
      ) : null}
    </View>
  );
}
