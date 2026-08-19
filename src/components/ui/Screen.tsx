/**
 * Screen — themed page wrapper with safe-area + optional scroll.
 *
 * ── `contentStyle` silently defeats the guard right above it ──────────────
 *
 * The comment on `tabBarSpace` says the reserve lives here "so a new screen
 * cannot forget it and end with its last row hidden behind the dock." It was
 * then spread BEFORE `contentStyle`, so any caller passing
 * `contentStyle={{ padding: 24 }}` overwrote `paddingBottom` — shorthand beats
 * longhand in RN's flatten — and the last row went straight back under the
 * floating dock. A guarantee a sibling prop can quietly cancel is not a
 * guarantee. The reserve is applied LAST now, and it takes the larger of its own
 * value and whatever the caller asked for rather than fighting them.
 *
 * ── `padded` used the wrong unit ──────────────────────────────────────────
 *
 * `spacing.lg` (16) while every screen this wraps insets by `layout.gutter`
 * (24), so a padded Screen's edges did not line up with the edges of the
 * ScreenHeader sitting inside it. Same mismatch CompareBar had.
 *
 * ── Most of this API is not used ──────────────────────────────────────────
 *
 * One production call site: `<Screen scroll>` in the account tab. `padded`,
 * `edges`, `background`, `contentStyle` and the entire non-scroll branch have
 * never run. Kept rather than deleted because they are cheap and correct, but
 * treat them as unproven — `Sheet` and `StatusTimeline` were both in exactly
 * this state and both turned out to be broken the first time they were used.
 */
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { layout, useTheme } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  background?: string;
  contentStyle?: ViewStyle;
}

export function Screen({
  children,
  scroll = false,
  padded = false,
  edges = ['top'],
  background,
  contentStyle,
}: ScreenProps) {
  const t = useTheme();
  const bg = background ?? t.colors.screen;
  const pad = padded ? { padding: layout.gutter } : undefined;

  const inner = <View style={[styles.flex, pad, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: bg }]} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            pad,
            contentStyle,
            /**
             * The tab bar is a FLOATING dock — it occupies no layout space, so
             * content scrolls under it. This reserve goes last so `contentStyle`
             * cannot erase it, and takes whichever bottom padding is larger so a
             * caller asking for more still gets more.
             */
            { paddingBottom: Math.max(layout.tabBarSpace, bottomPad(contentStyle)) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

/** Whatever bottom padding a caller asked for, however they spelled it. */
function bottomPad(style?: ViewStyle): number {
  if (!style) return 0;
  const v = style.paddingBottom ?? style.paddingVertical ?? style.padding;
  return typeof v === 'number' ? v : 0;
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
