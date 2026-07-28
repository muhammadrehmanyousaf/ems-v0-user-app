/**
 * Wedding Wala — design tokens.
 *
 * SOURCE OF TRUTH: consumer-app-plan/DESIGN-TOKENS.md — values pulled from the
 * LIVE site (weddingwala.pk) via computed styles, not guessed. Do not edit a
 * colour here without re-verifying against the live site. This is the "Bridal
 * Design System": ivory silk, champagne gold, rose petal. Zero purple.
 */

/** Raw palette — exact hex from the live site. */
export const palette = {
  // Surfaces (page → sections)
  base: '#FCFCFD', // app root / plain utility bg  (rgb 252,252,253)
  ivory: '#FDF8F2', // primary warm section surface  (rgb 253,248,242)
  cream: '#FFF9F4', // cards, alternating sections   (rgb 255,249,244)
  blush: '#FFF0F3', // soft-wash sections            (rgb 255,240,243)
  charcoalSurface: '#2C1810', // dark "royal" sections (rgb 44,24,16)

  // Brand accents
  gold: '#C9956A', // PRIMARY — CTA bg, active accents (rgb 201,149,106)
  goldDark: '#916539', // pressed gold / gold text on light
  goldLight: '#E8C99A', // shimmer highlight
  rose: '#F2B5C0', // romantic accent
  mauve: '#8B5A72', // secondary accent
  sage: '#A8C4A2', // calm / success-ish
  coral: '#E8917A', // warm alert

  // Ink (text)
  ink: '#2C1810', // primary heading/body ink on bridal surfaces
  text: '#5C3D2E', // body copy on light
  textSoft: '#7A5040', // secondary / meta
  textLabel: '#955E39', // gold-brown labels / overlines
  inkCool: '#181221', // header/nav/utility ink (the one cool ink the web uses)
  onDark: '#FDF8F2', // text on charcoal sections
  onGold: '#2C1810', // text on gold buttons (charcoal, NOT white)

  // Lines & fills
  beige: '#EDD9C3', // borders, dividers, input outline
  sand: '#F5E6D3', // disabled fills, subtle chips

  // Semantic bases (money-colour rule: in = green/positive, out = red/owed).
  // Foregrounds darkened to clear WCAG-AA (4.5:1) on their tinted backgrounds.
  success: '#3F6B4C', // sage-derived green (money IN)
  successBg: '#E8F1E9',
  danger: '#A23A2A', // coral-derived red (owed / out / destructive)
  dangerBg: '#FBEAE6',
  warning: '#C9956A', // gold
  warningBg: '#FBF1E6',
  info: '#8B5A72', // mauve
  infoBg: '#F3EBEF',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export type PaletteColor = keyof typeof palette;

/** Semantic colour roles used by components (never reference raw palette in a screen). */
export const colors = {
  ...palette,
  // Surface roles
  screen: palette.base,
  surface: palette.ivory,
  surfaceAlt: palette.cream,
  surfaceWash: palette.blush,
  surfaceInverse: palette.charcoalSurface,
  card: palette.cream,
  // Header (frosted glass — render bg at 0.85 over blur)
  headerTint: 'rgba(253, 248, 242, 0.85)',
  headerBorder: 'rgba(237, 217, 196, 0.4)',
  // Interactive
  primary: palette.gold,
  primaryPressed: palette.goldDark,
  onPrimary: palette.onGold,
  // Text roles
  textPrimary: palette.ink,
  textBody: palette.text,
  textMuted: palette.textSoft,
  textLabel: palette.textLabel,
  textOnDark: palette.onDark,
  // Lines
  border: palette.beige,
  borderStrong: 'rgba(201, 149, 106, 0.6)', // gold @ 0.6 on focus/hover
  divider: palette.beige,
  disabledFill: palette.sand,
} as const;

/** 4pt spacing scale. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;
export type Spacing = keyof typeof spacing;

/** Corner radii — verified: buttons/inputs 4, cards 6. */
export const radius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 10,
  xl: 16,
  pill: 999,
} as const;
export type Radius = keyof typeof radius;

/** Warm soft shadows (RN shadow + Android elevation). */
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sm: {
    shadowColor: '#B07D54',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#B07D54',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  lg: {
    shadowColor: '#B07D54',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  // Champagne glow — for the primary CTA & "featured" moments (gold, not grey).
  glow: {
    shadowColor: '#C9956A',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
} as const;
export type Elevation = keyof typeof elevation;

/**
 * Gold accent hierarchy — tints/opacities of the PRIMARY champagne gold only
 * (rgb 201,149,106). Stays strictly within the web palette; gold is an accent,
 * never a large fill. Use for pills, rims, hover washes, glow.
 */
export const goldScale = {
  bright: palette.goldLight, //  #E8C99A shimmer highlight
  subtle: 'rgba(201, 149, 106, 0.12)', // pill / tint background
  dim: 'rgba(201, 149, 106, 0.06)', // faint hover wash
  hairline: 'rgba(201, 149, 106, 0.35)', // gold rim on cards / arch
} as const;

/**
 * Gradient recipes (colour arrays for expo-linear-gradient). Every stop is a
 * bridal-palette colour or an alpha of one — no new hues, no darkening the
 * theme. Imagery + these washes carry the richness.
 */
export const gradients = {
  ivoryWash: ['#FFFDFB', '#FDF8F2', '#FBF1E6'], // warm section background
  roseWash: ['#FFF0F3', '#FDF8F2'], // romantic soft wash
  champagne: ['rgba(232,201,154,0)', 'rgba(232,201,154,0.55)', 'rgba(232,201,154,0)'], // headline light-sweep
  photoScrim: ['rgba(44,24,16,0)', 'rgba(44,24,16,0.10)', 'rgba(44,24,16,0.62)'], // bottom scrim for text-over-image
  topScrim: ['rgba(44,24,16,0.35)', 'rgba(44,24,16,0)'], // top scrim for status-bar legibility
  goldCta: ['#D6A473', '#C9956A', '#B37E4F'], // primary CTA sheen
} as const;
export type GradientName = keyof typeof gradients;

export type MoneyDirection = 'in' | 'out' | 'neutral';
/** Money-colour rule: money-in = success/green; owed/out = danger/red. */
export function moneyTone(direction: MoneyDirection): string {
  if (direction === 'in') return colors.success;
  if (direction === 'out') return colors.danger;
  return colors.textBody;
}

export const tokens = { palette, colors, spacing, radius, elevation, goldScale, gradients, moneyTone } as const;
export type Tokens = typeof tokens;
