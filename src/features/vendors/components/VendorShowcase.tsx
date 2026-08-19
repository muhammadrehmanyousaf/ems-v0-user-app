/**
 * VendorShowcase — a rail of vendors for one category. Governed by rules.md §0.0.
 *
 * ── v4 ────────────────────────────────────────────────────────────────────
 *
 * Three changes, and the first is the one you feel:
 *
 * 1. **Snap scrolling.** The rail now comes to rest on a whole card. A free
 *    rail that stops with a card sliced down the middle is the single clearest
 *    tell of an app that was assembled rather than designed, and it was on every
 *    rail on Home.
 * 2. **Cards got wider — 260 → 268 — and the peek is deliberate.** At 360px the
 *    next card now shows about 60px, which is enough to read as "there is more"
 *    without looking like a mistake.
 * 3. **The skeleton matches the real card.** It was a 143px block over two grey
 *    bars while the real card is a square photo over three lines; the layout
 *    jumped when data arrived. A skeleton that is not shaped like its content is
 *    a loading state that lies.
 */
import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { Row, SectionHeader, Skeleton } from '@/components/ui';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { layout, useTheme } from '@/theme';

import { useVendorsByCategory } from '../vendors.queries';
import { VendorCard } from './VendorCard';

const CARD_WIDTH = 268;

export function VendorShowcase({ slug, titleKey }: { slug: string; titleKey: StringKey }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const q = useVendorsByCategory(slug, 10);
  const vendors = q.data?.vendors ?? [];

  // Honesty rule: hide the whole rail if there's nothing real to show.
  if (!q.isLoading && vendors.length === 0) return null;

  return (
    <View style={{ gap: t.spacing.md }}>
      {/* One section-header treatment across every rail on Home. This used to be
          a Playfair h3 with its own "See all", which sat beside the arch row's
          tracked overline and read as two different design systems on one screen. */}
      <View style={{ paddingHorizontal: layout.gutter }}>
        <SectionHeader
          title={tr(titleKey)}
          viewAllLabel={tr('common.seeAll')}
          onViewAll={() => router.push({ pathname: '/explore', params: { category: slug } })}
          urdu={isUrdu}
        />
      </View>

      {q.isLoading ? (
        <Row gap="md" style={{ paddingHorizontal: layout.gutter }}>
          {[0, 1].map((i) => (
            // Shaped like the real card: a square photo, then three lines.
            <View key={i} style={{ width: CARD_WIDTH, gap: t.spacing.sm }}>
              <Skeleton height={CARD_WIDTH} radius={t.radius.lg} />
              <Skeleton height={18} width="75%" />
              <Skeleton height={14} width="55%" />
              <Skeleton height={14} width="40%" />
            </View>
          ))}
        </Row>
      ) : (
        <FlatList
          data={vendors}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(v) => String(v.id)}
          contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: t.spacing.md }}
          // Rest on a whole card, never on a sliced one.
          snapToInterval={CARD_WIDTH + t.spacing.md}
          decelerationRate="fast"
          snapToAlignment="start"
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <VendorCard vendor={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
