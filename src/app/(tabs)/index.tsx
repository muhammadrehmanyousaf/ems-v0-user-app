import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Badge, Row, Section, Stack, Text } from '@/components/ui';
import { CategoryGrid } from '@/features/vendors/components/CategoryGrid';
import { VendorShowcase } from '@/features/vendors/components/VendorShowcase';
import { usePlatformStats } from '@/features/vendors/vendors.queries';
import { useTheme } from '@/theme';
import { BridalWash, JaalPattern, ShimmerText } from '@/theme/textures';

export default function Home() {
  const t = useTheme();
  const stats = usePlatformStats();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.screen }} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <BridalWash style={{ paddingTop: 76, paddingBottom: 32, paddingHorizontal: 24 }}>
        <JaalPattern />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Badge label="PAKISTAN'S #1 SHAADI PLATFORM" tone="rose" icon="heart" />
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
            <Text variant="body" tone="muted">
              Search vendors, venues, cities…
            </Text>
          </Pressable>

          {/* Live stats */}
          {stats.data ? (
            <Row gap="md" style={{ marginTop: 14 }}>
              <Text variant="caption" tone="muted">
                <Text variant="caption" tone="gold" weight="bold">
                  {stats.data.vendors.toLocaleString('en-PK')}+
                </Text>{' '}
                vendors
              </Text>
              <Text variant="caption" tone="muted">·</Text>
              <Text variant="caption" tone="muted">
                <Text variant="caption" tone="gold" weight="bold">
                  {stats.data.cities}
                </Text>{' '}
                cities
              </Text>
            </Row>
          ) : null}
        </View>
      </BridalWash>

      <Stack gap="xl" style={{ paddingVertical: 24 }}>
        <View style={{ paddingHorizontal: 24 }}>
          <Section title="BROWSE BY CATEGORY">
            <CategoryGrid />
          </Section>
        </View>

        <VendorShowcase slug="wedding-venues" title="Featured venues" />
        <VendorShowcase slug="wedding-photographers" title="Top photographers" />
        <VendorShowcase slug="caterers" title="Caterers" />
        <VendorShowcase slug="bridal-makeup-artists" title="Bridal makeup" />

        <View style={{ paddingHorizontal: 24 }}>
          <Text variant="caption" tone="muted" align="center">
            Every vendor here is live from the same platform as weddingwala.pk.
          </Text>
        </View>
      </Stack>
    </ScrollView>
  );
}
