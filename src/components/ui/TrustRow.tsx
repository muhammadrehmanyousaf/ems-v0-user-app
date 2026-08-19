/**
 * TrustRow — **v4. The bordered stat strip, done properly.**
 *
 * Governed by rules.md §0.0. Sheet row: `components/ui/TrustRow.tsx`.
 *
 * This is the one component that copies the reference almost exactly, because
 * the reference is right: a rounded, hairlined box divided into cells, each with
 * a big number over a small label, sitting directly under the title. Airbnb runs
 * `4.99 ★★★★★ | Guest favorite | 239 Reviews`. It works because the numbers are
 * large and the box gives them a frame that says "these are the facts".
 *
 * v3's version was a thin under-weighted row of 13px text that research already
 * called "decoration, not a trust signal". The fix is not more colour, it is
 * more SIZE: the figure is now `h2` (22) against an 11px label, so the strip
 * reads at a glance from arm's length.
 *
 * ── Rules it enforces ─────────────────────────────────────────────────────
 *
 * • **Cells hide when their column is null**, and the dividers hide with them —
 *   no empty thirds, no stranded rules. On a platform where ~98% of listings are
 *   unclaimed imports, a strip that always draws three cells would mostly draw
 *   three blanks.
 * • **It renders nothing at all when nothing is earned.** An empty trust strip
 *   is worse than no trust strip: it frames the absence of credentials.
 * • **The reviews cell is tappable** (MB6) — a review count that cannot be
 *   opened is a dead end at the exact moment of highest intent.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { useT } from '@/i18n/useT';
import { haptics, useTheme } from '@/theme';

import { Text } from './Text';

export interface TrustCell {
  /** The big figure — a rating, a count, a tier name. */
  value: string;
  /** The small line under it. */
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export interface TrustRowProps {
  /** Explicit cells. Wins over the vendor-shaped props below. */
  cells?: TrustCell[];
  /**
   * The vendor-shaped API. Kept because vendor detail and the gallery both
   * describe a vendor rather than assembling cells, and pushing that assembly
   * to every call site is how three screens end up with three different trust
   * strips. Given these, the component builds the cells itself — and drops any
   * whose column is null, which is the common case on unclaimed listings.
   */
  rating?: number;
  reviewCount?: number;
  verificationTier?: number;
  reliabilityTier?: string;
  sponsored?: boolean;
  onPressReviews?: () => void;
  urdu?: boolean;
}

export function TrustRow({
  cells,
  rating,
  reviewCount,
  verificationTier,
  reliabilityTier,
  sponsored,
  onPressReviews,
  urdu,
}: TrustRowProps) {
  const t = useTheme();
  // Was three `urdu ? '…' : '…'` ternaries written inline — the same
  // carry-your-own-translations pattern `PriceHistogram` had, which keeps this
  // component's Urdu out of the file where the rest of it is reviewed.
  const { t: tr } = useT();

  // Computed ONCE. It was called twice with identical arguments — the guard and
  // then the value — which is how the two drift apart later.
  const badge = earnedBadge(
    { sponsored, verificationTier, reliability: reliabilityTier ? { tier: reliabilityTier } : null },
    tr,
  );

  const built: TrustCell[] =
    cells ??
    ([
      // Only a rating backed by an actual review earns a cell. A 0.00 beside
      // "0 reviews" is a score nobody gave.
      rating != null && (reviewCount ?? 0) > 0
        ? { value: rating.toFixed(2), label: tr('trust.rating'), icon: 'star' as const }
        : null,
      badge
        ? {
            value: badge,
            label: tr('trust.status'),
            icon: 'shield-checkmark' as const,
          }
        : null,
      (reviewCount ?? 0) > 0
        ? {
            value: String(reviewCount),
            label: tr('trust.reviews'),
            onPress: onPressReviews,
          }
        : null,
    ].filter(Boolean) as TrustCell[]);

  const shown = built.filter(Boolean);

  // Nothing earned → render nothing. Framing an absence is worse than silence.
  if (shown.length === 0) return null;

  return (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        borderWidth: 1,
        borderColor: t.colors.border,
        borderRadius: t.radius.lg,
        backgroundColor: t.colors.card,
        overflow: 'hidden',
      }}
    >
      {shown.map((c, i) => {
        const Wrapper = c.onPress ? Pressable : View;
        return (
          <Wrapper
            key={`${c.label}-${i}`}
            {...(c.onPress
              ? {
                  accessibilityRole: 'button' as const,
                  accessibilityLabel: `${c.value} ${c.label}`,
                  onPress: () => {
                    haptics.selection();
                    c.onPress?.();
                  },
                }
              : {})}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              paddingVertical: t.spacing.lg,
              paddingHorizontal: t.spacing.sm,
              // The divider belongs to the cell that follows it, so removing a
              // cell removes its rule with it — no stranded hairlines.
              borderLeftWidth: i > 0 ? 1 : 0,
              borderLeftColor: t.colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {c.icon ? <Ionicons name={c.icon} size={15} color={t.colors.textPrimary} /> : null}
              {/* The figure is the point. `h2` at 22 against an 11px label is
                  what makes this legible at arm's length. */}
              <Text variant="h2" numberOfLines={1} style={{ fontSize: 20 }}>
                {c.value}
              </Text>
            </View>
            <Text
              variant="caption"
              tone="muted"
              urdu={urdu}
              numberOfLines={1}
              style={{
                fontSize: 11,
                // Underlined only when it goes somewhere — the reference marks
                // its tappable "Reviews" cell exactly this way.
                textDecorationLine: c.onPress ? 'underline' : 'none',
              }}
            >
              {c.label}
            </Text>
          </Wrapper>
        );
      })}
    </View>
  );
}

/**
 * The single highest badge a vendor has EARNED, or null.
 *
 * One badge, never a rack of them: three badges beside each other cancel out,
 * and the platform's own research says placement beats presence. Order is by
 * how hard the signal is to fake.
 */
export function earnedBadge(
  v: {
    sponsored?: boolean;
    verificationTier?: number;
    reliability?: { tier?: string } | null;
  },
  /**
   * Optional so existing callers keep compiling in English. Pass it: this badge
   * sits on the Home spotlight and the vendor grid, where everything around it
   * is translated.
   */
  tr?: (k: 'trust.elite' | 'trust.verified') => string,
): string | null {
  if (v.sponsored) return tr ? tr('trust.elite') : 'Elite';
  if ((v.verificationTier ?? 0) > 0) return tr ? tr('trust.verified') : 'Verified';
  const tier = v.reliability?.tier;
  // The raw backend tier stays English on purpose — the vendor portal shows the
  // same vocabulary, and the two surfaces must not disagree about what a vendor
  // has been told their tier is. Same call as `compare.reliability`.
  if (tier && tier !== 'newcomer') return tier.charAt(0).toUpperCase() + tier.slice(1);
  return null;
}
