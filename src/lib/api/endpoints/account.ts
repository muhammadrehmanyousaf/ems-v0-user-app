/** Customer account endpoints (auth-gated). Paths verified against live backend. */
import { api } from '@/lib/api/client';
import type { UploadFile } from '@/lib/api/endpoints/auth';
import { normalizeEmail, normalizePkPhone } from '@/lib/pk';
import type { AuthUser } from '@/store/auth';

/**
 * What `GET /bookings/simple-user-bookings` ACTUALLY returns, at wire names.
 *
 * The app declared a `Booking` with `businessName`, `eventDate`, `eventType`,
 * `paidAmount` and `totalAmount: number`. The endpoint sends none of those. It
 * sends `bookingDate`, a `totalAmount` STRING, no `paidAmount` at all, and the
 * venue nested two levels down in `bookingDetails[0].business.name`.
 *
 * Nothing failed loudly, because `[key: string]: unknown` on the old interface
 * made every one of those reads type-check while returning `undefined`. So the
 * bookings list rendered "Booking #212" with no venue, no date, and — since
 * `typeof "665000.00" === 'number'` is false — **no price**, on a screen whose
 * entire job is telling you what you booked, when, and for how much.
 *
 * Third instance of the wire-name bug class in this app, after `contactPhone`
 * on the inquiry and `content`/`messageType` on chat. The fix is the same one:
 * name the raw type after the WIRE, do the mapping ONCE and in the open, and
 * hand the screens a type that says what it means.
 */
interface WireBookingDetail {
  businessId?: number;
  packageId?: number;
  totalAmount?: string | number;
  downPayment?: string | number;
  business?: { id?: number; name?: string; city?: string; subArea?: string };
  package?: { id?: number; name?: string; price?: string | number };
  menu?: { id?: number; name?: string } | null;
}

interface WireBooking {
  id: number;
  customerEmail?: string;
  bookingDate?: string;
  bookingTime?: string;
  status?: string;
  paymentStatus?: string;
  /** Postgres DECIMAL — a STRING on the wire, always. */
  totalAmount?: string | number;
  downPayment?: string | number;
  createdAt?: string;
  eventCity?: string | null;
  bookingDetails?: WireBookingDetail[];
}

/** What the screens read. Every field means what its name says. */
export interface Booking {
  id: number;
  businessId?: number;
  businessName?: string;
  /** The venue's city — the list has no other way to disambiguate two
   *  "Rehman Marquee" rows, and Pakistan has a great many of those. */
  city?: string;
  /** The package booked. The nearest thing this endpoint has to an event type. */
  packageName?: string;
  /** `YYYY-MM-DD`, from `bookingDate`. */
  eventDate?: string;
  /** `HH:mm`, from `bookingTime`. The slot, and the thing a customer rings the
   *  venue about. */
  eventTime?: string;
  status?: string;
  paymentStatus?: string;
  /**
   * The address the BOOKING was made under — not necessarily the account's.
   *
   * `POST /payments/create-checkout-session` refuses unless the `customerEmail`
   * in the body equals `booking.customerEmail`, so paying requires carrying
   * this field rather than reading the auth store. On real production data the
   * two disagree: this customer's account is `…yousaf7866@gmail.com` while
   * bookings 7 and 19 are recorded against `qa.cust.fatima@example.com`.
   * Sending the account address would 403 both.
   *
   * They disagree because the list and the payment endpoints do not share a
   * definition of ownership — `getSimpleUserBookings` matches customerUserId
   * OR email OR PHONE, and `callerMayPayForBooking` has no phone arm. See
   * `getPayability` in endpoints/payments.ts.
   */
  customerEmail?: string;
  /** Numbers, coerced once, here. Never a DECIMAL string past this line. */
  totalAmount?: number;
  /** The advance. There is no `paidAmount` on this endpoint — `downPayment` is
   *  what the booking asks for, and `paymentStatus` says whether it landed. */
  downPayment?: number;
  createdAt?: string;
}

/** DECIMAL strings, nulls and numbers all arrive here. Only finite > 0 survives. */
function num(value: unknown): number | undefined {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function toBooking(w: WireBooking): Booking {
  // One booking can carry several details (a venue plus a caterer). The FIRST
  // is the one the row is about; the app has no multi-vendor booking UI yet and
  // showing the second vendor's name against the first vendor's price would be
  // worse than showing one of them.
  const d = w.bookingDetails?.[0];
  return {
    id: w.id,
    businessId: d?.businessId,
    businessName: d?.business?.name,
    city: d?.business?.city ?? w.eventCity ?? undefined,
    packageName: d?.package?.name,
    eventDate: w.bookingDate,
    eventTime: w.bookingTime,
    status: w.status,
    paymentStatus: w.paymentStatus,
    customerEmail: w.customerEmail,
    totalAmount: num(w.totalAmount) ?? num(d?.totalAmount),
    downPayment: num(w.downPayment) ?? num(d?.downPayment),
    createdAt: w.createdAt,
  };
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

/**
 * Self-service profile update — `PATCH /users/profile`.
 *
 * Mirrors `ems-v0/app/(main)/user/profile/page.tsx`, which sends
 * `{ fullName, email, phoneNumber }`. **`email` was missing here**, so an app
 * customer could not correct a typo in the one field every receipt, booking
 * confirmation and password reset is sent to.
 *
 * `city` is ours and not the web customer form's — verified accepted by
 * `userController.updateMyProfile`, which allowlists exactly
 * `fullName · email · phoneNumber · city`. Anything outside those four is
 * dropped silently, so do not add a field here without checking that list.
 *
 * Note this is NOT the vendor dashboard's nine-field profile
 * (`bookingEmail`, `officeAddress`, `website`…). That form belongs to a
 * business, not a customer, and copying it here would show a couple planning a
 * shaadi a box for their office address.
 */
export interface ProfileUpdate {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
}

export async function updateProfile(data: ProfileUpdate): Promise<void> {
  const body: ProfileUpdate = {};
  if (data.fullName !== undefined) body.fullName = data.fullName.trim();
  // Normalised on the way out, so the app and the web store one shape for the
  // same person. See lib/pk.ts.
  if (data.email !== undefined) body.email = normalizeEmail(data.email);
  if (data.phoneNumber !== undefined) body.phoneNumber = normalizePkPhone(data.phoneNumber);
  if (data.city !== undefined) body.city = data.city.trim();
  await api.patch('/users/profile', body);
}

/**
 * Profile photograph — `POST /users/upload-profile-picture`, multipart.
 *
 * The field name is `picture`, NOT `profileImage`. Signup uses
 * `profileImage`; this endpoint uses `picture`. They are different middlewares
 * and neither accepts the other's key — the wrong one uploads nothing and
 * returns a cheerful success.
 *
 * Returns the stored URL so the caller can show it without a refetch.
 */
export async function uploadProfilePicture(file: UploadFile): Promise<string | null> {
  const fd = new FormData();
  fd.append('picture', file as unknown as Blob);
  const res = await api.post<{ profileImage?: string } | null>(
    '/users/upload-profile-picture',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res?.profileImage ?? null;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.patch('/users/change-password', { currentPassword, newPassword });
}

/** GET /bookings/simple-user-bookings → Booking[], normalised at the boundary. */
export async function getMyBookings(): Promise<Booking[]> {
  const res = await api.get<WireBooking[] | { bookings?: WireBooking[]; data?: WireBooking[] }>(
    '/bookings/simple-user-bookings',
  );
  const rows = Array.isArray(res) ? res : (res.bookings ?? res.data ?? []);
  return rows.map(toBooking);
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
