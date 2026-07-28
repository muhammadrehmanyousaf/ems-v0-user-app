/**
 * HeroCarousel — a full-bleed cinematic Home hero: real featured-venue imagery
 * (auto-crossfading), a soft warm scrim, and a clean left-aligned magazine
 * overlay — badge, Playfair headline with the champagne LightSweep, a
 * frosted-glass search, and live stats. The modern premium hero pattern; the
 * rest of the app stays on the bright bridal palette. Imagery is LIVE.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Carousel, type CarouselRenderItemInfo } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LightSweep } from '@/components/signature';
import { Badge, Row, Text } from '@/components/ui';
import { vendorPrimaryImage } from '@/features/vendors/vendor-display';
import { usePlatformStats, useVendorsByCategory } from '@/features/vendors/vendors.queries';
import { useT } from '@/i18n/useT';
import { gradients, useTheme } from '@/theme';
import { BridalWash, JaalPattern } from '@/theme/textures';

export function HeroCarousel() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const HERO_H = Math.max(480, Math.round(H * 0.62));
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
    <View style={{ height: HERO_H, width: W, backgroundColor: t.colors.sand, overflow: 'hidden' }}>
      {/* Full-bleed imagery */}
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

      {/* Scrims: soft top for the status bar, warm bottom for legibility */}
      <LinearGradient colors={gradients.topScrim} style={[styles.scrim, { top: 0, height: 140 }]} pointerEvents="none" />
      <LinearGradient colors={gradients.photoScrim} style={[styles.scrim, { bottom: 0, height: Math.round(HERO_H * 0.72) }]} pointerEvents="none" />

      {/* Tap imagery → explore (below the overlay controls) */}
      <Pressable onPress={() => router.push('/explore')} style={StyleSheet.absoluteFill} />

      {/* Left-aligned magazine overlay, anchored bottom */}
      <View style={[styles.overlay, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
        <View style={{ alignSelf: 'flex-start', marginBottom: 14 }}>
          <Badge label={tr('home.badge')} urdu={isUrdu} tone="rose" icon="heart" />
        </View>

        <LightSweep style={{ alignSelf: 'stretch' }}>
          <Text variant="hero" tone="onDark" numberOfLines={1} style={styles.head}>
            Where every
          </Text>
          <Text variant="hero" tone="onDark" numberOfLines={1} style={styles.head}>
            love story finds
          </Text>
          <Text variant="hero" italic numberOfLines={1} style={[styles.head, { color: t.colors.goldLight }]}>
            its perfect setting
          </Text>
        </LightSweep>

        {/* Frosted-glass search */}
        <Pressable onPress={() => router.push('/explore')} style={[styles.search, { borderColor: 'rgba(253,248,242,0.5)' }]}>
          <BlurView intensity={36} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.searchInner}>
            <Ionicons name="search-outline" size={20} color={t.colors.goldDark} />
            <Text variant="body" tone="body" urdu={isUrdu} style={{ flex: 1 }} numberOfLines={1}>
              {tr('home.searchPlaceholder')}
            </Text>
            <View style={[styles.searchGo, { backgroundColor: t.colors.primary }]}>
              <Ionicons name="arrow-forward" size={18} color={t.colors.onPrimary} />
            </View>
          </View>
        </Pressable>

        {stats.data ? (
          <Row gap="md" style={{ marginTop: 14 }}>
            <Text variant="caption" tone="onDark" urdu={isUrdu}>
              <Text variant="caption" weight="bold" style={{ color: t.colors.goldLight }}>
                {stats.data.vendors.toLocaleString('en-PK')}+
              </Text>{' '}
              {tr('home.vendors')}
            </Text>
            <Text variant="caption" tone="onDark" style={{ opacity: 0.6 }}>
              ·
            </Text>
            <Text variant="caption" tone="onDark" urdu={isUrdu}>
              <Text variant="caption" weight="bold" style={{ color: t.colors.goldLight }}>
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
  scrim: { position: 'absolute', left: 0, right: 0 },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingBottom: 30 },
  head: { fontSize: 32, lineHeight: 38 },
  search: { marginTop: 20, height: 56, borderRadius: 999, borderWidth: 1, overflow: 'hidden' },
  searchInner: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 18, paddingRight: 8, backgroundColor: 'rgba(253,248,242,0.55)' },
  searchGo: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
