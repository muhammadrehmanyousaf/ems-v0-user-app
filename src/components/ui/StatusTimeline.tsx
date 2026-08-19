/**
 * StatusTimeline — spec: docs/05-UI-SPEC.md §15. Redrawn on v4.
 *
 * A booking's life.
 *
 * ── Why four states and not two ──────────────────────────────────────────
 *
 * `done` / `current` / `future` / `failed` — because a couple's actual question
 * is never "what has happened", it is **"what is waiting on me?"**. A timeline
 * that only distinguishes past from future answers the wrong question. `current`
 * is the only step that draws a ring, so the answer is findable in one glance.
 *
 * The rail is drawn per-row rather than as one absolute line behind the list, so
 * a row of any height keeps its segment attached. Rows grow when a status carries
 * a reason ("Cancelled — vendor unavailable"), and an absolutely-positioned rail
 * detaches from the dots the moment that happens.
 *
 * Reduced motion removes the pulse. It is decoration; the ring already carries
 * the meaning.
 *
 * ── What v4 changed: the rail stopped being a colour chart ────────────────
 *
 * Every state used to have its own hue — green for done, gold for current, grey
 * for future — which on a four-step booking produced a green-and-gold ladder and
 * three colour events on a screen the system allows one. Worse, `current` was
 * gold, and gold in this system means *action*: the step you are waiting on
 * wore the same colour as the button you press.
 *
 * Now the rail is ink. `done` is a filled muted dot, `current` is a filled ink
 * dot at 16px with a ring, `future` is a hollow hairline. Weight and size carry
 * the three ordinary states, which is what they carry everywhere else in v4.
 *
 * `failed` keeps `danger`, and it is the only colour on the component. That is
 * the point: when the rail is monochrome, red means something.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion, useTheme } from '@/theme';

import { Text } from './Text';

export type StepState = 'done' | 'current' | 'future' | 'failed';

export interface TimelineStep {
  label: string;
  /** Already-formatted, e.g. "14 Aug, 3:40 PM". Empty for a future step. */
  timestamp?: string | null;
  state: StepState;
  /** A reason or detail — "vendor unavailable", "awaiting your payment". */
  note?: string | null;
}

export function StatusTimeline({ steps, urdu }: { steps: TimelineStep[]; urdu?: boolean }) {
  const t = useTheme();
  if (steps.length === 0) return null;

  return (
    <View>
      {steps.map((step, i) => (
        <Row
          key={`${step.label}-${i}`}
          step={step}
          isLast={i === steps.length - 1}
          urdu={urdu}
          t={t}
        />
      ))}
    </View>
  );
}

function Row({
  step,
  isLast,
  urdu,
  t,
}: {
  step: TimelineStep;
  isLast: boolean;
  urdu?: boolean;
  t: ReturnType<typeof useTheme>;
}) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (step.state !== 'current' || reduced) return;
    pulse.value = withRepeat(
      withTiming(1.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [step.state, reduced, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const isCurrent = step.state === 'current';
  const isFailed = step.state === 'failed';

  /**
   * Ink, muted, hairline — and `danger` only when something actually failed.
   * See the header note: a monochrome rail is what makes the red mean anything.
   */
  const colour = isFailed
    ? t.colors.danger
    : isCurrent
      ? t.colors.textPrimary
      : step.state === 'done'
        ? t.colors.textMuted
        : t.colors.borderStrong;

  const dotSize = isCurrent ? 16 : 11;

  return (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        gap: t.spacing.lg,
        minHeight: 56,
      }}
    >
      {/* Marker column — dot plus the segment to the next row. */}
      <View style={{ width: 16, alignItems: 'center' }}>
        <View style={{ height: 22, justifyContent: 'center' }}>
          {isCurrent ? (
            <Animated.View
              style={[
                pulseStyle,
                {
                  position: 'absolute',
                  alignSelf: 'center',
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: colour,
                  opacity: 0.22,
                },
              ]}
            />
          ) : null}
          <View
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderWidth: step.state === 'future' ? 1.5 : 0,
              borderColor: colour,
              backgroundColor: step.state === 'future' ? 'transparent' : colour,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {step.state === 'done' ? (
              <Ionicons name="checkmark" size={8} color={t.colors.white} />
            ) : isFailed ? (
              <Ionicons name="close" size={8} color={t.colors.white} />
            ) : null}
          </View>
        </View>
        {!isLast ? (
          // A hairline, not a 2px bar. The rail is structure, and structure in
          // v4 is one pixel wide.
          <View
            style={{
              width: t.layout.hairline,
              flex: 1,
              marginTop: 3,
              marginBottom: 3,
              backgroundColor:
                step.state === 'done' || isCurrent ? t.colors.borderStrong : t.colors.border,
            }}
          />
        ) : null}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingBottom: isLast ? 0 : t.spacing.lg }}>
        <View
          style={{
            flexDirection: urdu ? 'row-reverse' : 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: t.spacing.sm,
          }}
        >
          <Text
            // `title` for the live step against `body` for the rest: a 16
            // semibold beside a 15 regular is a real step, and it is the only
            // emphasis left now that the gold is gone.
            variant={isCurrent ? 'title' : 'body'}
            tone={step.state === 'future' ? 'faint' : isFailed ? 'danger' : 'primary'}
            urdu={urdu}
            numberOfLines={2}
            style={{ flex: 1, textAlign: urdu ? 'right' : 'left' }}
          >
            {step.label}
          </Text>
          {step.timestamp ? (
            // Never `urdu` — a timestamp is digits and stays Latin, the same
            // rule the money column and the slot hours follow.
            <Text variant="mono" tone="muted" numberOfLines={1} style={{ fontSize: 12 }}>
              {step.timestamp}
            </Text>
          ) : null}
        </View>
        {step.note ? (
          <Text
            variant="caption"
            tone={isFailed ? 'danger' : 'muted'}
            urdu={urdu}
            style={{ marginTop: 3, textAlign: urdu ? 'right' : 'left' }}
          >
            {step.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
