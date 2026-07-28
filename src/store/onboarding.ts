import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

/** First-launch onboarding flag. */
const KEY = 'ww.onboardingSeen';

interface OnboardingState {
  seen: boolean;
  loaded: boolean;
  hydrate: () => Promise<void>;
  markSeen: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  seen: false,
  loaded: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      set({ seen: raw === '1', loaded: true });
    } catch {
      set({ seen: false, loaded: true });
    }
  },
  markSeen: () => {
    set({ seen: true });
    AsyncStorage.setItem(KEY, '1').catch(() => {});
  },
}));
