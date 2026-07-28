import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomSheetBackdrop, BottomSheetModal, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Carousel, type CarouselRenderItemInfo } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, Chip, EmptyState, Row, Section, Skeleton, Stack, Text } from '@/components/ui';
import { BookingRequestModal } from '@/features/vendors/components/BookingRequestModal';
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
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { useFavoritesStore } from '@/store/favorites';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { gradients, haptics, useTheme } from '@/theme';
import { telLink, waLink } from '@/utils/contact';

const HERO = 400;

function asStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

export default function VendorDetail() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = asStr(params.id);
  const q = useVendor(id);
  const related = useRelatedVendors(id);
  const isFav = useFavoritesStore((s) => (id ? s.ids.has(Number(id)) : false));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const recordView = useRecentlyViewedStore((s) => s.record);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const galleryRef = useRef<BottomSheetModal>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (id) recordView(Number(id));
  }, [id, recordView]);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  // Parallax hero: gentle zoom on pull-down, lag on scroll-up.
  const heroStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return { transform: [{ translateY: y > 0 ? y * 0.4 : 0 }, { scale: y < 0 ? 1 + -y / 600 : 1 }] };
  });
  // Hero overlay text fades as you scroll into the body.
  const heroContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HERO - 200], [1, 0], Extrapolation.CLAMP),
  }));
  // Collapsing glass header fades in once the hero scrolls away.
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO - 160, HERO - 80], [0, 1], Extrapolation.CLAMP),
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />,
    [],
  );

  const vendor = q.data ?? null;

  if (q.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
        <Skeleton height={HERO} radius={0} />
        <Stack gap="md" style={{ padding: 24 }}>
          <Skeleton height={28} width="70%" />
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
        <EmptyState icon="alert-circle-outline" title={tr('detail.notFound')} message={tr('detail.notFoundSub')} urdu={isUrdu} />
      </View>
    );
  }

  const gallery = vendorGallery(vendor);
  const hero = gallery[0] ?? null;
  const price = vendorPriceLabel(vendor);
  const verified = isVerified(vendor);
  const category = vendorCategoryLabel(vendor);
  const location = vendorLocation(vendor);
  const hasReviews = vendor.reviewCount > 0;
  const amenities = (Array.isArray(vendor.amenities) ? vendor.amenities : []).filter(Boolean);
  const services = (Array.isArray(vendor.serviceProvided) ? vendor.serviceProvided : []).filter(Boolean);
  const tags = [...services, ...amenities].slice(0, 12);
  const packages = Array.isArray(vendor.packages) ? vendor.packages : [];
  const relatedVendors = (related.data ?? []).filter((v) => v.id !== vendor.id).slice(0, 8);
  const phone = vendor.whatsappNumber ?? vendor.vendor?.phoneNumber;
  const galleryH = Math.max(240, H - insets.top - 64);

  const openGallery = (i: number) => {
    if (gallery.length === 0) return;
    haptics.light();
    setGalleryIndex(i);
    galleryRef.current?.present();
  };
  const onWhatsApp = () => {
    const link = waLink(phone, `Assalam o Alaikum, I found ${vendor.name} on Wedding Wala and would like to enquire.`);
    if (link) Linking.openURL(link).catch(() => {});
  };
  const onCall = () => {
    const link = telLink(phone);
    if (link) Linking.openURL(link).catch(() => {});
  };
  const onShare = () => {
    Share.share({ message: `${vendor.name} on Wedding Wala` }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Cinematic hero with overlaid identity */}
        <View style={{ height: HERO, backgroundColor: t.colors.sand, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            {hero ? (
              <Image source={{ uri: hero }} style={StyleSheet.absoluteFill} contentFit="cover" transition={280} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.center]}>
                <Ionicons name="image-outline" size={48} color={t.colors.textLabel} />
              </View>
            )}
            <LinearGradient colors={gradients.topScrim} style={styles.heroTopScrim} pointerEvents="none" />
            <LinearGradient colors={gradients.photoScrim} style={styles.heroBottomScrim} pointerEvents="none" />
          </Animated.View>

          {/* Tap-to-open gallery over the image (below the controls) */}
          <Pressable onPress={() => openGallery(0)} style={StyleSheet.absoluteFill} />

          <Animated.View style={[styles.heroContent, heroContentStyle]} pointerEvents="none">
            <Row gap="sm" style={{ marginBottom: 6 }}>
              <Text variant="overline" tone="onDark" style={{ letterSpacing: 1.6, opacity: 0.92 }}>
                {category.toUpperCase()}
              </Text>
              {verified ? <Badge label="Verified" tone="gold" icon="checkmark-circle" /> : null}
            </Row>
            <Text variant="display" tone="onDark" numberOfLines={2}>
              {vendor.name}
            </Text>
            {location ? (
              <Row gap="xxs" style={{ marginTop: 4 }}>
                <Ionicons name="location-outline" size={15} color={t.colors.onDark} />
                <Text variant="body" tone="onDark" numberOfLines={1} style={{ opacity: 0.9 }}>
                  {location}
                </Text>
              </Row>
            ) : null}
            <Row gap="md" align="center" style={{ marginTop: 12 }}>
              {hasReviews ? (
                <Row gap="xxs">
                  <Ionicons name="star" size={15} color={t.colors.goldLight} />
                  <Text variant="bodyMedium" tone="onDark">
                    {vendor.rating.toFixed(1)}
                  </Text>
                  <Text variant="caption" tone="onDark" style={{ opacity: 0.8 }}>
                    ({vendor.reviewCount})
                  </Text>
                </Row>
              ) : (
                <Badge label={tr('detail.newListing')} urdu={isUrdu} tone="rose" />
              )}
              <Text variant="body" tone="onDark" style={{ opacity: 0.5 }}>
                ·
              </Text>
              <Text variant="bodyMedium" tone="onDark">
                {price.onRequest ? tr('detail.askPrice') : price.text}
              </Text>
            </Row>
          </Animated.View>

          {gallery.length > 1 ? (
            <Pressable onPress={() => openGallery(0)} style={styles.galleryCount}>
              <Ionicons name="images-outline" size={14} color={t.colors.onDark} />
              <Text variant="caption" tone="onDark">
                {gallery.length}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Body */}
        <Stack gap="lg" style={{ padding: 24, paddingTop: 20 }}>
          {vendor.reliability && vendor.reliability.tier !== 'newcomer' ? (
            <Row gap="sm">
              <Ionicons name="shield-checkmark-outline" size={16} color={t.colors.goldDark} />
              <Text variant="caption" tone="body" urdu={isUrdu}>
                {tr('detail.reliability')}: <Text variant="caption" tone="gold" weight="medium">{vendor.reliability.tier}</Text>
              </Text>
            </Row>
          ) : null}

          {vendor.description ? (
            <Section title={tr('detail.about')} urdu={isUrdu}>
              <Text variant="body" tone="body">
                {vendor.description}
              </Text>
            </Section>
          ) : null}

          {packages.length > 0 ? (
            <Section title={tr('detail.packages')} urdu={isUrdu}>
              <Stack gap="sm">
                {packages.map((p, i) => (
                  <Card key={p.id ?? i}>
                    <Row gap="md">
                      <View style={[styles.pkgAccent, { backgroundColor: t.colors.gold }]} />
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

          {tags.length > 0 ? (
            <Section title={tr('detail.services')} urdu={isUrdu}>
              <Row gap="sm" wrap>
                {tags.map((tag, i) => (
                  <Chip key={`${tag}-${i}`} label={String(tag)} />
                ))}
              </Row>
            </Section>
          ) : null}

          {gallery.length > 1 ? (
            <Section title={tr('detail.gallery')} urdu={isUrdu}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {gallery.map((uri, i) => (
                  <Pressable key={i} onPress={() => openGallery(i)}>
                    <Image
                      source={{ uri }}
                      style={{ width: 172, height: 128, borderRadius: t.radius.md, backgroundColor: t.colors.sand }}
                      contentFit="cover"
                      transition={200}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </Section>
          ) : null}

          <ReviewsSection vendorId={vendor.id} rating={vendor.rating} reviewCount={vendor.reviewCount} />
          <AvailabilityCalendar vendorId={vendor.id} />
        </Stack>

        {relatedVendors.length > 0 ? (
          <View style={{ gap: t.spacing.md, paddingBottom: t.spacing.lg }}>
            <T k="detail.moreFromVendor" variant="h3" style={{ paddingHorizontal: 24 }} />
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

      {/* Collapsing glass header */}
      <Animated.View style={[styles.collapseHeader, { height: insets.top + 52 }, headerStyle]} pointerEvents="none">
        <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: t.colors.border }} />
        <Text variant="title" numberOfLines={1} style={{ marginTop: insets.top + 12, marginHorizontal: 60, textAlign: 'center' }}>
          {vendor.name}
        </Text>
      </Animated.View>

      {/* Persistent controls */}
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

      {/* Glass sticky CTA bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: t.colors.border }} />
        <Row gap="sm">
          <IconAction icon="logo-whatsapp" label={tr('detail.whatsapp')} urdu={isUrdu} onPress={onWhatsApp} disabled={!phone} />
          <IconAction icon="call-outline" label={tr('detail.call')} urdu={isUrdu} onPress={onCall} disabled={!phone} />
          <IconAction icon="share-social-outline" label={tr('detail.share')} urdu={isUrdu} onPress={onShare} />
          <View style={{ flex: 1, borderRadius: t.radius.sm, ...t.elevation.glow }}>
            <Button label={tr('detail.requestBooking')} urdu={isUrdu} icon="calendar-outline" fullWidth onPress={() => setInquiryOpen(true)} />
          </View>
        </Row>
      </View>

      <BookingRequestModal
        visible={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        businessId={vendor.id}
        packages={packages}
      />

      {/* Full-screen gallery sheet */}
      <BottomSheetModal
        ref={galleryRef}
        snapPoints={['100%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: t.colors.charcoalSurface }}
        handleIndicatorStyle={{ backgroundColor: t.colors.onDark }}
      >
        <View style={{ height: galleryH }}>
          {gallery.length > 1 ? (
            <Carousel
              data={gallery}
              defaultIndex={Math.min(galleryIndex, gallery.length - 1)}
              loop
              style={{ width: W, height: galleryH }}
              renderItem={({ item }: CarouselRenderItemInfo<string>) => (
                <View style={{ width: W, height: galleryH, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={{ uri: item }} style={{ width: W, height: galleryH }} contentFit="contain" transition={200} />
                </View>
              )}
            />
          ) : gallery[0] ? (
            <Image source={{ uri: gallery[0] }} style={{ width: W, height: galleryH }} contentFit="contain" />
          ) : null}
          <Pressable onPress={() => galleryRef.current?.dismiss()} style={[styles.heroBtn, { top: 12, right: 16 }]}>
            <Ionicons name="close" size={22} color={t.colors.charcoalSurface} />
          </Pressable>
        </View>
      </BottomSheetModal>
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
  urdu,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  urdu?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ alignItems: 'center', gap: 2, opacity: disabled ? 0.4 : 1, minWidth: 52 }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={20} color={t.colors.goldDark} />
      </View>
      <Text variant="overline" tone="muted" urdu={urdu}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  heroTopScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 150 },
  heroBottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 280 },
  heroContent: { position: 'absolute', left: 24, right: 24, bottom: 22 },
  galleryCount: { position: 'absolute', bottom: 18, right: 16, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(44,24,16,0.5)', paddingHorizontal: 10, height: 30, borderRadius: 15 },
  collapseHeader: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  pkgAccent: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  heroBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253,248,242,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    overflow: 'hidden',
  },
});
