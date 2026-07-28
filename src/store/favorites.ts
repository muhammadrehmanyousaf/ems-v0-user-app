import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

/**
 * Local mirror of the user's saved vendors for instant, optimistic heart toggles.
 * The server (favorites API) is the source of truth once auth lands; this cache
 * keeps the UI responsive and works logged-out as a shortlist seed.
 */
const KEY = 'ww.favorites';

interface FavoritesState {
  ids: Set<number>;
  hydrate: () => Promise<void>;
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
  set: (ids: number[]) => void;
}

async function persist(ids: Set<number>) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    // Non-fatal — favourites re-sync from the server on next auth’d load.
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set<number>(),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ ids: new Set(JSON.parse(raw) as number[]) });
    } catch {
      // Start empty.
    }
  },

  isFavorite: (id) => get().ids.has(id),

  toggle: (id) => {
    const ids = new Set(get().ids);
    if (ids.has(id)) ids.delete(id);
    else ids.add(id);
    set({ ids });
    void persist(ids);
  },

  set: (list) => {
    const ids = new Set(list);
    set({ ids });
    void persist(ids);
  },
}));
