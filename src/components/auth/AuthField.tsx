/**
 * AuthField — a hairline text field with a floating label.
 *
 * Governed by rules.md §0.0.
 *
 * ── Why there is no box ───────────────────────────────────────────────────
 *
 * The first version of this component drew a 66px rounded rectangle with a
 * `sunken` fill and a border. On screen it read as **washed out and cheap** —
 * two pale grey slabs on a white sheet, indistinguishable from disabled
 * controls — and it was, more importantly, on the wrong side of the reference
 * table in rules.md §0.0:
 *
 *   > **Hairline dividers** carry the structure  ·  ~~Bordered, shadowed cards everywhere~~
 *
 * A filled, bordered input is a card. The system says structure comes from a
 * rule and from space, so the field is now a rule and some space: ink on paper
 * over a 1px line. Nothing else. It is also how every editorial-register form
 * is set, and it removes two greys from the screen.
 *
 * ── Why the label floats instead of sitting above ─────────────────────────
 *
 * A label stacked above its input costs ~20px per field — 100px across a
 * five-field signup, a sixth of a 360×800 screen — and makes the form read as
 * paperwork: caption, box, caption, box.
 *
 * Floating it keeps the question visible after the answer is typed, which a
 * placeholder cannot do. That is not a style preference: a placeholder-only
 * field is how people end up with their phone number in the name box, because
 * by the time they are typing, the only thing on screen is their own text.
 *
 * ── On the animation driver ───────────────────────────────────────────────
 *
 * Deliberately NOT native-driven. Translate + scale would qualify, but scaling
 * text resamples the glyphs and on mid-range Android the label lands visibly
 * soft. Animating `fontSize` and `top` re-lays-out the text at its real size,
 * which is crisp; the cost is one absolutely-positioned label over 170ms, on a
 * screen with nothing else moving on the JS thread.
 *
 * ── Detail ────────────────────────────────────────────────────────────────
 *
 * The whole row is a Pressable, not just the input. With a hairline field the
 * visual target is thin, so the *touch* target has to be the full 62px band or
 * every tap is a near-miss.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { Text } from '@/components/ui';
import { colors, fontFamily, layout, radius, spacing } from '@/theme';

const HEIGHT = 56;
/** Label geometry. At rest it sits where the value will be — it IS the
 *  placeholder — and rises clear of the text on focus. */
const LABEL = { restTop: 23, restSize: 16, floatTop: 0, floatSize: 11.5 };

/**
 * Web preview only. RN Web renders a real `<input>`, and Chrome draws its
 * default focus ring on it — a hard black rectangle with square corners, right
 * through the middle of a design built on hairlines.
 *
 * `outlineWidth: 0` does not remove it: Chrome's default is
 * `outline-style: auto`, which ignores the width entirely (verified in the
 * page — computed `outline: rgb(16,16,16) auto 0px`). `none` is the only value
 * that works, and RN types `outlineStyle` as solid|dotted|dashed, hence the
 * cast. Null on native, where no such ring exists.
 */
const WEB_NO_FOCUS_RING = (Platform.OS === 'web'
  ? { outlineStyle: 'none' }
  : null) as TextStyle | null;

export interface AuthFieldProps
  extends Omit<TextInputProps, 'style' | 'placeholder' | 'placeholderTextColor'> {
  label: string;
  value: string;
  /** Marks the field without printing a second error message beside the one
   *  the screen already shows. */
  invalid?: boolean;
  urdu?: boolean;
  /** Renders the show/hide control and manages the masking itself. */
  secure?: boolean;
  showLabel?: string;
  hideLabel?: string;
}

export const AuthField = forwardRef<TextInput, AuthFieldProps>(function AuthField(
  { label, value, invalid, urdu, secure, showLabel, hideLabel, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const lifted = focused || value.length > 0;
  // `useState` initialiser, not `useRef(…).current` — the project lints the
  // latter (react-hooks/refs) because reading `.current` during render is how
  // the "Maximum update depth" crash class starts. Same once-only semantics.
  const [anim] = useState(() => new Animated.Value(lifted ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: lifted ? 1 : 0,
      duration: 170,
      easing: Easing.out(Easing.cubic),
      // See the header — fontSize cannot go on the native driver, and crisp
      // beats free for a single label.
      useNativeDriver: false,
    }).start();
  }, [lifted, anim]);

  const inner = useRef<TextInput>(null);
  const setRef = (node: TextInput | null) => {
    (inner as { current: TextInput | null }).current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: TextInput | null }).current = node;
  };

  const ruleColor = invalid ? colors.danger : focused ? colors.gold : colors.borderStrong;

  return (
    // `focusable={false}`: without it RN Web makes this wrapper a tab stop of its
    // own, which both draws a black focus rectangle around the field and gives
    // keyboard users a stop that does nothing. No-op on native.
    <Pressable
      accessible={false}
      focusable={false}
      onPress={() => inner.current?.focus()}
      style={styles.field}
    >
      <Animated.Text
        // Decorative: the TextInput carries the real accessibility label.
        accessible={false}
        importantForAccessibility="no"
        style={[
          styles.label,
          urdu ? styles.labelUr : null,
          {
            top: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [LABEL.restTop, LABEL.floatTop],
            }),
            fontSize: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [LABEL.restSize, LABEL.floatSize],
            }),
            letterSpacing: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }),
            color: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [
                invalid ? colors.danger : colors.textMuted,
                invalid ? colors.danger : colors.goldDark,
              ],
            }),
            fontFamily: urdu ? fontFamily.urdu : fontFamily.bodyMedium,
          },
        ]}
      >
        {label}
      </Animated.Text>

      <TextInput
        {...rest}
        ref={setRef}
        value={value}
        accessibilityLabel={label}
        secureTextEntry={secure ? !reveal : rest.secureTextEntry}
        selectionColor={colors.gold}
        cursorColor={colors.gold}
        // Android draws its OWN underline under a TextInput by default. With a
        // hairline field that lands directly on top of our rule — two lines, one
        // grey one gold, 1px apart. Native-only, and invisible on web, so it
        // would have shipped.
        underlineColorAndroid="transparent"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          WEB_NO_FOCUS_RING,
          urdu ? { textAlign: 'right', fontFamily: fontFamily.urdu } : null,
          secure ? styles.inputWithSuffix : null,
        ]}
      />

      {/* The rule. Thickens and turns gold on focus — the only thing on the
          sheet that changes colour, which is what makes it read as "you are
          here" rather than as decoration. */}
      <View
        style={[
          styles.rule,
          { backgroundColor: ruleColor, height: focused || invalid ? 1.6 : 1 },
        ]}
      />

      {secure ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={reveal ? hideLabel : showLabel}
          hitSlop={12}
          onPress={() => setReveal((r) => !r)}
          style={[styles.suffix, urdu ? { right: undefined, left: 0 } : null]}
        >
          <Ionicons
            name={reveal ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={focused ? colors.goldDark : colors.textMuted}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
});

/**
 * Password strength.
 *
 * Advisory, never a gate. The backend accepts eight characters and so do we —
 * a meter that blocks submission on a rule the server does not enforce is a
 * screen inventing policy, and it strands people who typed something perfectly
 * good. This says where you stand and gets out of the way.
 */
export function PasswordStrength({
  value,
  urdu,
  labels,
}: {
  value: string;
  urdu?: boolean;
  labels: [string, string, string, string];
}) {
  if (!value) return null;

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 12) score += 1;

  const tone = score <= 1 ? colors.danger : score === 2 ? colors.warning : colors.success;

  return (
    <View style={[styles.meter, urdu ? { flexDirection: 'row-reverse' } : null]}>
      <View style={[styles.bars, urdu ? { flexDirection: 'row-reverse' } : null]}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.bar, { backgroundColor: i < score ? tone : colors.border }]} />
        ))}
      </View>
      <Text variant="caption" urdu={urdu} style={{ color: tone, fontFamily: fontFamily.bodyMedium }}>
        {labels[Math.max(0, score - 1)]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { height: HEIGHT, justifyContent: 'flex-end' },
  label: { position: 'absolute', left: 0 },
  labelUr: { left: undefined, right: 0, textAlign: 'right' },
  input: {
    height: 34,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
    paddingBottom: 8,
    paddingHorizontal: 0,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
    fontFamily: fontFamily.body,
    // Android adds invisible leading around the glyphs that throws the label
    // and the value ~3px out of alignment. Off.
    includeFontPadding: false,
  },
  inputWithSuffix: { paddingRight: 40 },
  rule: { width: '100%', borderRadius: layout.hairline },
  suffix: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    height: 40,
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md + 2,
  },
  // 132px, not full width. At `flex: 1` the four segments sat directly under
  // the field rule at the same weight and read as a second divider.
  bars: { flexDirection: 'row', gap: 4, width: 132 },
  bar: { flex: 1, height: 2.5, borderRadius: radius.xs / 3 },
});
