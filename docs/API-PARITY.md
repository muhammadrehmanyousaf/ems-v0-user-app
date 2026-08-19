# API parity — app vs. web

**Why this file exists.** The app, the web, the vendor portal and the admin all
write to the *same production database*. A field the app names differently is
not a style difference — it is a column that never gets written, and nothing
errors. This is the record of every write the app makes, checked against the
web's payload for the same endpoint and against the backend controller that
receives it.

Audited 2026-08-18. **Re-run this whenever an endpoint changes on either side.**

---

## 🔴 Two endpoints were failing 100% of the time on live production

### `POST /leads/inquiry` — the marketplace's core transaction

The backend (`leadController.submitInquiry`) reads exactly:

```
businessId
contactName  ?? name        contactPhone ?? phone
contactEmail ?? email       message      ?? inquiry
eventType    eventDate      estimatedGuests    website (honeypot)
```

The app sent **`phoneNumber`** and **`guestCount`**. Neither is an accepted
alias, so both were dropped. `contactName` and `contactEmail` survived because
`name` and `email` *are* aliases — which is precisely why this hid for so long:
the payload looked mostly right.

Then `assessContactability({ phone: "", email: "" })` found no channel to reply
on and returned:

> **400** — "Please share a phone number or email so the vendor can reply"

…to a customer who had just typed their phone number into the box. Discovery →
contact is the whole product, and it failed every time from the app while the
identical web form beside it worked.

`InquiryModal` made it worse: it never collected an email at all, so there was
no second channel to fall back to, and its local guard checked "name OR phone"
— letting someone through with only a name, to be rejected by the server for
something the form had just told them was fine.

**Fixed.** `InquiryPayload` now uses the wire names, so a rename cannot compile.
Email field added. Guard matches the server's rule. Phone and email normalised.

### `POST /chat/conversations/:id/messages`

The backend reads `content` and `messageType`. The app sent `message` and
`type`, so `content` resolved to `""`:

> **400** — "Message content required"

A second bug sat behind it: the handler returns `{ message: payload }`, so after
the envelope unwrap the caller gets a wrapper, not a `ChatMessage`. It was typed
as one, so every field would have read `undefined` the moment the first bug was
fixed — a blank bubble instead of an error.

**Fixed.** Both.

---

## 🟠 `POST /auth/signup` — five of eight fields

The web (`ems-v0/components/user-registration-form.tsx`) sends eight. The app
sent five.

| Field | App was sending | Cost |
|---|---|---|
| `profileImage` | *absent* | No account created in the app has ever had an avatar. The backend column, the upload middleware and the `mapUser` reader were all already there. |
| `termsVersion` | `'2025-01'` | **A version that has never been published.** The web sends `2026-05-07`. |
| `termsAcceptedAt` | *absent* | No acceptance timestamp on the row. |
| `phoneNumber` | raw as typed | `0300 1234567` / `+92 300 1234567` / `03001234567` stored as three customers. |
| `email` | trimmed only | `Ali@x.com` and `ali@x.com` become two accounts. |

The `termsVersion` one is the sharp edge. The backend persists it against the
user row (migration `20260507110000-user-terms-acceptance`) and it exists for
**PayFast underwriting and chargeback defence**. Every app signup carried a
record saying the customer accepted a document that does not exist — worse than
no record, because an absent field reads as "not captured" and a wrong one reads
as evidence until somebody checks it.

**Fixed**, plus `src/config/legal.ts` so the constant has one home, and
`src/lib/pk.ts` — a verbatim port of the web's `normalizePkPhone` /
`normalizeEmail` — so the two surfaces cannot drift again.

---

## 🟠 `PATCH /users/profile` — `email` was missing

The **customer** form on the web sends `{ fullName, email, phoneNumber }`. The
app sent `{ fullName, phoneNumber, city }` — so a customer could not correct a
typo in the address every booking confirmation and password reset is sent to.

`city` is ours alone and it is *fine*: `userController.updateMyProfile`
allowlists `fullName · email · phoneNumber · city` and drops anything else
silently. **Do not add a field here without checking that list** — it will
appear to save and won't.

Note this is deliberately **not** the vendor dashboard's nine-field profile
(`bookingEmail`, `officeAddress`, `website`…). That form belongs to a business.
Copying it here would show a couple planning their shaadi a box for their office
address.

## 🟠 `POST /users/upload-profile-picture` — absent from the app

The web's profile page can change your photograph. The app could not. Added.

**The field name is `picture`, not `profileImage`.** Signup uses `profileImage`;
this endpoint uses `picture`. Different middlewares, neither accepts the other's
key, and the wrong one uploads nothing and returns success.

---

## ✅ Verified matching

| Endpoint | Note |
|---|---|
| `POST /auth/login` | `{ email, password }`. Email now lowercased so it matches the shape signup stores. |
| `PATCH /users/change-password` | `{ currentPassword, newPassword }` — identical. |
| `POST /favorites` | `{ businessId }` — identical. |
| `DELETE /favorites/:id` | App prefers the favourite id and falls back to businessId; the web only ever sends businessId. Superset, safe. |
| `POST /chat/conversations` | `{ otherUserId, bookingId? }` — identical. |
| `POST /bookings` | Verified byte-for-byte against `CUSTOMER-SURFACE.md §3.5` when it was built: optional keys omitted rather than nulled, `vendors` always an array, `slotTemplateId` only for template-engine vendors. |

## Not yet compared

- `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` — no request
  body on either side, so there is nothing to diverge, but the response shapes
  have not been diffed.
- `POST /auth/phone-otp/request` · `/verify` — no web counterpart to compare
  against (the web uses email OTP). Phone is normalised now regardless.

---

## The rule this file encodes

**Name local types after the wire, not after what reads nicely.** Every bug
above is the same bug: a friendly local name (`phoneNumber`, `guestCount`,
`message`) that had to be mapped to a wire name, and the mapping is the thing
that goes wrong. `InquiryPayload` and `sendMessage` now use the server's own
vocabulary, so the compiler catches a rename instead of production catching it.
