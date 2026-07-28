/**
 * Typed public runtime config. Values come from EXPO_PUBLIC_* (inlined at build
 * time — non-secret only). Same live backend as the vendor app + web.
 */
type Env = {
  apiUrl: string;
  apiTimeoutMs: number;
  appEnv: 'development' | 'staging' | 'production';
};

/** Live production backend (event-planner-api on Railway); includes /api/v1. */
const DEFAULT_API_URL = 'https://ems-v0-backend-production.up.railway.app/api/v1';

export const env: Env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,
  apiTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 15000),
  appEnv:
    (process.env.EXPO_PUBLIC_APP_ENV as Env['appEnv']) ?? (__DEV__ ? 'development' : 'production'),
};
