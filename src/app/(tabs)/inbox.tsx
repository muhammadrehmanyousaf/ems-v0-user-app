import { View } from 'react-native';

import { EmptyState, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export default function Inbox() {
  const t = useTheme();
  return (
    <Screen padded>
      <View style={{ paddingTop: t.spacing.sm, paddingBottom: t.spacing.lg }}>
        <Text variant="h1">Inbox</Text>
        <Text variant="body" tone="muted">
          Your vendor conversations &amp; notifications.
        </Text>
      </View>
      <EmptyState
        icon="chatbubbles-outline"
        title="Messages coming"
        message="Chat with vendors and see booking updates here — the messaging build is Phase 2."
      />
    </Screen>
  );
}
