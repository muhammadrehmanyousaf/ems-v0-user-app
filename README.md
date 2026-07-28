# Wedding Wala — Consumer App

The customer-facing mobile app for [weddingwala.pk](https://www.weddingwala.pk) — Pakistan's wedding & event marketplace. Couples discover vendors, judge them, contact them (WhatsApp/Call/Inquiry), shortlist & compare, and plan their whole shaadi. This is the **customer** counterpart to the vendor app (`emsl-app`) — the "foodpanda" to its "foodpanda partner".

Built as a faithful, elevated native port of the website's **Bridal Design System** (ivory / champagne-gold / rose · Playfair Display + DM Sans + Noto Nastaliq Urdu), wired to the same live production backend.

## Stack

Expo SDK 57 · React Native 0.86 · React 19 · expo-router (typed routes) · TanStack Query v5 · Zustand v5 · Reanimated 4 · axios. Mirrors the vendor app's proven setup.

## Run (development)

```bash
npm install
npx expo start            # dev server (scan QR with Expo Go / dev client)
npx expo start --android  # Android emulator/device
```

**Web preview + live data:** the browser blocks cross-origin calls to the Railway API (CORS), so the web preview needs a local proxy. Native builds need none.

```bash
# terminal 1 — CORS proxy → Railway
node cors-proxy.js                      # forwards :8790 → Railway with permissive CORS
# terminal 2 — web pointed at the proxy
EXPO_PUBLIC_API_URL="http://localhost:8790/api/v1" npx expo start --web
```

## Build (APK)

```bash
export EXPO_TOKEN="<token>"
npx eas build -p android --profile preview   # → installable APK
```
Profiles in `eas.json`: `preview` (APK) · `production` (app-bundle) · `development` (dev client). All point at the live backend.

## Quality gates

```bash
npx tsc --noEmit                 # types
npx eslint "src/**/*.{ts,tsx}"   # lint
npm run verify:contrast          # WCAG-AA on the bridal palette (19 pairs)
```

## Architecture

```
src/
  app/            expo-router routes: (tabs) Home/Explore/Plan/Inbox/Account,
                  vendor/[id], auth/*, account/*, tools/*, guides, favorites,
                  compare, onboarding
  components/ui/  bridal primitives (Text, Button, Card, Input, Chip, Rating, …)
  features/       per-domain: vendors, explore, favorites, compare, planning,
                  account, guides, home
  lib/api/        axios client (envelope unwrap, bearer, 401 logout, paginator)
                  + endpoints; lib/query (TanStack)
  store/          zustand: auth, favorites, compare, locale, recently-viewed,
                  onboarding
  theme/          Bridal design tokens, fonts, textures, motion, haptics
```

**Design source of truth:** the palette/typography are ported byte-for-byte from the live site — see `theme/tokens.ts` (and `../consumer-app-plan/DESIGN-TOKENS.md`). Never guess a colour; re-verify against the live site.

## What's built

Discovery (Home, Explore + 17 filters/6 sorts, Vendor Detail with reviews +
availability + sticky WhatsApp/Call/Inquiry bar, Favourites, Compare) · Planning
(Budget, Checklist, Guest list, Timeline) · Account (login/register, profile,
bookings, notifications) · Guides · onboarding. All live-verified.

**Deferred:** online booking + Stripe (the real PK flow is WhatsApp→cash) and
chat threads (start post-booking) — both downstream of bookings.
