/**
 * Stepper — spec: docs/05-UI-SPEC.md §13.
 *
 * `[−] 500 [+]` for guest counts and quantities.
 *
 * Two details that matter more than they look:
 *
 * 1. **The value has a min-width.** Without it the row reflows every time the
 *    digit count changes — 9 → 10 → 100 physically moves both buttons under the
 *    customer's thumb mid-press. Guest counts cross exactly those boundaries.
 *
 * 2. **Long-press repeats.** A venue guest count is 500, not 5. Tapping `+`
 *    five hundred times is not a design; long-press ramps after 400ms and
 *    accelerates, and `step` can be raised (e.g. 25) for large ranges.
 *
 * ── What v4 changed ───────────────────────────────────────────────────────
 *
 * The two buttons were 36px circles with a card shadow and a GOLD glyph. Three
 * problems in one control: 36 is under the 44px floor (the `hitSlop` rescued
 * the touch target but not the thing a customer aims at), the shadow made two
 * more floating boxes on a screen that is meant to be hairlines and space, and
 * gold here is a second colour event on a screen whose gold is already spent on
 * the CTA. They are 46px hairline circles with an ink glyph now — square with
 * the steppers in the inquiry sheet, because two controls that do the same job
 * should not look like two different controls.
 *
 * The `unit` line was set at 9px. Nothing in this product is legible at 9px on
 * a mid-range Android in daylight; it is `caption` 13 now, and if that costs
 * height, the height was the point.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { haptics, useTheme } from '@/theme';

import { Text } from './Text';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** A unit rendered under the value — "guests", "plates". */
  unit?: string;
  urdu?: boolean;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99999,
  step = 1,
  unit,
  urdu,
}: StepperProps) {
  const t = useTheme();
  const [held, setHeld] = useState<-1 | 0 | 1>(0);

  /**
   * The latest value lives in a ref so the repeat timer never closes over a
   * stale count — that bug makes long-press appear to "stick" after one step.
   *
   * The ref is synced in an EFFECT, never during render. Writing a ref during
   * render is what `react-hooks/refs` forbids, and on this codebase that family
   * of violation is not theoretical: five separate device crashes came from
   * render-phase work feeding back into layout.
   */
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  useEffect(() => {
    if (held === 0) return;
    let delay = 400;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const next = Math.max(min, Math.min(max, latest.current + held * step));
      if (next !== latest.current) {
        latest.current = next;
        onChange(next);
      }
      // Accelerate, floored at 60ms so it stays controllable.
      delay = Math.max(60, delay * 0.72);
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [held, step, min, max, onChange]);

  const bump = (dir: -1 | 1) => {
    const next = Math.max(min, Math.min(max, value + dir * step));
    if (next === value) return;
    haptics.selection();
    onChange(next);
  };

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <View
      style={{
        // Mirrors in Urdu with everything else. `−` stays on the side the eye
        // starts from, which is the right in Urdu.
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: t.spacing.lg,
      }}
    >
      <StepButton
        icon="remove"
        label={`−${step}`}
        disabled={atMin}
        onPress={() => bump(-1)}
        onPressIn={() => setHeld(-1)}
        onPressOut={() => setHeld(0)}
      />
      <View style={{ minWidth: 78, alignItems: 'center' }}>
        {/* Never `urdu`. A guest count is digits, and Nastaliq numerals inside
            a Latin-set control read as a rendering fault. */}
        <Text variant="monoLarge" tone="primary">
          {value.toLocaleString('en-PK')}
        </Text>
        {unit ? (
          <Text
            variant="caption"
            tone="muted"
            urdu={urdu}
            numberOfLines={1}
            style={{ marginTop: 1 }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
      <StepButton
        icon="add"
        label={`+${step}`}
        disabled={atMax}
        onPress={() => bump(1)}
        onPressIn={() => setHeld(1)}
        onPressOut={() => setHeld(0)}
      />
    </View>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  /** "+25" / "−25" — a screen reader announcing "add" cannot say by how much. */
  label: string;
  disabled?: boolean;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => ({
        width: 46,
        height: 46,
        borderRadius: t.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: pressed ? t.colors.sunken : 'transparent',
        opacity: disabled ? 0.4 : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={t.colors.textPrimary} />
    </Pressable>
  );
}
