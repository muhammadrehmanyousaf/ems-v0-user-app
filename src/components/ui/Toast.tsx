/**
 * Toast — spec: docs/05-UI-SPEC.md §19.
 *
 * A zustand store rather than context, so any layer can fire one without a
 * provider chain — including an API error handler that has no component around it.
 *
 * ── Two rules from rules.md §5 encoded here ──────────────────────────────
 *
 * 1. **The copy must match the control that fired it.** "Publish" → "Published".
 *    A button saying "Save" whose toast says "Changes updated successfully" makes
 *    the customer wonder whether the thing they pressed is the thing that ran.
 * 2. **Errors say what went wrong AND what to do.** `ApiError.message` is already
 *    customer-facing, so pass it straight through; never "Something went wrong".
 *
 * Position sits ABOVE the sticky action bar, because the bar is the tallest
 * bottom furniture and a toast behind it is a toast nobody reads.
 *
 * ── What v4 changed ───────────────────────────────────────────────────────
 *
 * It was a pastel box with a saturated 1px outline in the same hue — so the
 * whole surface changed colour with the tone, and a success message painted a
 * green rectangle across the bottom of a paper screen.
 *
 * A toast FLOATS OVER content. That is the job `surfaceInverse` exists for, and
 * it is why `CompareBar` uses it: the deep register separates from anything
 * beneath it without a shadow, and it looks the same whatever the tone. The
 * semantic colour moves to the ICON, where one 18px glyph carries the meaning
 * and nothing else has to change.
 *
 * Two accessibility fixes came with it: the dismiss control was labelled with a
 * hardcoded English `"Dismiss"` in a bilingual app, and the toast had no live
 * region — so a screen reader announced booking failures and payment errors by
 * saying nothing at all.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { useT } from '@/i18n/useT';
import { haptics, layout, useTheme } from '@/theme';

import { Text } from './Text';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  tone: ToastTone;
  /** Optional single action — "Retry", "Undo". */
  actionLabel?: string;
  onAction?: () => void;
  show: (message: string, tone?: ToastTone, action?: { label: string; onPress: () => void }) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  tone: 'info',
  show: (message, tone = 'info', action) => {
    if (tone === 'error') haptics.error();
    else if (tone === 'success') haptics.success();
    set({ message, tone, actionLabel: action?.label, onAction: action?.onPress });
  },
  hide: () => set({ message: null, actionLabel: undefined, onAction: undefined }),
}));

/** Convenience helpers so call sites read as sentences. */
export const toast = {
  success: (m: string) => useToast.getState().show(m, 'success'),
  error: (m: string, action?: { label: string; onPress: () => void }) =>
    useToast.getState().show(m, 'error', action),
  info: (m: string) => useToast.getState().show(m, 'info'),
};

/** Mount once, inside the root layout, above everything else. */
export function ToastHost() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const { message, tone, actionLabel, onAction, hide } = useToast();

  // Errors linger — a customer needs time to read what went wrong and decide.
  const duration = tone === 'error' ? 6000 : 3000;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, duration);
    return () => clearTimeout(timer);
  }, [message, duration, hide]);

  if (!message) return null;

  /**
   * ONE surface, three icons. The tone colours the glyph and nothing else — a
   * toast that repaints its whole background per outcome is three components
   * wearing one name.
   *
   * `goldLight` / `successBg` / `dangerBg` are the light-on-dark variants:
   * `colors.success` at #2F6B45 on the deep register is unreadable, so each
   * tone uses the tint that was designed to sit ON dark.
   */
  const iconFor: Record<ToastTone, { fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    success: { fg: t.colors.successBg, icon: 'checkmark-circle' },
    error: { fg: t.colors.dangerBg, icon: 'alert-circle' },
    info: { fg: t.colors.onDark, icon: 'information-circle' },
  };
  const c = iconFor[tone];

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(180)}
      pointerEvents="box-none"
      // Announced, not just drawn. Without this a screen reader says nothing
      // when a booking fails.
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={{
        position: 'absolute',
        // `layout.gutter`, so the toast lines up with the content it covers.
        left: layout.gutter,
        right: layout.gutter,
        // Clears the sticky action bar (54 + padding) plus the safe area.
        bottom: insets.bottom + 92,
        zIndex: 999,
      }}
    >
      <View
        style={{
          flexDirection: isUrdu ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: t.spacing.md,
          // The deep register — see the header note. No border, no shadow.
          backgroundColor: t.colors.surfaceInverse,
          borderRadius: t.radius.md,
          paddingHorizontal: t.spacing.lg,
          paddingVertical: t.spacing.md,
        }}
      >
        <Ionicons name={c.icon} size={18} color={c.fg} />
        {/* The message is always `onDark`. Only the glyph carries the tone. */}
        <Text
          variant="label"
          tone="onDark"
          urdu={isUrdu}
          numberOfLines={3}
          style={{ flex: 1, textAlign: isUrdu ? 'right' : 'left' }}
        >
          {message}
        </Text>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              onAction();
              hide();
            }}
          >
            <Text
              variant="label"
              tone="onDark"
              urdu={isUrdu}
              style={{ textDecorationLine: 'underline' }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('common.dismiss')}
            hitSlop={10}
            onPress={hide}
          >
            <Ionicons name="close" size={16} color={t.colors.onDark} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
