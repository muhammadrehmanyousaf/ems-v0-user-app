/**
 * The pay flow, as a mutation.
 *
 * ── The one rule ─────────────────────────────────────────────────────────
 *
 * Nothing in here concludes that money arrived except `verifyCheckoutSession`,
 * which asks our server, which asks Stripe. Not the browser closing, not the
 * customer coming back, not a redirect. Those all happen just as reliably when
 * someone opens Checkout, looks at the amount and taps back.
 *
 * ── The Android trap this is built around ────────────────────────────────
 *
 * `WebBrowser.openBrowserAsync` does NOT wait for the browser to close on
 * Android. Its own contract:
 *
 *   "On Android promise resolves with { type: 'opened' } if we were able to
 *    open browser."
 *
 * This app's audience is mid-range Android in Pakistan. Verifying after that
 * promise would fire while the Custom Tab was still animating open — before
 * the customer had seen a card field — and every single payment would report
 * "not paid".
 *
 * `openAuthSessionAsync` is the primitive that actually answers "the browser
 * closed": it resolves `{ type: 'cancel' }` when the user closes the tab, on
 * both platforms, and on Android it is implemented with AppState + Linking
 * internally rather than leaving us to hand-roll it. We pass `null` for the
 * redirect URL deliberately — see below.
 *
 * ── Why no redirect URL ──────────────────────────────────────────────────
 *
 * SEC-3 in `paymentController.createCheckoutSession` rejects any redirect
 * whose origin differs from `FRONTEND_URL`, because an unchecked one let an
 * attacker aim Stripe's post-payment redirect at their own page carrying a
 * real session id. So `weddingwala://…` cannot be registered as the success
 * URL, and we do not try. We hold the session id from step 1 and verify
 * afterwards, which is compatible with that guard and survives things the
 * redirect does not: a force-quit tab, signal lost on the return leg, the app
 * being killed mid-payment.
 *
 * ── If the app dies mid-payment ──────────────────────────────────────────
 *
 * The payment is still recorded. Stripe's webhook calls the backend directly
 * and does not depend on this device. `verifyCheckoutSession` is what lets the
 * SCREEN tell the truth promptly; the webhook is what makes the MONEY true.
 * That ordering is why a failure to verify is reported as "we couldn't
 * confirm" and never as "your payment failed".
 */
import * as WebBrowser from 'expo-web-browser';

import {
  createCheckoutSession,
  isBankTransfer,
  resolvePaymentType,
  verifyCheckoutSession,
  type BookingPaymentStatus,
} from '@/lib/api/endpoints/payments';

export type PayOutcome =
  /** Server-confirmed. The only value that may be shown as "paid". */
  | { kind: 'paid'; amount?: number; alreadyProcessed?: boolean }
  /** Checkout opened, customer came back without completing. Not an error. */
  | { kind: 'not_paid'; stripeStatus?: string }
  /** Over the Stripe PKR ceiling — the backend refuses to build a session. */
  | { kind: 'bank_transfer'; amount: number }
  /** Nothing is owed. */
  | { kind: 'nothing_due' }
  /**
   * The browser closed but we could not reach the server to ask what happened.
   * NOT the same as not paid — the customer may well have paid, and the
   * webhook will settle it. Says so, rather than guessing either way.
   */
  | { kind: 'unconfirmed' };

/**
 * Run one payment attempt end to end.
 *
 * `status` is the money position already fetched by the sheet, which is also
 * how we know the caller is allowed to pay at all.
 */
export async function payForBooking(input: {
  bookingId: number;
  customerEmail: string;
  status: BookingPaymentStatus;
}): Promise<PayOutcome> {
  const owed = resolvePaymentType(input.status);
  if (!owed) return { kind: 'nothing_due' };

  const session = await createCheckoutSession({
    bookingId: input.bookingId,
    customerEmail: input.customerEmail,
    paymentType: owed.type,
  });

  // Rs 999,999 is Stripe's PKR maximum. The backend answers 200 with this
  // shape rather than an error, because wanting to pay more than the card rail
  // allows is not a mistake the customer made.
  if (isBankTransfer(session)) {
    return { kind: 'bank_transfer', amount: session.amount };
  }

  // Resolves when the tab CLOSES. `openBrowserAsync` would resolve on open.
  await WebBrowser.openAuthSessionAsync(session.url, null);

  try {
    const verified = await verifyCheckoutSession({
      sessionId: session.sessionId,
      bookingId: input.bookingId,
      paymentType: owed.type,
    });
    return verified.paid
      ? {
          kind: 'paid',
          amount: verified.amount,
          alreadyProcessed: verified.alreadyProcessed,
        }
      : { kind: 'not_paid', stripeStatus: verified.stripeStatus };
  } catch {
    // Network died on the way back, or the server errored. We genuinely do not
    // know. Saying "payment failed" here would be a guess in the direction that
    // makes a paying customer pay twice.
    return { kind: 'unconfirmed' };
  }
}
