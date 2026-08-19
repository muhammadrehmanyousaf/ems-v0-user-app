/**
 * VendorSpecs — the per-vendor-type detail table the app was missing.
 *
 * Governed by rules.md §0.0.
 *
 * ── The gap this closes ───────────────────────────────────────────────────
 *
 * The founder's complaint was that vendor detail is "incomplete" next to the
 * website, and reading `ems-v0/components/VendorDetails/VendorDetailsMobile.tsx`
 * (2,961 lines) showed exactly what he meant. The web builds a spec table whose
 * ROWS CHANGE BY VENDOR TYPE — a venue shows in-house catering, parking, food
 * tasting, waiter service, crockery, seating and sound; a mehndi artist shows
 * whether they sell products and whether they bring a team; a stationery vendor
 * shows turnaround and minimum order.
 *
 * The app showed a four-item `SpecStrip` and an amenity chip cloud. So a couple
 * comparing two marquees could not learn from this screen whether either one
 * provides seating or lets you bring your own caterer — which is most of what
 * actually separates two marquees.
 *
 * ── The rule that makes this safe on unclaimed listings ───────────────────
 *
 * **A null column renders nothing.** Not "Not specified", not a greyed row —
 * nothing. ~98% of listings are unclaimed OSM imports where most of these
 * columns are null, and a table of twelve "Not specified" rows tells a customer
 * less than a table of three real ones while implying the vendor is evasive.
 *
 * Booleans are the subtle case: `false` is REAL INFORMATION ("no in-house
 * catering" is a fact a couple needs) while `null` means nobody has said. So the
 * check is `!= null`, never truthiness — treating `false` as absent would hide
 * exactly the answers that rule a vendor out.
 */
import { View } from 'react-native';

import { Section, Text } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

import type { Vendor } from '../vendors.types';

type Row = { label: string; value: string };

/** "Available" / "Not available" for a real boolean; null when unanswered. */
function yesNo(v: unknown, yes: string, no: string): string | null {
  if (v == null) return null;
  return v ? yes : no;
}

/**
 * Build the rows for this vendor's type.
 *
 * The backend reuses a handful of generic boolean columns across every vendor
 * type — `provideWaiter` means "waiter service" for a caterer and "envelope
 * included" for a stationery vendor. That is why the label table is keyed by
 * type rather than by column: the same field genuinely means different things,
 * and the web does the same mapping. Do not "simplify" this into one list.
 */
function buildRows(v: Vendor, tr: (k: never) => string): Row[] {
  const type = v.vendor?.vendorType ?? '';
  const rows: Row[] = [];
  const push = (label: string, value: string | null) => {
    if (value) rows.push({ label, value });
  };

  const YES = 'Available';
  const NO = 'Not available';
  const INC = 'Included';
  const NOT_INC = 'Not included';

  // ── Shared: the facts every vendor type can carry ──────────────────────
  const seats = v.seatedCapacity ?? v.comfortCapacity ?? v.maxCapacity ?? null;
  if (seats && seats > 0) {
    const min = v.minCapacity && v.minCapacity > 0 && v.minCapacity < seats ? v.minCapacity : null;
    push('Guest capacity', min ? `${min}–${seats} guests` : `Up to ${seats} guests`);
  }
  if (v.yearsInBusiness && v.yearsInBusiness > 0) {
    push('Years in business', `${v.yearsInBusiness}`);
  }
  if (v.weddingsCompleted && v.weddingsCompleted > 0) {
    push('Weddings hosted', `${v.weddingsCompleted}`);
  }

  // ── Type-specific. Same columns, different meanings — see the note above.
  if (type === 'Wedding venue') {
    push('In-house catering', yesNo(v.catering, YES, NO));
    push(
      'Car parking',
      v.carParkingCapacity && v.carParkingCapacity > 0
        ? `${v.carParkingCapacity} cars`
        : yesNo(v.parking, YES, NO),
    );
    push('Food tasting', yesNo(v.provideFoodTesting, YES, NO));
    push('Waiter service', yesNo(v.provideWaiter, INC, NOT_INC));
    push('Crockery and plates', yesNo(v.providePlate, 'Provided', 'Not provided'));
    push('Seating arrangement', yesNo(v.provideSeatingArrangement, 'Provided', 'Not provided'));
    push('Sound system', yesNo(v.provideSoundSystem, YES, NO));
    push('Outside vendors', yesNo(v.outsideVendorsAllowed, 'Allowed', 'Not allowed'));
    push('One-dish policy', yesNo(v.oneDishPolicy, 'Applies', 'Does not apply'));
  } else if (type === 'Catering') {
    push('Food tasting', yesNo(v.provideFoodTesting, YES, NO));
    push('Waiter service', yesNo(v.provideWaiter, INC, NOT_INC));
    push('Crockery and plates', yesNo(v.providePlate, 'Provided', 'Not provided'));
    push('Travel to venue', yesNo(v.travelToClientHome, YES, NO));
  } else if (type === 'Henna artist') {
    push('Sells mehndi products', yesNo(v.sellMehndi, 'Yes', 'No'));
    push('Brings a team', yesNo(v.hasTeam, 'Yes', 'No'));
    push('Travel to client', yesNo(v.travelToClientHome, YES, NO));
  } else if (type === 'Decorator') {
    push('Provides decoration items', yesNo(v.provideDecorationItem, 'Yes', 'No'));
    push('Travel to venue', yesNo(v.travelToClientHome, YES, NO));
  } else {
    // Photographers, makeup, and the rest: travel is the question that decides
    // whether they can work your event at all.
    push('Travel to client', yesNo(v.travelToClientHome, YES, NO));
    push('Brings a team', yesNo(v.hasTeam, 'Yes', 'No'));
  }

  // ── Commercial terms. These decide affordability, so they go last but they
  //    do go in — the web surfaces them and the app never has. ─────────────
  if (v.downPayment != null && Number(v.downPayment) > 0) {
    const isPct = String(v.downPaymentType ?? '').toLowerCase().startsWith('per');
    push('Advance required', isPct ? `${Number(v.downPayment)}%` : `Rs ${Number(v.downPayment).toLocaleString('en-PK')}`);
  }
  push('Tax invoice', yesNo(v.providesTaxInvoice, 'Provided', 'Not provided'));

  const langs = Array.isArray(v.languagesSpoken) ? v.languagesSpoken.filter(Boolean) : [];
  if (langs.length) push('Languages', langs.join(', '));

  return rows;
}

export function VendorSpecs({ vendor }: { vendor: Vendor }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const rows = buildRows(vendor, tr as never);

  // Nothing known → no section at all. A "Details" heading over an empty table
  // is worse than silence: it frames the absence.
  if (rows.length === 0) return null;

  return (
    <Section title={tr('detail.specs')} urdu={isUrdu}>
      <View>
        {rows.map((r, i) => (
          <View
            key={r.label}
            style={{
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: t.spacing.lg,
              paddingVertical: t.spacing.md,
              // A rule between rows, none after the last — a trailing hairline
              // reads as a section that got cut off.
              borderBottomWidth: i < rows.length - 1 ? 1 : 0,
              borderBottomColor: t.colors.border,
            }}
          >
            <Text variant="body" tone="muted" urdu={isUrdu} style={{ flex: 1 }}>
              {r.label}
            </Text>
            {/* The value is the answer, so it carries the weight. Right-aligned
                so a column of answers scans down the page. */}
            <Text
              variant="bodyMedium"
              urdu={isUrdu}
              align={isUrdu ? 'left' : 'right'}
              style={{ flexShrink: 1 }}
            >
              {r.value}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}
