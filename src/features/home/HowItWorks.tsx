/** HowItWorks — the web's "three steps to your dream shaadi", app-native. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Row, Section, Stack, Text } from '@/components/ui';
import { useTheme } from '@/theme';

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'search-outline', title: 'Discover', body: 'Browse 3,000+ trusted vendors by category, city, budget & rating.' },
  { icon: 'git-compare-outline', title: 'Shortlist & compare', body: 'Save your favourites and compare them side by side.' },
  { icon: 'logo-whatsapp', title: 'Connect', body: 'Message vendors on WhatsApp or send an inquiry — no middleman.' },
];

export function HowItWorks() {
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: t.spacing.lg }}>
      <Section title="THREE STEPS TO YOUR SHAADI">
        <Stack gap="md">
          {STEPS.map((s, i) => (
            <Row key={s.title} gap="md" align="flex-start">
              <View style={{ alignItems: 'center', width: 44 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(201,149,106,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={s.icon} size={20} color={t.colors.goldDark} />
                </View>
              </View>
              <Stack gap="xxs" style={{ flex: 1, paddingTop: 2 }}>
                <Row gap="sm">
                  <Text variant="overline" tone="gold">STEP {i + 1}</Text>
                  <Text variant="title">{s.title}</Text>
                </Row>
                <Text variant="caption" tone="muted">{s.body}</Text>
              </Stack>
            </Row>
          ))}
        </Stack>
      </Section>
    </View>
  );
}
