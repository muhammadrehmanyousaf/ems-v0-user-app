/**
 * Date helpers — pure, dependency-free, timezone-safe for calendar work.
 *
 * The app has no date-fns. That is deliberate here: every function below works
 * on a "day key" (`YYYY-MM-DD`) or a local-noon Date, never on a UTC instant.
 *
 * Why local noon: a booking date is a CALENDAR day in Pakistan, not a moment.
 * `new Date("2026-09-14")` parses as UTC midnight, which in PKT (+05:00) is
 * still 2026-09-14 05:00 — fine — but the reverse (`toISOString().slice(0,10)`
 * on a local midnight Date) silently rolls back a day for any timezone west of
 * UTC, and forward for some east of it. Anchoring at noon puts 12 hours of
 * slack on both sides of every conversion, so a day key survives the round trip
 * anywhere on earth. This is the exact bug class that makes a customer book the
 * night before their own mehndi.
 */

/** A calendar day in `YYYY-MM-DD`. The wire format the backend uses. */
export type DayKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local-noon Date for a day key. Returns null for anything unparseable. */
export function fromKey(key: DayKey): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d, 12, 0, 0, 0);
  // Reject overflow like 2026-02-31, which the Date constructor happily rolls.
  if (date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

/** `YYYY-MM-DD` for a Date, read in LOCAL time (never via toISOString). */
export function toKey(d: Date): DayKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today, anchored at local noon. */
export function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12, 0, 0, 0);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 12, 0, 0, 0);
}

export function addMonths(d: Date, n: number): Date {
  // Clamp the day so 31 Jan + 1 month is 28/29 Feb, not 2/3 March.
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1, 12, 0, 0, 0);
  const last = endOfMonth(target).getDate();
  target.setDate(Math.min(d.getDate(), last));
  return target;
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12, 0, 0, 0);
}

/** Whole days from a to b (b - a). Both anchored at noon, so DST can't skew it. */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * The 6×7 grid of days covering a month, padded with leading/trailing days from
 * the neighbouring months. Always 42 cells so the grid never changes height
 * between months — a jumping calendar reads as a bug.
 *
 * `weekStartsOn` defaults to 1 (Monday), matching how Pakistani calendars and
 * the web booking picker are laid out.
 */
export function monthGrid(month: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const first = startOfMonth(month);
  const shift = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -shift);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** Weekday initials for the header row, ordered to match `weekStartsOn`. */
export function weekdayLabels(weekStartsOn: 0 | 1 = 1, locale = 'en'): string[] {
  const en = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const ur = ['ا', 'پ', 'م', 'ب', 'ج', 'ج', 'ہ'];
  const base = locale === 'ur' ? ur : en;
  return Array.from({ length: 7 }, (_, i) => base[(i + weekStartsOn) % 7]);
}

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Gregorian months in Urdu — the calendar Pakistan actually books weddings on.
 *
 * `weekdayLabels` above already took a `locale`; `monthTitle` and `longDate`
 * never did, so the date picker — a screen whose entire job is choosing a date —
 * headed itself "August 2026" in Latin above a row of Urdu weekday initials, and
 * the booking review printed "Mon, 14 Sep 2026" under an Urdu heading.
 *
 * Digits stay Latin. That is the rule the money column, the slot hours and the
 * booking timestamps already follow, and a date is a figure.
 */
const MONTHS_UR = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
];

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_UR = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

/** "September 2026" — written out, not abbreviated: this is a headline. */
export function monthTitle(d: Date, locale = 'en'): string {
  const months = locale === 'ur' ? MONTHS_UR : MONTHS_EN;
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * "26 Aug 2026" — a list row, where the weekday is noise and the month must
 * still be a word rather than a number.
 *
 * The bookings list built this with `toLocaleDateString('en-PK', …)`, which
 * hardcodes the locale in its own name. English is unchanged; Urdu gets the
 * full month, unabbreviated, for the reason `longDate` explains.
 */
export function shortDate(d: Date, locale = 'en'): string {
  if (locale === 'ur') {
    return `${d.getDate()} ${MONTHS_UR[d.getMonth()]} ${d.getFullYear()}`;
  }
  return `${d.getDate()} ${MONTHS_EN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

/**
 * "Mon, 14 Sep 2026" — for confirmations and review screens.
 *
 * Urdu is not abbreviated: English clips to three letters because "September"
 * is long and "Sep" is universally read, but Nastaliq is cursive and a truncated
 * Urdu month is not a word — it is a broken ligature.
 */
export function longDate(d: Date, locale = 'en'): string {
  if (locale === 'ur') {
    return `${WEEKDAYS_UR[d.getDay()]}، ${d.getDate()} ${MONTHS_UR[d.getMonth()]} ${d.getFullYear()}`;
  }
  return `${WEEKDAYS_EN[d.getDay()]}, ${d.getDate()} ${MONTHS_EN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

/**
 * "19:00" → "7 PM"; "19:30" → "7:30 PM". Minutes shown only when non-zero.
 * Mirrors `to12h` in the web's lib/booking/slot-vocabulary.ts — keep in sync.
 */
export function to12h(value: string | null | undefined): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(value ?? '').trim());
  if (!m) return '';
  const h24 = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h24) || h24 > 23 || !Number.isFinite(min) || min > 59) return '';
  const suffix = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return min === 0 ? `${h12} ${suffix}` : `${h12}:${pad(min)} ${suffix}`;
}

/**
 * "19:00", "23:00" → "7 PM to 11 PM".
 *
 * The word "to", never an en-dash. Pakistani vendors were reading the dash as a
 * different symbol, so the plain word won (web Issue #46). Keep it that way.
 */
export function formatSlotRange(
  start?: string | null,
  end?: string | null,
  // "to" was a hardcoded English word in the middle of the booking screen's
  // time rows. The HOURS stay Latin — a clock reading is a figure, the same
  // rule the money column follows — but the word joining them is copy.
  to = 'to',
): string {
  const a = to12h(start);
  const b = to12h(end);
  return a && b ? `${a} ${to} ${b}` : '';
}
