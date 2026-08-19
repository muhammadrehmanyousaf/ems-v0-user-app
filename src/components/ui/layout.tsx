/** Layout primitives: Row, Stack, Divider, Section. */
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme, type Spacing } from '@/theme';

import { Text } from './Text';

export function Row({
  children,
  gap = 'sm',
  align = 'center',
  justify = 'flex-start',
  style,
  wrap,
}: {
  children: ReactNode;
  gap?: Spacing;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  style?: ViewStyle;
  wrap?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: align, justifyContent: justify, gap: t.spacing[gap] },
        wrap && { flexWrap: 'wrap' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Stack({
  children,
  gap = 'md',
  style,
  onLayout,
}: {
  children: ReactNode;
  gap?: Spacing;
  style?: ViewStyle;
  /**
   * Forwarded to the underlying `View`. A layout primitive that swallows
   * `onLayout` forces its caller to wrap it in a bare `View` purely to measure
   * it, which is a node added to work around the primitive rather than with it.
   * The vendor detail's section index needs this Stack's own `y`.
   */
  onLayout?: ViewProps['onLayout'];
}) {
  const t = useTheme();
  return (
    <View onLayout={onLayout} style={[{ gap: t.spacing[gap] }, style]}>
      {children}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.divider }, style]} />;
}

export function Section({
  title,
  action,
  children,
  gap = 'lg',
  urdu,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  gap?: Spacing;
  urdu?: boolean;
}) {
  const t = useTheme();
  return (
    /**
     * `gap` defaults to `lg` (16) and sections sit `xxl` (32) apart — v3 used
     * `md` (12) for both, so a heading was the same distance from its own body
     * as from the previous section's, and the page read as one undifferentiated
     * column.
     */
    <View style={{ gap: t.spacing[gap] }}>
      {title || action ? (
        <Row justify="space-between">
          {title ? (
            /**
             * **`h2`, not a tracked gold overline.**
             *
             * `Section` is what renders ABOUT / REVIEWS / AVAILABILITY on the
             * vendor detail screen, and in v3 each was an 11px uppercase label
             * tracked to 1.76 in gold-brown — smaller than the body text it
             * introduced, and spending the accent colour on furniture. Six of
             * them ran down one screen.
             *
             * Redrawing `SectionHeader` did not touch these, because the detail
             * screen uses `Section`. Two components doing the same job is how a
             * revamp "misses" a screen: the one that was fixed is not the one
             * on screen.
             */
            <Text variant="h2" urdu={urdu} numberOfLines={2} style={{ flex: 1 }}>
              {title}
            </Text>
          ) : (
            <View />
          )}
          {action}
        </Row>
      ) : null}
      {children}
    </View>
  );
}
