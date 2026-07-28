import { View } from 'react-native';

import { EmptyState, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export default function Explore() {
  const t = useTheme();
  return (
    <Screen padded>
      <View style={{ paddingTop: t.spacing.sm, paddingBottom: t.spacing.lg }}>
        <Text variant="h1">Explore</Text>
        <Text variant="body" tone="muted">
          Browse 24 vendor categories across Pakistan.
        </Text>
      </View>
      <EmptyState
        icon="search-outline"
        title="Discovery lands next"
        message="Search, the 24 categories, the 17-filter sheet, and the rich vendor page are the Phase 1 build — coming right up."
      />
    </Screen>
  );
}
