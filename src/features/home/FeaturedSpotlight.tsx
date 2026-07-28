/**
 * FeaturedSpotlight — one magazine-cover vendor card (the single photo-over-scrim
 * moment in the app). Live pick: a sponsored venue, else the top-rated. Full-bleed
 * imagery + charcoal photo-scrim + ivory overlay text + press-lift. This is the
 * editorial "spotlight" the research prescribes instead of a rail of equal thumbnails.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Row, Text } from '@/components/ui';
import { T } from '@/i18n/T';
import { gradients, haptics, useTheme, usePressScale } from '@/theme';

import { vendorLocation, vendorPriceLabel, vendorPrimaryImage } from '../vendors/vendor-display';
import { useVendorsByCategory } from '../vendors/vendors.queries';
import type { Vendor } from '../vendors/vendors.types';

export function FeaturedSpotlight() {
  const t = useTheme();
  const { width: W } = useWindowDimensions();
  const cardH = Math.round(Math.max(0, W - 48) * 0.62);
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);
  const q = useVendorsByCategory('wedding-venues', 8);

  const pick = useMemo<Vendor | null>(() => {
    const vendors = q.data?.vendors ?? [];
    if (vendors.length === 0) return null;
    const sponsored = vendors.find((v) => v.sponsored && vendorPrimaryImage(v));
    if (sponsored) return sponsored;
    const withImg = vendors.filter((v) => vendorPrimaryImage(v));
    const pool = withImg.length ? withImg : vendors;
    return [...pool].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0] ?? null;
  }, [q.data]);

  if (!pick) return null;

  const image = vendorPrimaryImage(pick);
  const price = vendorPriceLabel(pick);
  const location = vendorLocation(pick);
  const hasReviews = pick.reviewCount > 0;

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          haptics.light();
          router.push(`/vendor/${pick.id}`);
        }}
      >
        <Animated.View style={[styles.card, { height: cardH, borderRadius: t.radius.xl, ...t.elevation.md }, animatedStyle]}>
          {image ? (
            <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={280} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.sand }]} />
          )}
          <LinearGradient colors={gradients.photoScrim} style={StyleSheet.absoluteFill} />

          {/* Eyebrow */}
          <View style={styles.eyebrow}>
            <Ionicons name="sparkles" size={13} color={t.colors.goldLight} />
            <T k="home.featuredThisWeek" variant="overline" tone="onDark" style={{ letterSpacing: 1.6 }} />
          </View>

          {/* Overlay content */}
          <View style={styles.body}>
            <Text variant="h2" tone="onDark" numberOfLines={2}>
              {pick.name}
            </Text>
            <Row justify="space-between" style={{ marginTop: 4 }}>
              <Row gap="xxs" style={{ flex: 1 }}>
                {location ? (
                  <>
                    <Ionicons name="location-outline" size={13} color={t.colors.onDark} />
                    <Text variant="caption" tone="onDark" numberOfLines={1} style={{ opacity: 0.9 }}>
                      {location}
                    </Text>
                  </>
                ) : null}
              </Row>
              {hasReviews ? (
                <Row gap="xxs">
                  <Ionicons name="star" size={13} color={t.colors.goldLight} />
                  <Text variant="caption" tone="onDark" weight="medium">
                    {pick.rating.toFixed(1)}
                  </Text>
                </Row>
              ) : null}
            </Row>
            <Row justify="space-between" align="center" style={{ marginTop: 10 }}>
              <Text variant="bodyMedium" tone="onDark">
                {price.text}
              </Text>
              <View style={[styles.cta, { backgroundColor: t.colors.primary }]}>
                <Text variant="label" tone="onGold">
                  View
                </Text>
                <Ionicons name="arrow-forward" size={15} color={t.colors.onPrimary} />
              </View>
            </Row>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', overflow: 'hidden', justifyContent: 'flex-end' },
  eyebrow: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  body: { padding: 18 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 999 },
});
