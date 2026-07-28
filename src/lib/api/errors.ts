import axios from 'axios';

/** A single, predictable error shape the whole UI can rely on. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
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
    return new ApiError(payload?.message ?? defaultMessageFor(status), status, code, data);
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
