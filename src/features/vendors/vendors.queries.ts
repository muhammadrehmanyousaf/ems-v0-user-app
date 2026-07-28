/** TanStack Query hooks for vendor data (live backend). */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  getAvailability,
  getBusinessById,
  getPlatformStats,
  getRelatedBusinesses,
  getReviews,
  listBusinesses,
} from '@/lib/api/endpoints/vendors';

import { categoryBySlug } from './categories';

const HOUR = 60 * 60 * 1000;

/** Homepage / stat strip: real platform totals. */
export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: getPlatformStats,
    staleTime: HOUR,
  });
}

/** A single category's vendors, first page — for Home showcases + category browse. */
export function useVendorsByCategory(slug: string | null, limit = 10) {
  const category = slug ? categoryBySlug(slug) : undefined;
  const backendType = category?.backendType ?? null;
  return useQuery({
    queryKey: ['vendors', 'byCategory', slug, limit],
    queryFn: () => listBusinesses({ vendorType: backendType, limit, page: 1 }),
    enabled: !!backendType,
    staleTime: 10 * 60 * 1000,
  });
}

/** Infinite, paginated vendor list for Explore (all vendors, or one category). */
export function useVendorsInfinite(opts: { categorySlug?: string | null; limit?: number } = {}) {
  const limit = opts.limit ?? 12;
  const backendType = opts.categorySlug ? (categoryBySlug(opts.categorySlug)?.backendType ?? null) : null;
  return useInfiniteQuery({
    queryKey: ['vendors', 'infinite', opts.categorySlug ?? 'all', limit],
    queryFn: ({ pageParam }) => listBusinesses({ page: pageParam, limit, vendorType: backendType }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendor(id: number | string) {
  return useQuery({
    queryKey: ['vendor', String(id)],
    queryFn: () => getBusinessById(id),
    enabled: id != null && id !== '',
    staleTime: 10 * 60 * 1000,
  });
}

export function useRelatedVendors(id: number | string) {
  return useQuery({
    queryKey: ['vendor', String(id), 'related'],
    queryFn: () => getRelatedBusinesses(id),
    enabled: id != null && id !== '',
    staleTime: 10 * 60 * 1000,
  });
}

export function useVendorReviews(id: number | string) {
  return useQuery({
    queryKey: ['vendor', String(id), 'reviews'],
    queryFn: () => getReviews(id),
    enabled: id != null && id !== '',
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorAvailability(id: number | string, month: string) {
  return useQuery({
    queryKey: ['vendor', String(id), 'availability', month],
    queryFn: () => getAvailability(id, month),
    enabled: id != null && id !== '',
    staleTime: 5 * 60 * 1000,
  });
}
