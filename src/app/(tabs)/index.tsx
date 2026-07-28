import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Badge, Button, Stack, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { BridalWash, JaalPattern, ShimmerText } from '@/theme/textures';

export default function Home() {
  const t = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.screen }} showsVerticalScrollIndicator={false}>
      <BridalWash style={{ paddingTop: 84, paddingBottom: 48, paddingHorizontal: 24 }}>
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
          <Text variant="bodyLead" tone="muted" align="center" style={{ marginTop: 10 }}>
            From the first mehndi to the final rukhsati — discover Pakistan&apos;s most trusted vendors, all in one place.
          </Text>
          <View style={{ marginTop: 18, alignSelf: 'stretch' }}>
            <Button label="Explore vendors" icon="search-outline" fullWidth onPress={() => router.push('/explore')} />
          </View>
        </View>
      </BridalWash>

      <Stack gap="md" style={{ padding: 24 }}>
        <Text variant="h3">Your shaadi, sorted</Text>
        <Text variant="body" tone="muted">
          Live vendor showcases, planning tools, and your shortlist arrive as we build. This screen is wired to the same
          backend as the website.
        </Text>
      </Stack>
    </ScrollView>
  );
}
