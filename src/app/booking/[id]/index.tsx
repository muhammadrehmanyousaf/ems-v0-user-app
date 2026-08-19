/**
 * S6 — Date and slot. The first step of the booking flow.
 *
 * Governed by rules.md §0.0. Spec: docs/04-SCREEN-SPECS.md §S6.
 * Route: `/booking/[id]` where `id` is the BUSINESS id.
 *
 * ── Why this screen exists at all ─────────────────────────────────────────
 *
 * Vendor detail's primary action opened a modal that asked for everything at
 * once — date, guests, package, message — in a scrolling sheet. That is a form,
 * not a flow, and it fails in the specific way Pakistani wedding booking fails:
 * the answer to "which date" changes which slots exist, which changes what the
 * venue can hold, which changes the package. Asking all four together means
 * every answer is provisional until the last one lands.
 *
 * So the flow is a flow. This is step one, and it does exactly one thing.
 *
 * ── The two engines ───────────────────────────────────────────────────────
 *
 * The backend has two availability systems and a booking screen has to speak
 * both. Vendors on the template engine expose capacity-aware slot rows with a
 * `slotTemplateId`; everyone else falls back to the four legacy periods. That
 * decision lives entirely inside `SlotPicker` — this screen passes rows if it
 * has them and nothing if it does not, and never branches on which engine a
 * vendor is using.
 *
 * ── What it will not do ───────────────────────────────────────────────────
 *
 * It does not write. Nothing here creates a booking, holds a date, or touches a
 * money row — rules.md forbids writing money rows while testing, and the
 * remaining steps (guests, packages, review, pay) do not exist yet. The CTA
 * carries the selection forward as route params, so the flow can be finished
 * step by step without this screen changing.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';


import { Calendar, ScreenHeader, StickyActionBar, Text } from '@/components/ui';
import type { DayAvailability } from '@/components/ui';
import { SlotPicker, type SlotSelection } from '@/features/booking/SlotPicker';
import { useVendor, useVendorAvailability } from '@/features/vendors/vendors.queries';
import { useT } from '@/i18n/useT';
import { addMonths, fromKey, longDate, monthTitle, startOfMonth, today, type DayKey } from '@/lib/date';
import { haptics, layout, useTheme } from '@/theme';


/** `YYYY-MM`, the shape `useVendorAvailability` expects. */
function monthParam(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function BookingDateScreen() {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();

  const vendorQ = useVendor(id);
  const vendor = vendorQ.data;

  const [month, setMonth] = useState(() => startOfMonth(today()));
  const [date, setDate] = useState<DayKey | null>(null);
  const [slot, setSlot] = useState<SlotSelection | null>(null);

  // Two months in flight, so scrolling into the next one does not stall.
  const current = useVendorAvailability(id, monthParam(month));
  const upcoming = useVendorAvailability(id, monthParam(addMonths(month, 1)));

  /**
   * Busy map → the calendar's vocabulary. A date the backend lists is `full`;
   * everything else in a fetched month is open. Nothing is left `unknown`,
   * because a month we have loaded is not unknown, and showing a known-open day
   * as unknown would hide availability the vendor actually has.
   */
  const availability = useMemo(() => {
    const map: Record<DayKey, DayAvailability> = {};
    for (const source of [current.data, upcoming.data]) {
      for (const key of Object.keys(source ?? {})) map[key] = 'full';
    }
    return map;
  }, [current.data, upcoming.data]);

  /**
   * The vendor's lead-time window. `minLeadDays` is the notice they need;
   * `maxLeadDays` is how far ahead they will take a booking. Both are real
   * columns, and both are commonly null — in which case there is no bound and
   * we must not invent one.
   */
  const minDate = useMemo(() => {
    const lead = Number(vendor?.minLeadDays ?? 0);
    if (!Number.isFinite(lead) || lead <= 0) return today();
    const d = today();
    d.setDate(d.getDate() + lead);
    return d;
  }, [vendor?.minLeadDays]);

  const maxDate = useMemo(() => {
    const lead = Number(vendor?.maxLeadDays ?? 0);
    if (!Number.isFinite(lead) || lead <= 0) return undefined;
    const d = today();
    d.setDate(d.getDate() + lead);
    return d;
  }, [vendor?.maxLeadDays]);

  const chosen = date ? fromKey(date) : null;

  /** Never step back past the current month — there is nothing to book there. */
  const atFirstMonth =
    month.getFullYear() === today().getFullYear() && month.getMonth() === today().getMonth();

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('booking.dateTitle')}
        subtitle={vendor?.name ?? undefined}
        urdu={isUrdu}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: layout.gutter, paddingBottom: 140 }}
      >
        {/*
          ONE month with a stepper — the same contract the detail screen uses.

          This passed `monthsToRender={3}`, so the page rendered three whole
          calendar grids stacked on top of each other and the customer scrolled
          past September and October to get back to a date in August.
          `AvailabilityCalendar`'s header already documents this exact mistake at
          six months: *"a vertical scroller nested in a vertical scroller never
          receives the gesture — so all six months rendered inline and the page
          grew six stacked calendars."* The fix was applied there and not here,
          so the booking screen kept a smaller version of the same defect.

          Picking a date is a question about ONE month at a time. The stepper
          answers it in one tap instead of a scroll.
        */}
        <View
          style={{
            flexDirection: isUrdu ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.spacing.md,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('detail.prevMonth')}
            disabled={atFirstMonth}
            hitSlop={12}
            onPress={() => {
              haptics.selection();
              setMonth((m) => startOfMonth(addMonths(m, -1)));
            }}
            style={{ opacity: atFirstMonth ? 0.25 : 1, padding: 4 }}
          >
            <Ionicons
              name={isUrdu ? 'chevron-forward' : 'chevron-back'}
              size={20}
              color={t.colors.textPrimary}
            />
          </Pressable>

          <Text variant="h3" urdu={isUrdu}>
            {monthTitle(month, locale)}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('detail.nextMonth')}
            hitSlop={12}
            onPress={() => {
              haptics.selection();
              setMonth((m) => startOfMonth(addMonths(m, 1)));
            }}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={isUrdu ? 'chevron-back' : 'chevron-forward'}
              size={20}
              color={t.colors.textPrimary}
            />
          </Pressable>
        </View>

        <Calendar
          month={month}
          monthsToRender={1}
          scrollable={false}
          hideMonthTitle
          selected={date}
          onSelect={(key) => {
            setDate(key);
            // A slot chosen for one date is meaningless on another: clearing it
            // is what stops a customer carrying "Evening" from a full Saturday
            // onto a Tuesday where that slot does not exist.
            setSlot(null);
          }}
          availability={availability}
          minDate={minDate}
          maxDate={maxDate}
          loading={current.isLoading}
          urdu={isUrdu}
        />

        {chosen ? (
          <View style={{ marginTop: t.spacing.xxl, gap: t.spacing.lg }}>
            <Text variant="h2" urdu={isUrdu}>
              {longDate(chosen, locale)}
            </Text>
            {/* `rows` is undefined until the slot-template endpoint is wired, so
                SlotPicker falls back to the four legacy periods — which is what
                the overwhelming majority of vendors are on anyway. */}
            <SlotPicker selected={slot} onSelect={setSlot} urdu={isUrdu} />
          </View>
        ) : (
          <Text variant="body" tone="muted" urdu={isUrdu} style={{ marginTop: t.spacing.xxl }}>
            {tr('booking.pickDateFirst')}
          </Text>
        )}
      </ScrollView>

      <StickyActionBar
        primaryLabel={tr('booking.continue')}
        primaryIcon="arrow-forward"
        primaryMeta={slot?.label}
        primaryDisabled={!date || !slot}
        onPrimaryPress={() => {
          if (!date || !slot) return;
          /**
           * `/confirm`, not `/guests`.
           *
           * This pushed to `/booking/[id]/guests`, a route that has never
           * existed — the only two are `index` and `confirm`. So the booking
           * flow dead-ended on "Unmatched Route" the moment anybody picked a
           * date and a slot, which is to say **nobody has ever been able to
           * book from this app**.
           *
           * It survived because of the `as never` that used to sit on the end
           * of this template literal. `typedRoutes` is on, so the compiler
           * knows every real route and would have rejected `/guests` on the
           * spot; the cast is precisely what silenced the check that existed to
           * catch this. It is gone, and this line is now type-checked against
           * the real route tree.
           *
           * Nothing is written here — no hold, no booking, no money row.
           */
          router.push({
            pathname: '/booking/[id]/confirm',
            params: { id: String(id), date, time: slot.bookingTime },
          });
        }}
        urdu={isUrdu}
      />
    </View>
  );
}
