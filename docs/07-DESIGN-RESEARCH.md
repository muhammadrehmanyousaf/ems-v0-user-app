# 07 — Design research

**Sourced research into the best-designed apps and current mobile design practice, with what we change because of each finding.**

Every claim here carries a reference. Research without a consequence is decoration, so each finding ends with **→ ACTION**, and every action lands in [00-PROGRAM.md](00-PROGRAM.md) or amends [02-DESIGN-SYSTEM.md](02-DESIGN-SYSTEM.md) / [05-UI-SPEC.md](05-UI-SPEC.md).

Compiled 2026-08-17. Re-run before each phase — design practice moves.

---

## 1. Trust signals — the highest-value finding in this document

This is the research that most directly changes what we build, because it is about a **marketplace**, which is what we are.

**Findings:**

- **Placement matters more than presence.** Reviews, completion rate and response time belong **directly under the primary listing title and image, above the fold** — not below it, where buyers scroll only *after* deciding. A review count buried below the fold "does not function as a trust signal, it is decoration." Trust signals only reduce hesitation when they appear **where the hesitation is happening**. ([User Intuition — Trust UX](https://www.userintuition.ai/reference-guides/trust-ux-proof-guarantees-and-signals-that-reduce-risk), [Airbridge — Social proof for apps](https://www.airbridge.io/en/blog/social-proof-for-apps))
- **Verified reviews, response-time badges and completion rates lift conversion 10–25% in service marketplaces.** ([User Intuition](https://www.userintuition.ai/reference-guides/trust-ux-proof-guarantees-and-signals-that-reduce-risk))
- **Checkout abandonment falls 30–40%** when guest checkout is offered alongside social proof. ([Low-code Agency — marketplace CRO](https://www.lowcode.agency/blog/marketplace-conversion-rate-optimization-guide))
- **Goal-matched proof beats generic praise.** A review that mirrors what the user just said they want builds far more trust than general compliments. ([User Intuition](https://www.userintuition.ai/reference-guides/trust-ux-proof-guarantees-and-signals-that-reduce-risk))
- Verified badges and visible ratings exist to overcome "the natural skepticism that often comes with online shopping." ([Purrweb — marketplace UI/UX](https://www.purrweb.com/blog/marketplace-ux-ui-design/), [Excited — marketplace UX](https://excited.agency/blog/marketplace-ux-design))

**Why this stings:** the backend already returns `reliability` on every business — `{ score, tier, badges, breakdown }` — and our vendor detail screen renders it **below the fold**, after the packages, as a single quiet line. We are computing a trust signal and then hiding it in the exact place the research says makes it worthless.

**→ ACTION (T1)** Move reliability into the identity block, directly under the vendor name beside the rating. Above the fold, always.
**→ ACTION (T2)** Add a `TrustRow` widget: rating · review count · verified tier · reliability tier · response time. One row, under the title, on vendor detail **and** in the booking review step.
**→ ACTION (T3)** Surface response time. If the API does not expose it, ask the backend for it — the research prices this at 10–25% conversion.
**→ ACTION (T4)** Reconsider requiring login before enquiry. If a couple must register to send a WhatsApp enquiry, that is our version of forced-account checkout. Raise as a product question.
**→ ACTION (T5)** On the reviews section, surface reviews matching the customer's active filters first (city, event type) rather than newest-first.

---

## 2. Airbnb — the closest analogue we have

A marketplace of physical spaces, sold on photography, where the whole transaction depends on trusting a stranger. That is our problem exactly.

**Findings** — Airbnb's app rests on three things: **immersive visual storytelling** (HD photo and video to build trust *before* booking), **social proof at every decision point** (ratings and reviews present wherever a decision is made, not on one page), and **warm colour psychology** — coral and soft beige, chosen to evoke comfort and hospitality. ([Design Studio UIUX — mobile app design examples](https://www.designstudiouiux.com/blog/mobile-app-design-examples/), [ProCreator — UX case studies](https://procreator.design/blog/top-ux-design-case-studies/))

Airbnb is also repeatedly named among the best-designed mobile apps of 2026, alongside Gucci, Sephora, Headspace and Robinhood. ([Design Studio UIUX](https://www.designstudiouiux.com/blog/mobile-app-design-examples/), [Start Designs — UI/UX examples](https://www.startdesigns.com/blog/ui-ux-design-examples/))

**What this validates:** our warm ivory + gold direction is not merely a brand inheritance — the category leader independently chose warm coral/beige for the same emotional reason. v3's warmer, deeper ground is the right move.

**→ ACTION (A1)** "Social proof at **every** decision point" is a rule, not a page. Trust marks belong on the card, the detail, the date step, the review step and the confirmation — anywhere a couple hesitates.
**→ ACTION (A2)** Photography must carry trust, not decorate. Reinforces the B2 escalation: a gallery of platform ads and a Saudi tech logo actively destroys the thing Airbnb's design is built on.
**→ ACTION (A3)** Video. Airbnb builds pre-booking trust with video and we have none. Log as a backlog question for vendor uploads.

---

## 3. Platform design languages, 2026

Both platforms shipped a new design language, and they moved in **opposite directions**. ([Android Central — Material 3 Expressive vs Liquid Glass](https://www.androidcentral.com/apps-software/android-os/android-16-material-3-expressive-vs-ios-26-liquid-glass))

| | **Material 3 Expressive** (Android 16) | **Liquid Glass** (iOS 26) |
|---|---|---|
| Bet | Emotion and personalisation | Spatial computing, sensory interfaces |
| Means | Vibrant colour, dynamic lighting, fluid animation responding in real time | Translucency and refraction; "behaves like glass in the real world" |
| Emphasis | Bold colour brought back | Steps back so the **content beneath** the glass leads |

Sources: [Basanta Sapkota — design philosophy differences](https://blog.basanta.is-a.dev/material-3-expressive-vs-liquid-glass-ui-key-differences-in-design-philosophy/) · [Android Authority](https://www.androidauthority.com/apple-liquid-glass-3565641/) · [Futured — Liquid Glass](https://www.futured.app/en/blog/liquid-glass) · [Mantlr — 2026 comparison](https://mantlr.com/blog/liquid-glass-vs-material-expressive)

**Our position.** We ship **one** design language on both platforms — correct for a brand-led marketplace, where looking like Wedding Wala matters more than looking like the OS. But our audience is overwhelmingly **mid-range Android in Pakistan**, so **Material 3 Expressive is the more relevant reference of the two**, and its bet — emotion, colour, motion that responds — is the one to borrow.

**→ ACTION (P1)** Borrow from Expressive: v3's metallic gold and shaadi red already move this way. Motion should respond to interaction (press, selection, pull) rather than merely decorate. Confirms `motion.SPRING.celebrate` for peak moments only.
**→ ACTION (P2)** Borrow from Liquid Glass: **content beneath the surface leads**. We have `expo-blur`; use translucency on the collapsing header, tab bar over content, and sheet backdrops — never as a decorative panel over flat colour. Already in [02-DESIGN-SYSTEM.md](02-DESIGN-SYSTEM.md) §3.3; now sourced.
**→ ACTION (P3)** Do **not** chase glass refraction. It is expensive on mid-range Android and our ground is warm ivory, not a dark spatial canvas.

---

## 4. Apple Design Awards 2026 — what excellence is judged on

Apple honoured **12 winners from 36 finalists** across six categories: **Delight and Fun · Inclusivity · Innovation · Interaction · Social Impact · Visuals and Graphics**. ([Apple Newsroom](https://www.apple.com/newsroom/2026/06/apple-reveals-winners-of-the-2026-apple-design-awards/), [Apple Developer — winners and finalists](https://developer.apple.com/design/awards/), [9to5Mac](https://9to5mac.com/2026/06/02/apple-reveals-apple-design-awards-app-and-game-winners-for-2026/))

App winners include **Tide Guide** (Visuals and Graphics) and **NBA: Live Games & Scores** (Innovation). ([MacRumors](https://www.macrumors.com/2026/06/02/apple-design-award-winners-2026/), [TUAW](https://www.tuaw.com/2026/06/03/apple-reveals-2026-design-award-winners))

**What matters is the category list itself.** Note what is *not* there: no "prettiest", no "most on-trend". The axes are delight, inclusivity, innovation, interaction, social impact, visuals. Four of six are about how an app *behaves and who it serves* — only one is purely visual.

**→ ACTION (ADA1)** **Inclusivity** is an award axis, and our Urdu support is currently a font swap. Real inclusivity for Pakistan means Urdu as a first-class language, correct Nastaliq line height, RTL layout that actually mirrors, and legibility in bright daylight. Promote Urdu from gate 9's tail to a first-class concern.
**→ ACTION (ADA2)** **Interaction** — judge our screens on how they *respond*, not how they photograph. Add to the 10 gates: does every touch acknowledge itself within 100ms?
**→ ACTION (ADA3)** Study Tide Guide for visuals: a data-dense utility that reads as beautiful. That is the calendar's problem — dense availability data that must feel elegant.

---

## 5. The five core marketplace UI patterns — and our honest score

Research identifies five patterns every marketplace needs. ([Purrweb](https://www.purrweb.com/blog/marketplace-ux-ui-design/), [Excited](https://excited.agency/blog/marketplace-ux-design))

| # | Pattern | Us |
|---|---|---|
| 1 | Advanced search, multi-attribute filtering | ✅ 17 filters, 6 sorts |
| 2 | **Persistent** trust indicators | ⚠️ present but mis-placed — §1 |
| 3 | Dual dashboard, buyer and seller | n/a — the vendor app is separate, which is the better answer |
| 4 | Streamlined checkout **with guest access** | ❌ not built |
| 5 | Real-time messaging | ❌ `/chat/*` is live and unused |

**Two and a half out of five.** Both gaps are already in the programme (S10, S14) — this research raises their priority and prices them: messaging is a *core pattern*, not a nice-to-have, and guest access is worth 30–40% of checkout abandonment.

**→ ACTION (M1)** Promote chat (S14) up the build order. It is a core marketplace pattern, the endpoint is live, and it is the thing that keeps a couple on-platform instead of moving to WhatsApp where we lose all visibility.

---

## 6. The competitor benchmark: WedMeGood, and Shadiyana

**WedMeGood** — India's most popular wedding planning app, **1.9 million users** across app and web. It offers verified vendor listings, couple reviews, **transparent package pricing**, enquiry management, plus checklist, budget and guest-list tools. ([WedMeGood — planning app](https://www.wedmegood.com/blog/the-ultimate-wedding-planning-app-that-you-must-try/), [Google Play](https://play.google.com/store/apps/details?id=com.wedmegood.planner&hl=en_IN), [WedMeGood — best apps for brides](https://www.wedmegood.com/blog/5-best-wedding-planning-apps-for-todays-brides/))

South Asian platforms of this kind "replaced the referral chain with a searchable marketplace" via verified listings, couple reviews, transparent pricing and enquiry management. **In Pakistan, Shadiyana runs the same model.** ([The Hans India — digital platforms transforming South Asian wedding planning](https://www.thehansindia.com/life-style/how-digital-platforms-are-transforming-wedding-planning-across-south-asia-1079009))

**The uncomfortable read.** WedMeGood's feature set is *exactly* our four planning tools plus a verified directory — and they have 1.9M users. **Feature parity is not a strategy.** Two things can differentiate us:

1. **Transparent package pricing** is named as a core competitive feature, and ~98% of our listings have no price at all. Every "On request" is a competitive loss, not just an empty field.
2. **Nobody in this category has a visual signature.** WedMeGood, Shadiyana and WeddingWire all look like generic directories. The Mehrab arch and jaali are the one thing that cannot be copied onto a directory template — which reframes them from decoration to **the strategy**.

**→ ACTION (C1)** Escalate price coverage as a business metric, not a data nit. Add to B4.
**→ ACTION (C2)** Treat the Mehrab as the differentiator it is. Every screen should be recognisable as Wedding Wala from a cropped screenshot.
**→ ACTION (C3)** Install WedMeGood and Shadiyana and walk their booking flows end to end. Cheapest available competitive research, and I cannot do it from here.

---

## 7. Mobbin — the tool this project actually needs

You asked me to research the world's best designs from Pinterest and Dribbble. I cannot reach Pinterest's feed (its search needs JS + login, and the browser tool runs an isolated profile). **Mobbin solves this properly and is a better source than either.**

**What it is:** a curated library of **600,000+ real app screenshots from 1,000+ apps**, organised by design pattern and flow, tagged with metadata, updated weekly. Not moodboard art — real production screens, in the flows they belong to. ([Mobbin](https://mobbin.com/), [Banani — Mobbin overview](https://www.banani.co/references), [MakerStack — Mobbin review](https://makerstack.co/reviews/mobbin-review/))

**Why it matters here:** Mobbin shipped an **official MCP server on 2026-05-12**, exposing **621,500+ screens and 142,200+ flows** to AI agents over a remote HTTP endpoint. ([ChatForest — Mobbin MCP](https://chatforest.com/reviews/mobbin-mcp-server/), [Developer Toolkit — Mobbin MCP](https://developertoolkit.ai/en/shared-workflows/mcp-ecosystem/mobbin-mcp/))

With it connected I could pull the *actual* booking flows of the best-designed marketplace apps and design against real screens rather than my description of them. Pricing: Free / **$10/mo Pro** / $12/member/mo Team. ([MakerStack](https://makerstack.co/reviews/mobbin-review/))

**→ ACTION (R1)** **Connect the Mobbin MCP server.** Highest-leverage thing available for this project right now, and it directly answers what you asked for. It needs your authorisation — I cannot add it myself.
**→ ACTION (R2)** Pinterest: paste direct `i.pinimg.com` URLs (those work) or screenshots. The feed is unreachable to me.

---

## 7b. Mobbin evidence — real production screens

Browsed 2026-08-17 in a logged-in session on the **free tier**, which turned out to be enough: app-level browsing is capped at "the 4 latest apps", but **pattern-filtered screen search is open**. Filter URLs take the form:

```
https://mobbin.com/search/apps/ios?content_type=screens&sort=popularity
  &filter=screenPatterns.<Pattern>_appCategories.<Category>
```

Sets examined: **Payment Method** (1,096 screens) · **Calendar** (943) · **Calendar × Travel** (190) · **Product Detail × Travel** (383).

This section is the difference between a moodboard and evidence: everything below is a pattern observed in shipping apps, with what it changes for us.

### 7b.1 Airbnb's listing detail — the trust strip, confirmed

The single most valuable screen in the research. Airbnb's listing detail, above the fold, in this order:

```
Private bedroom in Manhattan Upper East Side     title
Room in New York, United States                  location
1 queen bed · Shared bathroom                    key specs, inline
┌──────────┬──────────────────┬──────────┐
│   4.96   │  🏆 Guest        │   298    │       ← TRUST STRIP: bordered, 3 cells
│  ★★★★★   │    favorite      │ Reviews  │
└──────────┴──────────────────┴──────────┘
👤 Stay with Allison                             HOST, named, with tenure
   Superhost · 7 years hosting
⚑ Rare find! This place is usually booked        honest scarcity
$356  For 2 nights · Sep 5–7      [ Reserve ]    price + WHAT IT COVERS
✓ Free cancellation                              risk reducer, at the decision
```

**This is §1's finding built.** Airbnb gives trust its **own bordered strip**, structurally like our `SpecStrip` but for trust — and it sits **above** the specs, immediately under the title. Variants observed: an inline form for longer titles (`★ 4.95 · 22 reviews · 🏅 Superhost`, review count **underlined and tappable**), and Klook using social volume as proof (`★4.8 (44.3K+ reviews) · 1M+ booked` + `Bestseller`).

**→ ACTION (MB1)** `TrustRow` is a **bordered 3-cell strip** above `SpecStrip`: rating+stars · highest earned badge · review count (tappable, jumps to reviews). This supersedes the vaguer T2.

**→ ACTION (MB2) — the biggest miss in our current design.** Airbnb sells the **host as a person**: *"Stay with Allison · Superhost · 7 years hosting"*, with an avatar. We already have `ownerName`, `ownerBio`, `yearsInBusiness`, `weddingsCompleted` and `reliability.tier` in the 111 columns — and show **almost none of it**. A named human with visible tenure is the strongest trust signal available to a marketplace, and we are sitting on it. Add a `VendorHostCard` directly under `TrustRow`.

**→ ACTION (MB3)** **Price must say what it covers.** Airbnb never shows a bare number — always `$356 for 2 nights · Sep 5–7` or `$77 night`. We show `Rs 350,000` with no unit. We have `pricingMode` and `guestCountLabel`: render `Rs 350,000 · starting`, `Rs 1,850 · per head`, `Rs 45,000 · per event`.

**→ ACTION (MB4)** **Risk reducer under the price.** Airbnb puts `✓ Free cancellation` immediately below. We have `cancelationPolicy` + `downPayment` + `downPaymentType`: render `10% advance · free cancellation within 3 days` in the same position.

**→ ACTION (MB5)** **Honest scarcity.** *"Rare find! This place is usually booked."* We have real availability. `"Usually booked on weekends"` is true, useful and not a dark pattern — but only when computed from data, never invented.

**→ ACTION (MB6)** Review count is **tappable** and jumps to reviews. Ours is inert text.

### 7b.2 Airbnb's date picker — I had the calendar wrong

190 travel-booking calendars, dominated by Airbnb's *"When's your trip?"*. It differs from my spec in [05-UI-SPEC.md](05-UI-SPEC.md) §10 in three ways, and it is right on all three.

| | My spec | Airbnb (shipping) |
|---|---|---|
| Month navigation | Paged, `‹ ›` arrows, one month at a time | **Continuous vertical scroll** through months |
| Selection modes | Dates only | Segmented **`Dates │ Months │ Flexible`** |
| Precision | Exact date only | Chips: **`Exact dates │ ± 1 day │ ± 2 days`** |

Also observed: past dates **greyed but still visible** rather than removed; range selection with filled endpoints and a light connecting band; `Skip`/`Reset` left and `Next` right rather than a full-width CTA; a sheet with `✕` that preserves the tab context above it. A second app paired the grid with **start/end time sliders** and a range summary at the top (`Sat, Sep 30 10:00 AM → Tue, Oct 3 10:00 AM`).

**Why each matters more for a wedding than for a trip:**

**→ ACTION (MB7)** **Continuous vertical scroll, not paged months.** Weddings are booked 6–12 months out. Paged navigation is 6–12 taps to reach the date the couple already has in mind. This replaces the `‹ ›` pager in §10 — and it *keeps* the 42-cell rule per month block, so nothing shifts.

**→ ACTION (MB8)** **`Dates │ Months │ Flexible` modes.** A Pakistani couple very often knows *"December, maybe mid-month"* before they know the date — the date is frequently chosen **around vendor availability**, which is the reverse of a hotel booking. `Months` mode should show which months have the most open slots. This is a genuine feature we had not considered.

**→ ACTION (MB9)** **`± 1 day` / `± 2 days` flexibility.** If the 14th is booked and the 15th is open, the app should say so instead of making them hunt. We have per-day availability already — this is nearly free and it directly converts an otherwise-dead search.

**→ ACTION (MB10)** Past/out-of-window dates **greyed but visible**, not blanked. Our `cd--out` renders `color: transparent`, which loses the month's shape. Grey them.

### 7b.3 Payment — 1,096 screens

Patterns worth taking, from Etsy, Klarna, Ramp and others:

- **Reassurance banner *before* the form**: *"You won't be charged until you book."*
- **Per-method subtitle setting expectations**: each method annotated *"Takes minutes"*.
- **Disabled methods state WHY, inline**: *"This payment method can't be used for this transaction"*, *"$50.00 product minimum applies"* — greyed, with the reason attached rather than a silent absence.
- **Processor attribution** for trust (`Stripe` wordmark under the methods).
- **An escape hatch**: *"Missing a payment method?"* row.
- **Step progress** on multi-step checkout (`Step 2 of 3` with a bar).
- Saved methods carry a **`Default` badge** and brand logos.

**→ ACTION (MB11)** S10 gets: a reassurance line above the form, per-method expectation subtitles (`JazzCash · instant`, `Bank transfer · 1–2 days`), **disabled methods showing their reason** — which matters enormously for us, because above Rs 999,999 the card option must be visibly disabled *with the ceiling explained*, not silently missing.

**→ ACTION (MB12)** Show the processor. A Pakistani couple paying Rs 66,000 to a marketplace needs to see who is handling it.

### 7b.4 Airbnb's filter flow — our filter sheet is missing its whole feedback loop

**Flows browse on free too.** URL grammar, now fully decoded and repeatable:

| content_type | filter prefix |
|---|---|
| `apps` | `appCategories.` |
| `screens` | `screenPatterns.` |
| `ui-elements` | `screenElements.` |
| `flows` | `flowActions.` |

Examined **`flowActions.Filtering & Sorting` × Travel** (177 flows), stepping through Airbnb's *"Filtering search results (stays)"*:

```
✕            Filters
   [ isometric illustration — changes with selection ]
Type of place
┌───────────┬───────────┬───────────┐
│ All types │  Rooms    │  Homes    │   ← each option shows ITS OWN avg price
│ $170,850  │ $90,706   │ $174,105  │
│    avg.   │   avg.    │   avg.    │
└───────────┴───────────┴───────────┘
Browse rooms, homes and more. Average prices
for 184 nights include fees and taxes.        ← explains option AND price basis
─────────────────────────────────────
Price range
   ▁▃▅█▇▅▃▁▁▂▁    ← HISTOGRAM of real inventory
   ○──────────○
  [Minimum $920] — [Maximum $390000]          ← inputs under the slider
─────────────────────────────────────
Clear all                    [ Show 238 places ]  ← CTA COUNTS RESULTS LIVE
```

Watching the flow step by step, the CTA reads `Show 28 rooms` → `Show 197 homes` → `Show 238 places` → `Show 142 places`. **The button is the feedback.** You always know the consequence of a filter *before* committing to it.

**Our FilterSheet has none of this.** 17 filters and 6 sorts with zero feedback until you apply and close — the customer guesses, applies, finds 0 results, and reopens. And we are uniquely well placed to fix it: in "full mode" we already load the entire category set client-side, so counts and price distribution are **free to compute**.

**→ ACTION (MB13)** Filter CTA shows the live count: `Show 142 vendors`. Recomputed on every change, disabled at 0 with the offending filter named.
**→ ACTION (MB14)** Price filter gets a **histogram of real inventory distribution** plus min/max inputs. On a catalogue where ~98% have no price, the histogram also honestly shows how thin priced inventory is.
**→ ACTION (MB15)** Annotate each filter option with its consequence — count, or average price where we have one.
**→ ACTION (MB16)** Sheet footer: `Clear all` bottom-left, count-CTA bottom-right, sticky outside the scroll. Same left-reset/right-advance grammar as the calendar.

### 7b.5 Chat — quick replies are the unlock

**`flowActions.Chatting & Sending Messages`** — 1,143 flows. The most instructive was Lemonade Insurance's quote flow: a named assistant with avatar and role, **tappable canned answers instead of free typing**, inline autocomplete, and **rich cards in the message stream** (a map pin confirming an address, checkbox lists with a `NEXT`).

It is a chatbot rather than person-to-person, but the transferable idea is strong and specific.

**→ ACTION (MB17) — quick-reply chips above the composer.** A Pakistani couple messaging a venue asks the same handful of things: *"Is 14 Sep available?"*, *"What's included?"*, *"Can you do 500 guests?"*, *"What's the advance?"*, *"Can we bring our own caterer?"* Offering those as chips does three things at once: removes typing friction (severe on a phone, worse in Urdu), gives the vendor a structured question they can answer in one tap, and **keeps the conversation on-platform instead of drifting to WhatsApp where we lose all visibility**. Given chat's whole strategic purpose is retention against WhatsApp, this is the highest-value detail in the chat screen.

**→ ACTION (MB18)** Rich cards in-stream: when a date is discussed, send an **availability card**; when a price is agreed, a **quote card** that links to the real quote. The message list must therefore render typed payloads, not only text — a data-model decision that has to be made before S14 is built, not after.

### 7b.6 What this does not give us

Mobbin's free tier caps app-level browsing at 4 apps, so I could not walk a complete competitor flow end to end — only pattern-sliced screens. **Pro at $10/mo would unlock full flows**, including `Flows → Filtering & Sorting` and `Chatting & Sending Messages`, which are the two patterns I still have no production evidence for. Worth the $10.

---

## 8. What this research changed

| ID | Action | Lands in |
|---|---|---|
| T1 | Reliability moves above the fold | 06-SCREEN-LAYOUTS S3 |
| T2 | New `TrustRow` widget | 05-UI-SPEC |
| T3 | Surface response time — ask backend | 00-PROGRAM blocker |
| T4 | Question login-before-enquiry | 00-PROGRAM decision |
| T5 | Filter-matched reviews first | 06-SCREEN-LAYOUTS S3 |
| A1 | Social proof at every decision point | rules.md design law |
| A2 | Photography carries trust → B2 escalates | 00-PROGRAM B2 |
| A3 | Vendor video — backlog | 00-PROGRAM |
| P1 | Motion responds, doesn't decorate | 02-DESIGN-SYSTEM §5 |
| P2 | Translucency: content beneath leads | 02-DESIGN-SYSTEM §3.3 |
| P3 | No glass refraction on mid-range Android | 02-DESIGN-SYSTEM §3.3 |
| ADA1 | Urdu promoted to first-class | rules.md gate 9 |
| ADA2 | Touch acknowledges within 100ms | rules.md gate 8 |
| ADA3 | Study Tide Guide for dense-data elegance | calendar work |
| M1 | Chat promoted up the build order | 00-PROGRAM |
| C1 | Price coverage is a business metric | 00-PROGRAM B4 |
| C2 | Mehrab is the strategy, not decoration | 02-DESIGN-SYSTEM §4.3 |
| C3 | Walk WedMeGood + Shadiyana flows | founder task |
| R1 | Mobbin — browsed on free tier, evidence in §7b | done |
| **MB1** | `TrustRow` = bordered 3-cell strip above `SpecStrip` | 05-UI-SPEC |
| **MB2** | `VendorHostCard` — sell the owner as a person | 05-UI-SPEC · 06 S3 |
| **MB3** | Price states what it covers (`pricingMode`) | 05-UI-SPEC VendorCard + S3 |
| **MB4** | Risk reducer under the price | 06 S3 |
| **MB5** | Honest scarcity, computed never invented | 06 S3 |
| **MB6** | Review count tappable → reviews | 06 S3 |
| **MB7** | Calendar: **continuous scroll**, not paged | 05-UI-SPEC §10 |
| **MB8** | Calendar: `Dates │ Months │ Flexible` modes | 05-UI-SPEC §10 · 06 S6 |
| **MB9** | Calendar: `± 1 day` / `± 2 days` flexibility | 05-UI-SPEC §10 · 06 S6 |
| **MB10** | Out-of-window dates greyed, not blanked | 05-UI-SPEC §10 |
| **MB11** | Payment: reassurance, expectations, disabled-with-reason | 06 S10 |
| **MB12** | Payment: show the processor | 06 S10 |
| **MB13** | Filter CTA shows live result count | 05-UI-SPEC · 06 S2 |
| **MB14** | Price filter histogram + min/max inputs | 05-UI-SPEC · 06 S2 |
| **MB15** | Annotate filter options with their consequence | 06 S2 |
| **MB16** | Sheet footer: Clear all left, count-CTA right | 05-UI-SPEC §12 |
| **MB17** | Chat quick-reply chips — the anti-WhatsApp lever | 05-UI-SPEC · 06 S14 |
| **MB18** | Chat renders typed payloads (availability/quote cards) | 01-FUNCTIONALITY data model |

---

## 9. Standing research method

1. **Reference or it didn't happen.** Every design claim carries a link. "It looks better" is not a reason.
2. **Prefer real production screens** (Mobbin) over moodboards (Pinterest, Dribbble). A Dribbble shot has no empty state, no error state, no 40-character Pakistani business name, and no null price.
3. **Prefer the category leader over the trend.** Airbnb solving marketplace trust beats a beautiful concept app.
4. **Every finding ends in an ACTION or is deleted.**
5. **Re-run before each phase.** Both platforms changed design language this year.
6. **Trends are inputs, not instructions.** Our audience is a couple on a mid-range Android in Lahore, in daylight, on patchy data. A trend that fails there is not a trend for us.
