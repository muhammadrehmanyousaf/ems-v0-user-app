/**
 * Home — the discovery entry point. Spec: docs/04-SCREEN-SPECS.md §S1.
 *
 * The reading order is deliberate and is the fix for "no focal point":
 *
 *   greeting + Fraunces hero      who you are, what this is for
 *   live figures                  the platform's real scale, from /platform-stats
 *   search                        the fast path out, for people who know
 *   arch medallions               the signature, and the browse path
 *   ONE feature card              the focal element, with the champagne glow
 *   rails                         breadth, each with a real "View all"
 *   cities                        the second-most-common way couples filter
 *   guides                        the slow path, for people who don't know yet
 *
 * Every rail has a destination. They used to end in nothing, so a customer who
 * liked what they saw had no way into the full list — the single most common
 * missing tap on the screen.
 *
 * ── Two things this pass added, both gate failures ─────────────────────────
 *
 * **Pull-to-refresh (gates 1 and 5).** Home is cached for ten minutes and had no
 * way to ask again. On a patchy connection the first load can half-succeed —
 * three rails arrive, one fails and hides itself — and the customer's only
 * recourse was to kill the app. Every rail hides when it fails, by design, which
 * makes a manual refresh the *only* route back: there is no error state to tap.
 * Pull now refetches the whole screen.
 *
 * **A width ceiling (gate 4).** The layout was a single column with no maximum,
 * so on a tablet or a 430px phone it stretched: 700px-wide vendor cards, a hero
 * line running the full width, and the gutter reading as a hairline. Content now
 * stops widening at `layout.maxContentWidth` and centres. The ScrollView still
 * fills the screen, so the background and the scroll indicator stay honest.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { Card, Row, Stack } from '@/components/ui';
import { CategoryArchRow } from '@/features/home/CategoryArchRow';
import { CityRail } from '@/features/home/CityRail';
import { FeatureSpotlight } from '@/features/home/FeatureSpotlight';
import { HomeHeader } from '@/features/home/HomeHeader';
import { HowItWorks } from '@/features/home/HowItWorks';
import { RecentlyViewedRail } from '@/features/vendors/components/RecentlyViewedRail';
import { VendorShowcase } from '@/features/vendors/components/VendorShowcase';
import { T } from '@/i18n/T';
import { layout, overlay, useTheme } from '@/theme';

export default function Home() {
  const t = useTheme();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const goExplore = (params?: Record<string, string>) =>
    router.push({ pathname: '/explore', params });

  /**
   * Refetch everything Home shows. `refetchQueries`, not `invalidateQueries`:
   * invalidate marks stale and waits for a render to trigger the fetch, so the
   * spinner would stop before the data arrived. This resolves when the requests
   * actually do, which is what the gesture promises.
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await qc.refetchQueries({
        predicate: (q) => q.queryKey[0] === 'vendors' || q.queryKey[0] === 'platform-stats',
      });
    } finally {
      setRefreshing(false);
    }
  }, [qc]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.screen }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: layout.tabBarSpace }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          // Warm, not the platform's grey — the spinner is on-brand furniture.
          colors={[t.colors.gold]}
          tintColor={t.colors.gold}
          progressBackgroundColor={t.colors.card}
        />
      }
    >
      {/* The width ceiling. `alignSelf: center` + maxWidth keeps one column on a
          phone and stops it stretching on a tablet, without a second layout. */}
      <View style={{ width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' }}>
        <HomeHeader
          onSearchPress={() => goExplore({ focus: 'search' })}
          onFilterPress={() => goExplore({ focus: 'filters' })}
        />

        {/* `huge` (48), not `xl` (24). rules.md §0.0 #3: if the screen is not
            visibly emptier than before, it is not done. Section separation was
            the same 24 as the gutter, so every band ran into the next. */}
        <Stack gap="huge" style={{ paddingTop: t.spacing.xxl }}>
          <RecentlyViewedRail />

          <CategoryArchRow
            onSelect={(slug) => goExplore({ category: slug })}
            onViewAll={() => goExplore({})}
          />

          <FeatureSpotlight />

          <VendorShowcase slug="wedding-photographers" titleKey="home.topPhotographers" />

          {/* Browse by city — the second-most-common filter after category, and
              now photography-shaped rather than a row of grey filter pills. */}
          <CityRail />

          <VendorShowcase slug="caterers" titleKey="home.caterers" />
          <VendorShowcase slug="bridal-makeup-artists" titleKey="home.bridalMakeup" />

          {/* The tinted wash band is gone. On a paper ground a coloured section
              background is exactly the soft furnishing v4 removes: a section is
              separated by SPACE, not by a swatch behind it. */}
          <HowItWorks />

          {/* Venues stay a RAIL, like every other category row.
              I briefly made this a 2-up grid to break the page's cadence. The
              founder's call, on seeing it live: the slider was better. He is the
              one who uses this screen every day, and a consistent swipe gesture
              down the whole page beats a theory about rhythm — a grid here also
              stopped the section scrolling the way the four above it do, which
              is its own inconsistency. Reverted. `VendorGridSection` stays in
              the tree, unused, for the day a section genuinely wants a grid. */}
          <VendorShowcase slug="wedding-venues" titleKey="home.featuredVenues" />
          <VendorShowcase slug="wedding-decorators" titleKey="home.decorators" />

          {/* Guides — the slow path, for couples who don't know what to search. */}
          <View style={{ paddingHorizontal: layout.gutter }}>
            <Card onPress={() => router.push('/guides')}>
              <Row justify="space-between">
                <Row gap="md" style={{ flex: 1 }}>
                  <View
                    style={{
                      width: layout.tapTarget,
                      height: layout.tapTarget,
                      borderRadius: layout.tapTarget / 2,
                      backgroundColor: overlay.goldWash,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="book-outline" size={22} color={t.colors.goldDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T k="home.weddingGuides" variant="title" />
                    <T k="home.guidesSub" variant="caption" tone="muted" />
                  </View>
                </Row>
                <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
              </Row>
            </Card>
          </View>

          <View style={{ paddingHorizontal: layout.gutter }}>
            <T k="home.liveNote" variant="caption" tone="muted" align="center" />
          </View>
        </Stack>
      </View>
    </ScrollView>
  );
}
