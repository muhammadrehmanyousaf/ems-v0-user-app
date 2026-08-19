/**
 * S00 — Onboarding. Governed by rules.md §0.0.
 *
 * ── What was here ─────────────────────────────────────────────────────────
 *
 * A pastel `BridalWash` with a 108px beige circle, an outline icon inside it,
 * centred serif type — and then roughly 45% of a 360×800 screen of nothing
 * between the paragraph and the pager dots. It is the first thing a new
 * customer ever sees, and it read like a placeholder somebody meant to come
 * back to.
 *
 * ── Why this screen gets FULL-BLEED photography and auth does not ─────────
 *
 * `AuthShell` splits its screen: photography on top (aspiration), a white sheet
 * below (the work of typing your password). Onboarding has no work in it at
 * all — there is nothing to fill in, nothing to decide, one button. So there is
 * no sheet, and the photograph is the entire screen.
 *
 * That is the same rule applied honestly, not a different rule. It also means
 * onboarding and sign-in cannot be mistaken for each other despite sharing the
 * three bundled photographs, because their COMPOSITION differs rather than
 * their content.
 *
 * ── The numbering is real, not decoration ─────────────────────────────────
 *
 * rules.md is explicit that structural devices must encode something true.
 * `01 / 02 / 03` earns its place here because these three ARE a sequence — the
 * product's actual order of operations, discover → plan → connect — and the
 * number doubles as the progress indicator, which is why there are no dots
 * underneath doing the same job a second time.
 *
 * ── One image per page, drifting, no cross-fade ───────────────────────────
 *
 * `AuthScene` cross-fades because it is one surface showing three photographs
 * over time. Here each page IS a photograph and the swipe is the transition, so
 * a fade underneath it would be a second transition fighting the first.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import hallAisle from '@/assets/images/auth/hall-aisle.jpg';
import hallArches from '@/assets/images/auth/hall-arches.jpg';
import stageCandles from '@/assets/images/auth/stage-candles.jpg';
import { AuthButton } from '@/components/auth';
import { Text } from '@/components/ui';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { useOnboardingStore } from '@/store/onboarding';
import { alpha, colors, fontFamily, layout, palette, radius, spacing, typography } from '@/theme';

/** Module scope — stable identity, per the crash-class discipline in CLAUDE.md. */
const SLIDES: { photo: number; titleKey: StringKey; bodyKey: StringKey }[] = [
  // Aisle first: the widest, most "there is a lot here" image, for Discover.
  { photo: hallAisle, titleKey: 'onb.s1Title', bodyKey: 'onb.s1Body' },
  // Arches for Plan — order, symmetry, a room laid out.
  { photo: hallArches, titleKey: 'onb.s2Title', bodyKey: 'onb.s2Body' },
  // The only slide with a person on it, for Connect.
  { photo: stageCandles, titleKey: 'onb.s3Title', bodyKey: 'onb.s3Body' },
];

export default function Onboarding() {
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const { width: winW, height } = useWindowDimensions();
  /**
   * Measured, not assumed. `useWindowDimensions().width` is the WINDOW, which
   * is not always what this list is laid out in — a scrollbar, a split-screen
   * pane or a rounding difference leaves the page a few pixels narrower than
   * the snap interval, and the next photograph peeks down the edge of every
   * slide. Measuring the container makes the page width and the paging width
   * the same number by construction.
   */
  const [width, setWidth] = useState(winW);
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  /** One slow breathe shared by every page — see AuthScene on why a sequence
   *  rather than a looped 0→1, which snaps back visibly at this scale. */
  const [drift] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 15000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 15000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const finish = () => {
    markSeen();
    router.replace('/');
  };

  /**
   * Move AND record. `scrollToIndex` does not fire `onMomentumScrollEnd`, so
   * driving the index purely off that handler left it stuck at 0 when the
   * customer used the button: the rail still read "01" on the second slide, and
   * because `next()` computes `index + 1`, every further tap re-scrolled to
   * slide 1. The button advanced exactly once and then did nothing.
   */
  const goTo = (i: number) => {
    setIndex(i);
    listRef.current?.scrollToIndex({ index: i, animated: true });
  };

  const next = () => {
    if (index < SLIDES.length - 1) goTo(index + 1);
    else finish();
  };

  /**
   * Derives the page from the offset, and only writes state when the page
   * actually changes — so a swipe costs at most two renders across the whole
   * journey rather than one per frame. Wired to both `onScroll` and
   * `onMomentumScrollEnd`: the first is what works reliably on web, the second
   * is what settles the final position on a native fling.
   */
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
    if (i !== index && i >= 0 && i < SLIDES.length) setIndex(i);
  };

  const kenBurns = {
    transform: [
      { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [1.03, 1.12] }) },
    ],
  };

  const last = index === SLIDES.length - 1;
  /**
   * Space the type block must clear: the rail, the CTA and the safe area.
   *
   * Urdu gets more. Nastaliq's descenders hang well below the line box, so a
   * clearance that looks generous in Latin puts the tail of the last line
   * through the progress rail — which is exactly what it did.
   */
  const actionSpace = insets.bottom + (isUrdu ? 208 : 176);

  return (
    <View
      style={styles.root}
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
    >
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(s) => s.titleKey}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          // `overflow: hidden` is load-bearing. The Ken Burns wrapper scales to
          // 1.12, and a transformed box counts toward scrollable overflow 2014 so
          // without clipping, each page was ~12px wider than its own width, the
          // pager never landed square, and a sliver of the next photograph sat
          // down the right edge of every slide. AuthScene clips for the same reason.
          <View style={{ width, height, overflow: 'hidden' }}>
            <Animated.View style={[StyleSheet.absoluteFill, kenBurns]}>
              <Image
                source={item.photo}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
              />
            </Animated.View>

            {/* The same five-layer scrim stack as AuthScene, for the same
                reason: a flat wash turns a photograph into a GROUND, and
                without it the picture competes with the words on top of it. */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: alpha(palette.ink, 0.26) }]} />
            <LinearGradient
              colors={[alpha(palette.goldLight, 0.12), alpha(palette.goldLight, 0)]}
              style={[StyleSheet.absoluteFill, { height: height * 0.42 }]}
            />
            <LinearGradient
              colors={[alpha(palette.ink, 0.58), alpha(palette.ink, 0)]}
              style={styles.topScrim}
            />
            <LinearGradient
              colors={[alpha(palette.ink, 0.42), alpha(palette.ink, 0), alpha(palette.ink, 0.42)]}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                alpha(palette.ink, 0),
                alpha(palette.ink, 0.5),
                alpha(palette.ink, 0.86),
                alpha(palette.ink, 0.96),
              ]}
              locations={[0, 0.4, 0.8, 1]}
              style={[styles.bottomScrim, { height: height * 0.62 }]}
            />

            <View
              style={[
                styles.copy,
                { paddingBottom: actionSpace, alignItems: isUrdu ? 'flex-end' : 'flex-start' },
              ]}
            >
              <Text urdu={isUrdu} style={[styles.title, isUrdu ? styles.titleUr : styles.titleEn]}>
                {tr(item.titleKey)}
              </Text>
              <Text urdu={isUrdu} style={[styles.body, isUrdu ? styles.bodyUr : styles.bodyEn]}>
                {tr(item.bodyKey)}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Skip sits where the close button sits on auth, so the one control that
          gets you out of a screen is always in the same corner. */}
      <View style={[styles.skip, { top: insets.top + spacing.sm, [isUrdu ? 'left' : 'right']: layout.gutter }]}>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={finish} style={styles.skipHit}>
          <Text urdu={isUrdu} style={styles.skipText}>
            {tr('onb.skip')}
          </Text>
        </Pressable>
      </View>

      {/* Fixed: the pages move underneath it. A CTA that slides away with the
          content is a CTA the customer has to chase. */}
      <View
        style={[
          styles.action,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        pointerEvents="box-none"
      >
        <View style={[styles.rail, isUrdu ? { flexDirection: 'row-reverse' } : null]}>
          {SLIDES.map((s, i) => (
            <View key={s.titleKey} style={styles.railCell}>
              <View
                style={[
                  styles.railBar,
                  { backgroundColor: i <= index ? colors.gold : alpha(palette.onDark, 0.28) },
                ]}
              />
              <Text style={[styles.railNum, { color: i === index ? palette.goldLight : alpha(palette.onDark, 0.5) }]}>
                {`0${i + 1}`}
              </Text>
            </View>
          ))}
        </View>

        <AuthButton
          label={last ? tr('onb.getStarted') : tr('onb.next')}
          onPress={next}
          urdu={isUrdu}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.inkSurface },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  bottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  copy: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.gutter,
  },
  title: { color: colors.onDark, maxWidth: 320 },
  titleEn: typography.hero,
  // 30, not 40 — Nastaliq sets far taller than Latin at the same nominal size.
  titleUr: { fontSize: 30, textAlign: 'right' },
  body: { color: alpha(palette.onDark, 0.8), marginTop: spacing.lg, maxWidth: 330 },
  bodyEn: { ...typography.body, fontSize: 15.5, lineHeight: 24 },
  bodyUr: { fontSize: 14.5, textAlign: 'right' },

  skip: { position: 'absolute', zIndex: 3 },
  skipHit: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(palette.ink, 0.38),
    borderWidth: 1,
    borderColor: alpha(palette.onDark, 0.24),
  },
  skipText: { fontFamily: fontFamily.bodySemibold, fontSize: 14, color: colors.onDark },

  action: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    bottom: 0,
    gap: spacing.xl,
  },
  rail: { flexDirection: 'row', gap: spacing.md },
  railCell: { flex: 1, gap: 7 },
  railBar: { height: 2.5, borderRadius: 2 },
  railNum: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
