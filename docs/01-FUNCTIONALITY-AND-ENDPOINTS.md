# 01 — Functionality, CRUDs and endpoints

**Every customer capability, its full CRUD path, and the exact endpoint behind it.** Status verified against **live production** on 2026-08-17 with a real customer token (`muhammadrehmanyousaf7866@gmail.com`). Probe script: `scratchpad/probe-customer-api.mjs`.

Governed by [../rules.md](../rules.md). Gate 2 (Data truth) cannot be passed without checking a screen's rows here first.

---

## 0. The contract

- Base URL from `src/config/env.ts` → `EXPO_PUBLIC_API_URL`, default `https://ems-v0-backend-production.up.railway.app/api/v1`. **Live production. No staging.**
- Every response is `{ status: boolean, message: string, data: T | null }`. `src/lib/api/client.ts` unwraps to `data`.
- **A 200 with `status: false` is a failure.** Never treat it as data.
- Auth: `Authorization: Bearer <token>`. Token in the device keychain, mirrored in memory so the interceptor reads synchronously.
- Mid-session 401 → forced sign-out. **Never** for `/auth/*` — a wrong password must not look like a revoked session.
- Rate limits: `/api/` 200 per 15 min · `/auth` 20 per 15 min · `/payments` **30 per hour**.

### ⚠️ `EXPO_PUBLIC_*` is inlined at BUILD time

Changing it requires a rebuild **with `--clear`**. A cached Metro bundle keeps the old value and the app will silently talk to the wrong backend. This cost real debugging time — 77 CORS errors from a bundle that looked correctly configured.

---

## 1. Traps

| # | Trap |
|---|---|
| 1 | **`GET /bookings/:id` does not exist → 404.** Use **`GET /bookings/:id/with-availability`** → `{ booking, availabilityContext }`. |
| 2 | **`GET /bookings` is the VENDOR listing.** For a customer it returns `{ data: [] }` with `"No businesses found for this vendor"`. The customer's bookings are **`/bookings/simple-user-bookings`** (a bare array). |
| 3 | **Ownership resolves by `userId`, not `customerEmail`** — five booking sub-resources 403 for bookings the customer's own list returns. See B1 in [00-PROGRAM.md](00-PROGRAM.md). |
| 4 | Complaints are at **`/complaints`**, not `/support-complaints` (404). |
| 5 | **Pagination differs per domain** — see §2. Never assume a shape. |
| 6 | `/payments/pk/methods` **requires `?bookingId=`** or 400s. |
| 7 | `DELETE /favorites/:id` prefers the row **PK**, falling back to `businessId` — ambiguous. Always delete by PK. |
| 8 | Business rows carry **111 columns**. Type only what you consume; tolerate extras. |
| 9 | **Never trust `images[0]`** — galleries contain platform ads and unrelated stock. |
| 10 | Vendor-only on a business: `/businesses/:id/{cancellation-policy,completeness,recurring-blocks}` → 403 for customers. |

### 2. Pagination shapes

| Endpoint | Shape |
|---|---|
| `/businesses`, `/businesses/businesses-by-vendor` | `{ data: [], pagination: { page, limit, total, totalPages } }` |
| `/packages`, `/favorites` | `{ results: [], meta: { total, page, limit, totalPages } }` |
| `/menus` | `{ data: [], meta: {…} }` |
| `/notifications` | `{ notifications: [], total, page, totalPages, hasMore }` |
| `/reviews/:businessId` | `{ reviews: [], averageRating, totalReviews, page, limit }` |
| `/bookings/simple-user-bookings`, `/payments/*`, `/chat/conversations`, `/reviews/my-reviews` | **bare array** |
| `/bookings/my-disputes`, `/bookings/:id/history` | `{ rows: [], count?, page?, limit? }` |

`fetchAllPages()` walks by `pagination.totalPages`. The backend caps `limit` at 200. **Never trust a single page.**

---

## 3. Capability matrix

Legend — **L** live and verified · **B** blocked · **N** no backend · **✗** not built in app

| Capability | C | R | U | D | Endpoint(s) | Live | In app |
|---|:-:|:-:|:-:|:-:|---|:-:|:-:|
| Browse vendors | – | ✓ | – | – | `/businesses`, `/businesses-by-vendor` | L | ✓ |
| Vendor detail | – | ✓ | – | – | `/businesses/:id` (111 cols) | L | ✓ |
| Related vendors | – | ✓ | – | – | `/businesses/:id/related` → `{self,branches,otherServices}` | L | ✓ |
| Reviews (read) | – | ✓ | – | – | `/reviews/:businessId` | L | ✓ |
| Reviews (write) | ✓ | ✓ | – | ✓ | `POST /reviews`, `/reviews/my-reviews`, `POST /reviews/:id/photos` | L | ✗ |
| Favourites | ✓ | ✓ | – | ✓ | `/favorites` | L | ✓ |
| Compare | – | ✓ | – | – | client-side over `/businesses/:id` | L | ✓ |
| Availability (month) | – | ✓ | – | – | `/bookings/availability?businessIds&month` | L | partial |
| Availability (slots) | – | ✓ | – | – | `/businesses/:id/slots/availability/bulk?from&to[&subVenueId]` | L | ✗ |
| Guest-count label | – | ✓ | – | – | `/bookings/meta/guest-count-label?businessId` | L | ✗ |
| Create booking | ✓ | – | – | – | `POST /bookings` — see §4 | L | ✗ |
| My bookings | – | ✓ | – | – | `/bookings/simple-user-bookings` | L | ✓ |
| Booking detail | – | ✓ | – | – | `/bookings/:id/with-availability` | L | ✗ |
| Status history | – | ✓ | – | – | `/bookings/:id/history` | L | ✗ |
| Installments | – | ✓ | – | – | `/bookings/:id/installments` → `{installments, totals}` | L | ✗ |
| Milestones | – | ✓ | – | – | `/bookings/:id/milestones` | L | ✗ |
| Change requests | ✓ | ✓ | ✓ | ✓ | `/bookings/:id/change-requests` | L | ✗ |
| Reschedule / postpone | ✓ | – | – | – | `POST /bookings/:id/{reschedule,postpone}` | L | ✗ |
| Cancel | – | – | ✓ | ✓ | `PATCH /:id/cancel`, `DELETE /:id/cancel-pending` | L | ✗ |
| **Refund** | ✓ | ✓ | – | – | `/bookings/:id/refund-*` | **B** | ✗ |
| Disputes | ✓ | ✓ | – | – | `POST /:id/dispute`, `/bookings/my-disputes` | L | ✗ |
| Payments | ✓ | ✓ | – | – | `/payments/*` — see §5 | L | ✗ |
| Chat | ✓ | ✓ | – | – | `/chat/*` + socket.io | L | ✗ |
| Quotes | ✓ | ✓ | ✓ | – | `/quotes/*` | L | ✗ |
| Shaadi Plan | ✓ | ✓ | ✓ | ✓ | `/wedding-plans/*` | L | ✗ |
| Umbrellas | ✓ | ✓ | ✓ | ✓ | `/wedding-umbrellas/*` | L | ✗ |
| Complaints | ✓ | ✓ | – | – | `/complaints`, `/complaints/mine` | L | ✗ |
| Activity feed | – | ✓ | – | – | `/activity/feed?page&pageSize` | L | ✗ |
| Notifications | – | ✓ | ✓ | ✓ | `/notifications*` | L | ✓ |
| Profile | – | ✓ | ✓ | – | `/users/profile/me`, `PATCH /users/profile` | L | ✓ |
| Password | – | – | ✓ | – | `PATCH /users/change-password` | L | ✗ |
| Avatar | ✓ | – | – | – | `POST /users/upload-profile-picture` (multipart) | L | ✗ |
| Sessions | – | ✓ | – | ✓ | `/auth/sessions`, `/sessions/:jti/revoke`, `/revoke-all` | L | ✗ |
| 2FA | ✓ | – | ✓ | ✓ | `/auth/2fa/{enroll,confirm,disable}` | L | ✗ |
| Phone OTP | ✓ | – | – | – | `/auth/phone-otp/{request,verify}` | L | partial |
| Push | ✓ | ✓ | – | ✓ | `/push/*` | L | ✗ |
| Planning tools | – | – | – | – | **none** | **N** | local |

**Read that column honestly: the backend supports ~35 customer capabilities and the app uses 9.**

---

## 4. `POST /bookings` — the exact payload

From the web's `components/booking/booking-form.tsx:468`. **Optional fields are omitted entirely, never sent as `null`** — that keeps non-applicable bookings byte-identical.

```jsonc
{
  "customerName":  "…",          // required
  "customerEmail": "…",          // required
  "customerPhone": "…",          // required
  "vendorId":      123,          // venue.vendor.id ?? venue.id
  "bookingDate":   "2026-09-14", // YYYY-MM-DD
  "bookingTime":   "18:00",      // the slot's IDENTITY — see §6
  "vendors": [                    // required, ≥1
    {
      "businessId":      3358,
      "packageId":       null,
      "menuId":          null,
      "totalAmount":     760000,
      "downPayment":     76000,
      "specialRequests": "",
      "slotTemplateId":  12       // ONLY for a single-vendor cart with a chosen
                                  // template. Backend REJECTS mixed-mode carts.
    }
  ],

  // omitted when absent / blank
  "guestCount":              500,
  "serviceLocationMode":     "at_vendor",  // absent → NULL → at_vendor
  "serviceLocationAddress":  "…",
  "serviceLocationNotes":    "…",
  "umbrellaId":              7,            // ownership + bundle discount server-side
  "selectedBundledServices": { "12": 2 },  // priceModel applied server-side
  "pickupAddress":           "…",          // car rental only
  "dropoffAddress":          "…"
}
```

Response `201`/`200`. Id at `data.booking.id ?? data.id ?? data.bookingId`. **No id back → stop and surface an error. Never proceed to payment.**

`bookingCreateService` rejects with **18 codes** in two families:

- **RACES** — `SLOT_CONFLICT`, `DAILY_CAPACITY_FULL`, `UNIT_POOL_FULL`, `DATE_BLOCKED`. Someone booked first; only checkable at confirm time. Show a real conflict message and return the customer to the date step.
- **SETUP** — `VENDOR_NOT_PRICED`, `BUSINESS_NOT_BOOKABLE`, `SPACE_OVER_CAPACITY`, `SLOT_ENDS_AFTER_CLOSURE`. Knowable before the customer starts. Gate the *entry* to booking on these, not the last step.

---

## 5. Payments

```
GET  /payments/config                            → { publishableKey }            ✅
GET  /payments/pk/methods?bookingId=<id>         → { methods }                   ✅
GET  /payments/check-existing-intent?bookingId&paymentType                       ✅
POST /payments/create-payment-intent
POST /payments/create-checkout-session
GET  /payments/verify-checkout-session?sessionId&bookingId&paymentType           ✅
POST /payments/process-{down,remaining,full}-payment   { bookingId }
POST /payments/cancel-incomplete-intents               { bookingId }
GET  /payments/booking-status/:bookingId  → { status, paymentStatus, totalAmount,
       downPayment, paidAmount, remainingAmount, transactions,
       cashRefundOwedTotal, cashRefundsOwed }                                    ✅
GET  /payments/{history,pending}                                                 ✅
```

🔴 **Stripe caps Pakistan card payments near Rs 999,999.** If the summed `downPayment` exceeds `999999`, divert to **bank-transfer instructions** — not an inline card screen. A wedding advance routinely exceeds this.

- PK local methods (JazzCash / Easypaisa / Raast / IBFT / cash) come from `/payments/pk/methods`. **Never hardcode them.**
- `createPaymentIntent` checks for an existing intent and reuses it. **That dedupe is deliberate** — removing it recreates the duplicate-payment bug.
- Leaving the payment screen must `DELETE /bookings/:id/cancel-pending`, or unpaid bookings hold vendor capacity.

---

## 6. The slot vocabulary — one source of truth

Ported from the web's `lib/booking/slot-vocabulary.ts`. There were once **seven** disagreeing implementations. Do not add an eighth.

**Engine A — vendor slot templates** (preferred when configured):

```
GET /businesses/:id/slots/availability/bulk?from&to[&subVenueId]
  → { from, to, days: { "2026-09-14": SlotAvailabilityRow[] } }

SlotAvailabilityRow = { slotTemplateId, label, startTime, endTime,
                        capacity,           // concurrent BOOKINGS
                        used, free,
                        unitGuestCapacity,  // guests ONE booking may bring
                        subVenueId }        // null = venue-wide
```

`capacity` vs `unitGuestCapacity` is the pair the vendor form conflated badly enough to publish *"150 bookings at once"*. Render `free of capacity left`; validate guests against `unitGuestCapacity`.

**Space scoping is load-bearing.** Fetch with the chosen `subVenueId`. Caught live on business 3358: five spaces, and a slot belonging only to the space "afsana" was offered to a customer who had picked a different hall. Changing space **must** clear `slotTemplateId` and drop the month cache.

**Engine B — four legacy periods** (fallback):

| `bookingTime` | Label | Hours |
|---|---|---|
| `10:00` | Whole day | 10:00–22:00 |
| `09:00` | Morning | 09:00–12:00 |
| `12:00` | Midday | 12:00–16:00 |
| `18:00` | Evening | **18:00–22:00** |

`bookingTime` is the slot's **identity**, so two slots cannot share a start time — that is why "Whole day" is 10:00, not 09:00 (which has 10 live bookings). `14:00 Afternoon` and `17:00` are retired from the picker but must still render with real names.

🔴 **Evening ends 22:00, never 23:00.** Punjab wedding halls must close by 10 PM. A canonical "Evening → 23:00" shipped once, vendors copied the platform's own example into their templates, and **40 of 115 active slots ended past closure**. Nothing caught it until a customer pressed Pay & Confirm.

Time ranges use the word **to**, never an en-dash — Pakistani vendors misread the dash.

---

## 7. Realtime

`socket.io-client`, same JWT for the handshake (`socket.handshake.auth.token`), attached to the **same HTTP server** as the API — not a separate port. Personal room `user:<id>`; chat joins `conversation:<id>`. Events namespaced `notification:*` and `chat:*`.

Whether a new message marks read or bumps the unread counter depends on the backend's "is the other participant viewing the room?" check.

---

## 8. Re-verification

Before any screen work, re-run the probe. A capability marked live here can be turned off, and building against a stale row wastes a day:

```bash
node scratchpad/probe-customer-api.mjs
```

**Probe the route, not the flag table.** A flag's state in the DB is not authoritative for production behaviour.
