/** Auth endpoints. Contract mirrors the web forms (login JSON, signup multipart). */
import { api, http } from '@/lib/api/client';
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
  const raw = await api.post<RawAuth>('/auth/login', { email, password });
  return { token: raw.token, jti: raw.jti, flags: raw.flags, user: mapUser(raw.user ?? {}) };
}

export interface SignupInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

/** Customer signup — roleIds=[3], multipart like the web (avatar-capable). */
export async function signup(input: SignupInput): Promise<AuthResult> {
  const fd = new FormData();
  fd.append('fullName', input.fullName);
  fd.append('email', input.email);
  fd.append('phoneNumber', input.phoneNumber);
  fd.append('password', input.password);
  fd.append('roleIds', JSON.stringify([3]));
  fd.append('termsVersion', '2025-01');
  const res = await http.post('/auth/signup', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  const body = res.data as { data?: AuthResult };
  return (body.data ?? body) as AuthResult;
}

export async function requestPhoneOtp(phoneNumber: string): Promise<void> {
  await api.post('/auth/phone-otp/request', { phoneNumber });
}

export async function verifyPhoneOtp(phoneNumber: string, code: string): Promise<AuthResult> {
  const raw = await api.post<RawAuth>('/auth/phone-otp/verify', { phoneNumber, code });
  return { token: raw.token, jti: raw.jti, flags: raw.flags, user: mapUser(raw.user ?? {}) };
}
