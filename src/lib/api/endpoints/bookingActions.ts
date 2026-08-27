/**
 * Booking actions a CUSTOMER can take — cancelling, and seeing what they get
 * back before they do.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 *
 * The app had no booking actions at all. `account/bookings.tsx` rendered phase
 * state and expanded in place; there was no cancel, no reschedule, nothing a
 * customer could do about a booking once it existed. Meanwhile the web
 * customer surface (`app/(main)/user/bookings/[id]/page.tsx`) has had cancel —
 * with a refund figure shown before the confirm — the whole time, and the
 * backend has supported it the whole time. The gap was the app, not the API.
 *
 * ── The refund figure is not decoration ───────────────────────────────────
 *
 * `GET /:id/refund-preview` returns what the vendor's cancellation policy
 * actually owes this customer today, per the tier their days-to-event falls
 * into. Showing "any payments may be subject to the vendor's refund policy"
 * instead, when the server can compute the number exactly, is how a family
 * cancels a paid booking without ever learning they forfeit the advance. The
 * web fetches the preview when the dialog opens and before the confirm is
 * reachable; so does this.
 *
 * The endpoint is flag-gated (`DISPUTE_ENGINE_ENABLED`, resolved against the
 * BOOKING's vendor for a customer caller) and answers **404** when off. That is
 * a disabled feature, not an error: `getRefundPreview` returns `null` for it,
 * exactly as `ems-v0/lib/api/bookingOrder.ts` does, so the sheet can fall back
 * to the policy sentence rather than showing a customer a failure.
 *
 * ── TWO cancel endpoints, and picking the wrong one is a real failure ─────
 *
 * A booking still in `Awaiting Payment` was never paid for, so it is DELETED
 * rather than cancelled:
 *
 *   Awaiting Payment  →  DELETE /bookings/:id/cancel-pending
 *   everything else   →  PATCH  /bookings/:id/cancel
 *
 * `cancelAwaitingPaymentBooking` refuses outright when any money has flowed
 * (paymentStatus Paid/Partial/Refunded → 400 `payment_already_received`), and
 * it re-reads paymentStatus under `FOR UPDATE` precisely because the Stripe
 * webhook may land while the customer is looking at the dialog. So sending a
 * paid booking down that path does not quietly destroy a paid row — it is
 * refused — but it IS refused with a message about deletion that means nothing
 * to a customer. Branch on status here, once, the way the web does.
 *
 * ── This writes to production ─────────────────────────────────────────────
 *
 * There is no staging. `cancelBooking` cancels a real booking, releases the
 * hall on the availability grid, and raises a real refund obligation against a
 * real vendor's balance. rules.md: money rows are never written while testing —
 * this flow is built and shipped so a customer can complete it; it is not
 * exercised end-to-end by us.
 */
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

/** One band of the vendor's policy: at N+ days before the event, X% comes back. */
export interface RefundTier {
  minDaysBefore: number;
  refundPct: number;
}

export interface RefundPolicySummary {
  key: string;
  labelUr: string;
  labelEn: string;
  depositPct: number;
  tiers: RefundTier[];
}

/**
 * Mirrors `RefundPreview` in `ems-v0/lib/api/bookingOrder.ts`. Only the fields
 * this app renders are declared — `comparison`, `presets` and `trace` are the
 * vendor's policy-shopping surface and have no customer meaning.
 */
export interface RefundPreview {
  bookingId: number;
  eventDate: string | null;
  /** Days between today (Asia/Karachi) and the event. Decides the tier. */
  daysBefore: number;
  grand: number;
  /**
   * What the server believes was RECEIVED — `Paid` → the whole grand,
   * `Partial` → the advance, otherwise 0. Not `downPayment` read directly:
   * that column is the deposit QUOTED at creation, and reading it as money
   * received made the preview "refund" an advance a Pending customer had
   * never paid. Zero here means nothing was paid and there is nothing to
   * refund — the sheet says so plainly instead of showing a Rs 0 row.
   */
  totalPaid: number;
  policy: RefundPolicySummary;
  preview: {
    refund: number;
    forfeit: number;
    tier: RefundTier;
  };
}

/**
 * What the customer gets back if they cancel right now.
 *
 * `null` means the refund engine is off for this booking's vendor (404), NOT
 * that the refund is zero. The two must not render the same way: zero is a
 * fact the customer needs to see, and "we can't compute it" is a reason to
 * show the vendor's policy sentence instead.
 */
export async function getRefundPreview(bookingId: number): Promise<RefundPreview | null> {
  try {
    return await api.get<RefundPreview>(`/bookings/${bookingId}/refund-preview`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Status strings that route to `cancel-pending` rather than `cancel`. */
function isAwaitingPayment(status: string | undefined): boolean {
  return (status ?? '').toLowerCase().includes('await');
}

/**
 * Statuses the backend will accept a cancel for.
 *
 * `cancelBooking` allows exactly `Pending`, `Confirmed` and `Awaiting Payment`
 * and answers 400 for anything else. The web's guard is looser — it shows the
 * button for everything except cancelled and completed — so a `Declined` or
 * `Rejected` booking offers a Cancel there that can only fail. This app matches
 * the BACKEND, because a button that cannot succeed is worse than no button,
 * and there is no existing behaviour here to regress.
 */
export function canCancel(status: string | undefined): boolean {
  const s = (status ?? '').toLowerCase();
  return s === 'pending' || s === 'confirmed' || s === 'awaiting payment';
}

export interface CancelBookingInput {
  bookingId: number;
  /** The booking's CURRENT status — decides which endpoint is called. */
  status?: string;
  /** Free text. Persisted to `Booking.cancellationReason`; omitted when blank. */
  reason?: string;
}

export async function cancelBooking({
  bookingId,
  status,
  reason,
}: CancelBookingInput): Promise<void> {
  if (isAwaitingPayment(status)) {
    // Never paid for — the backend deletes rather than cancels. It carries no
    // body: `cancelAwaitingPaymentBooking` reads neither a reason nor anything
    // else off the request, and axios drops a DELETE body on some hosts anyway.
    await api.delete(`/bookings/${bookingId}/cancel-pending`);
    return;
  }
  const trimmed = reason?.trim();
  // Omitted, not sent empty. `if (reason)` on the server means `""` would be
  // skipped anyway, but an absent key is the honest request.
  await api.patch(`/bookings/${bookingId}/cancel`, trimmed ? { reason: trimmed } : {});
}

// ── Rescheduling ────────────────────────────────────────────────────────────

/**
 * Case-insensitive email compare, matching the backend's `sameEmail`.
 *
 * Both sides trimmed and lowercased, and a blank never matches a blank — the
 * backend's own note records a bug where two whitespace-only strings both
 * normalised to `""` and authorized each other.
 */
function sameEmail(a?: string | null, b?: string | null): boolean {
  const x = String(a ?? '').trim().toLowerCase();
  const y = String(b ?? '').trim().toLowerCase();
  return x.length > 0 && x === y;
}

/**
 * May THIS account reschedule this booking?
 *
 * ── Three endpoints, three different answers to "your booking" ───────────
 *
 * Measured against this customer's 7 live production bookings:
 *
 *   getSimpleUserBookings   customerUserId OR email OR phone   7 visible
 *   callerMayPayForBooking  customerUserId OR email            5 payable
 *   rescheduleBooking       email ONLY                         4 reschedulable
 *
 * So a booking can sit in the list, be payable, and still refuse to move.
 * There is no read-only probe for the reschedule rule the way `booking-status`
 * probes the pay rule, so this mirrors the server's check exactly rather than
 * offering a button that 403s.
 *
 * Also enforced server-side, and checked here so the customer is not sent into
 * a form that cannot submit:
 *   - status must be Pending, Awaiting Payment or Confirmed
 *   - the event must still be in the future (`event_already_passed`)
 *   - slot-template bookings are refused outright in v1
 *     (`slot_mode_reschedule_not_supported`)
 */
export function canReschedule(
  booking: { status?: string; customerEmail?: string; eventDate?: string },
  accountEmail?: string | null,
): boolean {
  if (!sameEmail(booking.customerEmail, accountEmail)) return false;
  const s = (booking.status ?? '').toLowerCase();
  if (s !== 'pending' && s !== 'confirmed' && s !== 'awaiting payment') return false;
  // `bookingDate <= today` is refused by the service. Compared as YYYY-MM-DD
  // strings, which is what the server holds and compares.
  if (booking.eventDate) {
    const todayKey = new Date().toISOString().slice(0, 10);
    if (booking.eventDate.slice(0, 10) <= todayKey) return false;
  }
  return true;
}

export interface RescheduleInput {
  bookingId: number;
  /** `YYYY-MM-DD`. */
  newBookingDate: string;
  /** Slot identity, e.g. "18:00" or a legacy period label. */
  newBookingTime: string;
}

/**
 * Every way a reschedule can end, as one type.
 *
 * The backend answers failures with `apiResponse(res, status, false,
 * result.code, result)` — so the ERROR MESSAGE is the machine code itself
 * (`"requires_top_up"`, `"slot_unavailable"`). Rendering `error.message`
 * straight onto the screen, which is this app's normal convention, would show
 * a customer the string `requires_top_up`. Hence the mapping.
 */
export type RescheduleOutcome =
  /** Moved. `refunded` is set when the new date priced LOWER and money came back. */
  | { kind: 'moved'; refunded?: number }
  /** New date costs MORE. The diff must be paid before it can move. */
  | { kind: 'needs_top_up'; diff: number; oldTotal?: number; newTotal?: number }
  /** Someone else holds that slot now. */
  | { kind: 'slot_taken' }
  /** Slot-template vendors are out of scope for v1 reschedule. */
  | { kind: 'not_supported' }
  /** The advance-transfer window, a passed event, a bad status — server's words. */
  | { kind: 'refused'; code: string; message?: string };

const OUTCOME_BY_CODE: Record<string, RescheduleOutcome['kind']> = {
  requires_top_up: 'needs_top_up',
  slot_unavailable: 'slot_taken',
  slot_mode_reschedule_not_supported: 'not_supported',
};

export async function rescheduleBooking(input: RescheduleInput): Promise<RescheduleOutcome> {
  try {
    const res = await api.post<{ refund?: number; refundedAmount?: number }>(
      `/bookings/${input.bookingId}/reschedule`,
      {
        newBookingDate: input.newBookingDate,
        newBookingTime: input.newBookingTime,
      },
    );
    const refunded = Number(res?.refundedAmount ?? res?.refund ?? 0);
    return { kind: 'moved', refunded: refunded > 0 ? refunded : undefined };
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    // `message` IS the code on this endpoint's failure path.
    const code = String(e.message || '');
    const details = (e.details ?? {}) as {
      diff?: number;
      oldTotal?: number;
      newTotal?: number;
      code?: string;
    };
    const resolved = OUTCOME_BY_CODE[details.code ?? code];
    if (resolved === 'needs_top_up') {
      return {
        kind: 'needs_top_up',
        diff: Number(details.diff) || 0,
        oldTotal: details.oldTotal,
        newTotal: details.newTotal,
      };
    }
    if (resolved === 'slot_taken') return { kind: 'slot_taken' };
    if (resolved === 'not_supported') return { kind: 'not_supported' };
    return { kind: 'refused', code: details.code ?? code, message: code };
  }
}
