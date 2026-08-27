/**
 * Bookings — creating a real booking against live production.
 *
 * ── Read this before changing the payload ─────────────────────────────────
 *
 * The shape below is copied byte-for-byte from
 * `ems-v0/docs/CUSTOMER-SURFACE.md §3.5`, which was itself verified against
 * `components/booking/booking-form.tsx`. It is not a guess and it is not a
 * simplification of the web's payload — it IS the web's payload.
 *
 * Three rules the backend enforces, each of which fails in a way that is hard to
 * debug from the client:
 *
 * 1. **Optional fields are OMITTED, never sent as `null`.** The web builds the
 *    object conditionally for exactly this reason, and a booking with
 *    `guestCount: null` is not the same request as one without the key.
 * 2. **`vendors` is an array with at least one entry**, even for a single-vendor
 *    booking. The backend models every booking as a cart.
 * 3. **`slotTemplateId` appears ONLY for vendors on the template engine.** The
 *    backend rejects mixed-mode carts — some entries with a template, some
 *    without — so it is included per-entry or not at all.
 *
 * ── Money ─────────────────────────────────────────────────────────────────
 *
 * `totalAmount` and `downPayment` are plain numbers in rupees, not minor units.
 * Stripe's integer-cents convention applies at the payment boundary, not here.
 * Sending 76000 when you mean Rs 760 is the kind of error that reaches a real
 * customer's card, so both are computed from the package/menu row rather than
 * typed by hand anywhere in the UI.
 *
 * ── This writes to production ─────────────────────────────────────────────
 *
 * There is no staging. `createBooking` creates a real booking row on the system
 * taking real money. rules.md: reads are free, writes are deliberate, and
 * **money rows are never written while testing** — the flow is built and shipped
 * so a customer can complete it; it is not exercised end-to-end by us.
 */
import { api } from '@/lib/api/client';

export interface BookingVendorEntry {
  businessId: number;
  packageId?: number | null;
  menuId?: number | null;
  totalAmount: number;
  downPayment: number;
  specialRequests?: string;
  /** ONLY for template-engine vendors. Never mix within one cart. */
  slotTemplateId?: number;
  /**
   * WW-APPSPACE — which hall this line is booked into.
   *
   * The backend resolves a line's space from an explicit `subVenueId` first,
   * then from `resourceId`, then — only when the venue has exactly one bookable
   * space — automatically. A multi-space venue with no pick stays UNASSIGNED,
   * and an unassigned booking blocks every hall on the availability grid,
   * because the system will not guess which hall a wedding is in.
   *
   * Omitted, not null, when there is nothing to name.
   */
  subVenueId?: number;
}

export interface CreateBookingInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** `venue.vendor.id ?? venue.id` — the OWNER's user id, not the business id. */
  vendorId: number;
  /** `YYYY-MM-DD`. */
  bookingDate: string;
  /** Slot identity, e.g. "18:00". */
  bookingTime: string;
  vendors: BookingVendorEntry[];
  guestCount?: number;
  serviceLocationMode?: 'at_vendor' | 'at_customer' | string;
  serviceLocationAddress?: string;
  serviceLocationNotes?: string;
}

export interface CreatedBooking {
  id: number;
  status?: string;
  [key: string]: unknown;
}

/**
 * Create a booking.
 *
 * Every optional key is stripped before sending — see rule 1 above. Doing it
 * here, once, means no screen has to remember it, and a screen that passes
 * `guestCount: undefined` produces the same request as one that omits it.
 */
export async function createBooking(input: CreateBookingInput): Promise<CreatedBooking> {
  const body: Record<string, unknown> = {
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    vendorId: input.vendorId,
    bookingDate: input.bookingDate,
    bookingTime: input.bookingTime,
    vendors: input.vendors.map((v) => {
      const entry: Record<string, unknown> = {
        businessId: Number(v.businessId),
        packageId: v.packageId != null ? Number(v.packageId) : null,
        menuId: v.menuId != null ? Number(v.menuId) : null,
        totalAmount: Number(v.totalAmount),
        downPayment: Number(v.downPayment),
        specialRequests: v.specialRequests ?? '',
      };
      // Present only when this vendor is on the template engine.
      if (v.slotTemplateId != null) entry.slotTemplateId = Number(v.slotTemplateId);
      // Present only when a specific hall was picked. Rule 1 applies — omitted,
      // never sent as null: an explicit null is a different request from an
      // absent key, and the backend's space resolver branches on presence.
      if (v.subVenueId != null) entry.subVenueId = Number(v.subVenueId);
      return entry;
    }),
  };

  if (input.guestCount != null && input.guestCount > 0) body.guestCount = input.guestCount;
  if (input.serviceLocationMode) body.serviceLocationMode = input.serviceLocationMode;
  if (input.serviceLocationAddress?.trim())
    body.serviceLocationAddress = input.serviceLocationAddress.trim();
  if (input.serviceLocationNotes?.trim())
    body.serviceLocationNotes = input.serviceLocationNotes.trim();

  /**
   * The response is WRAPPED. `bookingController.createBooking` returns
   *
   *   data: { booking, updatedAvailability, involvedVendors, permitNotices }
   *
   * so after the envelope unwrap the caller holds that object, not the booking.
   * Typed as `CreatedBooking`, `booking.id` read `undefined` — and the
   * confirmation screen showed a real, paid-for booking under the reference
   * **"#undefined"**, which is the one string a customer might have to quote
   * back to a vendor on WhatsApp.
   *
   * This is the third place the same wrapper caught us — chat's `sendMessage`
   * returns `{ message }` and the inquiry returns `{ leadId, vendorOnPlatform }`.
   * Unwrap at the endpoint, once, so no screen has to know.
   */
  const res = await api.post<{ booking?: CreatedBooking } | CreatedBooking>('/bookings', body);
  const booking = (res as { booking?: CreatedBooking })?.booking ?? (res as CreatedBooking);
  return booking;
}

/**
 * The label a vendor uses for "guest count" — a caterer counts plates, a car
 * rental counts passengers. Live endpoint; falls back to a neutral word rather
 * than inventing a vendor-specific one.
 */
export async function getGuestCountLabel(vendorType?: string | null): Promise<string> {
  if (!vendorType) return 'Guests';
  try {
    const res = await api.get<{ label?: string }>('/bookings/meta/guest-count-label', {
      params: { vendorType },
    });
    return res?.label?.trim() || 'Guests';
  } catch {
    return 'Guests';
  }
}
