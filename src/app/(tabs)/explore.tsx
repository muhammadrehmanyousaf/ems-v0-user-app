import Ionicons from '@expo/vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View, type TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArchOrnament } from '@/components/signature';
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
import { BROWSABLE_CATEGORIES, categoryLabel } from '@/features/vendors/categories';
import { VendorCard } from '@/features/vendors/components/VendorCard';
import { formatRs } from '@/features/vendors/vendor-display';
import type { Vendor } from '@/features/vendors/vendors.types';
import { ltr } from '@/i18n/bidi';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { gradients, layout, useTheme } from '@/theme';

export default function Explore() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; city?: string; focus?: string }>();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ExploreFilters>({ ...DEFAULT_FILTERS, city: params.city ?? null });
  const [filterOpenLocal, setFilterOpenLocal] = useState(false);
  const searchRef = useRef<TextInput>(null);

  /**
   * The route params are the source of truth for the selected category, not local
   * state.
   *
   * The naive version — `useState(params.category)` plus an effect syncing them —
   * calls setState inside an effect, which cascades renders. On this app that is
   * not a style question: five separate "Maximum update depth exceeded" crashes
   * came from exactly that shape of feedback loop on the New Architecture, and
   * the lint rule that forbids it is there because of them.
   *
   * Deriving instead means the category is a pure read, and tapping a chip pushes
   * to the router. That also makes Explore deep-linkable and gives the back
   * button correct behaviour for free — a category arrived at from Home's arch
   * medallion and one chosen from the chip row are now the same thing.
   */
  const category = params.category?.trim() ? params.category : null;
  const setCategory = (slug: string | null) => router.setParams({ category: slug ?? '' });

  /**
   * Home's search field and filter button are shortcuts INTO this screen — one
   * search implementation, not two. `?focus=filters` opens the sheet; clearing
   * the param is part of closing it, so dismissing the sheet does not leave a
   * param that immediately re-opens it.
   */
  const filterOpen = filterOpenLocal || params.focus === 'filters';
  const closeFilters = () => {
    setFilterOpenLocal(false);
    if (params.focus) router.setParams({ focus: '' });
  };

  // Focusing an input is a call out to a platform API, not a state update, so it
  // belongs in an effect. Keyed on the param, so it fires once per arrival.
  useEffect(() => {
    if (params.focus !== 'search') return;
    // A frame's grace so the field is mounted before we ask for the keyboard.
    const h = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(h);
  }, [params.focus]);

  const fullMode = hasActiveFilters(filters) || search.trim().length > 0;
  const data = useExploreVendors(category, fullMode);

  const displayed = useMemo(
    () => (fullMode ? applyVendorFilters(data.vendors, filters, search) : data.vendors),
    [fullMode, data.vendors, filters, search],
  );
  const facets = useMemo(() => deriveFacets(data.vendors), [data.vendors]);
  const activeCount = countActiveFilters(filters);
  // The rail was the primary navigation of this tab and every chip on it was
  // English while the title, the search field and all five tabs were Urdu.
  const categoryOptions = BROWSABLE_CATEGORIES.map((c) => ({
    value: c.slug,
    label: categoryLabel(c, isUrdu, 'singular'),
  }));
  const count = fullMode ? displayed.length : data.total;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      {/*
        Explore gets the same deep panel as Home's hero, for the same reason: a
        screen that opens on bare paper with a form field at the top reads as a
        document, not an app. The panel is SHORTER here — this screen's job is
        the results, so the header states where you are and gets out of the way,
        where Home's hero is the destination.

        `paddingTop` moved inside the panel so it runs full-bleed behind the
        status bar; the search field overlaps its lower edge exactly as on Home,
        which is what ties the two screens together as one product.
      */}
      <LinearGradient
        colors={gradients.royal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + t.spacing.lg,
          paddingHorizontal: layout.gutter,
          paddingBottom: t.spacing.xxl,
          borderBottomLeftRadius: t.radius.xxl,
          borderBottomRightRadius: t.radius.xxl,
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', top: -26, right: -34 }} pointerEvents="none">
          <ArchOrnament width={176} height={234} opacity={0.18} />
        </View>
        <T k="explore.title" variant="display" tone="onDark" />
        {/* The live total, in the panel — the one number that tells a couple how
            much of the marketplace they are standing in front of. */}
        {!data.isLoading ? (
          <Text variant="caption" tone="onDark" urdu={isUrdu} style={{ opacity: 0.7, marginTop: 4 }}>
            {`${count.toLocaleString('en-PK')} ${tr('explore.vendorsCount')}`}
          </Text>
        ) : null}
      </LinearGradient>

      <View
        style={{
          paddingHorizontal: layout.gutter,
          marginTop: -26,
          gap: t.spacing.md,
        }}
      >
        <Input
          ref={searchRef}
          icon="search-outline"
          placeholder={tr('explore.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          autoCorrect={false}
          returnKeyType="search"
        />
        <ChipSelect options={categoryOptions} value={category} onChange={setCategory} allLabel={tr('common.all')} />
        <Row justify="flex-end">
          {/* Filters is a pill, not a text link: it opens the densest surface in
              the app and it carries a count, so it needs the weight of a
              control. Ink when filters are on, hairline when they are not. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('explore.filters')}
            onPress={() => setFilterOpenLocal(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              height: 40,
              paddingHorizontal: t.spacing.lg,
              borderRadius: t.radius.pill,
              borderWidth: 1,
              borderColor: activeCount > 0 ? t.colors.textPrimary : t.colors.border,
              backgroundColor: activeCount > 0 ? t.colors.textPrimary : t.colors.card,
            }}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={activeCount > 0 ? t.colors.onDark : t.colors.textPrimary}
            />
            <Text
              variant="label"
              urdu={isUrdu}
              style={{ color: activeCount > 0 ? t.colors.onDark : t.colors.textPrimary }}
            >
              {tr('explore.filters')}
              {activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </Pressable>
        </Row>

        {hasActiveFilters(filters) ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing.sm }}>
            {filters.city ? <Chip label={filters.city} selected onPress={() => setFilters({ ...filters, city: null })} /> : null}
            {filters.maxPrice < PRICE_MAX ? <Chip label={ltr(`≤ ${formatRs(filters.maxPrice)}`, isUrdu)} selected onPress={() => setFilters({ ...filters, maxPrice: PRICE_MAX })} /> : null}
            {filters.minRating > 0 ? <Chip label={ltr(`${filters.minRating}★+`, isUrdu)} selected onPress={() => setFilters({ ...filters, minRating: 0 })} /> : null}
            {filters.verifiedOnly ? <Chip label={tr('filter.verifiedChip')} selected onPress={() => setFilters({ ...filters, verifiedOnly: false })} /> : null}
            {filters.featuredOnly ? <Chip label={tr('filter.featured')} selected onPress={() => setFilters({ ...filters, featuredOnly: false })} /> : null}
            {filters.availableOnly ? <Chip label={tr('filter.availableChip')} selected onPress={() => setFilters({ ...filters, availableOnly: false })} /> : null}
            {filters.minCapacity > 0 ? <Chip label={`${ltr(`${filters.minCapacity}+`, isUrdu)} ${tr('home.guestsRange')}`} selected onPress={() => setFilters({ ...filters, minCapacity: 0 })} /> : null}
            {filters.amenities.map((a) => (
              <Chip key={a} label={a} selected onPress={() => setFilters({ ...filters, amenities: filters.amenities.filter((x) => x !== a) })} />
            ))}
            <Chip label={tr('common.clearAll')} onPress={() => setFilters({ ...DEFAULT_FILTERS })} />
          </ScrollView>
        ) : null}
      </View>

      <View style={{ flex: 1, marginTop: t.spacing.md }}>
        {data.isLoading ? (
          fullMode ? (
            <Row gap="sm" justify="center" style={{ paddingVertical: t.spacing.xl }}>
              <ActivityIndicator color={t.colors.primary} />
              <T k="explore.loadingAll" variant="caption" tone="muted" />
            </Row>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ width: '50%', paddingHorizontal: 6, paddingBottom: 12, gap: 8 }}>
                  <Skeleton height={130} radius={10} />
                  <Skeleton height={14} width="70%" />
                  <Skeleton height={12} width="45%" />
                </View>
              ))}
            </View>
          )
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
          <FlashList
            data={displayed}
            masonry
            numColumns={2}
            keyExtractor={(v: Vendor) => String(v.id)}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: layout.tabBarSpace }}
            showsVerticalScrollIndicator={false}
            refreshing={false}
            onRefresh={data.refetch}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (!fullMode) data.loadMore();
            }}
            renderItem={({ item }: { item: Vendor }) => (
              <View style={{ paddingHorizontal: 6, paddingBottom: 12 }}>
                <VendorCard vendor={item} />
              </View>
            )}
            ListEmptyComponent={
              <EmptyState icon="search-outline" title={tr('explore.noMatch')} message={tr('explore.noMatchSub')} urdu={isUrdu} />
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
      </View>

      <CompareBar />

      <FilterSheet
        visible={filterOpen}
        onClose={closeFilters}
        value={filters}
        onApply={setFilters}
        facets={facets}
        fullSet={data.fullSet}
      />
    </View>
  );
}
