/** Floating "Compare (N)" bar — appears when vendors are added to the tray. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, Row, Text } from '@/components/ui';
import { useCompareStore } from '@/store/compare';
import { useTheme } from '@/theme';

export function CompareBar({ bottomOffset = 76 }: { bottomOffset?: number }) {
  const t = useTheme();
  const ids = useCompareStore((s) => s.ids);
  const clear = useCompareStore((s) => s.clear);

  if (ids.length === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: t.spacing.lg,
        right: t.spacing.lg,
        bottom: bottomOffset,
        backgroundColor: t.colors.charcoalSurface,
        borderRadius: t.radius.lg,
        paddingVertical: 10,
        paddingHorizontal: 14,
        ...t.elevation.lg,
      }}
    >
      <Row justify="space-between" gap="md">
        <Row gap="sm">
          <Ionicons name="git-compare-outline" size={18} color={t.colors.onDark} />
          <Text variant="bodyMedium" tone="onDark">
            {ids.length} to compare
          </Text>
          <Pressable onPress={clear} hitSlop={8}>
            <Text variant="caption" tone="onDark" style={{ opacity: 0.7 }}>
              Clear
            </Text>
          </Pressable>
        </Row>
        <Button
          label="Compare"
          size="sm"
          onPress={() => router.push('/compare')}
          disabled={ids.length < 2}
          iconRight="arrow-forward"
        />
      </Row>
    </View>
  );
}
