# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Expo HAS CHANGED — read the versioned docs first

**Read <https://docs.expo.dev/versions/v57.0.0/> before writing any Expo/React Native code here.** SDK 57 + React Native 0.86 + React 19 is recent enough that most training-data patterns are wrong. `expo-router`, `react-native-reanimated` v4, and `react-native-screens` v4 all changed APIs. Do not guess an API surface.

## What this app is

The **customer-facing** mobile app for [weddingwala.pk](https://www.weddingwala.pk) — Pakistan's wedding & event marketplace. Couples discover vendors, judge them, contact them, shortlist and compare, and plan their shaadi.

It is the "foodpanda" to `../emsl-app`'s "foodpanda partner":

| Repo | Audience |
|---|---|
| `weddingwala-app` (this) | **Customer / couple** |
| `../emsl-app` | **Vendor** (RN/Expo, mirrors the vendor portal) |
| `../ems-v0` | Next.js web — public site + customer surface + vendor portal + admin |
| `../event-planner-api` | Express + Sequelize backend, live on Railway |

All four hit the **same live production backend**. There is no staging. See [../CLAUDE.md](../CLAUDE.md) for the workspace and backend, and [../ems-v0/CLAUDE.md](../ems-v0/CLAUDE.md) for the web app whose customer surface (`app/(main)/user/*`) this app mirrors.

🔑 **Before wiring any screen to the API, read [../ems-v0/docs/CUSTOMER-SURFACE.md](../ems-v0/docs/CUSTOMER-SURFACE.md).** It is the authoritative map of every customer-facing screen, the logic it runs, and the exact endpoint + payload it calls — each verified against live production. It carries the `POST /bookings` payload byte-for-byte, both calendar engines, the slot vocabulary rules, the Stripe Rs 999,999 ceiling, and ten traps that will otherwise cost you a day each (starting with: `GET /bookings/:id` does not exist — use `/bookings/:id/with-availability`).

## Commands

```bash
npm install
npx expo start                # dev server — scan QR with a dev client
npx expo start --android      # Android emulator/device
npm run lint                  # expo lint
```

### Quality gates — run all three before claiming done

```bash
npx tsc --noEmit                 # types (tsconfig is strict)
npx eslint "src/**/*.{ts,tsx}"
npm run verify:contrast          # WCAG-AA over the bridal palette (19 pairs)
```

**There is no test runner** — no Jest, no Detox, no Maestro. Verification is manual on a device/emulator plus the three gates above. A screen that renders is not a verified screen: exercise the flow, background/foreground the app, and re-check after a cold restart.

### Web preview needs a CORS proxy

The browser blocks cross-origin calls to the Railway API. Native builds need no proxy.

```bash
node cors-proxy.js                                                        # :8790 → Railway, permissive CORS
EXPO_PUBLIC_API_URL="http://localhost:8790/api/v1" npx expo start --web
```

Treat web as a convenience preview only. Several of the crashes below are **native-only** — `react-native-screens` and `react-native-safe-area-context` have web shims that never run the offending native effects, so the web preview passes while the standalone app dies on launch.

### Builds

```bash
export EXPO_TOKEN="<token>"
npx eas build -p android --profile preview      # installable APK
```

`eas.json` profiles: `preview` (APK) · `production` (app-bundle, autoIncrement) · `development` (dev client). All three hard-code `EXPO_PUBLIC_API_URL` to live prod.

`.github/workflows/android-build.yml` is an **EAS-free** fallback that builds a release APK with `expo prebuild` + Gradle on GitHub's free runners, on every push to `main`. Use it when the EAS free quota is exhausted — the git history shows the EAS account being relinked repeatedly for fresh quota (`app.json` → `expo.owner`).

## Architecture

```
src/
  app/            expo-router routes (typedRoutes on)
                  (tabs)/  index · explore · plan · inbox · account
                  vendor/[id] · auth/{login,register} · account/{profile,bookings}
                  tools/{budget,checklist,guests,timeline} · favorites · compare
                  guides · onboarding · dev
  components/ui/  bridal primitives — Text Button Card Input Chip Rating Badge
                  Avatar Skeleton EmptyState Screen layout(Row/Stack/Section)
  components/signature/  ArchImage · LightSweep — the brand's signature motifs
  features/       per-domain: vendors, explore, favorites, compare, planning,
                  account, guides, home
  lib/api/        client.ts (envelope unwrap, bearer, 401 logout, paginator)
                  endpoints/{vendors,auth,account}.ts · errors.ts · token-storage.ts
  lib/query/      queryClient + key factory
  store/          zustand: auth favorites compare locale recently-viewed onboarding
  theme/          tokens fonts motion haptics textures theme-provider
  i18n/           strings.ts + useT + <T k="…"> — English/Urdu
```

Path aliases: `@/*` → `./src/*`, `@/assets/*` → `./assets/*`.

### API layer

`src/lib/api/client.ts` is the only place that talks HTTP. Three behaviours matter:

1. **Envelope unwrap.** The backend wraps everything in `{ status, message, data }`. `api.get/post/…` return the inner `data` directly. A 2xx body with `status: false` is thrown as an `ApiError`, not leaked as data.
2. **Errors are normalised.** Everything axios can throw becomes an `ApiError` with `{ message, status, code, details }` (see `errors.ts`). UI reads `error.message` — it is already user-facing.
3. **Mid-session 401 forces sign-out** — but never for `/auth/*` (a wrong password must not look like a revoked session).

`fetchAllPages()` walks a paginated endpoint by `pagination.totalPages`. Never trust a single page; the backend caps `limit` at 200.

Token lives in the device keychain via `expo-secure-store`, **mirrored in a module-level variable** so the request interceptor can read it synchronously. `loadSession()` must run once at startup (it does, via `useAuthStore.hydrate()` in the root layout).

Base URL: `src/config/env.ts` reads `EXPO_PUBLIC_API_URL`, defaulting to `https://ems-v0-backend-production.up.railway.app/api/v1` — **live production**. `EXPO_PUBLIC_*` is inlined at build time, so it is public: never put a secret there.

### Design system — ported, not invented

`src/theme/tokens.ts` is the "Bridal Design System": ivory silk · champagne gold · rose petal. **Zero purple.** Values were pulled from the live site's computed styles, not designed here — the source of truth is `../consumer-app-plan/DESIGN-TOKENS.md` and, above that, the live site itself. Do not change a colour without re-verifying against `weddingwala.pk`, and keep it in sync with `../ems-v0/tailwind.config.ts` → `colors.bridal`.

- Primary is `gold #C9956A`; text on gold is **charcoal `#2C1810`, not white**.
- Gold is an accent — pills, rims, washes, glow — never a large fill. Use the `goldScale` tints.
- `radius`: buttons/inputs 4, cards 6. `spacing` is a 4pt scale.
- Shadows are warm (`#B07D54`), never grey. `elevation.glow` is the champagne CTA glow.
- `gradients` are the only sanctioned multi-stop recipes; every stop is a palette colour or an alpha of one.
- Money colour rule: money-in = `success`, owed/out = `danger`. Use `moneyTone(direction)`.
- Type: Playfair Display (display) · DM Sans (body) · Inter (dense UI/numbers) · Noto Nastaliq Urdu. Loaded by `useAppFonts()`; splash stays up until loaded.
- Screens reference **semantic roles** (`colors.textPrimary`, `colors.surface`), never raw `palette.*`.

Urdu: wrap strings in `<T k="…" />` or `useT()`. Only translated strings get the Nastaliq treatment — pass `urdu={isUrdu}` to `Text`.

## The New Architecture crash class — read before touching any navigator

Almost the entire recent git history is one bug: **"Maximum update depth exceeded", crashing the standalone Android build at launch**, while dev and web were fine. It had five independent causes, each fixed and commented in place. Any of them will come back if the pattern is reintroduced.

1. **Unstable navigator options.** Passing a fresh `screenOptions` object — or an inline `contentStyle` — to `<Stack>`/`<Tabs>` on every render re-fires `react-native-screens`' native option-sync effect on Fabric and loops. `ROOT_STACK_OPTIONS` in `src/app/_layout.tsx` and `TAB_SCREEN_OPTIONS` / `renderTabBar` in `src/app/(tabs)/_layout.tsx` are **hoisted to module scope so their identity never changes**. Keep them there.
2. **`contentStyle` in `<Stack screenOptions>` specifically** re-registers every render and infinite-loops expo-router's `useSyncState` store. Screens paint their own ivory background instead. (`expo/expo#44561`, `#44564`)
3. **No second `SafeAreaProvider`.** expo-router already provides one at the root; a nested pair makes `RNCSafeAreaProvider`'s inset measurement feedback-loop on Fabric. (`expo/expo#39472`, `#37316`)
4. **Never call `useRootNavigationState()` in the root layout.** Its nav-state listener effect loops against store hydration. (`expo/expo#36121`)
5. **Guard one-shot redirects with a ref.** The first-launch onboarding `router.replace` was an infinite loop until `didRouteOnboarding` gated it.

Also relevant: dropping unused experimental native modules (`@expo/ui`, `react-native-screen-transitions`, `expo-glass-effect`) fixed a separate standalone-build startup crash. `metro.config.js` sets `keep_classnames`/`keep_fnames` so release crash stacks name the real component — leave that on.

**Web passing proves nothing about native for this bug class.** Reproduce on a device or a dev-client build.

## State of the app — what's built vs. what the backend offers

Built and live-verified: discovery (Home, Explore with 17 filters / 6 sorts, Vendor Detail with reviews + availability + sticky WhatsApp/Call/Inquiry bar, Favourites, Compare) · four planning tools · Account (login/register, profile, bookings list, notifications) · Guides · onboarding.

The app currently consumes roughly a dozen endpoints. The backend mounts **66 routers over 217 models**, and the web's customer surface has ~20 authenticated screens this app has no counterpart for. When adding a feature, check what already exists server-side before assuming it needs building:

| Customer capability | Backend | This app |
|---|---|---|
| Chat / conversations | `/chat/*` (Socket.io `chat:*`) | ✗ |
| Quote negotiation (haggle loop) | `/quotes/*` | ✗ |
| Booking detail · cancel · reschedule · change requests · refund requests · milestones · installments | `/bookings/:id/*` (66 routes) | list only |
| Payments (Stripe + PK methods: JazzCash/Easypaisa/Raast/IBFT) | `/payments/*` | ✗ |
| Write / manage reviews, review photos | `/reviews/*` | read only |
| Shaadi Plan multi-event cart + checkout | `/wedding-plans/*` | ✗ (local-only tools) |
| Wedding umbrellas (multi-event container) | `/wedding-umbrellas/*` | ✗ |
| Complaints / support | `/support-complaints/*` | ✗ |
| Disputes | `/bookings/:id/dispute`, `/bookings/my-disputes` | ✗ |
| Favourites (server-side) | `/favorites` | local AsyncStorage only |
| Push notifications | `/push/*` | ✗ |
| Sessions / 2FA | `/auth/sessions`, `/auth/2fa/*` | ✗ |

Planning tools (`features/planning/useLocalList.ts`) are **AsyncStorage-only** — nothing syncs to the server, so the data is lost with the app and invisible on the web. Favourites are the same: the store is a local mirror, and `/favorites` is never called.

**Deliberately deferred:** online booking + card payment, because the real Pakistani flow is discovery → WhatsApp → cash. Do not add a payment path without confirming it's wanted.

## Conventions and traps

- **Live production, no staging.** Every build talks to the system taking real bookings. Reads are free; be deliberate about writes, and never write money rows while testing.
- **`vendorType` is a Postgres enum** on `User.vendorType` (23 values). Category slugs map to it in `features/vendors/categories.ts` — the string must match the enum exactly or the listing comes back empty.
- **Most listings are unclaimed OSM imports** (~98% of businesses). Expect null prices, no images, no owner — every vendor surface must degrade gracefully. `formatRs` and the monogram card fallback exist for this.
- **Test at 360px width and on a real device.** The audience is mid-range Android in Pakistan.
- **Never push or open a PR** unless explicitly told to for that specific work.
