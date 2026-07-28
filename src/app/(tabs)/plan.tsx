import { View } from 'react-native';

import { EmptyState, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export default function Plan() {
  const t = useTheme();
  return (
    <Screen padded>
      <View style={{ paddingTop: t.spacing.sm, paddingBottom: t.spacing.lg }}>
        <Text variant="h1">Plan</Text>
        <Text variant="body" tone="muted">
          Budget, checklist, guest list, timeline &amp; your Shaadi Plan.
        </Text>
      </View>
      <EmptyState
        icon="calendar-outline"
        title="Planning suite coming"
        message="The budget calculator, checklist, guest list, timeline, and your saved Shaadi Plan land in Phase 4."
      />
    </Screen>
  );
}
