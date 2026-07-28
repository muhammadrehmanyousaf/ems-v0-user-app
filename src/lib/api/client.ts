import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth';

import { ApiError, toApiError } from './errors';
import { getToken } from './token-storage';

/**
 * Backend wraps every response in `{ status, message, data }`. We unwrap to the
 * inner `data` so callers get the payload directly, and surface a 2xx
 * `status:false` body as an ApiError rather than leaking it as data.
 */
type Envelope<T> = { status: boolean; message: string; data: T };

function isEnvelope(value: unknown): value is Envelope<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    'status' in value &&
    typeof (value as { status: unknown }).status === 'boolean' &&
    'data' in value
  );
}

function unwrap<T>(raw: unknown): T {
  if (isEnvelope(raw)) {
    if (!raw.status) {
      const code = (raw.data as { code?: string } | null)?.code ?? 'API_ERROR';
      throw new ApiError(raw.message || 'Request failed.', 200, code, raw.data);
    }
    return raw.data as T;
  }
  return raw as T;
}

/** The single configured axios instance. Injects bearer token; normalises errors. */
export const http: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

let forcingLogout = false;

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : '';
    // Mid-session 401 → force sign-out (session revoked/expired). Never for /auth/*.
    if (
      apiError.status === 401 &&
      !url.startsWith('/auth/') &&
      !forcingLogout &&
      useAuthStore.getState().status === 'authenticated'
    ) {
      forcingLogout = true;
      void useAuthStore
        .getState()
        .signOut()
        .finally(() => {
          forcingLogout = false;
        });
    }
    return Promise.reject(apiError);
  },
);

/** Typed helpers — each returns the unwrapped inner `data` from the envelope. */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => http.get(url, config).then((r) => unwrap<T>(r.data)),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    http.post(url, body, config).then((r) => unwrap<T>(r.data)),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    http.put(url, body, config).then((r) => unwrap<T>(r.data)),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    http.patch(url, body, config).then((r) => unwrap<T>(r.data)),
  delete: <T>(url: string, config?: AxiosRequestConfig) => http.delete(url, config).then((r) => unwrap<T>(r.data)),
};

/**
 * Walk a paginated list endpoint to completion. Backend caps `limit` at 200 and
 * returns `{ rows, pagination: { totalPages } }` — we page by totalPages (the
 * exact bug we fixed in the web sitemap: never trust a single page).
 */
export async function fetchAllPages<T>(
  path: string,
  params: Record<string, unknown> = {},
  pageSize = 200,
): Promise<T[]> {
  const first = await api.get<{ rows: T[]; pagination?: { totalPages?: number } }>(path, {
    params: { ...params, page: 1, limit: pageSize },
  });
  const rows = [...(first.rows ?? [])];
  const totalPages = first.pagination?.totalPages ?? 1;
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await api.get<{ rows: T[] }>(path, { params: { ...params, page, limit: pageSize } });
    rows.push(...(next.rows ?? []));
  }
  return rows;
}
