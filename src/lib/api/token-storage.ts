import * as SecureStore from 'expo-secure-store';

/**
 * Access token + session id in the device keychain via SecureStore, mirrored in
 * memory so the request interceptor reads synchronously. Call loadSession() once
 * at startup to hydrate.
 */
const TOKEN_KEY = 'ww.accessToken';
const JTI_KEY = 'ww.sessionJti';

let cachedToken: string | null = null;
let cachedJti: string | null = null;

export async function loadSession(): Promise<string | null> {
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    cachedJti = await SecureStore.getItemAsync(JTI_KEY);
  } catch {
    cachedToken = null;
    cachedJti = null;
  }
  return cachedToken;
}

export function getToken(): string | null {
  return cachedToken;
}

export function getJti(): string | null {
  return cachedJti;
}

export async function setSession(token: string, jti?: string | null): Promise<void> {
  cachedToken = token;
  if (jti) cachedJti = jti;
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (jti) await SecureStore.setItemAsync(JTI_KEY, jti);
  } catch {
    // No persistent keychain on this target; in-memory copy still works this session.
  }
}

export async function clearSession(): Promise<void> {
  cachedToken = null;
  cachedJti = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(JTI_KEY);
  } catch {
    // Nothing persisted to clear.
  }
}
