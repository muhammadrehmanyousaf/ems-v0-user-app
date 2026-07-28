import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Card, Chip, Row, Stack } from '@/components/ui';
import { CategoryMosaic } from '@/features/home/CategoryMosaic';
import { FeaturedSpotlight } from '@/features/home/FeaturedSpotlight';
import { HeroCarousel } from '@/features/home/HeroCarousel';
import { HowItWorks } from '@/features/home/HowItWorks';
import { FEATURED_CITIES } from '@/features/vendors/cities';
import { RecentlyViewedRail } from '@/features/vendors/components/RecentlyViewedRail';
import { VendorShowcase } from '@/features/vendors/components/VendorShowcase';
import { T } from '@/i18n/T';
import { gradients, useTheme } from '@/theme';

export default function Home() {
  const t = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.screen }} showsVerticalScrollIndicator={false}>
      <HeroCarousel />

      <Stack gap="xl" style={{ paddingVertical: 24 }}>
        <RecentlyViewedRail />

        <CategoryMosaic />

        <FeaturedSpotlight />

        {/* Browse by city */}
        <View style={{ gap: t.spacing.md }}>
          <View style={{ paddingHorizontal: 24 }}>
            <T k="home.browseCity" variant="overline" tone="label" style={{ letterSpacing: 1.5 }} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: t.spacing.sm }}>
            {FEATURED_CITIES.map((c) => (
              <Chip key={c.name} label={c.name} onPress={() => router.push({ pathname: '/explore', params: { city: c.name } })} />
            ))}
          </ScrollView>
        </View>

        <VendorShowcase slug="wedding-venues" titleKey="home.featuredVenues" />
        <VendorShowcase slug="wedding-photographers" titleKey="home.topPhotographers" />

        {/* Warm crescendo band (blush → ivory, arch-brand) — light-luxe, never dark */}
        <LinearGradient colors={gradients.roseWash} style={{ paddingVertical: 28 }}>
          <HowItWorks />
        </LinearGradient>

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
