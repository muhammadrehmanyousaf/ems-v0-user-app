/**
 * S7–S9 — Guests, package, and review. The step that **creates the booking**.
 *
 * Governed by rules.md §0.0. Route: `/booking/[id]/confirm?date=&time=`.
 *
 * ── Why this is one screen and not three ──────────────────────────────────
 *
 * Date and slot earned their own step because each answer changes what the next
 * one can be. Guests, package and contact details do not: they are three
 * independent answers about one booking, and splitting them across three routes
 * would add two taps and two chances to abandon without removing any confusion.
 * The flow is shaped by the DEPENDENCIES in the data, not by a preference for
 * short screens.
 *
 * ── It writes, and that is the point ──────────────────────────────────────
 *
 * `POST /bookings` against live production. The payload is assembled in
 * `endpoints/bookings.ts` from the web's verified shape — optional keys omitted
 * rather than nulled, `vendors` always an array, `slotTemplateId` only for
 * template-engine vendors.
 *
 * rules.md §3 says money rows are never written *while testing*. That governs how
 * WE verify, not what we ship: a booking flow that cannot book is not a safer
 * product, it is an unfinished one. So the write is real, and this screen is not
 * exercised end-to-end by us against production.
 *
 * ── The money ─────────────────────────────────────────────────────────────
 *
 * `totalAmount` and `downPayment` are derived from the chosen package and the
 * vendor's own `downPayment`/`downPaymentType` columns — never typed, never
 * guessed. A vendor storing "10" with type `Percentage` means 10% of the total;
 * the same 10 with type `Fixed` means Rs 10. Reading one as the other is the
 * error that reaches a customer's card, so both branches are explicit.
 */
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  FormField,
  ScreenHeader,
  Stepper,
  StickyActionBar,
  Text,
  toast,
  TotalsCard,
} from '@/components/ui';
import { PackageTiles } from '@/features/vendors/detail/PackageTiles';
import { formatRs } from '@/features/vendors/vendor-display';
import { useVendor } from '@/features/vendors/vendors.queries';
import type { VendorPackage } from '@/features/vendors/vendors.types';
import { ltr } from '@/i18n/bidi';
import { useT } from '@/i18n/useT';
import { createBooking } from '@/lib/api/endpoints/bookings';
import { apiErrorMessage } from '@/lib/api/errors';
import { fromKey, longDate, to12h } from '@/lib/date';
import { useAuthStore } from '@/store/auth';
import { layout, useTheme } from '@/theme';

/** The advance a vendor requires, resolved from their own two columns. */
function advanceFor(total: number, amount: unknown, type: unknown): number {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const isPct = String(type ?? '').toLowerCase().startsWith('per');
  // A percentage is of the total; a fixed amount is itself. Reading one as the
  // other is the error that reaches a real card.
  const value = isPct ? Math.round((total * n) / 100) : n;
  return Math.min(value, total);
}

export default function BookingConfirmScreen() {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const { id, date, time } = useLocalSearchParams<{ id: string; date: string; time: string }>();
  const user = useAuthStore((s) => s.user);

  const vendorQ = useVendor(id);
  const vendor = vendorQ.data;
  const packages = (vendor?.packages ?? []) as VendorPackage[];

  const [pkg, setPkg] = useState<VendorPackage | null>(null);

  /**
   * Guests, seated inside the venue's own limits.
   *
   * This was `useState(vendor?.minCapacity ?? 100)` — and `useState` reads its
   * argument on the FIRST render only. On the first render `vendor` is still
   * undefined, because the query has not resolved, so the count was always 100
   * and never moved when the real limits arrived. On Rehman Banquet & Lawn
   * (150–650 seated) the form opened at 100: below the venue's own minimum,
   * with the `−` button correctly disabled and the invalid number still on its
   * way into `POST /bookings`.
   *
   * The re-seat is derived during render against the previous limit rather than
   * run in an effect — an effect that setState's on query resolution is one of
   * the five shapes behind this repo's "Maximum update depth exceeded" history.
   */
  const minGuests = Number(vendor?.minCapacity ?? 0) || 1;
  const maxGuests = Number(vendor?.seatedCapacity ?? vendor?.maxCapacity ?? 0) || 2000;
  const [guests, setGuests] = useState<number>(100);
  const [seatedFor, setSeatedFor] = useState<number | null>(null);
  if (vendor && seatedFor !== minGuests) {
    setSeatedFor(minGuests);
    setGuests((g) => Math.max(minGuests, Math.min(maxGuests, g)));
  }
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [notes, setNotes] = useState('');

  const total = useMemo(() => {
    const p = Number(pkg?.price ?? 0);
    if (Number.isFinite(p) && p > 0) return p;
    const min = Number(vendor?.minimumPrice ?? 0);
    return Number.isFinite(min) && min > 0 ? min : 0;
  }, [pkg, vendor?.minimumPrice]);

  const advance = useMemo(
    () => advanceFor(total, vendor?.downPayment, vendor?.downPaymentType),
    [total, vendor?.downPayment, vendor?.downPaymentType],
  );

  /**
   * "20% of Rs 665,000" under the advance line.
   *
   * Derived from the two figures rather than read from `downPaymentType`, so it
   * cannot disagree with the number beside it: whatever `advanceFor` decided,
   * this describes. A vendor on `Fixed` gets a percentage that is still true.
   * Digits and `%` read the same in both interfaces, so there is no Urdu form —
   * but it still needs `ltr`, because Urdu bidi resolves the neutral `%` and `·`
   * against the paragraph and reorders the run. See `i18n/bidi.ts`.
   */
  const advanceNote = useMemo(
    () =>
      advance <= 0 || total <= 0
        ? undefined
        : ltr(`${Math.round((advance / total) * 100)}% · ${formatRs(total)}`, isUrdu),
    [advance, total, isUrdu],
  );

  const submit = useMutation({
    mutationFn: () =>
      createBooking({
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        // The OWNER's user id, not the business id — they are different numbers
        // on every row and the backend keys the booking to the owner.
        vendorId: Number(vendor?.vendor?.id ?? vendor?.userId ?? vendor?.id),
        bookingDate: String(date),
        bookingTime: String(time),
        guestCount: guests,
        vendors: [
          {
            businessId: Number(id),
            packageId: pkg?.id != null ? Number(pkg.id) : null,
            menuId: null,
            totalAmount: total,
            downPayment: advance,
            specialRequests: notes.trim(),
          },
        ],
      }),
    onSuccess: (booking) => {
      // Typed, not cast. An `as never` here would silence the very check that
      // caught `/booking/[id]/guests` — a route that never existed and left the
      // whole booking flow dead-ending on "Unmatched Route".
      router.replace({ pathname: '/booking/done', params: { ref: String(booking.id) } });
    },
    onError: (e) => {
      // `error.message` from the API layer is already customer-facing.
      toast.error(apiErrorMessage(e, tr));
    },
  });

  const chosen = date ? fromKey(String(date)) : null;
  const canSubmit =
    !!date && !!time && name.trim().length > 1 && phone.trim().length > 6 && email.includes('@');

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('booking.confirmTitle')}
        subtitle={
          chosen
            ? // `ltr` around the clock reading: "6 PM" is a two-token LTR run
              // separated by a bidi-neutral space, and next to a neutral "·" in
              // an RTL line it comes apart — the "PM" wrapped away from its "6"
              // and the "6" sat against the year. Isolated, it stays one thing.
              `${longDate(chosen, locale)} · ${ltr(to12h(String(time)), isUrdu)}`
            : (vendor?.name ?? undefined)
        }
        urdu={isUrdu}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: layout.gutter, paddingBottom: 160, gap: t.spacing.xxl }}
      >
        {/* Guests. The label is vendor-type aware on the backend; until that is
            wired the neutral word is used rather than a wrong specific one. */}
        <View style={{ gap: t.spacing.md }}>
          <Text variant="h2" urdu={isUrdu}>
            {tr('booking.guestsLabel')}
          </Text>
          <Stepper
            value={guests}
            onChange={setGuests}
            min={minGuests}
            max={maxGuests}
            step={10}
            urdu={isUrdu}
          />
        </View>

        {packages.length > 0 ? (
          <View style={{ gap: t.spacing.md }}>
            <Text variant="h2" urdu={isUrdu}>
              {tr('detail.packages')}
            </Text>
            <PackageTiles packages={packages} selectedId={pkg?.id ?? null} onSelect={setPkg} />
          </View>
        ) : null}

        <View style={{ gap: t.spacing.md }}>
          <Text variant="h2" urdu={isUrdu}>
            {tr('booking.yourDetails')}
          </Text>
          <FormField label={tr('booking.name')} value={name} onChangeText={setName} required />
          <FormField
            label={tr('booking.phoneLabel')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            required
          />
          <FormField
            label={tr('booking.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          <FormField
            label={tr('booking.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            hint={tr('booking.notesHint')}
          />
        </View>

        {/* What it costs. Stated before the button, never after. */}
        {/* RAW numbers, not `formatRs(total)`.
            `MoneyRow` formats internally, so passing it a pre-formatted string
            meant it ran `formatRs("Rs 665,000")` — `Number()` of that is NaN,
            and `formatRs` renders NaN as "On request". The review step showed
            "Total: On request / Advance to confirm: On request" on a booking
            whose price was sitting in the button directly underneath it. */}
        {/* The total goes in the `total` slot, not in `lines`. That slot draws
            the rule above it and sets the figure at `monoLarge` 22 against the
            line items' `mono` 14 — the hierarchy the old bordered box was
            standing in for. Everything below the rule is settlement: what is
            due now, and what is not. A customer looking at Rs 665,000 wants to
            know immediately that they are not being asked for Rs 665,000
            today, and the balance line is the only thing that says so. */}
        <TotalsCard
          title={tr('booking.costTitle')}
          lines={[
            {
              label: pkg ? (pkg.name ?? tr('booking.pkgLine')) : tr('booking.startingLine'),
              value: total,
            },
          ]}
          total={{ label: tr('booking.total'), value: total }}
          settlement={
            advance > 0
              ? [
                  { label: tr('booking.advance'), value: advance, note: advanceNote },
                  { label: tr('booking.balance'), value: total - advance },
                ]
              : undefined
          }
          urdu={isUrdu}
        />

        <Text variant="caption" tone="muted" urdu={isUrdu}>
          {tr('booking.requestNote')}
        </Text>
      </ScrollView>

      <StickyActionBar
        primaryLabel={tr('booking.requestBooking')}
        primaryIcon="checkmark"
        primaryMeta={total > 0 ? formatRs(total) : undefined}
        primaryDisabled={!canSubmit}
        primaryLoading={submit.isPending}
        onPrimaryPress={() => submit.mutate()}
        urdu={isUrdu}
      />
    </View>
  );
}
