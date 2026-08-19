/**
 * FeatureSpotlight — THE focal element on Home. One vendor, the largest type
 * on the screen, a gold rule and the Mehrab. Exactly one per screen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THIS IS NOT A PHOTOGRAPH
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * It was, until it was checked against production. This is the finding in full,
 * because the conclusion looks like a downgrade until you see the evidence.
 *
 * The previous version led with `images[0]` behind a scrim, protected by a gate
 * on the VENDOR: sponsored or verified, plus at least one review. Reasonable, and
 * completely ineffective — the gate qualified the business, and the risk lives in
 * the image.
 *
 * On production today exactly one wedding venue in the first twelve passes that
 * gate: **id 3358, Rehman Grand Marquee** — `verificationTier: 3`, rating 4.33,
 * 3 reviews, `completenessScore: 100`. The best-credentialled venue on the
 * platform. Its images were downloaded and looked at:
 *
 *   images[0] — an AI-rendered WEDDING WALA CORPORATE LOBBY: a reception desk
 *               under a large "WeddingWala" sign reading "Welcome to Pakistan's
 *               Premier Wedding Platform". Our own marketing render.
 *   images[1] — the logo of **aiondigital.com**, an unrelated tech company.
 *
 * So the one qualifying vendor would have rendered our own advert, full-bleed, as
 * the largest element on Home, captioned "Rehman Grand Marquee · Johar Town ·
 * Rs 350,000". That is precisely the failure the gate was written to prevent, and
 * the gate sailed straight past it.
 *
 * Then the obvious question: gate the image instead. It cannot be done. The
 * business row was dumped and searched — there is no `coverImage`, no
 * `primaryImage`, no `isPrimary` flag, no caption, no moderation state. 120
 * columns and not one says which photograph is of the venue. "`.png` among
 * `.jpg`" catches images[0] and misses images[1], which is a .jpg. Nothing in the
 * API distinguishes a marquee from a stranger's logo.
 *
 * rules.md §0 ranks truth above beauty, and §6 says nothing good enough for the
 * featured slot means render nothing. But rendering nothing also costs Home its
 * focal element, and design law §1 requires exactly one. Both are satisfiable at
 * once, because the constraint is on IMAGERY, not on prominence:
 *
 *   Lead with the FACTS, at the largest type on the screen, and drop the photo.
 *
 * Every line on this card is a column we can stand behind — verification tier,
 * owner name, years in business, weddings hosted, capacity range, rating, review
 * count, starting price. It reads as the platform vouching for a vendor rather
 * than a stock photo pretending to be their lawn, and it surfaces the four fields
 * (`ownerName`, `yearsInBusiness`, `weddingsCompleted`, capacity range) the app
 * has always held and never once shown.
 *
 * It is also the more distinctive design: a gold rule, a Mughal arch and a name
 * set in Fraunces is unmistakably Wedding Wala from a cropped screenshot, which is
 * the stated target in the decisions log. A scrim over someone's photograph is what
 * every wedding directory on earth already looks like.
 *
 * **When B2 is fixed** — ops curates galleries, or the backend adds a curated
 * cover field — the photograph comes back, and this comment is the record of why
 * it left. Until then: we do not amplify an image we cannot verify.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ArchOutline } from '@/components/signature';
import { SectionHeader, Skeleton, Text, TrustRow } from '@/components/ui';
import { formatRs, vendorCategoryShort, vendorLocation } from '@/features/vendors/vendor-display';
import { useVendorsByCategory } from '@/features/vendors/vendors.queries';
import type { Vendor } from '@/features/vendors/vendors.types';
import { useT } from '@/i18n/useT';
import { haptics, layout, palette, usePressScale, useTheme } from '@/theme';

const HEIGHT = 216;

/**
 * ── v4: the focal element stopped being a dark slab ───────────────────────
 *
 * v3 rendered this as a charcoal gradient card with gold type and a glow
 * bleeding out from under it. It was the single darkest, heaviest object in the
 * app, on a screen whose ground is now paper — a black rectangle on a white page
 * is not "premium", it is a banner ad, and the glow was a second colour event on
 * a screen that is supposed to have none.
 *
 * v4 keeps every decision that was RIGHT — no photograph (the imagery cannot be
 * trusted; see the note above), facts only, the Mehrab as the signature — and
 * moves them onto paper:
 *
 *   • the vendor's name at `h1` 27, the biggest type on Home
 *   • the facts in a bordered `TrustRow`, the same strip used on detail
 *   • a gold hairline rule and the arch, drawn in `goldLine`, as the only accent
 *   • no fill, no gradient, no glow, no shadow
 *
 * It is now the focal element by SIZE and POSITION rather than by being the one
 * dark thing on the page, which is what rules.md §0.0 #5 asks for.
 */

/**
 * Who is allowed in the featured slot.
 *
 * The gate is unchanged and still necessary — it is what keeps an unclaimed OSM
 * import with no reviews out of the most prominent element on the screen. What
 * changed is that it is no longer asked to do a job it cannot do (judge a
 * photograph), so it is now sufficient for what it does check.
 *
 * Requirements: the platform has actually vouched for the vendor (verified or
 * sponsored) AND at least one real review. Nobody qualifies → render nothing.
 */
function pickSpotlight(vendors: Vendor[] | undefined): Vendor | null {
  if (!vendors?.length) return null;

  const eligible = vendors.filter(
    (v) => (v.sponsored || (v.verificationTier ?? 0) > 0) && (v.reviewCount ?? 0) > 0,
  );
  if (!eligible.length) return null;

  // Sponsored outranks verified — it is a paid placement and the vendor chose it.
  const sponsored = eligible.filter((v) => v.sponsored);
  const pool = sponsored.length > 0 ? sponsored : eligible;

  return (
    [...pool].sort(
      (a, b) =>
        (b.verificationTier ?? 0) - (a.verificationTier ?? 0) ||
        (b.rating ?? 0) - (a.rating ?? 0) ||
        (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
    )[0] ?? null
  );
}

/**
 * The seated figure a venue actually sells, preferring the most conservative real
 * column. Never `legalGuestCap` — that is fire-rated occupancy, not a number of
 * wedding guests, and quoting it would oversell every venue on the platform.
 */
function capacityRange(v: Vendor): string | null {
  const max = v.seatedCapacity ?? v.comfortCapacity ?? v.maxCapacity ?? null;
  if (max == null || max <= 0) return null;
  const min = v.minCapacity ?? null;
  return min != null && min > 0 && min < max ? `${min}–${max}` : `${max}`;
}

export function FeatureSpotlight() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.985);

  // Same key and limit as the venues rail, so the two share one cache entry and
  // one request instead of firing 10 rows and 12 rows at the same endpoint.
  const q = useVendorsByCategory('wedding-venues', 10);
  const vendor = useMemo(() => pickSpotlight(q.data?.vendors), [q.data?.vendors]);

  if (q.isLoading) {
    return (
      <View style={{ paddingHorizontal: layout.gutter, gap: t.spacing.md }}>
        <SectionHeader title={tr('home.featuredTitle')} urdu={isUrdu} />
        <Skeleton height={HEIGHT} radius={t.radius.xl} />
      </View>
    );
  }
  if (!vendor) return null;

  const price = vendor.minimumPrice != null && vendor.minimumPrice > 0 ? vendor.minimumPrice : null;
  const location = vendorLocation(vendor);
  const guests = capacityRange(vendor);
  // `.toUpperCase()` stays: `variant="overline"` sets the tracking but does NOT
  // transform case, so the shouting is this line's job. It is a no-op on
  // Nastaliq, which is correct — Arabic script has no case to raise.
  const eyebrow = [vendorCategoryShort(vendor, isUrdu), location]
    .filter(Boolean)
    .join(' · ')
    .toUpperCase();

  /** Owner credentials — only what the row actually carries. */
  const tenure =
    vendor.yearsInBusiness != null && vendor.yearsInBusiness > 0
      ? `${vendor.yearsInBusiness} ${tr('home.yearsHosting')}`
      : null;
  /** Capacity and weddings-hosted, as a quiet line. Each drops out when null. */
  const facts = [
    guests ? `${guests} ${tr('home.guestsRange')}` : null,
    vendor.weddingsCompleted != null && vendor.weddingsCompleted > 0
      ? `${vendor.weddingsCompleted} ${tr('home.weddingsHosted')}`
      : null,
  ].filter(Boolean) as string[];

  const host = vendor.ownerName?.trim()
    ? [`${tr('home.hostedBy')} ${vendor.ownerName.trim()}`, tenure].filter(Boolean).join(' · ')
    : tenure;

  return (
    <View style={{ gap: t.spacing.lg }}>
      <View style={{ paddingHorizontal: layout.gutter }}>
        <SectionHeader title={tr('home.featuredTitle')} urdu={isUrdu} />
      </View>

      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${vendor.name} — ${tr('home.viewVendor')}`}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => {
            haptics.medium();
            router.push(`/vendor/${vendor.id}`);
          }}
          style={{
            marginHorizontal: layout.gutter,
            paddingTop: t.spacing.xl,
            // A single gold rule across the top. That is the entire frame — no
            // fill, no border, no shadow. The block is focal because its type is
            // the largest on the screen, not because it is a coloured object.
            borderTopWidth: 2,
            borderTopColor: t.colors.goldLine,
          }}
        >
          {/* The Mehrab, drawn in gold hairline on paper and pinned to the right
              so the name runs clear of it. The signature, at a whisper. */}
          <View style={styles.arch} pointerEvents="none">
            <ArchOutline width={116} height={164} color={t.colors.goldLine} strokeWidth={1} />
          </View>

          <View style={{ gap: t.spacing.sm }}>
            {eyebrow ? (
              <Text variant="overline" tone="label" numberOfLines={1}>
                {eyebrow}
              </Text>
            ) : null}

            {/* The largest type on Home. A vendor's name must never be reduced
                to guesswork, so it gets the display face and three lines. */}
            <Text variant="h1" numberOfLines={3}>
              {vendor.name}
            </Text>

            {host ? (
              <Text variant="body" tone="muted" numberOfLines={1}>
                {host}
              </Text>
            ) : null}
          </View>

          {/* The same bordered stat strip used on vendor detail — one trust
              component across the app, so a couple learns to read it once. */}
          <View style={{ marginTop: t.spacing.lg }}>
            <TrustRow
              rating={vendor.rating}
              reviewCount={vendor.reviewCount}
              verificationTier={vendor.verificationTier}
              sponsored={vendor.sponsored}
              urdu={isUrdu}
            />
          </View>

          {/* Capacity and tenure, as a quiet fact line rather than three more
              boxes. `·` separated, and each part drops out when its column is
              null — an unclaimed listing simply gets a shorter line. */}
          {facts.length > 0 ? (
            <Text variant="caption" tone="muted" numberOfLines={2} style={{ marginTop: t.spacing.md }}>
              {facts.join('  ·  ')}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <View>
              <Text variant="overline" tone="muted" style={{ fontSize: 10 }}>
                {tr('home.startingFrom')}
              </Text>
              <Text variant="monoLarge">{formatRs(price)}</Text>
            </View>
            <View style={styles.cta}>
              <Text variant="label" tone="primary" urdu={isUrdu}>
                {tr('home.viewVendor')}
              </Text>
              <Ionicons
                name={isUrdu ? 'chevron-back' : 'chevron-forward'}
                size={16}
                color={t.colors.textPrimary}
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 0.3, not 0.5: at half opacity the arch's left leg drew a visible line
  // straight through "· 5 years hosting". Lower, it reads as the niche the
  // content sits in — which is the intent — instead of a rule across the text.
  // right: 0, not -18. Bleeding the arch past the gutter let the viewport clip
  // its right leg, so the signature rendered as half an arch — and a signature
  // that isn't legible as itself is just a stray line. Verified on screen.
  arch: { position: 'absolute', top: 10, right: 0, opacity: 0.5 },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    // `palette.line`, not `colors.*`: StyleSheet.create runs at module scope
    // where the theme hook is unavailable. A literal hex here would be
    // prohibition 5 and invisible to the next palette change.
    borderTopColor: palette.line,
  },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 2 },
});
