# 05 — UI spec: the widget design book

**Every component's anatomy, exact dimensions, tokens, variants and states.** This is the build sheet. A component that is not specified here does not get built; a component built differently from here is a defect.

Governed by [../rules.md](../rules.md). Tokens from [02-DESIGN-SYSTEM.md](02-DESIGN-SYSTEM.md). Inventory in [03-COMPONENTS-AND-LIBRARIES.md](03-COMPONENTS-AND-LIBRARIES.md).

**Notation** — all numbers are px. `T.x` = a token. Never a raw value in code.

---

## 0. Universal laws for every widget

| # | Law |
|---|---|
| 1 | **Touch ≥ 44.** Visual box may be smaller; make up the difference with `hitSlop`. |
| 2 | **Reserve space for conditional children.** Dots, badges, underlines, error text keep their height when absent. A row that shifts 2px on state change reads as broken. |
| 3 | **Gap, never margin.** Siblings are spaced by the parent's `gap`. |
| 4 | **Tokens only.** No raw hex, no raw spacing, no off-scale font size. |
| 5 | **Every widget that renders text takes `urdu`** and forwards it to `Text`. |
| 6 | **Every control has `accessibilityRole`, a label, and state.** |
| 7 | **Press feedback is `usePressScale`** — no opacity-only presses. |
| 8 | **Disabled = `opacity 0.5` + no haptic + no press scale.** Never a colour change alone. |
| 9 | **Numbers use `mono`.** Prices, counts, capacities, ratings, dates in columns. |
| 10 | **Assume null.** Every prop that comes from the API may be missing. |

### The depth budget, per screen

| Level | How many | What |
|---|---|---|
| `glow` | **1** | The primary action, or the selected date |
| `lg` | **1** | The focal element |
| `md` | 1–2 | Sticky bar, open sheet |
| `sm` | many | Cards, chips |
| `none` | many | Rows, groupings |

Two `lg` elements on one screen is a defect, not a preference.

---

## 1. Text

The only typography primitive. Every string in the app renders through it.

**Props** `variant` · `tone` · `align` · `italic` · `urdu` · `weight` · `numberOfLines`

| Variant | Family | Size/LH | Tracking |
|---|---|---|---|
| `hero` | Fraunces 600 | 44/48 | −0.9 |
| `display` | Fraunces 600 | 32/37 | −0.5 |
| `h1` | Fraunces 600 | 26/31 | −0.3 |
| `h2` | Fraunces 500 | 21/26 | 0 |
| `h3` | Jakarta 600 | 17/22 | 0 |
| `title` | Jakarta 600 | 16/21 | 0 |
| `bodyLead` | Jakarta 400 | 16/26 | 0 |
| `body` | Jakarta 400 | 15/23 | 0 |
| `bodyMedium` | Jakarta 500 | 15/23 | 0 |
| `label` | Jakarta 600 | 13/17 | 0.13 |
| `caption` | Jakarta 400 | 13/18 | 0 |
| `overline` | Jakarta 700 | 11/14 | **1.76**, uppercase |
| `button` | Jakarta 600 | 14/18 | 0.2 |
| `mono` | Geist Mono 500 | 14/19 | 0 |
| `monoLarge` | Geist Mono 600 | 20/24 | 0 |

**Tones** `primary`(ink) `body` `muted` `faint` `label`(gold-brown) `gold` `onDark` `onGold` `success` `danger` `inherit`

**Rules**
- Urdu multiplies line height **×1.7** and sets `writingDirection: rtl`.
- Italic is **Fraunces only**, for romantic phrases (*your perfect day*). Never for emphasis in body copy.
- `faint` is decorative — placeholders and disabled only. **Never body copy.**
- Nothing between `caption` (13) and `body` (15). Pick one.

---

## 2. Button

```
┌──────────────────────────────────┐
│  [icon]  Label  [iconRight]      │  height per size, radius T.radius.sm (10)
└──────────────────────────────────┘
```

| Size | Height | Padding-x | Icon | Text |
|---|---:|---:|---:|---|
| `sm` | 38 | `T.md` 12 | 16 | `button` |
| `md` | 48 | `T.xl` 24 | 18 | `button` |
| `lg` | 54 | `T.xl` 24 | 20 | `button` |

| Variant | Fill | Text | Border | Depth |
|---|---|---|---|---|
| `primary` | `gradients.goldCta` | `onGold` | none | **`glow`** |
| `secondary` | transparent | `goldDark` | 1px `primary` | none |
| `ghost` | transparent | `textBody` | none | none |
| `danger` | `danger` | `white` | none | `sm` |

**States** — default · pressed (`usePressScale` 0.97 + `haptics.light`) · loading (spinner, **width locked** so the bar doesn't jump) · disabled (`opacity 0.5`, no haptic).

**Rules** Only `primary` may carry `glow`. One `primary` per screen, and on a screen with a sticky bar it belongs in the bar, not inline. Gradient is vertical (`{x:0,y:0}`→`{x:0,y:1}`).

---

## 3. Card

| Variant | Bg | Border | Radius | Depth | Use |
|---|---|---|---|---:|---|
| `flat` | `card` | 1px `border` | `md` 14 | none | Rows, quiet groupings |
| `rise` | `card` | 1px `border` | `md` 14 | `sm` | **Default** for anything tappable |
| `focus` | `card` | 1px `borderAccent` | `lg` 20 | `lg` + gold under-glow | **The** focal element |

`focus` under-glow: a sibling `View` behind the card, inset `left/right 10, top 16, bottom −8`, `rgba(201,162,39,0.36)`, radius `lg`, plus `elevation.glow`. Drawn as a sibling because `shadowColor` on a bordered `overflow:hidden` view renders inconsistently between Android elevation and iOS shadows.

Padding `T.lg` 16 when `padded`. Press → `usePressScale(0.99)`.

---

## 4. Input · FormField

```
Label                                    ← T.label, tone label, mb T.xs
┌──────────────────────────────────────┐
│ [icon]  value / placeholder      [×] │  h 48, radius T.sm, border 1px
└──────────────────────────────────────┘
Hint or error                            ← height RESERVED, mt T.xs
```

| State | Border | Extra |
|---|---|---|
| default | `border` | — |
| focused | `primary` | gold rim: `shadowColor primary, opacity .18, radius 4` |
| error | `danger` | error text in `danger` |
| disabled | `border` | bg `disabledFill`, `opacity .6` |

**Rules** The hint/error slot **always reserves its height** — a field that grows on error pushes the submit button under the thumb mid-tap. `ref` is a normal prop (React 19 ref-as-prop). Numeric fields use `keyboardType` **and** render `mono`.

`FormField` wraps `Input` and adds: required marker (`*` in `danger`), character counter, and the draft-restore banner. Validation fires **on blur**, never per keystroke.

---

## 5. Chip · ChipSelect

Height 34 · radius `pill` · padding-x `T.md` 12 · gap 6 · text `label`

| State | Bg | Text | Border |
|---|---|---|---|
| default | `card` | `textBody` | 1px `border` |
| selected | `gold` | `onGold` | none |
| dismissible | `goldScale.subtle` | `goldDark` | 1px `borderAccent` |

`ChipSelect` is a horizontal scroll with an "All" chip first. **Selection is a route param where the screen is deep-linkable** — never local state synced by an effect.

---

## 6. Badge

Height 22 · radius `pill` · padding-x 8 · icon 11 · text `overline` at 9

| Tone | Bg | Text |
|---|---|---|
| `gold` | `goldScale.subtle` | `goldDark` |
| `verified` | `goldScale.subtle` | `goldDark` + `checkmark-circle` |
| `elite` | `gradients.goldCta` | `onGold` + `star` |
| `shaadi` | `blush` | `shaadi` |
| `dark` | `charcoalSurface` | `onDark` |
| `success` `warning` `danger` | matching `*Bg` | matching fg |

On a card narrower than 170, the verified badge is **the icon alone** — the word truncates the category beside it.

---

## 7. SectionHeader

```
BROWSE BY CATEGORY                        View all  ›
└ overline, tone label, tracking 1.76     └ caption/medium, gold, chevron 12
```

Baseline-aligned, `justify: space-between`, gutter `T.xl` 24 on both sides.

**Every rail must pass `onViewAll`.** A rail that ends in nothing is a dead end and the most common missing tap in the app.

---

## 7b. TrustRow — added from evidence (MB1)

Airbnb gives trust its **own bordered strip**, immediately under the title and **above** the specs. Research prices verified reviews + response time + completion rate at **10–25% conversion** in service marketplaces, and states that placement matters more than presence — a trust signal below the fold "is decoration".

```
┌──────────────┬──────────────────┬──────────────┐   1px border, radius md
│    4.96      │   🏆 Elite       │     298      │   3 equal cells
│   ★★★★★      │     Verified     │   Reviews    │   divider between
└──────────────┴──────────────────┴──────────────┘
```

| Cell | Content | Type |
|---|---|---|
| 1 | Rating to 2dp + 5 stars filled to value | `monoLarge` + 11px stars |
| 2 | The **single highest** earned badge — `Elite` > `Verified` > `reliability.tier` | icon + `overline` |
| 3 | Review count, **tappable → scrolls to reviews** (MB6) | `monoLarge` + `overline` |

**Degradation** — no reviews → cell 3 becomes `NEW`, cell 1 hides, and the strip renders 2 cells. **No trust data at all → the strip hides**, same rule as `SpecStrip`. Never a strip of dashes.

**Placement is fixed:** under the vendor name, above `SpecStrip`. It may not be moved below the fold.

---

## 7c. VendorHostCard — added from evidence (MB2)

The biggest gap the research exposed. Airbnb sells the **host as a person** — *"Stay with Allison · Superhost · 7 years hosting"* — because a named human with visible tenure is the strongest trust signal a marketplace has. We hold `ownerName`, `ownerBio`, `yearsInBusiness`, `weddingsCompleted` and `reliability.tier` and display **almost none of it**.

```
┌────────────────────────────────────────────┐
│ ◔  Hosted by Rehman Yousaf              →  │  avatar 44, title
│    Trusted vendor · 5 years · 120 weddings │  caption muted, mono numbers
│                                            │
│ "We have hosted Lahore weddings since…"    │  bodyLead, 3 lines, expandable
└────────────────────────────────────────────┘
```

Avatar 44 circle with the tier badge overlaid bottom-right. Row → vendor profile.

**Degradation** — no `ownerName` → the card **hides entirely** rather than saying "Hosted by null". Unclaimed OSM imports have no owner, which is ~98% of listings, so this must be silent when absent.

---

## 8. SpecStrip

```
├──────────┬──────────┬──────────┬──────────┤   1px hairline top + bottom
│  [icon]  │  [icon]  │  [icon]  │  [icon]  │   icon 15, goldDark
│   500    │   10%    │    5     │    AC    │   mono 13, ink
│  SEATED  │ ADVANCE  │  YEARS   │  INDOOR  │   overline 9, label
├──────────┴──────────┴──────────┴──────────┤   1px divider between cells
```

Cell padding-y `T.md` 12 · gap 4 · equal flex.

**Rules** Cells with a null value are **dropped, not shown empty**. Below **2** real facts the whole strip **hides** — a strip of four dashes reads as a broken screen, and ~98% of listings are unclaimed imports with mostly-null columns.

---

## 9. StickyActionBar

```
┌────────────────────────────────────────────────┐  bg surface, 1px top border
│ ┌────┐ ┌────┐ ┌──────────────────────────────┐ │  depth md
│ │ 46 │ │ 46 │ │  Label            ← 13/16    │ │  CTA: gradients.goldCta
│ └────┘ └────┘ │  Rs 350,000       ← mono 11  │ │  radius sm, GLOW
└───────────────┴──────────────────────────────┴─┘  pb: T.md + insets.bottom
```

Secondary squares 46×46, radius `md`, bg `white`, 1px `border`, depth `sm`, **max 2**.
CTA height 46, flex 1, gradient vertical, depth `glow`.

**Rules**
- **The only place in the app a saturated gold fill plus glow exists.** This is how "one primary action per screen" is enforced structurally rather than by discipline.
- Label and meta **stack vertically**. Side by side at 360px with two squares the CTA is ~170px and both truncate — *"Request booki… · Rs 350,000"*.
- Bottom inset adds to **padding, never height**, so proportions are identical across devices.
- Screen content needs `paddingBottom` ≥ 120.

---

## 10. Calendar

**Revised 2026-08-17 against Airbnb's shipping date picker** — see [07-DESIGN-RESEARCH.md](07-DESIGN-RESEARCH.md) §7b.2. The original spec here used paged months with `‹ ›` arrows and exact-date-only selection. Airbnb does neither, and is right on both counts.

```
  [ Dates │ Months │ Flexible ]           SegmentedControl — MODE
  ─────────────────────────────
   M   T   W   T   F   S   S              sticky weekday header, overline 9
  September 2026                          h2, inline in the scroll
  ┌───┬───┬───┬───┬───┬───┬───┐
  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │           cell: circle 38, hitSlop 3 → 44
  │ · │ · │ · │ · │ · │ · │ · │           dot row: height 6, ALWAYS reserved
  └───┴───┴───┴───┴───┴───┴───┘
  October 2026                            ← CONTINUOUS vertical scroll
  ┌───┬───┬───┬───┬───┬───┬───┐
   …
  ─────────────────────────────
  [Exact dates][± 1 day][± 2 days]        flexibility chips
        ● Open  ● Few left  ● Booked      legend, caption 9
```

**Continuous vertical scroll, not paged.** Weddings are booked 6–12 months out; a pager costs 6–12 taps to reach a date the couple already has in mind. Each month block still renders **6 rows × 7 = 42 cells** so no block ever changes height.

**Three modes** (`Dates │ Months │ Flexible`). This is not decoration: a Pakistani couple often knows *"December, maybe mid-month"* before a date, and frequently picks the date **around vendor availability** — the reverse of a hotel booking. `Months` mode shows which months have the most open slots.

**Flexibility chips** — `± 1 day` / `± 2 days` widens the search. If the 14th is booked and the 15th is open, say so rather than making them hunt. We already hold per-day availability, so this is nearly free and it rescues an otherwise-dead search.

| Day state | Number | Dot |
|---|---|---|
| `open` | `ink` | `success` |
| `limited` | `ink` | `warning` |
| `full` / `blocked` | `muted`, disabled | `danger` |
| `unknown` | `ink`, selectable | **none** |
| outside month | `faint` (**greyed, still visible** — MB10) | none |
| before `minDate` / after `maxDate` | `faint`, disabled, strikethrough | none |
| today | `ink` + 1px `goldRim` ring | as state |
| **selected** | `onGold` on `gradients.goldCta` | none | **`glow`** |

**`unknown` is not `open`.** It means we have not been told. Selectable, but draws no dot — the UI never promises what it has not verified.

---

## 11. SlotPicker

```
┌──────────────────────────────────────────────┐
│ Baraat                          2 of 3 left  │  name: title 12.5
│ 7 PM to 11 PM                                │  hours: caption 9.5, muted
└──────────────────────────────────────────────┘  count: mono 9
```

Row: padding 11×13, radius `sm`, bg `white`, 1px `border`, depth `sm`, gap `T.sm` between rows.
Selected: 1px `primary` + `goldScale.subtle` bg + depth `sm`. Unavailable: `opacity 0.44`, no depth, `"Booked"` in `danger`.

**Capacity colour:** `free/capacity > 0.5` → `success` · `≤ 0.5` → `warning` · `0` → `danger`.

**Rules**
- `capacity` (concurrent **bookings**) ≠ `unitGuestCapacity` (guests in **one** booking). Show `free of capacity`; validate guests against `unitGuestCapacity`.
- Hours use the word **to**, never an en-dash.
- Two engines: vendor templates, else the four legacy periods.

---

## 12. Sheet

Radius `xl` 28 top · bg `surface` · grabber 36×4 `border` · backdrop `veil`.

**`maxHeight: 88%` with the body scrolling internally, and the action row pinned outside the scroll.** The web's dialogs have no height cap, so tall ones put their actions off-screen at 360px — the single most-repeated layout defect in this product. Every sheet here caps.

**Footer grammar (MB16)** — `Clear all` / `Reset` bottom-**left** as a text button, the advancing action bottom-**right**. Same left-reset / right-advance grammar Airbnb uses in both its filter sheet and its date picker, and consistent across every sheet in this app. Never a full-width CTA in a sheet: full-width reads as "the only thing you can do", which is wrong when a reset exists.

---

## 12b. FilterSheet — revised from evidence (MB13–MB16)

Our sheet has 17 filters and 6 sorts and gives **no feedback until you apply and close**. Airbnb's filter flow makes the button itself the feedback.

```
✕                Filters
─────────────────────────────────────
Category
[All 3,274][Venues 716][Photo 60]      ← option + ITS COUNT (MB15)
─────────────────────────────────────
Price range
   ▁▃▅█▇▅▃▁▁▂▁                         ← HISTOGRAM of real inventory (MB14)
   ○──────────○
  [Min Rs 50,000] — [Max Rs 2,000,000]  ← inputs under the slider
  ⚠ 2,981 vendors have no price listed   ← honest about thin data
─────────────────────────────────────
… rating · capacity · amenities · sort …
─────────────────────────────────────
Clear all              [ Show 142 vendors ]   ← LIVE COUNT (MB13)
```

**Live count** recomputed on every change against the already-loaded set. At zero it disables and **names the filter to relax** — never a bare "no results".

**Histogram** is 24 buckets over the priced subset, `sunken` bars with the in-range span in `gold`. On a catalogue where ~98% carry no price it also shows honestly how thin priced inventory is, which is information the customer deserves rather than a slider implying full coverage.

This is nearly free for us: "full mode" already loads the whole category set client-side, so counts and distribution cost no extra request.

---

## 12c. Chat composer — quick replies (MB17)

```
┌──────────────────────────────────────────┐
│ (Is 14 Sep free?)(What's included?)(…)   │  quick-reply chips, h-scroll
├──────────────────────────────────────────┤
│ [+]  Type a message…              [ → ] │  composer
└──────────────────────────────────────────┘
```

Chips are `Chip` at `sm`, horizontally scrolling, above the composer. Tapping one **sends immediately** — it is an answer, not a draft.

**Why this earns its place:** chat exists to keep the conversation on-platform instead of drifting to WhatsApp, where we lose all visibility. Typing on a phone is friction; typing Urdu on a phone is worse. Five tappable questions that a couple actually asks — *"Is 14 Sep available?"*, *"What's included?"*, *"Can you do 500 guests?"*, *"What's the advance?"*, *"Can we bring our own caterer?"* — remove that friction and hand the vendor a structured question they can answer in one tap.

Chips are **contextual**: the vendor's category and the customer's active date drive the set. A photographer gets *"Do you cover Mehndi and Baraat?"*, not *"How many guests?"*.

**Message payloads (MB18)** — the message list renders typed payloads, not only text: `text` · `availability` (a date card) · `quote` (links to the real quote) · `image`. This is a **data-model decision that must be made before S14 is built**, not retrofitted.

---

## 13. SegmentedControl · Stepper

**Segmented** — track h 40, radius `pill`, bg `sunken`, 3px padding. Thumb: `gradients.goldCta`, radius `pill`, depth `sm`, text `onGold`; inactive text `textBody`. 2–4 segments only; 5+ becomes chips.

**Stepper** — `[−] 12 [+]`, buttons 36 circle, 1px `border`, bg `white`; value `mono` 16, min-width 44 so the row doesn't reflow 9→10. Disabled at bounds. Long-press repeats after 500ms.

---

## 14. MoneyRow · TotalsCard

```
Package · Gold                       Rs 620,000     label / mono, ink
Décor add-on                       + Rs  40,000     label / mono, ink
─────────────────────────────────────────────────   hairline
Total                                Rs 660,000     title / monoLarge, ink
Advance paid                          Rs 66,000     label / mono, SUCCESS
Balance on the day                   Rs 594,000     label / mono, DANGER
```

**Rules** Right-aligned, `mono`, tabular — figures must align down the column. Money-in `success`, owed/out `danger`, **never gold**. Never `Rs 0` → "On request". Totals row separated by a hairline and stepped up to `monoLarge`.

---

## 15. StatusTimeline

```
 ●───  Requested          14 Aug, 3:40 PM     done: success dot, ink
 │
 ●───  Confirmed          15 Aug, 11:02 AM
 │
 ◍───  Advance paid       pending             current: gold ring + pulse
 │
 ○───  Event day          14 Sep             future: muted hollow, faint text
```

Rail 2px at x=5. Dot 12 (current 16). Row min-height 56.
Fed by `/bookings/:id/history`. Reduced motion → no pulse.

---

## 16. VendorCard

```
┌────────────────────────────┐
│ [Featured]      [⇄] [♥]    │  ribbon TL; icons 30 circle, TR at 7/41
│         photo 4:3          │  img() at IMG.card
│ ★ 4.3 (3)                  │  rating pill BL: mono, on rgba(44,24,16,.62)
├────────────────────────────┤
│ VENUES ✓                   │  overline + verified ICON only
│ Rehman Grand               │  title 15/19, TWO lines
│ Marquee                    │
│ 📍 Johar Town, Lahore      │  caption, muted, 1 line
│ ────────────────────────── │  hairline
│ Rs 350,000                 │  mono, gold — FULL ROW
└────────────────────────────┘
```

Radius `md` 14 · depth `sm` · body padding `T.md` 12, gap 4 · press 0.98.

**Why the rating sits on the photo:** at 2-up on 360px the body is ~140px. Price and rating side by side meant **both** truncated — *"Rs 350,0…"* beside *"★4.3(3)"*. A price you cannot read is worse than no price, so the rating moved onto the image and the price gets the whole row.

**No image** → `MonogramFallback`: `gradients.roseWash` + the initial in Fraunces italic 46 at `gold` 50%.

---

## 17. ArchMedallion — the signature

```
    ╭─────╮        Mehrab arch mask, aspect 0.79
   │       │       archPath() normalised: r .06, spring .46, apex .015
   │ photo │       1.25px goldRim outline
   ╰───────╯
    Venues         caption 11/14, centre, ≤2 lines
      ▬            underline 18×2 gold when active, space ALWAYS reserved
```

Active = `elevation.glow` on the arch. **No border change, no tint** — the photography must never be colour-shifted.

Width is **computed and passed in**, never flexed: `ArchImage` builds an SVG path from concrete px, so a percentage width renders a zero-size arch. Row shows **4.4 across** so the fifth peeks and the row reads as scrollable.

**One arch cluster per screen.** Repeated everywhere it becomes wallpaper and stops signifying anything.

---

## 18. PhotoHero

```
┌──────────────────────────────┐
│ ‹              [share] [♥]   │  circles 36, top = insets.top + 8
│        ╭───╮                 │  arch whisper, goldRim @ .5, 34% width
│        photo (paging)        │  h 280, img() at IMG.hero
│      ▬ · · ·                 │  dots bottom 34: active 17×5, rest 5×5
└──────────────────────────────┘
```

**Both scrims are unconditional** — `topScrim` 110 tall for status-bar glyphs, `photoScrim` from 40% down. They cost nothing on a dark photo and rescue legibility on a bright marigold stage, which is what this catalogue is full of.

Content sheet **overlaps by 24**, radius `lg` 20 top, bg `screen`, depth `md` upward.

No parallax: a transform fights the horizontal pager, and this app has five crashes of history with New-Architecture animation loops.

---

## 19. Skeleton · EmptyState · Toast

**Skeleton** — shaped like the real content, never a grey block: a card skeleton is image-block + 2 text bars at the real widths. Shimmer 1200ms, `sunken`→`card`. Static under reduced motion.

**EmptyState** — icon 40 `faint` · title `h3` · message `body` muted, max 30ch · **always an action button**. Never a dead end.

**Toast** — bottom, above the sticky bar, radius `sm`, depth `md`, 3s. Success `successBg`/`success`, error `dangerBg`/`danger`. **Copy must match the control that fired it**: "Publish" → "Published".

---

## 20. CustomTabBar

Height 60 + `insets.bottom` · bg `surface` @ .98 · 1px top `border` · depth `sm`.
Item: icon box 36×24 radius `pill`, icon 19, label `overline` 8.5.

Active = filled icon + `goldDark` + `goldScale.subtle` pill. Inactive = outline + `textSoft`.
`haptics.selection` on switch. Badge: 16 circle, `danger`, `mono` 9, top-right of the icon box.

Five labelled tabs. **Docked, not floating** — a floating bar costs every screen bottom padding and clips content. **Nothing may be added**; a sixth destination goes inside Account.

---

## 21. Build order for P2

1. `Text` — everything depends on it
2. `Button`, `Card`, `Input`, `Chip`, `Badge`
3. `Skeleton`, `EmptyState`, `SectionHeader`, `Toast`
4. `Sheet` ← unblocks every modal
5. `SegmentedControl`, `Stepper`, `FormField`
6. `MoneyRow`/`TotalsCard`, `StatusTimeline`
7. `SlotPicker`, `MonogramFallback`
8. Re-verify `VendorCard`, `ArchMedallion`, `PhotoHero`, `Calendar`, `SpecStrip`, `StickyActionBar` against this spec

Each gets a `dev.tsx` gallery entry showing **every variant × every state**, checked at 360px before any screen consumes it.
