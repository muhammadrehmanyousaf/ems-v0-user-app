/**
 * Wedding Wala — design tokens, **v4 "Paper & Gold"**.
 *
 * Spec: docs/02-DESIGN-SYSTEM.md. Governed by rules.md — read §0.0 THE MANDATE
 * before changing anything here.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY v4 EXISTS, WHEN v3 WAS ONLY A DAY OLD
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * v3 changed the VALUES and kept the SYSTEM. It swapped a brown gold for a
 * metallic one and a pastel pink for shaadi red, went green on contrast, and
 * left the app looking like the same app. That is the whole complaint, and it
 * was correct: a palette swap is not a redesign (rules.md prohibition 3).
 *
 * The reference — Airbnb iOS listing detail, supplied by the founder — is not a
 * different palette. It is a different *system*:
 *
 *   • Colour appears ONCE per screen. Everything else is ink, paper, hairline.
 *   • Structure is carried by HAIRLINES and WHITESPACE, not by cards and shadows.
 *   • Type carries hierarchy: a 27px title against a 13px caption, not 21 vs 15.
 *   • Air is the luxury signal. Emptiness is the product.
 *
 * v3 could not express that, because its tokens made the opposite easy: 43
 * colours, 13 elevation levels, and a warm tint on every surface. When thirteen
 * shadows are one keystroke away, everything becomes a card. The token set was
 * the cause, so the token set is where the revamp starts.
 *
 * ── What changed, in numbers ──────────────────────────────────────────────
 *
 *   colours       43 → 19        one accent, one secondary, four semantic
 *   elevation     13 → 3         none · card · overlay
 *   gradients      7 → 3         and two of the three are scrims
 *   spacing        6 → 9         three new LARGE steps; air needs vocabulary
 *
 * ── The migration contract ────────────────────────────────────────────────
 *
 * Every key name in use across the 76 source files is preserved, so nothing
 * breaks on the way through — the VALUES move, the API does not. The v1 `legacy`
 * block is deleted: it survived one migration cycle as intended and is now two
 * generations stale.
 */

/**
 * The raw palette. Nineteen colours, and each one has a job it does not share.
 * If a new colour seems necessary, the answer is almost always a hairline, more
 * space, or a heavier type weight.
 */
export const palette = {
  // ── Paper: the ground, and the single biggest change from v3 ────────────
  /** The ground. A warm near-white — paper, not ivory. Everything sits on it. */
  paper: '#FDFCFA',
  /** Cards, sheets and any raised surface. PURE white, so it lifts off paper
   *  with no border required. v3 tinted both and needed a border to separate
   *  them; the border is what made every element read as a box. */
  white: '#FFFFFF',
  /** Wells, inputs, skeletons, disabled fills — the only recessed tone. */
  sunken: '#F4F1EC',
  /** The deep register. Used ONCE per screen at most, and on most screens not
   *  at all: the confirmation moment, a full-bleed scrim, a dark tab bar. */
  inkSurface: '#14100D',

  // ── Ink: hierarchy lives here now, not in boxes ─────────────────────────
  /** Display and headings. Near-black, warm. */
  ink: '#14100D',
  /** Body copy. */
  inkBody: '#453D36',
  /** Metadata, captions, the quiet second line.
   *  #726A64, not #78706A: the lighter value passed on paper (4.74) and failed
   *  on `sunken` (4.31), and captions sit inside wells all over the app —
   *  a filter row, an input hint, a skeleton label. Solved for the WORST
   *  background it lands on, not the best. */
  inkMuted: '#726A64',
  /** Placeholders and disabled text — DECORATIVE ONLY, never body copy.
   *  Held to 2.5:1, deliberately below AA. Darkened from #ABA49D (2.40) to
   *  clear even that bar. */
  inkFaint: '#A59E96',
  /** Type on the deep register. */
  onDark: '#FDFCFA',

  // ── Line: the structural element of the whole system ────────────────────
  /** THE hairline. This replaces most borders, all card outlines, and a good
   *  deal of the old shadow work. If you reach for a box, reach for this. */
  line: '#EAE6E0',
  /** A deliberate rule — section breaks, input outlines. */
  lineStrong: '#D8D2CA',

  // ── Gold: the ONE colour event ──────────────────────────────────────────
  /** The CTA fill, and the only saturated surface allowed on a screen. */
  gold: '#C9A227',
  /** Gold as TEXT on paper. Darkened so it passes AA at body size. */
  goldDeep: '#7E620F',
  /** Gold on the deep register — the one place light gold is legible. */
  goldLight: '#E9CE8E',
  /** The gold wash: selected chips, the medallion behind an icon. */
  goldSoft: '#F6EDD4',
  /** The gold hairline. The brand's signature line — the Mehrab, the rim. */
  goldLine: '#E2D19C',

  // ── Shaadi red: the secondary. Saved state, romantic emphasis. Rare. ────
  shaadi: '#8E2B3F',
  /** Its wash — the one tinted section background left in the system. */
  shaadiSoft: '#FAF1F2',

  // ── Semantic. Never decorative, and deliberately desaturated so they read
  //    as information rather than as a second brand palette. ───────────────
  success: '#2F6B45',
  successBg: '#EBF2ED',
  danger: '#A32A20',
  dangerBg: '#FBEBE8',
  warning: '#8A6212',
  warningBg: '#FAF2DE',
  info: '#3F5170',
  infoBg: '#EDF0F5',

  // ── v3 palette aliases. Some components read `palette.*` directly (the SVG
  //    textures cannot use the semantic layer). Kept so they resolve to v4. ──
  /** @deprecated use `paper` */ ivory: '#FDFCFA',
  /** @deprecated use `white` */ cream: '#FFFFFF',
  /** @deprecated use `sunken` */ sand: '#F4F1EC',
  /** @deprecated use `goldDeep` */ goldDark: '#7E620F',
  /** @deprecated use `shaadiSoft` */ blush: '#FAF1F2',
  /** @deprecated use `inkSurface` */ charcoalSurface: '#14100D',
  /** @deprecated use `goldLine` */ zari: '#E2D19C',
} as const;

/**
 * Semantic roles. **Screens reference these, never `palette.*` directly.**
 *
 * Every key that any of the 76 source files uses is present, so the v4 values
 * reach the whole app without a single call-site edit. Names that described the
 * v3 world (`sand`, `ivory`, `cream`, `charcoalSurface`) are kept as aliases and
 * marked deprecated, so they show up in a diff rather than quietly meaning the
 * wrong thing.
 */
export const colors = {
  // Surfaces
  screen: palette.paper,
  card: palette.white,
  surface: palette.white,
  sunken: palette.sunken,
  surfaceInverse: palette.inkSurface,
  disabledFill: palette.sunken,
  white: palette.white,

  // Lines
  border: palette.line,
  divider: palette.line,
  borderStrong: palette.lineStrong,

  // Ink
  textPrimary: palette.ink,
  textBody: palette.inkBody,
  textMuted: palette.inkMuted,
  textSoft: palette.inkMuted,
  textFaint: palette.inkFaint,
  textLabel: palette.goldDeep,
  textOnDark: palette.onDark,
  onDark: palette.onDark,

  // The one accent
  primary: palette.gold,
  onPrimary: palette.ink,
  gold: palette.gold,
  goldDark: palette.goldDeep,
  goldLight: palette.goldLight,
  goldSoft: palette.goldSoft,
  goldLine: palette.goldLine,

  // Secondary
  shaadi: palette.shaadi,
  blush: palette.shaadiSoft,

  // Semantic
  success: palette.success,
  successBg: palette.successBg,
  danger: palette.danger,
  dangerBg: palette.dangerBg,
  warning: palette.warning,
  warningBg: palette.warningBg,
  info: palette.info,
  infoBg: palette.infoBg,

  // ── v3 aliases. Retained so no call site breaks; do not use in new code. ──
  /** @deprecated use `screen` */ ivory: palette.paper,
  /** @deprecated use `card` */ cream: palette.white,
  /** @deprecated use `sunken` */ sand: palette.sunken,
  /** @deprecated use `surfaceInverse` */ charcoalSurface: palette.inkSurface,
  /** @deprecated use `border` */ beige: palette.line,
  /** @deprecated use `goldLine` */ zari: palette.goldLine,
  /** @deprecated use `success` */ mehndi: palette.success,
} as const;

/**
 * Spacing — a 4pt grid, with three LARGE steps that v3 did not have.
 *
 * That omission was structural, not cosmetic. The largest step in v3 was 24,
 * which was also the gutter, so "the space between sections" and "the space
 * beside text" were the same measurement and every screen compressed into one
 * even texture. Air needs its own vocabulary or it never gets used.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  /** The gutter. Also v3's maximum. */
  xl: 24,
  /** Between related blocks. */
  xxl: 32,
  /** **Between sections.** The default separation on a redrawn screen. */
  huge: 48,
  /** Around a moment — a confirmation, an empty state, a hero. */
  vast: 64,
  /** @deprecated v3 name for `xxl`. */ '2xl': 32,
  /** @deprecated v3 name for `huge`. */ '3xl': 48,
} as const;
export type Spacing = keyof typeof spacing;

/** Corner radii. Softer and fewer — the reference rounds generously. */
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  /** Photography, sheets, and the focal card. */
  xxl: 28,
  pill: 999,
} as const;
export type Radius = keyof typeof radius;

/**
 * Depth — **thirteen levels reduced to three.**
 *
 * v3 offered `none/sm/md/lg/glow` across several surfaces, which is thirteen
 * distinct shadow definitions. With that many a keystroke away, every element
 * became a floating card and the screen lost its ground. The reference uses
 * almost no shadow at all: a white card on near-white paper separates by *edge
 * and space*.
 *
 * Key names are preserved so no call site breaks, but `sm` and `md` now resolve
 * to the same barely-there card shadow, and the champagne glow is retired.
 */
const CARD_SHADOW = {
  shadowColor: '#3A2A15',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
} as const;

const OVERLAY_SHADOW = {
  shadowColor: '#3A2A15',
  shadowOpacity: 0.1,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
} as const;

export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  /** A card at rest. Deliberately almost invisible. */
  sm: CARD_SHADOW,
  /** @deprecated identical to `sm` — kept so call sites still compile. */
  md: CARD_SHADOW,
  /** Sheets, menus, and the one focal element on a screen. */
  lg: OVERLAY_SHADOW,
  /** @deprecated the champagne glow is retired. Resolves to `lg`. */
  glow: OVERLAY_SHADOW,
} as const;
export type Elevation = keyof typeof elevation;

/**
 * `alpha` — the only sanctioned way to make a translucent palette colour.
 * A literal `rgba()` in a component is a defect: it is invisible to a palette
 * change and to the contrast gate. v3 shipped with 39 of them across 25 files,
 * all still carrying v1 values.
 */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Named translucent surfaces. Each names a JOB, not a colour. */
export const overlay = {
  /** Glass control floating on photography — back, share, heart. */
  onPhoto: alpha(palette.white, 0.92),
  /** Reading pill on photography — the "1 / 29" counter, a rating. */
  onPhotoInk: alpha(palette.ink, 0.55),
  /** Inactive page dot on photography. */
  dotOnPhoto: alpha(palette.white, 0.5),
  /** The Mehrab whispered over a photograph. */
  archOnPhoto: alpha(palette.goldLight, 0.45),
  /** Behind a modal or sheet. */
  backdrop: alpha(palette.ink, 0.42),
  /** Tinted medallion behind an icon. */
  goldWash: palette.goldSoft,
  /** Saved / romantic state. */
  shaadiWash: palette.shaadiSoft,
  /** Selected row on a light card. */
  goldSelected: alpha(palette.gold, 0.08),
  /** Unread / needs-attention row. */
  unread: alpha(palette.gold, 0.06),
  /** Hairline on the deep register, where `line` would vanish. */
  hairlineOnDark: alpha(palette.goldLight, 0.22),
  /** @deprecated the glow is retired in v4 — resolves to a bare gold wash so
   *  any component still asking for it degrades quietly until it is redrawn. */
  glowBleed: alpha(palette.gold, 0.1),
} as const;

/**
 * Layout constants. The gutter was declared `const GUTTER = 24` in six separate
 * files — which is how a gutter drifts to 20 in one of them and the whole app
 * reads as cheap (rules.md §4.3).
 */
export const layout = {
  /** The always-gutter. Never overridden. */
  gutter: 24,
  /** Content stops widening here and centres (gate 4). */
  maxContentWidth: 560,
  /** Minimum tap target (gate 3). */
  tapTarget: 44,
  /** The standard separation between sections on a redrawn screen. */
  section: spacing.huge,
  /** Hairline width. Kept as a token so a rule is never a raw 1. */
  hairline: 1,
  /**
   * Bottom padding every scrolling screen must reserve for the floating dock.
   * The tab bar no longer occupies layout space — it hovers — so a screen that
   * forgets this ends with its last row underneath the dock.
   */
  tabBarSpace: 108,
} as const;

/**
 * Gold accent hierarchy. Gold is a rim, a pill, a wash — never a large fill
 * except the single primary action.
 */
export const goldScale = {
  bright: palette.goldLight,
  /** Active pill background. */
  subtle: palette.goldSoft,
  /** Faint wash. */
  dim: alpha(palette.gold, 0.06),
  /** The gold rim, and the Mehrab outline. */
  hairline: palette.goldLine,
} as const;

/**
 * Gradients — **seven reduced to three**, and two of those are scrims.
 *
 * v3 used gradients as decoration (`ivoryWash`, `roseWash`, `champagne`). On a
 * paper ground a tinted band is exactly the kind of soft furnishing this system
 * removes: a section is separated by space and a hairline, not by a wash.
 */
export const gradients = {
  /** Bottom scrim for type over photography. */
  photoScrim: [alpha(palette.ink, 0), alpha(palette.ink, 0.15), alpha(palette.ink, 0.78)],
  /** Top scrim, for status-bar and floating-control legibility. */
  topScrim: [alpha(palette.ink, 0.34), alpha(palette.ink, 0)],
  /** The deep register, layered. The only non-scrim gradient left. */
  royal: ['#1E1712', palette.inkSurface],
  /** @deprecated use space and a hairline. Resolves to two paper stops. */
  ivoryWash: [palette.white, palette.paper],
  /** @deprecated use space and a hairline. */
  roseWash: [palette.shaadiSoft, palette.paper],
  /** @deprecated the CTA is a flat gold fill now — a sheen reads as plastic. */
  goldCta: [palette.gold, palette.gold],
  /** @deprecated the light sweep is retired. */
  champagne: [
    alpha(palette.goldLight, 0),
    alpha(palette.goldLight, 0.4),
    alpha(palette.goldLight, 0),
  ],
} as const;
export type GradientName = keyof typeof gradients;

export type MoneyDirection = 'in' | 'out' | 'neutral';
/** Money-colour rule: money-in = success, owed/out = danger. Never gold. */
export function moneyTone(direction: MoneyDirection): string {
  if (direction === 'in') return colors.success;
  if (direction === 'out') return colors.danger;
  return colors.textBody;
}

export const tokens = {
  palette,
  colors,
  spacing,
  radius,
  elevation,
  goldScale,
  gradients,
  overlay,
  layout,
  moneyTone,
} as const;
export type Tokens = typeof tokens;
