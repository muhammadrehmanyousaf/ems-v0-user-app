/**
 * HowItWorks — **v4.** Governed by rules.md §0.0.
 *
 * v3 drew each step as a 44px gold-tinted circle holding an icon, a gold "STEP 1"
 * overline, a title and a body — three coloured elements per row, nine on the
 * block, sitting on a pink wash band. It read like a marketing panel bolted onto
 * a product.
 *
 * v4: a numeral, a hairline, and two lines of type. The number IS the icon —
 * that is what a numbered list is — and the hairline between rows does the work
 * the tinted circles were doing. No wash, no gold, no icons.
 */
import { View } from 'react-native';

import { Row, Text } from '@/components/ui';
import type { StringKey } from '@/i18n/strings';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { layout, useTheme } from '@/theme';

const STEPS: { titleKey: StringKey; bodyKey: StringKey }[] = [
  { titleKey: 'home.step1Title', bodyKey: 'home.step1Body' },
  { titleKey: 'home.step2Title', bodyKey: 'home.step2Body' },
  { titleKey: 'home.step3Title', bodyKey: 'home.step3Body' },
];

export function HowItWorks() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();

  return (
    <View style={{ paddingHorizontal: layout.gutter, gap: t.spacing.xl }}>
      <Text variant="h2" urdu={isUrdu}>
        {tr('home.threeSteps')}
      </Text>

      <View>
        {STEPS.map((s, i) => (
          <Row
            key={s.titleKey}
            gap="lg"
            align="flex-start"
            style={{
              paddingVertical: t.spacing.lg,
              // A rule between rows, and none after the last — a trailing
              // hairline reads as a section that got cut off.
              borderBottomWidth: i < STEPS.length - 1 ? 1 : 0,
              borderBottomColor: t.colors.border,
            }}
          >
            {/* The numeral is the icon. Tabular figures so 1/2/3 sit on the
                same axis and the column of titles starts at one x-position. */}
            <Text variant="mono" tone="muted" style={{ fontSize: 15, width: 18 }}>
              {i + 1}
            </Text>
            <View style={{ flex: 1, gap: 3 }}>
              <T k={s.titleKey} variant="title" />
              <T k={s.bodyKey} variant="caption" tone="muted" />
            </View>
          </Row>
        ))}
      </View>
    </View>
  );
}
