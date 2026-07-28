import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueries } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, EmptyState, Row, Text } from '@/components/ui';
import {
  isVerified,
  vendorCategoryLabel,
  vendorPriceLabel,
  vendorPrimaryImage,
} from '@/features/vendors/vendor-display';
import type { Vendor } from '@/features/vendors/vendors.types';
import { getBusinessById } from '@/lib/api/endpoints/vendors';
import { useCompareStore } from '@/store/compare';
import { useTheme } from '@/theme';

const ROW_H = 52;
const COL_W = 156;
const LABEL_W = 108;

const ROWS: { label: string; get: (v: Vendor) => string }[] = [
  { label: 'Type', get: (v) => vendorCategoryLabel(v) },
  { label: 'City', get: (v) => v.city ?? v.vendor?.city ?? '—' },
  { label: 'Rating', get: (v) => (v.reviewCount > 0 ? `${v.rating.toFixed(1)} (${v.reviewCount})` : 'New') },
  { label: 'Starting price', get: (v) => vendorPriceLabel(v).text },
  { label: 'Capacity', get: (v) => (v.maxCapacity ? `${v.maxCapacity} guests` : '—') },
  { label: 'Verified', get: (v) => (isVerified(v) ? 'Yes' : 'No') },
  { label: 'Reliability', get: (v) => v.reliability?.tier ?? '—' },
];

export default function Compare() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);

  const results = useQueries({
    queries: ids.map((id) => ({ queryKey: ['vendor', String(id)], queryFn: () => getBusinessById(id), staleTime: 600000 })),
  });
  const vendors = results.map((r) => r.data).filter((v): v is Vendor => !!v);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <Text variant="h1">Compare</Text>
      </Row>

      {vendors.length < 2 ? (
        <EmptyState
          icon="git-compare-outline"
          title="Add vendors to compare"
          message="Tap the compare icon on any vendor card to line them up side by side (up to 4)."
          actionLabel="Explore vendors"
          onAction={() => router.push('/explore')}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: t.spacing.lg }}>
          <Row align="flex-start">
            {/* Labels column */}
            <View style={{ width: LABEL_W }}>
              <View style={{ height: 150 }} />
              {ROWS.map((r) => (
                <View key={r.label} style={{ height: ROW_H, justifyContent: 'center' }}>
                  <Text variant="overline" tone="label">
                    {r.label.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>

            {/* Vendor columns */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row align="flex-start" gap="md">
                {vendors.map((v) => {
                  const img = vendorPrimaryImage(v);
                  return (
                    <View key={v.id} style={{ width: COL_W }}>
                      {/* Header */}
                      <View style={{ height: 150 }}>
                        <View style={{ position: 'relative' }}>
                          {img ? (
                            <Image source={{ uri: img }} style={{ width: COL_W, height: 96, borderRadius: t.radius.md, backgroundColor: t.colors.sand }} contentFit="cover" />
                          ) : (
                            <View style={{ width: COL_W, height: 96, borderRadius: t.radius.md, backgroundColor: t.colors.sand, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name="image-outline" size={24} color={t.colors.textLabel} />
                            </View>
                          )}
                          <Pressable
                            onPress={() => remove(v.id)}
                            hitSlop={8}
                            style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(253,248,242,0.92)', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Ionicons name="close" size={15} color={t.colors.textSoft} />
                          </Pressable>
                        </View>
                        <Text variant="bodyMedium" numberOfLines={2} style={{ marginTop: 6 }}>
                          {v.name}
                        </Text>
                      </View>
                      {/* Values */}
                      {ROWS.map((r) => (
                        <View key={r.label} style={{ height: ROW_H, justifyContent: 'center', borderTopWidth: 1, borderTopColor: t.colors.border }}>
                          <Text variant="caption" tone="body" numberOfLines={2}>
                            {r.get(v)}
                          </Text>
                        </View>
                      ))}
                      <Pressable onPress={() => router.push(`/vendor/${v.id}`)} style={{ marginTop: 8 }}>
                        <Badge label="View profile" tone="gold" icon="arrow-forward" />
                      </Pressable>
                    </View>
                  );
                })}
              </Row>
            </ScrollView>
          </Row>
        </ScrollView>
      )}
    </View>
  );
}
