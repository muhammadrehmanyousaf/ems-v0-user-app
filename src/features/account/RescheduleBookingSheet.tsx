/**
 * RescheduleBookingSheet — move a wedding to a different date.
 *
 * ── Why this is harder than cancel ───────────────────────────────────────
 *
 * A reschedule REPRICES. The backend recomputes the total at the new date and
 * then branches three ways:
 *
 *   newTotal == old   move it
 *   newTotal <  old   move it AND refund the difference (card first, and
 *                     whatever the card rail can't return is recorded as cash
 *                     the vendor owes)
 *   newTotal >  old   refuse with 422 `requires_top_up` and the diff
 *
 * That third branch is a BILL, not an error, and the copy says so. Presenting
 * it as "reschedule failed" would leave a couple thinking the date is
 * unavailable when it is merely dearer.
 *
 * ── Machine codes are not customer copy ──────────────────────────────────
 *
 * This endpoint answers failures with `apiResponse(res, status, false,
 * result.code, result)` — the error MESSAGE is the code. This app's convention
 * is that `error.message` is already user-facing, which is true almost
 * everywhere else and false here: following it would print the literal string
 * `requires_top_up` on a customer's screen. `rescheduleBooking` maps every
 * code to an outcome; this sheet maps every outcome to a sentence.
 *
 * ── Why availability is fetched, not assumed ─────────────────────────────
 *
 * The same calendar and slot picker the booking flow uses, against the same
 * `/bookings/availability` endpoint, so a date shown as free here means what
 * it means there. Offering a date the vendor has already sold would turn every
 * confirm into `slot_unavailable`.
 */
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Calendar, Sheet, Text, type DayAvailability } from '@/components/ui';
import { SlotPicker, type SlotSelection } from '@/features/booking/SlotPicker';
import { useVendorAvailability } from '@/features/vendors/vendors.queries';
import { ltr } from '@/i18n/bidi';
import { useT } from '@/i18n/useT';
import type { Booking } from '@/lib/api/endpoints/account';
import { rescheduleBooking, type RescheduleOutcome } from '@/lib/api/endpoints/bookingActions';
import { addMonths, shortDate, startOfMonth, to12h, today, type DayKey } from '@/lib/date';
import { haptics, layout, useTheme } from '@/theme';

/** `YYYY-MM` — what `/bookings/availability` expects. */
function monthParam(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function RescheduleBookingSheet({
  booking,
  visible,
  onClose,
  onFinished,
}: {
  booking: Booking | null;
  visible: boolean;
  onClose: () => void;
  onFinished: (outcome: RescheduleOutcome) => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const [month, setMonth] = useState(() => startOfMonth(today()));
  const [date, setDate] = useState<DayKey | null>(null);
  const [slot, setSlot] = useState<SlotSelection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessId = booking?.businessId;
  // Two months in flight so stepping forward does not stall, matching the
  // booking screen rather than inventing a second fetching strategy.
  const current = useVendorAvailability(businessId ?? 0, monthParam(month));
  const upcoming = useVendorAvailability(businessId ?? 0, monthParam(addMonths(month, 1)));

  const availability = useMemo(() => {
    const map: Record<DayKey, DayAvailability> = {};
    for (const source of [current.data, upcoming.data]) {
      for (const key of Object.keys(source ?? {})) map[key] = 'full';
    }
    // The booking's OWN date reads as full in that map, because this booking
    // is what fills it. Moving to the same date is a no-op the server would
    // reject, so leaving it marked is right — but it must not look like the
    // vendor is busy for someone else's reason.
    return map;
  }, [current.data, upcoming.data]);

  const close = () => {
    setDate(null);
    setSlot(null);
    setError(null);
    onClose();
  };

  if (!booking) return null;

  const currentWhen = ltr(
    [
      booking.eventDate ? shortDate(new Date(booking.eventDate), locale) : null,
      booking.eventTime ? to12h(booking.eventTime) : null,
    ]
      .filter(Boolean)
      .join('  ·  '),
    isUrdu,
  );

  const submit = async () => {
    if (!date || !slot) return;
    setError(null);
    setBusy(true);
    haptics.light();
    try {
      const outcome = await rescheduleBooking({
        bookingId: booking.id,
        newBookingDate: date,
        // The legacy string slot. Template-mode bookings are refused by the
        // server in v1 and are filtered out before this sheet ever opens.
        newBookingTime: slot.bookingTime,
      });
      // `slot_taken` keeps the sheet OPEN — the customer needs to pick again,
      // and closing it would make them start over from the list.
      if (outcome.kind === 'slot_taken') {
        setSlot(null);
        setError(tr('bookings.rescheduleSlotTaken'));
        return;
      }
      close();
      onFinished(outcome);
    } catch {
      setError(tr('bookings.rescheduleFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={tr('bookings.rescheduleTitle')}
      resetLabel={tr('common.close')}
      onReset={close}
      primaryLabel={tr('bookings.rescheduleConfirm')}
      onPrimary={submit}
      primaryDisabled={!date || !slot || busy}
      primaryLoading={busy}
      error={error}
    >
      <View style={{ gap: t.spacing.lg }}>
        {currentWhen ? (
          <View>
            <Text variant="caption" tone="faint" urdu={isUrdu}>
              {tr('bookings.rescheduleCurrent')}
            </Text>
            <Text variant="body" tone="primary" style={{ textAlign: isUrdu ? 'right' : 'left' }}>
              {currentWhen}
            </Text>
          </View>
        ) : null}

        {/* `scrollable={false}` — the sheet body already scrolls, and a
            vertical scroller nested in a vertical scroller never receives the
            gesture. That exact mistake produced stacked calendars twice in
            this codebase already. */}
        <Calendar
          month={month}
          monthsToRender={1}
          onMonthVisible={setMonth}
          selected={date}
          onSelect={(key) => {
            setDate(key);
            // A slot chosen for one date means nothing on another.
            setSlot(null);
          }}
          availability={availability}
          minDate={today()}
          loading={current.isLoading}
          scrollable={false}
          urdu={isUrdu}
        />

        {date ? (
          <SlotPicker selected={slot} onSelect={setSlot} urdu={isUrdu} />
        ) : (
          <Text variant="caption" tone="muted" urdu={isUrdu}>
            {tr('bookings.reschedulePickDate')}
          </Text>
        )}

        {/* The money consequence, stated before the confirm — the same reason
            the cancel sheet shows the refund figure first. */}
        <Text
          variant="caption"
          tone="faint"
          urdu={isUrdu}
          style={{ paddingTop: t.spacing.sm, borderTopWidth: layout.hairline, borderTopColor: t.colors.border }}
        >
          {tr('bookings.rescheduleNote')}
        </Text>
      </View>
    </Sheet>
  );
}
