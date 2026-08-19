/** RecentlyViewedRail — horizontal rail of the vendors the user last opened. */
import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { SectionHeader } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { layout, useTheme } from '@/theme';

import { useRecentlyViewedVendors } from '../useRecentlyViewed';
import { VendorCard } from './VendorCard';

const CARD_WIDTH = 268;

export function RecentlyViewedRail() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const { vendors } = useRecentlyViewedVendors();

  if (vendors.length === 0) return null;

  return (
    <View style={{ gap: t.spacing.md }}>
      <View style={{ paddingHorizontal: layout.gutter }}>
        <SectionHeader
          title={tr('home.recentlyViewed')}
          onViewAll={() => router.push('/favorites')}
          viewAllLabel={tr('home.savedLabel')}
          urdu={isUrdu}
        />
      </View>
      <FlatList
        data={vendors}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(v) => String(v.id)}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: t.spacing.md }}
        snapToInterval={CARD_WIDTH + t.spacing.md}
        decelerationRate="fast"
        snapToAlignment="start"
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <VendorCard vendor={item} />
          </View>
        )}
      />
    </View>
  );
}
