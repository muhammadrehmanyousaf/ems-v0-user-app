/**
 * HeroCarousel — the cinematic Home hero, brand-faithful (light bridal palette,
 * charcoal/gold ink on ivory; no dark surfaces). The signature Mehrab arch frames
 * real featured-venue imagery like a palace window, auto-crossfading; the champagne
 * LightSweep passes over the Playfair headline on load. Imagery is LIVE from the
 * backend (top wedding venues) — nothing dummy.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Carousel, type CarouselRenderItemInfo } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArchImage, LightSweep } from '@/components/signature';
import { Badge, Row, Text } from '@/components/ui';
import { vendorPrimaryImage } from '@/features/vendors/vendor-display';
import { usePlatformStats, useVendorsByCategory } from '@/features/vendors/vendors.queries';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';
import { BridalWash, JaalPattern } from '@/theme/textures';

const { width: W } = Dimensions.get('window');
const ARCH_W = Math.min(W - 44, 360);
const ARCH_H = Math.round(ARCH_W * 0.92);

export function HeroCarousel() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
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
    <BridalWash style={{ paddingTop: insets.top + 8, paddingBottom: 28, paddingHorizontal: 22 }}>
      <JaalPattern />

      <Row justify="center" style={{ marginBottom: 14 }}>
        <Badge label={tr('home.badge')} urdu={isUrdu} tone="rose" icon="heart" />
      </Row>

      {/* The arched "palace window" — live featured-venue imagery */}
      <View style={{ alignItems: 'center' }}>
        {images.length >= 2 ? (
          <Carousel
            data={images}
            loop
            autoplay
            autoplayInterval={4200}
            style={{ width: W, height: ARCH_H + 8 }}
            renderItem={({ item }: CarouselRenderItemInfo<string>) => (
              <View style={{ width: W, alignItems: 'center' }}>
                <ArchImage uri={item} width={ARCH_W} height={ARCH_H} />
              </View>
            )}
          />
        ) : (
          <ArchImage uri={images[0] ?? null} width={ARCH_W} height={ARCH_H} />
        )}
      </View>

      {/* Headline + light-sweep */}
      <View style={{ alignItems: 'center', marginTop: 18 }}>
        <Text variant="overline" tone="label" align="center" style={{ letterSpacing: 2 }}>
          LIGHT · LUXURIOUS · UNFORGETTABLE
        </Text>
        <LightSweep style={{ marginTop: 8, alignSelf: 'stretch' }}>
          <Text variant="hero" align="center">
            Where every love story
          </Text>
          <Text variant="hero" italic align="center" tone="gold">
            finds its setting
          </Text>
        </LightSweep>

        {/* Search entry */}
        <Pressable
          onPress={() => router.push('/explore')}
          style={{
            marginTop: 20,
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: t.colors.surface,
            borderColor: t.colors.border,
            borderWidth: 1,
            borderRadius: t.radius.pill,
            paddingHorizontal: 18,
            height: 54,
            ...t.elevation.sm,
          }}
        >
          <Ionicons name="search-outline" size={20} color={t.colors.goldDark} />
          <Text variant="body" tone="muted" urdu={isUrdu} style={{ flex: 1 }}>
            {tr('home.searchPlaceholder')}
          </Text>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: t.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-forward" size={18} color={t.colors.onPrimary} />
          </View>
        </Pressable>

        {/* Live stats */}
        {stats.data ? (
          <Row gap="md" style={{ marginTop: 16 }}>
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
    </BridalWash>
  );
}
