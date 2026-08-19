/**
 * Vendor detail — the royal moment, rebuilt to the Elevated Bridal system.
 *
 * ── What changed, and why ─────────────────────────────────────────────────
 *
 * 1. **Identity moved off the photograph and into an overlapping sheet.** The old
 *    hero was 400px with the name, rating and price set over the image. On the
 *    marigold-and-gold photography this catalogue is full of, ivory text over a
 *    bright stage is unreadable no matter how heavy the scrim. The sheet overlaps
 *    the photo by 24px, so the composition still layers, but every word sits on
 *    a surface chosen for reading.
 *
 * 2. **A SpecStrip.** Capacity, parking, advance and years now sit in a fixed
 *    row, in the same place on every vendor. That is what makes two venues
 *    comparable at all; before, those numbers were scattered through prose and an
 *    amenities chip cloud.
 *
 * 3. **Packages are selectable tiles**, and the selection drives the CTA price.
 *    Previously the bar always showed the vendor's floor price regardless of what
 *    the customer was reading.
 *
 * 4. **One primary action.** The old bar had WhatsApp, Call, Share AND Request
 *    Booking all competing at equal weight. Share moved into the hero controls,
 *    and the bar is now two quiet squares plus one glowing CTA.
 *
 * 5. **No hero parallax.** The media is a paging carousel now, and a translate/
 *    scale transform on a horizontally-paging view fights the pager. Given this
 *    app's history — five separate "Maximum update depth exceeded" crashes from
 *    New-Architecture layout and animation feedback loops — dropping an animated
 *    transform from the most complex screen is a deliberate trade, not an
 *    oversight. The collapsing header is kept; it reads scroll offset only.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  type LayoutChangeEvent,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  runOnUI,
  scrollTo as reanimatedScrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Carousel, type CarouselRenderItemInfo } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoHero } from '@/components/signature';
import {
  Badge,
  Chip,
  EmptyState,
  Row,
  Section,
  SectionHeader,
  Skeleton,
  Spec,
  SpecStrip,
  Stack,
  StickyActionBar,
  Text,
  toast,
  VendorHostCard,
} from '@/components/ui';
import { InquiryModal } from '@/features/vendors/components/InquiryModal';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import { AvailabilityCalendar } from '@/features/vendors/detail/AvailabilityCalendar';
import { MenusSection } from '@/features/vendors/detail/MenusSection';
import { PackageTiles } from '@/features/vendors/detail/PackageTiles';
import { ReviewsSection } from '@/features/vendors/detail/ReviewsSection';
import { SectionNav } from '@/features/vendors/detail/SectionNav';
import { VendorSpecs } from '@/features/vendors/detail/VendorSpecs';
import {
  formatRs,
  isVerified,
  vendorCategoryLabel,
  vendorGallery,
  vendorLocation,
  vendorPriceCompact,
} from '@/features/vendors/vendor-display';
import { useRelatedVendors, useVendor } from '@/features/vendors/vendors.queries';
import type { VendorPackage } from '@/features/vendors/vendors.types';
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { openConversation } from '@/lib/api/endpoints/chat';
import { apiErrorMessage } from '@/lib/api/errors';
import { img, IMG } from '@/lib/img';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { haptics, overlay, useTheme } from '@/theme';
import { telLink, waLink } from '@/utils/contact';

/** Where the "you are here" line sits, measured from the top of the viewport. */
const SPY_LINE = 180;

const HERO = 280;
/** How far the ivory sheet rides up over the photograph. */
const SHEET_OVERLAP = 24;
const GUTTER = 24;

function asStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

/**
 * The four facts most often present across the 111 business columns. SpecStrip
 * drops the nulls and hides itself below two, which matters because ~98% of
 * listings are unclaimed OSM imports with mostly-empty columns.
 */
function buildSpecs(
  v: NonNullable<ReturnType<typeof useVendor>['data']>,
  // The labels were English literals. This strip sits directly under the vendor
  // name, so it was the first row of facts an Urdu customer read, in Latin.
  tr: (k: StringKey) => string,
): Spec[] {
  const seated = v.seatedCapacity ?? v.maxCapacity ?? null;
  const parking = v.carParkingCapacity ?? null;

  // Advance is either a percentage or a flat amount — the column pair says which.
  const dp = Number(v.downPayment);
  let advance: string | null = null;
  if (Number.isFinite(dp) && dp > 0) {
    advance = v.downPaymentType === 'Percentage' ? `${Math.round(dp)}%` : formatRs(dp);
  }

  const years = v.yearsInBusiness ?? null;

  return [
    { icon: 'people-outline', value: seated, label: tr('spec.seated') },
    { icon: 'car-outline', value: parking, label: tr('spec.parking') },
    { icon: 'wallet-outline', value: advance, label: tr('spec.advance') },
    { icon: 'ribbon-outline', value: years, label: tr('spec.years') },
  ];
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
  const [chatBusy, setChatBusy] = useState(false);
  const isAuthed = useAuthStore((st) => !!st.user);
  const [selectedPkg, setSelectedPkg] = useState<VendorPackage | null>(null);
  const galleryRef = useRef<BottomSheetModal>(null);

  /**
   * Section scroll index.
   *
   * Offsets are MEASURED via each section's `onLayout` rather than estimated
   * from a constant — every section on this screen is a different height
   * depending on how much of the vendor's data is null, so any guessed offset
   * would land in the wrong place on most listings. `y` here is relative to the
   * ScrollView's content, which is exactly what `scrollTo` wants.
   */
  /**
   * `useAnimatedRef`, not `useRef`.
   *
   * A plain `useRef` attached to a Reanimated `Animated.ScrollView` yields the
   * animated wrapper, which does not forward `scrollTo` — verified on screen:
   * tapping a section tab left `scrollTop` at 2284.8 before and after, so the
   * nav looked wired and did nothing. Reanimated's animated ref forwards the
   * underlying component's methods, which is the whole reason it exists.
   *
   * This is exactly the class of bug the sheet exists to catch: the component
   * rendered, the handler ran, and the feature was inert.
   */
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const offsets = useRef<Record<string, number>>({});

  /**
   * ── The offsets were measured against the wrong origin ──────────────────
   *
   * `onLayout` reports `y` relative to the PARENT, and every section is a
   * sibling inside the same `<Stack>`. That Stack begins roughly 700px down the
   * scroll content — below the photo hero, the title block and the spec strip —
   * so every recorded offset was short by the height of everything above it.
   *
   * Tapping "Availability" therefore scrolled to ~3,376 when the section is at
   * ~4,085: a section-height's worth of error, in a nav whose entire job is to
   * land you on the section you named. Measured on the live page: headings sit
   * at 749 / 1,349 / 2,424 / 3,562 / 4,085 while the registered values were
   * ~700 lower across the board.
   *
   * It survived because the original verification checked that `scrollTop`
   * CHANGED, not that it changed to the right place — a fix confirmed by
   * movement rather than by destination.
   *
   * Recording the Stack's own y and adding it puts every section back in the
   * scroll view's coordinate space, which is the space `scrollTo` and the
   * scroll handler both work in.
   */
  const sectionsTop = useRef(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  /**
   * Both wrapped in `useCallback`, and that is not a micro-optimisation.
   *
   * `react-hooks/refs` rejects a ref read from a function created during render:
   * "Passing a ref to a function may read its value during render". It is the
   * same rule that caught `Stepper` writing a ref in its render body, and this
   * codebase takes it seriously — render-phase work feeding into layout is the
   * documented cause of five separate "Maximum update depth exceeded" crashes on
   * device, and web never reproduces any of them.
   *
   * `useCallback` marks these as event handlers, which is what they are: one
   * runs on layout, the other on press. Neither ever executes during render.
   */
  const registerSection = useCallback(
    (key: string) => (e: LayoutChangeEvent) => {
      offsets.current[key] = e.nativeEvent.layout.y;
    },
    [],
  );

  /** The `<Stack>`'s own top, in the scroll view's coordinates. See above. */
  const registerSectionsTop = useCallback((e: LayoutChangeEvent) => {
    sectionsTop.current = e.nativeEvent.layout.y;
  }, []);

  /** A section's position in the SCROLL VIEW, not in its parent. */
  const sectionY = useCallback(
    (key: string): number | null => {
      const local = offsets.current[key];
      return local == null ? null : local + sectionsTop.current;
    },
    [],
  );

  const goToSection = useCallback((key: string) => {
    const y = sectionY(key);
    if (y == null) return;
    setActiveSection(key);
    const target = Math.max(0, y - 12);
    /**
     * Reanimated's `scrollTo` WORKLET, not `ref.current.scrollTo`.
     *
     * Two attempts failed on screen before this one, and both looked wired:
     *   1. `useRef` + `ref.current.scrollTo` — the animated wrapper does not
     *      forward the method at all.
     *   2. `useAnimatedRef` + `ref.current.scrollTo` — still inert; the animated
     *      ref is for the UI thread, and its `.current` is not a plain
     *      ScrollView handle.
     * Measured both times by reading `scrollTop` before and after the tap: 0
     * and 0. The documented API for scrolling an animated ref is this worklet,
     * dispatched with `runOnUI`.
     */
    runOnUI(() => {
      'worklet';
      reanimatedScrollTo(scrollRef, 0, target, true);
    })();
  }, [scrollRef, sectionY]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (id) recordView(Number(id));
  }, [id, recordView]);

  const scrollY = useSharedValue(0);

  /**
   * ── Scroll-spy ───────────────────────────────────────────────────────────
   *
   * `activeSection` was only ever written by `goToSection`, i.e. by TAPPING a
   * tab. Scrolling the page with a finger moved you through Packages, Details,
   * Menus and Reviews while the index above kept pointing at whatever you last
   * tapped — or at nothing at all on first load. An index that does not follow
   * the page is worse than no index, because it actively misreports position.
   *
   * Everything needed was already here and simply not connected: `offsets` has
   * each section's `y` from `onLayout`, and `onScroll` already runs.
   *
   * Two deliberate choices, both about this file's stated crash risk:
   *
   * 1. The offsets are read on the JS thread, not in the worklet. Reading a
   *    ref's `.current` inside a worklet is exactly the render/ref hazard the
   *    note on `registerSection` above describes.
   *
   * 2. `lastSpyY` gates the thread hop. Calling `runOnJS` every scroll frame is
   *    a `setState` attempt per frame; here it crosses only after 24px of
   *    travel, and `setActiveSection` then returns the previous value when
   *    nothing changed, so React bails out instead of re-rendering. Both guards
   *    matter — "Maximum update depth exceeded" is this repo's most common
   *    crash and it never reproduces on web.
   */
  const lastSpyY = useSharedValue(-999);

  const applySpy = useCallback((y: number) => {
    const entries = Object.keys(offsets.current)
      .map((k) => [k, sectionY(k) ?? 0] as const)
      .filter(([, top]) => top > 0);
    if (entries.length === 0) return;
    // The last section whose top has passed the reading line. `SPY_LINE` puts
    // that line a third down the viewport rather than at its very top, which is
    // where a reader's attention actually is.
    let key: string | null = null;
    for (const [k, top] of [...entries].sort((a, b) => a[1] - b[1])) {
      if (y + SPY_LINE >= top) key = k;
    }
    setActiveSection((prev) => (prev === key ? prev : key));
  }, [sectionY]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
    const y = e.contentOffset.y;
    if (Math.abs(y - lastSpyY.value) < 24) return;
    lastSpyY.value = y;
    runOnJS(applySpy)(y);
  });
  // Collapsing glass header — reads offset only, applies no transform to the hero.
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO - 150, HERO - 70], [0, 1], Extrapolation.CLAMP),
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  const vendor = q.data ?? null;

  const gallery = useMemo(() => (vendor ? vendorGallery(vendor) : []), [vendor]);

  const openGallery = useCallback((i: number) => {
    setGalleryIndex(i);
    galleryRef.current?.present();
  }, []);

  if (q.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
        <Skeleton height={HERO} radius={0} />
        <Stack gap="md" style={{ padding: GUTTER }}>
          <Skeleton height={12} width="34%" />
          <Skeleton height={30} width="72%" />
          <Skeleton height={14} width="46%" />
          <Skeleton height={68} />
        </Stack>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
        <Pressable onPress={() => router.back()} style={[styles.floatBtn, { top: insets.top + 4, left: 16 }]}>
          <Ionicons name="chevron-back" size={22} color={t.colors.textPrimary} />
        </Pressable>
        <EmptyState
          icon="alert-circle-outline"
          title={tr('detail.notFound')}
          message={tr('detail.notFoundSub')}
          urdu={isUrdu}
        />
      </View>
    );
  }

  /**
   * `vendorPriceCompact`, not `vendorPriceLabel`. This screen already prints
   * "starting from" as an overline UNDER the figure, so a "From " prefix on the
   * figure itself would say it twice — which is why the old code stripped it
   * back off with `.replace(/^From\s+/i, '')`. That regex only ever matched
   * English, so the moment the prefix was translated it would have left
   * "شروع Rs 350,000" on the Urdu page. Asking for the unprefixed value is the
   * fix; pattern-matching your own output back off is not.
   */
  const price = vendorPriceCompact(vendor, tr('price.onRequest'));
  const verified = isVerified(vendor);
  const category = vendorCategoryLabel(vendor, isUrdu);
  const location = vendorLocation(vendor);
  const hasReviews = vendor.reviewCount > 0;
  const amenities = (Array.isArray(vendor.amenities) ? vendor.amenities : []).filter(Boolean);
  const services = (Array.isArray(vendor.serviceProvided) ? vendor.serviceProvided : []).filter(Boolean);
  const tags = [...services, ...amenities].slice(0, 12);
  const packages = Array.isArray(vendor.packages) ? vendor.packages : [];
  const relatedVendors = (related.data ?? []).filter((v) => v.id !== vendor.id).slice(0, 8);
  const phone = vendor.whatsappNumber ?? vendor.vendor?.phoneNumber;
  const galleryH = Math.max(240, H - insets.top - 64);
  const specs = buildSpecs(vendor, tr);

  // The CTA price follows the selected tier, falling back to the vendor's floor.
  const selectedPrice = Number(selectedPkg?.price);
  const ctaMeta =
    Number.isFinite(selectedPrice) && selectedPrice > 0
      ? formatRs(selectedPrice)
      : price.onRequest
        ? undefined
        : // No strip needed: `price` is the compact (unprefixed) label now.
          price.text;

  const onChat = async () => {

    if (!isAuthed) {

      router.push('/auth/login');

      return;

    }

    if (!vendor?.userId) {

      toast.error(tr('chat.unavailable'));

      return;

    }

    try {

      setChatBusy(true);

      // create-or-get: re-entering lands in the SAME thread, never a duplicate

      const convo = await openConversation(Number(vendor.userId));

      router.push({ pathname: '/chat/[id]', params: { id: String(convo.id), name: vendor.name } });

    } catch (e) {

      toast.error(apiErrorMessage(e, tr));

    } finally {

      setChatBusy(false);

    }

  };


  const onWhatsApp = () => {
    const link = waLink(
      phone,
      `Assalam o Alaikum, I found ${vendor.name} on Wedding Wala and would like to enquire.`,
    );
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
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <PhotoHero
          images={gallery}
          width={W}
          height={HERO}
          onBack={() => router.back()}
          favorite={isFav}
          onToggleFavorite={() => {
            if (id) void toggleFav(Number(id));
          }}
          onShare={onShare}
          onPressImage={openGallery}
        />

        {/* ── The ivory sheet, overlapping the photograph ──────────────── */}
        <View
          style={{
            marginTop: -SHEET_OVERLAP,
            backgroundColor: t.colors.screen,
            borderTopLeftRadius: t.radius.xxl,
            borderTopRightRadius: t.radius.xxl,
            paddingHorizontal: GUTTER,
            paddingTop: t.spacing.xl,
          }}
        >
          {/*
            The identity block. Ink throughout.

            It carried FIVE gold events: a gold-brown category overline, a gold
            star, a gold tick with a gold "VERIFIED", and the price in gold. On
            the screen with the app's one gold CTA docked at the bottom, that is
            six — where the system allows one.

            Two of those were also untranslated English literals — `VERIFIED`
            and `STARTING` — hardcoded here while `home.verified` and
            `home.startingFrom` sat in the string file already.

            And the price was gold, which is the money rule (`Money.tsx`: gold
            means "action", a number is not an action) broken for the sixth time
            in this codebase — on the most-viewed screen in the product.
          */}
          <Text variant="overline" tone="muted" numberOfLines={1}>
            {/* No `.toUpperCase()`: `variant="overline"` already uppercases
                Latin, and forcing it on a Nastaliq city name is either a no-op
                or a glyph-shaping bug. */}
            {[category, location].filter(Boolean).join(' · ')}
          </Text>

          <Text variant="h1" numberOfLines={3} style={{ marginTop: t.spacing.sm }}>
            {vendor.name}
          </Text>

          <Row justify="space-between" align="flex-end" style={{ marginTop: t.spacing.md }}>
            <Row gap="xs" style={{ flex: 1 }}>
              {hasReviews ? (
                <>
                  {/* Ink star — the same mark `Rating` uses everywhere else. */}
                  <Ionicons name="star" size={13} color={t.colors.textPrimary} />
                  <Text variant="caption" tone="body" weight="medium">
                    {vendor.rating.toFixed(1)}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {ltr(`(${vendor.reviewCount})`, isUrdu)}
                  </Text>
                </>
              ) : (
                <Badge label={tr('detail.newListing')} urdu={isUrdu} tone="rose" />
              )}
              {verified ? (
                <Row gap="xxs" style={{ marginLeft: 6 }}>
                  <Ionicons name="checkmark-circle" size={13} color={t.colors.textMuted} />
                  <Text variant="overline" tone="muted" urdu={isUrdu}>
                    {tr('home.verified')}
                  </Text>
                </Row>
              ) : null}
            </Row>

            <View style={{ alignItems: 'flex-end' }}>
              {/* Ink, and `mono` — this is a figure, and it should align with
                  every other figure in the app rather than being set in the
                  display face at an inline 19px override of the type scale. */}
              <Text variant="monoLarge" tone="primary" style={{ fontSize: 19, lineHeight: 23 }}>
                {price.onRequest ? tr('detail.askPrice') : price.text}
              </Text>
              {!price.onRequest ? (
                <Text variant="overline" tone="muted" urdu={isUrdu}>
                  {tr('home.startingFrom')}
                </Text>
              ) : null}
            </View>
          </Row>

          {vendor.vacationMode ? (
            <View style={{ marginTop: t.spacing.md }}>
              <Badge label={vendor.vacationMessage ?? 'Away — not taking bookings'} tone="dark" icon="airplane-outline" />
            </View>
          ) : null}

          <View style={{ marginTop: t.spacing.lg }}>
            <SpecStrip specs={specs} urdu={isUrdu} />
          </View>

          {/* Gallery strip — resized thumbnails, tap opens the full-screen sheet. */}
          {gallery.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 7, paddingTop: t.spacing.lg }}
            >
              {gallery.map((uri, i) => (
                <Pressable
                  key={`${uri}-${i}`}
                  onPress={() => {
                    haptics.light();
                    openGallery(i);
                  }}
                >
                  <Image
                    source={{ uri: img(uri, IMG.thumb) ?? uri }}
                    style={{
                      width: 80,
                      height: 56,
                      borderRadius: t.radius.sm,
                      backgroundColor: t.colors.sunken,
                      borderWidth: 1,
                      borderColor: t.colors.border,
                    }}
                    contentFit="cover"
                    transition={180}
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <Stack
          gap="xl"
          onLayout={registerSectionsTop}
          style={{ padding: GUTTER, paddingTop: t.spacing.xl }}
        >
          {/*
            The section index. Built from what this vendor ACTUALLY has — a tab
            for an empty section is a navigation bar that lies about what is
            below it, and on a platform of unclaimed imports most sections are
            empty most of the time.
          */}
          <SectionNav
            items={[
              packages.length > 0 ? { key: 'packages', label: tr('detail.packages') } : null,
              { key: 'specs', label: tr('detail.specs') },
              Array.isArray(vendor.menus) && vendor.menus.length > 0
                ? { key: 'menus', label: tr('detail.menus') }
                : null,
              vendor.reviewCount > 0 ? { key: 'reviews', label: tr('detail.reviews') } : null,
              { key: 'availability', label: tr('detail.availability') },
            ].filter(Boolean) as { key: string; label: string }[]}
            active={activeSection}
            onSelect={goToSection}
            urdu={isUrdu}
          />

          {packages.length > 0 ? (
            <View style={{ gap: t.spacing.md }} onLayout={registerSection('packages')}>
              <SectionHeader title={tr('detail.packages')} urdu={isUrdu} />
              <PackageTiles
                packages={packages}
                selectedId={typeof selectedPkg?.id === 'number' ? selectedPkg.id : null}
                onSelect={setSelectedPkg}
                urdu={isUrdu}
              />
              {selectedPkg?.description ? (
                <Text variant="caption" tone="muted">
                  {selectedPkg.description}
                </Text>
              ) : null}
            </View>
          ) : null}

          {vendor.reliability && vendor.reliability.tier !== 'newcomer' ? (
            <Row gap="sm">
              <Ionicons name="shield-checkmark-outline" size={16} color={t.colors.textMuted} />
              <Text variant="caption" tone="body" urdu={isUrdu}>
                {tr('detail.reliability')}:{' '}
                {/* Ink. The tier is a fact about the vendor, not an action. */}
                <Text variant="caption" tone="primary" weight="medium">
                  {vendor.reliability.tier}
                </Text>
              </Text>
            </Row>
          ) : null}

          {/*
            The vendor as a person. `ownerName`, `ownerBio`, `yearsInBusiness`
            and `weddingsCompleted` sit on every business row and this screen
            showed none of them — the gap the research called the biggest one we
            had. The card hides itself entirely when there is no owner, which on
            a platform that is ~98% unclaimed OSM imports is most of the time,
            so it leaves no empty heading behind on a listing nobody has claimed.
          */}
          <VendorHostCard
            ownerName={vendor.ownerName}
            ownerBio={vendor.ownerBio}
            yearsInBusiness={vendor.yearsInBusiness}
            weddingsCompleted={vendor.weddingsCompleted}
            reliabilityTier={vendor.reliability?.tier ?? null}
            verified={verified}
            urdu={isUrdu}
          />

          {vendor.description ? (
            <Section title={tr('detail.about')} urdu={isUrdu}>
              <Text variant="body" tone="body">
                {vendor.description}
              </Text>
            </Section>
          ) : null}

          {/* The per-vendor-type spec table. This is the "detail page is
              incomplete" gap: the web switches these rows by vendorType and the
              app showed a four-item strip. Renders nothing when every column is
              null, which is the common case on OSM imports. */}
          <View onLayout={registerSection('specs')}>
            <VendorSpecs vendor={vendor} />
          </View>

          {/* Per-head menus. The `minGuaranteeCount` on each row is the number
              that actually decides cost and neither surface spelled it out. */}
          <View onLayout={registerSection('menus')}>
            <MenusSection vendor={vendor} />
          </View>

          {tags.length > 0 ? (
            <Section title={tr('detail.services')} urdu={isUrdu}>
              <Row gap="sm" wrap>
                {tags.map((tag, i) => (
                  <Chip key={`${tag}-${i}`} label={String(tag)} />
                ))}
              </Row>
            </Section>
          ) : null}

          <View onLayout={registerSection('reviews')}>
            <ReviewsSection vendorId={vendor.id} rating={vendor.rating} reviewCount={vendor.reviewCount} />
          </View>
          <View onLayout={registerSection('availability')}>
            <AvailabilityCalendar vendorId={vendor.id} />
          </View>

          {/*
            Send an inquiry — the path that existed in code and could not be
            reached from anywhere.

            The inquiry sheet has been mounted on this screen the whole time
            behind `inquiryOpen`, and **`setInquiryOpen` was never called**. So
            the modal was dead code, the app had no inquiry path at all, and
            `POST /leads/inquiry` — the endpoint the marketplace's whole
            discovery→contact loop runs on — was unreachable from the product.

            It goes in the BODY rather than the sticky bar for two reasons: the
            bar is already at its three-action cap (chat, WhatsApp, call), and
            this is where the web puts it (`VendorInquiryDialog`, opened from
            the page, not from a toolbar).

            It matters most for the ~98% of listings that are unclaimed OSM
            imports: no owner to chat, often no phone to ring. This is the only
            channel those vendors have, and it was switched off.
          */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('detail.sendInquiry')}
            onPress={() => setInquiryOpen(true)}
            style={({ pressed }) => [
              {
                marginHorizontal: GUTTER,
                padding: t.spacing.lg,
                borderRadius: t.radius.md + 2,
                borderWidth: 1,
                borderColor: t.colors.borderStrong,
                flexDirection: isUrdu ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: t.spacing.lg,
              },
              pressed ? { opacity: 0.6 } : null,
            ]}
          >
            <Ionicons name="mail-outline" size={22} color={t.colors.textMuted} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                variant="title"
                urdu={isUrdu}
                style={{ textAlign: isUrdu ? 'right' : 'left' }}
              >
                {tr('detail.sendInquiry')}
              </Text>
              <Text
                variant="caption"
                tone="muted"
                urdu={isUrdu}
                style={{ textAlign: isUrdu ? 'right' : 'left' }}
              >
                {tr('detail.sendInquirySub')}
              </Text>
            </View>
            <Ionicons
              name={isUrdu ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={t.colors.textFaint}
            />
          </Pressable>
        </Stack>

        {relatedVendors.length > 0 ? (
          <View style={{ gap: t.spacing.md, paddingBottom: t.spacing.lg }}>
            <T k="detail.moreFromVendor" variant="h3" style={{ paddingHorizontal: GUTTER }} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12 }}
            >
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
      <Animated.View
        style={[styles.collapseHeader, { height: insets.top + 52 }, headerStyle]}
        pointerEvents="none"
      >
        <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: t.colors.border,
          }}
        />
        <Text
          variant="title"
          numberOfLines={1}
          style={{ marginTop: insets.top + 12, marginHorizontal: 60, textAlign: 'center' }}
        >
          {vendor.name}
        </Text>
      </Animated.View>

      {/*
        Chat — the action the app was missing entirely.

        `/chat/*` has been live on the backend the whole time and the WEB uses it
        from this exact screen; the app offered WhatsApp and a phone call and
        nothing else, so every conversation left the platform on the first tap.

        Two guards, in this order, because they fail for different reasons and
        need different messages:
          1. not signed in    → a conversation needs an identity on both ends
          2. no `userId`      → an unclaimed OSM import has no owner to message,
                                and ~98% of listings are unclaimed
      */}
      <StickyActionBar
        primaryLabel={tr('detail.requestBooking')}
        primaryIcon="calendar-outline"
        primaryMeta={ctaMeta}
        /**
         * Into the FLOW, not the modal.
         *
         * The modal asked for date, guests, package and message in one sheet.
         * Date decides which slots exist, the slot decides capacity, capacity
         * decides the package — asked together, every answer stays provisional.
         * `/booking/[id]` is step one and carries the rest forward.
         */
        onPrimaryPress={() => router.push({ pathname: '/booking/[id]', params: { id: String(vendor.id) } })}
        primaryDisabled={vendor.vacationMode}
        urdu={isUrdu}
        secondary={[
          {
            icon: 'chatbubble-ellipses-outline' as const,
            onPress: () => void onChat(),
            accessibilityLabel: tr('detail.chat'),
            busy: chatBusy,
          },
          ...(phone
            ? [
                {
                  icon: 'logo-whatsapp' as const,
                  onPress: onWhatsApp,
                  accessibilityLabel: tr('detail.whatsapp'),
                  tint: t.colors.success,
                },
                {
                  icon: 'call-outline' as const,
                  onPress: onCall,
                  accessibilityLabel: tr('detail.call'),
                },
              ]
            : []),
        ]}
      />

      <InquiryModal
        visible={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        businessId={vendor.id}
        vendorName={vendor.name ?? ''}
        packages={packages}
      />

      {/* Full-screen gallery */}
      <BottomSheetModal
        ref={galleryRef}
        snapPoints={['100%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: t.colors.surfaceInverse }}
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
                  <Image
                    source={{ uri: item }}
                    style={{ width: W, height: galleryH }}
                    contentFit="contain"
                    transition={200}
                  />
                </View>
              )}
            />
          ) : gallery[0] ? (
            <Image
              source={{ uri: gallery[0] }}
              style={{ width: W, height: galleryH }}
              contentFit="contain"
            />
          ) : null}
          <Pressable
            onPress={() => galleryRef.current?.dismiss()}
            style={[styles.floatBtn, { top: 12, right: 16 }]}
          >
            <Ionicons name="close" size={22} color={t.colors.textPrimary} />
          </Pressable>
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  collapseHeader: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  floatBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: overlay.onPhoto,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
