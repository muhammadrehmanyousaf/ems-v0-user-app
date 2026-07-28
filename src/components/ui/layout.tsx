/** Layout primitives: Row, Stack, Divider, Section. */
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

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
}: {
  children: ReactNode;
  gap?: Spacing;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return <View style={[{ gap: t.spacing[gap] }, style]}>{children}</View>;
}

export function Divider({ style }: { style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.divider }, style]} />;
}

export function Section({
  title,
  action,
  children,
  gap = 'md',
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
    <View style={{ gap: t.spacing[gap] }}>
      {title || action ? (
        <Row justify="space-between">
          {title ? (
            <Text variant="overline" tone="label" urdu={urdu}>
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
