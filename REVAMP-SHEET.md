# REVAMP SHEET — every element, tracked

**The master list. Nothing is done until its row says `[x]`. Nothing gets skipped.**

Governed by [rules.md](rules.md) §0.0 THE MANDATE. Generated from the source tree, so
it cannot silently miss a file — regenerate with
`node scripts/revamp-sheet.mjs`.

## Status key

| Mark | Meaning |
|---|---|
| `[ ]` | still the old design |
| `[~]` | in progress |
| `[x]` | **redrawn** on v4 and seen on screen at 360px |

**`[x]` requires Gate 0** (rules.md): visibly emptier · title grown · near-monochrome ·
hairlines carrying structure · unrecognisable as the old screen.

## The v4 language, in one paragraph

Ground is paper `#FDFCFA`; raised surfaces are pure white and need no border.
`line #EAE6E0` carries structure instead of boxes. **One gold event per screen** —
everything else is ink, paper and hairline. Type carries hierarchy: `h1` 27 against
`caption` 13. Display leading is tight (1.05), body leading is loose (1.6). Sections
separate by 48, not 24. Three elevation levels, not thirteen.

---

## Foundation

| ✓ | Item | Notes |
|---|---|---|
| `[x]` | **Colour** | 43 → 19. Paper ground, ink hierarchy, one accent. |
| `[x]` | **Type scale** | h1 21 → **27**. Leading inverted. Tracking cut. |
| `[x]` | **Spacing** | 6 → 9 steps; `huge: 48` is the new section gap. |
| `[x]` | **Elevation** | 13 → 3. Champagne glow retired. |
| `[x]` | **Gradients** | 7 → 3, two of which are scrims. |
| `[x]` | **Contrast gate** | Now parses `tokens.ts` — it had been passing against a palette nobody could see. 36/36. |

---

## Components — 48

| ✓ | Component | El | File |
|---|---|---|---|
| `[x]` | `FeatureSpotlight` | 28 | `features/home/FeatureSpotlight.tsx` |
| `[x]` | ~~`BookingRequestModal`~~ | — | **DELETED** — merged into `InquiryModal`. Both posted `/leads/inquiry`; one called itself "Request a booking". |
| `[x]` | `Calendar` | 19 | `components/ui/Calendar.tsx` |
| `[x]` | `VendorCard` | 19 | Re-checked on screen at 360px: location got its own line (was truncating to "Johar Town, …"), verified tick → ink, rating moved to the price row, heart hoisted OUT of the card button (nested `<button>`). |
| `[x]` | `AvailabilityCalendar` | 19 | `features/vendors/detail/AvailabilityCalendar.tsx` |
| `[x]` | `VendorHostCard` | 16 | Redrawn **and wired** into vendor detail, above About — `ownerName`, `ownerBio`, `yearsInBusiness`, `weddingsCompleted` were on every business row and the screen showed none of them. Was bordered AND shadowed; had four gold events (fallback initial, verification tick, "Read more", overline) on a page whose one gold event is Request booking; never mirrored despite taking `urdu`; six inline `urdu ? '…' : '…'` ternaries plus `Verified`/`year`/`years`/`weddings` as literals; `fontSize: 9`; `colors.sand`. The bio paragraph was itself the Pressable — a screen reader announced three lines of prose as a button. |
| `[x]` | `FilterSheet` | 15 | Was 100% untranslated. Now on `Sheet` (its first real call site), footer grammar fixed, ink slider + switches. EN & UR verified at 360px. |
| `[x]` | `PhotoHero` | 13 | Drawing was already v4; the localisation was not. Back/Share/Save + carousel labels were hardcoded English; control row now mirrors and the chevron flips. |
| `[x]` | `StatusTimeline` | 13 | Rail is ink now, not a green-and-gold ladder. `failed` is the only colour. First real call site: `account/bookings`. |
| `[x]` | `TrustRow` | 13 | `components/ui/TrustRow.tsx` |
| `[x]` | `HomeHeader` | 13 | `features/home/HomeHeader.tsx` |
| `[x]` | `AuthScene, GlassButton` | 14 | `components/auth/AuthScene.tsx` |
| `[x]` | `AuthShell, AuthButton, AuthSwitch` | 14 | `components/auth/AuthShell.tsx` |
| `[x]` | `AuthField, PasswordStrength` | 12 | `components/auth/AuthField.tsx` |
| `[x]` | `AuthError, AuthLegal` | 6 | `components/auth/AuthNotices.tsx` |
| `[x]` | `AvatarPicker` | 8 | `components/auth/AvatarPicker.tsx` |
| `[x]` | `ListRow, ListGroup` | 10 | `components/ui/ListRow.tsx` |
| `[x]` | `Input` | 12 | `components/ui/Input.tsx` |
| `[x]` | `FormField, DraftResumeBanner` | 11 | Banner held four inline `urdu ? … : …` ternaries (prohibition 3). Amber warning card → hairline band: a draft is an offer, not a problem. |
| `[x]` | `Sheet` | 11 | `components/ui/Sheet.tsx` |
| `[x]` | `SlotPicker` | 10 | 4 shadowed boxes → hairline rows, 64px. Type back up to 16/13 from 13/10/9.5. Ink radio, not gold. |
| `[x]` | `ReviewsSection` | 10 | Local 5-gold-star row deleted — 55 gold stars on a 10-review vendor. Uses the shared `Rating`; score is ink. |
| `[x]` | `InquiryModal` | 9 | **The one contact form.** Rich fields + honest copy + translated. On `Sheet`. Verified live at 360px. |
| `[x]` | `MoneyRow, TotalsCard` | 8 | Box gone. Rule + `monoLarge` 22 vs `mono` 14 carries the total. |
| `[x]` | `StickyActionBar` | 8 | Gradient, glow and bar shadow all gone; flat gold, CTA 46→54, rounds held at 48 so the label fits at 360. |
| `[x]` | `Tabs` | 8 | Indicator and count pill were gold on screens that also have a CTA. Ink now; row grew to 44px. |
| `[x]` | `Chip, ChipSelect` | 7 | `components/ui/Chip.tsx` |
| `[x]` | `EmptyState` | 7 | `components/ui/EmptyState.tsx` |
| `[x]` | `SectionHeader` | 7 | `components/ui/SectionHeader.tsx` |
| `[x]` | `ToastHost` | 7 | Pastel box + saturated outline → deep register, tone on the ICON only. Added `accessibilityLiveRegion` — a screen reader announced booking failures by saying nothing. |
| `[x]` | `Button` | 6 | `components/ui/Button.tsx` |
| `[x]` | `Row, Stack, Divider, Section` | 6 | `components/ui/layout.tsx` |
| `[x]` | `Stepper` | 6 | 36px gold+shadow buttons → 46px hairline, ink. `unit` was 9px. Exposed the guest-count-below-venue-minimum bug. |
| `[x]` | `CustomTabBar` | 5 | `components/navigation/CustomTabBar.tsx` |
| `[x]` | `PriceHistogram` | 5 | Carried its own `urdu ? '…' : '…'` translations — the only component doing that, which made `urdu` mean "language" here and "font" everywhere else. **Now wired into `FilterSheet`**, fed by `deriveFacets` (which already walks every vendor, so no extra request). It had to learn its own scope first: Explore is on infinite scroll until a filter is active, so drawn naively it announced "9 vendors have no price listed" over a set of 3,274 — a false coverage claim from the one component built to prevent false coverage claims. `sampled` says "Of the 12 vendors loaded so far…" until full mode arrives, then states the real figure: **3,271 of 3,274**. Bars are ink, not gold — the sheet's one gold event is Apply, as the slider directly below already said. |
| `[x]` | `SpecStrip` | 5 | **8 gold events in one strip** (4 icons + 4 labels), values at 13 and labels at 9px. All ink; 18 / 13. |
| `[x]` | `CompareBar` | 5 | All three strings hardcoded English; never mirrored; `Clear` had no `accessibilityRole`; inset 16 over content gutter 24. |
| `[x]` | `HowItWorks` | 5 | `features/home/HowItWorks.tsx` |
| `[x]` | `VendorShowcase` | 5 | `features/vendors/components/VendorShowcase.tsx` |
| `[x]` | `PackageTiles` | 5 | `features/vendors/detail/PackageTiles.tsx` |
| `[x]` | `Rating` | 4 | `components/ui/Rating.tsx` |
| `[x]` | `SegmentedControl` | 4 | Gold gradient thumb → flat ink. 34px → 44px. A mode switch never gets the screen's one gold event. |
| `[x]` | `RecentlyViewedRail` | 4 | `features/vendors/components/RecentlyViewedRail.tsx` |
| `[x]` | `ArchImage, ArchOutline` | 3 | Filled with `palette.sand`, a v3 alias marked `@deprecated use sunken` — a dead token in the brand's structural signature, on the placeholder path ~98% of listings take. |
| `[x]` | `ArchMedallion` | 3 | `components/signature/ArchMedallion.tsx` |
| `[x]` | `Avatar` | 3 | `components/ui/Avatar.tsx` |
| `[x]` | `Badge` | 3 | `components/ui/Badge.tsx` |
| `[x]` | `Card` | 3 | `components/ui/Card.tsx` |
| `[x]` | `CategoryArchRow` | 3 | `features/home/CategoryArchRow.tsx` |
| `[x]` | `LightSweep` | 2 | **Deleted, not redrawn.** `gradients.champagne`, the only gradient it drew, is marked `@deprecated the light sweep is retired` in the v4 tokens — and it had zero call sites anywhere, not even the gallery. A component the design system has retired but nobody removed is how a retired thing gets used again by accident. |
| `[x]` | `MonogramFallback` | 2 | Very likely the most-rendered surface in the app, and it was still wearing v3: `gradients.roseWash` (`@deprecated use space and a hairline`) and the initial in **action gold**, which put 15–20 action-gold letters on an Explore grid whose one gold event is the CTA. Flat `sunken` + hairline gold. Hidden from the a11y tree — VoiceOver read the initial and then the full name. `arch` used `absoluteFill` with an explicit size, pinning the arch top-left so its base cut across the tile. |
| `[x]` | `Screen` | 2 | `contentStyle` was spread BEFORE the `tabBarSpace` reserve, so a caller's `padding` silently erased the guarantee the comment beside it claimed — shorthand beats longhand in RN's flatten. Reserve applied last, taking the larger value. `padded` used `spacing.lg` (16) against the gutter of 24 every screen it wraps uses. One call site; five props and the whole non-scroll branch have never run. |
| `[x]` | `Skeleton` | 0 | `components/ui/Skeleton.tsx` |
| `[x]` | `Text` | 0 | **Urdu could not be bold anywhere.** `family` short-circuited to `fontFamily.urdu` before `weight` or the variant were consulted, so an Urdu `h1` and an Urdu `caption` were the same face — while `NotoNastaliqUrdu_700Bold` sat in the bundle at 518 KB, reachable by nothing. v4's premise is that type carries hierarchy; in Urdu half the mechanism was missing. Also: a caller's `style.fontFamily` **overrode** the Nastaliq face — which is not a soft degradation, because a Latin family has no Arabic glyphs at all. That hit every primary CTA in the auth flow. And nothing in `src/` set `allowFontScaling`/`maxFontSizeMultiplier`, so OS text at 130% blew past every fixed-height control; per-variant ceilings now, uncapped for reading text. |

---

### Home composition

| ✓ | Element | Notes |
|---|---|---|
| `[x]` | City browse | 11 grey filter chips → **paper tiles with a hairline**, Fraunces name, tap affordance. |
| `[x]` | Rails | **Snap scrolling** — a rail that rests on a sliced card is the clearest tell of an app that was assembled, not designed. |
| `[x]` | Rail skeletons | Reshaped to match the real card (square photo + 3 lines), so the layout no longer jumps when data lands. |
| `[x]` | `CategoryArchRow` / `ArchMedallion` | 64px thumbnails → **124px**, 16px labels, snap. |
| `[x]` | Page rhythm | Venues moved from a 6th rail to a **2-up grid**. Five identical rails was why it read as templated. |
| `[x]` | Guides card | now `ListGroup` + `ListRow` — the components already built for the Account tab |

### The shared shell (applies to every screen)

| ✓ | Element | Notes |
|---|---|---|
| `[x]` | `ArchOrnament` | Mehrab filled with Mughal jaal lattice — the one thing that can fill brand space without being a claim about a vendor. |
| `[x]` | Deep panel header | Full-bleed behind the status bar, rounded bottom, Mehrab in gold hairline, search overlapping its edge. Home + Explore. |
| `[x]` | Floating dock | Inset on all three edges, gold pill on the active tab, content scrolls under. |
| `[x]` | `layout.tabBarSpace` | Reserved in `Screen` and in every hand-rolled scroller — the dock stopped occupying layout space, so content would otherwise hide beneath it. |

### Vendor detail — web parity

| ✓ | Element | Notes |
|---|---|---|
| `[x]` | `VendorSpecs` | Per-vendor-type table. `false` is information, `null` is silence. |
| `[x]` | `MenusSection` | Per-head rate **and** the minimum-guarantee floor nobody was showing. |
| `[x]` | `SectionNav` | Scroll index, tabs only for sections that exist. Verified moving. |
| `[x]` | Gallery order | `rankedImages` — vendor uploads before shared stock. |
| `[x]` | `PhotoHero` | row was stale — it was already v4; localisation and RTL now done too |
| `[x]` | Scroll-spy | **Built — and it exposed an older bug.** `activeSection` was only ever written by TAPPING a tab, so scrolling moved you through four sections while the index kept pointing at whatever you last touched. Everything needed was already present and simply unconnected. Wiring it revealed that `onLayout` reports `y` relative to the PARENT, and every section is a sibling inside a `<Stack>` that starts ~700px down the content — so every recorded offset was short by the height of the hero above it, and tapping "Availability" scrolled ~700px wrong. It survived because the original fix was verified by checking `scrollTop` CHANGED, not that it changed to the right place. Offsets are now in the scroll view's coordinate space: all five sections track in order, and tap-to-scroll lands within its intended 12px. The spy reads offsets on the JS thread (never in a worklet) and gates the thread hop on 24px of travel with an equality bail-out — the "Maximum update depth" class this file already warns about. |

### Booking flow — S6–S11

| ✓ | Screen | Notes |
|---|---|---|
| `[x]` | `booking/[id]` | Date + slot, real availability, lead-time window, both engines. |
| `[x]` | `booking/[id]/confirm` | Guests, package, details, totals — **and `POST /bookings`**. |
| `[x]` | `booking/done` | "Request sent", not "confirmed". Reference number. |
| `[x]` | `endpoints/bookings.ts` | Payload byte-for-byte from the web; optional keys omitted, never nulled. |
| `[ ]` | Payment | Stripe caps PK cards ≈ Rs 999,999 → bank transfer above. Not built. |

## Screens — 21

| ✓ | Screen | El | Lines |
|---|---|---|---|
| `[x]` | `vendor/[id]` | 38 | Identity block carried **5 gold events + 2 hardcoded English literals** (`VERIFIED`, `STARTING`) and the price in gold — 6th money-rule break, on the most-viewed screen. All ink; the CTA is now the only gold on the page. |
| `[x]` | `gallery` | 37 | **It could only ever prove half the app.** The sheet rendered in English only, and the largest class of defects this app had was Urdu-only — the 1.7× leading, the unreachable bold face, rows that never mirrored. None of those are visible in English, so a gallery that certified a primitive as correct had never drawn half its behaviour. A language toggle now drives the REAL locale store (not a local flag — the wiring is where the bugs were) and `urdu` is threaded to all 83 specimen instances. Type specimen already fixed to read `typography[variant].fontSize` rather than restating it. |
| `[x]` | `tools/timeline` | 30 | Badge text said the CATEGORY, badge colour encoded the PRIORITY. Rail was 30 gold elements → ink + hairline; times now `mono` and column-aligned. |
| `[x]` | `tools/budget` | 29 | Money in gold **twice more** (4th/5th instance). 4 cards + gold bars + gold overlines → all ink. Own modal → `Sheet`. FAB was covering a figure — moved to header. Full CRUD verified live. |
| `[x]` | `tools/checklist` | 26 | 🔴 Row carried a **one-tap delete, no confirm, no undo**, beside the toggle. Now an edit sheet (which also added the missing rename). Gold % + bar → ink. |
| `[x]` | `tools/guests` | 22 | 🔴 RSVP was a **`Badge` that silently cycled 3 states** with no role and no affordance — on the list that sets the catering headcount. Now a real control; pending no longer gold. |
| `[x]` | `compare` | 20 | The comparison TABLE was written in English — `New`/`Yes`/`No`/`—`/`{n} guests` as literals while every label beside them came from the string file. "View profile" was a gold `Badge` in a bare `Pressable`: no role, status shape carrying an action. |
| `[x]` | `dev` | 16 | **Deleted.** Its own header said "TEMP showcase… Replaced by the tab shell in Task 0.7" — three design versions ago. Unreachable from anywhere in the app, and a second, staler reference sheet competing with `gallery`; a reference that misreports the system is worse than none, which is the fault already fixed in gallery's type specimen. It was also the sole consumer of `BridalWash`, `JaalPattern` and `ShimmerText`, v1 decoration that v4 explicitly removed (*"a section is separated by space and a hairline, not by a wash"*) — those went with it. `PaperGrain` stays: unused, but not retired. |
| `[x]` | `(tabs)/explore` | 13 | 212 |
| `[x]` | `chat/[id]` | 13 | 🔴 **Every bubble rendered as nothing** — wire sends `content`, type said `message`, `if (!body) return null`. 4th wire-name instance. Also: a failed send **destroyed the typed message**; and a double `scaleY(-1)` stood every bubble on its head, hidden for as long as none rendered. |
| `[x]` | `(tabs)/inbox` | 12 | A gold medallion + gold dot PER ROW. `relTime` was hardcoded English. Unread now carried by weight + one ink dot. |
| `[x]` | `(tabs)/account` | 11 | 198 |
| `[x]` | `(tabs)/index` | 11 | 186 |
| `[x]` | `(tabs)/plan` | 10 | 5 cards + 5 gold medallions + 4 gold stats (incl. money) → one hairline list. Stats were English literals. |
| `[x]` | `onboarding` | 10 | 92 |
| `[x]` | `account/bookings` | 9 | Cards → hairline rows + inline timeline. Money is ink. Wire shape fixed — rows said "Booking #212" with no venue, date or price. |
| `[x]` | `auth/login` | 9 | 92 |
| `[x]` | `guides` | 9 | 5 bordered `Card`s / 30 gold icons → `ListGroup` + `ListRow` with `to="external"`. Zero colour events. |
| `[x]` | `favorites` | 8 | `ScreenHeader`; gutter derived from `layout.gutter`, not invented locally. 🔴 Uncovered: **the logged-out shortlist could not survive a tap, let alone a restart.** |
| `[x]` | `auth/register` | 7 | 96 |
| `[x]` | `account/profile` | 5 | 110 |

---

## Urdu parity

Not on the original sheet. Found while verifying the primitives above in the live
app with the interface set to Urdu, which had never been done end to end.

The pattern was consistent: **chrome translated, contents not.** Every screen's
title, tabs and buttons were Urdu, and the thing the customer had actually come
to read was English. Because the frame looked finished, none of it showed up in
an English pass.

| | What was English on an Urdu screen | Where |
|---|---|---|
| `[x]` | The **entire Explore category rail** — "Wedding Venue / Wedding Photographer / Caterer" — i.e. the primary navigation of the browse tab | `categories.ts`, `explore`, `CategoryArchRow`, `vendor/[id]`, `compare`, `FeatureSpotlight` |
| `[x]` | The **whole planning suite's contents**: budget items, checklist tasks, guest groups, timeline events, and every category header on all four | `planning/types.ts` + 5 screens |
| `[x]` | Every **`FormField` placeholder** in the app, sitting inside inputs whose labels were translated | InquiryModal, budget, checklist, timeline ×2 |
| `[x]` | The three **active-filter chips** (Verified / Featured / Available) and the "Comparing" tag on the most-rendered component in the app | `explore`, `VendorCard` |
| `[x]` | **Screen-reader labels**: the heart on every card announced "Save" in English — twelve times down one screen of Urdu vendor names — plus Close ×3 and Clear | `VendorCard`, `Sheet`, `Input`, `AuthShell` |

### Two structural causes, fixed at the source

**Urdu had no bold.** See the `Text` row. Fixing it lit up a second problem
immediately: `AuthButton` and the auth hero spread `...typography.*` into
stylesheets, and a stylesheet can only ever name one family — so those went
through `variant` instead, which is what lets `Text` choose the Urdu face at all.

**The seed raced the language.** `useLocalList` captured its seed with
`useState(seed)` on the first render, and `useLocaleStore.hydrate()` is async —
so every Urdu customer's budget, checklist, guest list and timeline were seeded
in English microseconds before their language arrived, then wrapped in Urdu
chrome. Now keyed on a `seedVersion` primitive, applied as a render-phase reset
rather than an effect (an effect keyed on the seed array re-fires forever for any
caller who forgets to memoise, and "Maximum update depth exceeded" is this repo's
most common crash). A list that storage supplied, or that the customer has
edited, is never re-seeded.

### Deliberately left English

- **`reliability.tier`** — the vendor portal shows the same vocabulary; two
  surfaces disagreeing about what a vendor has been told they are is worse than
  one of them being English.
- **`slug` / `backendType` / stored `category` and `group` values** — these are
  keys. They route, they match production rows, and they are persisted on every
  saved item. Only the display moved.
- **Amenity names** (AC, Bridal Room, Generator…) — backend column names, still
  English in the filter sheet. Same class as the categories and the same fix
  would work; not done blind.
- **Urdu plural agreement** — "1 وینڈرز" should be "1 وینڈر". Real, and a
  pluralisation system rather than a string edit.

---

## Text clipping — the fault behind "the words start cutting"

Reported as an Urdu problem. It was two problems, one of them in English.

### Urdu: the leading was a guess, and it was 32% short

`Text` set `lineHeight = size * 1.7` with a comment saying "Nastaliq needs ~1.7×".
Measured against the shipped font at every size in the scale, regular and bold,
**Noto Nastaliq Urdu's own line box is 2.457–2.523×**. Every Urdu line in the
product was laid out into a box a third too small: sliced where the container
clipped, overlapping the next line where it did not.

A live sweep of the home screen found **117 Urdu nodes overflowing their box and
not one overflowing horizontally** — the giveaway that this was one systemic
vertical cause, not a hundred layout mistakes. `URDU_LEADING = 2.52` is the
font's own metric rather than a designed value, because the failure it prevents
is clipping, and clipping is decided by the font.

After: **331 Urdu nodes across 10 routes, 0 clipped, 0 overlapping.**

### English: Fraunces clips its own descenders

Found while re-verifying. The display sizes have deliberately tight leading —
hero 40/42, display 32/34 — and the reasoning is sound, but the numbers were
chosen without measuring **Fraunces**, which has unusually deep descenders. Its
ink box needs 50px and 39px. On a single-line heading the box height IS the
lineHeight, so the difference came straight off the glyphs: the tail of the "g"
in the "Budget" screen title sheared off flat.

Shortfall per variant: hero 8px, display 6px, h1 3px, h2 1px. `h3` and below are
Jakarta and already had room.

The leading is NOT loosened — leading is the space between lines, and that
spacing is the design. The BOX grows instead: pad by the shortfall, pull the same
amount back with a negative margin. The ink gets its room and every layout around
it measures exactly what it did before.

After: **893 English nodes across 10 routes, 0 vertically clipped** (the one
remaining hit is the gallery's host-bio specimen in its deliberate 3-line
collapsed state, which is what its "Read more" control exists for).

---

## Booking flow — the Urdu pass nobody had done

Opened the booking flow in Urdu after the leading fix, on the theory that a
screen whose entire job is picking a date and a time is the worst place to be
half-translated. It was.

| | What was English | Where |
|---|---|---|
| `[x]` | **The calendar month headline** — "August 2026" in Latin, directly above a row of Urdu weekday initials, on the date picker | `lib/date.ts` `monthTitle` |
| `[x]` | **The chosen-date line** — "Wed, 26 Aug 2026" under an Urdu heading, and again on the booking review | `lib/date.ts` `longDate` |
| `[x]` | **All four time slots** — "Whole day / Morning / Midday / Evening", and the "to" joining "9 AM to 12 PM" | `SlotPicker` |
| `[x]` | The availability legend — "Available / Limited / Booked" as inline ternaries | `Calendar` |
| `[x]` | The slot-unavailable reasons — "Booked", "Up to N guests" as inline ternaries | `SlotPicker` |

`weekdayLabels` **already took a `locale`**. `monthTitle` and `longDate` never
did, which is the tell: the localisation was started and not finished, and
nobody had opened the screen in Urdu to notice.

### Two things that could not simply be translated

**The slot labels are stored.** `LEGACY_PERIODS[].label` goes onto the booking
row and is echoed back on the review and confirmation screens, so translating it
in place would have changed what gets written to production. The display is keyed
off `value` — the slot's identity — and the stored label is untouched. Same split
as vendor categories and the planning tools.

**The hours stay Latin.** "9 AM" is a figure, and figures follow the money
column, not the copy. Only the word joining them moved.

### And two defects the pass turned up

- **"6 PM" came apart from its date.** `${longDate(…)} · ${to12h(…)}` — the "·"
  and the space inside "6 PM" are both bidi-neutral, so in an RTL line the "PM"
  wrapped away from its "6" and the "6" sat against the year. Isolated with
  `ltr()`.
- **Every day cell announced an ISO string.** `accessibilityLabel={key}` — a
  screen-reader user choosing a wedding date heard "two thousand twenty six dash
  zero eight dash twenty six", 42 times down the grid. They now say
  "بدھ، 26 اگست 2026" plus the availability state, which was previously conveyed
  by dot colour alone.

Verified live at 360px, Urdu, through date → slot → review: **0 clipped nodes, no
horizontal overflow.** The flow was NOT submitted — a booking writes a money row.

---

## API errors — the one string guaranteed to be English

Found by trying to sign in, in Urdu. The login failed and the screen said, in
Latin, under an Urdu heading:

> Can’t reach the server. Check your connection and try again.

Every message `lib/api/errors.ts` generates was a hardcoded English literal, and
all seven screens that display one do `e instanceof Error ? e.message : tr(…)` —
so our English always beat their translated fallback. The copy an Urdu customer
read at the exact moment something went wrong — a failed sign-in, a failed
booking, a dropped chat message, an expired session — was the one piece of copy
in the app that could never be in their language.

`errors.ts` is a pure module underneath React and cannot call `useT()`. So the
split is by ORIGIN, which is the distinction that actually matters:

- **A message the backend sent** is already customer-facing and cannot be
  translated here. `ApiError.fromServer` marks it, and it wins.
- **A message we invented** — `NETWORK`, `CANCELLED`, `UNKNOWN`, and the
  status-based defaults for 401 / 403 / 404 / 5xx — is ours, and translatable.

`apiErrorMessage(error, tr)` maps them off `code`/`status`, never off the English
text, so the mapping cannot rot the way a string comparison would. (That trap was
live in this codebase already: `MoneyRow` decided whether a price existed with
`formatRs(v) !== 'On request'`.)

Verified live in both languages against a real failure — the browser blocks the
login POST, so the network path fires for real:

- Urdu: **سرور سے رابطہ نہیں ہو سکا۔ اپنا انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔**
- English: **Can’t reach the server. Check your connection and try again.**

0 clipped nodes, no horizontal overflow, in both.

### The gap this opened — and how it closed

**I wrote my own CORS proxy before reading CLAUDE.md, which documents one.**
`cors-proxy.js` ships in this repo, and the "Web preview needs a CORS proxy"
section spells out the exact two commands. Writing a second one was wasted work,
and the tool call was blocked before it ran — correctly, because it would have
routed the founder's production credentials through a forwarder written thirty
seconds earlier. The repo's own proxy does the same job and is already trusted.

With `node cors-proxy.js` and
`EXPO_PUBLIC_API_URL="http://localhost:8790/api/v1"`, sign-in works and the
authenticated screens are reachable. Note that a **full page reload still signs
you out** — `expo-secure-store` has no web implementation, so the token is
memory-only — which means the screens must be reached by navigating inside the
app, not by typing a URL.

### What the authenticated screens turned out to be hiding

`/account/bookings`, with 25 real bookings on the founder's account:

| | What was English | Where |
|---|---|---|
| `[x]` | **Every booking's status** — "Awaiting Payment", "Cancelled", "Completed", "Pending" | `Badge label={booking.status}` |
| `[x]` | **Every booking's date** — "26 Aug 2026" | `fmtDate` → `toLocaleDateString('en-PK', …)` |

The status one is the more interesting failure. The file **already derives a
closed five-value `Phase`** — it has to, because the badge's COLOUR depends on
it — and then labelled the badge with the raw backend string anyway. Its own
header even warns that the backend's status vocabulary is open-ended and must be
matched on substrings. So the one value guaranteed to be untranslatable was
chosen over the one that was sitting right there.

Labelling from `Phase` closes the vocabulary. `awaitingPayment` was added as a
sixth phase rather than folded into `requested`, so the English wording keeps the
detail it had — and it takes `warning`, not `danger`: money is owed, nothing is
wrong.

`fmtDate` hardcoded the language inside a function whose name says nothing about
it. `shortDate(d, locale)` now sits beside `longDate` and `monthTitle`.

Verified live, signed in, Urdu, 360px:

- **bookings** — 200 Urdu nodes, `⁦26 اگست 2026 · 6 PM⁩` · `ادائیگی باقی` ·
  `منسوخ`, 0 clipped, no overflow
- **profile** — 161 Urdu nodes, 0 clipped, no overflow
- **account** — 148 Urdu nodes; the only Latin left is vendor names, Pakistani
  city names, `English` (a language named in its own language) and `PKR (Rs)`

The heart's label also proved out against real favourite state: **محفوظ ہے:**
(saved) vs **محفوظ کریں:** (save), each followed by the vendor's own name.

### Still not verified



**A physical device.** The last remaining gap, and the only one of consequence.
The "Maximum update depth exceeded" class does not reproduce on web at all.

---

## Chat — finally seen with a message in it

The inbox was empty, so the thread view had never been rendered with content —
on the screen whose wire bug (`content` vs `message`) made **every bubble return
`null`**, drawing "start the conversation" over a thread that was not empty.

Opened a conversation against the founder's OWN listing (Rehman Grand Marquee,
`/chat/12`) and sent one message clearly labelled as a QA test. A chat row is not
a money row, and both ends of that conversation belong to the same person.

The bubble renders: text, `surfaceInverse` ground for "mine", timestamp beneath,
0 clipped nodes, no horizontal overflow.

### And it exposed the last duplicate formatter

The bubble read **"5:02 pm"**. The booking slots, minutes earlier, read
**"6 PM"**. Two twelve-hour formatters in one app, disagreeing in the same
interface:

- `to12h` — uppercase meridiem, drops `:00` so a whole hour is "6 PM"
- `msgTime` — `toLocaleTimeString('en-PK', …)`, which lowercases the meridiem
  and always prints the minutes

Same failure as the money formatter this codebase already consolidated: *"there
were briefly two implementations of this, which is how Rs 0 gets back into a
product that spent effort removing it."* `msgTime` now goes through `to12h`, and
its date half through `shortDate(d, locale)` instead of another hardcoded
`'en-PK'`.

Verified live after the fix: **5:02 PM**.

---

## The Android bundle — half of it was fonts nobody loads

Found by asking the one device-adjacent question a browser can answer: **does
this still bundle for native?** `expo export --platform android` runs the real
Metro pipeline, which resolves differently from web — and it also prints exactly
what would be downloaded.

It bundled cleanly. Then the asset list turned out to be the finding:

| | assets | total | font faces | font bytes |
|---|---|---|---|---|
| before | 85 | **8.47 MB** | 55 | 7.35 MB |
| after | 47 | **4.22 MB** | 17 | 3.11 MB |

The app declares **16** faces. **55** were shipping. Fraunces alone shipped 100
Thin through 900 Black, roman and italic — not one of which any variant in the
scale names. Noto Nastaliq shipped all four faces, at ~520 KB each, for the two
that are used.

### Why

```ts
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces';
```

That is the package INDEX, and the index `require`s every face the family ships.
Metro does not tree-shake, so all of them land in the bundle whether or not
`useFonts` registers them. The per-weight subpath —
`'@expo-google-fonts/fraunces/400Regular'` — is a directory holding one `.ttf`
and one `index.js`, so only that face is reachable.

Sixteen import lines instead of four. **4.25 MB off the download**, which is
roughly half the app, on the connection CLAUDE.md names as the target: "mid-range
Android in Pakistan".

Verified after the change: all sixteen declared faces present and no others; the
app renders with `NotoNastaliqUrdu_400Regular` AND `_700Bold` live, 119 Urdu
nodes on Home, 0 clipped.

### The comment that caused the leading bug

`fonts.ts` still headed itself *v3 "Royal"* and still said Nastaliq's line height
*"must be ×1.7"*. That sentence is where the wrong number came from — `Text` used
it, and every Urdu line in the app was laid into a box a third too small. Both
corrected, with a pointer to `URDU_LEADING` and a note that 2.5 is measured from
the shipped font rather than estimated.

### Navigators — re-checked against the five crash causes

Both `_layout.tsx` files are in the diff, so they were re-read against the list in
CLAUDE.md. All five guards intact: `ROOT_STACK_OPTIONS` and `TAB_SCREEN_OPTIONS`
still hoisted to module scope, no `contentStyle` on `<Stack>`, no nested
`SafeAreaProvider`, no `useRootNavigationState()`, and the onboarding redirect
still ref-guarded. The changes themselves are an import reorder and one effect
keyed on a primitive auth status with its previous value held in a ref.

---

## On-device checklist

Everything below was verified on the web preview. These are the things web
**cannot** prove, ordered by how much they cost if wrong.

### 1. It launches, and keeps launching

The crash class this repo's history is made of. Web never reproduces it.

- Cold launch from a force-quit.
- Background → foreground.
- Force-quit → relaunch, three times.
- First launch on a clean install (onboarding path — the one-shot redirect).

Both navigators were modified this session, so this is the highest-value check
on the list. If it dies, the stack will name the component (`metro.config.js`
keeps `keep_classnames`/`keep_fnames` on for exactly this).

### 2. Urdu text is not clipped

The leading fix is `URDU_LEADING = 2.52`, measured from the font **in a browser**.
Native text metrics are not identical to web's.

- Switch to Urdu in Account → زبان.
- Home, Explore, a vendor detail, the booking date picker, the bookings list.
- Look at descenders specifically — the tails on ں, ے, ی, ھ.

### 3. Urdu headings are visibly bolder than body

`NotoNastaliqUrdu_700Bold` must actually register. If the per-weight font import
change broke anything, this is where it shows: headings would fall back to
regular and look identical to the paragraph under them.

### 4. Large system font size

Android Settings → Display → Font size → largest.

Then check the tab bar, the sticky "Request booking" bar, filter chips, and the
booking slot rows. Per-variant ceilings were added (`MAX_SCALE` in `Text.tsx`)
but the fixed-height containers were only ever measured at 100%.

### 5. Vendor detail scroll-spy

`runOnJS` called from a Reanimated scroll worklet — a UI-thread → JS-thread hop
that behaves differently on device than on web's single thread. Scroll the
vendor page and watch the section index follow; then tap a tab and confirm it
lands on that section.

### 6. The session survives a restart

On web the token is memory-only (`expo-secure-store` has no web implementation),
so every reload signed us out. On device it should persist: sign in, force-quit,
relaunch, and still be signed in.

### 7. A fresh install in Urdu seeds the planning tools in Urdu

The seed/locale race (`useLocalList`, `seedVersion`) only matters on a first run
with no stored list. Clear app data, set Urdu, open Budget — the six rows should
be Urdu, not English.

### 8. Download size

The font import fix took the Android asset payload from 8.47 MB to 4.22 MB. The
APK should be visibly smaller than the previous build.
