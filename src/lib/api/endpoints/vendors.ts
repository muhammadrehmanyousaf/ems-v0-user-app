/** Vendor (business) API endpoints. Shapes verified against the live backend. */
import { recordVendorImages } from '@/features/vendors/image-trust';
import type { PlatformStats, Review, Vendor } from '@/features/vendors/vendors.types';
import { api } from '@/lib/api/client';
import { normalizeEmail, normalizePkPhone } from '@/lib/pk';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VendorPage {
  vendors: Vendor[];
  page: number;
  totalPages: number;
  total: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  /** Backend `vendorType` enum string — routes to /businesses-by-vendor. */
  vendorType?: string | null;
  availableOn?: string;
  verifiedOnly?: boolean;
}

/** One page of businesses. Uses /businesses-by-vendor when a vendorType is given. */
export async function listBusinesses(params: ListParams = {}): Promise<VendorPage> {
  const { page = 1, limit = 20, vendorType, availableOn, verifiedOnly } = params;
  const url = vendorType
    ? '/businesses/businesses-by-vendor'
    : '/businesses';
  const query: Record<string, unknown> = { page, limit };
  if (vendorType) query.vendorType = vendorType;
  if (availableOn) query.availableOn = availableOn;
  if (verifiedOnly) query.verifiedOnly = true;

  const res = await api.get<{ data: Vendor[]; pagination: Pagination }>(url, { params: query });
  const pagination = res.pagination ?? { page, limit, total: 0, totalPages: 1 };
  const vendors = res.data ?? [];

  /**
   * Every listing passes through here, which makes it the one place that can
   * notice the same photograph attached to two different businesses. 55% of the
   * images on production's most-viewed listings are shared stock; recording them
   * as they arrive lets `vendorPrimaryImage` stop presenting one business's
   * picture as another's, at zero extra request cost. See
   * `features/vendors/image-trust.ts`.
   */
  recordVendorImages(vendors);

  return {
    vendors,
    page: pagination.page,
    totalPages: pagination.totalPages,
    total: pagination.total,
  };
}

/** Walk every page of a listing (used when the full set is needed, e.g. rich filters). */
export async function fetchAllBusinesses(params: Omit<ListParams, 'page' | 'limit'> = {}): Promise<Vendor[]> {
  const PAGE_SIZE = 200;
  const first = await listBusinesses({ ...params, page: 1, limit: PAGE_SIZE });
  const all = [...first.vendors];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await listBusinesses({ ...params, page, limit: PAGE_SIZE });
    all.push(...next.vendors);
  }
  return all;
}

export async function getBusinessById(id: number | string): Promise<Vendor | null> {
  try {
    return await api.get<Vendor>(`/businesses/${id}`);
  } catch {
    return null;
  }
}

export async function getRelatedBusinesses(id: number | string): Promise<Vendor[]> {
  try {
    const res = await api.get<Vendor[] | { data?: Vendor[] }>(`/businesses/${id}/related`);
    return Array.isArray(res) ? res : (res.data ?? []);
  } catch {
    return [];
  }
}

export async function getReviews(id: number | string): Promise<Review[]> {
  try {
    const res = await api.get<Review[] | { reviews?: Review[]; data?: Review[] }>(`/reviews/${id}`);
    if (Array.isArray(res)) return res;
    return res.reviews ?? res.data ?? [];
  } catch {
    return [];
  }
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return api.get<PlatformStats>('/platform-stats');
}

/** Busy/blackout dates for a business in a month. Empty map = fully open. */
export async function getAvailability(
  id: number | string,
  month: string,
): Promise<Record<string, unknown>> {
  try {
    const res = await api.get<{ availability?: Record<string, Record<string, unknown>> }>(
      '/bookings/availability',
      { params: { businessIds: id, month } },
    );
    return res.availability?.[String(id)] ?? {};
  } catch {
    return {};
  }
}

/**
 * Public vendor inquiry — `POST /leads/inquiry`, no auth.
 *
 * ── This was broken on live production, silently, for every app user ────
 *
 * The backend (`leadController.submitInquiry`) reads exactly these keys:
 *
 *     contactName  ?? name      contactPhone ?? phone
 *     contactEmail ?? email     message      ?? inquiry
 *     businessId   eventType    eventDate    estimatedGuests    website
 *
 * The app was sending `phoneNumber` and `guestCount`. Neither is an accepted
 * alias, so both were dropped on the floor — and because `assessContactability`
 * then saw no phone AND no email, every inquiry came back
 *
 *     400 "Please share a phone number or email so the vendor can reply"
 *
 * to a customer who had just typed their phone number. Discovery → contact is
 * the marketplace's core transaction and it failed 100% of the time from the
 * app, while the web form beside it worked.
 *
 * The interface below therefore uses the WIRE names, not friendlier ones. A
 * pretty local name that has to be mapped is exactly how this drifted: the
 * mapping is the thing that goes wrong, so there is no mapping.
 */
export interface InquiryPayload {
  businessId: number;
  contactName?: string;
  /** `contactPhone`, never `phoneNumber`. The backend does not know that key. */
  contactPhone?: string;
  contactEmail?: string;
  eventType?: string;
  /** `YYYY-MM-DD`; the backend clips to 10 characters. */
  eventDate?: string;
  /** `estimatedGuests`, never `guestCount`. */
  estimatedGuests?: number;
  message?: string;
}

/**
 * What came back. `vendorOnPlatform: false` means the listing is one of the
 * 3,268 unclaimed OSM imports whose owner has never logged in — the inquiry is
 * filed, but nobody is going to read it. The confirmation has to say the
 * matching thing rather than promising a reply that cannot come.
 */
export interface InquiryResult {
  leadId?: number;
  /** Absent on an older backend deploy → assume claimed, which is how this
   *  behaved before the field existed. */
  vendorOnPlatform: boolean;
}

export async function submitInquiry(payload: InquiryPayload): Promise<InquiryResult> {
  const res = await api.post<{ leadId?: number; vendorOnPlatform?: boolean } | null>('/leads/inquiry', {
    businessId: Number(payload.businessId),
    contactName: payload.contactName?.trim() || undefined,
    // Normalised to the one canonical PK shape, so an inquiry and an account
    // for the same person can still be matched later.
    contactPhone: payload.contactPhone?.trim()
      ? normalizePkPhone(payload.contactPhone)
      : undefined,
    contactEmail: payload.contactEmail?.trim() ? normalizeEmail(payload.contactEmail) : undefined,
    eventType: payload.eventType || undefined,
    eventDate: payload.eventDate || undefined,
    estimatedGuests:
      Number.isFinite(payload.estimatedGuests) && (payload.estimatedGuests ?? 0) > 0
        ? Number(payload.estimatedGuests)
        : undefined,
    message: payload.message?.trim() || undefined,
    // Honeypot, as the web sends it. The backend returns a cheerful 200 to
    // anything that fills this, so bots cannot probe which submissions landed.
    // It must always be empty — there is no UI that can set it.
    website: '',
  });
  return { leadId: res?.leadId, vendorOnPlatform: res?.vendorOnPlatform !== false };
}
