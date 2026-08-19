/**
 * Favourites — the shortlist. Redrawn on v4.
 *
 * ── What was wrong ────────────────────────────────────────────────────────
 *
 * · **A hand-rolled header.** A back chevron and a title in a `Row`, where every
 *   other screen in the app uses `ScreenHeader`. It set `variant="display"` and
 *   then overrode `fontSize: 27` inline to fake `h1` — which is the exact move
 *   the type scale exists to make unnecessary, and the reason a scale drifts:
 *   the next screen overrides to 26 and nobody notices.
 *
 * · **The gutter was invented locally.** `paddingHorizontal: 10` on the list
 *   plus `6` on each cell, against `layout.gutter` = 24 everywhere else. That
 *   constant exists because the gutter was once declared in six separate files
 *   and drifted to 20 in one of them; this screen was the seventh.
 *
 * · **The count was a list header row.** "12 Saved vendors" as a caption above
 *   the grid, where `ScreenHeader` already has a subtitle slot doing that job on
 *   Bookings. One fact, one place.
 *
 * · Back never mirrored, and `spacing['3xl']` is a deprecated v3 alias.
 *
 * The masonry grid itself is unchanged — `VendorCard` was redrawn already, and
 * a two-up photo grid is the correct shape for a shortlist a couple scans.
 */
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, ScreenHeader, Skeleton } from '@/components/ui';
import { useFavoriteVendors } from '@/features/favorites/useFavoriteVendors';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import type { Vendor } from '@/features/vendors/vendors.types';
import { useT } from '@/i18n/useT';
import { layout, useTheme } from '@/theme';

/**
 * Half the gutter, so two cells plus the space between them add up to one
 * gutter on each outer edge. Derived rather than typed, so it cannot drift from
 * the gutter the rest of the app uses.
 */
const CELL_GAP = layout.gutter / 2;

export default function Favorites() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const { vendors, isLoading, count, refetch } = useFavoriteVendors();

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('fav.title')}
        subtitle={count > 0 ? `${count} ${tr('fav.countSuffix')}` : undefined}
        onBack={() => router.back()}
        backLabel={tr('common.back')}
        urdu={isUrdu}
      />

      {count === 0 ? (
        <EmptyState
          icon="heart-outline"
          title={tr('fav.emptyTitle')}
          message={tr('fav.emptySub')}
          actionLabel={tr('common.exploreVendors')}
          onAction={() => router.push('/explore')}
          urdu={isUrdu}
        />
      ) : isLoading ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: CELL_GAP,
          }}
        >
          {[0, 1].map((i) => (
            <View
              key={i}
              style={{
                width: '50%',
                paddingHorizontal: CELL_GAP,
                paddingBottom: t.spacing.lg,
                gap: t.spacing.sm,
              }}
            >
              <Skeleton height={140} radius={t.radius.md} />
              <Skeleton height={14} width="70%" />
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          data={vendors}
          masonry
          numColumns={2}
          keyExtractor={(v: Vendor) => String(v.id)}
          contentContainerStyle={{
            paddingHorizontal: CELL_GAP,
            paddingBottom: t.spacing.vast,
          }}
          showsVerticalScrollIndicator={false}
          // The shortlist is the one list a couple returns to expecting it to
          // be current — a vendor may have raised prices or gone on vacation
          // since they saved it.
          refreshing={false}
          onRefresh={refetch}
          renderItem={({ item }: { item: Vendor }) => (
            <View style={{ paddingHorizontal: CELL_GAP, paddingBottom: t.spacing.lg }}>
              <VendorCard vendor={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
