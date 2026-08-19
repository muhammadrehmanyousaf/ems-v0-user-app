/**
 * VendorHostCard — spec: docs/05-UI-SPEC.md §7c. Evidence: §7b.1 (MB2).
 * Redrawn on v4, and finally on a screen.
 *
 * ── The biggest gap the research exposed ─────────────────────────────────
 *
 * Airbnb sells the host as a PERSON: "Stay with Allison · Superhost · 7 years
 * hosting", with a face. A named human with visible tenure is the strongest
 * trust signal a marketplace has, because it converts an anonymous listing into
 * someone accountable.
 *
 * We hold `ownerName`, `ownerBio`, `yearsInBusiness`, `weddingsCompleted` and
 * `reliability.tier` on every business row — 111 columns — and displayed almost
 * none of it. This component is that fix.
 *
 * It hides ENTIRELY without an owner name. ~98% of listings are unclaimed OSM
 * imports with no owner, and "Hosted by null" is worse than silence. That is
 * also why this is a card rather than a section header: an absent card leaves no
 * empty heading behind.
 *
 * ── What the redraw changed ──────────────────────────────────────────────
 *
 * · **Bordered AND shadowed.** `borderWidth: 1` plus `elevation.sm` — the
 *   soft-furnishing card v4 exists to remove. It is a hairline on paper now.
 *
 * · **Four gold events in one card**: the fallback initial on a gold wash, the
 *   verification tick in `goldDark`, "Read more" in gold, and a gold-brown
 *   `tone="label"` overline. On a vendor page whose one gold event is "Request
 *   booking", a trust card is not allowed to shout louder than the CTA. All ink.
 *
 * · **It never mirrored.** A card that takes an `urdu` prop and lays its avatar,
 *   name and chevron out left-to-right in both languages.
 *
 * · **Six inline `urdu ? '…' : '…'` ternaries** plus `'Verified'`, `'year'`,
 *   `'years'` and `'weddings'` as English literals — so an Urdu customer read
 *   "تصدیق شدہ · 5 years · 20 weddings". In `strings.ts` now.
 *
 * · **`fontSize: 9`** on the overline, under a system whose smallest step is 11
 *   and whose premise is that type carries the hierarchy.
 *
 * · **`colors.sand`**, a v3 alias marked `@deprecated use sunken`.
 *
 * · The whole bio was a `Pressable` with no visible affordance beyond the gold
 *   word at the end, and the header `Pressable` had a role but no label.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ltr } from '@/i18n/bidi';
import { useT } from '@/i18n/useT';
import { img } from '@/lib/img';
import { haptics, useTheme } from '@/theme';

import { Text } from './Text';

export interface VendorHostCardProps {
  ownerName?: string | null;
  ownerBio?: string | null;
  avatarUrl?: string | null;
  yearsInBusiness?: number | null;
  weddingsCompleted?: number | null;
  reliabilityTier?: string | null;
  verified?: boolean;
  onPress?: () => void;
  urdu?: boolean;
}

/** Below this a bio reads in full at three lines, so there is nothing to expand. */
const EXPANDABLE_AT = 120;

export function VendorHostCard({
  ownerName,
  ownerBio,
  avatarUrl,
  yearsInBusiness,
  weddingsCompleted,
  reliabilityTier,
  verified,
  onPress,
  urdu,
}: VendorHostCardProps) {
  const t = useTheme();
  const { t: tr } = useT();
  const [expanded, setExpanded] = useState(false);

  const name = ownerName?.trim();
  if (!name) return null;

  // Credentials, most-credible first, and only what is actually real. Numbers
  // are bidi-isolated: "5 years" in an RTL line otherwise renders "years 5".
  const credentials = [
    verified
      ? tr('trust.verified')
      : // The raw backend tier stays English, as everywhere else it is shown —
        // the vendor portal displays the same vocabulary and the two surfaces
        // must not disagree about what a vendor has been told they are.
        reliabilityTier && reliabilityTier.toLowerCase() !== 'newcomer'
        ? reliabilityTier
        : null,
    yearsInBusiness && yearsInBusiness > 0
      ? `${ltr(String(yearsInBusiness), urdu)} ${tr(yearsInBusiness === 1 ? 'host.year' : 'host.years')}`
      : null,
    weddingsCompleted && weddingsCompleted > 0
      ? `${ltr(weddingsCompleted.toLocaleString('en-PK'), urdu)} ${tr('host.weddings')}`
      : null,
  ].filter(Boolean) as string[];

  const bio = ownerBio?.trim();
  const canExpand = !!bio && bio.length >= EXPANDABLE_AT;
  const initial = name.charAt(0).toUpperCase();
  const row = urdu ? ('row-reverse' as const) : ('row' as const);

  return (
    <View
      style={{
        backgroundColor: t.colors.card,
        // A hairline, and no shadow. It was `borderWidth: 1` AND `elevation.sm`.
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        borderRadius: t.radius.lg,
        padding: t.spacing.lg,
        gap: t.spacing.md,
      }}
    >
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? `${tr('host.hostedBy')}: ${name}` : undefined}
        disabled={!onPress}
        onPress={() => {
          if (!onPress) return;
          haptics.light();
          onPress();
        }}
        style={{ flexDirection: row, alignItems: 'center', gap: t.spacing.md }}
      >
        <View style={{ width: 44, height: 44 }}>
          {avatarUrl ? (
            <Image
              source={{ uri: img(avatarUrl, { width: 44, height: 44 }) ?? avatarUrl }}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.colors.sunken }}
              contentFit="cover"
              transition={180}
            />
          ) : (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: t.colors.sunken,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* `urdu={false}`: a lone initial taken from a Nastaliq name gives
                  that letter's ISOLATED form, which is not its shape inside the
                  name. Same call `MonogramFallback` makes. */}
              <Text variant="h2" tone="muted" urdu={false} style={{ fontSize: 19 }}>
                {initial}
              </Text>
            </View>
          )}
          {verified ? (
            <View
              style={{
                position: 'absolute',
                right: urdu ? undefined : -2,
                left: urdu ? -2 : undefined,
                bottom: -2,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: t.colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark-circle" size={16} color={t.colors.textPrimary} />
            </View>
          ) : null}
        </View>

        {/*
          "HOSTED BY" is an overline above the name, not a prefix on it.
          Airbnb can write "Stay with Allison" on one line because the name is
          short; at 360px with a 44px avatar and a chevron the text column is
          ~230px, and "Hosted by Rehman Yousaf" truncated to "Hosted by Rehman
          Y…" — losing the surname, which is the part that makes the vendor a
          real person. Pakistani names are longer than the reference assumed.
        */}
        <View style={{ flex: 1 }}>
          <Text
            variant="overline"
            tone="muted"
            urdu={urdu}
            style={{ textAlign: urdu ? 'right' : 'left' }}
          >
            {tr('host.hostedBy')}
          </Text>
          <Text
            variant="title"
            urdu={urdu}
            numberOfLines={2}
            style={{ marginTop: 2, textAlign: urdu ? 'right' : 'left' }}
          >
            {name}
          </Text>
          {credentials.length > 0 ? (
            <Text
              variant="caption"
              tone="muted"
              urdu={urdu}
              numberOfLines={2}
              style={{ marginTop: 2, textAlign: urdu ? 'right' : 'left' }}
            >
              {credentials.join(' · ')}
            </Text>
          ) : null}
        </View>

        {onPress ? (
          <Ionicons
            name={urdu ? 'chevron-back' : 'chevron-forward'}
            size={18}
            color={t.colors.textMuted}
          />
        ) : null}
      </Pressable>

      {bio ? (
        <View style={{ gap: 4 }}>
          <Text
            variant="body"
            tone="body"
            urdu={urdu}
            numberOfLines={expanded ? undefined : 3}
            style={{ textAlign: urdu ? 'right' : 'left' }}
          >
            {bio}
          </Text>
          {/* The control is the WORD, not the whole paragraph. Making the bio
              itself pressable gave a screen reader a button reading out three
              lines of prose, and gave everyone else no visible affordance. */}
          {canExpand ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded((v) => !v)}
              hitSlop={8}
              style={({ pressed }) => ({
                alignSelf: urdu ? 'flex-end' : 'flex-start',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                variant="label"
                tone="primary"
                urdu={urdu}
                style={{ textDecorationLine: 'underline' }}
              >
                {tr(expanded ? 'host.showLess' : 'host.readMore')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
