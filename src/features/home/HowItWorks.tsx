/** HowItWorks — the web's "three steps to your dream shaadi", app-native. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Row, Stack, Text } from '@/components/ui';
import type { StringKey } from '@/i18n/strings';
import { T } from '@/i18n/T';
import { useTheme } from '@/theme';

const STEPS: { icon: keyof typeof Ionicons.glyphMap; titleKey: StringKey; bodyKey: StringKey }[] = [
  { icon: 'search-outline', titleKey: 'home.step1Title', bodyKey: 'home.step1Body' },
  { icon: 'git-compare-outline', titleKey: 'home.step2Title', bodyKey: 'home.step2Body' },
  { icon: 'logo-whatsapp', titleKey: 'home.step3Title', bodyKey: 'home.step3Body' },
];

export function HowItWorks() {
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: t.spacing.lg, gap: t.spacing.md }}>
      <T k="home.threeSteps" variant="overline" tone="label" />
      <Stack gap="md">
        {STEPS.map((s, i) => (
          <Row key={s.titleKey} gap="md" align="flex-start">
            <View style={{ alignItems: 'center', width: 44 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(201,149,106,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={s.icon} size={20} color={t.colors.goldDark} />
              </View>
            </View>
            <Stack gap="xxs" style={{ flex: 1, paddingTop: 2 }}>
              <Row gap="sm">
                <Text variant="overline" tone="gold">STEP {i + 1}</Text>
                <T k={s.titleKey} variant="title" />
              </Row>
              <T k={s.bodyKey} variant="caption" tone="muted" />
            </Stack>
          </Row>
        ))}
      </Stack>
    </View>
  );
}
