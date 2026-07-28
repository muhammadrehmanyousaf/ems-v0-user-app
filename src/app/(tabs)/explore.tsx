import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, ChipSelect, EmptyState, Input, Row, Skeleton, Text } from '@/components/ui';
import { CompareBar } from '@/features/compare/CompareBar';
import { FilterSheet } from '@/features/explore/FilterSheet';
import { useExploreVendors } from '@/features/explore/useExploreVendors';
import {
  DEFAULT_FILTERS,
  PRICE_MAX,
  applyVendorFilters,
  countActiveFilters,
  deriveFacets,
  hasActiveFilters,
  type ExploreFilters,
} from '@/features/explore/vendor-filter';
import { BROWSABLE_CATEGORIES } from '@/features/vendors/categories';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import { formatRs } from '@/features/vendors/vendor-display';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

export default function Explore() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; city?: string }>();
  const [category, setCategory] = useState<string | null>(params.category ?? null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ExploreFilters>({ ...DEFAULT_FILTERS, city: params.city ?? null });
  const [filterOpen, setFilterOpen] = useState(false);

  const fullMode = hasActiveFilters(filters) || search.trim().length > 0;
  const data = useExploreVendors(category, fullMode);

  const displayed = useMemo(
    () => (fullMode ? applyVendorFilters(data.vendors, filters, search) : data.vendors),
    [fullMode, data.vendors, filters, search],
  );
  const facets = useMemo(() => deriveFacets(data.vendors), [data.vendors]);
  const activeCount = countActiveFilters(filters);
  const categoryOptions = BROWSABLE_CATEGORIES.map((c) => ({ value: c.slug, label: c.singular }));
  const count = fullMode ? displayed.length : data.total;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.sm, gap: t.spacing.md }}>
        <T k="explore.title" variant="h1" />
        <Input
          icon="search-outline"
          placeholder={tr('explore.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          autoCorrect={false}
        />
        <ChipSelect options={categoryOptions} value={category} onChange={setCategory} allLabel={tr('common.all')} />
        <Row justify="space-between">
          {!data.isLoading ? (
            <Text variant="caption" tone="muted" urdu={isUrdu}>
              {count.toLocaleString('en-PK')} {tr('explore.vendorsCount')}
            </Text>
          ) : (
            <View />
          )}
          <Pressable onPress={() => setFilterOpen(true)} hitSlop={8}>
            <Row gap="xs">
              <Ionicons name="options-outline" size={16} color={t.colors.goldDark} />
              <Text variant="label" tone="gold" urdu={isUrdu}>
                {tr('explore.filters')}{activeCount > 0 ? ` (${activeCount})` : ''}
              </Text>
            </Row>
          </Pressable>
        </Row>

        {hasActiveFilters(filters) ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing.sm }}>
            {filters.city ? <Chip label={filters.city} selected onPress={() => setFilters({ ...filters, city: null })} /> : null}
            {filters.maxPrice < PRICE_MAX ? <Chip label={`≤ ${formatRs(filters.maxPrice)}`} selected onPress={() => setFilters({ ...filters, maxPrice: PRICE_MAX })} /> : null}
            {filters.minRating > 0 ? <Chip label={`${filters.minRating}★+`} selected onPress={() => setFilters({ ...filters, minRating: 0 })} /> : null}
            {filters.verifiedOnly ? <Chip label="Verified" selected onPress={() => setFilters({ ...filters, verifiedOnly: false })} /> : null}
            {filters.featuredOnly ? <Chip label="Featured" selected onPress={() => setFilters({ ...filters, featuredOnly: false })} /> : null}
            {filters.availableOnly ? <Chip label="Available" selected onPress={() => setFilters({ ...filters, availableOnly: false })} /> : null}
            {filters.minCapacity > 0 ? <Chip label={`${filters.minCapacity}+ guests`} selected onPress={() => setFilters({ ...filters, minCapacity: 0 })} /> : null}
            {filters.amenities.map((a) => (
              <Chip key={a} label={a} selected onPress={() => setFilters({ ...filters, amenities: filters.amenities.filter((x) => x !== a) })} />
            ))}
            <Chip label={tr('common.clearAll')} onPress={() => setFilters({ ...DEFAULT_FILTERS })} />
          </ScrollView>
        ) : null}
      </View>

      {data.isLoading ? (
        <View style={{ padding: t.spacing.lg, gap: t.spacing.lg }}>
          {fullMode ? (
            <Row gap="sm" justify="center" style={{ paddingVertical: t.spacing.lg }}>
              <ActivityIndicator color={t.colors.primary} />
              <T k="explore.loadingAll" variant="caption" tone="muted" />
            </Row>
          ) : (
            [0, 1, 2].map((i) => (
              <View key={i} style={{ gap: 8 }}>
                <Skeleton height={170} radius={8} />
                <Skeleton height={16} width="60%" />
                <Skeleton height={12} width="40%" />
              </View>
            ))
          )}
        </View>
      ) : data.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={tr('explore.loadError')}
          message={tr('explore.loadErrorSub')}
          actionLabel={tr('common.retry')}
          onAction={data.refetch}
          urdu={isUrdu}
        />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(v) => String(v.id)}
          contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.lg, paddingBottom: t.spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <VendorCard vendor={item} />}
          refreshControl={<RefreshControl refreshing={false} onRefresh={data.refetch} tintColor={t.colors.primary} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!fullMode) data.loadMore();
          }}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={tr('explore.noMatch')}
              message={tr('explore.noMatchSub')}
              urdu={isUrdu}
            />
          }
          ListFooterComponent={
            data.isFetchingMore ? (
              <View style={{ paddingVertical: t.spacing.lg }}>
                <ActivityIndicator color={t.colors.primary} />
              </View>
            ) : null
          }
        />
      )}

      <CompareBar />

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onApply={setFilters}
        facets={facets}
      />
    </View>
  );
}
