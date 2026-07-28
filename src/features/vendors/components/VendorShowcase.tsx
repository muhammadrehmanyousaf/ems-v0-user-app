/** VendorShowcase — a horizontal carousel of vendors for one category (Home). */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { Row, Skeleton, Text } from '@/components/ui';
import type { StringKey } from '@/i18n/strings';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

import { useVendorsByCategory } from '../vendors.queries';
import { VendorCard } from './VendorCard';

const CARD_WIDTH = 260;

export function VendorShowcase({ slug, titleKey }: { slug: string; titleKey: StringKey }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const q = useVendorsByCategory(slug, 10);
  const vendors = q.data?.vendors ?? [];

  // Honesty rule: hide the whole rail if there's nothing real to show.
  if (!q.isLoading && vendors.length === 0) return null;

  return (
    <View style={{ gap: t.spacing.md }}>
      <Row justify="space-between" style={{ paddingHorizontal: t.spacing.xl }}>
        <T k={titleKey} variant="h3" />
        <Pressable
          hitSlop={8}
          onPress={() => router.push({ pathname: '/explore', params: { category: slug } })}
        >
          <Row gap="xxs">
            <Text variant="label" tone="gold" urdu={isUrdu}>
              {tr('common.seeAll')}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={t.colors.goldDark} />
          </Row>
        </Pressable>
      </Row>

      {q.isLoading ? (
        <Row gap="md" style={{ paddingHorizontal: t.spacing.xl }}>
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
          contentContainerStyle={{ paddingHorizontal: t.spacing.xl, gap: t.spacing.md }}
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
