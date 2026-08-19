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
