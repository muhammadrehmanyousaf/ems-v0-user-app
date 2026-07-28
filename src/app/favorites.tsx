import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Row, Skeleton, Text } from '@/components/ui';
import { useFavoriteVendors } from '@/features/favorites/useFavoriteVendors';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import { useTheme } from '@/theme';

export default function Favorites() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { vendors, isLoading, count } = useFavoriteVendors();

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <Text variant="h1">Saved</Text>
      </Row>

      {count === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No saved vendors yet"
          message="Tap the heart on any vendor to shortlist them here."
          actionLabel="Explore vendors"
          onAction={() => router.push('/explore')}
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
            <Text variant="caption" tone="muted" style={{ marginBottom: t.spacing.xs }}>
              {count} saved {count === 1 ? 'vendor' : 'vendors'}
            </Text>
          }
          renderItem={({ item }) => <VendorCard vendor={item} />}
        />
      )}
    </View>
  );
}
