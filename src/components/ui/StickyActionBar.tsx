/**
 * StickyActionBar — the docked action row: up to three round secondary buttons
 * plus the one primary CTA. Redrawn on v4.
 *
 * Why it exists as a primitive: this is where the system's "one gold event per
 * screen" rule is enforced. The gold fill lives here and nowhere else, so
 * anything that wants to be the main action on a screen has to come through this
 * component, and a screen physically cannot grow two competing primary buttons.
 *
 * Safe-area handling is the other reason. On a gesture-nav Android or any iPhone,
 * a bar pinned to `bottom: 0` puts its tap targets under the home indicator. The
 * bottom inset is added to the padding, never to the height, so the bar's visible
 * proportions stay identical across devices.
 *
 * ── What v4 changed ───────────────────────────────────────────────────────
 *
 * Three things, all of them the same mistake: the bar was trying to prove it was
 * important by adding material.
 *
 * · **The gradient is gone.** `gradients.goldCta` is deprecated and now resolves
 *   to two identical stops — a flat fill wearing a `LinearGradient`'s cost. A
 *   sheen on a solid colour reads as plastic, which is the opposite of what gold
 *   is doing here. `colors.primary`, one value, no layer.
 * · **The glow is gone.** `elevation.glow` was the champagne bloom, retired in
 *   v4 and now aliased to the overlay shadow, so the CTA was casting a 26px
 *   drop shadow the system no longer sanctions.
 * · **The bar's own shadow is gone.** It sits on the screen edge with a hairline
 *   above it. A shadow under a bar that is already flush with the bottom of the
 *   display has nothing to cast onto.
 *
 * What replaces all three is size. The CTA grows 46 → 54, which is what actually
 * makes it read as the thing to press — and, unlike a glow, it is also a bigger
 * tap target.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics, usePressScale, useTheme } from '@/theme';

import { Text } from './Text';

export interface SecondaryAction {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  tint?: string;
  /** In flight — chat has to create the conversation before it can navigate,
   *  which is a real round trip, and a button that looks idle during it gets
   *  tapped three times and opens three threads. */
  busy?: boolean;
}

export interface StickyActionBarProps {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryIcon?: keyof typeof Ionicons.glyphMap;
  /** Trailing text inside the CTA — a price, a count. */
  primaryMeta?: string;
  secondary?: SecondaryAction[];
  urdu?: boolean;
}

/** The CTA. 54 gives the type room and clears 44 by a comfortable margin. */
const CTA_HEIGHT = 54;
/**
 * 48, deliberately NOT square with the 54px CTA.
 *
 * Squaring them looked better in isolation and was wrong on the device. At
 * 360px the row has 328px of content width; three rounds at 54 plus two 8px
 * gaps leaves the CTA 142px, and "Request booking · Rs 480,000" stacked inside
 * 142px runs the label into the edge. At 48 the CTA gets 160px and the label
 * breathes. 48 still clears the 44px tap-target floor with room to spare.
 *
 * The lesson is the one this project keeps relearning: the constrained element
 * is the CTA, so every pixel given to a secondary control is taken from the
 * primary one.
 */
const ROUND_SIZE = 48;

export function StickyActionBar({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
  primaryLoading,
  primaryIcon,
  primaryMeta,
  secondary = [],
  urdu,
}: StickyActionBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);
  const disabled = primaryDisabled || primaryLoading;

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        // The bar mirrors in Urdu with everything else: the CTA belongs where
        // the thumb finishes reading, and in Urdu that is the left.
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: t.spacing.sm,
        paddingHorizontal: t.spacing.lg,
        paddingTop: t.spacing.md,
        paddingBottom: t.spacing.md + insets.bottom,
        backgroundColor: t.colors.surface,
        // The hairline IS the separation. No shadow — see the header note.
        borderTopWidth: t.layout.hairline,
        borderTopColor: t.colors.border,
      }}
    >
      {/*
        3, not 2. The cap was silently dropping any third action — adding Chat
        in front of WhatsApp and Call would have removed Call from the bar with
        no error and no visible sign, which is the worst kind of layout bug:
        a feature that is wired, tested and simply never rendered.
      */}
      {secondary.slice(0, 3).map((a) => (
        <Pressable
          key={a.accessibilityLabel}
          accessibilityRole="button"
          accessibilityLabel={a.accessibilityLabel}
          disabled={a.busy}
          onPress={() => {
            if (a.busy) return;
            haptics.light();
            a.onPress();
          }}
          style={({ pressed }) => ({
            width: ROUND_SIZE,
            height: ROUND_SIZE,
            borderRadius: t.radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            // Hairline, not `borderStrong`. Three heavy rings beside a gold
            // fill is four things competing; the ring only has to say
            // "this is a control", and a hairline says it.
            borderWidth: t.layout.hairline,
            borderColor: t.colors.border,
            backgroundColor: pressed ? t.colors.sunken : t.colors.card,
            opacity: a.busy ? 0.55 : 1,
          })}
        >
          {a.busy ? (
            <ActivityIndicator size="small" color={t.colors.textMuted} />
          ) : (
            <Ionicons name={a.icon} size={21} color={a.tint ?? t.colors.textPrimary} />
          )}
        </Pressable>
      ))}

      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !!disabled, busy: !!primaryLoading }}
          disabled={disabled}
          onPress={() => {
            haptics.medium();
            onPrimaryPress();
          }}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={{
            height: CTA_HEIGHT,
            borderRadius: t.radius.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.spacing.sm,
            // Flat gold. One value, no gradient layer.
            backgroundColor: t.colors.primary,
            // Disabled goes to the sunken well rather than a translucent gold:
            // gold at 0.55 on paper is a washed mustard, and it still reads as
            // the primary action while refusing to work.
            ...(disabled
              ? { backgroundColor: t.colors.disabledFill }
              : null),
          }}
        >
          {primaryLoading ? (
            <ActivityIndicator size="small" color={t.colors.textMuted} />
          ) : (
            <>
              {primaryIcon ? (
                <Ionicons
                  name={primaryIcon}
                  size={17}
                  color={disabled ? t.colors.textFaint : t.colors.onPrimary}
                />
              ) : null}
              {/*
                Label and price STACK rather than sit side by side.
                With two secondary rounds the CTA is ~160px wide at 360px, and
                "Request booking · Rs 350,000" on one line truncated to
                "Request booki… · Rs 350,000" with the price wrapping under it.
                Stacked, both read in full and the price gets its own emphasis —
                which is what the customer is actually deciding on.
              */}
              <View style={{ alignItems: 'center' }}>
                <Text
                  variant="button"
                  tone={disabled ? 'faint' : 'onGold'}
                  urdu={urdu}
                  numberOfLines={1}
                  style={primaryMeta ? { fontSize: 14, lineHeight: 18 } : undefined}
                >
                  {primaryLabel}
                </Text>
                {primaryMeta ? (
                  // Never `urdu` — this is always a figure, and Nastaliq
                  // digits inside a Latin-set button read as a rendering fault.
                  <Text
                    variant="mono"
                    tone={disabled ? 'faint' : 'onGold'}
                    numberOfLines={1}
                    style={{ fontSize: 12, lineHeight: 14, opacity: 0.86 }}
                  >
                    {primaryMeta}
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
