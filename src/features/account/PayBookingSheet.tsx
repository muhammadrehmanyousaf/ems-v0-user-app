/**
 * PayBookingSheet — what you owe, then the card.
 *
 * Symmetrical with `CancelBookingSheet`: the money question is answered before
 * the action is reachable, and the three possible answers render as three
 * different screens rather than collapsing into one.
 *
 *   status              the real position — total, already paid, due now
 *   status === null     a 403 from `booking-status`, meaning this account may
 *                       not pay for this booking at all. Explained, not
 *                       offered as a button that can only fail.
 *   nothing owed        said plainly; the pay action is not rendered.
 *
 * ── Why the amounts come from `booking-status`, not the booking row ──────
 *
 * `paidAmount` there is summed from COMPLETED PaymentTransactions — the
 * payment provider's own ledger. The booking row's `downPayment` column means
 * two different things depending on the booking's age (deposit REQUIRED at
 * creation, amount RECEIVED after the first receipt), and this system already
 * had Rs 4.6m of disagreement between those four ledgers. Charging a customer
 * a figure derived from the ambiguous one is how you bill somebody twice.
 *
 * ── The outcome copy is the point ────────────────────────────────────────
 *
 * Four endings, and three of them are routinely written as "payment failed" in
 * apps that have not thought about it:
 *
 *   paid          server-confirmed against Stripe. The only "paid".
 *   not_paid      they opened Checkout and came back. Nothing went wrong.
 *   unconfirmed   we could not reach the server. We do NOT know — and the
 *                 copy says don't pay twice, because the webhook may already
 *                 have settled it.
 *   bank_transfer over Stripe's PKR ceiling. Not a rejection of them.
 */
import { useState } from 'react';
import { View } from 'react-native';

import { Divider, MoneyRow, Sheet, Skeleton, Text } from '@/components/ui';
import { usePayability } from '@/features/account/account.queries';
import { payForBooking, type PayOutcome } from '@/features/account/usePayBooking';
import { useT } from '@/i18n/useT';
import type { Booking } from '@/lib/api/endpoints/account';
import { resolvePaymentType } from '@/lib/api/endpoints/payments';
import { haptics, useTheme } from '@/theme';

/** The label for what is being charged, so the amount is never unexplained. */
const DUE_LABEL = {
  down_payment: 'bookings.payDeposit',
  remaining_payment: 'bookings.payRemaining',
  full_payment: 'bookings.payFull',
} as const;

export function PayBookingSheet({
  booking,
  visible,
  onClose,
  onFinished,
}: {
  booking: Booking | null;
  visible: boolean;
  onClose: () => void;
  onFinished: (outcome: PayOutcome) => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const q = usePayability(visible && booking ? booking.id : null);

  const close = () => {
    setError(null);
    onClose();
  };

  if (!booking) return null;

  const s = q.data;
  const checking = q.isFetching;
  const answered = q.isFetched && !checking;
  const owed = s ? resolvePaymentType(s) : null;

  const submit = async () => {
    if (!s || !owed) return;
    // The BOOKING's address, never the account's — the backend compares the
    // two and 403s on any mismatch, and on real data they differ.
    const email = booking.customerEmail;
    if (!email) {
      setError(tr('bookings.payFailed'));
      return;
    }
    setError(null);
    setBusy(true);
    haptics.light();
    try {
      const outcome = await payForBooking({
        bookingId: booking.id,
        customerEmail: email,
        status: s,
      });
      close();
      onFinished(outcome);
    } catch (e: unknown) {
      // The server's own refusal when it has one — "Down payment already
      // processed", "Booking is already fully paid" — tells the customer more
      // than a generic failure and matches what their vendor sees.
      const msg = (e as { message?: string })?.message;
      setError(msg && msg.length < 160 ? msg : tr('bookings.payFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={tr('bookings.payTitle')}
      resetLabel={tr('common.close')}
      onReset={close}
      primaryLabel={tr('bookings.payCard')}
      onPrimary={submit}
      // Locked until we know what is owed AND that this account may pay it.
      primaryDisabled={!answered || !s || !owed || busy}
      primaryLoading={busy}
      error={error}
    >
      <View style={{ gap: t.spacing.lg }}>
        {checking ? (
          <View style={{ gap: t.spacing.sm }}>
            <Text variant="caption" tone="faint" urdu={isUrdu}>
              {tr('bookings.payChecking')}
            </Text>
            <Skeleton height={90} radius={t.radius.xs} />
          </View>
        ) : !s ? (
          // 403 — the booking reached this customer's list by phone match, but
          // the payment endpoints authorize on user id or email only.
          <Text variant="body" tone="muted" urdu={isUrdu}>
            {tr('bookings.payNotYours')}
          </Text>
        ) : !owed ? (
          <Text variant="body" tone="muted" urdu={isUrdu}>
            {tr('bookings.paySettled')}
          </Text>
        ) : (
          <>
            <View
              style={{
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.radius.xs,
                padding: t.spacing.lg,
                gap: 2,
              }}
            >
              <MoneyRow label={tr('bookings.payTotal')} value={s.totalAmount} urdu={isUrdu} />
              {s.paidAmount > 0 ? (
                <MoneyRow
                  label={tr('bookings.payAlready')}
                  value={s.paidAmount}
                  direction="in"
                  urdu={isUrdu}
                />
              ) : null}
              <Divider />
              {/* The figure the card will actually be charged, named by what
                  it is — a deposit, a balance, or the whole thing. */}
              <MoneyRow
                label={tr(DUE_LABEL[owed.type])}
                value={owed.amount}
                direction="out"
                emphasis
                urdu={isUrdu}
              />
            </View>

            <Text variant="caption" tone="faint" urdu={isUrdu}>
              {tr('bookings.payOpensBrowser')}
            </Text>
          </>
        )}
      </View>
    </Sheet>
  );
}
