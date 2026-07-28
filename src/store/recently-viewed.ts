import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

/** Recently-viewed vendor ids (most-recent first, capped). Local + persisted. */
const KEY = 'ww.recentlyViewed';
const MAX = 15;

interface RecentlyViewedState {
  ids: number[];
  hydrate: () => Promise<void>;
  record: (id: number) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>((set, get) => ({
  ids: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ ids: JSON.parse(raw) as number[] });
    } catch {
      // start empty
    }
  },
  record: (id) => {
    const next = [id, ...get().ids.filter((x) => x !== id)].slice(0, MAX);
    set({ ids: next });
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  },
}));
