/** VendorShowcase — a horizontal carousel of vendors for one category (Home). */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { Row, Skeleton, Text } from '@/components/ui';
import { useTheme } from '@/theme';

import { useVendorsByCategory } from '../vendors.queries';
import { VendorCard } from './VendorCard';

const CARD_WIDTH = 260;

export function VendorShowcase({ slug, title }: { slug: string; title: string }) {
  const t = useTheme();
  const q = useVendorsByCategory(slug, 10);
  const vendors = q.data?.vendors ?? [];

  // Honesty rule: hide the whole rail if there's nothing real to show.
  if (!q.isLoading && vendors.length === 0) return null;

  return (
    <View style={{ gap: t.spacing.md }}>
      <Row justify="space-between" style={{ paddingHorizontal: t.spacing.lg }}>
        <Text variant="h3">{title}</Text>
        <Pressable
          hitSlop={8}
          onPress={() => router.push({ pathname: '/explore', params: { category: slug } })}
        >
          <Row gap="xxs">
            <Text variant="label" tone="gold">
              See all
            </Text>
            <Ionicons name="chevron-forward" size={14} color={t.colors.goldDark} />
          </Row>
        </Pressable>
      </Row>

      {q.isLoading ? (
        <Row gap="md" style={{ paddingHorizontal: t.spacing.lg }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ width: CARD_WIDTH, gap: 8 }}>
              <Skeleton height={CARD_WIDTH * 0.55} radius={8} />
              <Skeleton height={16} width="70%" />
              <Skeleton height={12} width="50%" />
            </View>
          ))}
        </Row>
      ) : (
        <FlatList
          data={vendors}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(v) => String(v.id)}
          contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md }}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <VendorCard vendor={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
