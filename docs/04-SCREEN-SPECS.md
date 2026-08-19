# 04 — Screen specs

One spec per screen. **A screen may not be built before its spec exists.** Governed by [../rules.md](../rules.md); order and status in [00-PROGRAM.md](00-PROGRAM.md).

Each spec answers the same eight questions, because those eight are what the 10 gates test against. A spec that skips one produces a screen that fails that gate.

---

## The spec template

Copy this for every new screen.

```markdown
### S<n> — <Name>
**Route** · **Status** · **Owner**

1. **Job** — the one thing a couple is trying to do. One sentence.
2. **Data** — every endpoint, its verified shape, and what happens when each field is null.
3. **Layout** — the block order top to bottom. Which block is the ONE focal element. Where the ONE primary action is.
4. **Components** — from 03-COMPONENTS. Anything new is built first.
5. **States** — loading / empty / error / offline / slow / partial-data.
6. **Edge cases** — the specific real-data horrors this screen must survive.
7. **Navigation** — in, out, back, deep link, what survives a tab switch.
8. **Done when** — the gate evidence to record.
```

---

## S1 — Home

**Route** `(tabs)/index` · **Status** `[~]` **8/10** — built and verified; gates 5 and 8 need a device. Full slice record and gate evidence in [00-PROGRAM.md](00-PROGRAM.md#p3--s1--home-the-slice-record).

1. **Job** — a couple who does not yet know what they want leaves with a specific vendor to look at.

2. **Data**
   - `/businesses/businesses-by-vendor?vendorType=<t>&limit=1` × 6 — arch medallion covers. `staleTime` 1h.
   - `/businesses/businesses-by-vendor?vendorType=Wedding venue&limit=12` — spotlight pool.
   - Per-rail: same endpoint, `limit=10`.
   - `/platform-stats` → `{ vendors, couplesServed, cities }`.
   - Null handling: no cover → sand arch. No spotlight passes the gate → **render nothing**. Empty rail → hide the rail entirely.

3. **Layout** — greeting → `display` hero → **live figures** (`3,284 vendors · 87 cities`, real, absent on failure) → search → arch medallion row → **FOCAL: `FeatureSpotlight`** (`focus` + `glow`) → rails → cities → shaadi-wash "how it works" band → venues + décor rails → guides → footnote. No sticky bar; the tab bar is the only bottom furniture. Content caps at `layout.maxContentWidth` and centres.

   **The focal card carries no photograph.** The one vendor on production that passes the featured gate has our own marketing render at `images[0]` and a third-party logo at `[1]`, and no API field distinguishes a real photo from either. It leads with facts in the royal register instead — see `FeatureSpotlight.tsx` for the evidence and the condition for reverting.

4. **Components** `HomeHeader` · `CategoryArchRow` · `FeatureSpotlight` · `VendorShowcase` · `RecentlyViewedRail` · `SectionHeader` · `Chip` · `Card`

5. **States** — skeleton per block, never a full-screen spinner. Rails hide when empty. No error state: a failed rail hides rather than shouting, because Home must always be usable.

6. **Edge cases**
   - Spotlight image is a platform ad → the quality gate (`sponsored || verificationTier > 0` **and** a review) excludes it.
   - Long Pakistani business names → 2 lines, then ellipsis.
   - Logged out → greeting without a name.
   - Urdu → Nastaliq, ×1.7 line height, hero reads right-to-left.

7. **Navigation** — medallion → Explore with `?category=`. Search → Explore `?focus=search`. Filter → Explore `?focus=filters`. Spotlight/cards → `vendor/[id]`. Rail "View all" → Explore filtered. **No dead ends.**

8. **Done when** — all 10. **Closed:** 360px (28/28 targets ≥44, zero clipped strings, no body scroll) · 430px + 834px · Urdu (RTL, Nastaliq, mirrored controls, and Urdu-script vendor data handled in the English build) · navigation (6 destinations clicked, routes read back) · failure path (API killed: rails hide, no invented figures, screen stays usable) · 7 requests, down from 12 · contrast 38/38 · tsc + eslint clean. **Outstanding: throttled 3G and cold-start on hardware** — both need a device (D3), as does pull-to-refresh (D4).

---

## S2 — Explore

**Route** `(tabs)/explore` · **Status** `[R]` 5/10

1. **Job** — narrow 3,274 vendors to a shortlist worth opening.

2. **Data** — `/businesses` (infinite, `limit=12`) in browse mode; `fetchAllBusinesses` in full mode when a filter or search is active. `total` from `pagination.total`.

3. **Layout** — `display` title → search → category chips → count + Filters → active-filter chips → masonry 2-up → CompareBar. Focal element is the **result grid** itself; no competing hero.

4. **Components** `Input` · `ChipSelect` · `Chip` · `VendorCard` · `FilterSheet` · `CompareBar` · `FlashList`

5. **States** — skeleton grid (browse) / "loading all" row (full mode) · empty with "clear filters" · error with retry · offline.

6. **Edge cases**
   - Full mode walks every page — must show progress, not freeze.
   - Zero results after 4 filters → tell them **which** filter to relax.
   - `minimumPrice` null on most rows → price filter must not silently exclude them.

7. **Navigation** — category is **a route param, not state** (deep-linkable; and `setState`-in-effect is the crash shape). Filter sheet visibility derives from `?focus=filters`; closing clears the param.

8. **Done when** — all 10. Outstanding: device, throttle, Urdu, large screen, full-mode perf on 3,274 rows.

---

## S3 — Vendor detail

**Route** `vendor/[id]` · **Status** `[R]` 5/10

1. **Job** — decide whether to contact this vendor, and get the contact done.

2. **Data** — `/businesses/:id` (111 cols) · `/businesses/:id/related` · `/reviews/:id` · `/bookings/availability` · `/businesses/:id/bundled-services`. **Vendor-only endpoints 403 here** — don't call them.

3. **Layout** — `PhotoHero` (280) → **ivory sheet overlapping by 24** → overline → `h1` name → rating/verified + price → `SpecStrip` → gallery strip → package tiles → about → services → reviews → availability → related. **FOCAL: the photo hero. PRIMARY: `StickyActionBar`.**

4. **Components** `PhotoHero` · `SpecStrip` · `PackageTiles` · `StickyActionBar` · `ReviewsSection` · `AvailabilityCalendar` · `VendorCard`

5. **States** — skeleton mirroring the real block order · not-found with back · `vacationMode` → CTA disabled with the vendor's own message.

6. **Edge cases**
   - Gallery is platform ads and a Saudi tech logo (verified on 3358/3359). We show what they uploaded; we do not *amplify* it — no ad becomes the featured hero.
   - No images → arch monogram, never a stranger's photo.
   - No phone → WhatsApp and Call are removed, not shown disabled.
   - Advance is a **pair** — `downPayment` + `downPaymentType` decides `%` vs `Rs`.

7. **Navigation** — back always works. Deep-linkable. Records to recently-viewed. Gallery is a sheet, dismissible.

8. **Done when** — all 10. Outstanding: device, throttle, Urdu, large screen, gallery sheet at 360px.

---

## S6 — Date + slot picker · **the screen you asked for by name**

**Route** new · **Status** `[ ]`

1. **Job** — pick a date and a slot the vendor can actually honour, and understand what is left.

2. **Data**
   - **Engine A:** `/businesses/:id/slots/availability/bulk?from&to&subVenueId` → `{ days: { "YYYY-MM-DD": SlotAvailabilityRow[] } }`
   - **Engine B (fallback):** the four legacy periods + `/bookings/availability` + `/bookings/blocked-dates`
   - Gates from the business row: `minLeadDays`, `maxLeadDays`, `vacationStartsAt/EndsAt`, `honorMarketplaceBlackouts`, `eventClosingTime`.

3. **Layout** — `h1` "Choose your date" → vendor + guest context → space selector (multi-space venues only) → `Calendar` → legend → selected-date slot list → `StickyActionBar` with the running price.

4. **Components** `Calendar` ✓ · `SlotPicker` **+** · `SegmentedControl` **+** · `StickyActionBar` ✓ · `lib/date` ✓

5. **States** — month loading keeps the grid visible and un-dotted (never a blank calendar) · no slots on a date → say so and suggest the nearest open date · fully booked month → offer the next month.

6. **Edge cases** — all of these are real and each has drawn blood:
   - **`capacity` ≠ `unitGuestCapacity`.** Concurrent bookings vs guests in one booking. Render `free of capacity`; validate guests against `unitGuestCapacity`.
   - **Space scoping.** Business 3358 has five spaces; a slot belonging only to "afsana" was offered to someone who picked another hall. Changing space **must** clear `slotTemplateId` and drop the month cache.
   - **Evening ends 22:00.** Punjab halls close at 10 PM. A 23:00 canonical example put 40 of 115 live slots past closure, found only at Pay & Confirm.
   - **Day-roll.** Use `lib/date` local-noon keys. `toISOString()` on local midnight books the night before the mehndi.
   - **Mixed-mode carts are rejected** — `slotTemplateId` only on a single-vendor cart.
   - Grid is always 42 cells; the dot row reserves height. A calendar that shifts under the thumb reads as broken.

7. **Navigation** — in from vendor detail's CTA. Back preserves the date. Forward to guests. Date + slot survive going back and forward.

8. **Done when** — all 10, **plus**: verified against a vendor with templates AND one without; verified across a month boundary; verified with a space change mid-flow.

---

## Specs still to write

Before each is built: **S4** Favourites · **S5** Compare · **S7** Guests · **S8** Packages · **S9** Review order · **S10** Payment · **S11** Confirmation · **S12** My bookings · **S13** Booking detail · **S14** Chat · **S15** Write review · **S16** Cancel/refund *(blocked, B1)* · **S17** Plan hub · **S18** Shaadi cart · **S19** Tools · **S20** Quotes · **S21** Inbox · **S22** Account · **S23** Profile/Settings · **S24** Complaints · **S25** Auth · **S26** Onboarding · **S27** Guides
