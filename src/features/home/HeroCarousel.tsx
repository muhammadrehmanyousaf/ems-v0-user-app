/**
 * HeroCarousel — bright, editorial Home hero. Real featured-venue imagery fills
 * the top, then melts into ivory where an elegant Playfair headline (charcoal +
 * gold), a refined gold overline, an elevated search, and live stats sit on the
 * bright bridal field. Cinematic AND bright — never a dark surface. Imagery LIVE.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Carousel, type CarouselRenderItemInfo } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LightSweep } from '@/components/signature';
import { Row, Text } from '@/components/ui';
import { vendorPrimaryImage } from '@/features/vendors/vendor-display';
import { usePlatformStats, useVendorsByCategory } from '@/features/vendors/vendors.queries';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';
import { BridalWash, JaalPattern } from '@/theme/textures';

export function HeroCarousel() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const HERO_H = Math.max(470, Math.round(H * 0.58));
  const stats = usePlatformStats();
  const venues = useVendorsByCategory('wedding-venues', 8);

  const images = useMemo(
    () =>
      (venues.data?.vendors ?? [])
        .map(vendorPrimaryImage)
        .filter((u): u is string => typeof u === 'string' && u.length > 0)
        .slice(0, 6),
    [venues.data],
  );

  return (
    <View style={{ height: HERO_H, width: W, backgroundColor: t.colors.surface, overflow: 'hidden' }}>
      {/* Full-bleed imagery, top */}
      {images.length >= 2 ? (
        <Carousel
          data={images}
          loop
          autoplay
          autoplayInterval={5200}
          style={{ width: W, height: HERO_H }}
          renderItem={({ item }: CarouselRenderItemInfo<string>) => (
            <Image source={{ uri: item }} style={{ width: W, height: HERO_H }} contentFit="cover" transition={450} />
          )}
        />
      ) : images[0] ? (
        <Image source={{ uri: images[0] }} style={{ width: W, height: HERO_H }} contentFit="cover" transition={450} />
      ) : (
        <BridalWash style={StyleSheet.absoluteFill}>
          <JaalPattern />
        </BridalWash>
      )}

      {/* Melt the image into ivory so text sits on a bright field (never dark) */}
      <LinearGradient
        colors={['transparent', 'rgba(253,248,242,0.55)', '#FDF8F2', '#FDF8F2']}
        locations={[0, 0.44, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Tap the imagery → explore */}
      <Pressable onPress={() => router.push('/explore')} style={StyleSheet.absoluteFill} />

      {/* Bright editorial overlay, anchored bottom */}
      <View style={[styles.overlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Text variant="overline" tone="label" style={{ letterSpacing: 2, marginBottom: 8 }} urdu={isUrdu}>
          {tr('home.badge')}
        </Text>

        <LightSweep style={{ alignSelf: 'stretch' }}>
          <Text variant="hero" numberOfLines={1} style={styles.head}>
            Where every
          </Text>
          <Text variant="hero" numberOfLines={1} style={styles.head}>
            love story finds
          </Text>
          <Text variant="hero" italic tone="gold" numberOfLines={1} style={styles.head}>
            its perfect setting
          </Text>
        </LightSweep>

        {/* Elevated search */}
        <Pressable
          onPress={() => router.push('/explore')}
          style={[styles.search, { backgroundColor: t.colors.card, borderColor: t.colors.border, ...t.elevation.md }]}
        >
          <Ionicons name="search-outline" size={20} color={t.colors.goldDark} />
          <Text variant="body" tone="muted" urdu={isUrdu} style={{ flex: 1 }} numberOfLines={1}>
            {tr('home.searchPlaceholder')}
          </Text>
          <View style={[styles.searchGo, { backgroundColor: t.colors.primary }]}>
            <Ionicons name="arrow-forward" size={18} color={t.colors.onPrimary} />
          </View>
        </Pressable>

        {stats.data ? (
          <Row gap="md" style={{ marginTop: 14 }}>
            <Text variant="caption" tone="muted" urdu={isUrdu}>
              <Text variant="caption" tone="gold" weight="bold">
                {stats.data.vendors.toLocaleString('en-PK')}+
              </Text>{' '}
              {tr('home.vendors')}
            </Text>
            <Text variant="caption" tone="muted">·</Text>
            <Text variant="caption" tone="muted" urdu={isUrdu}>
              <Text variant="caption" tone="gold" weight="bold">
                {stats.data.cities}
              </Text>{' '}
              {tr('home.cities')}
            </Text>
          </Row>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingBottom: 26 },
  head: { fontSize: 33, lineHeight: 39 },
  search: {
    marginTop: 20,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 18,
    paddingRight: 9,
  },
  searchGo: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
