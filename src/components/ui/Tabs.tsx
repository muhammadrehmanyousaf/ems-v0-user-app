/**
 * Tabs — in-screen tabs. Spec: docs/05-UI-SPEC.md §19.
 *
 * Distinct from `SegmentedControl`, and the distinction is meaning, not looks:
 *
 *   SegmentedControl  changes a VALUE   — "Dates | Months | Flexible", a mode
 *   Tabs              changes a VIEW    — "Upcoming | Past", "Tracking | Details"
 *
 * A segmented control that navigates, or tabs that set a filter value, both
 * teach the customer the wrong thing about what a control does. Airbnb keeps the
 * same separation (Stays|Experiences are tabs; Dates|Months|Flexible is a mode).
 *
 * Underline rather than a filled thumb, so the two never look interchangeable.
 * The indicator's height is always reserved — the classic version of this
 * component shifts its whole row by 2px when the active tab changes.
 *
 * ── What v4 changed ───────────────────────────────────────────────────────
 *
 * The indicator and the count pill were both gold. Tabs appear on Inbox and on
 * a booking's detail — screens that also carry a primary action — so that was
 * two gold events per screen against a budget of one, and the tab underline was
 * competing with the button the customer is meant to press. Both are ink now:
 * the active tab is ink label + ink rule, the inactive one is muted with no
 * rule, and the contrast between them is weight and value rather than hue.
 *
 * The row also grew a top padding. Label plus 8px of bottom padding measured
 * about 30px, so the thing a customer taps to change view was well under the
 * 44px floor on every screen that used it.
 */
import { Pressable, ScrollView, View } from 'react-native';

import { haptics, useTheme } from '@/theme';

import { Text } from './Text';

export interface Tab<T extends string> {
  value: T;
  label: string;
  /** Unread or item count — renders as a small pill after the label. */
  count?: number;
}

export interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Scroll horizontally when there are more tabs than fit. */
  scroll?: boolean;
  urdu?: boolean;
}

export function Tabs<T extends string>({ tabs, value, onChange, scroll, urdu }: TabsProps<T>) {
  const t = useTheme();

  const row = (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        gap: t.spacing.xl,
        borderBottomWidth: t.layout.hairline,
        borderBottomColor: t.colors.divider,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              haptics.selection();
              onChange(tab.value);
            }}
            // 44px total: 12 top + ~22 label + 8 bottom + 2 indicator.
            style={{ alignItems: 'center', paddingTop: t.spacing.md }}
          >
            <View
              style={{
                flexDirection: urdu ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 6,
                paddingBottom: t.spacing.sm,
              }}
            >
              <Text variant="title" tone={active ? 'primary' : 'muted'} urdu={urdu} numberOfLines={1}>
                {tab.label}
              </Text>
              {tab.count != null && tab.count > 0 ? (
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    paddingHorizontal: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? t.colors.surfaceInverse : t.colors.sunken,
                  }}
                >
                  {/* A count is digits — never `urdu`. */}
                  <Text
                    variant="mono"
                    tone={active ? 'onDark' : 'muted'}
                    style={{ fontSize: 11, lineHeight: 14 }}
                  >
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              ) : null}
            </View>
            {/* Indicator height is always occupied — no 2px row shift on change. */}
            <View
              style={{
                height: 2,
                alignSelf: 'stretch',
                borderRadius: 1,
                // Ink, not gold — see the header note.
                backgroundColor: active ? t.colors.textPrimary : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );

  if (!scroll) return row;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  );
}
