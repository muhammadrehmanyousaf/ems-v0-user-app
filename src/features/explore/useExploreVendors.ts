/**
 * Explore data hook. Two modes:
 *  - browse (default): infinite scroll, fast first paint.
 *  - full: loads the whole category set (bounded per category) so rich filters
 *    and cross-set search are accurate — the web's load-all-then-filter model.
 */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { categoryBySlug } from '@/features/vendors/categories';
import type { Vendor } from '@/features/vendors/vendors.types';
import { fetchAllBusinesses, listBusinesses } from '@/lib/api/endpoints/vendors';

export interface ExploreData {
  vendors: Vendor[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
  isFetchingMore: boolean;
  fullSet: boolean;
}

export function useExploreVendors(categorySlug: string | null, fullMode: boolean): ExploreData {
  const backendType = categorySlug ? (categoryBySlug(categorySlug)?.backendType ?? null) : null;

  const infinite = useInfiniteQuery({
    queryKey: ['vendors', 'infinite', categorySlug ?? 'all'],
    queryFn: ({ pageParam }) => listBusinesses({ page: pageParam, limit: 12, vendorType: backendType }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled: !fullMode,
    staleTime: 5 * 60 * 1000,
  });

  const full = useQuery({
    queryKey: ['vendors', 'full', categorySlug ?? 'all'],
    queryFn: () => fetchAllBusinesses({ vendorType: backendType }),
    enabled: fullMode,
    staleTime: 5 * 60 * 1000,
  });

  if (fullMode) {
    return {
      vendors: full.data ?? [],
      total: full.data?.length ?? 0,
      isLoading: full.isLoading,
      isError: full.isError,
      refetch: () => full.refetch(),
      hasMore: false,
      loadMore: () => {},
      isFetchingMore: false,
      fullSet: true,
    };
  }

  const vendors = (infinite.data?.pages ?? []).flatMap((p) => p.vendors);
  return {
    vendors,
    total: infinite.data?.pages?.[0]?.total ?? 0,
    isLoading: infinite.isLoading,
    isError: infinite.isError,
    refetch: () => infinite.refetch(),
    hasMore: !!infinite.hasNextPage,
    loadMore: () => {
      if (infinite.hasNextPage && !infinite.isFetchingNextPage) infinite.fetchNextPage();
    },
    isFetchingMore: infinite.isFetchingNextPage,
    fullSet: false,
  };
}
