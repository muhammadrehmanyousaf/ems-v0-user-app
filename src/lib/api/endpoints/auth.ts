/**
 * Auth endpoints.
 *
 * **Contract mirrors `ems-v0/components/user-registration-form.tsx` field for
 * field.** Both surfaces write the same `User` rows on the same production
 * database, so a field the app omits is a column the web populates and the app
 * silently leaves null for half the customer base.
 *
 * ── What was missing before, and what it cost ─────────────────────────────
 *
 * The app sent five of the web's eight signup fields:
 *
 * | Field | Was | Cost of the gap |
 * |---|---|---|
 * | `profileImage` | absent | no avatar, ever, for an app signup |
 * | `termsVersion` | `'2025-01'` — **a version that never existed** | a false compliance record; see `config/legal.ts` |
 * | `termsAcceptedAt` | absent | no acceptance timestamp on the row |
 * | `phoneNumber` | raw as typed | the same person stored four ways; dedupe and OTP miss |
 * | `email` | trimmed, not lowercased | `Ali@x.com` and `ali@x.com` become two accounts |
 *
 * The last two are the quiet ones. Nothing errors, nothing logs, and the damage
 * only shows up months later as duplicate customers nobody can merge.
 */
import { TERMS_VERSION } from '@/config/legal';
import { api, http } from '@/lib/api/client';
import { normalizeEmail, normalizePkPhone } from '@/lib/pk';
import type { AuthUser } from '@/store/auth';

export interface AuthResult {
  user: AuthUser;
  token: string;
  jti?: string | null;
  flags?: Record<string, unknown>;
}

/** Backend returns `fullName`; normalise to our AuthUser (`name`). */
function mapUser(u: Record<string, unknown>): AuthUser {
  return {
    id: Number(u.id),
    name: (u.fullName as string) ?? (u.name as string) ?? 'You',
    email: u.email as string | undefined,
    phoneNumber: u.phoneNumber as string | undefined,
    avatarUrl: (u.profileImage as string) ?? (u.avatarUrl as string) ?? null,
  };
}

interface RawAuth {
  token: string;
  jti?: string | null;
  user: Record<string, unknown>;
  flags?: Record<string, unknown>;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  // Lowercased to match the shape signup stores, so a customer who typed
  // `Ali@x.com` at signup can sign in with `ali@x.com` and vice versa.
  const raw = await api.post<RawAuth>('/auth/login', { email: normalizeEmail(email), password });
  return { token: raw.token, jti: raw.jti, flags: raw.flags, user: mapUser(raw.user ?? {}) };
}

/** A photograph chosen from the device, in the shape RN's FormData wants. */
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

export interface SignupInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  /** Optional, exactly as on the web — a signup never blocks on it. */
  profileImage?: UploadFile | null;
}

/**
 * Customer signup — `roleIds=[3]`, multipart, avatar-capable.
 *
 * Multipart even with no photograph, because that is what the web sends and the
 * backend's upload middleware is wired for it.
 *
 * The file part is appended as `{ uri, name, type }`. That object is not a
 * `Blob` and TypeScript will not accept it against `FormData.append` — React
 * Native's FormData is a different implementation that reads exactly those
 * three keys and streams the file off disk. The cast is the standard RN
 * workaround, not a shortcut.
 */
export async function signup(input: SignupInput): Promise<AuthResult> {
  const fd = new FormData();
  fd.append('fullName', input.fullName.trim());
  fd.append('email', normalizeEmail(input.email));
  fd.append('phoneNumber', normalizePkPhone(input.phoneNumber));
  fd.append('password', input.password);
  fd.append('roleIds', JSON.stringify([3]));
  // Explicit T&C acceptance — required for PayFast underwriting and chargeback
  // defence. Persisted on the User row by migration 20260507110000.
  fd.append('termsVersion', TERMS_VERSION);
  fd.append('termsAcceptedAt', new Date().toISOString());
  if (input.profileImage) {
    fd.append('profileImage', input.profileImage as unknown as Blob);
  }

  const res = await http.post('/auth/signup', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const body = res.data as { data?: AuthResult };
  return (body.data ?? body) as AuthResult;
}

export async function requestPhoneOtp(phoneNumber: string): Promise<void> {
  await api.post('/auth/phone-otp/request', { phoneNumber: normalizePkPhone(phoneNumber) });
}

export async function verifyPhoneOtp(phoneNumber: string, code: string): Promise<AuthResult> {
  const raw = await api.post<RawAuth>('/auth/phone-otp/verify', {
    phoneNumber: normalizePkPhone(phoneNumber),
    code,
  });
  return { token: raw.token, jti: raw.jti, flags: raw.flags, user: mapUser(raw.user ?? {}) };
}
