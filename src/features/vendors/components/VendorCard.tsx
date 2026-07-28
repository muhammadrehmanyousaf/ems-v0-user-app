/**
 * VendorCard — the core listing element, elevated to the redesign bar (light
 * bridal palette). Press-lift, a spring heart-pop at the save moment, a refined
 * type hierarchy with a gold hairline, top image-scrim, and correct expo-image
 * recyclingKey for buttery recycled lists. Appears on every rail/screen.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { Badge, Row, Text } from '@/components/ui';
import { COMPARE_MAX, useCompareStore } from '@/store/compare';
import { useFavoritesStore } from '@/store/favorites';
import { gradients, haptics, SPRING, useReducedMotion, usePressScale, useTheme } from '@/theme';

import { isVerified, vendorCategoryLabel, vendorLocation, vendorPriceLabel, vendorPrimaryImage } from '../vendor-display';
import type { Vendor } from '../vendors.types';

/** A one-shot "pop" spring for the favourite heart. Shared-value writes live in
 *  the hook (keeps the react-compiler immutability lint happy). */
function useHeartPop() {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const pop = () => {
    if (reduced) return;
    scale.value = withSequence(withSpring(1.28, SPRING.bouncy), withSpring(1, SPRING.bouncy));
  };
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { style, pop };
}

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const t = useTheme();
  const isFav = useFavoritesStore((s) => s.ids.has(vendor.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const inCompare = useCompareStore((s) => s.ids.includes(vendor.id));
  const compareFull = useCompareStore((s) => s.ids.length >= COMPARE_MAX);
  const toggleCompare = useCompareStore((s) => s.toggle);
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);
  const heart = useHeartPop();

  const image = vendorPrimaryImage(vendor);
  const price = vendorPriceLabel(vendor);
  const location = vendorLocation(vendor);
  const category = vendorCategoryLabel(vendor);
  const verified = isVerified(vendor);
  const hasReviews = vendor.reviewCount > 0;

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={() => router.push(`/vendor/${vendor.id}`)}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: t.colors.card, borderColor: t.colors.border, borderRadius: t.radius.lg, ...t.elevation.sm },
          animatedStyle,
        ]}
      >
        {/* Image */}
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} contentFit="cover" transition={240} recyclingKey={String(vendor.id)} />
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <LinearGradient colors={gradients.roseWash} style={StyleSheet.absoluteFill} />
              <Text variant="hero" italic style={{ fontSize: 46, color: t.colors.gold, opacity: 0.5 }}>
                {(vendor.name?.trim()?.[0] ?? '♥').toUpperCase()}
              </Text>
            </View>
          )}
          <LinearGradient colors={gradients.topScrim} style={styles.topScrim} />

          {vendor.sponsored ? (
            <View style={styles.ribbon}>
              <Badge label="Featured" tone="gold" icon="star" />
            </View>
          ) : vendor.vacationMode ? (
            <View style={styles.ribbon}>
              <Badge label="Away" tone="dark" icon="airplane-outline" />
            </View>
          ) : null}

          {/* Favourite heart (spring pop on save) */}
          <Pressable
            hitSlop={10}
            onPress={() => {
              haptics.light();
              heart.pop();
              toggleFav(vendor.id);
            }}
            style={[styles.iconBtn, { right: 8, backgroundColor: 'rgba(253,248,242,0.94)' }]}
          >
            <Animated.View style={heart.style}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={19} color={isFav ? t.colors.danger : t.colors.textSoft} />
            </Animated.View>
          </Pressable>

          {/* Compare toggle */}
          {inCompare || !compareFull ? (
            <Pressable
              hitSlop={10}
              onPress={() => {
                haptics.selection();
                toggleCompare(vendor.id);
              }}
              style={[styles.iconBtn, { right: 48, backgroundColor: inCompare ? t.colors.gold : 'rgba(253,248,242,0.94)' }]}
            >
              <Ionicons name="git-compare-outline" size={17} color={inCompare ? t.colors.onPrimary : t.colors.textSoft} />
            </Pressable>
          ) : null}
        </View>

        {/* Body */}
        <View style={{ padding: t.spacing.md, gap: 4 }}>
          <Row gap="sm" justify="space-between">
            <Text variant="overline" tone="label" numberOfLines={1} style={{ flex: 1, letterSpacing: 1 }}>
              {category.toUpperCase()}
            </Text>
            {verified ? (
              <Row gap="xxs">
                <Ionicons name="checkmark-circle" size={13} color={t.colors.goldDark} />
                <Text variant="overline" tone="gold">VERIFIED</Text>
              </Row>
            ) : null}
          </Row>

          <Text variant="title" numberOfLines={1}>
            {vendor.name}
          </Text>

          {location ? (
            <Row gap="xxs">
              <Ionicons name="location-outline" size={13} color={t.colors.textMuted} />
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {location}
              </Text>
            </Row>
          ) : null}

          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.divider, marginVertical: 8 }} />

          <Row justify="space-between">
            <Text variant="bodyMedium" tone={price.onRequest ? 'muted' : 'gold'} numberOfLines={1}>
              {price.text}
            </Text>
            {hasReviews ? (
              <Row gap="xxs">
                <Ionicons name="star" size={13} color={t.colors.gold} />
                <Text variant="caption" tone="primary" weight="medium">
                  {vendor.rating.toFixed(1)}
                </Text>
                <Text variant="caption" tone="muted">({vendor.reviewCount})</Text>
              </Row>
            ) : (
              <Badge label="New" tone="rose" />
            )}
          </Row>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', borderWidth: 1, overflow: 'hidden' },
  imageWrap: { width: '100%', aspectRatio: 4 / 3, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 64 },
  ribbon: { position: 'absolute', top: 10, left: 10 },
  iconBtn: { position: 'absolute', top: 8, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
