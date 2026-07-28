/**
 * CategoryMosaic — replaces the equal-tile grid with an editorial layout: two
 * flagship arch photo-cards (live category imagery) that establish hierarchy,
 * plus a refined supporting rail of arch-framed icon chips for the rest. Kills
 * the "templated grid" tell; the Mehrab arch carries the brand throughout.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { ArchImage, ArchOutline } from '@/components/signature';
import { Text } from '@/components/ui';
import { T } from '@/i18n/T';
import { useTheme } from '@/theme';

import { BROWSABLE_CATEGORIES, categoryBySlug } from '../vendors/categories';
import { vendorPrimaryImage } from '../vendors/vendor-display';
import { useVendorsByCategory } from '../vendors/vendors.queries';

const PAD = 24;
const GAP = 12;

const FLAGSHIPS = ['wedding-venues', 'wedding-photographers'] as const;

function Flagship({ slug, width, height }: { slug: string; width: number; height: number }) {
  const cat = categoryBySlug(slug);
  const q = useVendorsByCategory(slug, 8);
  const image = (q.data?.vendors ?? []).map(vendorPrimaryImage).find((u): u is string => !!u) ?? null;

  return (
    <Pressable style={{ flex: 1 }} onPress={() => router.push({ pathname: '/explore', params: { category: slug } })}>
      <ArchImage uri={image} width={width} height={height} />
      <Text variant="bodyMedium" align="center" numberOfLines={1} style={{ marginTop: 8 }}>
        {cat?.plural ?? slug}
      </Text>
    </Pressable>
  );
}

function CategoryChip({ slug }: { slug: string }) {
  const t = useTheme();
  const cat = categoryBySlug(slug);
  if (!cat) return null;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/explore', params: { category: slug } })}
      style={{ width: 92, alignItems: 'center' }}
    >
      <View
        style={{
          width: 72,
          height: 78,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.colors.surfaceAlt,
          borderRadius: t.radius.lg,
        }}
      >
        <ArchOutline width={54} height={62} style={{ position: 'absolute' }} />
        <Ionicons name={cat.icon} size={26} color={t.colors.goldDark} />
      </View>
      <Text variant="caption" tone="body" align="center" numberOfLines={2} style={{ marginTop: 6 }}>
        {cat.singular}
      </Text>
    </Pressable>
  );
}

export function CategoryMosaic() {
  const t = useTheme();
  const { width: W } = useWindowDimensions();
  const flagW = Math.max(0, Math.floor((W - PAD * 2 - GAP) / 2));
  const flagH = Math.round(flagW * 1.12);
  const supporting = BROWSABLE_CATEGORIES.filter((c) => !FLAGSHIPS.includes(c.slug as (typeof FLAGSHIPS)[number]));

  return (
    <View style={{ gap: t.spacing.lg }}>
      <View style={{ paddingHorizontal: PAD }}>
        <T k="home.browseCategory" variant="overline" tone="label" style={{ letterSpacing: 1.5 }} />
      </View>

      {/* Flagship photo cards */}
      <View style={{ flexDirection: 'row', gap: GAP, paddingHorizontal: PAD }}>
        {FLAGSHIPS.map((slug) => (
          <Flagship key={slug} slug={slug} width={flagW} height={flagH} />
        ))}
      </View>

      {/* Supporting arch-chip rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD, gap: 4 }}
      >
        {supporting.map((c) => (
          <CategoryChip key={c.slug} slug={c.slug} />
        ))}
      </ScrollView>
    </View>
  );
}
