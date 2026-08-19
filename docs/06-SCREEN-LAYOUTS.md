# 06 — Screen layouts

**Section-by-section layout for all 27 screens.** Wireframes at 360px, the width the app is actually used at.

Governed by [../rules.md](../rules.md). Widgets from [05-UI-SPEC.md](05-UI-SPEC.md). Endpoints from [01-FUNCTIONALITY-AND-ENDPOINTS.md](01-FUNCTIONALITY-AND-ENDPOINTS.md). Full specs in [04-SCREEN-SPECS.md](04-SCREEN-SPECS.md).

**Every screen declares:** its ONE focal element (`lg`), its ONE primary action (`glow`), and its section stack. Gutter is always 24.

---

## Information architecture

```
                        ┌─────────────┐
                        │  Onboarding │  first launch only
                        └──────┬──────┘
        ┌──────────┬───────────┼───────────┬──────────┐
     ┌──▼──┐   ┌───▼───┐   ┌───▼──┐   ┌────▼───┐  ┌───▼───┐
     │Home │   │Explore│   │ Plan │   │ Inbox  │  │Account│   ← the 5 tabs
     └──┬──┘   └───┬───┘   └───┬──┘   └────┬───┘  └───┬───┘
        └──────┬───┘           │           │          │
         ┌─────▼──────┐   ┌────▼────┐  ┌───▼───┐  ┌───▼────────┐
         │Vendor detail│  │Shortlist│  │ Chat  │  │ Bookings   │
         └─────┬───────┘  │Cart     │  │Quotes │  │ Payments   │
               │          │Tools    │  │Notifs │  │ Profile    │
        ┌──────▼───────┐  └─────────┘  └───────┘  │ Settings   │
        │ BOOKING FLOW │                          │ Complaints │
        │ date → guests│                          └────────────┘
        │ → packages   │
        │ → review     │
        │ → pay        │
        │ → confirmed  │  ← royal
        └──────────────┘
```

---

## S1 · Home — `(tabs)/index`

**Focal** FeatureSpotlight · **Primary** none (tab bar is the only bottom furniture)

```
┌────────────────────────────────────────┐
│ Assalam-o-Alaikum, Rehman              │ caption muted
│ Find your                              │ display 32, Fraunces
│ perfect day                            │ italic gold
│ ┌──────────────────────────┐ ┌──────┐ │
│ │ ⌕ Venues, photographers… │ │  ⚙   │ │ pill 46 + charcoal square 46
│ └──────────────────────────┘ └──────┘ │
├────────────────────────────────────────┤ ← gap 32
│ BROWSE BY CATEGORY          View all › │ SectionHeader
│  ╭──╮  ╭──╮  ╭──╮  ╭──╮  ╭─           │ ArchMedallion ×6, 4.4 visible
│  │ph│  │ph│  │ph│  │ph│  │p           │
│  ╰──╯  ╰──╯  ╰──╯  ╰──╯  ╰─           │
│ Venues Photo Catering Mehndi Déco      │
├────────────────────────────────────────┤
│ FEATURED THIS WEEK                     │
│ ╔════════════════════════════════════╗ │ ◄── FOCAL: Card focus + glow
│ ║ [✓ VERIFIED]      ╭─╮              ║ │     arch whisper
│ ║        photo, scrim                ║ │     h 200, radius lg
│ ║ Rehman Grand Marquee               ║ │     h1 onDark
│ ║ Johar Town · 900 guests · Rs 350k  ║ │     caption
│ ╚════════════════════════════════════╝ │
├────────────────────────────────────────┤
│ TOP PHOTOGRAPHERS            See all › │
│ ┌──────────┐┌──────────┐┌───           │ VendorCard rail, w 260
├────────────────────────────────────────┤
│ BROWSE BY CITY               View all › │
│ (Karachi)(Lahore)(Islamabad)(Raw        │ Chip scroll
├────────────────────────────────────────┤
│ ░░ shaadi wash band ░░                 │ HowItWorks, 3 steps
├────────────────────────────────────────┤
│ CATERERS · BRIDAL MAKEUP · DECORATORS  │ 3 more rails
│ ┌ Wedding guides                    › ┐│ Card rise
└────────────────────────────────────────┘
│ ⌂Home  ⌕Explore  ♡Plan  ✉Inbox  ◔Acct │
```

**Empty/fail** — any rail with zero results **hides entirely**. No spotlight passes the quality gate → **renders nothing**. Home must always be usable, so a failed rail never shows an error.

---

## S2 · Explore — `(tabs)/explore`

**Focal** the result grid · **Primary** none

```
┌────────────────────────────────────────┐
│ Explore                                │ display 32
│ ┌────────────────────────────────────┐ │
│ │ ⌕ Search vendors, cities…          │ │ Input, ref-focusable
│ └────────────────────────────────────┘ │
│ (All)(Wedding Venue)(Wedding Photog…   │ ChipSelect → route param
│ 3,274 vendors              ⚙ Filters(2)│ caption / gold
│ (Lahore ×)(≤ Rs 5L ×)(4★+ ×)(Clear)   │ active filters, only when any
├────────────────────────────────────────┤
│ ┌───────────┐  ┌───────────┐          │ FlashList masonry 2-up
│ │ VendorCard│  │ VendorCard│          │ h-padding 10, card gap 12
│ └───────────┘  └───────────┘          │
│ ┌───────────┐  ┌───────────┐          │
│         … infinite scroll …            │
├────────────────────────────────────────┤
│ ⇄ 2 to compare              Compare ›  │ CompareBar, only when ids ≥1
└────────────────────────────────────────┘
```

**Filter sheet (MB13–MB16)** — where S2 was weakest: 17 filters and 6 sorts with zero feedback until applied and closed.

```
✕  Filters
Category  [All 3,274][Venues 716][Photo 60]   ← option + its COUNT (MB15)
Price     ▁▃▅█▇▅▃▁▁  histogram of inventory   ← (MB14)
          [Min Rs 50,000]—[Max Rs 2,000,000]
          ⚠ 2,981 vendors have no price
Clear all             [ Show 142 vendors ]    ← LIVE count (MB13)
```

Nearly free for us: "full mode" already holds the whole category set client-side, so counts and price distribution cost no extra request. At zero results the CTA disables and **names the filter to relax** — never a bare "no results".

**States** browse → skeleton grid of 4 · full mode → "loading all" row with progress · empty → *which* filter to relax, not just "no results" · error → retry.

---

## S3 · Vendor detail — `vendor/[id]`

**Focal** PhotoHero · **Primary** StickyActionBar

```
┌────────────────────────────────────────┐
│ ‹              [⤴] [♥]                 │ PhotoHero h 280
│         ╭──╮  arch whisper             │ both scrims
│         photo (paging) ▬···            │
├══════════════════════════════════════┤ ← sheet overlaps 24, radius lg
│ WEDDING VENUE · JOHAR TOWN, LAHORE     │ overline
│ Rehman Grand Marquee                   │ h1 26, ≤3 lines
│ ┌──────┬──────────┬──────┐            │ TrustRow (MB1) — ABOVE specs
│ │ 4.33 │ ✓Verified│  3   │            │ bordered, 3 cells
│ │ ★★★★ │  Trusted │Reviews│           │ reviews TAPPABLE (MB6)
│ └──────┴──────────┴──────┘            │
│ Rs 350,000 · starting                  │ h2 gold + unit (MB3)
│ 10% advance · free cancel in 3 days    │ caption — risk reducer (MB4)
│ ⚑ Usually booked on weekends           │ honest scarcity, computed (MB5)
│ ├────┬────┬────┬────┤                 │ SpecStrip
│ │500 │10% │ 5  │ AC │                 │
│ ├────┴────┴────┴────┤                 │
│ ┌────────────────────────────────────┐ │ VendorHostCard (MB2)
│ │ ◔ Hosted by Rehman Yousaf       →  │ │ hides if no ownerName
│ │   Trusted · 5 years · 120 weddings │ │
│ └────────────────────────────────────┘ │
│ ▭ ▭ ▭ ▭                               │ gallery thumbs 80×56
├────────────────────────────────────────┤
│ CHOOSE A PACKAGE                       │
│ ┌──────┐┌──────┐┌──────┐              │ PackageTiles, selectable
│ │Silver││ Gold ││Platin│              │ drives the CTA price
├────────────────────────────────────────┤
│ 🛡 Reliability: trusted                │ only if tier ≠ newcomer
│ ABOUT · SERVICES (chips) · REVIEWS     │
│ AVAILABILITY (month preview)           │
│ MORE FROM THIS VENDOR (rail)           │
└────────────────────────────────────────┘
│ [✆] [✉]  Request booking / Rs 350,000  │ StickyActionBar, glow
```

**Edge cases** No phone → the two squares are **removed**, not disabled. `vacationMode` → CTA disabled with the vendor's own message. No images → arch monogram. Advance is a **pair** (`downPayment` + `downPaymentType` → `%` or `Rs`).

---

## S4 · Favourites · S5 · Compare

```
S4                                        S5
┌──────────────────────────┐             ┌──────────────────────────┐
│ ‹ Saved                  │             │ ‹ Compare                │
│ 6 saved vendors          │             │        │ Venue A │ Venue B│
│ ┌────────┐ ┌────────┐   │             │        │  photo ×│  photo×│
│ │VendorCd│ │VendorCd│   │             │ TYPE   │ Venue   │ Venue  │
│ └────────┘ └────────┘   │             │ CITY   │ Lahore  │ Karachi│
│  pull-to-refresh         │             │ RATING │ 4.3 (3) │ New    │
└──────────────────────────┘             │ PRICE  │Rs 350k  │On req  │
Empty → heart icon,                      │ SEATED │ 500     │ 300    │
"Explore vendors" action                 │ VERIFIED│ Yes    │ No     │
                                         │        │[View ›] │[View ›]│
                                         └──────────────────────────┘
                                         Labels column 108 fixed,
                                         vendor columns 156 h-scroll.
                                         < 2 vendors → EmptyState.
```

---

## S6 · Date + slot — **the calendar**

**Focal** Calendar · **Primary** Continue

```
┌────────────────────────────────────────┐
│ ‹  Choose your date            (1/4)   │ h1 + step
│ Rehman Grand Marquee · Baraat          │ caption muted
│ [ Main Hall │ Lawn │ Rooftop ]         │ SegmentedControl — multi-space ONLY
├────────────────────────────────────────┤
│ [ Dates │ Months │ Flexible ]          │ mode segmented (MB8)
│   M  T  W  T  F  S  S                  │ sticky weekday header
│ September 2026                         │ CONTINUOUS scroll (MB7)
│   1  2  3  4  5  6  7   ← 42 cells     │
│   ·  ·  ●  ●  ◐  ✕  ·                  │
│ October 2026                           │ next block, no pager
│   …                                    │
│ [Exact][± 1 day][± 2 days]             │ flexibility (MB9)
│  ● Open  ◐ Few left  ✕ Booked          │ legend
├────────────────────────────────────────┤
│ SUN, 14 SEP · 4 SLOTS                  │
│ ┌────────────────────────────────────┐ │ SlotPicker
│ │ Baraat            2 of 3 left  ✓   │ │ selected: gold rim
│ │ 7 PM to 11 PM                      │ │
│ ├────────────────────────────────────┤ │
│ │ Evening           1 of 4 left      │ │ warning
│ │ Midday            Booked           │ │ opacity .44
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
│         Continue / Rs 350,000          │ glow, disabled until slot chosen
```

**Non-negotiables** 42 cells always · dot row height always reserved · changing space **clears `slotTemplateId` and drops the month cache** · Evening ends **22:00** (Punjab 10 PM closure) · `lib/date` local-noon keys · hours say **"to"**.

---

## S7 · Guests · S8 · Packages

```
S7                                        S8
┌──────────────────────────┐             ┌──────────────────────────┐
│ ‹ How many guests? (2/4) │             │ ‹ Your package    (3/4)  │
│ Sun 14 Sep · Baraat      │             │ ┌──────┐┌──────┐┌──────┐│
│                          │             │ │Silver││ Gold ││Platin││
│      ┌──────────────┐    │             │ └──────┘└──────┘└──────┘│
│      │ [−]  500  [+]│    │ Stepper     │ Includes: hall, décor,   │
│      └──────────────┘    │ mono 16     │ sound, 500 plates        │
│  GUESTS  (per-type label)│ ← from API  │                          │
│  Seated capacity 500 ✓   │ success     │ ADD-ONS                  │
│  ⚠ Above comfort (450)   │ warning     │ ☐ Décor upgrade +Rs 40k  │
│                          │             │ ☐ Dhol group   +Rs 15k   │
│ EVENT DETAILS            │             │ ☐ Per-plate     Rs 1,850 │
│ Location [At venue ▾]    │ Segmented   │ ├──────────────────────┤ │
│ Address ______________   │ conditional │ Total        Rs 660,000 │ TotalsCard
│ Notes   ______________   │             │ Advance 10%   Rs 66,000 │ success
└──────────────────────────┘             └──────────────────────────┘
│      Continue            │             │  Continue / Rs 660,000   │
```

The guest **label comes from `/bookings/meta/guest-count-label`** — a caterer counts plates, a car rental counts seats. Never hardcode "Guests". Validate against `legalGuestCap`, `comfortCapacity`, `unitGuestCapacity`.

---

## S9 · Review · S10 · Payment · S11 · Confirmed

```
S9 REVIEW                     S10 PAYMENT                  S11 CONFIRMED (royal)
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│ ‹ Review    (4/4)  │       │ ‹ Payment          │       │░ jaali on charcoal ░│
│ ┌────────────────┐ │       │ Advance due        │       │      ╭───╮          │
│ │ photo  Rehman  │ │       │ Rs 66,000          │ mono  │      │ ✓ │  gold arch│
│ │        Grand   │ │       │                    │ Large │      ╰───╯    seal   │
│ └────────────────┘ │       │ ┌────┐┌────┐┌────┐│       │ YOUR DATE IS HELD    │
│ WHEN               │       │ │Card││Jazz││Easy││ tiles │ Sunday               │
│ Sun 14 Sep         │       │ └────┘└────┘└────┘│ from  │ 14 September         │ hero 44
│ Baraat 7–11 PM  ✎  │       │ ┌────┐┌────┐      │ /pk/  │ Rehman Grand Marquee │
│ GUESTS  500     ✎  │       │ │Raast││Cash│     │methods│ Baraat · 7 to 11 PM  │
│ PACKAGE Gold    ✎  │       │                    │       │ ┌──────────────────┐ │
│ ├────────────────┤ │       │ [ card form ]      │       │ │Booking     #2841 │ │
│ Package  Rs620,000│ Money  │                    │       │ │Total   Rs660,000 │ │
│ Décor    Rs 40,000│ Row    │ ⚠ Above Rs 999,999?│       │ │Paid     Rs66,000 │ │ success
│ ─────────────────  │       │   → bank transfer  │       │ │Balance Rs594,000 │ │ danger
│ Total   Rs660,000 │       │                    │       │ └──────────────────┘ │
│ Advance  Rs66,000 │ succ  │ 🔒 Secure          │       │ [Message the venue]  │ glow
│ Balance Rs594,000 │ dang  │                    │       │ [Add to my plan]     │ ghost
│ ☐ I accept terms   │       │                    │       └────────────────────┘
└────────────────────┘       └────────────────────┘
│ Pay Rs 66,000      │       │ Pay Rs 66,000      │
```

**S10 hard rules** — methods come from `/payments/pk/methods?bookingId=`, never hardcoded · **> Rs 999,999 diverts to bank transfer** (Stripe's PK card ceiling; a wedding advance routinely exceeds it) · leaving the screen fires `DELETE /bookings/:id/cancel-pending` · existing-intent reuse must not be removed.

**S11 is a royal moment** — one of only three. Charcoal, jaali, gold arch seal, date in Fraunces `hero`.

---

## S12 · S13 — Bookings + detail

```
S12 MY BOOKINGS               S13 BOOKING DETAIL
┌────────────────────┐       ┌────────────────────────────┐
│ Bookings           │       │ ‹ Booking #2841        [⤴] │
│ [Upcoming│Past]    │ Seg   │ ┌────────────────────────┐ │
│ ┌────────────────┐ │       │ │ photo · Rehman Grand   │ │
│ │Rehman Grand    │ │       │ │ Sun 14 Sep · 7 to 11PM │ │
│ │Sun 14 Sep      │ │       │ └────────────────────────┘ │
│ │● Confirmed     │ │ Badge │ ● Requested   14 Aug       │ StatusTimeline
│ │Rs 66k of 660k  │ │ mono  │ ● Confirmed   15 Aug       │
│ └────────────────┘ │       │ ◍ Advance paid pending     │
│ ┌────────────────┐ │       │ ○ Event day   14 Sep       │
│ │Studio Noor     │ │       │ ├──────────────────────┤   │
│ │● Awaiting pay  │ │       │ Total      Rs 660,000     │ TotalsCard
│ └────────────────┘ │       │ Paid        Rs 66,000     │
└────────────────────┘       │ Balance    Rs 594,000     │
Empty → "Explore vendors"    │ INSTALMENTS · MILESTONES   │
                             │ [Message] [Reschedule]     │
                             │ [Cancel booking]           │ danger ghost
                             └────────────────────────────┘
                             │  Pay balance / Rs 594,000  │
```

**S13 uses `/bookings/:id/with-availability`** — `/bookings/:id` does **not exist**. Cancel-with-refund is **blocked by B1** (403 "Not your booking"); until fixed, Cancel does the plain cancel and says so.

---

## S14 · Chat · S15 · Write review

```
S14                                  S15
┌──────────────────────────┐        ┌──────────────────────────┐
│ ‹ ◔ Rehman Grand   ● online       │ ‹ Rate your experience   │
│                                   │ ┌──────────────────────┐ │
│         ┌──────────────┐ │ theirs │ │ photo · Rehman Grand │ │
│         │ Assalam o... │ │ card   │ └──────────────────────┘ │
│         └──────────────┘ │ 15:40  │   ★ ★ ★ ★ ☆              │ 44 targets
│ ┌──────────────┐         │ mine   │   Tap to rate            │
│ │ Is 14 Sep... │         │ gold   │ ┌──────────────────────┐ │
│ └──────────────┘  ✓✓     │        │ │ What stood out?      │ │ multiline
│         ┌──────────────┐ │        │ └──────────────────────┘ │ counter
│         │ Yes, evening │ │        │ [+ Add photos]  ▭ ▭      │
├──────────────────────────┤        └──────────────────────────┘
│ [+] Type a message… [→]  │        │      Submit review       │
└──────────────────────────┘
Bubble: radius lg, mine gold/onGold right, theirs card/ink left.
Day dividers. Sending → optimistic + spinner. Failed → retry tap.

QUICK-REPLY CHIPS above the composer (MB17):
┌──────────────────────────────────────────┐
│ (Is 14 Sep free?)(What's included?)(500  │  h-scroll, SEND ON TAP
│  guests?)(What's the advance?)           │
│ [+]  Type a message…              [ → ]  │
└──────────────────────────────────────────┘
```

**Quick replies are the anti-WhatsApp lever (MB17).** Chat exists to keep the conversation on-platform, where we can see it. Typing on a phone is friction; typing Urdu is worse. Five tappable questions a couple actually asks remove that friction and hand the vendor something answerable in one tap. Chips are **contextual** — vendor category + the customer's active date drive the set, so a photographer gets *"Do you cover Mehndi and Baraat?"*, not *"How many guests?"*.

**Message payloads are TYPED (MB18)** — `text` · `availability` (date card) · `quote` (links to the real quote) · `image`. **This data-model decision must be made before S14 is built**, not retrofitted onto a text-only list.

---

## S17–S19 — Plan hub, cart, tools

```
S17 PLAN HUB                  S18 SHAADI CART              S19 TOOLS (e.g. Budget)
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│ Plan               │ disp  │ ‹ My Shaadi Plan   │       │ ‹ Budget           │
│ ╔════════════════╗ │ FOCAL │ MEHNDI · 12 Sep    │       │ ┌────────────────┐ │
│ ║ Your shaadi    ║ │       │ ┌────────────────┐ │       │ │ Rs 1,850,000   │ │ monoLarge
│ ║ 14 Sep · 28 dy ║ │       │ │Mehndi artist   │ │       │ │ of Rs 2,000,000│ │
│ ║ 3 of 8 booked  ║ │       │ │Rs 45,000    ✕  │ │       │ │ ▓▓▓▓▓▓▓░░ 92%  │ │ progress
│ ╚════════════════╝ │       │ └────────────────┘ │       │ └────────────────┘ │
│ ┌──────┐ ┌───────┐ │ bento │ BARAAT · 14 Sep    │       │ Venue    Rs 350k ✎ │ MoneyRow
│ │ ♥ 6  │ │ ⇄ 2   │ │       │ ┌────────────────┐ │       │ Catering Rs 925k ✎ │
│ │Saved │ │Compare│ │       │ │Rehman Grand    │ │       │ Photo    Rs 120k ✎ │
│ └──────┘ └───────┘ │       │ │Rs 660,000   ✕  │ │       │ ⚠ Local only —     │
│ BUDGET·CHECKLIST   │       │ └────────────────┘ │       │   not synced (B3)  │
│ GUESTS·TIMELINE    │       │ ├────────────────┤ │       └────────────────────┘
│ (4 tool cards)     │       │ Subtotal Rs 705k  │       │   + Add expense     │
└────────────────────┘       │ Bundle −Rs 35k    │ succ
                             │ Total    Rs 670k  │
                             └────────────────────┘
                             │ Check availability │
```

**S19 must state that tools are device-local** (B3). Silently losing a couple's budget is worse than admitting it doesn't sync.

---

## S20–S24 — Quotes, Inbox, Account, Profile, Complaints

```
S20 QUOTES                    S21 INBOX                    S22 ACCOUNT
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│ ‹ Quotes           │       │ Inbox              │       │ Account            │
│ ┌────────────────┐ │       │ [Chats│Notifs]     │ Seg   │ ┌────────────────┐ │
│ │Rehman Grand    │ │       │ ┌────────────────┐ │       │ │ ◔ Rehman       │ │
│ │● Countered     │ │ badge │ │◔ Rehman Grand  │ │       │ │ …786@gmail.com │ │
│ │You  Rs 600,000 │ │ mono  │ │Yes, evening  ②│ │ badge │ │ ✎ Edit profile │ │
│ │Them Rs 640,000 │ │       │ └────────────────┘ │       │ └────────────────┘ │
│ │[Accept][Counter]│ │       │ ┌────────────────┐ │       │ 📋 Bookings      › │
│ └────────────────┘ │       │ │★ New review... │ │       │ 💳 Payments      › │
└────────────────────┘       └────────────────────┘       │ 💬 Quotes        › │
Status: inquiry → quoted      Unread: goldWash bg          │ ★ Reviews        › │
→ countered → accepted        + gold dot                   │ ⚠ Complaints     › │
Whose turn is explicit.       Mark all read.               │ ⚙ Settings       › │
                                                           │ ↪ Sign out        │ danger
S23 PROFILE / SETTINGS        S24 COMPLAINTS               └────────────────────┘
┌────────────────────┐       ┌────────────────────┐
│ ‹ Settings         │       │ ‹ Complaints       │
│ ACCOUNT            │       │ ┌────────────────┐ │
│ Name ___________   │ Form  │ │#41 Open        │ │
│ Phone __________ ✓ │ Field │ │Vendor no-show  │ │
│ City [Lahore ▾]    │       │ │14 Aug          │ │
│ SECURITY           │       │ └────────────────┘ │
│ Change password  › │       └────────────────────┘
│ Two-factor    [○]  │ toggle│  + Raise a complaint│
│ Active sessions  › │
│ PREFERENCES        │
│ Language [EN│اردو] │ Seg
│ Notifications [●]  │
└────────────────────┘
```

---

## S25–S27 — Auth, Onboarding, Guides

```
S25 AUTH                      S26 ONBOARDING               S27 GUIDES
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│         ╭───╮      │ arch  │░ jaali, shaadi wash░│       │ Guides             │
│         │ W │      │       │      ╭─────╮        │       │ ┌────────────────┐ │
│         ╰───╯      │       │      │ ph  │        │ arch  │ │ photo          │ │
│  Welcome back      │ disp  │      ╰─────╯        │       │ │ How to plan a  │ │
│ [Sign in│Register] │ Seg   │  Discover the best  │ disp  │ │ wedding in PK  │ │
│ ┌────────────────┐ │       │  Browse 3,000+      │       │ └────────────────┘ │
│ │ Email          │ │       │  trusted vendors    │       │ ┌────────────────┐ │
│ │ Password    👁 │ │       │      ▬ · ·          │ dots  │ │ Wedding costs  │ │
│ └────────────────┘ │       └────────────────────┘       └────────────────────┘
│ Forgot password?   │       │ Skip        Next →  │
│ ──── or ────       │       Guard the redirect with a ref.
│ [ Continue w/ OTP] │       Never re-fire (crash #5).
└────────────────────┘
│      Sign in       │ glow
```

---

## Cross-screen rules

| Rule | Why |
|---|---|
| **Gutter 24 everywhere** | An inconsistent gutter is the most visible cheapness in a mobile app. |
| **Section gap 32** | Below that, sections read as one block. |
| **Content padding-bottom ≥ 120 when a sticky bar exists** | Otherwise the last row is unreachable. |
| **`insets.top` on every screen without a PhotoHero** | Full-bleed screens handle it inside the hero. |
| **Back always somewhere sensible; every screen deep-linkable** | Gate 7. |
| **One `lg`, one `glow`** | Gate 6. |
| **Every list/rail has a destination** | No dead ends. |
| **Skeleton mirrors the real block order** | A skeleton in a different shape is a visible reflow on load. |
| **Numbers in `mono`** | Prices align down a column. |
| **Urdu: Nastaliq ×1.7, RTL** | Cramped Nastaliq is illegible, not tight. |
