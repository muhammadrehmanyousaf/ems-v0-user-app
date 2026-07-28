/** Hydrate the saved-favourite vendor objects from their IDs (cache-friendly). */
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { Vendor } from '@/features/vendors/vendors.types';
import { getBusinessById } from '@/lib/api/endpoints/vendors';
import { useFavoritesStore } from '@/store/favorites';

export function useFavoriteVendors() {
  const idsSet = useFavoritesStore((s) => s.ids);
  const ids = useMemo(() => [...idsSet], [idsSet]);

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['vendor', String(id)],
      queryFn: () => getBusinessById(id),
      staleTime: 10 * 60 * 1000,
    })),
  });

  const vendors = results
    .map((r) => r.data)
    .filter((v): v is Vendor => !!v)
    // newest-saved first (ids preserve insertion order in the Set)
    .reverse();
  const isLoading = ids.length > 0 && results.some((r) => r.isLoading);

  return { vendors, isLoading, count: ids.length };
}
