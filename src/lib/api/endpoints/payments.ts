/**
 * Paying for a booking from the app.
 *
 * The app had no payment surface at all — a couple could find a vendor, book,
 * and see what they owed, then had to open the website to hand over money.
 * The backend has had the whole Stripe rail the entire time.
 *
 * ── The rule everything here is built around ─────────────────────────────
 *
 * **A payment is PAID only when the server says the Stripe session is paid.**
 * Never because a browser closed, never because the customer came back to the
 * app, never because a redirect fired. Those all happen when someone taps
 * "back" on the Stripe page having paid nothing.
 *
 * This is the same defect class that put a Rs 0 receipt against fully-paid
 * bookings on this system: a screen reporting money that no ledger had. The
 * flow below cannot produce it, because the only thing that flips the app to
 * "paid" is `verifyCheckoutSession` returning a session whose
 * `payment_status === "paid"` — a check that runs server-side against Stripe.
 *
 * ── Why the browser, and not a native card sheet ─────────────────────────
 *
 * `createCheckoutSession` hands back a `checkout.stripe.com` URL. Opening it
 * in the system browser means the PAN is typed into Stripe's own page and
 * never touches this app — no card data in our process, no PCI surface, and
 * 3-D Secure works because it is a real browser.
 *
 * ── Why we do NOT wait for the redirect ──────────────────────────────────
 *
 * SEC-3 in `paymentController.createCheckoutSession` rejects any `successUrl`
 * whose origin differs from `FRONTEND_URL` and silently falls back to the web
 * default. That guard exists because an unchecked redirect let an attacker
 * aim Stripe's own post-payment redirect at their page, carrying a real
 * `session_id` — "your payment failed, re-enter your card" is very convincing
 * when the customer did just pay.
 *
 * It is the right guard, and it means a `weddingwala://` deep link is not an
 * option: the backend would reject it. So this flow does not depend on the
 * redirect at all. We hold the `sessionId` from step 1, let Stripe redirect
 * wherever it likes inside the browser tab, and when the tab closes we ask OUR
 * server what happened. That is both compatible with SEC-3 and strictly more
 * robust than the web's flow — it still works if the customer force-quits the
 * tab, loses signal on the redirect, or kills the app and comes back.
 *
 * ── This moves real money ────────────────────────────────────────────────
 *
 * There is no staging. `createCheckoutSession` writes a PaymentIntent row and
 * `verifyCheckoutSession` writes a PaymentTransaction. rules.md: money rows
 * are never written while testing. Built and shipped so a customer can pay; it
 * is not exercised end-to-end by us.
 */
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

export type PaymentType = 'down_payment' | 'remaining_payment' | 'full_payment';

/**
 * Stripe's ceiling for PKR. Above this the backend refuses to build a session
 * and answers 200 with `requiresBankTransfer`, which is a real answer and not
 * an error — three of this customer's own bookings are over it.
 */
export const STRIPE_PKR_MAX = 999999;

/** `GET /payments/booking-status/:id` — the authoritative money position. */
export interface BookingPaymentStatus {
  bookingId: number;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  downPayment: number;
  /**
   * Summed from COMPLETED PaymentTransactions — the payment provider's own
   * ledger, not the `downPayment` column.
   *
   * That distinction is the whole reason this screen reads this endpoint
   * instead of the booking row. The same money is written in four places on
   * this system that nothing forces to agree, and `Bookings.downPayment`
   * carries two different meanings depending on the booking's age: the
   * deposit REQUIRED at creation, and the amount RECEIVED after the first
   * receipt. Asking a customer to pay a figure derived from it is how you bill
   * someone twice.
   */
  paidAmount: number;
  remainingAmount: number;
  transactions: { amount: number; paymentType: string; date: string }[];
}

/**
 * Can this account actually pay for this booking, and what does it owe?
 *
 * ── Why "can they pay" is a real question ────────────────────────────────
 *
 * A booking appearing in the customer's list does NOT mean they may pay for
 * it. The two endpoints disagree about ownership:
 *
 *   getSimpleUserBookings   customerUserId OR email OR PHONE
 *   callerMayPayForBooking  customerUserId OR email          (no phone arm)
 *
 * So a booking matched into the list by phone alone is refused by every
 * payment endpoint. This is not hypothetical: on production, 2 of this
 * customer's 7 unpaid bookings answer 403 — and they are the two largest,
 * holding Rs 488,000 between them. Both are recorded against
 * `qa.cust.fatima@example.com` while the account is a different address.
 *
 * `booking-status` runs byte-identical authorization to the pay endpoints and
 * is READ-ONLY, so it is the honest probe: if it answers, payment will be
 * accepted; if it 403s, no amount of retrying will help and the customer needs
 * telling, not a button that fails.
 *
 * `null` means "not yours to pay" — distinct from a thrown error, which means
 * we could not find out.
 */
export async function getPayability(bookingId: number): Promise<BookingPaymentStatus | null> {
  try {
    return await api.get<BookingPaymentStatus>(`/payments/booking-status/${bookingId}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) return null;
    throw e;
  }
}

/**
 * Which payment is owed, from the money position.
 *
 * Mirrors `app/(main)/user/bookings/[id]/pay/page.tsx`, with one deliberate
 * correction. The web sends `down_payment` whenever the status is not settled
 * and not partial — even when `downPayment` is 0. The backend computes that
 * branch's amount as `parseFloat(booking.downPayment)`, so 0 there produces
 * "Invalid booking amounts configured on server", a 500 with no customer
 * meaning. When there is no separate deposit, the whole thing is due, and
 * `full_payment` is the branch that says so.
 */
export function resolvePaymentType(
  s: Pick<BookingPaymentStatus, 'paymentStatus' | 'totalAmount' | 'downPayment' | 'remainingAmount'>,
): { type: PaymentType; amount: number } | null {
  const p = String(s.paymentStatus ?? '').trim().toLowerCase();
  // isSettled, not `p === 'paid'`. A booking paid in full and then partially
  // refunded owes NOTHING, and the fall-through below is a DOWN PAYMENT
  // request — so getting this wrong asks a couple for their deposit again,
  // days after we sent them money back.
  if (p === 'paid' || p === 'partially refunded' || p === 'refunded') return null;

  if (p === 'partial') {
    // From the transaction ledger, never `total − downPayment`.
    const amount = Math.max(s.remainingAmount, 0);
    return amount > 0 ? { type: 'remaining_payment', amount } : null;
  }

  const down = Number(s.downPayment) || 0;
  const total = Number(s.totalAmount) || 0;
  if (down > 0 && down < total) return { type: 'down_payment', amount: down };
  return total > 0 ? { type: 'full_payment', amount: total } : null;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  amount: number;
  paymentType: string;
}

/** Above the Stripe PKR ceiling the backend answers this instead, with a 200. */
export interface BankTransferRequired {
  requiresBankTransfer: true;
  bookingId: number;
  amount: number;
  paymentType: string;
  customerName?: string;
  customerEmail?: string;
  bookingDate?: string;
  bookingTime?: string;
}

export type CheckoutResult = CheckoutSession | BankTransferRequired;

export function isBankTransfer(r: CheckoutResult): r is BankTransferRequired {
  return (r as BankTransferRequired).requiresBankTransfer === true;
}

/**
 * Open a Stripe Checkout session.
 *
 * `customerEmail` MUST be the booking's own address — the backend compares it
 * to `booking.customerEmail` and 403s on any mismatch. Passing the signed-in
 * account's address instead is wrong on real data; see the note on
 * `Booking.customerEmail`.
 *
 * No `successUrl`/`cancelUrl` is sent. SEC-3 would reject an app scheme, and
 * this flow never reads the redirect — it verifies server-side afterwards.
 */
export async function createCheckoutSession(input: {
  bookingId: number;
  customerEmail: string;
  paymentType: PaymentType;
}): Promise<CheckoutResult> {
  return api.post<CheckoutResult>('/payments/create-checkout-session', {
    bookingId: Number(input.bookingId),
    customerEmail: input.customerEmail,
    paymentType: input.paymentType,
  });
}

export interface VerifiedPayment {
  paid: boolean;
  /** Stripe's own word when unpaid — "unpaid", "no_payment_required". */
  stripeStatus?: string;
  bookingId?: number;
  paymentType?: string;
  amount?: number;
  /** The session had already been recorded; not a second charge. */
  alreadyProcessed?: boolean;
}

/**
 * Ask OUR server what Stripe says about this session. The only thing in this
 * app permitted to conclude that money arrived.
 *
 * A 400 here is the NORMAL not-paid answer — `verifyCheckoutSession` returns
 * 400 with `{ status: "unpaid" }` when the customer opened Checkout and left.
 * Treating that as a failure would show an error to someone who simply chose
 * not to pay, so it resolves to `paid: false` and the screen says so plainly.
 * Anything else is a genuine fault and is thrown.
 */
export async function verifyCheckoutSession(input: {
  sessionId: string;
  bookingId?: number;
  paymentType?: string;
}): Promise<VerifiedPayment> {
  const params: Record<string, string> = { sessionId: input.sessionId };
  if (input.bookingId != null) params.bookingId = String(input.bookingId);
  if (input.paymentType) params.paymentType = input.paymentType;
  try {
    const d = await api.get<{
      bookingId?: number;
      paymentType?: string;
      amount?: number;
      status?: string;
      alreadyProcessed?: boolean;
    }>('/payments/verify-checkout-session', { params });
    return {
      paid: true,
      bookingId: d?.bookingId,
      paymentType: d?.paymentType,
      amount: d?.amount,
      alreadyProcessed: d?.alreadyProcessed,
    };
  } catch (e) {
    if (e instanceof ApiError && e.status === 400) {
      const details = e.details as { status?: string } | null;
      return { paid: false, stripeStatus: details?.status };
    }
    throw e;
  }
}
