/** Hydrate recently-viewed vendor objects from their ids (cache-friendly). */
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getBusinessById } from '@/lib/api/endpoints/vendors';
import { useRecentlyViewedStore } from '@/store/recently-viewed';

import type { Vendor } from './vendors.types';

export function useRecentlyViewedVendors() {
  const ids = useRecentlyViewedStore((s) => s.ids);
  const stable = useMemo(() => ids, [ids]);

  const results = useQueries({
    queries: stable.map((id) => ({
      queryKey: ['vendor', String(id)],
      queryFn: () => getBusinessById(id),
      staleTime: 10 * 60 * 1000,
    })),
  });

  // Preserve recency order (results align with `stable`).
  const vendors = results.map((r) => r.data).filter((v): v is Vendor => !!v);
  return { vendors, count: stable.length };
}
