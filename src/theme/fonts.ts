/**
 * Wedding Wala — typography.
 * Fonts verified LIVE on weddingwala.pk: Playfair Display (display/headings),
 * DM Sans (body/UI), Inter (dense UI/nav/numbers), Noto Nastaliq Urdu (Urdu).
 */
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_600SemiBold_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoNastaliqUrdu_400Regular,
  NotoNastaliqUrdu_700Bold,
} from '@expo-google-fonts/noto-nastaliq-urdu';

/** Family keys registered with the font system (used as `fontFamily` in styles). */
export const fontFamily = {
  // Playfair Display — display / headings (the elegant serif)
  display: 'PlayfairDisplay_600SemiBold',
  displayRegular: 'PlayfairDisplay_400Regular',
  displayMedium: 'PlayfairDisplay_500Medium',
  displayBold: 'PlayfairDisplay_700Bold',
  displayItalic: 'PlayfairDisplay_400Regular_Italic',
  displayItalicSemi: 'PlayfairDisplay_600SemiBold_Italic',
  // DM Sans — body / UI
  bodyLight: 'DMSans_300Light',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  // Inter — dense UI / nav / numbers
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  // Noto Nastaliq Urdu
  urdu: 'NotoNastaliqUrdu_400Regular',
  urduBold: 'NotoNastaliqUrdu_700Bold',
} as const;
export type FontFamily = keyof typeof fontFamily;

/** The asset map handed to expo-font's useFonts. */
const fontAssets = {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_600SemiBold_Italic,
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  NotoNastaliqUrdu_400Regular,
  NotoNastaliqUrdu_700Bold,
};

/** Type scale — variant → font family + size + line height + tracking. */
export const typography = {
  hero: { fontFamily: fontFamily.display, fontSize: 40, lineHeight: 46, letterSpacing: 0 },
  display: { fontFamily: fontFamily.display, fontSize: 32, lineHeight: 40, letterSpacing: 0 },
  h1: { fontFamily: fontFamily.display, fontSize: 26, lineHeight: 34, letterSpacing: 0 },
  h2: { fontFamily: fontFamily.display, fontSize: 22, lineHeight: 30, letterSpacing: 0 },
  h3: { fontFamily: fontFamily.displayMedium, fontSize: 18, lineHeight: 26, letterSpacing: 0 },
  title: { fontFamily: fontFamily.bodyBold, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  bodyLead: { fontFamily: fontFamily.bodyLight, fontSize: 16, lineHeight: 26, letterSpacing: 0 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  label: { fontFamily: fontFamily.uiSemibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  overline: { fontFamily: fontFamily.uiSemibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4 },
  caption: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  button: { fontFamily: fontFamily.bodyMedium, fontSize: 14, lineHeight: 18, letterSpacing: 0.4 },
  mono: { fontFamily: fontFamily.uiMedium, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
} as const;
export type TypographyVariant = keyof typeof typography;

/** Load all app fonts. Returns [loaded, error]. Splash stays up until loaded. */
export function useAppFonts(): [boolean, Error | null] {
  return useFonts(fontAssets);
}
