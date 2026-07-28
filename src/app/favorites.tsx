import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Row, Skeleton, Text } from '@/components/ui';
import { useFavoriteVendors } from '@/features/favorites/useFavoriteVendors';
import { VendorCard } from '@/features/vendors/components/VendorCard';
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
        <View style={{ padding: t.spacing.lg, gap: t.spacing.lg }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ gap: 8 }}>
              <Skeleton height={170} radius={8} />
              <Skeleton height={16} width="60%" />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(v) => String(v.id)}
          contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.lg, paddingBottom: t.spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text variant="caption" tone="muted" urdu={isUrdu} style={{ marginBottom: t.spacing.xs }}>
              {count} {tr('common.savedVendors')}
            </Text>
          }
          renderItem={({ item }) => <VendorCard vendor={item} />}
        />
      )}
    </View>
  );
}
