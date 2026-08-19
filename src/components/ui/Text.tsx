/**
 * Text — the single typography primitive. Every string in the app renders
 * through this so the type scale + ink tokens stay consistent.
 *
 * ── Urdu could not be bold. At all. Anywhere. ─────────────────────────────
 *
 * `family` short-circuited to `fontFamily.urdu` the moment Urdu was detected,
 * before `weight` or the variant's own family were ever consulted. So
 * `<Text variant="h1">` and `<Text variant="caption">` resolved to the SAME
 * face in Urdu, and `<Text weight="bold" urdu>` silently rendered regular.
 *
 * That is not a cosmetic loss. v4's whole premise (rules §0.0) is that **type
 * carries the hierarchy** now that the boxes are gone — and weight is half of
 * that mechanism. Size still varied, so the damage was invisible in a
 * screenshot; what an Urdu customer actually got was a screen where a heading
 * and the paragraph under it were distinguished by size alone, on a script whose
 * size differences read far more softly than Latin's do.
 *
 * Meanwhile `NotoNastaliqUrdu_700Bold` was loaded in `fonts.ts` and referenced
 * by nothing: **518 KB of a font shipped in every install that no code path
 * could select.** The bold face was there the whole time.
 *
 * ── Nothing in this app had a font-scaling policy ─────────────────────────
 *
 * `allowFontScaling` defaults to true and no file in `src/` set it or
 * `maxFontSizeMultiplier`. A customer running Android/iOS display text at 130%
 * scaled every string — including labels living inside hard-coded 48px buttons,
 * 26px chips and the floating tab dock — with no ceiling, which clips them.
 *
 * Turning scaling OFF is the wrong fix and is not what this does: someone who
 * needs larger text needs it most on a booking confirmation. The ceiling is
 * per-variant instead, and it is set by WHERE a variant lives, not by its size:
 * reading text scales freely, text inside fixed-height chrome is capped, and the
 * display sizes are capped tighter because 40px × 1.6 wraps a screen title to
 * four lines before it helps anyone. A caller can still override per instance.
 */
import {
  StyleSheet,
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme';

/**
 * Arabic + Arabic-Supplement + Arabic-Extended-A + Presentation Forms.
 *
 * ── Why this is here and not in the i18n layer ────────────────────────────
 *
 * The locale toggle only tells us what language the INTERFACE is in. It says
 * nothing about the language of the DATA — and a great deal of Wedding Wala's
 * data is Urdu regardless of who is reading it. On production page 1 of wedding
 * venues, five of twelve businesses are named in Urdu script: ماڈرن مارکی,
 * قصر نور میرج ہال, سفینہ میرج ہال, ایمان مارکی.
 *
 * Rendered through the English path those names get Plus Jakarta Sans, which has
 * no Arabic glyphs at all — so the platform silently substitutes whatever system
 * font it can find, at a Latin line height. The name of a real business appears
 * in a font nobody chose, with clipped descenders. Detecting the script means an
 * Urdu-named vendor is set in Nastaliq for an English-speaking user too, which is
 * simply correct: it is the vendor's name, not a translated string.
 */
const URDU_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** True when a leaf child is a string carrying Urdu/Arabic script. */
function looksUrdu(children: unknown): boolean {
  if (typeof children === 'string') return URDU_SCRIPT.test(children);
  if (Array.isArray(children)) return children.some(looksUrdu);
  return false;
}

/**
 * How far a variant may grow under the OS text-size setting.
 *
 * `undefined` means uncapped — that is the DEFAULT and it covers everything a
 * person reads at length. Only variants that sit inside a fixed-height box get
 * a number, because that box is what breaks.
 */
const MAX_SCALE: Partial<Record<TypographyVariant, number>> = {
  // Inside 48px buttons, 38px pills, 26px chips and the tab dock.
  button: 1.25,
  overline: 1.25,
  label: 1.3,
  // Numbers set in fixed-width money rows and spec strips.
  mono: 1.3,
  // Already 22–40px. Beyond this a screen title stops being a title.
  hero: 1.2,
  display: 1.2,
  h1: 1.25,
  h2: 1.3,
  monoLarge: 1.25,
};

/**
 * Noto Nastaliq Urdu's natural line box, as a multiple of font size.
 *
 * Measured from the shipped font at every size in the scale (10–40px), regular
 * and bold, via `line-height: normal`: 2.457–2.523. Rounded UP to the observed
 * worst case, because being one pixel short means clipped glyphs and being one
 * pixel long means nothing at all.
 */
const URDU_LEADING = 2.52;

/**
 * ── The Latin display sizes clipped their own descenders ─────────────────
 *
 * The type scale gives the display sizes deliberately TIGHT leading — hero
 * 40/42, display 32/34 — and the reasoning in `fonts.ts` is sound: a tight
 * headline reads as one object. But the numbers were chosen without measuring
 * **Fraunces**, which has unusually deep descenders. Its ink box at those sizes
 * needs 50px and 39px, not 42 and 34.
 *
 * A single-line heading's box height IS its lineHeight, so the difference comes
 * straight off the glyphs, and `numberOfLines` adds `overflow: clip` on top.
 * The result was visible on a real screen: the tail of the "g" in the "Budget"
 * screen title sheared off flat. Measured shortfall, descender- and
 * ascender-heavy string, per variant: hero 8px, display 6px, h1 3px, h2 1px.
 * `h3` and below are set in Jakarta and have room already.
 *
 * The fix must not loosen the leading, because leading is the space BETWEEN
 * lines and that spacing is the design. What has to grow is the BOX. So: pad by
 * the shortfall and pull the same amount back with a negative margin — the ink
 * gets its room, and every layout around it measures exactly what it did
 * before. Split evenly top and bottom, because a short line box clips ascenders
 * and descenders alike.
 *
 * Urdu is unaffected: `URDU_LEADING` already exceeds its font's natural box.
 */
const INK_SLACK: Partial<Record<TypographyVariant, number>> = {
  hero: 8,
  display: 6,
  h1: 3,
  h2: 1,
};


/**
 * Variants set in a semibold or bolder Latin face. In Urdu these take
 * `urduBold`, which is how the Urdu interface gets any weight contrast at all.
 * `bodyMedium` is deliberately absent: Nastaliq has no medium here, and
 * promoting it to bold would make emphasis louder in Urdu than in English.
 */
const URDU_BOLD_VARIANTS = new Set<TypographyVariant>([
  'hero',
  'display',
  'h1',
  'h3',
  'title',
  'label',
  'overline',
  'button',
]);

export type TextTone =
  | 'primary' // espresso ink — headings and primary body
  | 'body'
  | 'muted'
  | 'faint' // DECORATIVE ONLY — placeholders, disabled. Never body copy (2.8:1).
  | 'label' // gold-brown overline
  | 'onDark'
  | 'onGold'
  | 'gold'
  | 'shaadi' // the secondary accent — romantic emphasis, saved state
  | 'success'
  | 'warning'
  | 'danger'
  | 'inherit';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
  italic?: boolean;
  /**
   * Force the Nastaliq Urdu family (RTL-friendly). Leave unset for API data —
   * Urdu script is auto-detected, so a vendor named ماڈرن مارکی is set in
   * Nastaliq even while the interface is in English. Pass `false` to opt out.
   */
  urdu?: boolean;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
}

export function Text({
  variant = 'body',
  tone = 'primary',
  align,
  italic,
  urdu,
  weight,
  style,
  ...rest
}: TextProps) {
  const t = useTheme();
  const scale = t.typography[variant];

  // Explicit prop wins; otherwise sniff the content. `urdu={false}` opts out.
  const isUrdu = urdu ?? looksUrdu(rest.children);

  const toneColor: Record<TextTone, string | undefined> = {
    primary: t.colors.textPrimary,
    body: t.colors.textBody,
    muted: t.colors.textMuted,
    faint: t.colors.textFaint,
    label: t.colors.textLabel,
    onDark: t.colors.textOnDark,
    onGold: t.colors.onPrimary,
    gold: t.colors.goldDark,
    shaadi: t.colors.shaadi,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
    inherit: undefined,
  };

  // Explicit weight override maps onto the family for the current variant.
  const weightFamily = weight
    ? {
        light: t.fontFamily.bodyLight,
        regular: t.fontFamily.body,
        medium: t.fontFamily.bodyMedium,
        semibold: t.fontFamily.uiSemibold,
        bold: t.fontFamily.bodyBold,
      }[weight]
    : undefined;

  /**
   * Urdu picks between the two Nastaliq faces instead of collapsing to one.
   * An explicit `weight` wins; otherwise the variant decides, so an Urdu `h1`
   * is bold for the same reason its English twin is.
   *
   * `italic` has no Urdu branch on purpose — Nastaliq has no italic, and
   * slanting it is not emphasis, it is damage.
   */
  const urduFamily =
    weight === 'semibold' || weight === 'bold'
      ? t.fontFamily.urduBold
      : weight
        ? t.fontFamily.urdu
        : URDU_BOLD_VARIANTS.has(variant)
          ? t.fontFamily.urduBold
          : t.fontFamily.urdu;

  const family = isUrdu
    ? urduFamily
    : italic
      ? t.fontFamily.displayItalic
      : (weightFamily ?? scale.fontFamily);

  /**
   * ── Urdu was being drawn into a box a third too small ─────────────────
   *
   * This said "Nastaliq needs ~1.7×" and used `size * 1.7`. That number was a
   * guess, and it is wrong. **Noto Nastaliq Urdu's own line box is ~2.5× its
   * font size** — measured, not estimated: a hidden probe at every size in our
   * scale with `line-height: normal` returns 2.457–2.523 from 10px to 40px, and
   * identically for the bold face.
   *
   * So every Urdu line in the app was laid out ~32% short. Where the container
   * clipped (chips, rows, the ScreenHeader, anything with `overflow: hidden`)
   * the tops and tails of the glyphs were sliced off — which is exactly what
   * "the words start cutting when I switch to Urdu" looks like. Where it did
   * not clip, lines simply overlapped the next one.
   *
   * A live sweep of the home screen found **117 Urdu text nodes overflowing
   * their box and not one overflowing horizontally** — the giveaway that this
   * was one systemic vertical cause rather than a hundred layout mistakes.
   *
   * Why the script needs this much room: Nastaliq is calligraphic and sets on a
   * steep diagonal, so a single "line" stacks glyphs well above and below the
   * baseline. Latin's 1.5–1.6 leading is not a useful reference for it. Loose
   * leading is not padding here, it is the script.
   *
   * `URDU_LEADING` is deliberately the font's own metric rather than a designed
   * value, because the failure it prevents is clipping, and clipping is decided
   * by the font, not by taste.
   *
   * The leading is computed from the size that ACTUALLY applies, not the
   * variant's default: callers routinely override `fontSize` in `style` (a 15px
   * title inside a 160px card), and a lineHeight taken from the variant would
   * then be wrong in whichever direction the override went. So: flatten,
   * resolve, and apply the Urdu leading AFTER `style` so it wins rather than
   * being silently overridden back to a Latin value.
   */
  /**
   * Room for the glyphs, taken back out of the layout. See `INK_SLACK`. Skipped
   * for Urdu, whose leading is already well clear of its ink box, and skipped
   * whenever a caller overrides `lineHeight` — at that point the caller owns the
   * box and silently adding padding underneath them would be a surprise.
   */
  const flat = StyleSheet.flatten(style) ?? {};
  const size = typeof flat.fontSize === 'number' ? flat.fontSize : scale.fontSize;
  const slack = INK_SLACK[variant] ?? 0;
  const inkRoom =
    !isUrdu && slack > 0 && flat.lineHeight == null
      ? {
          paddingTop: Math.ceil(slack / 2),
          paddingBottom: Math.ceil(slack / 2),
          marginTop: -Math.ceil(slack / 2),
          marginBottom: -Math.ceil(slack / 2),
        }
      : null;

  const urduLead = isUrdu
    ? {
        lineHeight: Math.ceil(size * URDU_LEADING),
        writingDirection: 'rtl' as const,
        /**
         * ── The family has to outrank `style` too ─────────────────────────
         *
         * The leading was already applied after `style` for exactly this
         * reason. `fontFamily` was not, and a caller's stylesheet therefore
         * overwrote the Nastaliq face this component had just chosen — which
         * is not a subtle degradation, because a Latin family has **no Arabic
         * glyphs at all**, so the platform substitutes an arbitrary system
         * font at a Latin line height.
         *
         * That is what was happening to every primary CTA in the auth flow.
         * `AuthButton` renders `<Text urdu={urdu} style={styles.ctaLabel}>`,
         * and `ctaLabel` spreads `...typography.button` — which carries
         * `fontFamily: PlusJakartaSans_600SemiBold`. So "سائن اِن / رجسٹر" on
         * the account screen, and Sign in, Register, the onboarding CTA and
         * profile Save, all resolved to Jakarta. Confirmed live in the browser:
         * that string computed to `PlusJakartaSans_600SemiBold`. `AuthField`'s
         * error line had it too.
         *
         * Fixing it at the eleven call sites would leave the trap armed for the
         * twelfth. An Urdu string is set in an Urdu face, and a caller does not
         * get to be wrong about that.
         */
        fontFamily: family,
        // Nastaliq is cursive — tracking pulls the joins apart.
        letterSpacing: 0,
      }
    : null;

  return (
    <RNText
      {...rest}
      /**
       * Read from `rest` first so a caller can still opt out per instance —
       * this is a ceiling, not a policy the caller cannot argue with.
       */
      maxFontSizeMultiplier={rest.maxFontSizeMultiplier ?? MAX_SCALE[variant]}
      style={[
        {
          fontFamily: family,
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          letterSpacing: isUrdu ? 0 : scale.letterSpacing,
          color: toneColor[tone],
          textAlign: align,
        },
        // Before `style`: a caller's own padding or margin must still win.
        inkRoom,
        style,
        // Urdu family, leading and direction outrank a caller's Latin values.
        urduLead,
      ]}
    />
  );
}
