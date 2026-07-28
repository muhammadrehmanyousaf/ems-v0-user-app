import { create } from 'zustand';

/** Compare tray — up to 4 vendors, like the web comparator. */
export const COMPARE_MAX = 4;

interface CompareState {
  ids: number[];
  toggle: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  ids: [],
  toggle: (id) => {
    const ids = get().ids;
    if (ids.includes(id)) set({ ids: ids.filter((x) => x !== id) });
    else if (ids.length < COMPARE_MAX) set({ ids: [...ids, id] });
  },
  remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
  clear: () => set({ ids: [] }),
}));
