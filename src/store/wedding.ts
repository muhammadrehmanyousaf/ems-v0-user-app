/**
 * The couple's wedding date.
 *
 * ── Why this is the personalisation, and not a recommendation engine ──────
 *
 * Home knew the customer's name and nothing else. A greeting is not
 * personalisation; it is a mail merge. The one fact that actually changes how a
 * couple reads this app is **when the wedding is** — it decides which vendors are
 * even available, how much lead time they have, and how urgent any of it feels.
 *
 * It is also the only personal fact we can hold that is emotionally true. "218
 * days to your shaadi" is theirs. "Recommended for you" would be a claim about
 * an algorithm we have not built.
 *
 * ── Local, and honest about it ────────────────────────────────────────────
 *
 * Stored on the device, like the planning tools, because the backend has no
 * field for it on the customer profile. That is a real limitation and the UI says
 * so rather than implying it syncs — a date that silently vanishes on reinstall,
 * or fails to appear on the website, is worse than one the customer knows is
 * local. When a profile field exists, this store gains a sync and nothing else
 * changes.
 *
 * The value is a `YYYY-MM-DD` day key, never a `Date`. A Date serialises to UTC
 * and a Pakistani wedding on the 14th becomes the 13th for anyone east of
 * Greenwich — the same timezone bug the booking layer already fixed once.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { fromKey, today, type DayKey } from '@/lib/date';

const KEY = 'ww.weddingDate';

interface WeddingState {
  /** `YYYY-MM-DD`, or null when the couple has not told us. */
  date: DayKey | null;
  loaded: boolean;
  hydrate: () => Promise<void>;
  setDate: (date: DayKey | null) => void;
}

export const useWeddingStore = create<WeddingState>((set) => ({
  date: null,
  loaded: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      set({ date: raw ?? null, loaded: true });
    } catch {
      set({ date: null, loaded: true });
    }
  },
  setDate: (date) => {
    set({ date });
    if (date) AsyncStorage.setItem(KEY, date).catch(() => {});
    else AsyncStorage.removeItem(KEY).catch(() => {});
  },
}));

/**
 * Whole days from today until the wedding.
 *
 * Both dates are floored to local midnight before subtracting. Comparing raw
 * timestamps makes "days remaining" depend on the time of day the app happens to
 * be opened — a couple would watch the number flicker between 217 and 218 across
 * an afternoon.
 *
 * Returns null for no date, a negative number for a wedding already past (the UI
 * decides what to say about that — it is not this function's business to hide it).
 */
export function daysUntil(date: DayKey | null): number | null {
  if (!date) return null;
  const target = fromKey(date);
  if (!target) return null;
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const n = today();
  const b = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
}
