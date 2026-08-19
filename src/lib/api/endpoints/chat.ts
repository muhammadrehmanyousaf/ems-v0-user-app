/**
 * Chat — the customer↔vendor conversation.
 *
 * The backend has had this live the whole time (`/api/v1/chat/*`, plus Socket.io
 * `chat:*` events) and the web uses it from the vendor detail page. This app had
 * no chat at all: the vendor detail screen offered WhatsApp and a phone call and
 * nothing that stayed inside the product. Every conversation therefore left the
 * platform on the first tap, which is also why we hold no record of what was
 * agreed when a booking later goes wrong.
 *
 * ── The contract, read from the router, not assumed ───────────────────────
 *
 *   GET  /chat/conversations                    the customer's threads
 *   POST /chat/conversations                    { otherUserId, bookingId? }
 *   GET  /chat/conversations/:id/messages
 *   POST /chat/conversations/:id/messages
 *   GET  /chat/unread-total
 *
 * `POST /conversations` is **create-or-get**, so opening a chat with the same
 * vendor twice returns the same thread rather than a duplicate. That is the
 * behaviour the screen relies on: the button is always "Chat", never "Start a
 * new chat", and it always lands in the existing conversation.
 *
 * 🔑 `otherUserId` is the vendor's **`userId`**, not the business id. They are
 * different numbers on every row — the business is 3358 while its owner might be
 * 2841 — and passing the business id creates a conversation with whichever
 * unrelated user happens to hold that id. The screen must read `vendor.userId`.
 *
 * Socket.io is not wired here. Messages are sent and read over REST, which the
 * backend added precisely because sockets do not survive Pakistani mobile
 * networks reliably ("Phase 0 #1 — REST send-message companion to the live
 * socket path"). Live delivery can be layered on later without changing this.
 */
import { api } from '@/lib/api/client';

/**
 * What the wire ACTUALLY sends, verified against live production:
 *
 *     id  conversationId  senderId  content  messageType  attachmentUrl
 *     attachmentName  isRead  readAt  isEdited  isDeleted  createdAt
 *     updatedAt  sender{ id, fullName, profileImage }
 *
 * The app declared `message` and `type`. Neither exists.
 *
 * ── This made the chat screen render an empty thread, always ─────────────
 *
 * `Bubble` reads `message.message ?? ''` and then `if (!body) return null`. With
 * `content` on the wire and `message` in the type, **every bubble returned null**
 * — a conversation with thirty messages drew nothing at all, and the empty-state
 * copy ("say hello") appeared over a thread that was not empty.
 *
 * Nothing failed loudly because `[key: string]: unknown` on the old interface
 * let `message.message` type-check while returning `undefined`. That is the
 * same escape hatch that hid the wire-name bug on `GET /bookings/simple-user-
 * bookings`, and this is the **fourth** instance of the class in this app after
 * `contactPhone` on the inquiry, `content`/`messageType` on chat SEND, and the
 * bookings list.
 *
 * `sendMessage`'s own header predicted it: *"typed as one, every field reads
 * `undefined`, which would have surfaced as a blank bubble the moment bug 1 was
 * fixed."* It was right, and the READ path had it too.
 *
 * The fix is the same one every time: name the raw type after the WIRE, map it
 * ONCE in the open, and hand the screens a type whose fields mean what they say.
 */
interface WireChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content?: string | null;
  messageType?: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  isRead?: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  createdAt?: string;
  sender?: { id: number; fullName?: string; profileImage?: string | null };
}

/** What the screens read. Every field means what its name says. */
export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  /** Typed payloads were agreed before the screen was built: a quote or an
   *  availability card must not arrive as a string nobody can render. */
  type: 'text' | 'availability' | 'quote' | 'image' | string;
  /** The body. From `content` on the wire. */
  message: string;
  attachmentUrl?: string | null;
  isRead: boolean;
  /** A deleted message is not shown — the server still returns the row. */
  isDeleted: boolean;
  isEdited: boolean;
  createdAt?: string;
  senderName?: string;
}

function toChatMessage(w: WireChatMessage): ChatMessage {
  return {
    id: w.id,
    conversationId: w.conversationId,
    senderId: w.senderId,
    type: w.messageType ?? 'text',
    message: w.content ?? '',
    attachmentUrl: w.attachmentUrl ?? null,
    isRead: !!w.isRead,
    isDeleted: !!w.isDeleted,
    isEdited: !!w.isEdited,
    createdAt: w.createdAt,
    senderName: w.sender?.fullName,
  };
}

export interface Conversation {
  id: number;
  bookingId?: number | null;
  unreadCount?: number;
  lastMessage?: ChatMessage | null;
  participants?: { id: number; fullName?: string; profileImage?: string | null }[];
  [key: string]: unknown;
}

/** The customer's threads, newest first (server-ordered). */
export async function listConversations(): Promise<Conversation[]> {
  const res = await api.get<{ conversations?: Conversation[] } | Conversation[]>(
    '/chat/conversations',
  );
  return Array.isArray(res) ? res : (res?.conversations ?? []);
}

/**
 * Open the thread with a vendor, creating it only if it does not exist.
 * `otherUserId` is the vendor's USER id — see the note above.
 */
export async function openConversation(
  otherUserId: number,
  bookingId?: number,
): Promise<Conversation> {
  return api.post<Conversation>('/chat/conversations', {
    otherUserId,
    ...(bookingId != null ? { bookingId } : {}),
  });
}

export async function listMessages(conversationId: number | string): Promise<ChatMessage[]> {
  const res = await api.get<{ messages?: WireChatMessage[] } | WireChatMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
  );
  const rows = Array.isArray(res) ? res : (res?.messages ?? []);
  // Deleted rows still come down the wire. Dropping them here means no screen
  // has to remember to.
  return rows.map(toChatMessage).filter((m) => !m.isDeleted);
}

/**
 * Send a message — `POST /chat/conversations/:id/messages`.
 *
 * ── Two bugs lived in six lines here, and both were silent ──────────────
 *
 * **1. The keys were wrong.** This sent `{ message, type }`. `chatController
 * .createMessage` reads `req.body.content` and `req.body.messageType` and
 * accepts no aliases, so `content` resolved to `""` and every send came back
 * `400 "Message content required"`. Chat did not work from the app at all. The
 * web sends `{ content, messageType }` and always has.
 *
 * **2. The response is wrapped.** The handler returns
 * `{ message: messagePayload }`, so after the envelope unwrap the caller gets
 * an object with a `message` key — not a `ChatMessage`. Typed as one, every
 * field (`id`, `content`, `createdAt`) read `undefined`, which would have
 * surfaced as a blank bubble the moment bug 1 was fixed.
 *
 * The parameter is named `content`, not `message`, on purpose: it matches the
 * wire key, so the next person to touch this cannot reintroduce the mismatch by
 * shorthand-ing the object.
 */
export async function sendMessage(
  conversationId: number | string,
  content: string,
): Promise<ChatMessage> {
  const res = await api.post<{ message?: WireChatMessage } | WireChatMessage>(
    `/chat/conversations/${conversationId}/messages`,
    { content, messageType: 'text' },
  );
  const wire = (res as { message?: WireChatMessage })?.message ?? (res as WireChatMessage);
  return toChatMessage(wire);
}

/** Badge count for the Inbox tab. */
export async function getUnreadTotal(): Promise<number> {
  const res = await api.get<{ total?: number; unread?: number } | number>('/chat/unread-total');
  if (typeof res === 'number') return res;
  return res?.total ?? res?.unread ?? 0;
}
