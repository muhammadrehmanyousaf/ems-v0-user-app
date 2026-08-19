# 02 — Design System v3

**Status: PROPOSED — awaiting sign-off. Nothing in here is built yet.**

Governed by [../rules.md](../rules.md). This supersedes the v1 token set in `src/theme/tokens.ts`.

---

## Why v3 exists, and the one thing you must decide first

v1 was ported byte-for-byte from weddingwala.pk. That was the right call for brand parity and the wrong call for the app, for a reason worth stating plainly:

> **The current palette is a Western pastel-bridal palette, not a Pakistani wedding palette.**

`rose #F2B5C0` is a soft Anglo-American blush — the colour of a Pinterest "blush and beige" board. A Pakistani wedding is **deep red and gold**: gota, zari, marigold, mehndi green, the bride's *laal joda*. Nobody in Lahore describes a shaadi as pastel pink. The app has been dressed in someone else's wedding.

Second problem: `gold #C9956A` is desaturated to the point of reading as light brown, and `ink #2C1810` is a soft warm brown rather than a true dark. Together they give the app almost no tonal range — which is the mechanical reason it looks flat no matter how the layout is arranged.

**⚠️ The decision:** adopting v3 means the app **no longer matches weddingwala.pk**. That is a real cost — a marketplace whose app and site look like different companies erodes trust. Two honest options:

- **A.** Ship v3 on the app now, and port it to the web afterwards so they reconverge. *(Recommended — the app is the product people will judge.)*
- **B.** Change both together, which is slower.

Everything below assumes v3 is adopted.

---

## 1. Colour

### 1.1 Foundations

Warmer, deeper ground than v1's near-white, and a true dark so hierarchy has somewhere to go.

| Token | Hex | Role |
|---|---|---|
| `ground` | `#FBF6EF` | The app surface. Warm ivory with more body than v1's `#FDF8F2`. |
| `raised` | `#FFFCF8` | Cards and sheets — lighter than the ground, so cards *rise*. v1 had this inverted. |
| `sunken` | `#F3EADF` | Wells, inset fields, disabled fills. |
| `veil` | `rgba(28,18,14,0.55)` | Scrim behind modals and over photography. |
| `royal` | `#241610` | The dark register: confirmation, shared plan, hero scrims. |
| `royalDeep` | `#160D09` | Behind `royal` — for layered depth on dark screens. |

### 1.2 Ink

| Token | Hex | Role | On `ground` |
|---|---|---|---|
| `ink` | `#1C120E` | Headlines, display type. A true espresso. | 14.8:1 |
| `body` | `#4A342A` | Body copy. | 8.1:1 |
| `muted` | `#7A6357` | Metadata, captions. | 4.6:1 |
| `faint` | `#A6907F` | Placeholders, disabled text. | 2.9:1 — **decorative only, never body copy** |
| `onDark` | `#FBF6EF` | Text on `royal`. | 15.1:1 on royal |

### 1.3 Gold — the primary accent

Richer and more metallic than v1. Three steps so it can carry a gradient and a glow.

| Token | Hex | Role |
|---|---|---|
| `goldBright` | `#EBC98A` | Highlight, arch hairline, gradient top stop. |
| `gold` | `#C9A227` | **Primary.** CTA fill, active state. A true metallic gold, not brown. |
| `goldDeep` | `#8F6F1A` | Gold *text* on light, pressed state, gradient bottom stop. |
| `goldWash` | `rgba(201,162,39,0.10)` | Active pill background, hover wash. |
| `goldRim` | `rgba(201,162,39,0.34)` | Hairline on cards and the Mehrab outline. |

`onGold` is **`#1C120E`** — ink, never white. 8.9:1.

### 1.4 Shaadi red — the secondary accent, and the correction to v1

This is the colour a Pakistani wedding actually is. It replaces v1's pastel `rose` everywhere except where a genuinely soft wash is wanted.

| Token | Hex | Role |
|---|---|---|
| `shaadi` | `#8E2B3F` | Secondary accent. Favourite heart, romantic emphasis, mehndi/dholki moments. |
| `shaadiDeep` | `#5E1A29` | Pressed, and text on light rose. |
| `shaadiWash` | `#F7E9EC` | The soft-wash section background — replaces `blush`. |

### 1.5 Supporting

| Token | Hex | Role |
|---|---|---|
| `mehndi` | `#5F7A4A` | Mehndi green. Secondary structural accent, and the base for "open"/success. |
| `zari` | `#D9A96F` | Antique-gold tint for borders and dividers on dark. |
| `line` | `#E6D8C7` | Hairlines and dividers on light. |
| `lineStrong` | `#D2BEA6` | Input outlines, table rules. |

### 1.6 Semantic — separate from the accent, never decorative

| Token | Hex | Bg | Meaning |
|---|---|---|---|
| `success` | `#3E6B4A` | `#E9F1EA` | Money **in**, date open, paid, confirmed |
| `warning` | `#9A6B12` | `#FBF2DF` | Few slots left, awaiting action, expiring |
| `danger` | `#9E2B22` | `#FBEAE7` | Money **owed**, booked out, cancel, destructive |
| `info` | `#4A5A7A` | `#ECEFF5` | Neutral notices |

**Money-colour rule:** money in = `success`, money owed/out = `danger`. Always. Never gold for money.

### 1.7 Translucency — `alpha()` and `overlay.*`

**A literal `rgba()` in a screen is a defect.** This clause exists because P1's palette migration silently failed: `tokens.ts` moved to v3 and the contrast gate went green, but 39 translucent colours across 25 files had been written as literals like `rgba(201,149,106,0.14)`. A token swap only reaches colours referenced *as tokens*, so those stayed v1 — and the app rendered two golds at once, P2's metallic beside v1's brown, on the same screen.

```ts
alpha(palette.gold, 0.14)   // derive — survives the next palette change
'rgba(201,162,39,0.14)'     // defect — invisible to tokens AND to the contrast gate
```

`overlay.*` names a **job**, not a colour, so every instance of the same job is identical:

| Token | Job |
|---|---|
| `onPhoto` | Glass control floating on photography — hearts, close buttons |
| `onPhotoInk` | Reading pill on photography — rating, counters |
| `dotOnPhoto` | Inactive page dot on photography |
| `archOnPhoto` | The Mehrab whispered over an image |
| `backdrop` | Behind a modal or sheet |
| `goldWash` / `shaadiWash` | Tinted medallion behind an icon |
| `goldSelected` | Selected-row tint on a light card |
| `unread` | Needs-attention row tint |
| `glowBleed` | Light escaping from under the focal element |
| `hairlineOnDark` | Divider on the royal ground |

**The contrast gate reads tokens, not screens** — so it will always lag the screens by exactly the pairs a new screen introduces. When a screen adopts a new foreground/ground pair, add it in the same pass, and composite any `opacity` before measuring (`mix()`): text dimmed to 70% has a contrast nobody measured otherwise.

### 1.8 Layout constants

| Token | Value | Why |
|---|---|---|
| `layout.gutter` | 24 | The always-gutter. Was re-declared `const GUTTER = 24` in six files — which is how one of them drifts to 20 and the app reads as cheap. |
| `layout.maxContentWidth` | 560 | Content stops widening and centres. Without it a tablet gets one stretched column of 700px cards. **Anything sizing itself off the window must clamp to this** — medallions sized off an 834px window rendered at 168px inside a 560px row. |
| `layout.tapTarget` | 44 | The floor. Grow targets with padding + negative margin, **not `hitSlop`** — `hitSlop` is native-only, so a `hitSlop` fix is invisible to every check we can run. |

---

## 2. Typography

v1 used Playfair Display + DM Sans. Both are competent and both are everywhere — Playfair in particular is the default "elegant" serif and reads as a template choice. v3 picks faces with actual character.

All four are verified available on npm as `@expo-google-fonts` packages.

| Role | Family | Package | Why |
|---|---|---|---|
| **Display** | **Fraunces** | `@expo-google-fonts/fraunces` | A variable "wonky" old-style serif with optical sizing. Warm, editorial, characterful, and genuinely uncommon. Its `SOFT` and `WONK` axes give the brand a signature at large sizes that Playfair cannot. |
| **Body / UI** | **Plus Jakarta Sans** | `@expo-google-fonts/plus-jakarta-sans` | Geometric-humanist, excellent at small sizes, wide weight range, more personality than DM Sans without shouting. |
| **Numbers / data** | **Geist Mono** | `@expo-google-fonts/geist` (mono variant) | True tabular figures. Prices, capacities, dates, anything in a column. |
| **Urdu** | **Noto Nastaliq Urdu** | `@expo-google-fonts/noto-nastaliq-urdu` | Kept — the only real Nastaliq option. Line height **×1.7**, never less. |

### 2.1 Type scale

Bigger, with more contrast between steps. v1's steps were too close, which is why one size appeared to do four jobs.

| Variant | Family / weight | Size / line | Tracking | Use |
|---|---|---|---|---|
| `hero` | Fraunces 600 | 44 / 48 | −0.02em | Confirmation, onboarding, one per flow |
| `display` | Fraunces 600 | 32 / 37 | −0.015em | Screen openers |
| `h1` | Fraunces 600 | 26 / 31 | −0.01em | Vendor name, section openers |
| `h2` | Fraunces 500 | 21 / 26 | 0 | Sub-sections, month title |
| `title` | Jakarta 600 | 16 / 21 | 0 | Card names, list rows |
| `bodyLead` | Jakarta 400 | 16 / 26 | 0 | Lead paragraphs |
| `body` | Jakarta 400 | 15 / 23 | 0 | Body copy |
| `label` | Jakarta 600 | 13 / 17 | 0.01em | Form labels, buttons |
| `overline` | Jakarta 700 | 11 / 14 | 0.16em, upper | Section eyebrows |
| `caption` | Jakarta 400 | 13 / 18 | 0 | Metadata |
| `num` | Geist Mono 500 | 14 / 19 | 0 | Prices, counts — tabular |
| `numLarge` | Geist Mono 600 | 20 / 24 | 0 | Headline prices, totals |

**Rules:** a screen opens on `display` or larger. Nothing between `caption` and `body` — pick one. Italic is Fraunces only, and only for romantic phrases (*your perfect day*), never for emphasis in body copy.

---

## 3. Space, radius, depth

### 3.1 Spacing — 8pt rhythm with 4pt half-steps

v1's flat 4pt scale let anything be any size. v3 makes 8 the default step.

`0 · 2 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 56 · 72`

**Gutter is 24. Always.** Section gap 32. Related items 8 or 12. Never invent a number between steps.

### 3.2 Radius

| Token | px | Use |
|---|---:|---|
| `xs` | 6 | Chips, badges |
| `sm` | 10 | Buttons, inputs |
| `md` | 14 | Cards, tiles |
| `lg` | 20 | Sheets, feature cards, photo heroes |
| `xl` | 28 | Modal tops |
| `pill` | 999 | Pills, medallion labels, FABs |

Bigger than v1 (which had 4/6) — 2026 mobile reads soft, and 4px corners on a photo card look like a 2016 web app.

### 3.3 Depth — the 2026 spatial model

Current mobile design has returned to depth, but *with restraint and purpose*: layering, elevation, translucency and blur used to say **which layer you are on**, not for decoration. That is the model here.

Five levels. Only one element per screen may sit at `focus`.

| Level | Shadow | Use |
|---|---|---|
| `flat` | none, hairline only | List rows, quiet groupings |
| `rise` | `0 2 8 rgba(94,58,26,0.10)` | Cards, chips — the default for anything tappable |
| `float` | `0 8 20 rgba(94,58,26,0.16)` | Sheets, sticky bars, floating search |
| `focus` | `0 16 36 rgba(94,58,26,0.24)` | **The one focal element** |
| `glow` | `0 10 26 rgba(201,162,39,0.42)` | Primary CTA · selected date. Gold, not grey. |

Shadows are warm (`#5E3A1A` family) on light surfaces and true black on `royal`.

**Translucency:** `expo-blur` is already a dependency. Use it for the collapsing header, the tab bar over content, and modal backdrops — never as a decorative panel over a flat colour, which just looks muddy.

---

## 4. Layout

### 4.1 Bento composition — the replacement for tile grids

Home and hub screens use **asymmetric modules**: related content grouped into blocks of deliberately unequal weight. One large block anchors, smaller blocks orbit. This is why the eye has an entry point.

Forbidden: a grid of N identical tiles. If everything is the same size, nothing is important, and the screen reads as an unfinished placeholder.

### 4.2 Screen skeleton

```
safe-area top
  ┌ header ─────────── greeting · display type · search
  ├ signature ───────── arch medallion row (the brand gesture)
  ├ FOCAL ──────────── one feature block, `focus` + `glow`
  ├ rails ───────────── each with a real destination
  ├ secondary ───────── cities, guides, slow paths
  └ sticky action bar ─ one primary action, `glow`
safe-area bottom
```

### 4.3 The Mehrab — the signature

`src/components/signature/arch-path.ts` draws a Mughal pointed arch; `JaalPattern.tsx` draws a jaali lattice. **These are the app's only truly ownable visual assets** — every reference board in this category is generic Western e-commerce, and an arch cannot be lifted onto a coffee app.

- **Arch:** category medallions, the featured block, and as a `goldRim` hairline over hero photography. **One arch cluster per screen.** Repeated everywhere it becomes wallpaper.
- **Jaali:** only on `royal`, at low opacity. On light surfaces it turns to mud. A texture you feel, not a pattern you notice.

---

## 5. Motion

| Token | ms | Use |
|---|---:|---|
| `instant` | 120 | Press feedback |
| `fast` | 180 | Chips, toggles |
| `base` | 260 | Sheets, transitions, cross-fades |
| `slow` | 380 | Screen entry, list stagger |
| `cinematic` | 780 | Confirmation reveal, light sweep. Peak moments only. |

Stagger 50ms per item, capped at 6 items. Springs: `press` (crisp), `settle` (no overshoot), `celebrate` (bouncy — heart pop and confirmation only).

**Every motion respects `useReducedMotion()`.** Excess animation is the fastest way to make a considered design feel generated.

---

## 6. Navigation

Sourced against current guidance: primary navigation belongs in the **thumb zone** — the bottom ~40% of the screen — and a tab bar should carry **3–5 destinations**, four being the usual sweet spot. More than five makes targets too small for a thumb. Icons need **labels** unless universally understood, and the active tab must be marked by colour *and* weight or an indicator. Innovation belongs in content, never in wayfinding.

**Decision: five docked tabs, labelled.**

| Tab | Purpose |
|---|---|
| Home | Discovery |
| Explore | Search, filter, browse |
| Plan | Shortlist, cart, planning tools |
| Inbox | Chat, quotes, notifications |
| Account | Bookings, payments, profile |

Five is the ceiling, and it is justified because each is a genuine top-level destination with its own stack — but **nothing may be added**. A sixth destination goes inside Account, not into the bar.

- Docked, not floating: a floating bar costs every screen bottom padding and clips content.
- Active = gold icon (filled) + gold label + `goldWash` pill. Inactive = `muted` outline icon + label.
- Selection haptic on switch. Badge counts on Inbox and Plan.
- Back **always** goes somewhere sensible. Every screen deep-linkable. Tab state survives switching.

---

## 7. Migration

v3 is a token-layer change, so it lands in one place and every screen inherits it.

1. Add the four font packages; extend `theme/fonts.ts` with the new scale.
2. Rewrite `theme/tokens.ts` to the tables above, **keeping the v1 semantic key names** (`colors.textPrimary`, `colors.surface`, …) so no screen import changes.
3. Update `scripts/verify-contrast.mjs` with the new pairs and run it — **the gate must be green before any screen work**.
4. Re-verify every screen against the 10 gates. A token change touches everything, so nothing keeps its `[x]`.

Keep the v1 hexes in a `legacy` export for one cycle, so anything still referencing them is visible rather than silently wrong.
