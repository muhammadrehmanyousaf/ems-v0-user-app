/**
 * VendorCard — **v4. The card stops being a card.**
 *
 * Governed by rules.md §0.0. The single most-rendered element in the app, so
 * its silhouette is the app's silhouette.
 *
 * ── What it was ───────────────────────────────────────────────────────────
 *
 * A white rounded box with a 1px border and a warm drop shadow, containing a
 * 4:3 image, a gold uppercase category overline, a name, a location row, a
 * hairline divider, and a gold price. Nine visual elements, four of them
 * structural chrome (border, shadow, divider, background). Two floating circular
 * buttons and a ribbon on the image. On a 360px screen at 2-up, that is roughly
 * 160px of width being asked to carry a boxed miniature of a whole layout.
 *
 * ── What it is now ────────────────────────────────────────────────────────
 *
 * A photograph, and three lines of type on the paper beneath it.
 *
 * No border, no background fill, no shadow, no divider, no ribbon, no rating
 * pill. The reference does exactly this and it is not a stylistic preference —
 * it is what lets the photograph be the biggest thing on the card. Chrome around
 * an image is chrome competing with the image.
 *
 * The changes that carry the most weight:
 *
 * • **The name is `title` at 16 against a 13 caption**, and it is the first
 *   thing in the text block. v3 opened with a gold uppercase category label, so
 *   the loudest text on a vendor card was the word "VENUES" — the one piece of
 *   information the customer already knows, because they tapped a category to
 *   get here.
 * • **The price is ink, not gold.** Gold is the CTA and nothing else. The price
 *   still leads by weight, in tabular figures, which is how a price should lead.
 * • **The rating sits on the PRICE line**, not the location line. It was on the
 *   photograph in v3 because the old row could not fit price and rating
 *   together; the first v4 pass moved it beside the location, which only moved
 *   the squeeze — at 2-up on 360px that row is 144px and the location truncated
 *   to "Johar Town, …". Price and rating are both short figures, so they share
 *   the last line and align down the column, and the location gets a line to
 *   itself.
 * • **One control on the image, not two.** The heart. Compare moved to a long
 *   press: it is a power feature, it was competing with the primary action at
 *   the same visual weight, and two 30px circles on a 160px photo left no clear
 *   area at all.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { MonogramFallback } from '@/components/signature';
import { Text } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { img, IMG } from '@/lib/img';
import { COMPARE_MAX, useCompareStore } from '@/store/compare';
import { useFavoritesStore } from '@/store/favorites';
import { haptics, overlay, SPRING, useReducedMotion, usePressScale, useTheme } from '@/theme';

import {
  isVerified,
  vendorLocation,
  vendorPriceCompact,
  vendorPrimaryImage,
} from '../vendor-display';
import type { Vendor } from '../vendors.types';

/** A one-shot "pop" spring for the favourite heart. Shared-value writes live in
 *  the hook, which keeps the react-compiler immutability lint happy. */
function useHeartPop() {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const pop = () => {
    if (reduced) return;
    scale.value = withSequence(withSpring(1.3, SPRING.bouncy), withSpring(1, SPRING.bouncy));
  };
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { style, pop };
}

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const t = useTheme();
  // Note it pulls the TRANSLATOR, not just the language flag. Until now this
  // component imported `useT` purely to detect Urdu and then rendered its one
  // string (Comparing) as an English literal.
  const { t: tr, isUrdu } = useT();
  const isFav = useFavoritesStore((s) => s.ids.has(vendor.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const inCompare = useCompareStore((s) => s.ids.includes(vendor.id));
  const compareFull = useCompareStore((s) => s.ids.length >= COMPARE_MAX);
  const toggleCompare = useCompareStore((s) => s.toggle);
  // 0.985, not 0.98: with no shadow or border to deform, a heavier press scale
  // reads as the whole photograph sliding rather than the card depressing.
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.985);
  const heart = useHeartPop();

  const image = vendorPrimaryImage(vendor);
  const price = vendorPriceCompact(vendor, tr('price.onRequest'));
  const location = vendorLocation(vendor);
  const hasReviews = vendor.reviewCount > 0;

  return (
    /**
     * The heart is a SIBLING of the card, not a child of it.
     *
     * It used to sit inside the card's `Pressable`, over the photograph. On
     * native that is merely unusual; on web it compiles to `<button>` inside
     * `<button>`, which is invalid HTML — the browser logged it on every card —
     * and a nested interactive is genuinely ambiguous to a screen reader in
     * both runtimes: one control reporting two actions, with no way to reach
     * the inner one by keyboard.
     *
     * Hoisting it out costs one wrapper `View` and changes nothing visually:
     * the photograph is the first thing in the card, so `top/right: 10` lands
     * in the same place measured from the card as it did from the image.
     */
    <View>
      <Pressable
      accessibilityRole="button"
      accessibilityLabel={vendor.name}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      // Typed against the real route tree, not a template literal. An untyped
      // route string is what hid `/booking/[id]/guests` — a screen that never
      // existed — behind a dead-ending flow.
      onPress={() => router.push({ pathname: '/vendor/[id]', params: { id: String(vendor.id) } })}
      /**
       * Compare on long press. It is a comparison tool for a shortlist, used
       * once per category at most — it does not deserve equal billing with
       * "save", and it was costing the photograph a second floating button.
       */
      onLongPress={() => {
        if (!inCompare && compareFull) return;
        haptics.medium();
        toggleCompare(vendor.id);
      }}
      delayLongPress={280}
    >
      <Animated.View style={animatedStyle}>
        {/* ── The photograph ────────────────────────────────────────────── */}
        <View
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: t.radius.lg,
            overflow: 'hidden',
            backgroundColor: t.colors.sunken,
          }}
        >
          {image ? (
            // Ask Cloudinary for card-sized pixels. The API returns originals,
            // often 2–4 MB, and this is the most-rendered component in the app.
            <Image
              source={{ uri: img(image, IMG.card) ?? image }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={220}
              recyclingKey={String(vendor.id)}
            />
          ) : (
            // Shared fallback, so detail / compare / cart all degrade identically.
            <View style={[StyleSheet.absoluteFill, styles.center]}>
              <MonogramFallback name={vendor.name} size={46} />
            </View>
          )}

          {/* Compare is the ONLY state that earns a marker on the image, and
              only while it is on — otherwise the photograph stays clean. */}
          {inCompare ? (
            <View style={[styles.compareTag, { backgroundColor: overlay.onPhoto }]}>
              <Ionicons name="git-compare" size={12} color={t.colors.textPrimary} />
              <Text variant="caption" urdu={isUrdu} style={{ fontSize: 11 }}>
                {tr('compare.comparing')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Three lines on paper ──────────────────────────────────────── */}
        <View style={{ paddingTop: t.spacing.md, gap: 3 }}>
          {/*
            The name gets BOTH lines and the full width.

            The first v4 draft put the rating inline on the name row, the way the
            reference does. The reference is a ONE-up list at full width; our grid
            is 2-up on a 360px screen, which leaves the name about 110px once the
            rating is subtracted — and "Rehman Grand Marquee" came out as
            "Rehman Grand Marq… ★4.33". Verified on screen, not reasoned about.

            A vendor's name is the one thing on this card that must never be
            guesswork, so it takes the row, and the rating drops to the meta line
            where it sits beside the location it qualifies.
          */}
          {/*
            Alignment follows the INTERFACE, not the vendor's name.

            `Text` sniffs its own content and applies `writingDirection: 'rtl'`
            to anything in Urdu script — which is right for shaping, and was
            wrong for layout. A caterer called صادق شاہ پکوان مرکز got its name
            pushed to the right edge of the card while "Karachi" and the price
            stayed on the left, so one card read in two directions at once.

            Nastaliq is still Nastaliq; only the box it sits in stops moving.
          */}
          <Text
            variant="title"
            numberOfLines={2}
            style={{ textAlign: isUrdu ? 'right' : 'left' }}
          >
            {vendor.name}
          </Text>

          {/*
            Location, on its OWN line.

            It shared a row with the verified tick and the rating, and at 2-up on
            a 360px screen that row is 144px wide. The tick, the star and "4.3"
            take ~50 of them at fixed size, so the location — the only element
            with `flexShrink` — absorbed the whole squeeze and truncated:
            "Johar Town, …" on a card whose city is the second thing a couple
            filters by. Facts do not compete for one line when there is another
            line available.

            The tick stays here because it qualifies the vendor, not the price.
            It is INK now: this file's own header says "the price is ink, not
            gold — gold is the CTA and nothing else", and a gold tick on every
            verified card was the same rule being broken one glyph at a time.
          */}
          {location || isVerified(vendor) ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {location ? (
                <Text variant="caption" tone="muted" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {location}
                </Text>
              ) : null}
              {isVerified(vendor) ? (
                <Ionicons name="checkmark-circle" size={12} color={t.colors.textMuted} />
              ) : null}
            </View>
          ) : null}

          {/*
            Price and rating share the last line — two short figures that align
            down a column instead of one figure and a hole. The price is ink,
            not gold; gold is the CTA and nothing else. It still leads by weight,
            in tabular figures.

            No rating renders when there are no reviews, which is the common case
            (~98% of listings are unclaimed imports). A hollow star reads as a
            bad score rather than as no score.
          */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: t.spacing.sm,
            }}
          >
            {price.onRequest ? (
              <Text variant="caption" tone="muted" numberOfLines={1} style={{ flexShrink: 1 }}>
                {price.text}
              </Text>
            ) : (
              <Text variant="mono" numberOfLines={1} style={{ fontSize: 14, flexShrink: 1 }}>
                {price.text}
              </Text>
            )}

            {hasReviews ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="star" size={10} color={t.colors.textMuted} />
                <Text variant="mono" tone="muted" style={{ fontSize: 12 }}>
                  {vendor.rating.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>
      </Pressable>

      {/* The heart. No filled circle behind it — a white glyph with a soft
          shadow sits on any photograph, which is what the reference does, and
          it keeps the image clear. */}
      <Pressable
        accessibilityRole="button"
        // Name the vendor. "Save" twelve times down a list tells a screen-reader
        // user nothing about WHICH card the focus is on.
        accessibilityLabel={`${tr(isFav ? 'common.saved' : 'common.save')}: ${vendor.name}`}
        accessibilityState={{ selected: isFav }}
        hitSlop={12}
        onPress={() => {
          haptics.light();
          heart.pop();
          // Fire-and-forget: the store updates locally on this frame and
          // rolls itself back if the server rejects the change.
          void toggleFav(vendor.id);
        }}
        style={styles.heart}
      >
        <Animated.View style={heart.style}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={23}
            color={isFav ? t.colors.shaadi : t.colors.white}
            style={styles.heartGlyph}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  heart: { position: 'absolute', top: 10, right: 10, padding: 2 },
  // A drop shadow on the glyph itself, so a white heart survives a white dress.
  heartGlyph: {
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  compareTag: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
});
