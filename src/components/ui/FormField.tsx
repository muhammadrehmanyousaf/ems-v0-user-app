/**
 * FormField — spec: docs/05-UI-SPEC.md §4.
 *
 * Wraps `Input` and adds the things every real form needs and every hand-rolled
 * form forgets: a character counter, and validation that fires on BLUR.
 *
 * ── Why validate on blur, not per keystroke ──────────────────────────────
 *
 * Per-keystroke validation tells a customer their phone number is invalid while
 * they are still typing the second digit. It is technically true and practically
 * hostile. On blur, the customer has finished their thought and the message is
 * information rather than nagging.
 *
 * The error is also held until the field has been touched at least once, so a
 * pristine form never opens covered in red.
 *
 * `DraftResumeBanner` lives here too because a restored draft belongs at the top
 * of the form it restores — the web learned this the hard way by keying the
 * banner to the wrong draft identity, so it offered to restore a draft belonging
 * to a different booking.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

import { Input, type InputProps } from './Input';
import { Text } from './Text';

export interface FormFieldProps extends Omit<InputProps, 'error'> {
  /** Return an error string, or null when valid. Runs on blur. */
  validate?: (value: string) => string | null;
  /** An error owned by the parent (e.g. from the server) — always shown. */
  error?: string | null;
  /** Show `n/max` under the field. Pairs with `maxLength`. */
  showCounter?: boolean;
}

export function FormField({
  validate,
  error: externalError,
  showCounter,
  maxLength,
  value,
  onBlur,
  onChangeText,
  hint,
  ...rest
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const text = typeof value === 'string' ? value : '';
  // A server error outranks local validation — it is the more authoritative "no".
  const error = externalError ?? (touched ? localError : null);

  const counter =
    showCounter && maxLength ? `${text.length}/${maxLength}` : undefined;

  return (
    <View>
      <Input
        {...rest}
        value={value}
        maxLength={maxLength}
        error={error ?? undefined}
        hint={error ? undefined : hint}
        onChangeText={(next) => {
          // Clear a stale error as soon as the customer starts fixing it —
          // leaving it up while they type reads as "still wrong".
          if (localError) setLocalError(null);
          onChangeText?.(next);
        }}
        onBlur={(e) => {
          setTouched(true);
          if (validate) setLocalError(validate(text));
          onBlur?.(e);
        }}
      />
      {counter ? (
        <Text
          variant="caption"
          tone={maxLength && text.length >= maxLength ? 'warning' : 'faint'}
          style={{ textAlign: 'right', marginTop: -14, marginBottom: 4, fontSize: 11 }}
        >
          {counter}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * DraftResumeBanner — offered when a saved draft exists for THIS form.
 *
 * The identity check is the caller's job and it matters: the web keyed this to
 * the wrong draft and offered a customer a draft from a different booking.
 *
 * ── What v4 changed ───────────────────────────────────────────────────────
 *
 * Two things, and the first is not a design problem at all.
 *
 * · **The strings were inline `urdu ? '…' : '…'` ternaries.** Four of them,
 *   right here in the component. That is prohibition 3 in rules.md — a string a
 *   customer can read that never reaches `strings.ts`, so nobody reviewing the
 *   Urdu ever sees it and nobody searching for the English ever finds it. They
 *   are `draft.*` keys now.
 *
 * · **It was a bordered, filled warning card.** A resumable draft is not a
 *   warning: nothing is wrong, and the amber fill made an offer look like a
 *   problem. It is a hairline-ruled band on paper with an ink icon — quieter
 *   than the form it sits above, which is the correct relative weight for
 *   something the customer may simply ignore.
 */
export function DraftResumeBanner({
  savedAt,
  onResume,
  onDiscard,
  urdu,
}: {
  /** Already-formatted, e.g. "2 hours ago". */
  savedAt: string;
  onResume: () => void;
  onDiscard: () => void;
  urdu?: boolean;
}) {
  const t = useTheme();
  const { t: tr } = useT();
  return (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: t.spacing.md,
        paddingVertical: t.spacing.md,
        borderTopWidth: t.layout.hairline,
        borderBottomWidth: t.layout.hairline,
        borderColor: t.colors.border,
      }}
    >
      <Ionicons name="document-text-outline" size={18} color={t.colors.textMuted} />

      <View style={{ flex: 1 }}>
        <Text
          variant="label"
          tone="primary"
          urdu={urdu}
          numberOfLines={1}
          style={{ textAlign: urdu ? 'right' : 'left' }}
        >
          {tr('draft.title')}
        </Text>
        <Text
          variant="caption"
          tone="muted"
          urdu={urdu}
          numberOfLines={1}
          style={{ textAlign: urdu ? 'right' : 'left' }}
        >
          {`${tr('draft.savedPrefix')} ${savedAt}`}
        </Text>
      </View>

      {/* Resume is the offer, so it keeps a real label. Discard is the quiet
          escape and stays a glyph — an equally-weighted pair of text buttons
          would make dismissing look like the expected choice. */}
      <Pressable
        accessibilityRole="button"
        onPress={onResume}
        hitSlop={8}
        style={({ pressed }) => (pressed ? { opacity: 0.55 } : null)}
      >
        <Text variant="label" tone="primary" urdu={urdu} style={UNDERLINE}>
          {tr('draft.resume')}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tr('draft.discard')}
        onPress={onDiscard}
        hitSlop={10}
        style={({ pressed }) => (pressed ? { opacity: 0.55 } : null)}
      >
        <Ionicons name="close" size={17} color={t.colors.textMuted} />
      </Pressable>
    </View>
  );
}

const UNDERLINE = { textDecorationLine: 'underline' as const };
