/** Screen — themed page wrapper with safe-area + optional scroll. */
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

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
  const pad = padded ? { padding: t.spacing.lg } : undefined;

  const inner = <View style={[styles.flex, pad, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: bg }]} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[padded ? { padding: t.spacing.lg } : undefined, contentStyle]}
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

const styles = StyleSheet.create({ flex: { flex: 1 } });
