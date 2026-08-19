# rules.md — the constitution

**This file governs every change to the Wedding Wala customer app. It is not advice. A change that breaks a rule here is wrong, regardless of how good it looks.**

**READ THIS FILE AT THE START OF EVERY SINGLE ACTION.** Not once per session — before every screen, every component, every edit. Founder instruction, 2026-08-17, given because the mandate below was not followed.

---

## 0.0 THE MANDATE — a total visual revamp. This is the job.

**Founder instruction, stated repeatedly and not delivered on until now:**

> *"I want ALL colors, UI elements, theme, layout, everything to be TOTALLY revamped. 100x better than the current one. Beautiful, royal, clean and elegant — not the one we are currently having."*

Read that again before every task. **The objective is not correctness. Correctness is the floor.** Fixing bugs, tightening data truth, renaming tokens and swapping hex values **is not a revamp and does not count**. If a screen still has the same shapes, the same density, the same rhythm and the same component silhouettes as before, **nothing has been delivered**, no matter how many defects were fixed along the way.

### What counts as done

Every screen is **rebuilt**, not adjusted. Every UI element, sub-element, widget, drawer, sheet and micro-element is **redrawn** to the new language. A person who used the old app must not recognise the new one.

### The reference

`https://mobbin.com/screens/1767a7ec-dc2b-4f56-b598-0b39ffb5e689` — Airbnb iOS listing detail, supplied by the founder as **the** target. What it actually does, and what we take:

| The reference does | We were doing |
|---|---|
| Near-**monochrome**. Colour appears once — the CTA. | Gold on every surface, warm everywhere |
| **Huge, tight-set, heavy titles** (2 lines, ~28–32px, tight leading) | 15–21px titles, loose, timid |
| **Enormous white space.** Air is the luxury signal | Cramped 8pt stacks, everything touching |
| **Hairline dividers** carry the structure | Bordered, shadowed cards everywhere |
| Photo as a **rounded inset card** with floating circular glass controls | Full-bleed images, square-ish corners |
| One **bordered multi-cell stat strip** with real presence | A thin under-weighted row |
| **Icon + two-line rows** separated by hairlines | Dense mixed rows |
| Sticky bar: quiet price left, **one big rounded CTA** right | Competing elements |

**Royal is the brand layer on top of that clarity** — the Mehrab, the gold hairline, the deep register, Fraunces. Royal means *restraint and craft*, never *more ornament*. Elegance is what is removed.

### The hard rules that follow from it

1. **Never preserve an existing visual just because it works.** Working is not the bar.
2. **A palette swap is not a redesign.** Layout, density, rhythm, silhouette and hierarchy must change too.
3. **Air first.** If a screen is not visibly emptier than the old one, it is not done.
4. **One colour event per screen.** Everything else is ink, paper and hairline.
5. **Type carries the hierarchy**, not borders and not shadows.
6. **Every component is redrawn once**, in the library, before screens consume it — so the revamp is systemic and not 27 separate opinions.
7. **Show the before and after.** Every screen ships with a 360px screenshot of both.

---

## 0. The bar

The target is not "better than before". The target is **the best wedding-marketplace app in the world**, judged by someone holding a mid-range Android in Lahore on patchy data. Every rule below exists to serve that, and each one was written because it was violated at least once.

Three things are non-negotiable and rank in this order when they conflict:

1. **Truth** — never show a customer something that is not true. No fake data, no invented availability, no price that isn't the price, no promise the backend cannot keep.
2. **Usability** — reachable, readable, understandable at 360px with one thumb.
3. **Beauty** — the thing that makes them choose us over a WhatsApp group.

Beauty never wins over truth. A gorgeous screen that misrepresents a vendor is a defect, not a design.

---

## 1. Process — how a screen gets done

Screens are done **one at a time**, completely, in the order set by [docs/00-PROGRAM.md](docs/00-PROGRAM.md). No starting a second screen while the first is unfinished.

For each screen, in order:

1. **Read the spec** in [docs/04-SCREEN-SPECS.md](docs/04-SCREEN-SPECS.md). If there isn't one, write it first.
2. **Confirm the data.** Probe every endpoint the screen uses against live production and record the real response shape. Never build against an assumed shape. ([docs/01-FUNCTIONALITY-AND-ENDPOINTS.md](docs/01-FUNCTIONALITY-AND-ENDPOINTS.md))
3. **Build** to [docs/02-DESIGN-SYSTEM.md](docs/02-DESIGN-SYSTEM.md), using only components from [docs/03-COMPONENTS-AND-LIBRARIES.md](docs/03-COMPONENTS-AND-LIBRARIES.md). New pattern → add the component first, then use it.
4. **Run the 10 gates** in §2. All ten. Recorded in the screen's row with evidence, not ticks.
5. **Only then** move on.

### The status vocabulary

| Mark | Meaning |
|---|---|
| `[ ]` | not started |
| `[~]` | in progress — never left overnight |
| `[R]` | renders. **This is not done.** |
| `[x]` | all 10 gates passed, with evidence recorded |

**A render check is never `[x]`.** Seeing a screen appear proves the imports resolved. It proves nothing about whether the flow works.

---

## 2. The 10 gates — every screen, every time

A screen is `[x]` only when all ten pass. Record *what you observed*, not that you looked.

| # | Gate | What passing means |
|---|---|---|
| **1** | **Function** | Every interactive element exercised for real. Every form submitted. Every CRUD path completed: create → read → **reload** → update → **reload** → delete → **reload**. The value re-read from the server, not from local state. |
| **2** | **Data truth** | Every field on screen traced to a real API field. Nothing hardcoded, nothing faked, no placeholder copy. Null/empty/zero handled explicitly — remember ~98% of listings are unclaimed imports with mostly-null columns. |
| **3** | **360px** | Nothing truncated that carries meaning. No horizontal scroll on the page body. Every tap target ≥44px. Tested at 360×640, the floor. |
| **4** | **Large screen** | Holds at 430px and on a tablet. No stretched single column, no orphaned content. |
| **5** | **States** | Loading (skeleton shaped like the real content), empty (with an action), error (with retry), offline, and **slow** — throttled to 3G, not just fast-network. |
| **6** | **Theme consistency** | Zero raw hex in the screen. Every colour, space, radius, shadow and type size from a token. Gutter is 24. One focal element. One primary action. |
| **7** | **Navigation** | Back always goes somewhere sensible. Deep-linkable. State survives a tab switch. No dead ends — every rail and list has a destination. |
| **8** | **Performance** | No dropped frames scrolling. Images requested at render size via `img()`. No N+1 request patterns. Cold-start impact measured, not assumed. |
| **9** | **Accessibility** | Contrast passes AA (`npm run verify:contrast`). Roles and labels on every control. Works with reduced motion. Urdu renders in Nastaliq with correct line height and RTL. |
| **10** | **Regression** | `npx tsc --noEmit` clean · `npx eslint "src/**/*.{ts,tsx}"` zero errors · bundles · the screens either side of it still work. |

### Gate 0 — the revamp gate. Runs before all ten.

**A screen does not enter the ten gates until it passes this one.** Side-by-side 360px screenshots, before and after:

- Is the new screen **visibly emptier**? More air, fewer boxes, fewer borders.
- Has the **title grown** and tightened into the display face?
- Is the screen **near-monochrome**, with exactly **one** colour event?
- Do **hairlines** carry the structure where cards and shadows used to?
- Would a user of the old app **fail to recognise** this as the same screen?

Any "no" means it is not revamped, only edited. Go back.

### Prohibitions — these are always defects

1. Claiming done without running the gate.
2. `[x]` on a render check.
3. **Calling a screen revamped when only its values changed.** Swapping hexes, renaming tokens, fixing defects and tightening copy is maintenance. If the silhouette is unchanged, it is not a revamp — say so plainly rather than presenting it as one.
4. Hardcoded strings a customer can read that aren't in `i18n/strings.ts`.
5. Raw hex, raw pixel spacing, or a font size not in the type scale.
6. Fake or placeholder content shipped, including lorem, dummy testimonials, and invented ratings.
7. A control hidden in the UI while its endpoint still answers — that is not a permission boundary.
8. `setState` inside an effect to sync with a prop or param. Derive it. **This exact shape caused five separate "Maximum update depth exceeded" crashes on device.**
9. A new dependency without a line in [docs/03-COMPONENTS-AND-LIBRARIES.md](docs/03-COMPONENTS-AND-LIBRARIES.md) justifying it against bundle size and New-Architecture support.
10. Trusting `images[0]`. Vendor galleries contain platform ads and unrelated stock.
11. Two primary actions on one screen.

---

## 3. Non-negotiable engineering rules

### The New Architecture crash class

This app crashed on device five separate times with **"Maximum update depth exceeded"** while dev and web were fine. Every cause is now a rule:

1. Navigator `screenOptions` / `tabBar` / `contentStyle` objects are **hoisted to module scope**. A fresh object identity per render re-fires `react-native-screens`' native option-sync effect on Fabric and loops.
2. Never a second `SafeAreaProvider` — expo-router already provides one.
3. Never `useRootNavigationState()` in the root layout.
4. One-shot redirects are guarded by a ref.
5. No `contentStyle` in `<Stack screenOptions>` — screens paint their own background.

**Web passing proves nothing about native for this bug class.** A screen is not verified until it runs on a device or dev client.

### Live production, no staging

Every build talks to the system taking real bookings and real money.

- Reads are free. Writes are deliberate.
- **Never write money rows while testing.** Not gated — never.
- Anything a test creates, it deletes, and the deletion is **asserted**, not assumed.
- Additive and backward-compatible. Migrations land on prod before the client that needs them.

### Never push unless told

No `git push`, no PR, no branch publish until instructed in those words for that specific work. Never to `main`/`master` in any repo.

---

## 4. Design law

The full system is [docs/02-DESIGN-SYSTEM.md](docs/02-DESIGN-SYSTEM.md). These are the clauses most often broken:

1. **One focal element per screen.** Exactly one thing at the top of the depth scale. Everything else recedes.
2. **One primary action per screen**, and it lives in `StickyActionBar`.
3. **Gutter is 24. Always.** An inconsistent gutter is the most visible cheapness in a mobile app.
4. **Gold is an accent, never a fill.** Rim, pill, wash, glow. One saturated gold surface per screen — the primary action.
5. **Text on gold is ink, never white.**
6. **Shadows are warm.** Never grey, never black, on light surfaces.
7. **Photography is structure, not decoration.** Hero and detail are full-bleed with a scrim, and the content sheet overlaps.
8. **Never an equal-weight grid of tiles.** Asymmetry by default.
9. **Reserve space for conditional elements** — dots, badges, underlines. A row that shifts by 2px when state changes reads as broken.
10. **A screen opens on the display face.** No section title below the h2 size.

---

## 5. Copy law

1. Written from the customer's side. Name things as a couple would: *"your date"*, not *"booking slot entity"*.
2. Active voice. A control says exactly what happens, and the confirmation matches it.
3. Errors say what went wrong **and** what to do. No apologies, no "something went wrong".
4. Prices are always `Rs` with thousands separators and tabular figures. Never `Rs 0` — an absent price is *"On request"*.
5. Time ranges use the word **to**, never an en-dash. Pakistani vendors misread the dash.
6. Every customer-visible string goes through `i18n/strings.ts` and renders in Nastaliq under Urdu.
7. Nothing may imply a vendor offers something the data does not say they offer.

---

## 6. When the data is wrong

Much of the vendor data on production is poor: polluted galleries, null prices, unclaimed listings. The rule is:

**Degrade honestly. Never fabricate, never amplify.**

- No usable image → the monogram arch fallback. Never a stranger's photo presented as theirs.
- No price → "On request". Never a guess, never zero.
- Nothing good enough for a featured slot → **render nothing**. An empty space costs less than a hero that misrepresents a business.
- Found a data problem → record it in the program doc and tell the founder. Do not paper over it in the UI.

---

## 7. Definition of done, for the whole app

- Every screen `[x]` with recorded evidence.
- Every customer capability the backend supports is either built or explicitly deferred **in writing, with a reason**.
- Verified on a real mid-range Android, on throttled data, in daylight.
- Verified in Urdu.
- Zero type errors, zero lint errors, contrast green.
