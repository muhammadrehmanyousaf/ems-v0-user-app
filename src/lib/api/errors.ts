import axios from 'axios';

/**
 * A single, predictable error shape the whole UI can rely on.
 *
 * ── `message` was always English ─────────────────────────────────────────
 *
 * Every message this module generates was a hardcoded English literal, and all
 * six screens that display one do `e instanceof Error ? e.message : tr(...)` —
 * so our English always beat their translated fallback. The result was that the
 * copy an Urdu customer read at the precise moment something failed was the one
 * string in the app guaranteed not to be in their language.
 *
 * This file cannot call `useT()` — it is a pure module underneath React. So it
 * keeps `message` (useful in logs, and a correct fallback) and adds
 * `fromServer`, which is the distinction that actually matters: a message the
 * BACKEND sent is already customer-facing and cannot be translated here, while
 * one we invented can. `apiErrorMessage()` below is what screens should call.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  /** True when `message` came from the API response, not from this file. */
  readonly fromServer: boolean;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: unknown,
    fromServer = false,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.fromServer = fromServer;
  }
}

/** Normalises anything thrown by axios (network, HTTP, cancel) into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_CANCELED') return new ApiError('Request cancelled', 0, 'CANCELLED');
    if (!error.response) {
      return new ApiError('Can’t reach the server. Check your connection and try again.', 0, 'NETWORK');
    }
    const { status, data } = error.response;
    const payload = data as { message?: string; code?: string; data?: { code?: string } } | undefined;
    const code = payload?.data?.code ?? payload?.code ?? `HTTP_${status}`;
    const serverMessage = payload?.message;
    return new ApiError(
      serverMessage ?? defaultMessageFor(status),
      status,
      code,
      data,
      !!serverMessage,
    );
  }

  return new ApiError('Something went wrong.', 0, 'UNKNOWN', error);
}

function defaultMessageFor(status: number): string {
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You don’t have access to this.';
  if (status === 404) return 'Not found.';
  if (status >= 500) return 'The server had a problem. Please try again shortly.';
  return 'Request failed.';
}

/**
 * What to SHOW a customer for a given error.
 *
 * A message the server sent wins — the backend writes its own customer-facing
 * copy and this layer has no way to translate it. Everything else is ours, and
 * therefore translatable, keyed off `code`/`status` rather than off the English
 * text, so the mapping cannot rot the way a string comparison would.
 */
export function apiErrorMessage(
  error: unknown,
  tr: (k: ApiErrorKey) => string,
): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error && error.message ? error.message : tr('err.unknown');
  }
  if (error.fromServer && error.message) return error.message;

  switch (error.code) {
    case 'NETWORK':
      return tr('err.network');
    case 'CANCELLED':
      return tr('err.cancelled');
    case 'UNKNOWN':
      return tr('err.unknown');
    default:
      break;
  }
  if (error.status === 401) return tr('err.expired');
  if (error.status === 403) return tr('err.forbidden');
  if (error.status === 404) return tr('err.notFound');
  if (error.status >= 500) return tr('err.server');
  return error.message || tr('err.failed');
}

export type ApiErrorKey =
  | 'err.network'
  | 'err.cancelled'
  | 'err.unknown'
  | 'err.expired'
  | 'err.forbidden'
  | 'err.notFound'
  | 'err.server'
  | 'err.failed';
