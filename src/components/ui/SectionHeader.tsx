/**
 * SectionHeader — **v4. A real heading, not a tracked label.**
 *
 * Governed by rules.md §0.0.
 *
 * ── The change, and why it matters more than it looks ─────────────────────
 *
 * v3 rendered every section title as an 11px uppercase overline, tracked to
 * 1.4, in gold-brown — with a gold "See all" beside it. Six of these ran down
 * Home. Three things went wrong at once:
 *
 * 1. **The heading was smaller than the content it introduced.** An 11px label
 *    over a 15px vendor name is upside down: the eye finds the body first and
 *    the structure last, so the screen reads as an undifferentiated stream.
 * 2. **Uppercase tracked type is a LABEL, not a heading.** It is right for a
 *    two-word eyebrow ("STARTING FROM"). Used as the main title of every
 *    section it reads as packaging copy, and it cannot be scanned.
 * 3. **It spent the colour budget.** Gold title plus gold link, six times over,
 *    on a screen whose one gold event is supposed to be the primary action.
 *
 * v4: the title is `h2` — 22px, ink, sentence case, the display face. The
 * "See all" is a quiet muted label, deliberately not gold, because a navigation
 * affordance is not the most important thing on the screen. Hierarchy now comes
 * from size and weight, which is what rules.md §0.0 #5 requires.
 *
 * An optional `subtitle` is available because a section that needs explaining
 * should explain itself in body copy, rather than the title growing a clause.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { useT } from '@/i18n/useT';
import { haptics, useTheme } from '@/theme';

import { Text } from './Text';

export function SectionHeader({
  title,
  subtitle,
  onViewAll,
  viewAllLabel,
  urdu,
}: {
  title: string;
  /** One quiet line under the title. Use it instead of a longer title. */
  subtitle?: string;
  onViewAll?: () => void;
  /** Defaults to the translated "See all" — never a hardcoded English literal. */
  viewAllLabel?: string;
  urdu?: boolean;
}) {
  const t = useTheme();
  /**
   * The default used to be the string literal `'View all'`. Caught by running
   * Home in Urdu: every section header read `زمرے کے لحاظ سے` with an English
   * **View all** beside it. A default value is still a customer-readable string
   * (prohibition 4), and defaults are exactly where this hides.
   */
  const { t: tr } = useT();
  const label = viewAllLabel ?? tr('common.seeAll');

  return (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: t.spacing.lg,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="h2" urdu={urdu} numberOfLines={2} align={urdu ? 'right' : 'left'}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="caption"
            tone="muted"
            urdu={urdu}
            numberOfLines={2}
            align={urdu ? 'right' : 'left'}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onViewAll ? (
        /**
         * The touch target, measured at 360px, was 54 × **18**. Eighteen pixels
         * tall — on the one control that exists so a rail is not a dead end,
         * repeated six times down Home.
         *
         * Vertical padding rather than a height, so the alignment with the
         * title's first line is untouched: 13 top and bottom around an 18px line
         * is 44 exactly, and `marginVertical: -13` gives the space back to the
         * layout so no rail moves. The target grows, the design does not.
         */
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          accessibilityRole="button"
          onPress={() => {
            haptics.selection();
            onViewAll();
          }}
          style={{
            flexDirection: urdu ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 2,
            paddingVertical: 13,
            marginVertical: -13,
            marginTop: -7,
          }}
        >
          <Text variant="label" tone="muted" urdu={urdu} numberOfLines={1}>
            {label}
          </Text>
          {/* "Forward" is a direction, not an icon name: under RTL the arrow
              must point the way reading travels, or it says "go back". */}
          <Ionicons
            name={urdu ? 'chevron-back' : 'chevron-forward'}
            size={14}
            color={t.colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
