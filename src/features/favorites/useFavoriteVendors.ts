/**
 * The saved-vendor list, hydrated in as few requests as possible.
 *
 * ── Why this changed ──────────────────────────────────────────────────────
 *
 * This used to call `GET /businesses/:id` once per favourite. A couple with
 * twenty shortlisted vendors fired twenty requests to open one screen, on
 * Pakistani mobile data.
 *
 * `GET /favorites` already returns each row's full `business` object inline, so
 * the authenticated path is now a SINGLE request. The per-id path is kept only
 * for ids the server does not know about — which is exactly the logged-out
 * shortlist, and any id saved a moment ago that has not been synced yet.
 *
 * Ordering is newest-saved-first. That is the order a shortlist is read in: the
 * vendor you just found is the one you want to look at again.
 */
import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { Vendor } from '@/features/vendors/vendors.types';
import { listFavorites } from '@/lib/api/endpoints/favorites';
import { getBusinessById } from '@/lib/api/endpoints/vendors';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';

export function useFavoriteVendors() {
  const idsSet = useFavoritesStore((s) => s.ids);
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const ids = useMemo(() => [...idsSet], [idsSet]);

  // One request for everything the server knows about.
  const server = useQuery({
    queryKey: ['favorites', 'list'],
    queryFn: listFavorites,
    enabled: authed,
    staleTime: 2 * 60 * 1000,
  });

  const serverVendors = useMemo(() => {
    const map = new Map<number, Vendor>();
    for (const entry of server.data ?? []) {
      if (entry.business) map.set(entry.businessId, entry.business);
    }
    return map;
  }, [server.data]);

  // Anything the server did not supply — the logged-out shortlist, or an id
  // saved seconds ago. Usually empty, so usually zero extra requests.
  const missing = useMemo(
    () => ids.filter((id) => !serverVendors.has(id)),
    [ids, serverVendors],
  );

  const fallback = useQueries({
    queries: missing.map((id) => ({
      queryKey: ['vendor', String(id)],
      queryFn: () => getBusinessById(id),
      staleTime: 10 * 60 * 1000,
    })),
  });

  const vendors = useMemo(() => {
    const byId = new Map(serverVendors);
    fallback.forEach((r) => {
      if (r.data) byId.set(r.data.id, r.data);
    });
    // `ids` preserves Set insertion order; reverse it for newest-first.
    return [...ids]
      .reverse()
      .map((id) => byId.get(id))
      .filter((v): v is Vendor => !!v);
  }, [ids, serverVendors, fallback]);

  const isLoading =
    ids.length > 0 && vendors.length === 0 && (server.isLoading || fallback.some((r) => r.isLoading));

  return { vendors, isLoading, count: ids.length, refetch: () => void server.refetch() };
}
