/**
 * AuthScene — the photographic ground the auth screens stand on.
 *
 * Governed by rules.md §0.0.
 *
 * ── Why photography, and why this is the whole point ──────────────────────
 *
 * Two auth designs were rejected before this one, and both failed for the same
 * reason: they were drawn, not shot. A pastel radial wash reads as a greetings
 * card. A flat deep-ink panel with a vector arch on it reads as a template —
 * competent, generic, forgettable. No amount of type craft rescues either,
 * because the problem is not the composition, it is the MATERIAL.
 *
 * Every app that feels expensive on first launch opens on real imagery with
 * real depth: Airbnb, Booking, Netflix, Uber. A gradient cannot fake the
 * falloff of light down a hall or the bokeh of a chandelier at f/1.8. This
 * screen is the first thing a customer sees and the moment we ask them to hand
 * something over, so it gets the best material we have.
 *
 * ── What it does ──────────────────────────────────────────────────────────
 *
 * Three bundled photographs cross-fade on a slow cycle, under a continuous
 * Ken Burns drift. Both animations run on the native driver (opacity and
 * transform only), so the JS thread stays free for the form — which matters,
 * because the keyboard is about to open on top of this.
 *
 * ── The cross-fade has a flash bug in it if you write it the obvious way ──
 *
 * Two layers, back and front. The obvious implementation swaps the image in a
 * slot and resets opacity in the same commit, and there is always one frame
 * where the two disagree — either the previous photograph reappears for 16 ms
 * or the next one snaps in at full opacity. It looks like a glitch, and on a
 * launch screen a glitch is expensive.
 *
 * The fix is to only ever mutate a layer while it is unobservable:
 *
 *   1. `front` takes the next photograph **while its opacity is 0** — invisible.
 *   2. `fade` animates 0 → 1. This is the actual cross-fade.
 *   3. `back` takes the same photograph **while front covers it at opacity 1** —
 *      invisible.
 *   4. Only once `back === front` — both layers holding the same image, so
 *      opacity cannot be observed at all — does `fade` reset to 0.
 *
 * Each step is separated by a commit, which is why they are three effects and
 * not one function. Collapsing them reintroduces the flash.
 *
 * ── The scrim stack ───────────────────────────────────────────────────────
 *
 * Five layers over the photograph, and each one has a job:
 *
 *   wash      a flat darkening pass. This is what turns a photograph into a
 *             GROUND — without it the image competes with the interface
 *             instead of supporting it, which is the difference between
 *             "designed" and "wallpaper".
 *   warmth    a whisper of gold at the top, so the deep register reads warm
 *             rather than grey.
 *   top       status-bar and glass-control legibility.
 *   vignette  darkened left and right edges. Holds the eye centre-screen.
 *   bottom    the tall one — carries the headline and melts into the sheet.
 *
 * They are cheap: five GPU quads, no blur, no shader, nothing that costs
 * anything on the mid-range Android this app is built for.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import hallAisle from '@/assets/images/auth/hall-aisle.jpg';
import hallArches from '@/assets/images/auth/hall-arches.jpg';
import stageCandles from '@/assets/images/auth/stage-candles.jpg';
import { alpha, elevation, palette, radius } from '@/theme';

/**
 * Module scope, so the array identity never changes across renders. The same
 * discipline as `ROOT_STACK_OPTIONS` in the root layout, and for the same
 * reason — see CLAUDE.md on the New Architecture crash class.
 */
const SCENES = [hallArches, hallAisle, stageCandles];

/** How long a photograph holds before the next one begins to arrive. */
const HOLD = 5400;
/** The cross-fade itself. Slow enough to read as a dissolve, not a cut. */
const FADE = 1800;
/** One direction of the drift. Fourteen seconds each way is below the
 *  threshold where the eye reads it as motion — it just feels alive. */
const DRIFT = 14000;

export interface AuthSceneProps {
  /** Height of the photographic band. The scrim scales off this. */
  height: number;
  /** Which photograph opens the screen. Lets sign-in and register differ
   *  without shipping six images instead of three. */
  start?: number;
}

export function AuthScene({ height, start = 0 }: AuthSceneProps) {
  const first = ((start % SCENES.length) + SCENES.length) % SCENES.length;
  const [back, setBack] = useState(first);
  const [front, setFront] = useState(first);
  // State initialisers rather than `useRef(…).current`: the project lints ref
  // reads during render, and this file renders off both values.
  const [fade] = useState(() => new Animated.Value(0));
  const [drift] = useState(() => new Animated.Value(0));

  /** Step 4 — see the header. The ONLY safe moment to reset opacity is when
   *  both layers hold the same photograph, because then it cannot be seen. */
  useEffect(() => {
    if (back === front) fade.setValue(0);
  }, [back, front, fade]);

  /** Step 1 — hand the next photograph to the front layer while it is at
   *  opacity 0, where swapping the source is invisible. */
  useEffect(() => {
    if (SCENES.length < 2) return undefined;
    const timer = setTimeout(() => setFront((back + 1) % SCENES.length), HOLD);
    return () => clearTimeout(timer);
  }, [back]);

  /** Steps 2 and 3 — the dissolve, then let the back layer catch up beneath
   *  a front layer that is now fully opaque. */
  useEffect(() => {
    if (front === back) return undefined;
    const anim = Animated.timing(fade, {
      toValue: 1,
      duration: FADE,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) setBack(front);
    });
    return () => anim.stop();
  }, [front, back, fade]);

  /** The drift. A sequence rather than a reset, because a looped 0 → 1 timing
   *  snaps back to the start and the jump is very visible at this scale. */
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: DRIFT,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: DRIFT,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const kenBurns = {
    transform: [
      { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.13] }) },
      { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [6, -14] }) },
    ],
  };

  return (
    <View style={[styles.root, { height }]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, kenBurns]}>
        <Image
          source={SCENES[back]}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <Image
            source={SCENES[front]}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
          />
        </Animated.View>
      </Animated.View>

      {/* wash — turns a photograph into a ground */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: alpha(palette.ink, 0.24) }]} />

      {/* warmth */}
      <LinearGradient
        colors={[alpha(palette.goldLight, 0.13), alpha(palette.goldLight, 0)]}
        style={[StyleSheet.absoluteFill, { height: height * 0.5 }]}
        pointerEvents="none"
      />

      {/* top — status bar and the glass controls */}
      <LinearGradient
        colors={[alpha(palette.ink, 0.6), alpha(palette.ink, 0)]}
        style={styles.top}
        pointerEvents="none"
      />

      {/* vignette */}
      <LinearGradient
        colors={[alpha(palette.ink, 0.4), alpha(palette.ink, 0), alpha(palette.ink, 0.4)]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* bottom — carries the headline, melts into the sheet */}
      <LinearGradient
        colors={[
          alpha(palette.ink, 0),
          alpha(palette.ink, 0.26),
          alpha(palette.ink, 0.64),
          alpha(palette.ink, 0.86),
        ]}
        locations={[0, 0.40, 0.78, 1]}
        // 0.56, not 0.66. At two-thirds the scrim swallowed the lower half of
        // the colonnade and the photograph became a black band with type on it —
        // which is the flat panel this revamp exists to get away from.
        style={[styles.bottom, { height: height * 0.56 }]}
        pointerEvents="none"
      />
    </View>
  );
}

/**
 * A control floating on photography.
 *
 * Dark glass, not white. White circles on a dark photograph are the default
 * everyone reaches for and they punch holes in the image; a dark fill with a
 * light hairline sits INSIDE the picture and still clears 4.5:1 for the icon.
 */
export function GlassButton({
  onPress,
  accessibilityLabel,
  children,
  wide,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  /** Pill rather than circle — for a text control like the language switch. */
  wide?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.glass,
        wide ? styles.glassWide : null,
        pressed ? { opacity: 0.7 } : null,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: palette.inkSurface,
  },
  top: { position: 'absolute', top: 0, left: 0, right: 0, height: 190 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  glass: {
    height: 44,
    minWidth: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(palette.ink, 0.38),
    borderWidth: 1,
    borderColor: alpha(palette.onDark, 0.24),
    ...elevation.none,
  },
  glassWide: { paddingHorizontal: 16 },
});
