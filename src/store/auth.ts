import { create } from 'zustand';

import { clearSession, loadSession, setSession } from '@/lib/api/token-storage';

export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /** Hydrate the session from secure storage on cold launch. */
  hydrate: () => Promise<void>;
  /** Persist a new session after a successful login/register. */
  signIn: (token: string, user: AuthUser, jti?: string | null) => Promise<void>;
  /** Clear the session (logout / forced 401). */
  signOut: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  hydrate: async () => {
    const token = await loadSession();
    // A token existing = an optimistic session; a stale one is caught by the
    // first mid-session 401 (client.ts force-signOut). User detail is fetched
    // in the auth feature once its endpoints land.
    set({ status: token ? 'authenticated' : 'unauthenticated' });
  },

  signIn: async (token, user, jti) => {
    await setSession(token, jti);
    set({ status: 'authenticated', user });
  },

  signOut: async () => {
    await clearSession();
    set({ status: 'unauthenticated', user: null });
  },

  setUser: (user) => set({ user }),
}));

/** Convenience selector: is there an authenticated session? */
export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.status === 'authenticated');
}
