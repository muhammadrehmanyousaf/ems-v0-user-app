/**
 * Plan — the planning hub tab. Redrawn on v4.
 *
 * ── It was the Account tab's mistake, repeated on another screen ──────────
 *
 * Five bordered `Card`s, each holding a 44px tinted medallion behind an icon,
 * a title, and a stat set in gold. That is the exact pattern `ListRow`'s header
 * describes being removed from Account: *"eighteen gold circles on one screen is
 * eighteen colour events where the system allows one, and five shadowed boxes is
 * the exact pattern the reference replaces with rules and space."*
 *
 * Same components existed. This screen just never adopted them. So:
 *
 * · Five cards + five medallions → one hairline list.
 * · Four gold stats → muted ink. The budget stat is **money**, and `Money.tsx`
 *   states the rule it was breaking: money is never gold, because gold means
 *   "action" and a number is not an action.
 * · `palette.shaadi` was read directly. Screens reference semantic roles, never
 *   raw `palette.*` — that is what makes a palette change possible at all.
 *
 * ── The stats were English literals ───────────────────────────────────────
 *
 * `"2/8 done"`, `"120 guests"`, `"6 events"` — built by template literal on a
 * tab whose every other string is translated. They are keys now, and the
 * fraction is bidi-isolated: `/` is a neutral character, so "2/8" resolves to
 * "8/2" in an Urdu paragraph, which is a different and wrong claim about how
 * much of the checklist is finished.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ListGroup, ListRow, ScreenHeader, Text } from '@/components/ui';
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
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { useFavoritesStore } from '@/store/favorites';
import { layout, useTheme } from '@/theme';

export default function Plan() {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const savedCount = useFavoritesStore((s) => s.ids.size);

  const budget = useLocalList<BudgetItem>('ww.plan.budget', BUDGET_SEED(isUrdu), locale);
  const checklist = useLocalList<ChecklistItem>('ww.plan.checklist', CHECKLIST_SEED(isUrdu), locale);
  const guests = useLocalList<GuestItem>('ww.plan.guests', GUEST_SEED(isUrdu), locale);
  const timeline = useLocalList<TimelineItem>('ww.plan.timeline', TIMELINE_SEED(isUrdu), locale);

  const budgetTotal = budget.items.reduce((s, i) => s + (i.estimated || 0), 0);
  const checklistDone = checklist.items.filter((i) => i.completed).length;
  const guestHeads = guests.items.reduce((s, g) => s + (g.count || 1), 0);

  const tools: {
    icon: keyof typeof Ionicons.glyphMap;
    key: string;
    titleKey: StringKey;
    stat: string;
    href: Href;
  }[] = [
    {
      icon: 'wallet-outline',
      key: 'budget',
      titleKey: 'tool.budget',
      // `formatRs` returns "On request" for a zero total, which is a vendor
      // pricing concept and nonsense here — an untouched budget is Rs 0.
      stat: budgetTotal > 0 ? formatRs(budgetTotal) : 'Rs 0',
      href: '/tools/budget',
    },
    {
      icon: 'checkmark-done-outline',
      key: 'checklist',
      titleKey: 'tool.checklist',
      stat: `${ltr(`${checklistDone}/${checklist.items.length}`, isUrdu)} ${tr('plan.statDone')}`,
      href: '/tools/checklist',
    },
    {
      icon: 'people-outline',
      key: 'guests',
      titleKey: 'tool.guests',
      stat: `${guestHeads} ${tr('home.guestsRange')}`,
      href: '/tools/guests',
    },
    {
      icon: 'time-outline',
      key: 'timeline',
      titleKey: 'tool.timeline',
      stat: `${timeline.items.length} ${tr('plan.statEvents')}`,
      href: '/tools/timeline',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.screen }}
      showsVerticalScrollIndicator={false}
      // The tab dock floats above the content now, so every scrolling screen
      // must reserve its height or the last row sits underneath it.
      contentContainerStyle={{ paddingBottom: layout.tabBarSpace }}
    >
      <ScreenHeader title={tr('plan.title')} subtitle={tr('plan.subtitle')} urdu={isUrdu} />

      <View
        style={{
          paddingHorizontal: layout.gutter,
          paddingTop: t.spacing.xl,
          gap: t.spacing.huge,
        }}
      >
        {/* The shortlist is a different KIND of thing from the four local
            tools — it is vendors, and it is the only row here backed by
            anything outside this device — so it gets its own group rather
            than sitting fifth in a list of calculators. */}
        <ListGroup title={tr('plan.shortlist')} urdu={isUrdu}>
          <ListRow
            icon="heart-outline"
            label={tr('common.savedVendors')}
            value={String(savedCount)}
            onPress={() => router.push('/favorites')}
            urdu={isUrdu}
            last
          />
        </ListGroup>

        <ListGroup title={tr('plan.tools')} urdu={isUrdu}>
          {tools.map((tool, i) => (
            <ListRow
              key={tool.key}
              icon={tool.icon}
              label={tr(tool.titleKey)}
              value={tool.stat}
              onPress={() => router.push(tool.href)}
              last={i === tools.length - 1}
              urdu={isUrdu}
            />
          ))}
        </ListGroup>

        {/* The honest footnote. These four tools are AsyncStorage-only: nothing
            syncs to the server, so the data dies with the app and is invisible
            on weddingwala.pk. Saying so is better than a customer discovering
            it after building a 300-name guest list. */}
        <Text variant="caption" tone="muted" align="center" urdu={isUrdu}>
          {tr('plan.savedNote')}
        </Text>
      </View>
    </ScrollView>
  );
}
