/**
 * The floating "Compare (N)" tray — appears once vendors are added to it.
 * Redrawn on v4.
 *
 * ── What was wrong ────────────────────────────────────────────────────────
 *
 * · **All three of its strings were hardcoded English** — `"{n} to compare"`,
 *   `"Clear"`, `"Compare"` — on a control that appears over the Explore grid,
 *   which is fully translated. An Urdu customer shortlisting four venues got an
 *   English bar sliding up over an Urdu screen.
 *
 * · `colors.charcoalSurface` is a deprecated v3 alias for `surfaceInverse`.
 *
 * · **It never mirrored.** The count sat left and the action right in both
 *   interfaces, so in Urdu the bar read against the direction of everything
 *   above it.
 *
 * · **`Clear` had no `accessibilityRole`** — a destructive control that empties
 *   the tray, announced to a screen reader as plain text.
 *
 * · It inset itself by `spacing.lg` (16) while every screen it floats over uses
 *   `layout.gutter` (24), so the bar's edges never lined up with the content
 *   underneath it.
 *
 * The deep register is kept deliberately. This bar floats OVER content and has
 * to separate from whatever is beneath it — that is exactly the job
 * `surfaceInverse` exists for, and it is why the tray needs no shadow to read
 * as a layer.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { ltr } from '@/i18n/bidi';
import { useT } from '@/i18n/useT';
import { useCompareStore } from '@/store/compare';
import { haptics, layout, useTheme } from '@/theme';

export function CompareBar({ bottomOffset = 76 }: { bottomOffset?: number }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const ids = useCompareStore((s) => s.ids);
  const clear = useCompareStore((s) => s.clear);

  if (ids.length === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: layout.gutter,
        right: layout.gutter,
        bottom: bottomOffset,
        flexDirection: isUrdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.spacing.md,
        backgroundColor: t.colors.surfaceInverse,
        borderRadius: t.radius.lg,
        paddingVertical: t.spacing.md,
        paddingHorizontal: t.spacing.lg,
      }}
    >
      <View
        style={{
          flexDirection: isUrdu ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: t.spacing.sm,
          flexShrink: 1,
        }}
      >
        <Ionicons name="git-compare-outline" size={18} color={t.colors.onDark} />
        <Text variant="bodyMedium" tone="onDark" urdu={isUrdu} numberOfLines={1}>
          {`${ltr(String(ids.length), isUrdu)} ${tr('compare.toCompare')}`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr('compare.clear')}
          onPress={() => {
            haptics.light();
            clear();
          }}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.45 : 0.7 })}
        >
          <Text
            variant="caption"
            tone="onDark"
            urdu={isUrdu}
            style={{ textDecorationLine: 'underline' }}
          >
            {tr('compare.clear')}
          </Text>
        </Pressable>
      </View>

      <Button
        label={tr('compare.title')}
        urdu={isUrdu}
        size="sm"
        onPress={() => router.push('/compare')}
        disabled={ids.length < 2}
        iconRight={isUrdu ? 'arrow-back' : 'arrow-forward'}
      />
    </View>
  );
}
