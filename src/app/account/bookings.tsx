import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, type BadgeTone, Card, EmptyState, Row, Skeleton, Stack, Text } from '@/components/ui';
import { useMyBookings } from '@/features/account/account.queries';
import { formatRs } from '@/features/vendors/vendor-display';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import type { Booking } from '@/lib/api/endpoints/account';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme';

function statusTone(status?: string): BadgeTone {
  const s = (status ?? '').toLowerCase();
  if (s.includes('confirm')) return 'success';
  if (s.includes('complete')) return 'info';
  if (s.includes('cancel') || s.includes('declin')) return 'danger';
  return 'gold';
}
function bookingTitle(b: Booking): string {
  return b.businessName ?? b.eventType ?? `Booking #${b.id}`;
}
function bookingDate(b: Booking): string | null {
  if (!b.eventDate) return null;
  const d = new Date(b.eventDate);
  return Number.isNaN(d.getTime()) ? String(b.eventDate) : d.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Bookings() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const q = useMyBookings();

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <T k="bookings.title" variant="h1" />
      </Row>

      {!authed ? (
        <EmptyState icon="lock-closed-outline" title={tr('bookings.signInTitle')} message={tr('bookings.signInSub')} actionLabel={tr('common.signIn')} onAction={() => router.push('/auth/login')} urdu={isUrdu} />
      ) : q.isLoading ? (
        <View style={{ padding: t.spacing.lg, gap: t.spacing.md }}>
          {[0, 1].map((i) => <Skeleton key={i} height={88} radius={8} />)}
        </View>
      ) : q.isError ? (
        <EmptyState icon="cloud-offline-outline" title={tr('bookings.loadError')} actionLabel={tr('common.retry')} onAction={() => q.refetch()} urdu={isUrdu} />
      ) : (
        <FlatList
          data={q.data ?? []}
          keyExtractor={(b) => String(b.id)}
          contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md, paddingBottom: t.spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card onPress={item.businessId ? () => router.push(`/vendor/${item.businessId}`) : undefined}>
              <Row justify="space-between">
                <Stack gap="xxs" style={{ flex: 1 }}>
                  <Text variant="title">{bookingTitle(item)}</Text>
                  {bookingDate(item) ? (
                    <Row gap="xxs">
                      <Ionicons name="calendar-outline" size={13} color={t.colors.textMuted} />
                      <Text variant="caption" tone="muted">{bookingDate(item)}</Text>
                    </Row>
                  ) : null}
                  {typeof item.totalAmount === 'number' && item.totalAmount > 0 ? (
                    <Text variant="bodyMedium" tone="gold">{formatRs(item.totalAmount)}</Text>
                  ) : null}
                </Stack>
                <Badge label={item.status ?? 'Pending'} tone={statusTone(item.status)} />
              </Row>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title={tr('bookings.emptyTitle')}
              message={tr('bookings.emptySub')}
              actionLabel={tr('common.exploreVendors')}
              onAction={() => router.push('/explore')}
              urdu={isUrdu}
            />
          }
        />
      )}
    </View>
  );
}
