import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Card, Row, Section, Stack, Text } from '@/components/ui';
import {
  BUDGET_SEED,
  CHECKLIST_SEED,
  GUEST_SEED,
  TIMELINE_SEED,
  type BudgetItem,
  type ChecklistItem,
  type GuestItem,
  type TimelineItem,
} from '@/features/planning/types';
import { useLocalList } from '@/features/planning/useLocalList';
import { formatRs } from '@/features/vendors/vendor-display';
import type { StringKey } from '@/i18n/strings';
import { T } from '@/i18n/T';
import { useFavoritesStore } from '@/store/favorites';
import { useTheme } from '@/theme';

export default function Plan() {
  const t = useTheme();
  const savedCount = useFavoritesStore((s) => s.ids.size);

  const budget = useLocalList<BudgetItem>('ww.plan.budget', BUDGET_SEED);
  const checklist = useLocalList<ChecklistItem>('ww.plan.checklist', CHECKLIST_SEED);
  const guests = useLocalList<GuestItem>('ww.plan.guests', GUEST_SEED);
  const timeline = useLocalList<TimelineItem>('ww.plan.timeline', TIMELINE_SEED);

  const budgetTotal = budget.items.reduce((s, i) => s + (i.estimated || 0), 0);
  const checklistDone = checklist.items.filter((i) => i.completed).length;
  const guestHeads = guests.items.reduce((s, g) => s + (g.count || 1), 0);

  const tools: { icon: keyof typeof Ionicons.glyphMap; key: string; titleKey: StringKey; stat: string; href: Href }[] = [
    { icon: 'wallet-outline', key: 'budget', titleKey: 'tool.budget', stat: formatRs(budgetTotal), href: '/tools/budget' },
    { icon: 'checkmark-done-outline', key: 'checklist', titleKey: 'tool.checklist', stat: `${checklistDone}/${checklist.items.length} done`, href: '/tools/checklist' },
    { icon: 'people-outline', key: 'guests', titleKey: 'tool.guests', stat: `${guestHeads} guests`, href: '/tools/guests' },
    { icon: 'time-outline', key: 'timeline', titleKey: 'tool.timeline', stat: `${timeline.items.length} events`, href: '/tools/timeline' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.screen }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: t.spacing.lg, paddingTop: t.spacing.xl, gap: t.spacing.xl }}>
        <Stack gap="xxs">
          <T k="plan.title" variant="display" />
          <T k="plan.subtitle" variant="body" tone="muted" />
        </Stack>

        {/* Shortlist */}
        <Card onPress={() => router.push('/favorites')}>
          <Row justify="space-between">
            <Row gap="md">
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(242,181,192,0.28)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="heart" size={22} color="#A34E60" />
              </View>
              <Stack gap="xxs">
                <T k="plan.shortlist" variant="title" />
                <Text variant="caption" tone="muted">{savedCount} saved {savedCount === 1 ? 'vendor' : 'vendors'}</Text>
              </Stack>
            </Row>
            <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
          </Row>
        </Card>

        <Section title="PLANNING TOOLS">
          <Stack gap="md">
            {tools.map((tool) => (
              <Card key={tool.key} onPress={() => router.push(tool.href)}>
                <Row justify="space-between">
                  <Row gap="md">
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(201,149,106,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={tool.icon} size={22} color={t.colors.goldDark} />
                    </View>
                    <Stack gap="xxs">
                      <T k={tool.titleKey} variant="title" />
                      <Text variant="caption" tone="gold">{tool.stat}</Text>
                    </Stack>
                  </Row>
                  <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
                </Row>
              </Card>
            ))}
          </Stack>
        </Section>

        <T k="plan.savedNote" variant="caption" tone="muted" align="center" />
      </View>
    </ScrollView>
  );
}
