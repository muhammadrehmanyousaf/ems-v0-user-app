/**
 * CancelBookingSheet — the refund figure, then the confirm. In that order.
 *
 * ── The rule this component exists to enforce ─────────────────────────────
 *
 * The confirm is not reachable until the refund question has been ANSWERED —
 * with a number, with "nothing was paid", or with an honest "your vendor will
 * confirm the amount". While the preview is in flight the action is disabled.
 * A customer must never be able to cancel a paid wedding booking a fraction of
 * a second before the screen would have told them what they forfeit.
 *
 * That is the same order the web dialog uses, and it is why the web fetches on
 * open rather than on mount.
 *
 * ── Three states, three different screens ────────────────────────────────
 *
 *   preview && totalPaid > 0   the real figure: refund, forfeit, day count
 *   preview && totalPaid === 0 "you haven't paid anything" — NOT a Rs 0 row.
 *                              A Rs 0 refund printed against a booking reads
 *                              as money lost. Nothing was paid; say that.
 *   preview === null           the engine is off for this vendor (404). We do
 *                              not know the figure. Printing "Rs 0" here would
 *                              be a guess about someone else's money.
 *
 * The distinction between the last two is the whole design. Both would collapse
 * into the same blank space in a component that only rendered the happy path.
 *
 * ── `Sheet` and not `Modal` ──────────────────────────────────────────────
 *
 * `Sheet` caps its own height and renders the footer OUTSIDE the scroll view,
 * so the action row cannot be pushed off a 360px screen by a long policy
 * explanation. See its header — that failure is the most-repeated layout defect
 * in this product, and this is a screen where an invisible action means the
 * customer cannot resolve a money question at all.
 */
import { useState } from 'react';
import { View } from 'react-native';

import {
  Divider,
  FormField,
  MoneyRow,
  Sheet,
  Skeleton,
  Text,
} from '@/components/ui';
import { useCancelBooking, useRefundPreview } from '@/features/account/account.queries';
import { ltr } from '@/i18n/bidi';
import { useT } from '@/i18n/useT';
import type { Booking } from '@/lib/api/endpoints/account';
import { haptics, useTheme } from '@/theme';

export function CancelBookingSheet({
  booking,
  visible,
  onClose,
  onCancelled,
}: {
  booking: Booking | null;
  visible: boolean;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Only fetch while the sheet is actually open. The figure is computed against
  // TODAY's day count, so a preview cached from when the list loaded could show
  // a refund tier the customer has already fallen out of.
  const preview = useRefundPreview(visible && booking ? booking.id : null);
  const cancel = useCancelBooking();

  /**
   * Every path out of this sheet goes through here.
   *
   * A reason typed for one booking must not survive into another's sheet, and a
   * failed attempt's error must not greet the next open. Resetting in the
   * handlers rather than in an effect on `visible` is not a lint accommodation:
   * an effect fires AFTER the close has already rendered, so the customer sees
   * their own typed reason blank itself out on the way off screen.
   */
  const close = () => {
    setReason('');
    setError(null);
    onClose();
  };

  if (!booking) return null;

  const p = preview.data;
  const checking = preview.isFetching;
  // The refund question is ANSWERED once the request has settled — either with
  // data or with the 404 that resolves to `null`. `isFetched` covers both and,
  // unlike `!isLoading`, is false before the first fetch has begun.
  const answered = preview.isFetched && !checking;
  const paidSomething = !!p && p.totalPaid > 0;

  const dayLine = p
    ? p.daysBefore === 0
      ? tr('bookings.refundToday')
      : `${tr('bookings.refundDaysPre')} ${ltr(String(p.daysBefore), isUrdu)} ${
          p.daysBefore === 1 ? tr('bookings.refundDaysPostOne') : tr('bookings.refundDaysPost')
        }`
    : null;

  const submit = () => {
    setError(null);
    haptics.light();
    cancel.mutate(
      { bookingId: booking.id, status: booking.status, reason },
      {
        onSuccess: () => {
          close();
          onCancelled();
        },
        // The server's own message when it has one — "Cannot cancel a booking
        // with status …" tells the customer more than a generic failure, and it
        // is the same sentence their vendor would read in the portal.
        onError: (e: unknown) => {
          const msg = (e as { message?: string })?.message;
          setError(msg && msg.length < 160 ? msg : tr('bookings.cancelFailed'));
        },
      },
    );
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={tr('bookings.cancelTitle')}
      resetLabel={tr('bookings.cancelKeep')}
      onReset={close}
      primaryLabel={tr('bookings.cancelConfirm')}
      onPrimary={submit}
      // Locked until the refund question has an answer. This is the guard.
      primaryDisabled={!answered || cancel.isPending}
      primaryLoading={cancel.isPending}
      error={error}
    >
      <View style={{ gap: t.spacing.lg }}>
        <Text variant="body" tone="muted" urdu={isUrdu}>
          {tr('bookings.cancelIrreversible')}
        </Text>

        {checking ? (
          <View style={{ gap: t.spacing.sm }}>
            <Text variant="caption" tone="faint" urdu={isUrdu}>
              {tr('bookings.cancelChecking')}
            </Text>
            <Skeleton height={72} radius={t.radius.xs} />
          </View>
        ) : paidSomething ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: t.colors.border,
              borderRadius: t.radius.xs,
              padding: t.spacing.lg,
              gap: 2,
            }}
          >
            <MoneyRow label={tr('bookings.refundPaidSoFar')} value={p.totalPaid} urdu={isUrdu} />
            {p.preview.forfeit > 0 ? (
              <MoneyRow
                label={tr('bookings.refundForfeited')}
                value={p.preview.forfeit}
                direction="out"
                urdu={isUrdu}
              />
            ) : null}
            <Divider />
            {/* The number the decision turns on — emphasised, and green only
                because it is money coming BACK. */}
            <MoneyRow
              label={tr('bookings.refundYouGetBack')}
              value={p.preview.refund}
              direction="in"
              emphasis
              urdu={isUrdu}
            />
            {dayLine ? (
              <Text
                variant="caption"
                tone="faint"
                urdu={isUrdu}
                style={{ marginTop: t.spacing.sm, textAlign: isUrdu ? 'right' : 'left' }}
              >
                {dayLine}
              </Text>
            ) : null}
          </View>
        ) : p ? (
          // Settled, and the server says nothing was received. Not a Rs 0 row.
          <Text variant="body" tone="muted" urdu={isUrdu}>
            {tr('bookings.cancelNothingPaid')}
          </Text>
        ) : (
          // 404 — the refund engine is off for this vendor. We do not know.
          <Text variant="body" tone="muted" urdu={isUrdu}>
            {tr('bookings.cancelPolicyUnknown')}
          </Text>
        )}

        <FormField
          label={tr('bookings.cancelReason')}
          hint={tr('bookings.cancelReasonHint')}
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={300}
          urdu={isUrdu}
        />
      </View>
    </Sheet>
  );
}
