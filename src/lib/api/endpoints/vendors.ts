/** Vendor (business) API endpoints. Shapes verified against the live backend. */
import type { PlatformStats, Review, Vendor } from '@/features/vendors/vendors.types';
import { api } from '@/lib/api/client';

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
  return {
    vendors: res.data ?? [],
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

export interface InquiryPayload {
  businessId: number;
  name?: string;
  phoneNumber?: string;
  email?: string;
  eventType?: string;
  eventDate?: string;
  guestCount?: number;
  message?: string;
}

export async function submitInquiry(payload: InquiryPayload): Promise<void> {
  await api.post('/leads/inquiry', payload);
}
