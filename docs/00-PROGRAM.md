# 00 — Programme

**The single source of truth for what is done, what is next, and what is broken.** Update this file in the same commit as the work. If this file and the code disagree, the file is wrong — fix it immediately.

Governed by [../rules.md](../rules.md).

---

## The documents

| Doc | What it is |
|---|---|
| [../rules.md](../rules.md) | **The constitution.** The 10 gates, the prohibitions, design and copy law. Read first. |
| [01-FUNCTIONALITY-AND-ENDPOINTS.md](01-FUNCTIONALITY-AND-ENDPOINTS.md) | Every customer capability, its CRUD paths, its endpoints, verified against live prod. |
| [02-DESIGN-SYSTEM.md](02-DESIGN-SYSTEM.md) | Colour, type, space, depth, layout, motion, navigation. **v3 — awaiting sign-off.** |
| [03-COMPONENTS-AND-LIBRARIES.md](03-COMPONENTS-AND-LIBRARIES.md) | The component inventory and the dependency decisions. |
| [04-SCREEN-SPECS.md](04-SCREEN-SPECS.md) | One spec per screen: purpose, data, layout, states, edge cases. |
| [05-UI-SPEC.md](05-UI-SPEC.md) | **The widget design book.** Every component's anatomy, exact dimensions, tokens, variants, states. The build sheet for P2. |
| [06-SCREEN-LAYOUTS.md](06-SCREEN-LAYOUTS.md) | **All 27 screen layouts** as 360px wireframes, section by section, each declaring its one focal element and one primary action. |
| [07-DESIGN-RESEARCH.md](07-DESIGN-RESEARCH.md) | **Sourced research** — trust-signal science, Airbnb, Material 3 Expressive vs Liquid Glass, Apple Design Awards, the 5 marketplace patterns, WedMeGood/Shadiyana benchmark. Every finding referenced, every finding ends in an ACTION. |
| [../../ems-v0/docs/CUSTOMER-SURFACE.md](../../ems-v0/docs/CUSTOMER-SURFACE.md) | The web's customer surface — what this app mirrors. |

---

## Phase order

Nothing in a later phase starts before the phase above it is `[x]`.

| Phase | What | Status |
|---|---|---|
| **P0** | Documentation + analysis | `[x]` done |
| **P1** | Design system v3 in code — tokens, fonts, contrast gate green | `[x]` done |
| **P2** | Component library rebuilt on v3 | `[x]` 24 of 24 built · gallery-verified except sheets |
| **P3** | Screens, one at a time, in the order below | `[~]` S1 done to 8/10 |
| **P4** | Device verification — real Android, throttled data, daylight, Urdu | `[ ]` |

**v3 adopted** 2026-08-17 on founder instruction ("update the colors, the theme, the fonts, everything"). The app now diverges from weddingwala.pk until the web is ported — that port is owed.

### P2 progress record

**Built / rebuilt on v3, all gallery-verified at 360px:** `Text` (+`faint`, `shaadi`, `warning` tones) · `Button` (gold gradient + width-locked loading) · `Card` (`flat`/`rise`/`focus`, v1 names aliased) · `Input` (**reserved message slot**, suffix, required) · `Chip` (+`dismissible`, mono counts) · `Badge` (+`verified`/`elite`/`shaadi`, `iconOnly`) · `Sheet` **new** · `SegmentedControl` **new** · `Stepper` **new** · `MoneyRow`/`TotalsCard` **new** · `TrustRow` **new (MB1)** · `VendorHostCard` **new (MB2)** · `SpecStrip` · `SectionHeader` · `Calendar` · `Skeleton`/`EmptyState`.

**`src/app/gallery.tsx`** — route `/gallery`, every variant × every state. Required by rules.md and 05-UI-SPEC §21 so a primitive's defect is found once, not worked around on five screens.

**Money consolidated to one formatter.** `formatRs` briefly existed twice — one returning `"On request"` for null/zero, one returning `"Rs 0"`. Whichever a screen imported decided whether the WW-PRICE0 bug reappeared. `vendor-display` now re-exports the single implementation in `Money.tsx`.

**Three real defects the gallery caught** — none would have been visible in a screenshot of a finished screen:

1. 🔴 **`Calendar` could never draw a "Booked" dot.** The dot was `disabled ? null : colour`, and `full`/`blocked` are exactly what disables a day — so the legend advertised `● Booked` for a state the grid was incapable of rendering. Backwards for a booking product: *"this date is taken"* is the most useful thing the grid can say. Dots now suppress only for outside-month, out-of-lead-window, and `unknown`.
2. **`VendorHostCard` truncated the vendor's name** — "Hosted by Rehman Y…", losing the surname, which is the entire point of the component. Airbnb writes "Stay with Allison" on one line because the name is short; Pakistani names are longer. `HOSTED BY` is now an overline above the name, giving name and credentials full width.
3. **`Stepper` wrote a ref during render** — caught by `react-hooks/refs`. Not theoretical on this codebase: five device crashes came from render-phase work feeding into layout. Ref now syncs in an effect.

**Second wave — all built and gallery-verified:** `Toast`+`ToastHost` (zustand-backed, so an API error handler with no component around it can still raise one; mounted in the root layout) · `Tabs` (changes a **view**, underline — deliberately never confusable with `SegmentedControl`, which changes a **value**) · `StatusTimeline` (three states, because the customer's real question is *"what is waiting on me?"*) · `SlotPicker` (**both engines**) · `MonogramFallback` (extracted from `VendorCard` so detail/compare/cart degrade identically) · `FormField`+`DraftResumeBanner` (validates on **blur**, not per keystroke) · `PriceHistogram` (MB14) · **`Calendar` rebuilt** (MB7/MB10).

**Calendar rebuild, verified on screen:** continuous vertical scroll with a sticky weekday header — August then September, **no pager**; out-of-window days greyed with strikethrough and still readable; 42 cells per block so nothing changes height; and the red "Booked" dot now actually renders.

**SlotPicker, verified on screen:** `2 of 3 left` green · `1 of 4 left` amber (ratio ≤ 0.5) · `Booked` red and disabled · `Up to 150 guests` red and disabled when a 500-person party exceeds `unitGuestCapacity`. Legacy periods render `Whole day / Morning / Midday / Evening` with **Evening ending 10 PM** and hours joined by "to".

**PriceHistogram, verified on screen:** distribution drawn, in-range buckets gold, and the honest coverage line — *"3 vendors have no price listed"*. The 98th-percentile clip stopped a single Rs 50,000,000 outlier from flattening the whole chart.

**Still deferred:** the `FilterSheet` rebuild (MB13/15/16 — live count + per-option counts + footer grammar). `PriceHistogram` and `Sheet` are the pieces it needs, and both exist, but the sheet itself **cannot be verified on web** (see below), so rebuilding it now would produce unverifiable work. It moves to the S2 screen slice, where it gets device-tested against real filter data.

### 🔴 Verification-method limitation found

**Bottom sheets cannot be verified on web.** `@gorhom/bottom-sheet` v5 mounts no DOM under react-native-web — the gallery's Sheet does not open, with **zero console errors** (all 16 fonts load fine, so the build is sound). This is not a bug in `Sheet`; it is a hole in the loop.

Consequences, stated plainly:
- `Sheet` is **built and typechecked but UNVERIFIED**.
- The **pre-existing** `FilterSheet` and the vendor-detail full-screen gallery were also never verified this way, so their 360px behaviour is unknown too.
- Every sheet in the app needs **device or dev-client** verification. Gate 3 cannot be signed off for any screen containing a sheet from web alone.

This strengthens D3 rather than adding a new blocker: the device gate was already the real one.

### P1 completion record

- `src/theme/tokens.ts` rewritten to v3 "Royal". Every v1 key name preserved, so no screen import changed; `legacy` retains the v1 hexes for one cycle.
- `src/theme/fonts.ts` rewritten: **Fraunces** (display) · **Plus Jakarta Sans** (body/UI) · **Geist Mono** (numbers) · Noto Nastaliq Urdu. Inter removed entirely — Jakarta covers dense UI, Geist Mono covers numbers, so a whole family left the bundle.
- Contrast gate rewritten: 21 → **34 pairs, all green**. Four failed on first run (`goldDark` at 4.38:1 on ivory and 3.96:1 on sand; `warning` at 4.21:1). **Fixed the tokens, not the thresholds** — `goldDark`/`textLabel` `#8F6F1A`→`#846618`, `warning` `#9A6B12`→`#916511`.
- Fonts verified **actually loaded** in the browser, not silently falling back: computed styles confirm `Fraunces_600SemiBold`, `Fraunces_400Regular_Italic`, `PlusJakartaSans_400/500/600/700` in use.
- Caught by that check: **no price on Home was using tabular figures** — `GeistMono` was loaded-but-unused, violating design-system §2. `VendorCard` price and rating now render `mono`.

---

## Screen order and status

Ordered by what a couple actually does, so each screen has somewhere real to go by the time it is built. `[R]` = renders but **not** done.

### Discovery

| # | Screen | Route | Status | Gates passed |
|---|---|---|---|---|
| 1 | Home | `(tabs)/index` | `[~]` | **8/10** — see the S1 record below. Outstanding: **gate 5** (throttled 3G never run) and **gate 8** (cold start not measured on hardware). Both need a device; neither is doable from a web preview. |
| 2 | Explore | `(tabs)/explore` | `[R]` | 5/10 |
| 3 | Vendor detail | `vendor/[id]` | `[R]` | 5/10 |
| 4 | Favourites | `favorites` | `[ ]` | plumbing done, unverified |
| 5 | Compare | `compare` | `[ ]` | plumbing done, unverified |

### Booking

| # | Screen | Route | Status | Notes |
|---|---|---|---|---|
| 6 | Date + slot picker | new | `[ ]` | `Calendar` + `lib/date` built; `SlotPicker` not |
| 7 | Guests + event details | new | `[ ]` | per-vendor-type label from `/bookings/meta/guest-count-label` |
| 8 | Packages + add-ons | new | `[ ]` | `PackageTiles` built |
| 9 | Review order | new | `[ ]` | |
| 10 | Payment | new | `[ ]` | ⚠️ Stripe caps PK cards ≈ Rs 999,999 → bank transfer above |
| 11 | Confirmation | new | `[ ]` | the `royal` moment |

### Post-booking

| # | Screen | Route | Status | Notes |
|---|---|---|---|---|
| 12 | My bookings | `account/bookings` | `[ ]` | |
| 13 | Booking detail + status timeline | new | `[ ]` | use `/:id/with-availability` — `/bookings/:id` **does not exist** |
| 14 | Chat thread | new | `[ ]` | `/chat/*` live + socket.io |
| 15 | Write a review | new | `[ ]` | |
| 16 | Cancel / refund | new | `[ ]` | 🔴 **BLOCKED** — see Blockers |

### Plan and account

| # | Screen | Route | Status | Notes |
|---|---|---|---|---|
| 17 | Plan hub | `(tabs)/plan` | `[ ]` | |
| 18 | Shaadi Plan cart | new | `[ ]` | `/wedding-plans/*` live |
| 19 | Budget · Checklist · Guests · Timeline | `tools/*` | `[ ]` | ⚠️ local-only, no backend |
| 20 | Quotes | new | `[ ]` | `/quotes/mine` live |
| 21 | Inbox | `(tabs)/inbox` | `[ ]` | notifications only today |
| 22 | Account hub | `(tabs)/account` | `[ ]` | |
| 23 | Profile · Settings | `account/*` | `[ ]` | |
| 24 | Complaints | new | `[ ]` | `/complaints/mine` live |
| 25 | Auth — login · register · OTP | `auth/*` | `[ ]` | |
| 26 | Onboarding | `onboarding` | `[R]` | |
| 27 | Guides | `guides` | `[ ]` | |

---

## P3 · S1 — Home. The slice record

**Status `[~]` 8/10.** Built, wired and verified against live production at 360, 430 and 834px, in English and Urdu, with the API up and with the API down.

### The enabling fix — P1's palette migration was incomplete

P1 rewrote `tokens.ts` to v3 and the contrast gate went green, so the migration looked finished. It was not, and the reason generalises: **a token swap only reaches colours that were referenced as tokens.** Thirty-nine translucent colours across 25 files had been written as literal `rgba(201,149,106,0.14)` — v1's brown-gold, v1's pastel pink, v1's soft-brown ink, v1's near-white ivory. Hardcoded, invisible to any token change, and invisible to the contrast gate, which reads tokens rather than screens.

The app was therefore rendering **two palettes at once**: P2's components carried v3's metallic `rgba(201,162,39,…)` while every older screen carried v1's `rgba(201,149,106,…)`. Two different golds, side by side, on Home.

Fixed at the root rather than per-screen:

- **`alpha(hex, a)`** in `tokens.ts` — the only sanctioned way to make a translucent palette colour.
- **`overlay.*`** — eleven named translucent surfaces that name a **job**, not a colour (`onPhoto`, `backdrop`, `goldWash`, `glowBleed`, `archOnPhoto`…). A component asks for "the pill that sits on a photograph" and every such pill in the app is the same pill.
- **`layout.*`** — `gutter: 24`, `maxContentWidth: 560`, `tapTarget: 44`. The gutter had been re-declared as `const GUTTER = 24` in six separate files, which is how a gutter drifts to 20 in one of them.
- Swept all 25 files; **zero `rgba()` literals remain in any `.tsx`**. The three SVG textures (`BridalWash`, `JaalPattern`, `ShimmerText`) still held v1 hexes as stop colours and now read from `palette` — the auth screens had been rendering v1's pastel pink this whole time.
- Deleted four dead components carrying stale v1 hexes: `CategoryMosaic`, `HeroCarousel`, `FeaturedSpotlight`, `CategoryGrid` (zero references each).

### The focal element is no longer a photograph

The single most consequential decision in this slice, and the evidence is in `FeatureSpotlight.tsx`.

The old spotlight led with `images[0]` behind a scrim, gated on the **vendor** (verified or sponsored, plus a review). On production exactly one venue in the first twelve passes that gate — **3358, Rehman Grand Marquee**, tier 3, 4.33★, `completenessScore: 100`. Its images were downloaded and looked at:

- `images[0]` — an AI-rendered **Wedding Wala corporate lobby**, with a sign reading *"Welcome to Pakistan's Premier Wedding Platform"*. Our own marketing render.
- `images[1]` — the logo of **aiondigital.com**, an unrelated tech company.

So the one qualifying vendor would have rendered our own advert, full-bleed, captioned "Rehman Grand Marquee · Johar Town · Rs 350,000". The gate qualified the business; the risk was in the image.

Gating the image instead is impossible: the business row has **no** `coverImage`, `primaryImage`, `isPrimary`, caption or moderation state. 120 columns, none of which says which photograph is of the venue.

**Resolution:** the constraint is on imagery, not on prominence. The focal card now leads with the facts in the royal register — verification tier, owner name, tenure, weddings hosted, capacity range, rating, review count, starting price — every one a column we can stand behind, with the Mehrab arch as the ground. It surfaces `ownerName`, `yearsInBusiness` and `weddingsCompleted`, which the app has always held and never once displayed. When B2 is fixed the photograph comes back.

### Image provenance — a measurement, and a correction

While verifying the above, the imagery problem was quantified. **The first measurement was wrong and is recorded here with the correction, because the wrong number was briefly acted on.**

- **Wrong:** scanning 60 businesses for repeated images keyed by **filename** reported "69 of 125 shared — 55%". An artefact: `vendors/catering/05.jpg` and `vendors/decor/05.jpg` share a basename and are different pictures. The filter built on it caught almost nothing, which is how the error surfaced — it visibly did nothing on screen.
- **Right:** Cloudinary paths answer it directly. `wedding-wala/businesses/<id>/images/…` is a vendor's own upload; `wedding-wala/vendors/<category>/nn.jpg` is a **shared platform stock library keyed by category**. Across the same 60 businesses:
  - **270 of 314 images (86%) are platform stock**, not vendor uploads.
  - **54 of 60 businesses lead with a stock image.** Five lead with a real photograph of themselves; one has none.
  - 53 exact URLs are additionally attached to more than one business (`vendors/photographer/07.jpg` on both 2523 and 2514).

So nearly every vendor card in the app presents a generic category photo as that business's premises — which rules.md §6 forbids outright.

**What shipped, and what deliberately did not.** Enforcing §6 literally would blank 54 of 60 cards on Home. That is arguably the correct reading and it is far too large a product change to make inside a screen slice — it is the founder's call, raised as B2. What shipped is the part that cannot make any card worse: `image-trust.ts` ranks a vendor's own uploads above stock, so the five listings that have real photography now lead with it (verified on screen: 4 own-photographs rendering where there were 0), and `vendorHasOwnPhotography()` exists so the detail hero can require a real upload in S3.

### Defects found and fixed in this slice

| # | Defect | Gate |
|---|---|---|
| 1 | Hero rendered at `fontSize: 30` — a size that exists nowhere in the type scale. | 6 |
| 2 | Seven customer-readable strings were inline `isUrdu ? … : …` ternaries. | 9 |
| 3 | `home.step1Body` claimed **"3,000+ trusted vendors"** — a hardcoded count that could only drift, and "trusted" is unsupportable (B4: 1 of 60 verified). Same string on onboarding. | 2 |
| 4 | A rail titled **"Featured venues" was rendering decorators** — `slug="wedding-decorators"`. Found by reading the network log against the screen. | 2 |
| 5 | `See all` measured **54 × 18px** — the one control that exists so a rail isn't a dead end, six times down Home. | 3 |
| 6 | City chips measured **34px** tall. First fix used `hitSlop`, which react-native-web ignores — so it was unverifiable on the one surface we can measure. Replaced with padding + negative margin: **44px, measured, on every platform.** | 3 |
| 7 | A pressable `Card` had **no `accessibilityRole`** — the Guides card announced as plain text. Found by trying to click it and getting no `role="button"` back. | 9 |
| 8 | `SectionHeader`'s default label was the literal `'View all'`, so every Urdu section header read English. **Defaults are where this hides.** | 9 |
| 9 | The "See all" chevron pointed right under RTL — it said *go back*. | 9 |
| 10 | Urdu search placeholder clipped to `وینیو، فوٹوگراف…`; Nastaliq is wider than Latin at the same size. | 3 |
| 11 | `weddings hosted` clipped to `weddings host…` in the facts strip. | 3 |
| 12 | **Urdu-script vendor names rendered in a Latin font.** Five of twelve venues on production page 1 are named in Urdu (`ماڈرن مارکی`, `قصر نور میرج ہال`). Plus Jakarta Sans has no Arabic glyphs, so the platform substituted whatever it could find, at Latin leading. `Text` now detects the script and sets Nastaliq with 1.7× leading **even in the English interface** — it is the vendor's name, not a translated string. | 2 · 9 |
| 13 | Medallions sized off the **window** rather than the capped container: 168px medallions in a 560px row on a tablet. | 4 |
| 14 | The arch in the focal card was cropped at the corner, so the signature read as a stray arc. Re-seated on the card's base, opacity 0.5 → 0.3 after it drew a line through "· 5 years hosting". | — |

### Gate evidence

| Gate | Evidence |
|---|---|
| **1 Function** | Every destination clicked and the resulting route read back: search → `/explore?focus=search` · medallion → `/explore?category=wedding-venues` · focal card → `/vendor/3358` · rail See all → `/explore?category=wedding-photographers` · city chip → `/explore?city=Lahore` · guides → `/guides`. Back returned to Home each time. Recently-viewed appeared after visiting 3358 and **survived** the return. No CRUD on this screen. **Pull-to-refresh is code-complete but NOT exercised** — `RefreshControl` has no gesture under react-native-web. |
| **2 Data truth** | Every field traced to an API column. `/platform-stats` verified live → `{vendors: 3284, couplesServed: 54, cities: 87}`; `3,284 vendors · 87 cities` renders from it. `couplesServed` is deliberately not shown — 54 is true and weak, and a trust strip that undersells is worse than one that stays quiet. Two untrue copy strings removed; one mislabelled rail corrected. |
| **3 360px** | `documentElement.scrollWidth === clientWidth === 360` — no body scroll. **All 28 tap targets ≥ 44px**, measured, after two fixes. **Zero clipped strings** after two fixes (was two). |
| **4 Large screen** | 430px and 834px. Content caps at `maxContentWidth: 560` and centres; no stretched column. Medallion sizing clamped to the container. |
| **5 States** | Loading skeletons per block. **Failure path exercised for real: the API proxy was killed and Home reloaded.** Result: hero, search and tab bar intact; the stat line vanished rather than inventing a number; every rail hid itself; recently-viewed still rendered from local storage. Home stayed usable. ⚠️ **Throttled 3G not run** — needs a device. |
| **6 Theme** | Zero raw hex and zero `rgba()` literals in any `.tsx`. Gutter 24 from `layout.gutter`. One focal element; no primary action, therefore no saturated gold surface anywhere on the screen. |
| **7 Navigation** | Deep-linkable (all destinations carry route params). Back always returns to Home. No dead ends — 7 section headers, every one with a destination. |
| **8 Performance** | **12 API requests → 7**, measured in the network log. `useCategoryCovers` claimed in a comment to share query keys with the rails; it did not — different key, second request to the same endpoint. Covers, rails and the spotlight now all use `useVendorsByCategory(slug, 10)`: `Wedding venue` is fetched **once** and serves the medallion, the rail and the focal card. `img()` sizes every request. ⚠️ **Cold start not measured on hardware.** |
| **9 Accessibility** | Contrast **38/38** (34 + four new pairs the S1 card actually uses, including a composited 70%-opacity foreground — a gate that reads tokens will always lag the screens by exactly this much). Roles on every control after fix 7. Urdu verified on screen: RTL, Nastaliq, mirrored controls, translated section actions, and Urdu-script vendor data set correctly in the English build. |
| **10 Regression** | `tsc` clean · `eslint` zero errors · web bundle exports clean · Explore, vendor detail and guides all still reachable and rendering. |

---

## R0 — the revamp (rules.md §0.0)

**Founder rejected the P1–P3 work as "not a revamp", correctly.** v3 changed values
and kept the system, so the app still looked like the app. rules.md now carries
§0.0 THE MANDATE, a **Gate 0** that runs before all ten, and prohibition 3
("calling a screen revamped when only its values changed").

**Reference:** Airbnb iOS listing detail (founder-supplied). Near-monochrome, one
colour event, hairlines instead of cards, 27px titles, air as the luxury signal.
**Ground chosen by the founder: clean paper + gold accent.**

### The surface, counted

20 screens built (of 27) · 57 exported components · **932 rendered elements** ·
**481 style objects (440 of them inline)** · 43 colours · 15 type variants ·
13 elevation values · 11 overlays (7 raw `<Modal>`, 4 bottom-sheet).

The 440-inline-vs-41-StyleSheet split is the diagnosis: the design lived in 440
one-off decisions, not in the system, which is *mechanically* why a token swap
changed nothing.

### v4 "Paper & Gold" — shipped

| | v3 | v4 |
|---|---|---|
| colours | 43 | **19** |
| elevation levels | 13 | **3** |
| gradients | 7 | **3** (two are scrims) |
| spacing steps | 6 | **9** — three new LARGE steps |
| title vs caption | 21 / 13 = 1.6× | **27 / 13 = 2.1×** |
| leading | ~1.15–1.5 everywhere | **inverted** — display 1.05, body 1.6 |

Ground is `paper #FDFCFA`; cards are pure white so they lift with no border.
`line #EAE6E0` is the structural element. Gold is the CTA and nothing else.

### 🔴 The contrast gate had been passing against a palette nobody could see

It kept a hand-copied duplicate of the palette with a comment asking whoever
changed a token to remember to update it too. v4 landed, every value on screen
changed, and it still reported "38 passed" — measuring v3. It now **parses
`tokens.ts`** and fails loudly on a token it cannot find. Re-run against real v4
values: 3 genuine failures, all fixed in the TOKEN (`inkMuted` darkened for wells,
`inkFaint` for the decorative floor, and the gold CTA's edge now carried by a
`goldDeep` rim rather than weakening the threshold). **36/36 green.**

### Components redrawn so far — 4 of 57

- **`Button`** — flat gold + 1px `goldDeep` rim (gradient and glow retired: a glow
  is a second colour event). Height 48 → 54.
- **`SectionHeader`** — 11px tracked gold overline → **22px ink heading**. The
  heading used to be smaller than the content it introduced.
- **`VendorCard`** — border, background, shadow, divider, ribbon and rating pill
  all removed. It is now a photograph and three lines of type on paper.
- **`HomeHeader`** — charcoal filter block → hairline button; figures demoted.
- **Home** — section gap 24 → **48**; the tinted "how it works" wash band deleted.

### 🔴🔴 B2 is far worse than recorded — see the Explore screenshot

Page 1 of Explore, live prod, verified by eye:
- **Abdullah Marquee** renders **our own vendor-recruitment advert** — a stressed
  man at a laptop, headline "…MISSED PAYM… COORDINATION ISSU…", and a
  **"Join Weddingwala.pk" button** — as its venue photograph.
- Another card renders **"QA — Confidential Bank (Bahrain) · Bugs Reported 30+ ·
  Compliance 100%"**, a software-testing case study.
- **Rehman Grand Marquee** (the platform's best-credentialled venue, tier 3)
  renders an AI render of a **Wedding Wala corporate lobby**.

Also measured: **86% of images (270 of 314) across the top 60 listings sit in a
shared `wedding-wala/vendors/<category>/` stock folder**, not the business's own
folder. **54 of 60 businesses lead with stock.** Five lead with a real photo.

This is not fixable in code and it caps every image-forward surface. `image-trust.ts`
now prefers a vendor's own upload where one exists, and `vendorHasOwnPhotography`
gates any surface where the image is a *claim*. The rest is an ops job.

---

## Blockers

| # | Blocker | Impact | Owner |
|---|---|---|---|
| **B1** | `/bookings/:id/{refund-preview,refund-requests,order,timeline,policy-acceptance}` return **403 "Not your booking"** for bookings the customer's own list returns as theirs. Ownership resolves by `userId`, not `customerEmail`. | Screen 16 cannot be built correctly. | Backend |
| **B2** | 🔴 **Quantified in the S1 pass, and worse than recorded.** Across the 60 businesses Home shows: **270 of 314 images (86%) are platform stock** filed under `wedding-wala/vendors/<category>/`, a shared library keyed by category rather than by business. **54 of 60 listings lead with one.** Only **five** lead with a photograph of themselves. Separately, the platform's best-credentialled venue (3358, tier 3) has our **own Wedding Wala marketing render** at `images[0]` and **aiondigital.com's logo** at `[1]`. | Nearly every vendor card presents a generic category photo as that business's premises — which rules.md §6 forbids outright. Enforcing §6 literally blanks 54 of 60 cards, so it is **a product decision, not a code fix**. Shipped meanwhile: own-uploads rank above stock, and the focal slot no longer uses photography at all. **Concrete ops asks: (1) delete the marketing render and the aiondigital logo from business 3358's gallery; (2) decide whether stock imagery may stand in for a business's premises.** | Ops / founder |
| **B3** | Planning tools have **no backend**. Budget, checklist, guests, timeline are device-local on both web and app — lost with the app, invisible on the website. | Screen 19 cannot sync. Needs new backend work. | Product decision |
| **B4** | Almost no quality signal on prod: of 60 venues on page 1, `verificationTier > 0` = **1**, `sponsored` = **0**, `reviewCount > 0` = **3**. **Plus ~98% have no price.** Research names *transparent package pricing* as a core competitive feature of WedMeGood/Shadiyana — so every "On request" is a competitive loss, not just an empty field. | Ranking, featuring and "top rated" are close to meaningless, and we lose on the axis competitors win on. | Ops / product |
| **B5** | **Response time is not exposed by the API.** Research prices verified reviews + response-time badges + completion rates at **10–25% conversion lift** in service marketplaces ([source](07-DESIGN-RESEARCH.md#1-trust-signals--the-highest-value-finding-in-this-document)). | Leaving measurable conversion on the table. | Backend |
| **B6** | **Enquiry may require login.** Guest access alongside social proof cuts checkout abandonment **30–40%**. Needs a product decision. | Forced-account friction at the moment of highest intent. | Product |
| **B7** | **Category names have no Urdu.** `categories.ts` carries `short`/`singular`/`plural` in English only, so in the Urdu build the medallion labels read *Venues · Photo · Catering*, the vendor-card overline reads *VENUES*, and Explore's 23 category chips are entirely English. Found running S1 in Urdu. | The Urdu build is bilingual by accident: chrome translates, the taxonomy does not. Belongs to the S2 slice, where the chips live. | Us — S2 |

---

## Decisions log

| Date | Decision |
|---|---|
| 2026-08-17 | Build in complete vertical slices — designed, wired, tested — not design-then-wire. |
| 2026-08-17 | Featured slot requires `sponsored \|\| verificationTier > 0` **and** a review. Nothing qualifying → render nothing. (Cause: B2.) |
| 2026-08-17 | `GET /bookings/:id` does not exist. Customer booking detail uses `/:id/with-availability`. |
| 2026-08-17 | Favourites are server-backed with optimistic rollback, and merge local→server on login rather than discarding a logged-out shortlist. |
| 2026-08-17 | Route params, not local state, are the source of truth for Explore's category — `setState` in an effect is the crash shape. |
| 2026-08-17 | v3 proposes replacing pastel `rose` with **shaadi red**: a Pakistani wedding is deep red and gold, not blush and beige. |
| 2026-08-17 | v3 **adopted** on founder instruction. The weddingwala.pk port is now owed. |
| 2026-08-17 | One design language on both platforms, but **Material 3 Expressive is the primary reference** — the audience is mid-range Android in Pakistan. Borrow Expressive's colour+motion and Liquid Glass's "content beneath leads"; **skip glass refraction** (too expensive on mid-range Android, wrong for a warm ivory ground). |
| 2026-08-17 | **The Mehrab arch is the strategy, not decoration.** WedMeGood, Shadiyana and WeddingWire all look like generic directories; a Mughal arch cannot be copied onto a directory template. Target: every screen recognisable as Wedding Wala from a cropped screenshot. |
| 2026-08-17 | **Trust signals move above the fold.** We compute `reliability` and render it below the packages — the exact placement research calls "decoration, not a trust signal". New `TrustRow` widget. |
| 2026-08-17 | **Mobbin browsed** (free tier: pattern + flow search open, app-level capped at 4). 18 evidence-backed actions MB1–MB18 in [07-DESIGN-RESEARCH.md](07-DESIGN-RESEARCH.md) §7b. Repeatable URL grammar recorded. |
| 2026-08-17 | **Calendar corrected before it shipped**: continuous vertical scroll (not paged), `Dates │ Months │ Flexible` modes, `± 1 day` flexibility. Airbnb does none of what I originally specified. |
| 2026-08-17 | **Two widgets added from evidence**: `TrustRow` (bordered 3-cell strip above SpecStrip) and `VendorHostCard` (sell the vendor as a named person with tenure — we hold `ownerName`/`yearsInBusiness`/`weddingsCompleted` and showed none of it). |
| 2026-08-17 | **Filter sheet gets a feedback loop**: live result count in the CTA, price histogram of real inventory, per-option counts. Free because full-mode already loads the set client-side. |
| 2026-08-17 | **Chat message payloads must be typed** (`text`/`availability`/`quote`/`image`) — decided before S14 is built, not retrofitted. Quick-reply chips are the anti-WhatsApp retention lever. |
| 2026-08-17 | **A literal `rgba()` in a screen is a defect.** Translucent colours derive from `palette` via `alpha()`, or come from a named `overlay.*` job. A palette migration must reach every surface, not most of them. |
| 2026-08-17 | **Home's focal element leads with facts, not a photograph**, until vendor imagery can be trusted. The constraint is on imagery, not on prominence. |
| 2026-08-17 | **A vendor's own upload outranks platform stock** everywhere an image is shown, and stock is barred from any surface where the image is a *claim* (featured slot; detail hero in S3). Whether stock may appear on cards at all is the founder's call (B2). |
| 2026-08-17 | **Urdu script in DATA is set in Nastaliq regardless of interface locale.** A vendor's name is not a translated string; the locale toggle says nothing about what language the catalogue is in. |
| 2026-08-17 | **Tap-target fixes must be verifiable.** `hitSlop` is native-only and invisible to every check we can run, so targets are grown with padding + negative margin instead. A fix we cannot measure is a fix we cannot claim. |

---

## Verification log

Evidence, not ticks. Every entry names what was observed.

| Date | What | Result |
|---|---|---|
| 2026-08-17 | Customer API probe, live prod, authenticated | Chat, quotes, wedding-plans, umbrellas, activity, favourites, payments all **live**. `/bookings/:id` 404. Complaints at `/complaints`. |
| 2026-08-17 | Favourites CRUD round-trip, live prod | add → re-read → delete → re-read; baseline restored. Row id at `data.id`. |
| 2026-08-17 | Web bundle | 1828 modules, 26 routes, clean. |
| 2026-08-17 | Home / Explore / Vendor detail at 360px, live data | Rendered. Six truncation defects found and fixed. Console 77 → 1. |
| 2026-08-17 | Contrast gate (v1 tokens) | 19/19 pass. Superseded by v3. |
| 2026-08-17 | Contrast gate (v3 tokens) | **34/34 pass** after correcting 4 failing tokens. |
| 2026-08-17 | v3 rendered at 360px, live data | Home + Explore. Fraunces, metallic gold, deeper ground, mono prices, larger radii all confirmed on screen. |
| 2026-08-17 | **S1 Home, live prod, 360 / 430 / 834px** | 14 defects found and fixed. All 28 tap targets ≥44 measured; zero clipped strings; no body h-scroll. |
| 2026-08-17 | **S1 navigation, every destination clicked** | 6 routes verified by reading back the resulting path; back returns to Home; recently-viewed survives the round trip. |
| 2026-08-17 | **S1 request count, network log** | 12 → **7**. `Wedding venue` fetched once, serving medallion + rail + focal card. |
| 2026-08-17 | **S1 failure path, API killed** | Rails hid, stat line vanished (no invented number), recently-viewed served from local storage, Home stayed usable. |
| 2026-08-17 | **S1 in Urdu, 360px** | RTL layout, Nastaliq, mirrored search/filter, translated section actions. Urdu-script vendor names (`عابد علی موبائل زون`) set correctly in the **English** build too. |
| 2026-08-17 | **Vendor image provenance, 60 businesses** | 86% platform stock; 54 of 60 lead with it; 5 have their own photography. First measurement (55%, keyed by filename) was **wrong** and is corrected in the S1 record. |
| 2026-08-17 | Contrast gate, extended | **38/38** — four new pairs for the royal focal card, including a composited 70%-opacity foreground. |

---

## Known defects

| # | Defect | Severity |
|---|---|---|
| D1 | React #418 on web boot — **now identified**: a hydration mismatch, and hydration exists only in the static web export. `expo export` prerenders HTML that the client then re-renders with real insets, fonts and locale. There is no hydration on native, so this cannot occur in the app. Web-preview artefact, not an app defect. | Info |
| D2 | Location still truncates on narrow cards ("Baghbanpura, Lah…"). Secondary field, acceptable for now. | Low |
| D3 | No screen has ever run on a physical device. The five-cause New-Architecture crash class is unverified for all new code, and **gates 5 and 8 cannot be closed for any screen without it** (throttled 3G, cold start). | **High** |
| D4 | **Pull-to-refresh on Home is code-complete but unexercised** — `RefreshControl` has no gesture under react-native-web. Same class as the sheets: device-gated, not broken. | Medium |
| D5 | The shared-URL index (`image-trust.ts`) only knows what has been fetched, and it is not reactive — a duplicate discovered by a later request will not re-rank an already-painted card. It is used only to break ties between two stock images, so nothing renders *worse*; but it is weaker than it looks. The path test does the real work and needs no cross-request evidence. | Low |
