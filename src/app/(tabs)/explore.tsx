import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipSelect, EmptyState, Input, Skeleton, Text } from '@/components/ui';
import { BROWSABLE_CATEGORIES } from '@/features/vendors/categories';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import { vendorLocation } from '@/features/vendors/vendor-display';
import { useVendorsInfinite } from '@/features/vendors/vendors.queries';
import { useTheme } from '@/theme';

export default function Explore() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState<string | null>(params.category ?? null);
  const [search, setSearch] = useState('');

  const q = useVendorsInfinite({ categorySlug: category });
  const allVendors = useMemo(() => (q.data?.pages ?? []).flatMap((p) => p.vendors), [q.data]);

  const vendors = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return allVendors;
    return allVendors.filter(
      (v) =>
        v.name.toLowerCase().includes(s) ||
        vendorLocation(v).toLowerCase().includes(s) ||
        (v.vendor?.vendorType ?? '').toLowerCase().includes(s),
    );
  }, [allVendors, search]);

  const categoryOptions = BROWSABLE_CATEGORIES.map((c) => ({ value: c.slug, label: c.singular }));
  const total = q.data?.pages?.[0]?.total ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.sm, gap: t.spacing.md }}>
        <Text variant="h1">Explore</Text>
        <Input
          icon="search-outline"
          placeholder="Search vendors, cities…"
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          autoCorrect={false}
        />
        <ChipSelect options={categoryOptions} value={category} onChange={setCategory} allLabel="All" />
        {!q.isLoading ? (
          <Text variant="caption" tone="muted">
            {search ? `${vendors.length} match${vendors.length === 1 ? '' : 'es'}` : `${total.toLocaleString('en-PK')} vendors`}
          </Text>
        ) : null}
      </View>

      {q.isLoading ? (
        <View style={{ padding: t.spacing.lg, gap: t.spacing.lg }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ gap: 8 }}>
              <Skeleton height={170} radius={8} />
              <Skeleton height={16} width="60%" />
              <Skeleton height={12} width="40%" />
            </View>
          ))}
        </View>
      ) : q.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn’t load vendors"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => q.refetch()}
        />
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(v) => String(v.id)}
          contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.lg, paddingBottom: t.spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <VendorCard vendor={item} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!search && q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
          }}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No vendors found"
              message="Try a different category or search term."
            />
          }
          ListFooterComponent={
            q.isFetchingNextPage ? (
              <View style={{ paddingVertical: t.spacing.lg }}>
                <ActivityIndicator color={t.colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
