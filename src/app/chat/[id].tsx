/**
 * Chat thread — the conversation with one vendor.
 *
 * Route: `/chat/[id]` where `id` is the CONVERSATION id (not the vendor's).
 * Opened from vendor detail, which calls `openConversation(vendor.userId)`
 * first — that endpoint is create-or-get, so re-entering lands in the same
 * thread rather than making a new one.
 *
 * ── Why this screen exists ────────────────────────────────────────────────
 *
 * The vendor detail screen offered WhatsApp and a phone call and nothing else,
 * so every conversation left the platform on the first tap. Two consequences the
 * founder feels directly: we hold no record of what was agreed when a booking is
 * later disputed, and a customer who is not ready to hand over their phone
 * number has no way to ask a question at all.
 *
 * REST, not sockets. The backend added the REST send-message path specifically
 * because Socket.io does not survive Pakistani mobile networks reliably, and the
 * comment in its router says so. Live delivery can be layered on top later
 * without changing anything here; polling is deliberately absent for now rather
 * than fake-live at a cost to battery.
 *
 * -- Two things this screen got wrong -------------------------------------
 *
 * **1. Every bubble rendered as nothing.** The wire sends `content`; the type
 * said `message`; `Bubble` did `message.message ?? ''` and then
 * `if (!body) return null`. So a thread with thirty messages drew an empty
 * screen with "Start the conversation" over it. Fixed at the boundary in
 * `endpoints/chat.ts` - see the note on `WireChatMessage`.
 *
 * **2. A failed send destroyed the message.** `setDraft('')` ran BEFORE
 * `send.mutate(text)`, and the mutation had no `onError` at all. On the exact
 * networks this screen was written for, a customer typed a paragraph, pressed
 * send, the request failed, and the text was gone with nothing shown. The draft
 * is now cleared only ON SUCCESS, and a failure puts the text back and says so.
 *
 * Timestamps came with that. A screen whose stated purpose is holding "a record
 * of what was agreed when a booking is later disputed" cannot show messages
 * with no time on them.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Text, toast } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { listMessages, sendMessage, type ChatMessage } from '@/lib/api/endpoints/chat';
import { apiErrorMessage } from '@/lib/api/errors';
import { shortDate, to12h } from '@/lib/date';
import { useAuthStore } from '@/store/auth';
import { haptics, layout, useTheme } from '@/theme';

export default function ChatThread() {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const conversationId = params.id;
  const me = useAuthStore((s) => s.user);
  const [draft, setDraft] = useState('');

  const q = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => listMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 15_000,
  });

  const send = useMutation({
    mutationFn: (text: string) => sendMessage(conversationId, text),
    onSuccess: () => {
      // Clear the composer only once the server has the message. See the
      // header note - clearing before the request is how a paragraph typed on
      // a bad connection disappears.
      setDraft('');
      // Re-read from the server rather than splicing the response in: the row
      // the server stores carries the real id and timestamp, and a locally
      // invented message is how duplicate bubbles appear after a retry.
      void qc.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
    },
    onError: (e, text) => {
      // Put the words back. `ApiError.message` is already customer-facing, but
      // the actionable sentence is ours: the draft is safe, press send again.
      setDraft((d) => (d.trim() ? d : text));
      toast.error(apiErrorMessage(e, tr));
    },
  });

  const messages = q.data ?? [];

  const onSend = () => {
    const text = draft.trim();
    if (!text || send.isPending) return;
    haptics.light();
    // NOT `setDraft('')` here - see `onSuccess`.
    send.mutate(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      {/* Header — hairline, not a filled bar. */}
      <View
        style={{
          paddingTop: insets.top + t.spacing.sm,
          paddingBottom: t.spacing.md,
          paddingHorizontal: layout.gutter,
          flexDirection: isUrdu ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: t.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.border,
          backgroundColor: t.colors.card,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr('common.back')}
          hitSlop={12}
          onPress={() => router.back()}
        >
          <Ionicons
            name={isUrdu ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color={t.colors.textPrimary}
          />
        </Pressable>
        <Text variant="h3" numberOfLines={1} style={{ flex: 1 }}>
          {params.name || tr('chat.title')}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        {q.isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={t.colors.textMuted} />
          </View>
        ) : (
          <FlatList
            data={[...messages].reverse()}
            /**
             * Inverted so a new message appears at the thumb, and so the list
             * opens at the bottom without a scroll-to-end race.
             *
             * Each row does NOT re-flip itself. `VirtualizedList` already passes
             * an inversion style down to every cell, so a manual
             * `transform: [{ scaleY: -1 }]` on the row is a SECOND flip and
             * stands the text on its head. It was there, and it was invisible
             * for as long as the wire-name bug meant no bubble ever rendered -
             * three nested `scaleY(-1)` in the DOM, and an empty screen hiding
             * all of them.
             */
            inverted
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={{
              padding: layout.gutter,
              gap: t.spacing.md,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <EmptyState
                  icon="chatbubble-ellipses-outline"
                  title={tr('chat.emptyTitle')}
                  message={tr('chat.emptyBody')}
                />
              </View>
            }
            renderItem={({ item }) => (
              <Bubble message={item} mine={item.senderId === me?.id} urdu={isUrdu} locale={locale} />
            )}
          />
        )}

        {/* Composer */}
        <View
          style={{
            flexDirection: isUrdu ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            gap: t.spacing.sm,
            paddingHorizontal: layout.gutter,
            paddingTop: t.spacing.md,
            paddingBottom: insets.bottom + t.spacing.md,
            borderTopWidth: 1,
            borderTopColor: t.colors.border,
            backgroundColor: t.colors.card,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={tr('chat.placeholder')}
            placeholderTextColor={t.colors.textFaint}
            multiline
            style={{
              flex: 1,
              minHeight: layout.tapTarget,
              maxHeight: 120,
              paddingHorizontal: t.spacing.lg,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: t.radius.xl,
              borderWidth: 1,
              borderColor: t.colors.border,
              backgroundColor: t.colors.sunken,
              color: t.colors.textPrimary,
              fontFamily: t.fontFamily.body,
              fontSize: 15,
              textAlign: isUrdu ? 'right' : 'left',
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('chat.send')}
            disabled={!draft.trim() || send.isPending}
            onPress={onSend}
            style={{
              width: layout.tapTarget,
              height: layout.tapTarget,
              borderRadius: t.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              // The one gold event on this screen.
              backgroundColor: draft.trim() ? t.colors.primary : t.colors.disabledFill,
              borderWidth: 1,
              borderColor: draft.trim() ? t.colors.goldDark : t.colors.border,
            }}
          >
            {send.isPending ? (
              <ActivityIndicator size="small" color={t.colors.onPrimary} />
            ) : (
              <Ionicons
                name={isUrdu ? 'arrow-back' : 'arrow-forward'}
                size={20}
                color={draft.trim() ? t.colors.onPrimary : t.colors.textFaint}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * One message.
 *
 * Mine is the deep register; theirs is a hairline card on paper. It was a
 * gold-wash bubble with a gold hairline, which on a thirty-message thread is
 * fifteen gold events - and the one gold event on this screen is the send
 * button, which is the only thing here you press.
 */
function Bubble({
  message,
  mine,
  urdu,
  locale,
}: {
  message: ChatMessage;
  mine: boolean;
  urdu?: boolean;
  locale: string;
}) {
  const t = useTheme();
  const body = message.message;
  if (!body) return null;

  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        gap: 3,
      }}
    >
      <View
        style={{
          paddingHorizontal: t.spacing.lg,
          paddingVertical: t.spacing.md,
          borderRadius: t.radius.xl,
          // The corner nearest the sender is squared off, which is what makes a
          // bubble read as coming FROM somewhere rather than floating.
          borderBottomRightRadius: mine ? t.radius.xs : t.radius.xl,
          borderBottomLeftRadius: mine ? t.radius.xl : t.radius.xs,
          backgroundColor: mine ? t.colors.surfaceInverse : t.colors.card,
          borderWidth: mine ? 0 : t.layout.hairline,
          borderColor: t.colors.border,
        }}
      >
        <Text
          variant="body"
          tone={mine ? 'onDark' : 'body'}
          style={{ textAlign: urdu ? 'right' : 'left' }}
        >
          {body}
        </Text>
      </View>

      {/* The time. A screen that exists to be the record of what was agreed
          cannot show messages without one. Never `urdu` - a clock reading is
          Latin in both interfaces. */}
      {message.createdAt ? (
        <Text
          variant="caption"
          tone="faint"
          style={{
            fontSize: 11,
            textAlign: mine ? 'right' : 'left',
            paddingHorizontal: 4,
          }}
        >
          {msgTime(message.createdAt, locale)}
        </Text>
      ) : null}
    </View>
  );
}

/** `6:42 PM`, or `14 Aug, 6:42 PM` once it is not today. */
function msgTime(iso: string, locale = 'en'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  /**
   * `to12h`, not `toLocaleTimeString`. There were two twelve-hour formatters in
   * the app and they disagreed: the booking slots read "6 PM" and a chat bubble
   * read "5:02 pm", in the same interface, minutes apart. `en-PK` lowercases the
   * meridiem; `to12h` does not, and it also drops ":00" so a whole hour reads as
   * "6 PM" rather than "6:00 PM".
   *
   * One formatter, same argument as the one money formatter — two of anything
   * that renders the same value is how they drift.
   */
  const time = to12h(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);

  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return time;
  // Older than today, so the day matters. `shortDate` carries the locale, which
  // `toLocaleDateString('en-PK', …)` could not.
  return `${shortDate(d, locale)}, ${time}`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
