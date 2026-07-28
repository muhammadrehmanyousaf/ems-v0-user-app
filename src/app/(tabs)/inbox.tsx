import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Row, Skeleton, Stack, Text } from '@/components/ui';
import { useMarkAllRead, useMarkNotificationRead, useNotifications } from '@/features/account/account.queries';
import type { AppNotification } from '@/lib/api/endpoints/account';
import { useAuthStore } from '@/store/auth';
import { haptics, useTheme } from '@/theme';

function iconFor(type?: string): keyof typeof Ionicons.glyphMap {
  const s = (type ?? '').toLowerCase();
  if (s.includes('book')) return 'calendar-outline';
  if (s.includes('message') || s.includes('chat') || s.includes('inquir')) return 'chatbubble-outline';
  if (s.includes('review')) return 'star-outline';
  if (s.includes('pay')) return 'card-outline';
  if (s.includes('quote')) return 'pricetag-outline';
  return 'notifications-outline';
}
function relTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
}

export default function Inbox() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const q = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const items = q.data?.notifications ?? [];
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row justify="space-between" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Text variant="h1">Inbox</Text>
        {authed && unread > 0 ? (
          <Pressable onPress={() => { haptics.light(); markAll.mutate(); }} hitSlop={8}>
            <Text variant="label" tone="gold">Mark all read</Text>
          </Pressable>
        ) : null}
      </Row>

      {!authed ? (
        <EmptyState icon="notifications-outline" title="Sign in for your inbox" message="Booking updates and vendor messages appear here." actionLabel="Sign in" onAction={() => router.push('/auth/login')} />
      ) : q.isLoading ? (
        <View style={{ padding: t.spacing.lg, gap: t.spacing.md }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={64} radius={8} />)}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.xs, paddingBottom: t.spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: AppNotification }) => (
            <Pressable
              onPress={() => { if (!item.isRead) markRead.mutate(item.id); }}
              style={{
                flexDirection: 'row',
                gap: 12,
                padding: t.spacing.md,
                borderRadius: t.radius.md,
                backgroundColor: item.isRead ? 'transparent' : 'rgba(201,149,106,0.08)',
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(201,149,106,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={iconFor(item.type)} size={20} color={t.colors.goldDark} />
              </View>
              <Stack gap="xxs" style={{ flex: 1 }}>
                <Row justify="space-between">
                  <Text variant="bodyMedium" tone={item.isRead ? 'body' : 'primary'} numberOfLines={1} style={{ flex: 1 }}>
                    {item.title ?? 'Notification'}
                  </Text>
                  <Text variant="caption" tone="muted">{relTime(item.createdAt)}</Text>
                </Row>
                {item.message ? (
                  <Text variant="caption" tone="muted" numberOfLines={2}>{item.message}</Text>
                ) : null}
              </Stack>
              {!item.isRead ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.gold, marginTop: 6 }} /> : null}
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState icon="notifications-outline" title="You’re all caught up" message="Booking updates and messages will appear here." />
          }
        />
      )}
    </View>
  );
}
