/**
 * Favourites — server-side shortlist. Paths verified against live production.
 *
 * The app previously kept favourites only in AsyncStorage, so a couple's
 * shortlist did not exist on the website, did not survive a reinstall, and was
 * invisible to the vendor. `/favorites` has been live all along.
 *
 * ── The delete contract, and why we track row ids ─────────────────────────
 *
 * `DELETE /favorites/:id` resolves `:id` as the **Favorite row PK first**, then
 * falls back to matching `businessId` (backend WW-063, kept for older callers).
 * That fallback is ambiguous: if some other favourite row's PK happens to equal
 * this business's id, passing a businessId deletes the wrong row. So we keep the
 * row id from the list response and delete by PK whenever we have it, using
 * businessId only as a last resort.
 *
 * Note the role gate: the backend 403s with "You are not allowed to manage
 * favorites" for accounts without the customer role, so callers must treat 403
 * as "not permitted", not as a transient failure to retry.
 */
import type { Vendor } from '@/features/vendors/vendors.types';
import { api } from '@/lib/api/client';

/** A row as `GET /favorites` returns it: `{ results, meta }`. */
interface FavoriteRow {
  id: number;
  businessId?: number;
  business?: Vendor & { id: number };
}

export interface FavoriteEntry {
  /** The Favorite row PK — the correct thing to DELETE by. */
  favoriteId: number;
  businessId: number;
  business: Vendor | null;
}

export async function listFavorites(): Promise<FavoriteEntry[]> {
  const res = await api.get<{ results?: FavoriteRow[]; meta?: unknown }>('/favorites', {
    params: { page: 1, limit: 200 },
  });
  const rows = Array.isArray(res?.results) ? res.results : [];
  return rows
    .map((r) => {
      const businessId = Number(r.businessId ?? r.business?.id);
      if (!Number.isInteger(businessId) || businessId <= 0) return null;
      return { favoriteId: Number(r.id), businessId, business: r.business ?? null };
    })
    .filter((e): e is FavoriteEntry => e !== null);
}

/** Returns the new Favorite row id when the backend reports one. */
export async function addFavorite(businessId: number): Promise<number | null> {
  const res = await api.post<{ favorite?: { id?: number }; id?: number } | null>('/favorites', {
    businessId,
  });
  const id = Number(res?.favorite?.id ?? res?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Remove a favourite. Pass `favoriteId` whenever it is known — see the header
 * note on why deleting by businessId is a fallback, not the contract.
 */
export async function removeFavorite(opts: {
  favoriteId?: number | null;
  businessId: number;
}): Promise<void> {
  const target = opts.favoriteId ?? opts.businessId;
  await api.delete(`/favorites/${target}`);
}
