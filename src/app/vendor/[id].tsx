import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, Chip, EmptyState, Rating, Row, Section, Skeleton, Stack, Text } from '@/components/ui';
import { InquiryModal } from '@/features/vendors/components/InquiryModal';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import { AvailabilityCalendar } from '@/features/vendors/detail/AvailabilityCalendar';
import { ReviewsSection } from '@/features/vendors/detail/ReviewsSection';
import {
  formatRs,
  isVerified,
  vendorCategoryLabel,
  vendorGallery,
  vendorLocation,
  vendorPriceLabel,
} from '@/features/vendors/vendor-display';
import { useRelatedVendors, useVendor } from '@/features/vendors/vendors.queries';
import { useFavoritesStore } from '@/store/favorites';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { haptics, useTheme } from '@/theme';
import { telLink, waLink } from '@/utils/contact';

function asStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

export default function VendorDetail() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = asStr(params.id);
  const q = useVendor(id);
  const related = useRelatedVendors(id);
  const isFav = useFavoritesStore((s) => (id ? s.ids.has(Number(id)) : false));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const recordView = useRecentlyViewedStore((s) => s.record);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    if (id) recordView(Number(id));
  }, [id, recordView]);

  // Parallax hero: gentle zoom on pull-down, lag on scroll-up.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const heroStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      transform: [
        { translateY: y > 0 ? y * 0.4 : 0 },
        { scale: y < 0 ? 1 + -y / 600 : 1 },
      ],
    };
  });

  const vendor = q.data ?? null;

  if (q.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
        <Skeleton height={320} radius={0} />
        <Stack gap="md" style={{ padding: 24 }}>
          <Skeleton height={24} width="70%" />
          <Skeleton height={14} width="40%" />
          <Skeleton height={60} />
        </Stack>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
        <BackButton top={insets.top} />
        <EmptyState icon="alert-circle-outline" title="Vendor not found" message="This listing may have been removed." />
      </View>
    );
  }

  const gallery = vendorGallery(vendor);
  const hero = gallery[0] ?? null;
  const price = vendorPriceLabel(vendor);
  const verified = isVerified(vendor);
  const amenities = (Array.isArray(vendor.amenities) ? vendor.amenities : []).filter(Boolean);
  const services = (Array.isArray(vendor.serviceProvided) ? vendor.serviceProvided : []).filter(Boolean);
  const tags = [...services, ...amenities].slice(0, 12);
  const packages = Array.isArray(vendor.packages) ? vendor.packages : [];
  const relatedVendors = (related.data ?? []).filter((v) => v.id !== vendor.id).slice(0, 8);
  const phone = vendor.whatsappNumber ?? vendor.vendor?.phoneNumber;
  const shareMsg = `${vendor.name} on Wedding Wala`;

  const onWhatsApp = () => {
    const link = waLink(phone, `Assalam o Alaikum, I found ${vendor.name} on Wedding Wala and would like to enquire.`);
    if (link) Linking.openURL(link).catch(() => {});
  };
  const onCall = () => {
    const link = telLink(phone);
    if (link) Linking.openURL(link).catch(() => {});
  };
  const onShare = () => {
    Share.share({ message: shareMsg }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={{ height: 320, backgroundColor: t.colors.sand, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            {hero ? (
              <Image source={{ uri: hero }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.center]}>
                <Ionicons name="image-outline" size={48} color={t.colors.textLabel} />
              </View>
            )}
            <LinearGradient
              colors={['rgba(44,24,16,0.45)', 'transparent', 'rgba(44,24,16,0.15)']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <BackButton top={insets.top} />
          <Pressable
            onPress={() => {
              haptics.light();
              if (id) toggleFav(Number(id));
            }}
            style={[styles.heroBtn, { top: insets.top + 4, right: 16 }]}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? t.colors.danger : t.colors.charcoalSurface} />
          </Pressable>
          {vendor.sponsored ? (
            <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
              <Badge label="Featured" tone="gold" icon="star" />
            </View>
          ) : null}
        </View>

        {/* Head */}
        <Stack gap="lg" style={{ padding: 24 }}>
          <Stack gap="xs">
            <Row gap="sm" justify="space-between">
              <Text variant="overline" tone="label">
                {vendorCategoryLabel(vendor).toUpperCase()}
              </Text>
              {verified ? <Badge label="Verified" tone="gold" icon="checkmark-circle" /> : null}
            </Row>
            <Text variant="display">{vendor.name}</Text>
            {vendorLocation(vendor) ? (
              <Row gap="xxs">
                <Ionicons name="location-outline" size={15} color={t.colors.textMuted} />
                <Text variant="body" tone="muted">
                  {vendorLocation(vendor)}
                </Text>
              </Row>
            ) : null}
          </Stack>

          <Row gap="lg" justify="space-between">
            {vendor.reviewCount > 0 ? (
              <Rating value={vendor.rating} reviewCount={vendor.reviewCount} size={48} />
            ) : (
              <Badge label="New listing" tone="rose" />
            )}
            <Stack gap="none" style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" tone="muted">
                {price.onRequest ? 'Pricing' : 'Starting from'}
              </Text>
              <Text variant="h3" tone={price.onRequest ? 'muted' : 'gold'}>
                {price.text}
              </Text>
            </Stack>
          </Row>

          {vendor.reliability && vendor.reliability.tier !== 'newcomer' ? (
            <Row gap="sm">
              <Ionicons name="shield-checkmark-outline" size={16} color={t.colors.goldDark} />
              <Text variant="caption" tone="body">
                Reliability: <Text variant="caption" tone="gold" weight="medium">{vendor.reliability.tier}</Text>
              </Text>
            </Row>
          ) : null}

          {/* About */}
          {vendor.description ? (
            <Section title="ABOUT">
              <Text variant="body" tone="body">
                {vendor.description}
              </Text>
            </Section>
          ) : null}

          {/* Packages */}
          {packages.length > 0 ? (
            <Section title="PACKAGES">
              <Stack gap="sm">
                {packages.map((p, i) => (
                  <Card key={p.id ?? i}>
                    <Row justify="space-between">
                      <Stack gap="xxs" style={{ flex: 1 }}>
                        <Text variant="title">{p.name ?? `Package ${i + 1}`}</Text>
                        {p.description ? (
                          <Text variant="caption" tone="muted" numberOfLines={2}>
                            {p.description}
                          </Text>
                        ) : null}
                      </Stack>
                      {typeof p.price === 'number' && p.price > 0 ? (
                        <Text variant="bodyMedium" tone="gold">
                          {formatRs(p.price)}
                        </Text>
                      ) : null}
                    </Row>
                  </Card>
                ))}
              </Stack>
            </Section>
          ) : null}

          {/* Services & amenities */}
          {tags.length > 0 ? (
            <Section title="SERVICES & AMENITIES">
              <Row gap="sm" wrap>
                {tags.map((tag, i) => (
                  <Chip key={`${tag}-${i}`} label={String(tag)} />
                ))}
              </Row>
            </Section>
          ) : null}

          {/* Gallery strip */}
          {gallery.length > 1 ? (
            <Section title="GALLERY">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {gallery.map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={{ width: 160, height: 120, borderRadius: t.radius.md, backgroundColor: t.colors.sand }}
                    contentFit="cover"
                    transition={200}
                  />
                ))}
              </ScrollView>
            </Section>
          ) : null}

          {/* Reviews */}
          <ReviewsSection vendorId={vendor.id} rating={vendor.rating} reviewCount={vendor.reviewCount} />

          {/* Availability */}
          <AvailabilityCalendar vendorId={vendor.id} />
        </Stack>

        {/* Related */}
        {relatedVendors.length > 0 ? (
          <View style={{ gap: t.spacing.md, paddingBottom: t.spacing.lg }}>
            <Text variant="h3" style={{ paddingHorizontal: 24 }}>
              More from this vendor
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
              {relatedVendors.map((v) => (
                <View key={v.id} style={{ width: 240 }}>
                  <VendorCard vendor={v} />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </Animated.ScrollView>

      {/* Sticky contact bar */}
      <View
        style={[
          styles.bar,
          {
            backgroundColor: t.colors.surface,
            borderTopColor: t.colors.border,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <Row gap="sm">
          <IconAction icon="logo-whatsapp" label="WhatsApp" onPress={onWhatsApp} disabled={!phone} />
          <IconAction icon="call-outline" label="Call" onPress={onCall} disabled={!phone} />
          <IconAction icon="share-social-outline" label="Share" onPress={onShare} />
          <View style={{ flex: 1 }}>
            <Button label="Send inquiry" icon="chatbubble-ellipses-outline" fullWidth onPress={() => setInquiryOpen(true)} />
          </View>
        </Row>
      </View>

      <InquiryModal
        visible={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        businessId={vendor.id}
        vendorName={vendor.name}
      />
    </View>
  );
}

function BackButton({ top }: { top: number }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => router.back()} style={[styles.heroBtn, { top: top + 4, left: 16 }]}>
      <Ionicons name="chevron-back" size={22} color={t.colors.charcoalSurface} />
    </Pressable>
  );
}

function IconAction({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ alignItems: 'center', gap: 2, opacity: disabled ? 0.4 : 1, minWidth: 52 }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: t.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={20} color={t.colors.goldDark} />
      </View>
      <Text variant="overline" tone="muted">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  heroBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253,248,242,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
});
