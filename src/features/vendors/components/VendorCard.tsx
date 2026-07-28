/**
 * VendorCard — the core listing element. Ports the web VendorCard anatomy:
 * 4:3 image + fallback, Featured ribbon, favourite heart, verified badge,
 * rating (or "New"), price (or "Ask for a price"), vacation state.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Card, Row, Text } from '@/components/ui';
import { useFavoritesStore } from '@/store/favorites';
import { haptics, useTheme } from '@/theme';

import { isVerified, vendorCategoryLabel, vendorLocation, vendorPriceLabel, vendorPrimaryImage } from '../vendor-display';
import type { Vendor } from '../vendors.types';

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const t = useTheme();
  const isFav = useFavoritesStore((s) => s.ids.has(vendor.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);

  const image = vendorPrimaryImage(vendor);
  const price = vendorPriceLabel(vendor);
  const location = vendorLocation(vendor);
  const category = vendorCategoryLabel(vendor);
  const verified = isVerified(vendor);
  const hasReviews = vendor.reviewCount > 0;

  return (
    <Card padded={false} onPress={() => router.push(`/vendor/${vendor.id}`)}>
      {/* Image */}
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} contentFit="cover" transition={220} />
        ) : (
          <View style={[styles.image, styles.imageFallback, { backgroundColor: t.colors.sand }]}>
            <Ionicons name="image-outline" size={30} color={t.colors.textLabel} />
          </View>
        )}

        {/* Featured ribbon */}
        {vendor.sponsored ? (
          <View style={styles.ribbon}>
            <Badge label="Featured" tone="gold" icon="star" />
          </View>
        ) : null}

        {/* Vacation veil */}
        {vendor.vacationMode ? (
          <View style={styles.veil}>
            <Badge label="Away" tone="dark" icon="airplane-outline" />
          </View>
        ) : null}

        {/* Favourite heart */}
        <Pressable
          hitSlop={10}
          onPress={() => {
            haptics.light();
            toggleFav(vendor.id);
          }}
          style={[styles.heart, { backgroundColor: 'rgba(253,248,242,0.92)' }]}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? t.colors.danger : t.colors.textSoft}
          />
        </Pressable>
      </View>

      {/* Body */}
      <View style={{ padding: t.spacing.md, gap: 4 }}>
        <Row gap="sm" justify="space-between">
          <Text variant="overline" tone="label" numberOfLines={1} style={{ flex: 1 }}>
            {category.toUpperCase()}
          </Text>
          {verified ? (
            <Row gap="xxs">
              <Ionicons name="checkmark-circle" size={13} color={t.colors.goldDark} />
              <Text variant="overline" tone="gold">
                VERIFIED
              </Text>
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

        <Row justify="space-between" style={{ marginTop: 4 }}>
          <Text variant="bodyMedium" tone={price.onRequest ? 'muted' : 'gold'} numberOfLines={1}>
            {price.text}
          </Text>
          {hasReviews ? (
            <Row gap="xxs">
              <Ionicons name="star" size={13} color={t.colors.gold} />
              <Text variant="caption" tone="primary" weight="medium">
                {vendor.rating.toFixed(1)}
              </Text>
              <Text variant="caption" tone="muted">
                ({vendor.reviewCount})
              </Text>
            </Row>
          ) : (
            <Badge label="New" tone="rose" />
          )}
        </Row>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  imageWrap: { width: '100%', aspectRatio: 4 / 3, position: 'relative' },
  image: { width: '100%', height: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  ribbon: { position: 'absolute', top: 10, left: 10 },
  veil: { position: 'absolute', top: 10, left: 10 },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
