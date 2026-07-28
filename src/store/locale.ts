import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type Locale = 'en' | 'ur';
const KEY = 'ww.locale';

interface LocaleState {
  locale: Locale;
  hydrate: () => Promise<void>;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'en',
  hydrate: async () => {
    try {
      const saved = (await AsyncStorage.getItem(KEY)) as Locale | null;
      if (saved === 'en' || saved === 'ur') set({ locale: saved });
    } catch {
      // No persisted locale — default English.
    }
  },
  setLocale: (locale) => {
    set({ locale });
    AsyncStorage.setItem(KEY, locale).catch(() => {});
  },
}));
