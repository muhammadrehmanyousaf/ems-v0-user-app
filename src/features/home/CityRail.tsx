/**
 * CityRail — browse by city, as photography instead of pills.
 *
 * Governed by rules.md §0.0. Replaces the row of eleven `Chip`s on Home.
 *
 * ── Why chips were the wrong control here ─────────────────────────────────
 *
 * A chip is a FILTER: a small, uniform, text-only token you toggle inside a
 * result set. Home's city row was eleven of them in a scroller, which made the
 * second-most-common way a couple narrows the marketplace look like an
 * afterthought — a row of grey lozenges between two rows of photography.
 *
 * "Karachi" is not a filter value to a couple planning a wedding. It is a place.
 * So it gets a picture, the way every marketplace worth copying treats
 * destination browse.
 *
 * ── Where the pictures come from, and the honesty problem ─────────────────
 *
 * We do not hold city photography. Shipping a stock skyline per city would be
 * decorative fiction of exactly the kind rules.md §6 forbids — and the platform
 * already has a photography-truth problem (86% of listings lead with stock).
 *
 * So the tile shows a **vendor count in that city** on an ink field, with the
 * city name in the display face. It is typographic, it is true, and the number
 * is genuinely useful: "Lahore · 412 vendors" tells a couple more than a
 * photograph of Badshahi Mosque would. When real city photography exists, the
 * tile takes an `imageUrl` and the ink field becomes a scrim — the layout does
 * not change.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { SectionHeader, Text } from '@/components/ui';
import { FEATURED_CITIES } from '@/features/vendors/cities';
import { useT } from '@/i18n/useT';
import { img, IMG } from '@/lib/img';
import { gradients, haptics, layout, useTheme } from '@/theme';

const TILE_W = 150;
const TILE_H = 96;

export interface CityTile {
  name: string;
  /** Live count, when the caller has one. Omitted rather than guessed. */
  vendors?: number | null;
  imageUrl?: string | null;
}

export function CityRail({ cities }: { cities?: CityTile[] }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();

  const data: CityTile[] = cities ?? FEATURED_CITIES.map((c) => ({ name: c.name }));

  return (
    <View style={{ gap: t.spacing.lg }}>
      <View style={{ paddingHorizontal: layout.gutter }}>
        <SectionHeader
          title={tr('home.browseCityTitle')}
          onViewAll={() => router.push({ pathname: '/explore', params: { focus: 'filters' } })}
          urdu={isUrdu}
        />
      </View>

      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.name}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: t.spacing.md }}
        // Snap to the tile pitch so the row always comes to rest on a whole
        // tile — a rail that stops mid-card reads as broken momentum.
        snapToInterval={TILE_W + t.spacing.md}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={() => {
              haptics.selection();
              router.push({ pathname: '/explore', params: { city: item.name } });
            }}
            /**
             * Paper with a hairline, not an ink block.
             *
             * The first cut filled each tile with `surfaceInverse` and it was
             * wrong by our own system: `inkSurface` is documented as the deep
             * register, used ONCE per screen at most, and this rail put three
             * black rectangles in the middle of a paper page. Caught on screen.
             *
             * A tile only goes dark when it has a PHOTOGRAPH to darken — then
             * the ink is a scrim doing a job, not a fill doing decoration.
             */
            style={{
              width: TILE_W,
              height: TILE_H,
              borderRadius: t.radius.lg,
              overflow: 'hidden',
              backgroundColor: item.imageUrl ? t.colors.surfaceInverse : t.colors.card,
              borderWidth: item.imageUrl ? 0 : 1,
              borderColor: t.colors.border,
              justifyContent: 'flex-end',
              padding: t.spacing.lg,
            }}
          >
            {item.imageUrl ? (
              <>
                <Image
                  source={{ uri: img(item.imageUrl, IMG.card) ?? item.imageUrl }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
                <LinearGradient colors={gradients.photoScrim} style={StyleSheet.absoluteFill} />
              </>
            ) : null}

            <Text
              variant="h3"
              tone={item.imageUrl ? 'onDark' : 'primary'}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.vendors != null ? (
              <Text
                variant="caption"
                tone={item.imageUrl ? 'onDark' : 'muted'}
                style={item.imageUrl ? { opacity: 0.75 } : undefined}
              >
                {`${item.vendors.toLocaleString('en-PK')} ${tr('home.vendors')}`}
              </Text>
            ) : (
              // No count and no photograph — the affordance carries the tile
              // rather than inventing a statistic to fill it.
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                <Text variant="caption" tone="muted">
                  {tr('common.seeAll')}
                </Text>
                <Ionicons name="chevron-forward" size={12} color={t.colors.textMuted} />
              </View>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}
