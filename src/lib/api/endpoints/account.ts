/** Customer account endpoints (auth-gated). Paths verified against live backend. */
import { api } from '@/lib/api/client';
import type { AuthUser } from '@/store/auth';

export interface Booking {
  id: number;
  businessId?: number;
  businessName?: string;
  eventType?: string;
  eventDate?: string;
  status?: string;
  totalAmount?: number;
  paidAmount?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: number;
  type?: string;
  title?: string;
  message?: string;
  isRead: boolean;
  createdAt?: string;
  data?: unknown;
}

/** GET /users/profile/me → { user, token }. */
export async function getProfile(): Promise<Record<string, unknown>> {
  const res = await api.get<{ user: Record<string, unknown> }>('/users/profile/me');
  return res.user ?? {};
}

export interface ProfileUpdate {
  fullName?: string;
  phoneNumber?: string;
  city?: string;
}

export async function updateProfile(data: ProfileUpdate): Promise<void> {
  await api.patch('/users/profile', data);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.patch('/users/change-password', { currentPassword, newPassword });
}

/** GET /bookings/simple-user-bookings → Booking[]. */
export async function getMyBookings(): Promise<Booking[]> {
  const res = await api.get<Booking[] | { bookings?: Booking[]; data?: Booking[] }>('/bookings/simple-user-bookings');
  return Array.isArray(res) ? res : (res.bookings ?? res.data ?? []);
}

export interface NotificationsResult {
  notifications: AppNotification[];
  total: number;
  hasMore: boolean;
}

export async function getNotifications(page = 1): Promise<NotificationsResult> {
  const res = await api.get<NotificationsResult>('/notifications', { params: { page, limit: 30 } });
  return { notifications: res.notifications ?? [], total: res.total ?? 0, hasMore: !!res.hasMore };
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/notifications/read-all', {});
}

/** Map the backend profile user → our AuthUser. */
export function toAuthUser(u: Record<string, unknown>): AuthUser {
  return {
    id: Number(u.id),
    name: (u.fullName as string) ?? (u.name as string) ?? 'You',
    email: u.email as string | undefined,
    phoneNumber: u.phoneNumber as string | undefined,
    avatarUrl: (u.profileImage as string) ?? (u.avatarUrl as string) ?? null,
  };
}
