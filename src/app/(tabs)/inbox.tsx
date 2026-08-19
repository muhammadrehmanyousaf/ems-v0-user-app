/**
 * Inbox — notifications. Redrawn on v4.
 *
 * ── What was wrong ────────────────────────────────────────────────────────
 *
 * · **A gold medallion on every row.** A 40px gold-wash circle behind a
 *   gold-dark icon, per notification. On a list of thirty that is thirty gold
 *   circles — the third screen in this app to reach for the same ornament, after
 *   Account and Plan. Plus a gold unread dot per row and a gold "Mark all read"
 *   in the header: on a busy inbox, sixty-one colour events on a system that
 *   allows one.
 *
 * · **Rounded blocks with a tinted fill.** Each row was a `radius.md` box with
 *   a gold wash when unread. Rows on paper separated by hairlines say the same
 *   thing with nothing drawn.
 *
 * · **`relTime` was hardcoded English** — "just now", "5m ago", "2h ago",
 *   "3d ago" — built inside the component, so an Urdu customer read every
 *   timestamp in English. The fallback title `'Notification'` was too.
 *
 * ── What carries "unread" now ─────────────────────────────────────────────
 *
 * Type weight and one ink dot. An unread title is `title` semibold ink; a read
 * one is `body` regular muted. That is a real difference at a glance and it
 * costs no colour — and the dot is ink rather than gold because on this screen
 * gold would mean "unread", while everywhere else in the app it means "press
 * this".
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { EmptyState, ScreenHeader, Skeleton, Text } from '@/components/ui';
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/account/account.queries';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import type { AppNotification } from '@/lib/api/endpoints/account';
import { useAuthStore } from '@/store/auth';
import { haptics, layout, useTheme } from '@/theme';

function iconFor(type?: string): keyof typeof Ionicons.glyphMap {
  const s = (type ?? '').toLowerCase();
  if (s.includes('book')) return 'calendar-outline';
  if (s.includes('message') || s.includes('chat') || s.includes('inquir')) return 'chatbubble-outline';
  if (s.includes('review')) return 'star-outline';
  if (s.includes('pay')) return 'card-outline';
  if (s.includes('quote')) return 'pricetag-outline';
  return 'notifications-outline';
}

/**
 * Relative time, translated.
 *
 * The unit and the number are joined with a space in both languages, so Urdu
 * reads "5 منٹ پہلے" and English reads "5m ago" — the English suffix keeps its
 * leading-space-free abbreviation by carrying no space in the key itself.
 */
function relTime(iso: string | undefined, tr: (k: StringKey) => string, isUrdu: boolean): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);

  if (secs < 60) return tr('time.now');

  const join = (n: number, key: StringKey) =>
    isUrdu ? `${n} ${tr(key)}` : `${n}${tr(key)}`;

  if (secs < 3600) return join(Math.floor(secs / 60), 'time.minutes');
  if (secs < 86400) return join(Math.floor(secs / 3600), 'time.hours');
  if (secs < 604800) return join(Math.floor(secs / 86400), 'time.days');

  // Past a week a date is more useful than "23d ago".
  return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
}

export default function Inbox() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const q = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const items = q.data?.notifications ?? [];
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('inbox.title')}
        subtitle={authed && unread > 0 ? `${unread} ${tr('inbox.unread')}` : undefined}
        urdu={isUrdu}
        trailing={
          authed && unread > 0 ? (
            /* Mark-all-read is the one control this screen's header earns, and
               only while there is something unread to mark.

               `onDark`, NOT `primary`. `ScreenHeader` paints the deep register,
               so ink here is near-black on near-black: the control rendered and
               was completely invisible. Caught on screen — the tone rule is
               "one gold event per screen", not "ink everywhere", and a surface
               that is already dark inverts it. */
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr('inbox.markAllRead')}
              hitSlop={10}
              onPress={() => {
                haptics.light();
                markAll.mutate();
              }}
              style={({ pressed }) => ({ paddingVertical: 6, opacity: pressed ? 0.55 : 1 })}
            >
              <Text
                variant="label"
                tone="onDark"
                urdu={isUrdu}
                style={{ textDecorationLine: 'underline' }}
              >
                {tr('inbox.markAllRead')}
              </Text>
            </Pressable>
          ) : null
        }
      />

      {!authed ? (
        <EmptyState
          icon="notifications-outline"
          title={tr('inbox.signInTitle')}
          message={tr('inbox.signInSub')}
          actionLabel={tr('common.signIn')}
          onAction={() => router.push('/auth/login')}
          urdu={isUrdu}
        />
      ) : q.isLoading ? (
        <View style={{ paddingHorizontal: layout.gutter, gap: t.spacing.xl }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={56} radius={t.radius.xs} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={{
            paddingHorizontal: layout.gutter,
            paddingBottom: layout.tabBarSpace,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: { item: AppNotification; index: number }) => (
            <NotificationRow
              item={item}
              last={index === items.length - 1}
              onPress={() => {
                if (item.isRead) return;
                haptics.light();
                markRead.mutate(item.id);
              }}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title={tr('inbox.emptyTitle')}
              message={tr('inbox.emptySub')}
              urdu={isUrdu}
            />
          }
        />
      )}
    </View>
  );
}

function NotificationRow({
  item,
  last,
  onPress,
}: {
  item: AppNotification;
  last: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const unread = !item.isRead;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title ?? tr('inbox.fallbackTitle')}
      accessibilityState={{ selected: unread }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: isUrdu ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: t.spacing.lg,
        paddingVertical: t.spacing.lg,
        borderBottomWidth: last ? 0 : t.layout.hairline,
        borderBottomColor: t.colors.border,
        backgroundColor: pressed ? t.colors.sunken : 'transparent',
      })}
    >
      {/* A plain glyph. No medallion — the icon says what KIND of notification
          this is, and a tinted circle behind it adds nothing to that. */}
      <Ionicons
        name={iconFor(item.type)}
        size={20}
        color={unread ? t.colors.textPrimary : t.colors.textMuted}
        style={{ width: 22, textAlign: 'center', marginTop: 2 }}
      />

      <View style={{ flex: 1, gap: 3 }}>
        <View
          style={{
            flexDirection: isUrdu ? 'row-reverse' : 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: t.spacing.sm,
          }}
        >
          {/* Weight carries unread: `title` semibold ink vs `body` muted. */}
          <Text
            variant={unread ? 'title' : 'body'}
            tone={unread ? 'primary' : 'muted'}
            urdu={isUrdu}
            numberOfLines={1}
            style={{ flex: 1, textAlign: isUrdu ? 'right' : 'left' }}
          >
            {item.title ?? tr('inbox.fallbackTitle')}
          </Text>
          <Text variant="caption" tone="faint" urdu={isUrdu} numberOfLines={1}>
            {relTime(item.createdAt, tr, isUrdu)}
          </Text>
        </View>

        {item.message ? (
          <Text
            variant="caption"
            tone="muted"
            urdu={isUrdu}
            numberOfLines={2}
            style={{ textAlign: isUrdu ? 'right' : 'left' }}
          >
            {item.message}
          </Text>
        ) : null}
      </View>

      {/* Ink, not gold. On this screen gold would mean "unread"; everywhere
          else in the app it means "press this". */}
      {unread ? (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: t.colors.textPrimary,
            marginTop: 8,
          }}
        />
      ) : null}
    </Pressable>
  );
}
