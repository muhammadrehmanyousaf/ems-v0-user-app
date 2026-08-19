/**
 * AuthShell — the chrome both auth screens are built on.
 *
 * Governed by rules.md §0.0, and specifically rule 6: the component is redrawn
 * in the library first, then screens consume it. Sign-in and register are the
 * same object with different contents; if they were two hand-built screens they
 * would drift within a week, and a customer who bounces between them would see
 * two products.
 *
 * ── The composition ───────────────────────────────────────────────────────
 *
 *   ┌────────────────────────────────┐
 *   │ (×)                      اردو  │  glass controls, fixed, never scroll
 *   │                                │
 *   │   photography, drifting        │  AuthScene — fixed behind the scroll
 *   │                                │
 *   │   WEDDING WALA                 │  overline, gold, 2.6 tracking
 *   │   Welcome back.                │  Fraunces 40/42, ivory
 *   │   your shortlist and dates…    │  the promise, one line
 *   ├────────────────────────────╮   │
 *   │ ╭──────────────────────────┴───┤  the sheet: white, r30, overlapping
 *   │ │  the form                    │
 *   │ ╰──────────────────────────────┤
 *   └────────────────────────────────┘
 *
 * ── Why the sheet, and why it overlaps ────────────────────────────────────
 *
 * A white sheet with a large radius lifting off a dark photograph is the single
 * most reliable "this is a real product" signal in mobile design, and it is
 * doing real work here, not decoration: it separates the ROMANCE (photography,
 * display type, the reason you are here) from the WORK (typing your password)
 * without a hard edge between them. Everything above the sheet is aspiration.
 * Everything on it is a task.
 *
 * The 30px overlap matters. Flush, the sheet reads as the next section of the
 * page. Overlapping, it reads as an object resting ON the photograph — which is
 * also why its shadow is cast UPWARD (`height: -10`) rather than using the
 * `elevation.lg` token. A sheet that rises from the bottom and casts its shadow
 * downward is lit from underneath, and the eye notices even when it cannot say
 * why.
 *
 * ── Why the hero block scrolls but the photograph does not ────────────────
 *
 * `AuthScene` sits outside the ScrollView; the headline sits inside it. So
 * dragging the form up slides the words off the picture while the picture holds
 * still. That is free parallax — no scroll listener, no worklet, no measurement
 * — and it is what makes the register screen work at all: five fields plus a
 * keyboard needs every pixel, and the headline has to be able to leave.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthScene, GlassButton } from '@/components/auth/AuthScene';
import { Text } from '@/components/ui';
import { translate } from '@/i18n/strings';
import { useLocaleStore } from '@/store/locale';
import { alpha, colors, fontFamily, haptics, layout, palette, radius, spacing } from '@/theme';

/** How far the sheet climbs onto the photograph. */
const OVERLAP = 30;

export interface AuthShellProps {
  overline: string;
  headline: string;
  sub: string;
  /** Which photograph opens the screen. */
  scene?: number;
  /** Share of the screen given to photography. Sign-in can afford more of it
   *  than register, which has three more fields to find room for. */
  heroRatio?: number;
  urdu: boolean;
  children: ReactNode;
}

export function AuthShell({
  overline,
  headline,
  sub,
  scene = 0,
  heroRatio = 0.54,
  urdu,
  children,
}: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const heroH = Math.round(screenH * heroRatio);

  /**
   * The entrance. Headline first, sheet 140ms behind it.
   *
   * Not decoration. A screen that is simply *there* on the first frame reads as
   * a document; one that assembles reads as an application. The stagger is what
   * carries the meaning — the words arrive, and then the thing you have to do
   * arrives — and 140ms is the smallest gap at which the eye registers an order
   * rather than a single move.
   *
   * Opacity and transform only, so both run on the native driver and neither
   * touches the JS thread while Metro is still settling on a cold start.
   */
  const [heroIn] = useState(() => new Animated.Value(0));
  const [sheetIn] = useState(() => new Animated.Value(0));

  /**
   * The hero dissolves as the sheet rises over it.
   *
   * Without this the headline scrolls straight under the fixed close button and
   * the two collide — on register, "Create your account" ends up with an × through
   * the C. Capping the scroll is not an option (the form has to reach the CTA),
   * and moving the chrome would leave it floating in the middle of a photograph.
   *
   * Fading is also the honest reading of the gesture: pulling the form up is
   * saying "I am done looking, let me type", so the looking half should go.
   * Native-driven — `contentOffset.y` into an opacity is one of the few scroll
   * effects that never touches the JS thread.
   */
  const [scrollY] = useState(() => new Animated.Value(0));
  const heroFade = Animated.multiply(
    heroIn,
    scrollY.interpolate({
      inputRange: [0, Math.max(1, heroH * 0.45)],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
  );

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(heroIn, {
        toValue: 1,
        duration: 700,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetIn, {
        toValue: 1,
        duration: 700,
        delay: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [heroIn, sheetIn]);

  const close = () => {
    // Guarded. `router.back()` alone strands anyone who arrived from a deep
    // link or a cold launch — nothing on the stack, so the tap does nothing.
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={styles.root}>
      <AuthScene height={heroH} start={scene} />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          contentContainerStyle={styles.scroll}
        >
          {/* Everything here rides over the fixed photograph. */}
          <Animated.View
            style={[
              styles.hero,
              { height: heroH, paddingBottom: OVERLAP + spacing.xxl, alignItems: urdu ? 'flex-end' : 'flex-start' },
              {
                opacity: heroFade,
                transform: [
                  { translateY: heroIn.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                ],
              },
            ]}
          >
            {/* Every size here is set per-script. Nastaliq has no uppercase and
                no tracking to give, and it needs ~1.7× leading to be legible at
                all — so the Latin scale applied to Urdu produces a headline
                with its descenders sheared off. `Text` supplies the family and
                the leading when we simply decline to override them. */}
            {/*
              The EN/UR size fork below stays — it is correct, and the note above
              says why. What is added is `variant`: without it these fell through
              to the default body variant, so Urdu could never reach the BOLD
              Nastaliq face and the hero headline set at the same weight as the
              sentence under it. The `*Ur` styles still win on size and
              alignment; only the family and leading come from the variant.
            */}
            <View style={styles.heroInner}>
              <Text
                variant="overline"
                urdu={urdu}
                style={[styles.overline, urdu ? styles.overlineUr : styles.overlineEn]}
              >
                {overline}
              </Text>
              <Text
                variant="hero"
                urdu={urdu}
                style={[styles.headline, urdu ? styles.headlineUr : styles.headlineEn]}
              >
                {headline}
              </Text>
              <Text
                variant="body"
                urdu={urdu}
                style={[styles.sub, urdu ? styles.subUr : styles.subEn]}
              >
                {sub}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.xxl },
              {
                opacity: sheetIn,
                transform: [
                  { translateY: sheetIn.interpolate({ inputRange: [0, 1], outputRange: [46, 0] }) },
                ],
              },
            ]}
          >
            <View style={styles.sheetInner}>{children}</View>
          </Animated.View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Last in the tree, so it floats above both the scene and the scroll. */}
      <View
        style={[
          styles.chrome,
          { top: insets.top + spacing.sm, flexDirection: urdu ? 'row-reverse' : 'row' },
        ]}
      >
        <GlassButton accessibilityLabel={translate('common.close', locale)} onPress={close}>
          <Ionicons name="close" size={22} color={colors.onDark} />
        </GlassButton>
        <GlassButton
          wide
          accessibilityLabel={locale === 'ur' ? 'Switch to English' : 'اردو میں دیکھیں'}
          onPress={() => {
            haptics.selection();
            setLocale(locale === 'ur' ? 'en' : 'ur');
          }}
        >
          <Text
            urdu={locale !== 'ur'}
            style={{
              color: colors.onDark,
              fontSize: locale === 'ur' ? 13 : 15,
              letterSpacing: locale === 'ur' ? 1.2 : 0,
              fontFamily: locale === 'ur' ? fontFamily.uiSemibold : fontFamily.urdu,
            }}
          >
            {locale === 'ur' ? 'ENGLISH' : 'اردو'}
          </Text>
        </GlassButton>
      </View>
    </View>
  );
}

/**
 * The one action on the screen.
 *
 * 16px radius, not a pill. A pill CTA reads consumer-friendly; a considered
 * radius that MATCHES the fields above it reads as one designed object, which
 * is the register this screen is trying to hold. It is also the only saturated
 * surface on the sheet — rules.md §0.0 rule 4, one colour event.
 */
export function AuthButton({
  label,
  onPress,
  loading,
  disabled,
  urdu,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  urdu?: boolean;
  /**
   * `secondary` exists because rules.md §0.0 rule 4 allows ONE colour event per
   * screen. Profile has two actions — save your details, change your password —
   * and two identical gold slabs both claim to be the reason you are on the
   * screen. A bordered second action ranks them correctly and keeps the gold
   * meaning something.
   */
  variant?: 'primary' | 'secondary';
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const spring = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      speed: 40,
      bounciness: 4,
      useNativeDriver: true,
    }).start();

  const dead = disabled || loading;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!dead, busy: !!loading }}
        accessibilityLabel={label}
        disabled={dead}
        onPressIn={() => spring(0.978)}
        onPressOut={() => spring(1)}
        onPress={onPress}
        style={[
          styles.cta,
          variant === 'secondary' ? styles.ctaSecondary : null,
          dead ? styles.ctaDead : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.textPrimary} />
        ) : (
          <Text
            // `variant="button"` rather than spreading `typography.button` into
            // `styles.ctaLabel`. Going through the variant is what lets `Text`
            // pick the Urdu BOLD face — a stylesheet can only ever name one
            // family, so the Urdu CTA came out regular while its English twin
            // was semibold. Weight is half of how v4 carries hierarchy.
            variant="button"
            urdu={urdu}
            style={[
              styles.ctaLabel,
              variant === 'secondary' ? { color: colors.textPrimary } : null,
              dead ? { color: colors.textFaint } : null,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** The quiet way out — "New here? Create account". */
export function AuthSwitch({
  prompt,
  action,
  onPress,
  urdu,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
  urdu?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${prompt} ${action}`}
      hitSlop={10}
      onPress={onPress}
      style={[styles.switch, urdu ? { flexDirection: 'row-reverse' } : null]}
    >
      <Text variant="body" tone="muted" urdu={urdu}>
        {prompt}
      </Text>
      <Text variant="body" urdu={urdu} style={styles.switchAction}>
        {action}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card },
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  chrome: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hero: { justifyContent: 'flex-end', paddingHorizontal: layout.gutter },
  heroInner: { width: '100%', maxWidth: layout.maxContentWidth },
  overline: { color: palette.goldLight, marginBottom: spacing.md },
  // Only the tracking override remains — `variant="overline"` supplies the rest.
  overlineEn: { letterSpacing: 2.6 },
  overlineUr: { fontSize: 13, textAlign: 'right' },

  headline: { color: colors.onDark },
  // Empty: `variant="hero"` is the whole of the English headline now.
  headlineEn: {},
  // 30, not 40. Nastaliq sets far taller than Latin at the same nominal size
  // and a 40px hero overflows two lines into the sheet.
  headlineUr: { fontSize: 30, textAlign: 'right' },

  sub: { color: alpha(palette.onDark, 0.76), marginTop: spacing.md, maxWidth: 330 },
  subEn: { fontSize: 15.5, lineHeight: 23 },
  subUr: { fontSize: 14.5, textAlign: 'right' },
  sheet: {
    flexGrow: 1,
    marginTop: -OVERLAP,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xxl + 2,
    borderTopRightRadius: radius.xxl + 2,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xl,
    alignItems: 'center',
    // The gold hairline along the top edge. It is the brand's signature line
    // (rules.md §0.0 — "the Mehrab, the gold hairline") and it is the one
    // thing that keeps the sheet from reading as a plain white block butted
    // against a photograph. One pixel, and the join stops looking accidental.
    borderTopWidth: layout.hairline,
    borderTopColor: colors.goldLine,
    // Cast UPWARD. The sheet rises from the bottom, so its light comes from
    // above; `elevation.lg` offsets +10 and lights it from beneath.
    shadowColor: palette.ink,
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -10 },
    elevation: 16,
  },
  sheetInner: { width: '100%', maxWidth: layout.maxContentWidth },
  cta: {
    height: 58,
    borderRadius: radius.md + 2,
    backgroundColor: colors.gold,
    // A gold fill on white paper has no edge of its own — it dissolves into
    // the sheet at the corners. The `goldDeep` rim gives it one, and reads as
    // depth rather than as a border.
    borderWidth: 1,
    borderColor: colors.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondary: { backgroundColor: 'transparent', borderColor: colors.borderStrong },
  ctaDead: { backgroundColor: colors.sunken, borderColor: colors.border },
  ctaLabel: {
    // NO `...typography.button` — the variant supplies the family now, and
    // spreading it here is exactly what overwrote the Nastaliq face.
    fontSize: 16,
    letterSpacing: 0.2,
    color: colors.onPrimary,
  },
  switch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  switchAction: {
    color: colors.goldDark,
    fontFamily: fontFamily.bodySemibold,
  },
});
