/**
 * VendorGridSection — the same vendors, as a 2-up grid instead of a rail.
 *
 * Governed by rules.md §0.0.
 *
 * ── Why this exists: rhythm ───────────────────────────────────────────────
 *
 * Home was five horizontal rails stacked on each other. Heading, scroller,
 * heading, scroller, five times. Every component in it could be perfect and the
 * page would still read as templated, because **the page had one idea repeated
 * five times** and nothing to break the cadence.
 *
 * That is the difference between a screen made of good components and a screen
 * that was designed. A rail says "here is a taste, swipe for more". A grid says
 * "here is the set, look properly". Using both, in the right places, is what
 * gives a page a shape:
 *
 *   medallions   →  browse (horizontal, small commitment)
 *   spotlight    →  one thing, at full attention
 *   rail         →  a taste of a category
 *   **grid**     →  the category that deserves real estate  ← this
 *   city tiles   →  a different axis entirely
 *   steps        →  quiet type, no images at all
 *
 * Venues get the grid because they are the anchor purchase of a Pakistani
 * wedding — the booking every other vendor is scheduled around — and because a
 * venue photograph rewards being twice the size.
 *
 * The grid is **not** a FlatList. It renders a fixed handful inside the page's
 * existing scroll: a nested vertical list inside a vertical ScrollView cannot
 * receive the gesture, which is the same trap that put six calendars on the
 * vendor detail screen.
 */
import { router } from 'expo-router';
import { View } from 'react-native';

import { SectionHeader, Skeleton } from '@/components/ui';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import { useVendorsByCategory } from '@/features/vendors/vendors.queries';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { layout, useTheme } from '@/theme';

/** Four: two full rows. Six leaves the page ending on a wall of cards. */
const COUNT = 4;

export function VendorGridSection({
  slug,
  titleKey,
  subtitleKey,
}: {
  slug: string;
  titleKey: StringKey;
  subtitleKey?: StringKey;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const q = useVendorsByCategory(slug, 10);
  const vendors = (q.data?.vendors ?? []).slice(0, COUNT);

  // Honesty rule: hide the whole section if there is nothing real to show.
  if (!q.isLoading && vendors.length === 0) return null;

  return (
    <View style={{ gap: t.spacing.lg }}>
      <View style={{ paddingHorizontal: layout.gutter }}>
        <SectionHeader
          title={tr(titleKey)}
          subtitle={subtitleKey ? tr(subtitleKey) : undefined}
          onViewAll={() => router.push({ pathname: '/explore', params: { category: slug } })}
          urdu={isUrdu}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: layout.gutter,
          /**
           * **No `columnGap` here.** The first version set `columnGap: 12` AND
           * gave each child `width: 50%` plus its own horizontal padding — so a
           * row needed 50% + 50% + 12px, which is wider than 100%, and every
           * card wrapped onto its own line. The grid rendered as a single
           * column and looked broken on Home.
           *
           * The column gutter is created by the children's padding (8 on the
           * inner edge of each), so the two halves stay exactly 50% and the
           * space between them is real. Only the ROW rhythm is a gap.
           */
          rowGap: t.spacing.xxl,
        }}
      >
        {(q.isLoading ? Array.from({ length: COUNT }) : vendors).map((v, i) => (
          <View
            key={q.isLoading ? `s${i}` : String((v as { id: number }).id)}
            // 50% minus half the column gap — the arithmetic that keeps two
            // cards flush to both gutters at any screen width.
            style={{ width: `50%`, paddingRight: i % 2 === 0 ? t.spacing.sm : 0, paddingLeft: i % 2 === 1 ? t.spacing.sm : 0 }}
          >
            {q.isLoading ? (
              <View style={{ gap: t.spacing.sm }}>
                <Skeleton height={150} radius={t.radius.lg} />
                <Skeleton height={18} width="80%" />
                <Skeleton height={14} width="60%" />
              </View>
            ) : (
              <VendorCard vendor={v as never} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
