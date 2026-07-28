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
  type ProfileUpdate,
} from '@/lib/api/endpoints/account';
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
      if (current) setUser({ ...current, name: vars.fullName ?? current.name, phoneNumber: vars.phoneNumber ?? current.phoneNumber });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) => changePassword(current, next),
  });
}
