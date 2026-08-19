/**
 * ScreenHeader — the deep panel that opens Home and Explore, as a component.
 *
 * Governed by rules.md §0.0.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * Home and Explore each grew their own copy of the same panel: full-bleed
 * gradient behind the status bar, rounded bottom, Mehrab in gold hairline,
 * title, subtitle. Two copies is a coincidence; five would be a design system
 * that only exists in prose. Plan, Inbox and Account all need the same opening,
 * so the panel becomes one component before it is used a third time — rules.md
 * §0.0 #6, redraw once in the library, then let screens consume it.
 *
 * Home keeps its own bespoke version: its panel carries a live countdown, a
 * saved-vendors module, quick-jump pills and an expanding calendar. Forcing that
 * through a generic component would produce a prop list longer than the markup.
 * A shared component for the four ordinary cases and a bespoke one for the hero
 * is the right split — the alternative is a `ScreenHeader` with fifteen optional
 * props, which is how design systems die.
 *
 * `trailing` takes one control (a sign-out, a mark-all-read) because the top
 * right of a screen holds exactly one thing before it becomes a toolbar.
 *
 * ── `onBack`, and why it is a prop rather than a `leading` node ───────────
 *
 * This panel is the DEEP REGISTER — `gradients.royal`, near-black. Its own
 * title and subtitle are `tone="onDark"`, but `leading` and `trailing` are
 * arbitrary children, so every caller had to remember that on its own.
 *
 * None of them did. Favourites, Guides, Bookings and Inbox each hand-rolled the
 * identical back chevron in `colors.textPrimary` — ink, on near-black. The
 * control rendered, occupied space, responded to taps, and **could not be
 * seen**. Four screens, one mistake, because the component let each of them
 * make it.
 *
 * `onBack` renders the chevron here, in the right tone, mirrored for Urdu. A
 * primitive that knows it is dark should not ask its callers to know it too.
 * `leading` stays for the rare control that is not a back button, and the
 * doc comment now says out loud what tone it has to be.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { ArchOrnament } from '@/components/signature';
import { gradients, haptics, layout, useTheme } from '@/theme';

import { Text } from './Text';

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel,
  leading,
  trailing,
  urdu,
}: {
  title: string;
  subtitle?: string;
  /**
   * The way back. Renders a correctly-toned, correctly-mirrored chevron —
   * prefer this over building one yourself and passing it as `leading`.
   */
  onBack?: () => void;
  /** Accessibility label for the back control. Pass the translated string. */
  backLabel?: string;
  /**
   * One control above the title — in practice, the way back.
   *
   * It sits ABOVE the title rather than beside it, which is deliberate: a back
   * chevron on the same row steals width from a `display`-size heading, and on
   * a 360px screen that is the difference between a title on one line and a
   * title on two. Stacking costs 44px of height once and buys the full gutter
   * for the words on every screen that uses it.
   *
   * **This panel is dark.** Anything passed here must be `tone="onDark"` or a
   * light colour — see the header note. For a plain back button use `onBack`,
   * which handles that for you.
   */
  leading?: ReactNode;
  /** One control, top-right. More than one and it is a toolbar, not a header.
   *  Same rule as `leading`: this surface is dark. */
  trailing?: ReactNode;
  urdu?: boolean;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const align = urdu ? 'right' : 'left';

  return (
    <LinearGradient
      colors={gradients.royal}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: insets.top + t.spacing.lg,
        paddingHorizontal: layout.gutter,
        paddingBottom: t.spacing.xxl,
        borderBottomLeftRadius: t.radius.xxl,
        borderBottomRightRadius: t.radius.xxl,
        overflow: 'hidden',
      }}
    >
      {/* The Mehrab, filled with jaal. Smaller than Home's — these screens are
          destinations, not the front door, and the ornament scales with the
          weight of the moment. */}
      <View style={{ position: 'absolute', top: -26, right: -34 }} pointerEvents="none">
        <ArchOrnament width={168} height={224} opacity={0.16} />
      </View>

      {onBack || leading ? (
        <View
          style={{
            alignItems: urdu ? 'flex-end' : 'flex-start',
            marginBottom: t.spacing.md,
          }}
        >
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={backLabel ?? 'Back'}
              onPress={() => {
                haptics.light();
                onBack();
              }}
              hitSlop={12}
              style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
            >
              {/* `onDark` — this panel is the deep register. And the chevron
                  POINTS, so it flips in Urdu rather than just moving. */}
              <Ionicons
                name={urdu ? 'chevron-forward' : 'chevron-back'}
                size={24}
                color={t.colors.onDark}
              />
            </Pressable>
          ) : (
            leading
          )}
        </View>
      ) : null}

      <View
        style={{
          flexDirection: urdu ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: t.spacing.lg,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="display" tone="onDark" urdu={urdu} align={align} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              variant="body"
              tone="onDark"
              urdu={urdu}
              align={align}
              style={{ opacity: 0.7, marginTop: 4 }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing ?? null}
      </View>
    </LinearGradient>
  );
}
