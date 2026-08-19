/**
 * SlotPicker — spec: docs/05-UI-SPEC.md §11. Redrawn on v4.
 *
 * Renders BOTH availability engines behind one component, because a screen must
 * never care which one a vendor happens to use:
 *
 *   A. Vendor slot templates — capacity-aware, from
 *      `GET /businesses/:id/slots/availability/bulk`. Preferred when configured.
 *   B. The four legacy periods — when the vendor has no templates.
 *
 * ── The three things that have drawn blood ───────────────────────────────
 *
 * 1. **`capacity` ≠ `unitGuestCapacity`.** `capacity` counts CONCURRENT BOOKINGS
 *    the slot allows; `unitGuestCapacity` is how many guests ONE booking may
 *    bring. The vendor form once conflated them badly enough to publish
 *    "150 bookings at once". We render `free of capacity` and validate guests
 *    against `unitGuestCapacity` — never the other way round.
 *
 * 2. **Evening ends 22:00, never 23:00.** Punjab wedding halls must close by
 *    10 PM. A canonical "Evening → 23:00" shipped once, vendors copied the
 *    platform's own worked example into their templates, and 40 of 115 active
 *    slots ended past closure. Nobody noticed until a customer pressed Pay.
 *
 * 3. **Hours use the word "to", never an en-dash** — Pakistani vendors were
 *    reading the dash as a different symbol (web Issue #46).
 *
 * ── What v4 changed ───────────────────────────────────────────────────────
 *
 * This was four bordered, shadowed boxes stacked in a column — the exact "before"
 * pattern in rules.md §0.0 — and the type inside them had been shrunk to fit:
 * label 13, hours 10, capacity 9.5. Three sizes under 13px on a screen whose
 * whole job is "pick one of four", read at arm's length in a marquee tent.
 *
 * The boxes are now rows on paper, separated by hairlines, and the type comes
 * back up to the scale: `title` 16 label, `caption` 13 hours. Selection is a
 * radio on the trailing edge — ink-filled, not gold, because the gold event on
 * every screen that uses this component is the CTA underneath it, and two gold
 * events is the rule this system exists to hold.
 *
 * The rows also grew to a 64px minimum. Four choices with air between them is
 * both easier to hit and the whole point of the language.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { formatSlotRange } from '@/lib/date';
import { haptics, useTheme } from '@/theme';

/** Mirrors `slotService.availability()` — one row per (date, slotTemplate). */
export interface SlotAvailabilityRow {
  slotTemplateId: number;
  label: string;
  startTime: string;
  endTime: string;
  /** Concurrent BOOKINGS this slot allows. */
  capacity: number;
  used: number;
  free: number;
  /** Guests ONE booking may bring. NULL = no per-booking limit. */
  unitGuestCapacity?: number | null;
  /** The space this slot belongs to; NULL = venue-wide. */
  subVenueId?: number | null;
}

/**
 * The four legacy periods. Ported from the web's `LEGACY_PERIODS` — the ONLY
 * definition on the client. `value` is the stored `bookingTime` and therefore the
 * slot's IDENTITY, which is why "Whole day" is 10:00 and not 09:00: 09:00 already
 * has live bookings, and re-timing them would misrepresent real calendars.
 */
/**
 * Display text for a legacy period, keyed off `value` — the slot's IDENTITY.
 *
 * Not off `label`: that string is stored on the booking and echoed back on the
 * review and confirmation screens, so translating it in place would change what
 * gets written to production rows. Same key/display split as vendor categories
 * and the planning tools.
 */
export function legacyPeriodLabel(value: string, tr: (k: StringKey) => string): string | null {
  switch (value) {
    case '10:00':
      return tr('slot.wholeDay');
    case '09:00':
      return tr('slot.morning');
    case '12:00':
      return tr('slot.midday');
    case '18:00':
      return tr('slot.evening');
    default:
      return null;
  }
}

export const LEGACY_PERIODS = [
  { value: '10:00', label: 'Whole day', startTime: '10:00', endTime: '22:00' },
  { value: '09:00', label: 'Morning', startTime: '09:00', endTime: '12:00' },
  { value: '12:00', label: 'Midday', startTime: '12:00', endTime: '16:00' },
  // 22:00. See header note 2.
  { value: '18:00', label: 'Evening', startTime: '18:00', endTime: '22:00' },
] as const;

export interface SlotSelection {
  /** Stored on the booking as `bookingTime`. */
  bookingTime: string;
  /** Present only on the template engine; drives capacity-aware booking. */
  slotTemplateId?: number;
  label: string;
  startTime: string;
  endTime: string;
}

export interface SlotPickerProps {
  /** Template rows for the selected date. Empty/undefined → legacy periods. */
  rows?: SlotAvailabilityRow[];
  selected?: SlotSelection | null;
  onSelect: (slot: SlotSelection) => void;
  /** Current guest count, so slots that cannot hold the party are marked. */
  guestCount?: number | null;
  urdu?: boolean;
}

export function SlotPicker({ rows, selected, onSelect, guestCount, urdu }: SlotPickerProps) {
  const { t: tr } = useT();
  const usingTemplates = Array.isArray(rows) && rows.length > 0;

  if (usingTemplates) {
    return (
      <View accessibilityRole="radiogroup">
        {rows!.map((r, i) => {
          const soldOut = r.free <= 0;
          const tooSmall =
            guestCount != null && r.unitGuestCapacity != null && guestCount > r.unitGuestCapacity;
          return (
            <SlotRow
              key={r.slotTemplateId}
              label={r.label}
              hours={formatSlotRange(r.startTime, r.endTime, tr('slot.to'))}
              selected={selected?.slotTemplateId === r.slotTemplateId}
              disabled={soldOut || tooSmall}
              // Two different reasons for the same greyed row — say which.
              reason={
                soldOut
                  ? tr('slot.booked')
                  : tooSmall
                    ? `${tr('slot.upTo')} ${ltr(String(r.unitGuestCapacity), urdu)} ${tr('home.guestsRange')}`
                    : null
              }
              free={r.free}
              capacity={r.capacity}
              last={i === rows!.length - 1}
              onPress={() =>
                onSelect({
                  bookingTime: r.startTime,
                  slotTemplateId: r.slotTemplateId,
                  label: r.label,
                  startTime: r.startTime,
                  endTime: r.endTime,
                })
              }
              urdu={urdu}
            />
          );
        })}
      </View>
    );
  }

  return (
    <View accessibilityRole="radiogroup">
      {LEGACY_PERIODS.map((p, i) => (
        <SlotRow
          key={p.value}
          // Display only. `p.label` below still goes to the booking unchanged.
          label={legacyPeriodLabel(p.value, tr) ?? p.label}
          hours={formatSlotRange(p.startTime, p.endTime, tr('slot.to'))}
          selected={selected?.bookingTime === p.value && !selected?.slotTemplateId}
          last={i === LEGACY_PERIODS.length - 1}
          onPress={() =>
            onSelect({
              bookingTime: p.value,
              label: p.label,
              startTime: p.startTime,
              endTime: p.endTime,
            })
          }
          urdu={urdu}
        />
      ))}
    </View>
  );
}

/** The trailing radio. Ink, not gold — see the header note on colour events. */
function Radio({ on, disabled }: { on?: boolean; disabled?: boolean }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: t.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: on ? 0 : t.layout.hairline,
        borderColor: t.colors.borderStrong,
        backgroundColor: on ? t.colors.textPrimary : 'transparent',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {on ? <Ionicons name="checkmark" size={14} color={t.colors.onDark} /> : null}
    </View>
  );
}

function SlotRow({
  label,
  hours,
  selected,
  disabled,
  reason,
  free,
  capacity,
  last,
  onPress,
  urdu,
}: {
  label: string;
  hours: string;
  selected?: boolean;
  disabled?: boolean;
  reason?: string | null;
  free?: number;
  capacity?: number;
  last?: boolean;
  onPress: () => void;
  urdu?: boolean;
}) {
  const t = useTheme();
  const { t: tr } = useT();

  // Scarcity colour from the ratio, not a magic threshold per screen.
  const ratio = capacity && capacity > 0 && free != null ? free / capacity : null;
  const countTone =
    free != null && free <= 0 ? 'danger' : ratio != null && ratio <= 0.5 ? 'warning' : 'success';

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      accessibilityLabel={hours ? `${label}, ${hours}` : label}
      disabled={disabled}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.spacing.lg,
        // 64: four of these is 256px, which still leaves the calendar above
        // them on screen at 360×640 without the page having to scroll twice.
        minHeight: 64,
        paddingVertical: t.spacing.md,
        borderBottomWidth: last ? 0 : t.layout.hairline,
        borderBottomColor: t.colors.border,
        backgroundColor: pressed ? t.colors.sunken : 'transparent',
        opacity: disabled ? 0.42 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text
          variant="title"
          urdu={urdu}
          numberOfLines={1}
          style={{ textAlign: urdu ? 'right' : 'left' }}
        >
          {label}
        </Text>
        {hours ? (
          // Not `urdu`: "6 PM to 10 PM" is a clock reading and stays Latin in
          // both interfaces — the same rule the money column follows.
          <Text
            variant="caption"
            tone="muted"
            numberOfLines={1}
            style={{ marginTop: 2, textAlign: urdu ? 'right' : 'left' }}
          >
            {hours}
          </Text>
        ) : null}
      </View>

      <View style={{ alignItems: urdu ? 'flex-start' : 'flex-end', gap: 3 }}>
        {reason ? (
          <Text variant="caption" tone="danger" urdu={urdu} numberOfLines={1}>
            {reason}
          </Text>
        ) : free != null && capacity != null ? (
          <Text variant="mono" tone={countTone} numberOfLines={1} style={{ fontSize: 12 }}>
            {/*
              Urdu puts the capacity first — "8 میں 3 باقی" — so the two
              languages are not one template with the numbers swapped. The parts
              come from the string file; the ORDER is decided here, which is the
              only part that genuinely belongs in the component.
              `ltr` on each figure: bare numerals either side of an Urdu word are
              neutral runs and swap places without it.
            */}
            {urdu
              ? `${ltr(String(capacity), urdu)} ${tr('slot.freeOfCapacity')} ${ltr(String(free), urdu)} ${tr('slot.left')}`
              : `${free} ${tr('slot.freeOfCapacity')} ${capacity} ${tr('slot.left')}`}
          </Text>
        ) : null}
      </View>

      <Radio on={selected} disabled={disabled} />
    </Pressable>
  );
}
