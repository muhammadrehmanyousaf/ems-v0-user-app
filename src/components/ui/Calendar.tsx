/**
 * Calendar — **v4. The date grid, redrawn.**
 *
 * Governed by rules.md §0.0. Sheet row: `components/ui/Calendar.tsx`.
 * Continuous vertical scroll, one block per month, sticky weekday header.
 *
 * ── What changed from v3, and why each one matters ────────────────────────
 *
 * **1. The day cell stopped being a box.** v3 drew every selectable day as a
 * bordered, tinted, rounded square — 42 boxes per month, three months on screen,
 * so a hundred and twenty six boxes to choose one date. v4 draws bare numerals
 * on paper. The only day that gets a shape is the SELECTED one, which is a solid
 * ink disc. Selection is now unmistakable because it is the single filled object
 * in the grid, rather than one tint among many.
 *
 * **2. Availability moved from fills to a dot.** Colouring the whole cell meant
 * the grid was a patchwork and the *number* — the thing you are actually reading
 * — was the least visible part of it. A 5px dot under the numeral says the same
 * thing and leaves the date legible. This also fixes a real defect carried from
 * v3: the dot was `disabled ? null : colour`, and `full`/`blocked` are exactly
 * what disables a day, so the legend advertised a "Booked" colour the grid was
 * incapable of drawing. Dots are now suppressed only for out-of-month and
 * out-of-window days, where we genuinely have nothing to say.
 *
 * **3. Out-of-window days stay legible.** A greyed date you can still read tells
 * you the vendor needs more notice; a blank cell just looks broken.
 *
 * **4. The header sticks.** Scrolling three months of dates with the weekday
 * letters off-screen makes every row a counting exercise.
 *
 * **5. Today is a ring, not a fill.** A filled "today" competes with the filled
 * "selected" and the two are constantly confused. Ring = where you are, fill =
 * what you chose.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import {
  addMonths,
  fromKey,
  longDate,
  isSameDay,
  isSameMonth,
  monthGrid,
  monthTitle,
  startOfMonth,
  today,
  toKey,
  weekdayLabels,
  type DayKey,
} from '@/lib/date';
import { haptics, layout, useTheme } from '@/theme';

import { Skeleton } from './Skeleton';
import { Text } from './Text';

export type DayAvailability = 'open' | 'limited' | 'full' | 'blocked' | 'unknown';

export interface CalendarProps {
  /** First month to render. Only month+year are read. */
  month: Date;
  /** How many months to render below it. Continuous scroll, no pager. */
  monthsToRender?: number;
  /** Fired when a new month scrolls into view, so the parent can prefetch. */
  onMonthVisible?: (month: Date) => void;
  selected?: DayKey | null;
  onSelect: (key: DayKey) => void;
  /** Per-day state, keyed `YYYY-MM-DD`. Omit for "not checked". */
  availability?: Record<DayKey, DayAvailability>;
  /** Earliest bookable day — the vendor's `minLeadDays` floor. Defaults to today. */
  minDate?: Date;
  /** Latest bookable day — the vendor's `maxLeadDays` ceiling. */
  maxDate?: Date;
  loading?: boolean;
  hideLegend?: boolean;
  urdu?: boolean;
  /**
   * Own the vertical scroll. **Default true** — correct for a full-screen date
   * picker, wrong anywhere else.
   *
   * Pass `false` when the calendar sits inside a page that already scrolls. A
   * vertical ScrollView nested in a vertical ScrollView cannot work: the inner
   * one never receives the gesture, so every month renders inline and the host
   * page simply grows by however many months were asked for. That is exactly
   * how the vendor detail screen ended up with six stacked month grids.
   */
  scrollable?: boolean;
  /** Suppress the per-block month heading — for hosts that render their own. */
  hideMonthTitle?: boolean;
}

const CELL = 44; // the tap-target floor, and the grid module

export function Calendar({
  month,
  monthsToRender = 12,
  onMonthVisible,
  selected,
  onSelect,
  availability,
  minDate,
  maxDate,
  loading,
  hideLegend,
  urdu,
  scrollable = true,
  hideMonthTitle,
}: CalendarProps) {
  const t = useTheme();
  const now = today();
  const floor = minDate ?? now;

  const months = useMemo(
    () => Array.from({ length: monthsToRender }, (_, i) => addMonths(startOfMonth(month), i)),
    [month, monthsToRender],
  );

  const { t: tr } = useT();
  const weekdays = weekdayLabels(1, urdu ? 'ur' : 'en');

  /** Availability reads as a dot, and only where we have something to say. */
  const dotColor: Record<DayAvailability, string | null> = {
    open: t.colors.success,
    limited: t.colors.warning,
    full: t.colors.danger,
    blocked: t.colors.danger,
    unknown: null,
  };

  if (loading) {
    return (
      <View style={{ gap: t.spacing.md }}>
        <Skeleton height={20} width="45%" />
        <Skeleton height={CELL * 6} radius={t.radius.lg} />
      </View>
    );
  }

  return (
    <View>
      {/* Sticky weekday header — scrolling months without it turns every row
          into a counting exercise. */}
      <View
        style={{
          flexDirection: 'row',
          paddingBottom: t.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.border,
          backgroundColor: t.colors.screen,
        }}
      >
        {weekdays.map((w, i) => (
          <View key={`${w}-${i}`} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
              {w}
            </Text>
          </View>
        ))}
      </View>

      <MonthList
        scrollable={scrollable}
        onMomentumScrollEnd={(e) => {
          if (!onMonthVisible) return;
          // Each block is a header plus six rows — enough to know which month
          // the viewport has landed on without measuring every child.
          const blockH = CELL * 6 + 64;
          const idx = Math.max(0, Math.min(months.length - 1, Math.round(e.nativeEvent.contentOffset.y / blockH)));
          onMonthVisible(months[idx]);
        }}
      >
        {months.map((m) => {
          const grid = monthGrid(m, 1);
          return (
            <View key={toKey(m)} style={{ paddingTop: hideMonthTitle ? t.spacing.sm : t.spacing.xxl }}>
              {/* The month name is a real heading, not a tracked label. Hidden
                  when the host already names the month above its own stepper —
                  otherwise the month appears twice, six pixels apart. */}
              {hideMonthTitle ? null : (
                <Text variant="h3" urdu={urdu} style={{ marginBottom: t.spacing.md }}>
                  {/* The weekday row two lines down already took the locale; this
                      headline did not, so "August 2026" sat in Latin above
                      Urdu weekday initials on the date picker. */}
                  {monthTitle(m, urdu ? 'ur' : 'en')}
                </Text>
              )}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {grid.map((d) => {
                  const key = toKey(d);
                  const outside = !isSameMonth(d, m);
                  const beforeFloor = d < floor && !isSameDay(d, floor);
                  const afterCeiling = maxDate ? d > maxDate : false;
                  const outOfWindow = beforeFloor || afterCeiling;
                  const state = availability?.[key] ?? 'unknown';
                  const blocked = state === 'full' || state === 'blocked';
                  const disabled = outside || outOfWindow || blocked;
                  const isSelected = selected === key;
                  const isToday = isSameDay(d, now);

                  // Suppressed only where we have nothing to say. A booked day
                  // keeps its red dot — "this date is taken" is the most useful
                  // thing the grid can tell a couple.
                  const dot = outside || outOfWindow ? null : dotColor[state];

                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected, disabled }}
                      /* `key` is the ISO day, e.g. "2026-08-26" — a storage
                         format read aloud as a storage format. A screen-reader
                         user picking a wedding date heard "two thousand and
                         twenty six dash zero eight dash twenty six", 42 times
                         down a grid. `longDate` already knows how to say it, and
                         now says it in the right language too. The availability
                         state goes with it: the dot is colour-only otherwise. */
                      accessibilityLabel={dayLabel(key, state, outside || outOfWindow, urdu, tr)}
                      disabled={disabled}
                      onPress={() => {
                        haptics.selection();
                        onSelect(key);
                      }}
                      style={{
                        width: `${100 / 7}%`,
                        height: CELL,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* The ONLY shape in the grid: the selected day. Ink, not
                          gold — choosing a date is a state, and the gold is
                          spent on the action that confirms it. */}
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected ? t.colors.textPrimary : 'transparent',
                          // Today is a RING. A filled today competes with the
                          // filled selection and the two get confused.
                          borderWidth: isToday && !isSelected ? 1 : 0,
                          borderColor: t.colors.borderStrong,
                        }}
                      >
                        <Text
                          variant="body"
                          style={{
                            fontFamily: t.fontFamily.monoMedium,
                            fontSize: 14,
                            color: isSelected
                              ? t.colors.onDark
                              : outside
                                ? 'transparent'
                                : disabled
                                  ? t.colors.textFaint
                                  : t.colors.textPrimary,
                            // Struck through, not hidden: a date you can still
                            // read tells you the vendor needs more notice.
                            textDecorationLine: outOfWindow && !outside ? 'line-through' : 'none',
                          }}
                        >
                          {d.getDate()}
                        </Text>
                      </View>

                      {/* Height always occupied, so a row cannot shift by 5px
                          when a dot appears (rules.md §4.9). */}
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 2.5,
                          marginTop: 2,
                          backgroundColor: dot ?? 'transparent',
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </MonthList>

      {hideLegend ? null : (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: t.spacing.lg,
            paddingTop: t.spacing.lg,
            marginTop: t.spacing.md,
            borderTopWidth: 1,
            borderTopColor: t.colors.border,
          }}
        >
          <LegendDot color={t.colors.success} label={tr('cal.available')} urdu={urdu} />
          <LegendDot color={t.colors.warning} label={tr('cal.limited')} urdu={urdu} />
          <LegendDot color={t.colors.danger} label={tr('cal.booked')} urdu={urdu} />
        </View>
      )}
    </View>
  );
}

/**
 * Scrolls the months, or does not. Keeping this as one component means the grid
 * body is written once and neither mode can drift from the other.
 */
function MonthList({
  scrollable,
  onMomentumScrollEnd,
  children,
}: {
  scrollable: boolean;
  onMomentumScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  children: React.ReactNode;
}) {
  if (!scrollable) return <View>{children}</View>;
  return (
    <ScrollView showsVerticalScrollIndicator={false} onMomentumScrollEnd={onMomentumScrollEnd}>
      {children}
    </ScrollView>
  );
}

function LegendDot({ color, label, urdu }: { color: string; label: string; urdu?: boolean }) {
  return (
    <View style={{ flexDirection: urdu ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <Text variant="caption" tone="muted" urdu={urdu}>
        {label}
      </Text>
    </View>
  );
}

/** Used by the mode switcher on the booking screen. */
export const CALENDAR_MODE_ICON: keyof typeof Ionicons.glyphMap = 'calendar-outline';

/** Re-exported so screens can size their own containers to the grid module. */
export const CALENDAR_CELL = CELL;
export const CALENDAR_GUTTER = layout.gutter;

/**
 * What a day cell says out loud: the date, then whether it can be booked.
 */
function dayLabel(
  key: DayKey,
  state: DayAvailability,
  quiet: boolean,
  urdu: boolean | undefined,
  tr: (k: StringKey) => string,
): string {
  const d = fromKey(key);
  const date = d ? longDate(d, urdu ? 'ur' : 'en') : key;
  // `unknown` says nothing extra rather than guessing — the same rule the dot
  // follows, and a date announced as "available" when nobody checked is worse
  // than a date announced as itself.
  if (quiet || state === 'unknown') return date;
  if (state === 'full' || state === 'blocked') return `${date}, ${tr('cal.booked')}`;
  if (state === 'limited') return `${date}, ${tr('cal.limited')}`;
  return `${date}, ${tr('cal.available')}`;
}
