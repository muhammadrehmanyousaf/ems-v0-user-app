/**
 * My bookings — redrawn on v4.
 *
 * Reads `GET /bookings/simple-user-bookings`. There is no `GET /bookings/:id`
 * on the customer API, so everything this screen shows has to come out of the
 * list response — which is why the detail is an inline expansion rather than a
 * route. A `/booking/[id]` screen would have nothing to fetch.
 *
 * ── Three things that were wrong, not just old ────────────────────────────
 *
 * 1. **The amount was gold.** `Money.tsx` states the rule in its header — money
 *    is never gold, because gold means "action" and a number is not an action —
 *    and this screen printed `formatRs(totalAmount)` in `tone="gold"` on every
 *    row. Now it is ink `mono`, aligned down the column with every other figure
 *    in the app.
 *
 * 2. **The chevron lied.** Tapping a booking pushed to `/vendor/{businessId}` —
 *    the vendor's marketing page. You tapped *your booking* and landed on an
 *    advert for the venue you had already booked. The row now expands in place,
 *    and "View vendor" is a labelled row inside the expansion, which is a
 *    different promise honestly made.
 *
 * 3. **`StatusTimeline` had no call site.** It existed, it was specced, and the
 *    only thing that rendered it was the component gallery. A booking list where
 *    the customer's real question is "what is waiting on me?" is the screen it
 *    was written for.
 *
 * The cards are gone with all of that: rows on paper, hairlines between them.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import {
  Badge,
  type BadgeTone,
  EmptyState,
  MoneyRow,
  ScreenHeader,
  Skeleton,
  StatusTimeline,
  Text,
  type TimelineStep,
  formatRs,
} from '@/components/ui';
import { useMyBookings } from '@/features/account/account.queries';
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import type { Booking } from '@/lib/api/endpoints/account';
import { shortDate, to12h } from '@/lib/date';
import { useAuthStore } from '@/store/auth';
import { haptics, layout, useTheme } from '@/theme';

/**
 * The backend's status vocabulary is not a closed enum on this endpoint — it
 * returns whatever the booking row holds, and that has included `Pending`,
 * `Awaiting Payment`, `Confirmed`, `Completed`, `Cancelled` and `Declined`.
 * Matching on substrings rather than equality is deliberate: an unrecognised
 * status degrades to "in progress" instead of throwing away the row.
 */
type Phase =
  | 'requested'
  | 'awaitingPayment'
  | 'confirmed'
  | 'paid'
  | 'complete'
  | 'cancelled';

/**
 * What the badge SAYS. It used to say `booking.status` verbatim — the backend's
 * own open-ended string, rendered untranslated on an Urdu screen. The phase is
 * already computed for the badge's colour; using it for the label too costs
 * nothing and closes the vocabulary. `awaitingPayment` was added rather than
 * folded into `requested` so the English wording keeps the detail it had.
 */
/** The four dots the timeline draws — not every phase is one. */
type PhaseStep = Exclude<Phase, 'cancelled' | 'awaitingPayment'>;

const PHASE_KEY: Record<Phase, StringKey> = {
  requested: 'phase.requested',
  awaitingPayment: 'phase.awaitingPayment',
  confirmed: 'phase.confirmed',
  paid: 'phase.paid',
  complete: 'phase.complete',
  cancelled: 'phase.cancelled',
};

function phaseOf(status: string | undefined, paymentStatus: string | undefined): Phase {
  const s = (status ?? '').toLowerCase();
  if (s.includes('cancel') || s.includes('declin') || s.includes('reject')) return 'cancelled';
  if (s.includes('complete') || s.includes('finish')) return 'complete';
  if (s.includes('await')) return 'awaitingPayment';
  // Whether the advance LANDED comes from `paymentStatus`, not from an amount.
  // There is no `paidAmount` on this endpoint — `downPayment` is what the
  // booking ASKS for, and reading it as money received would show every
  // unpaid booking as settled.
  const p = (paymentStatus ?? '').toLowerCase();
  const settled = p.includes('paid') || p.includes('complete') || p.includes('success');
  if (s.includes('confirm')) return settled ? 'paid' : 'confirmed';
  return 'requested';
}

function statusTone(phase: Phase): BadgeTone {
  if (phase === 'cancelled') return 'danger';
  if (phase === 'complete') return 'info';
  if (phase === 'paid' || phase === 'confirmed') return 'success';
  // Money is owed but nothing is wrong — warning, not danger.
  if (phase === 'awaitingPayment') return 'warning';
  return 'neutral';
}

function bookingTitle(b: Booking): string {
  // `Booking #212` is the last resort, not the norm. It was the norm, because
  // the field this read did not exist on the wire.
  return b.businessName ?? b.packageName ?? `Booking #${b.id}`;
}

/** `en-PK` medium date, or the raw string if the backend sent something odd. */
function fmtDate(value: unknown, locale = 'en'): string | null {
  if (!value) return null;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  // `toLocaleDateString('en-PK', …)` hardcodes the language in its own name.
  return shortDate(d, locale);
}

/**
 * The booking's life, derived from the one status string and two amounts the
 * list gives us.
 *
 * A cancelled booking is NOT the four-step rail with a red cap — it stops where
 * it stopped, and the cancellation is the last step. Showing "Event complete" as
 * a greyed future step under a cancellation reads as though it might still
 * happen.
 */
function stepsFor(b: Booking, k: (key: StringKey) => string, locale = 'en'): TimelineStep[] {
  const phase = phaseOf(b.status, b.paymentStatus);
  const created = fmtDate(b.createdAt, locale);
  const event = fmtDate(b.eventDate, locale);

  if (phase === 'cancelled') {
    return [
      { label: k('bookings.stepRequested'), timestamp: created, state: 'done' },
      { label: k('bookings.stepCancelled'), timestamp: null, state: 'failed' },
    ];
  }

  // The progression the timeline draws. `awaitingPayment` is not a step of its
  // own — it is the "requested" step with the reason spelled out on the badge —
  // so it resolves to `requested` here rather than adding a fifth dot nobody
  // moves through.
  const order: PhaseStep[] = ['requested', 'confirmed', 'paid', 'complete'];
  const at = order.indexOf(phase === 'awaitingPayment' ? 'requested' : (phase as PhaseStep));

  const labels: Record<PhaseStep, string> = {
    requested: k('bookings.stepRequested'),
    confirmed: k('bookings.stepConfirmed'),
    paid: k('bookings.stepPaid'),
    complete: k('bookings.stepComplete'),
  };

  return order.map((p, i) => ({
    label: labels[p],
    timestamp: i === 0 ? created : p === 'complete' ? event : null,
    // The step AFTER the last completed one is what the customer is waiting on,
    // and it is the only one that draws a ring.
    state: i < at ? 'done' : i === at ? 'done' : i === at + 1 ? 'current' : 'future',
    note: i === at + 1 && p === 'confirmed' ? k('bookings.stepWaitingVendor') : null,
  }));
}

export default function Bookings() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const q = useMyBookings();

  /** One expansion at a time. Two open timelines is a list of two timelines. */
  const [openId, setOpenId] = useState<number | null>(null);

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingRow
        booking={item}
        open={openId === item.id}
        onToggle={() => {
          haptics.light();
          setOpenId((cur) => (cur === item.id ? null : item.id));
        }}
      />
    ),
    [openId],
  );

  const rows = q.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('bookings.title')}
        subtitle={
          authed && rows.length
            ? `${rows.length} ${rows.length === 1 ? tr('bookings.count') : tr('bookings.countPlural')}`
            : undefined
        }
        onBack={() => router.back()}
        backLabel={tr('common.back')}
        urdu={isUrdu}
      />

      {!authed ? (
        <EmptyState
          icon="lock-closed-outline"
          title={tr('bookings.signInTitle')}
          message={tr('bookings.signInSub')}
          actionLabel={tr('common.signIn')}
          onAction={() => router.push('/auth/login')}
          urdu={isUrdu}
        />
      ) : q.isLoading ? (
        <View style={{ paddingHorizontal: layout.gutter, gap: t.spacing.xl }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={64} radius={t.radius.xs} />
          ))}
        </View>
      ) : q.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={tr('bookings.loadError')}
          actionLabel={tr('common.retry')}
          onAction={() => q.refetch()}
          urdu={isUrdu}
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(b) => String(b.id)}
          extraData={openId}
          contentContainerStyle={{
            paddingHorizontal: layout.gutter,
            paddingBottom: t.spacing.vast,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title={tr('bookings.emptyTitle')}
              message={tr('bookings.emptySub')}
              actionLabel={tr('common.exploreVendors')}
              onAction={() => router.push('/explore')}
              urdu={isUrdu}
            />
          }
        />
      )}
    </View>
  );
}

function BookingRow({
  booking,
  open,
  onToggle,
}: {
  booking: Booking;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();

  const total = booking.totalAmount ?? 0;
  const advance = booking.downPayment ?? 0;
  const hasTotal = total > 0;
  const hasAdvance = advance > 0;
  const phase = phaseOf(booking.status, booking.paymentStatus);
  const settled = phase === 'paid' || phase === 'complete';

  // "26 Aug 2026 · 6:00 PM". The date alone is not enough on a venue that runs
  // a morning nikah and an evening barat on the same day.
  // "26 Aug 2026 · 6 PM" — one Latin run with a neutral separator, isolated so
  // an Urdu paragraph cannot reorder the date and the time around the `·`.
  const when = ltr(
    [fmtDate(booking.eventDate, locale), booking.eventTime ? to12h(booking.eventTime) : null]
      .filter(Boolean)
      .join('  ·  '),
    isUrdu,
  );

  return (
    <View
      style={{
        borderBottomWidth: layout.hairline,
        borderBottomColor: t.colors.border,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={bookingTitle(booking)}
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: isUrdu ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: t.spacing.lg,
          paddingVertical: t.spacing.xl,
          backgroundColor: pressed ? t.colors.sunken : 'transparent',
        })}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            variant="h3"
            urdu={isUrdu}
            numberOfLines={2}
            style={{ textAlign: isUrdu ? 'right' : 'left' }}
          >
            {bookingTitle(booking)}
          </Text>

          {when ? (
            <Text
              variant="caption"
              tone="muted"
              numberOfLines={1}
              style={{ textAlign: isUrdu ? 'right' : 'left' }}
            >
              {when}
            </Text>
          ) : null}
          {booking.packageName && booking.businessName ? (
            <Text
              variant="caption"
              tone="faint"
              numberOfLines={1}
              style={{ textAlign: isUrdu ? 'right' : 'left' }}
            >
              {booking.packageName}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: t.spacing.sm,
              marginTop: 4,
            }}
          >
            <Badge label={tr(PHASE_KEY[phase])} tone={statusTone(phase)} urdu={isUrdu} />
            {/* Ink, not gold. See the header note — this was the money rule
                being broken on the one screen where money is the subject. */}
            {hasTotal ? (
              <Text variant="mono" tone="primary" numberOfLines={1}>
                {formatRs(total)}
              </Text>
            ) : null}
          </View>
        </View>

        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={t.colors.textFaint}
          style={{ marginTop: 4 }}
        />
      </Pressable>

      {open ? (
        <View style={{ paddingBottom: t.spacing.xl, gap: t.spacing.xl }}>
          <StatusTimeline steps={stepsFor(booking, tr, locale)} urdu={isUrdu} />

          {hasTotal ? (
            <View>
              <View
                style={{
                  height: layout.hairline,
                  backgroundColor: t.colors.border,
                  marginBottom: t.spacing.md,
                }}
              />
              <MoneyRow label={tr('booking.total')} value={total} urdu={isUrdu} />
              {hasAdvance ? (
                <>
                  {/* Green only once the advance has actually LANDED. An
                      unpaid advance is money owed, not money in, and colouring
                      it `success` would tell a customer they have paid. */}
                  <MoneyRow
                    label={settled ? tr('bookings.paid') : tr('booking.advance')}
                    value={advance}
                    direction={settled ? 'in' : 'out'}
                    urdu={isUrdu}
                  />
                  {total - advance > 0 ? (
                    <MoneyRow
                      label={settled ? tr('bookings.due') : tr('booking.balance')}
                      value={total - advance}
                      direction={settled ? 'out' : 'neutral'}
                      urdu={isUrdu}
                    />
                  ) : null}
                </>
              ) : null}
            </View>
          ) : null}

          <View
            style={{
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: t.spacing.md,
            }}
          >
            <Text variant="caption" tone="muted">
              {/* `#212` beside an Urdu word: `#` is a neutral, so bidi resolves
                  it against the paragraph and renders "212#". Isolated. */}
              {`${tr('bookings.ref')} ${ltr(`#${booking.id}`, isUrdu)}`}
            </Text>

            {booking.businessId ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  haptics.light();
                  // Typed push against the real route tree. The `as never` that
                  // used to sit on route strings in this app is what hid a
                  // push to a screen that never existed.
                  router.push({
                    pathname: '/vendor/[id]',
                    params: { id: String(booking.businessId) },
                  });
                }}
                hitSlop={8}
                style={({ pressed }) => ({
                  flexDirection: isUrdu ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 6,
                  opacity: pressed ? 0.55 : 1,
                })}
              >
                <Text variant="label" tone="primary" urdu={isUrdu}>
                  {tr('bookings.viewVendor')}
                </Text>
                <Ionicons
                  name={isUrdu ? 'arrow-back' : 'arrow-forward'}
                  size={15}
                  color={t.colors.textPrimary}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
