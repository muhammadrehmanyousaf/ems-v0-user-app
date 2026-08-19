/**
 * AvailabilityCalendar — the vendor's open dates, on the detail screen.
 *
 * Governed by rules.md §0.0. Sheet row: `features/vendors/detail/AvailabilityCalendar.tsx`.
 *
 * ── This was a SECOND calendar, and that was the whole problem ────────────
 *
 * The app had two: the shared `components/ui/Calendar`, and this one — a private
 * 101-line grid with its own month maths, its own weekday array, its own legend
 * and its own pager. Redrawing the shared one therefore changed nothing on the
 * screen a customer actually looks at, which is exactly what the founder saw.
 *
 * It is now a thin adapter over the shared `Calendar`. One calendar in the app,
 * so one place to fix and one thing to learn.
 *
 * ── Three real defects it shipped with, all visible in a screenshot ───────
 *
 * 1. **"Sa" was clipped off the right edge.** Seven columns at `100/7`% inside a
 *    padded card whose weekday row used `justify="space-between"` — the seventh
 *    column had nowhere to go. A whole day of the week was missing from the grid.
 * 2. **The legend drew a hardcoded `15`** with a strike through it as its "Busy"
 *    swatch. A fake date, shipped as UI (prohibition 6), which read as a
 *    rendering fault rather than as a key.
 * 3. **A pager, not a scroll.** Tapping ‹ › one month at a time to find a date
 *    six months out, with a request per tap.
 *
 * The backend returns a map of BUSY dates for a month; everything absent from it
 * is open. `unknown` is never used here — a month we have fetched is fully known,
 * and marking known-open days as "unknown" would understate availability.
 *
 * ── ONE month, not six ────────────────────────────────────────────────────
 *
 * The first version of this adapter passed `monthsToRender={6}`, inheriting the
 * booking flow's continuous scroll. On a detail page that was plainly wrong and
 * it shipped: the shared calendar owns a vertical ScrollView, this page owns one
 * too, and a vertical scroller nested in a vertical scroller never receives the
 * gesture — so all six months rendered inline and the page grew six stacked
 * calendars.
 *
 * A detail page is a GLANCE: is my date free? That is one month, with a stepper
 * to look ahead. Continuous scroll belongs to the booking screen, where picking
 * the date is the entire job. Same component, two modes — `scrollable={false}`.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Calendar, Section, Text, type DayAvailability } from '@/components/ui';
import { useVendorAvailability } from '@/features/vendors/vendors.queries';
import { useT } from '@/i18n/useT';
import { addMonths, monthTitle, startOfMonth, today, toKey, type DayKey } from '@/lib/date';
import { useTheme } from '@/theme';

/** `YYYY-MM`, the shape `useVendorAvailability` expects. */
function monthParam(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function AvailabilityCalendar({ vendorId }: { vendorId: number | string }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();

  const [month, setMonth] = useState(() => startOfMonth(today()));
  const [selected, setSelected] = useState<DayKey | null>(null);
  const atFirstMonth = month.getTime() <= startOfMonth(today()).getTime();

  // Two months in flight: the one on screen and the one below it, so scrolling
  // does not stall waiting for a request the moment it comes into view.
  const current = useVendorAvailability(vendorId, monthParam(month));
  const upcoming = useVendorAvailability(vendorId, monthParam(addMonths(month, 1)));

  /**
   * Busy map → the shared calendar's vocabulary. A date the backend lists is
   * `full`; every other day in a fetched month is `open`. Nothing is left
   * `unknown`, because a month we have loaded is not unknown — and rendering a
   * known-open day as unknown would hide availability the vendor does have.
   */
  const availability: Record<DayKey, DayAvailability> = {};
  for (const source of [current.data, upcoming.data]) {
    for (const key of Object.keys(source ?? {})) availability[key] = 'full';
  }

  return (
    <Section title={tr('detail.availability')} urdu={isUrdu}>
      {/* Month stepper. Back is disabled at the current month — a vendor's past
          availability is not information a couple can act on. */}
      <View
        style={{
          flexDirection: isUrdu ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: t.spacing.sm,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr('detail.prevMonth')}
          disabled={atFirstMonth}
          hitSlop={12}
          onPress={() => setMonth((m) => addMonths(m, -1))}
          style={{ opacity: atFirstMonth ? 0.25 : 1, padding: 4 }}
        >
          <Ionicons
            name={isUrdu ? 'chevron-forward' : 'chevron-back'}
            size={20}
            color={t.colors.textPrimary}
          />
        </Pressable>

        <Text variant="h3" urdu={isUrdu}>{monthTitle(month, isUrdu ? 'ur' : 'en')}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr('detail.nextMonth')}
          hitSlop={12}
          onPress={() => setMonth((m) => addMonths(m, 1))}
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
        // ONE month. The stepper above moves it; the page owns the scrolling.
        monthsToRender={1}
        scrollable={false}
        hideMonthTitle
        selected={selected}
        onSelect={setSelected}
        availability={availability}
        minDate={today()}
        loading={current.isLoading}
        urdu={isUrdu}
      />

      <View style={{ marginTop: t.spacing.md }}>
        <Text variant="caption" tone="muted" urdu={isUrdu}>
          {selected
            ? `${tr('detail.confirmDate')} — ${selected}`
            : tr('detail.confirmDate')}
        </Text>
      </View>
    </Section>
  );
}

/** Kept so any caller importing the old helper still resolves. */
export function dateKey(y: number, m: number, d: number): DayKey {
  return toKey(new Date(y, m, d));
}
