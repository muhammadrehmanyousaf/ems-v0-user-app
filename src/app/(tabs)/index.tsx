import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Badge, Card, Chip, Row, Stack, Text } from '@/components/ui';
import { HowItWorks } from '@/features/home/HowItWorks';
import { FEATURED_CITIES } from '@/features/vendors/cities';
import { CategoryGrid } from '@/features/vendors/components/CategoryGrid';
import { RecentlyViewedRail } from '@/features/vendors/components/RecentlyViewedRail';
import { VendorShowcase } from '@/features/vendors/components/VendorShowcase';
import { usePlatformStats } from '@/features/vendors/vendors.queries';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';
import { BridalWash, JaalPattern, ShimmerText } from '@/theme/textures';

export default function Home() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const stats = usePlatformStats();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.screen }} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <BridalWash style={{ paddingTop: 76, paddingBottom: 32, paddingHorizontal: 24 }}>
        <JaalPattern />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Badge label={tr('home.badge')} urdu={isUrdu} tone="rose" icon="heart" />
          <Text variant="overline" tone="label" align="center" style={{ marginTop: 10 }}>
            LIGHT · LUXURIOUS · UNFORGETTABLE
          </Text>
          <Text variant="hero" align="center" style={{ marginTop: 6 }}>
            Where every
          </Text>
          <ShimmerText fontSize={40}>love story finds</ShimmerText>
          <Text variant="hero" italic align="center">
            its perfect setting
          </Text>

          {/* Search entry → Explore */}
          <Pressable
            onPress={() => router.push('/explore')}
            style={{
              marginTop: 20,
              alignSelf: 'stretch',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: t.colors.card,
              borderColor: t.colors.border,
              borderWidth: 1,
              borderRadius: t.radius.sm,
              paddingHorizontal: 16,
              height: 52,
            }}
          >
            <Ionicons name="search-outline" size={20} color={t.colors.textLabel} />
            <T k="home.searchPlaceholder" variant="body" tone="muted" />
          </Pressable>

          {/* Live stats */}
          {stats.data ? (
            <Row gap="md" style={{ marginTop: 14 }}>
              <Text variant="caption" tone="muted" urdu={isUrdu}>
                <Text variant="caption" tone="gold" weight="bold">
                  {stats.data.vendors.toLocaleString('en-PK')}+
                </Text>{' '}
                {tr('home.vendors')}
              </Text>
              <Text variant="caption" tone="muted">·</Text>
              <Text variant="caption" tone="muted" urdu={isUrdu}>
                <Text variant="caption" tone="gold" weight="bold">
                  {stats.data.cities}
                </Text>{' '}
                {tr('home.cities')}
              </Text>
            </Row>
          ) : null}
        </View>
      </BridalWash>

      <Stack gap="xl" style={{ paddingVertical: 24 }}>
        <RecentlyViewedRail />

        <View style={{ paddingHorizontal: 24, gap: t.spacing.md }}>
          <T k="home.browseCategory" variant="overline" tone="label" />
          <CategoryGrid />
        </View>

        {/* Browse by city */}
        <View style={{ gap: t.spacing.md }}>
          <View style={{ paddingHorizontal: 24 }}>
            <T k="home.browseCity" variant="overline" tone="label" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: t.spacing.sm }}>
            {FEATURED_CITIES.map((c) => (
              <Chip key={c.name} label={c.name} onPress={() => router.push({ pathname: '/explore', params: { city: c.name } })} />
            ))}
          </ScrollView>
        </View>

        <VendorShowcase slug="wedding-venues" titleKey="home.featuredVenues" />
        <VendorShowcase slug="wedding-photographers" titleKey="home.topPhotographers" />

        <HowItWorks />

        <VendorShowcase slug="caterers" titleKey="home.caterers" />
        <VendorShowcase slug="bridal-makeup-artists" titleKey="home.bridalMakeup" />

        {/* Guides teaser */}
        <View style={{ paddingHorizontal: 24 }}>
          <Card onPress={() => router.push('/guides')}>
            <Row justify="space-between">
              <Row gap="md" style={{ flex: 1 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(201,149,106,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="book-outline" size={22} color={t.colors.goldDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <T k="home.weddingGuides" variant="title" />
                  <T k="home.guidesSub" variant="caption" tone="muted" />
                </View>
              </Row>
              <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
            </Row>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <T k="home.liveNote" variant="caption" tone="muted" align="center" />
        </View>
      </Stack>
    </ScrollView>
  );
}
