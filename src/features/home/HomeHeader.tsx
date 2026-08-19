/**
 * HomeHeader — the hero. Governed by rules.md §0.0.
 *
 * ── The problem this version solves ───────────────────────────────────────
 *
 * The previous hero was "Assalam-o-Alaikum, Rehman" over "Find your perfect day"
 * over a search field. Competent, and completely impersonal: a greeting with a
 * name in it is a mail merge, not personalisation, and "Find your perfect day"
 * is a line that would fit any wedding product in any country.
 *
 * The hero now leads with the one fact that is genuinely THEIRS and genuinely
 * true — **how long until the wedding**:
 *
 *     Assalam-o-Alaikum, Rehman
 *     218
 *     days to your shaadi
 *     Saturday, 21 March 2027 · Change
 *
 * The numeral is set in the mono face at 64px, which is the largest type
 * anywhere in the app. That is deliberate: it is the only number a couple
 * actually feels, and it changes every morning, so the screen is different each
 * time they open it. No other personalisation available to us does that.
 *
 * ── When there is no date ─────────────────────────────────────────────────
 *
 * It does NOT fall back to the old marketing line. It asks, once, in the same
 * position, with a reason attached ("See who is free, and how long you have").
 * Tapping expands a calendar INLINE — not a sheet, not a modal, not a route.
 * Inline because sheets cannot be verified on web, because a modal for a
 * one-tap answer is heavy, and because the answer belongs where the question is.
 *
 * ── The material, and why the flat version failed ─────────────────────────
 *
 * The first cut of this hero was black type on bare paper. It was rejected as
 * basic, and that was right: a hero with no ground is not restraint, it is an
 * absence. A phone hero has to feel like a SURFACE — something the content sits
 * on — or the screen reads as a document.
 *
 * So the hero now sits on the deep register: a `royal` gradient panel, rounded
 * at the bottom corners, running full-bleed to the top of the device and behind
 * the status bar. The Mehrab is drawn large in gold hairline across it. The
 * countdown is ivory, the label gold, and the search field sits as a light
 * object OVERLAPPING the panel's bottom edge — which is the layered move that
 * makes a header read as premium rather than as a coloured rectangle.
 *
 * One dark ground per screen, and this is Home's. The featured card gave its
 * deep register up to pay for it — it is now paper with a gold rule, and the two
 * would have competed.
 *
 * ── Honesty ───────────────────────────────────────────────────────────────
 *
 * The date lives on the device — the customer profile has no field for it — and
 * the UI says so in one quiet line rather than implying it syncs to the website.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { ArchOrnament } from '@/components/signature';
import { Calendar, Text } from '@/components/ui';
import { usePlatformStats } from '@/features/vendors/vendors.queries';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { fromKey, longDate, startOfMonth, today, type DayKey } from '@/lib/date';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { daysUntil, useWeddingStore } from '@/store/wedding';
import { alpha, gradients, haptics, layout, palette, useTheme } from '@/theme';

/** 52: the reference's search field is a substantial object, not a form input. */
const FIELD = 52;

/**
 * The three categories a Pakistani couple books first, in the order they book
 * them: the venue anchors the date, the photographer is booked against it, and
 * catering follows from the guest count the venue allows.
 *
 * Three, not six — a row of six pills at 360px is 48px each, which is a chip
 * row, and the panel already has a category row below it. These are shortcuts,
 * not navigation.
 */
const QUICK_JUMPS: {
  slug: string;
  labelKey: StringKey;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { slug: 'wedding-venues', labelKey: 'home.featuredVenues', icon: 'business-outline' },
  { slug: 'wedding-photographers', labelKey: 'home.topPhotographers', icon: 'camera-outline' },
  { slug: 'caterers', labelKey: 'home.caterers', icon: 'restaurant-outline' },
];

export function HomeHeader({
  onSearchPress,
  onFilterPress,
}: {
  onSearchPress: () => void;
  onFilterPress: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const stats = usePlatformStats();
  const savedCount = useFavoritesStore((s) => s.ids.size);

  const date = useWeddingStore((s) => s.date);
  const setDate = useWeddingStore((s) => s.setDate);
  const [picking, setPicking] = useState(false);

  // First name only — "Assalam-o-Alaikum, Muhammad Rehman Yousaf" wraps to two
  // lines on a 360px screen and reads like a database row.
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? null;
  const align = isUrdu ? 'right' : 'left';
  const days = daysUntil(date);

  const choose = (key: DayKey) => {
    haptics.medium();
    setDate(key);
    setPicking(false);
  };

  return (
    <View>
      {/* The panel. Full-bleed to the top of the device, rounded only at the
          bottom, so it reads as a surface the page hangs from. */}
      <LinearGradient
        colors={gradients.royal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + t.spacing.xl,
          paddingHorizontal: layout.gutter,
          // Room for the search field to overlap the bottom edge.
          paddingBottom: FIELD / 2 + t.spacing.xl,
          borderBottomLeftRadius: t.radius.xxl,
          borderBottomRightRadius: t.radius.xxl,
          overflow: 'hidden',
        }}
      >
        {/*
          The Mehrab, ORNAMENTED. A bare outline left the right of the panel
          reading as empty; a mehrab in Mughal architecture is a niche carved
          with jaal, not a hollow shape. Filling it is the finished version, and
          it is the one thing that can occupy this space without being a claim
          about a vendor or a stock photograph pretending to be one.

          Pinned to the right edge and bled slightly off it, so it frames the
          countdown instead of sitting beside it as a second object.
        */}
        <View style={{ position: 'absolute', top: -16, right: -28 }} pointerEvents="none">
          <ArchOrnament width={216} height={288} />
        </View>

      <Text variant="caption" tone="onDark" urdu={isUrdu} align={align} style={{ opacity: 0.7 }}>
        {tr('home.greeting')}
        {firstName ? `, ${firstName}` : ''}
      </Text>

      {days != null && days > 0 ? (
        /* ── The countdown, and the couple's own progress beside it ────── */
        <View
          style={{
            marginTop: t.spacing.sm,
            flexDirection: isUrdu ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexShrink: 1 }}>
          <Text
            variant="mono"
            tone="onDark"
            align={align}
            // 68/64: larger than `hero`, and the only place in the app that goes
            // off the type scale on purpose. A countdown is a display object,
            // not a heading — it is read as a shape before it is read as a word.
            style={{ fontSize: 68, lineHeight: 64, letterSpacing: -3 }}
          >
            {days}
          </Text>
          <Text variant="h2" tone="gold" urdu={isUrdu} align={align} style={{ marginTop: 2 }}>
            {days === 1 ? tr('home.dayToShaadi') : tr('home.daysToShaadi')}
          </Text>
          </View>

          {/*
            The right of the panel was empty, and empty is not the same as calm:
            the hero stated a fact and offered nothing to do about it. This fills
            it with the couple's OWN number rather than decoration.

            It appears only once they have saved something. A glass "0 saved"
            would be a module advertising that the customer has done nothing —
            worse than the empty space it replaced.
          */}
          {savedCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${savedCount} ${tr('home.savedVendors')}`}
              onPress={() => {
                haptics.light();
                router.push('/favorites');
              }}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 76,
                paddingVertical: t.spacing.md,
                paddingHorizontal: t.spacing.md,
                borderRadius: t.radius.lg,
                // Glass on the deep register: a light film plus a gold rim.
                backgroundColor: alpha(palette.onDark, 0.08),
                borderWidth: 1,
                borderColor: alpha(palette.goldLight, 0.22),
              }}
            >
              <Ionicons name="heart" size={16} color={t.colors.goldLight} />
              <Text variant="mono" tone="onDark" style={{ fontSize: 22, marginTop: 4 }}>
                {savedCount}
              </Text>
              <Text
                variant="caption"
                tone="onDark"
                urdu={isUrdu}
                style={{ fontSize: 11, opacity: 0.7 }}
              >
                {tr('home.savedVendors')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : days != null && days === 0 ? (
        <Text variant="display" tone="onDark" urdu={isUrdu} align={align} style={{ marginTop: t.spacing.sm }}>
          {tr('home.shaadiToday')}
        </Text>
      ) : days != null ? (
        /* A past date is not an error and is not hidden — it is acknowledged,
           with the change affordance right beside it. */
        <Text variant="h1" tone="onDark" urdu={isUrdu} align={align} style={{ marginTop: t.spacing.sm }}>
          {tr('home.shaadiPassed')}
        </Text>
      ) : (
        /* ── No date yet: the ask, in the hero's own position ──────────── */
        <View style={{ marginTop: t.spacing.sm }}>
          <Text variant="display" tone="onDark" urdu={isUrdu} align={align}>
            {tr('home.heroTop')}
          </Text>
          <Text variant="display" tone="onDark" urdu={isUrdu} align={align}>
            <Text variant="display" italic={!isUrdu} urdu={isUrdu} tone="gold">
              {tr('home.heroAccent')}
            </Text>
            {` ${tr('home.heroTail')}`}
          </Text>
        </View>
      )}

      {/* The date line: what it is, and how to change it. Or the invitation. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={date ? tr('home.changeDate') : tr('home.setDate')}
        onPress={() => {
          haptics.light();
          setPicking((p) => !p);
        }}
        style={{
          flexDirection: isUrdu ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: t.spacing.sm,
          marginTop: t.spacing.md,
          paddingVertical: t.spacing.sm,
        }}
      >
        <Ionicons
          name={date ? 'calendar-clear-outline' : 'add-circle-outline'}
          size={16}
          color={t.colors.goldLight}
        />
        <Text variant="label" tone="onDark" urdu={isUrdu} numberOfLines={1} style={{ opacity: 0.85 }}>
          {date ? longDate(fromKey(date) ?? today(), locale) : tr('home.setDate')}
        </Text>
        <Ionicons
          name={picking ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={t.colors.goldLight}
        />
      </Pressable>

      {!date && !picking ? (
        <Text variant="caption" tone="onDark" urdu={isUrdu} align={align} style={{ marginTop: -4, opacity: 0.62 }}>
          {tr('home.setDateSub')}
        </Text>
      ) : null}

        {/*
          Quick jumps. The three categories a Pakistani couple books first, in
          order — the venue anchors the date, the photographer is booked against
          it, catering follows the guest count. Glass pills so they read as
          controls ON the panel rather than as content in it.
        */}
        {/*
          A SCROLLING row of content-sized pills, not three `flex: 1` thirds.
          
          Equal thirds gave every pill 99px on a 360px screen. Minus a 14px icon,
          a 6px gap and 2×12 padding that leaves ~55px of text — so two of the
          three could never fit their own label and rendered as
          "Featured ve…" and "Top photog…". The labels were not too long; the
          layout was refusing to let them be their own width.
          
          It bleeds past the gutter on both edges so a pill can scroll off the
          screen rather than stop short of it, which is what tells you the row
          scrolls at all.
        */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: t.spacing.lg, marginHorizontal: -layout.gutter }}
          contentContainerStyle={{
            flexDirection: isUrdu ? 'row-reverse' : 'row',
            gap: t.spacing.sm,
            paddingHorizontal: layout.gutter,
          }}
        >
          {QUICK_JUMPS.map((q) => (
            <Pressable
              key={q.slug}
              accessibilityRole="button"
              accessibilityLabel={tr(q.labelKey)}
              onPress={() => {
                haptics.selection();
                router.push({ pathname: '/explore', params: { category: q.slug } });
              }}
              style={{
                // Content-sized. Never `flex: 1` — see the note above.
                flexDirection: isUrdu ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: 40,
                paddingHorizontal: t.spacing.lg,
                borderRadius: t.radius.pill,
                backgroundColor: alpha(palette.onDark, 0.08),
                borderWidth: 1,
                borderColor: alpha(palette.onDark, 0.14),
              }}
            >
              <Ionicons name={q.icon} size={14} color={t.colors.goldLight} />
              <Text
                variant="caption"
                tone="onDark"
                urdu={isUrdu}
                numberOfLines={1}
                style={{ fontSize: 12 }}
              >
                {tr(q.labelKey)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* The search field OVERLAPS the panel's bottom edge — half in the dark,
          half on the paper. That single overlap is what makes a header read as
          layered rather than as a coloured rectangle with content under it. */}
      <View
        style={{
          flexDirection: isUrdu ? 'row-reverse' : 'row',
          gap: t.spacing.md,
          paddingHorizontal: layout.gutter,
          marginTop: -FIELD / 2,
        }}
      >
        <Pressable
          accessibilityRole="search"
          accessibilityLabel={tr('home.searchHint')}
          onPress={() => {
            haptics.light();
            onSearchPress();
          }}
          style={{
            flex: 1,
            height: FIELD,
            borderRadius: t.radius.pill,
            flexDirection: isUrdu ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: t.spacing.md,
            paddingHorizontal: t.spacing.xl,
            backgroundColor: t.colors.card,
            ...t.elevation.lg,
          }}
        >
          <Ionicons name="search" size={18} color={t.colors.textPrimary} />
          <Text
            variant="body"
            tone="muted"
            urdu={isUrdu}
            numberOfLines={1}
            style={{ flex: 1 }}
            align={align}
          >
            {tr('home.searchHint')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr('home.filtersLabel')}
          onPress={() => {
            haptics.light();
            onFilterPress();
          }}
          style={{
            width: FIELD,
            height: FIELD,
            borderRadius: t.radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.colors.card,
            ...t.elevation.lg,
          }}
        >
          <Ionicons name="options-outline" size={20} color={t.colors.textPrimary} />
        </Pressable>
      </View>

      {picking ? (
        <View
          style={{
            marginTop: t.spacing.lg,
            paddingHorizontal: layout.gutter,
          }}
        >
          {/* Inline, one month, page owns the scroll — the same `scrollable`
              contract the vendor detail screen uses. */}
          <Calendar
            month={date ? (fromKey(date) ?? startOfMonth(today())) : startOfMonth(today())}
            monthsToRender={1}
            scrollable={false}
            selected={date}
            onSelect={choose}
            minDate={today()}
            hideLegend
            urdu={isUrdu}
          />
          <Text variant="caption" tone="faint" urdu={isUrdu} align={align}>
            {tr('home.dateLocalNote')}
          </Text>
        </View>
      ) : null}

      {/*
        The meta line. Platform figures are live from `/platform-stats` and vanish
        entirely on failure — no fallback number, because an invented figure is
        worse than no figure. `couplesServed` is deliberately not shown: it is 54,
        a true number and a weak signal. Choosing which true facts to lead with is
        editing; inventing one would be lying.

        The saved count is appended only once the couple HAS saved something, so
        the line grows with them instead of opening on a zero.
      */}
      {stats.data ? (
        <Text
          variant="caption"
          tone="muted"
          urdu={isUrdu}
          align={align}
          style={{ marginTop: t.spacing.lg, paddingHorizontal: layout.gutter }}
        >
          {[
            `${stats.data.vendors.toLocaleString('en-PK')} ${tr('home.vendors')}`,
            `${stats.data.cities.toLocaleString('en-PK')} ${tr('home.cities')}`,
            savedCount > 0 ? `${savedCount} ${tr('home.savedCount')}` : null,
          ]
            .filter(Boolean)
            .join('  ·  ')}
        </Text>
      ) : null}
    </View>
  );
}
