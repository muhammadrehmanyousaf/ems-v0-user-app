import Ionicons from '@expo/vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Row, Skeleton, Text } from '@/components/ui';
import { useFavoriteVendors } from '@/features/favorites/useFavoriteVendors';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import type { Vendor } from '@/features/vendors/vendors.types';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

export default function Favorites() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const { vendors, isLoading, count } = useFavoriteVendors();

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <T k="fav.title" variant="h1" />
      </Row>

      {count === 0 ? (
        <EmptyState
          icon="heart-outline"
          title={tr('fav.emptyTitle')}
          message={tr('fav.emptySub')}
          actionLabel={tr('common.exploreVendors')}
          onAction={() => router.push('/explore')}
          urdu={isUrdu}
        />
      ) : isLoading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ width: '50%', paddingHorizontal: 6, paddingBottom: 12, gap: 8 }}>
              <Skeleton height={130} radius={10} />
              <Skeleton height={14} width="70%" />
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            data={vendors}
            masonry
            numColumns={2}
            keyExtractor={(v: Vendor) => String(v.id)}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: t.spacing['3xl'] }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text variant="caption" tone="muted" urdu={isUrdu} style={{ paddingHorizontal: 6, paddingBottom: t.spacing.sm }}>
                {count} {tr('common.savedVendors')}
              </Text>
            }
            renderItem={({ item }: { item: Vendor }) => (
              <View style={{ paddingHorizontal: 6, paddingBottom: 12 }}>
                <VendorCard vendor={item} />
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}
