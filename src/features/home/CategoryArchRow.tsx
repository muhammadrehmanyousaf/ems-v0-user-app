/**
 * CategoryArchRow — the app's signature: five Mehrab-arch medallions of real
 * vendor photography, horizontally scrollable, with a "View all" into Explore.
 *
 * Replaces the old equal-weight icon mosaic. Two reasons that grid failed:
 * outline icons on a tinted circle carry no information about what the category
 * looks like, and a 2×3 block of identical tiles reads as a placeholder. A row of
 * arch-framed photographs is both an invitation and the brand's one unmistakably
 * South Asian gesture.
 *
 * Width is computed, not flexed: `ArchImage` builds an SVG path from concrete
 * pixel dimensions, so a percentage width would render a zero-size arch. We take
 * the window width, subtract the gutters, and divide — which also keeps the
 * medallions honest at 360px, where four-and-a-bit fit and the fifth peeking is
 * the affordance that says "this scrolls".
 */
import { useMemo } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { ArchMedallion } from '@/components/signature';
import { SectionHeader } from '@/components/ui';
import { CATEGORIES, categoryLabel } from '@/features/vendors/categories';
import { useT } from '@/i18n/useT';
import { layout, useTheme } from '@/theme';

import { useCategoryCovers } from './useCategoryCovers';

/** The categories worth a medallion — the ones couples actually start from. */
const FEATURED_SLUGS = [
  'wedding-venues',
  'wedding-photographers',
  'caterers',
  'mehndi-artists',
  'wedding-decorators',
  'bridal-makeup-artists',
] as const;

const GAP = 14;
/**
 * **2.4 across, not 4.4.**
 *
 * At 4.4 the medallions were 64px wide — thumbnails. A photograph that small
 * carries no information about what a venue or a mehndi artist actually looks
 * like, which was the entire argument for replacing the old icon grid with
 * photography in the first place. The row was doing the icon grid's job again,
 * just with pictures too small to read.
 *
 * At 2.4 each medallion is ~124px: a real image, a legible 16px label, and the
 * third one peeking so the row still reads as scrollable.
 */
const VISIBLE = 2.4;

export function CategoryArchRow({
  onSelect,
  onViewAll,
}: {
  onSelect: (slug: string) => void;
  onViewAll: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const { width: screen } = useWindowDimensions();
  const covers = useCategoryCovers([...FEATURED_SLUGS]);

  const itemWidth = useMemo(() => {
    /**
     * Measure against the CONTAINER, not the window. Home caps its content at
     * `maxContentWidth` and centres it, so on an 834px tablet the window is 834
     * but the row only has 560 to work with. Sizing off the window produced
     * 168px medallions in a 560px row: three and a bit visible instead of four
     * and a bit, and each one blown up to the size of a card. The arch is a
     * medallion — it should look the same on every device, and only the number
     * you can see at once should change.
     */
    const available = Math.min(screen, layout.maxContentWidth);
    const usable = available - layout.gutter * 2 - GAP * Math.floor(VISIBLE);
    return Math.max(56, Math.floor(usable / VISIBLE));
  }, [screen]);

  const items = useMemo(
    () =>
      FEATURED_SLUGS.map((slug) => CATEGORIES.find((c) => c.slug === slug)).filter(
        (c): c is (typeof CATEGORIES)[number] => !!c,
      ),
    [],
  );

  return (
    <View style={{ gap: t.spacing.md }}>
      <View style={{ paddingHorizontal: layout.gutter }}>
        <SectionHeader
          title={tr('home.browseCategoryTitle')}
          onViewAll={onViewAll}
          urdu={isUrdu}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: GAP }}
        snapToInterval={itemWidth + GAP}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {items.map((c) => (
          <ArchMedallion
            key={c.slug}
            label={categoryLabel(c, isUrdu, 'short')}
            imageUrl={covers[c.slug]}
            width={itemWidth}
            onPress={() => onSelect(c.slug)}
            urdu={isUrdu}
          />
        ))}
      </ScrollView>
    </View>
  );
}
