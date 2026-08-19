import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/endpoints/favorites';
import { useAuthStore } from '@/store/auth';

/**
 * The saved-vendors shortlist.
 *
 * ── Local-first, server-backed ────────────────────────────────────────────
 *
 * The heart must respond on the same frame it is tapped, so every toggle writes
 * the local set immediately and fires the network call behind it. If that call
 * fails the local change is rolled back — an optimistic update that silently
 * diverges from the server is worse than a slow one, because the customer keeps
 * a shortlist the vendor can never see.
 *
 * ── Why logged-out favourites are kept, not discarded ─────────────────────
 *
 * A couple browses before signing up. Discarding that shortlist at login throws
 * away the exact work that motivated them to register, so `syncWithServer` MERGES:
 * it pushes local-only ids up, pulls the server's set down, and unions them.
 * Nothing a customer saved is ever lost by signing in.
 *
 * ── The bug that made all of the above dead code ──────────────────────────
 *
 * `toggle` called `POST /favorites` unconditionally and rolled the local set
 * back on ANY error. Logged out, that call is a 401 — so the heart filled, the
 * id was written, the 401 came back, and the id was deleted again. **A signed-
 * out customer could not save a single vendor**, and `syncWithServer`'s
 * carefully-built merge had nothing to merge, because there were never any
 * local-only ids left to push.
 *
 * A 401 is not the server rejecting the save; it is the server saying there is
 * nobody to save it for. That is precisely the local-only state this store was
 * designed around. So the network leg is skipped entirely when there is no
 * session, and the rollback is kept for what it was written for: a real refusal
 * from an authenticated call.
 *
 * It matters more here than the code makes it look. Roughly 98% of listings are
 * unclaimed imports and most first visits are anonymous — the shortlist is the
 * work that motivates a couple to register, and it was being thrown away on
 * every tap.
 *
 * ── favoriteId ────────────────────────────────────────────────────────────
 *
 * `DELETE /favorites/:id` prefers the Favorite row PK and only falls back to
 * businessId, which is ambiguous (see endpoints/favorites.ts). We therefore keep
 * businessId → favoriteId alongside the id set and delete by PK when known.
 */
const KEY = 'ww.favorites';

interface FavoritesState {
  ids: Set<number>;
  /** businessId → Favorite row PK, for a correct DELETE. */
  rowIds: Map<number, number>;
  /** True while the first server reconciliation is in flight. */
  syncing: boolean;
  hydrate: () => Promise<void>;
  isFavorite: (id: number) => boolean;
  /** Optimistic toggle; rolls back if the server rejects it. */
  toggle: (id: number) => Promise<void>;
  set: (ids: number[]) => void;
  /** Merge local + server. Call once after authentication. */
  syncWithServer: () => Promise<void>;
  /** Drop everything (sign-out). */
  reset: () => void;
}

async function persist(ids: Set<number>) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    // Non-fatal — the set re-syncs from the server on the next authed load.
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set<number>(),
  rowIds: new Map<number, number>(),
  syncing: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ ids: new Set(JSON.parse(raw) as number[]) });
    } catch {
      // Start empty.
    }
  },

  isFavorite: (id) => get().ids.has(id),

  toggle: async (id) => {
    const wasFavorite = get().ids.has(id);
    const rowId = get().rowIds.get(id) ?? null;

    // 1 — local, immediately, so the heart animates on this frame.
    const next = new Set(get().ids);
    if (wasFavorite) next.delete(id);
    else next.add(id);
    set({ ids: next });
    void persist(next);

    /**
     * 2 — server, behind it, but ONLY if there is a session.
     *
     * Read through `getState()` rather than a hook: this runs outside React,
     * and it must see the CURRENT auth status, not one captured at store
     * creation. Signed out, the shortlist is local and complete; it is pushed
     * up by `syncWithServer` the moment the customer authenticates.
     */
    if (useAuthStore.getState().status !== 'authenticated') return;

    try {
      if (wasFavorite) {
        await removeFavorite({ favoriteId: rowId, businessId: id });
        const rows = new Map(get().rowIds);
        rows.delete(id);
        set({ rowIds: rows });
      } else {
        const newRowId = await addFavorite(id);
        if (newRowId) {
          const rows = new Map(get().rowIds);
          rows.set(id, newRowId);
          set({ rowIds: rows });
        }
      }
    } catch {
      // 3 — the server said no. Put the local set back rather than keep a
      // shortlist that only exists on this device.
      const rolledBack = new Set(get().ids);
      if (wasFavorite) rolledBack.add(id);
      else rolledBack.delete(id);
      set({ ids: rolledBack });
      void persist(rolledBack);
    }
  },

  set: (list) => {
    const ids = new Set(list);
    set({ ids });
    void persist(ids);
  },

  syncWithServer: async () => {
    if (get().syncing) return;
    set({ syncing: true });
    try {
      const server = await listFavorites();
      const serverIds = new Set(server.map((e) => e.businessId));
      const rowIds = new Map(server.map((e) => [e.businessId, e.favoriteId] as const));

      // Push anything saved while logged out. Failures are ignored per-id: one
      // rejected push must not abandon the rest of the merge.
      const localOnly = [...get().ids].filter((id) => !serverIds.has(id));
      for (const id of localOnly) {
        try {
          const newRowId = await addFavorite(id);
          serverIds.add(id);
          if (newRowId) rowIds.set(id, newRowId);
        } catch {
          // Leave it local; the next sync retries.
        }
      }

      const union = new Set([...serverIds, ...get().ids]);
      set({ ids: union, rowIds });
      void persist(union);
    } catch {
      // Offline or role-gated (403). Keep the local set exactly as it is.
    } finally {
      set({ syncing: false });
    }
  },

  reset: () => {
    set({ ids: new Set<number>(), rowIds: new Map<number, number>() });
    void persist(new Set<number>());
  },
}));
