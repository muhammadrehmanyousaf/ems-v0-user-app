/**
 * SegmentedControl — spec: docs/05-UI-SPEC.md §13.
 *
 * ── The thumb is INK, not gold, and that is the v4 change ─────────────────
 *
 * It used to be the gold gradient, on the stated reasoning that "the selected
 * segment reads as the same material as the primary CTA". That reasoning is the
 * bug: a segmented control never appears on a screen that has no CTA, so making
 * it the same material guarantees two gold events where the system allows one —
 * and the one belongs to the button that advances the flow, not to a mode
 * switch. The thumb is the deep register now, the same ink the slot picker's
 * radio and the sheet's primary action use.
 *
 * The gradient went with it. `gradients.goldCta` is deprecated and resolves to
 * two identical stops, so the control was paying for a `LinearGradient` layer
 * to paint one flat colour.
 *
 * Track sits on `sunken` — the control has to look recessed for the thumb to
 * look raised, and with a flat fill that contrast is doing all the work.
 *
 * 2–4 segments only. At 5+ the labels stop fitting at 360px and it becomes a
 * chip row; the component enforces nothing here, but the spec does, and a
 * 5-segment control is a review comment.
 *
 * Options may carry a `sub` line — the calendar's `Dates │ Months │ Flexible`
 * does not need it, but the payment method switcher does ("Card · takes
 * minutes"), and Airbnb annotates filter segments with their average price.
 */
import { Pressable, View } from 'react-native';

import { haptics, useTheme } from '@/theme';

import { Text } from './Text';

export interface Segment<T extends string> {
  value: T;
  label: string;
  /** Optional second line — a price, a count, an expectation. */
  sub?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  urdu?: boolean;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  urdu,
}: SegmentedControlProps<T>) {
  const t = useTheme();
  const hasSub = segments.some((s) => !!s.sub);

  return (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        backgroundColor: t.colors.sunken,
        borderRadius: t.radius.pill,
        padding: 3,
        gap: 3,
      }}
    >
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable
            key={s.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: !!s.disabled }}
            disabled={s.disabled}
            onPress={() => {
              if (active) return;
              haptics.selection();
              onChange(s.value);
            }}
            style={{
              flex: 1,
              // 44 bare / 56 with a sub-line. 34 was under the tap-target
              // floor on the control a customer switches modes with.
              minHeight: hasSub ? 56 : 44,
              borderRadius: t.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: s.disabled ? 0.45 : 1,
              // Flat ink. No gradient layer, no shadow — a dark thumb on a
              // sunken track separates by value, which is the whole point of
              // having a recessed track.
              backgroundColor: active ? t.colors.surfaceInverse : 'transparent',
            }}
          >
            <Text
              variant="label"
              tone={active ? 'onDark' : 'body'}
              urdu={urdu}
              numberOfLines={1}
            >
              {s.label}
            </Text>
            {s.sub ? (
              // A sub-line is a figure — a price, a count — so never `urdu`.
              <Text
                variant="mono"
                tone={active ? 'onDark' : 'muted'}
                numberOfLines={1}
                style={{ fontSize: 12, marginTop: 1, opacity: active ? 0.82 : 1 }}
              >
                {s.sub}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
