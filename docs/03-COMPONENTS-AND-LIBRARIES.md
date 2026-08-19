# 03 — Components and libraries

Governed by [../rules.md](../rules.md). **Prohibition 8: no new dependency without a row in this file justifying it.**

---

## 1. The library decision

You asked me to look at the best mobile UI component libraries. I did, and the recommendation is going to sound anticlimactic, so here is the reasoning rather than just the verdict.

### What's actually current (2026)

| Library | What it is | Verdict here |
|---|---|---|
| **Tamagui** | Optimising compiler, flattens styles at build time. Fastest option. | **No.** Its value is a compiler + its own theming system. We already have a theme, and adopting Tamagui means rewriting every primitive to its API and inheriting its build step on top of Expo's. Large migration, no gain we can't get for free. |
| **NativeWind** | Tailwind classes in React Native. The standard way to use Tailwind here. | **No, but tempting.** Would give the web/app parity in *class names*. But our design language lives in `theme/tokens.ts` and the web's in `tailwind.config.ts` — the duplication is the token values, which NativeWind doesn't solve. Adds a Babel transform to a New-Architecture app that has already been fragile. |
| **Gluestack UI v3** | 30+ unstyled accessible primitives, styled via NativeWind. Modular, New-Arch ready. | **Partial yes — as reference.** Its accessibility and unstyled-primitive approach is the right pattern. Read its implementations; don't take the dependency. |
| **React Native Elements** | Established, consistent, TypeScript API. | **No.** Comprehensive libraries earn their weight when you need most of the library. We need ~15 components, all brand-specific. |
| **Uilora** | Newer; unified RN/Expo API with shared design tokens. | **No.** Too young to bet a live product on. |

### The verdict

**We build our own primitives on our own tokens, and take dependencies only for hard native problems.**

Not because "not invented here" — because of what this app actually is. Every component we need is *brand-specific*: an arch-masked medallion, a capacity-aware slot picker, a Pakistani money row, a Nastaliq-aware text primitive. A component library gives you a generic Button and then you fight it to look like yours. The generic 20% isn't the work; the branded 80% is. And **the single biggest technical risk in this codebase is New-Architecture render loops** — every dependency that touches layout, navigation or styling is a new surface for that crash class.

The guidance from the library comparisons applies directly: *match the library to your actual scope — a comprehensive library is worth the dependency weight only if you need most of its components.* We don't.

**Where we DO take dependencies: native capability we cannot write.**

| Dependency | Already in | Why it's justified |
|---|---|---|
| `expo-image` | ✓ | Caching, recycling, transitions. Never hand-roll image caching. |
| `expo-blur` | ✓ | Native blur for translucent layers. Cannot be done in JS. |
| `expo-linear-gradient` | ✓ | Native gradients. |
| `expo-haptics` | ✓ | Native haptics. |
| `react-native-svg` | ✓ | The Mehrab arch and jaali lattice are SVG paths. |
| `react-native-reanimated` v4 | ✓ | UI-thread animation. The only correct way. |
| `react-native-gesture-handler` | ✓ | Native gestures. |
| `@gorhom/bottom-sheet` v5 | ✓ | Bottom sheets are genuinely hard — gesture/scroll coordination, keyboard avoidance. Best in class. |
| `@shopify/flash-list` v2 | ✓ | Recycling lists. Matters on mid-range Android with 3,274 vendors. |
| `@tanstack/react-query` v5 | ✓ | Server state, caching, dedupe. |
| `zustand` v5 | ✓ | Client state. Minimal. |
| `react-native-reanimated-carousel` | ✓ | Used for the full-screen gallery only. **Candidate for removal** — `PhotoHero` does paging with a plain `ScrollView`. |

**Nothing new is needed.** If a screen seems to need a new library, the answer is almost always a component in §2.

---

## 2. Component inventory

`✓` exists on v1 tokens · `⟳` needs rebuild for v3 · `+` to build

### Primitives — `src/components/ui/`

| Component | State | Notes |
|---|---|---|
| `Text` | ⟳ | The only typography primitive. Every string goes through it. Nastaliq + RTL when `urdu`. New v3 scale. |
| `Button` | ⟳ | `primary` \| `secondary` \| `ghost` \| `danger`; `sm/md/lg`. Primary gets the gold gradient + `glow`. |
| `Card` | ⟳ | `flat` \| `rise` \| `focus`. **One `focus` per screen.** |
| `Input` | ⟳ | Floating label, gold focus rim, error, right-slot for units. Forwards `ref` (React 19 ref-as-prop). |
| `Chip` / `ChipSelect` | ⟳ | Filters and single-select rows. |
| `Badge` | ⟳ | Add `verified` and `elite` tiers. |
| `Avatar` | ⟳ | |
| `Rating` | ⟳ | |
| `Skeleton` | ⟳ | **Shaped like the real content**, never a grey block. |
| `EmptyState` | ⟳ | Always carries an action. |
| `Screen` | ⟳ | Safe-area + background wrapper. |
| `Row` / `Stack` / `Divider` / `Section` | ⟳ | Layout. Gap-based, never margins. |
| `SectionHeader` | ✓ | Overline + "View all". **Every rail must have a destination.** |
| `SpecStrip` | ✓ | Fixed facts row. Drops nulls; hides below two facts. |
| `StickyActionBar` | ✓ | **The only place a gold fill + glow exists.** Enforces one primary action. |
| `Calendar` | ✓ | Availability-aware month grid. 42 cells always. |
| `Sheet` | + | Wrapper over `@gorhom/bottom-sheet` with a **height cap** — the web's dialogs have none and tall ones trap actions off-screen at 360px. |
| `SegmentedControl` | + | Pick-up/Delivery-style switches, package tiers. |
| `Stepper` | + | Guest counts, quantities. |
| `MoneyRow` / `TotalsCard` | + | Line items, advance vs balance. Tabular figures, in-green/owed-red. |
| `StatusTimeline` | + | Vertical stepper fed by `/bookings/:id/history`. |
| `FormField` | + | Label, hint, error, required marker. Draft-restore banner. |
| `Toast` | + | Confirmation feedback. Copy must match the control that fired it. |
| `Tabs` | + | In-screen tabs (Tracking / Order details). |

### Signature — `src/components/signature/`

**These are the app's only ownable assets.** Every reference board in this category is generic Western e-commerce; a Mughal arch cannot be lifted onto a coffee app.

| Component | State | Notes |
|---|---|---|
| `arch-path.ts` | ✓ | The Mehrab geometry. Do not redraw it. |
| `ArchImage` / `ArchOutline` | ✓ | Arch-masked imagery, gold hairline. Needs concrete px dimensions. |
| `ArchMedallion` | ✓ | Category tile. **One arch cluster per screen.** |
| `PhotoHero` | ✓ | Full-bleed carousel, top **and** bottom scrim, arch whisper, floating controls. |
| `JaalPattern` | ✓ | **Only on `royal`.** On light it turns to mud. |
| `ShimmerText` | ✓ | Gold gradient text. Romantic phrases only. |
| `LightSweep` | ✓ | Champagne sweep. Peak moments only. |
| `MonogramFallback` | + | Extract from `VendorCard` — the arch + initial for the ~98% of listings with no usable image. |

### Feature components

| Component | State | Notes |
|---|---|---|
| `VendorCard` | ⟳ | The most-rendered component in the app. Rating rides on the image so the price gets a full row. |
| `CategoryArchRow` | ✓ | Covers fetched from real vendors, not hardcoded. |
| `FeatureSpotlight` | ✓ | The focal block. Carries the **quality gate** — see B2. |
| `HomeHeader` | ✓ | |
| `PackageTiles` | ✓ | Selectable tiers driving the CTA price. |
| `SlotPicker` | + | Both engines: templates with capacity, or the four legacy periods. |
| `GuestCountField` | + | Label from `/bookings/meta/guest-count-label` — a caterer counts plates, a car counts seats. |
| `FilterSheet` | ⟳ | 17 filters, 6 sorts. Needs the height cap. |
| `CompareBar` | ⟳ | |
| `ReviewsSection` / `AvailabilityCalendar` | ⟳ | |
| `ChatThread` / `MessageBubble` | + | |
| `QuoteCard` | + | Negotiation states: inquiry → quoted → countered → accepted/declined. |
| `BookingStatusCard` | + | |

### Shared logic — `src/lib/`

| Module | State | Notes |
|---|---|---|
| `date.ts` | ✓ | **Local-noon day keys.** `toISOString()` on a local midnight rolls the day — the bug that books a customer the night before their own mehndi. |
| `img.ts` | ✓ | Cloudinary transforms. The API returns 2–4 MB originals; ask for render size. |
| `api/client.ts` | ✓ | Envelope unwrap, bearer, 401 logout, paginator. |
| `money.ts` | + | One `Rs` formatter, one place. Tabular, no decimals, never `Rs 0`. |
| `errors.ts` | ✓ | `ApiError` — `error.message` is already customer-facing. |

---

## 3. Rules for building a component

1. **Tokens only.** No raw hex, no raw pixel spacing, no font size off the scale.
2. **Reserve space for conditional children.** Dots, badges, underlines keep their height when absent. A row that shifts 2px on state change reads as broken.
3. **Accessible by construction** — role, label, and state on every control. Not a later pass.
4. **Urdu-aware** if it renders text: accept `urdu`, pass it to `Text`.
5. **Degrade honestly.** Assume null. Assume no image. Assume no price. ~98% of listings are unclaimed imports.
6. **Never `setState` in an effect to sync a prop.** Derive it.
7. **Stable references** for anything handed to a navigator or a native component — hoist to module scope.
8. **Document the *why*** in the file header when a decision isn't obvious. The next person needs the reason, not a restatement of the code.
