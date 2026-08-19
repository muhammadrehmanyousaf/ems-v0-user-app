/**
 * MonogramFallback — what a vendor looks like when they have no usable photo.
 *
 * This is not an edge case. ~98% of listings are unclaimed OSM imports, and of
 * the claimed ones the galleries contain platform ads and unrelated stock. So
 * "no usable image" is the COMMON path — this is very likely the single
 * most-rendered surface in the app — and it has to look deliberate rather than
 * broken.
 *
 * The answer is the brand's own signature: the vendor's initial set in Fraunces
 * italic inside the Mehrab arch. It reads as a monogram — a printed invitation —
 * instead of a missing-image placeholder.
 *
 * ── It was painted with a gradient v4 deleted ─────────────────────────────
 *
 * `gradients.roseWash` carries `@deprecated use space and a hairline`, and the
 * gradient block explains why: *"On a paper ground a tinted band is exactly the
 * kind of soft furnishing this system removes."* Which means the most-seen
 * surface in the product was still wearing the v3 dress. It is a flat `sunken`
 * ground now — one step off paper, which is all the separation an image slot
 * needs when it already has the arch.
 *
 * ── The initial was in ACTION gold ────────────────────────────────────────
 *
 * `colors.gold` is the gold that means "press this". On an Explore grid where
 * most cards have no photo, that put fifteen or twenty action-gold letters on a
 * screen whose single gold event is supposed to be the CTA. `goldScale.hairline`
 * is the decorative gold — the same value already drawing the arch around it —
 * so the monogram now reads as part of the frame rather than competing with it.
 *
 * ── And a screen reader read it out ───────────────────────────────────────
 *
 * The letter is the vendor's initial, which the card announces in full one line
 * below. VoiceOver reached "K" and then "Kasr-e-Noor Studio". It is decoration
 * and is hidden from the accessibility tree, so the card announces its name once.
 */
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { goldScale, useTheme } from '@/theme';

import { ArchOutline } from './ArchImage';

export interface MonogramFallbackProps {
  /** The vendor name — only its first character is used. */
  name?: string | null;
  /** Font size for the initial. Scale it to the box. */
  size?: number;
  /** Draw the gold arch outline. Off inside an already-arched container. */
  arch?: boolean;
  style?: ViewStyle;
}

export function MonogramFallback({ name, size = 46, arch, style }: MonogramFallbackProps) {
  const t = useTheme();
  // ♥ rather than "?" when there is no name at all: a question mark reads as an
  // error, a heart reads as a placeholder in a wedding product.
  const initial = (name?.trim()?.[0] ?? '♥').toUpperCase();

  return (
    <View
      // Decoration. The vendor's name is announced by the card around this.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, { backgroundColor: t.colors.sunken }, style]}
    >
      {arch ? (
        <ArchOutline
          width={size * 1.5}
          height={size * 1.9}
          color={goldScale.hairline}
          strokeWidth={1.25}
          // `position: 'absolute'` WITHOUT insets, so the parent's centring
          // still applies. It was `StyleSheet.absoluteFill`, which pins all four
          // edges to 0 — and with an explicit width/height also set, the arch
          // was laid out from the top-left corner instead of the middle, so it
          // sat high and its base line cut across the tile.
          style={{ position: 'absolute' }}
        />
      ) : null}
      {/*
        `urdu={false}` is deliberate and is the one place in the app that opts
        out of script detection. An Urdu-named vendor — five of the first twelve
        wedding venues in production — yields a single Nastaliq letter, and
        Nastaliq is cursive: taking `name[0]` gives that letter's ISOLATED form,
        which is not the shape it has inside the name. A monogram is a Latin
        typographic device; here it stays Fraunces, and the vendor's real name is
        set correctly in Nastaliq on the line beneath.
      */}
      <Text
        variant="hero"
        italic
        urdu={false}
        style={{ fontSize: size, color: goldScale.hairline }}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
