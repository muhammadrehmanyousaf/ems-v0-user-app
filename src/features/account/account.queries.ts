/** Account query + mutation hooks (auth-gated). */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changePassword,
  getMyBookings,
  getNotifications,
  getProfile,
  markAllNotificationsRead,
  markNotificationRead,
  updateProfile,
  uploadProfilePicture,
  type ProfileUpdate,
} from '@/lib/api/endpoints/account';
import type { UploadFile } from '@/lib/api/endpoints/auth';
import {
  cancelBooking,
  getRefundPreview,
  type CancelBookingInput,
} from '@/lib/api/endpoints/bookingActions';
import { useAuthStore } from '@/store/auth';

export function useProfile() {
  const authed = useAuthStore((s) => s.status === 'authenticated');
  return useQuery({ queryKey: ['profile'], queryFn: getProfile, enabled: authed, staleTime: 5 * 60 * 1000 });
}

export function useMyBookings() {
  const authed = useAuthStore((s) => s.status === 'authenticated');
  return useQuery({ queryKey: ['bookings'], queryFn: getMyBookings, enabled: authed, staleTime: 60 * 1000 });
}

export function useNotifications() {
  const authed = useAuthStore((s) => s.status === 'authenticated');
  return useQuery({ queryKey: ['notifications'], queryFn: () => getNotifications(1), enabled: authed, staleTime: 30 * 1000 });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: ProfileUpdate) => updateProfile(data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      const current = useAuthStore.getState().user;
      if (current) {
        setUser({
          ...current,
          name: vars.fullName ?? current.name,
          // `email` was absent here, so a customer could change their address
          // and the header, the account tab and every prefilled form kept
          // showing the old one until the next cold start.
          email: vars.email ?? current.email,
          phoneNumber: vars.phoneNumber ?? current.phoneNumber,
        });
      }
    },
  });
}

/**
 * Profile photograph. Separate endpoint, separate mutation — it is not part of
 * the `PATCH /users/profile` body and never has been.
 *
 * The returned URL is written straight into the auth store so the avatar in the
 * header changes at the same moment as the one on this screen. Without that the
 * two disagree until the next launch, which reads as the upload having failed.
 */
export function useUploadAvatar() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (file: UploadFile) => uploadProfilePicture(file),
    onSuccess: (url) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      const current = useAuthStore.getState().user;
      if (current && url) setUser({ ...current, avatarUrl: url });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) => changePassword(current, next),
  });
}

// ── Cancelling a booking ────────────────────────────────────────────────────

/**
 * The refund figure, fetched only while the cancel sheet is open.
 *
 * `enabled` is the point: this is a live computation against the vendor's
 * policy and the day count, and it must be current at the moment the customer
 * decides — not cached from when the list loaded. `staleTime: 0` and no
 * retry-on-404 (the endpoint answers 404 when the refund engine is off for
 * that vendor, and `getRefundPreview` turns that into `null`, which is a real
 * answer the sheet renders differently from "we're still loading").
 */
export function useRefundPreview(bookingId: number | null) {
  const authed = useAuthStore((s) => s.status === 'authenticated');
  return useQuery({
    queryKey: ['refund-preview', bookingId],
    queryFn: () => getRefundPreview(bookingId as number),
    enabled: authed && bookingId != null,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

/**
 * Cancel. Invalidates the bookings list so the row redraws as cancelled, and
 * the preview so a re-open cannot show the pre-cancellation figure.
 *
 * No optimistic update. An optimistic cancel that fails leaves a customer
 * believing a wedding booking is cancelled when the vendor still holds the
 * date — the one state this screen must never show.
 */
export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CancelBookingInput) => cancelBooking(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['refund-preview'] });
    },
  });
}
