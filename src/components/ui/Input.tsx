/**
 * Input — **v4.** Governed by rules.md §0.0.
 *
 * ── What changed ──────────────────────────────────────────────────────────
 *
 * v3 drew a 44px field with a 1px border, a 10px radius and a tinted fill — a
 * web form control, and the single most dated-looking element left in the app.
 * Forms are where a product feels cheap or expensive, because they are where the
 * customer is doing work rather than looking.
 *
 * v4:
 *
 * • **56px tall, radius `lg`.** The same substance as the search field on Home,
 *   so a field looks like a field everywhere in the product.
 * • **The label sits ABOVE the field**, in `label` weight, rather than floating
 *   or living as a placeholder. A placeholder-as-label disappears the moment you
 *   type, which is exactly when a customer filling six fields needs it most.
 * • **Focus is a ring, not a colour change.** The border goes to ink and
 *   thickens; the fill never changes. A field that changes colour on focus
 *   reads as an error state to anyone who has used a form before.
 * • **The error slot is always reserved.** 18px, occupied or not, so a form does
 *   not jump every time a message appears — the classic mobile-form defect where
 *   the button you were reaching for moves as you tap.
 *
 * The `required` marker is a gold dot, not an asterisk: an asterisk beside a
 * word reads as a footnote, and half of Pakistani users will not associate it
 * with "mandatory" at all.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { type ReactNode, type Ref, useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onClear?: () => void;
  error?: string;
  /** Persistent helper text. Shares the reserved slot with `error`. */
  hint?: string;
  /** A unit or affordance rendered inside the field, right-aligned. */
  suffix?: ReactNode;
  required?: boolean;
  /** Render the label/error with the Nastaliq Urdu family. */
  urdu?: boolean;
  /**
   * Forwarded to the underlying TextInput so callers can `.focus()` it — Home's
   * search shortcut focuses Explore's field. A normal prop rather than
   * `forwardRef`: React 19 passes `ref` through to function components.
   */
  ref?: Ref<TextInput>;
}

const HEIGHT = 56;

export function Input({
  label,
  icon,
  onClear,
  error,
  hint,
  suffix,
  required,
  urdu,
  style,
  onFocus,
  onBlur,
  value,
  ...rest
}: InputProps) {
  const t = useTheme();
  const { t: tr } = useT();
  const [focused, setFocused] = useState(false);

  const border = error
    ? t.colors.danger
    : focused
      ? t.colors.textPrimary
      : t.colors.border;

  return (
    <View>
      {label ? (
        <View
          style={{
            flexDirection: urdu ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: t.spacing.sm,
          }}
        >
          <Text variant="label" urdu={urdu}>
            {label}
          </Text>
          {/* A gold dot, not an asterisk. An asterisk beside a word reads as a
              footnote reference, not as "you must fill this in". */}
          {required ? (
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: t.colors.primary,
              }}
            />
          ) : null}
        </View>
      ) : null}

      <View
        style={{
          flexDirection: urdu ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: t.spacing.md,
          height: HEIGHT,
          paddingHorizontal: t.spacing.lg,
          borderRadius: t.radius.lg,
          backgroundColor: t.colors.card,
          // Focus thickens the rule and darkens it to ink. The FILL never
          // changes — a field that changes colour on focus reads as an error.
          borderWidth: focused || error ? 1.5 : 1,
          borderColor: border,
        }}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? t.colors.textPrimary : t.colors.textMuted}
          />
        ) : null}

        <TextInput
          {...rest}
          value={value}
          placeholderTextColor={t.colors.textFaint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              height: '100%',
              color: t.colors.textPrimary,
              fontFamily: t.fontFamily.body,
              fontSize: 15,
              textAlign: urdu ? 'right' : 'left',
            },
            style,
          ]}
        />

        {suffix ?? null}

        {onClear && value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('common.clear')}
            hitSlop={10}
            onPress={onClear}
          >
            <Ionicons name="close-circle" size={18} color={t.colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      {/*
        The message slot is ALWAYS 18px, occupied or not. Without it the whole
        form shifts up and down as messages appear and clear — and the thing that
        moves is usually the button the customer is already reaching for.
      */}
      <View style={{ minHeight: 18, marginTop: 6, justifyContent: 'center' }}>
        {error ? (
          <Text variant="caption" tone="danger" urdu={urdu}>
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" tone="muted" urdu={urdu}>
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
