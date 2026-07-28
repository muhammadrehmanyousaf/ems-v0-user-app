/** RecentlyViewedRail — horizontal rail of the vendors the user last opened. */
import { FlatList, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

import { useRecentlyViewedVendors } from '../useRecentlyViewed';
import { VendorCard } from './VendorCard';

const CARD_WIDTH = 260;

export function RecentlyViewedRail() {
  const t = useTheme();
  const { vendors } = useRecentlyViewedVendors();

  if (vendors.length === 0) return null;

  return (
    <View style={{ gap: t.spacing.md }}>
      <View style={{ paddingHorizontal: t.spacing.xl }}>
        <Text variant="h3">Recently viewed</Text>
      </View>
      <FlatList
        data={vendors}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(v) => String(v.id)}
        contentContainerStyle={{ paddingHorizontal: t.spacing.xl, gap: t.spacing.md }}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <VendorCard vendor={item} />
          </View>
        )}
      />
    </View>
  );
}
