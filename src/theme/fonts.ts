/**
 * Wedding Wala — typography, v4 "Paper & Gold".
 *
 * Spec: docs/02-DESIGN-SYSTEM.md §2.
 *
 * ── Why these faces ──────────────────────────────────────────────────────
 *
 * v1 was Playfair Display + DM Sans. Both competent, both everywhere. Playfair
 * in particular is THE default "elegant" serif — the face you reach for when you
 * want a page to read as premium without deciding anything, which is exactly why
 * it reads as a template choice.
 *
 * v3:
 *   Fraunces          display  — a variable old-style serif with optical-size and
 *                                "wonk" axes. Warm, editorial, genuinely
 *                                uncommon, and it has real character at 32–44px
 *                                where a wedding app lives.
 *   Plus Jakarta Sans body/UI  — geometric-humanist, excellent small, wide weight
 *                                range, more personality than DM Sans without
 *                                shouting.
 *   Geist Mono        numbers  — true tabular figures. Prices, capacities,
 *                                counts, anything that lines up in a column.
 *   Noto Nastaliq Urdu   Urdu  — kept. The only real Nastaliq option. Its line
 *                                box is **×2.5** its font size — measured from
 *                                the shipped font at every size in the scale,
 *                                not estimated. This comment said ×1.7 and
 *                                `Text` used that number, which laid every Urdu
 *                                line in the app into a box a third too small.
 *                                See `URDU_LEADING` in `components/ui/Text.tsx`.
 *
 * ── Migration contract ───────────────────────────────────────────────────
 *
 * Every v1 `fontFamily` key and every `typography` variant name is preserved, so
 * no screen import changes. The families and the scale move; the API does not.
 */
/**
 * ── Import each WEIGHT, never the family ─────────────────────────────────
 *
 * `import { Fraunces_400Regular } from '@expo-google-fonts/fraunces'` pulls the
 * package's index, and that index `require`s **every face the family ships**.
 * Metro does not tree-shake, so all of them land in the bundle whether or not
 * `useFonts` ever registers them.
 *
 * Measured on a real `expo export --platform android`: **55 font faces, 7.35 MB
 * of an 8.47 MB asset payload** — for an app that declares 16. Fraunces alone
 * shipped 100 Thin through 900 Black, roman and italic, none of which any
 * variant in the scale names. Noto Nastaliq shipped all four faces at ~520 KB
 * each for the two that are used.
 *
 * That is the whole download, on the connection this app is actually for:
 * CLAUDE.md's audience line is "mid-range Android in Pakistan".
 *
 * The per-weight subpath (`.../fraunces/400Regular`) is a directory holding one
 * `.ttf` and one `index.js`, so only that face is reachable.
 */
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces/400Regular_Italic';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces/600SemiBold_Italic';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono/400Regular';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono/500Medium';
import { GeistMono_600SemiBold } from '@expo-google-fonts/geist-mono/600SemiBold';
import { NotoNastaliqUrdu_400Regular } from '@expo-google-fonts/noto-nastaliq-urdu/400Regular';
import { NotoNastaliqUrdu_700Bold } from '@expo-google-fonts/noto-nastaliq-urdu/700Bold';
import { PlusJakartaSans_300Light } from '@expo-google-fonts/plus-jakarta-sans/300Light';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { useFonts } from 'expo-font';

/** Family keys registered with the font system (used as `fontFamily` in styles). */
export const fontFamily = {
  // Fraunces — display / headings
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  displayMedium: 'Fraunces_500Medium',
  displayBold: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_400Regular_Italic',
  displayItalicSemi: 'Fraunces_600SemiBold_Italic',
  // Plus Jakarta Sans — body / UI
  bodyLight: 'PlusJakartaSans_300Light',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemibold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  // Plus Jakarta Sans also serves the dense-UI role — one sans, not two.
  // v1 loaded Inter purely for nav labels and numbers; Jakarta covers the first
  // and Geist Mono the second, so a whole family came out of the bundle.
  ui: 'PlusJakartaSans_400Regular',
  uiMedium: 'PlusJakartaSans_500Medium',
  uiSemibold: 'PlusJakartaSans_600SemiBold',
  uiBold: 'PlusJakartaSans_700Bold',
  // Geist Mono — numbers / data
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
  monoSemibold: 'GeistMono_600SemiBold',
  // Noto Nastaliq Urdu
  urdu: 'NotoNastaliqUrdu_400Regular',
  urduBold: 'NotoNastaliqUrdu_700Bold',
} as const;
export type FontFamily = keyof typeof fontFamily;

/** The asset map handed to expo-font's useFonts. */
const fontAssets = {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold_Italic,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  GeistMono_400Regular,
  GeistMono_500Medium,
  GeistMono_600SemiBold,
  NotoNastaliqUrdu_400Regular,
  NotoNastaliqUrdu_700Bold,
};

/**
 * Type scale — **v4. Type carries the hierarchy now, so the scale has to be able
 * to carry it.**
 *
 * v3's problem was not the sizes, it was the RATIO. Its title (21) against its
 * caption (13) is 1.6×, which on a phone reads as "slightly bigger text" rather
 * than as a heading. The reference sets a 27px title against a 13px caption —
 * over 2× — and that gap is what lets a screen drop its boxes and still be
 * readable. Remove the borders from a 21/13 layout and it turns to mush; remove
 * them from a 27/13 layout and it turns editorial.
 *
 * ── The leading inversion, which is the actual craft here ─────────────────
 *
 * Display sizes get TIGHT leading (hero 40/42 = 1.05) and body gets LOOSE
 * leading (body 15/24 = 1.6). v3 had both at roughly 1.15–1.5, so headings
 * sprawled and paragraphs felt cramped — the exact opposite of what makes a page
 * feel expensive. A tight headline reads as one object; airy body reads as calm.
 *
 * Negative tracking on the display sizes is deliberate: Fraunces sets loose at
 * large sizes, and the reference's titles are noticeably tight-set.
 */
export const typography = {
  /** The one-per-app moment: confirmation, onboarding. */
  hero: { fontFamily: fontFamily.display, fontSize: 40, lineHeight: 42, letterSpacing: -1.4 },
  /** A screen's opening line. Every screen opens on this or `h1`. */
  display: { fontFamily: fontFamily.display, fontSize: 32, lineHeight: 34, letterSpacing: -0.9 },
  /** **The reference's title size.** A vendor name, a section that owns a page. */
  h1: { fontFamily: fontFamily.display, fontSize: 27, lineHeight: 31, letterSpacing: -0.6 },
  h2: { fontFamily: fontFamily.displayMedium, fontSize: 22, lineHeight: 27, letterSpacing: -0.3 },
  h3: { fontFamily: fontFamily.bodySemibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.1 },
  /** A row title, a card heading. */
  title: { fontFamily: fontFamily.bodySemibold, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  /** The paragraph that follows a heading — the one place body grows. */
  bodyLead: { fontFamily: fontFamily.body, fontSize: 17, lineHeight: 27, letterSpacing: 0 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 24, letterSpacing: 0 },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 15, lineHeight: 24, letterSpacing: 0 },
  label: { fontFamily: fontFamily.bodySemibold, fontSize: 14, lineHeight: 19, letterSpacing: 0 },
  /** Tracking cut from 1.76 to 1.4: at 1.76 an overline reads as a logo. */
  overline: { fontFamily: fontFamily.bodyBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4 },
  caption: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 19, letterSpacing: 0 },
  /** Bigger: the reference's CTA label has real weight and presence. */
  button: { fontFamily: fontFamily.bodySemibold, fontSize: 15, lineHeight: 20, letterSpacing: 0.1 },
  mono: { fontFamily: fontFamily.monoMedium, fontSize: 14, lineHeight: 19, letterSpacing: -0.2 },
  /** A price that leads a screen. */
  monoLarge: { fontFamily: fontFamily.monoSemibold, fontSize: 22, lineHeight: 26, letterSpacing: -0.6 },
} as const;
export type TypographyVariant = keyof typeof typography;

/** Load all app fonts. Returns [loaded, error]. Splash stays up until loaded. */
export function useAppFonts(): [boolean, Error | null] {
  return useFonts(fontAssets);
}
