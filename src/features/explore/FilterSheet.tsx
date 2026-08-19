/**
 * FilterSheet — the Explore filter + sort sheet. Redrawn on v4.
 *
 * Budget, rating, city, capacity, amenities, verified/featured/available, sort.
 *
 * ── What was wrong, and it was not the layout ─────────────────────────────
 *
 * 1. **Not one string was translated.** Seventeen filters, six sort options,
 *    three toggles and two buttons, all hardcoded English, in an app that ships
 *    an Urdu interface. A customer on اردو got a fully translated Explore
 *    screen and then the densest sheet in the product entirely in English.
 *
 * 2. **It rolled its own `Modal`** with a literal `borderTopRadius: 20` and
 *    `maxHeight: '86%'` — which is why `Sheet`, the primitive written to stop
 *    exactly that, had no production call site and turned out not to work at
 *    all. This screen is the reason `Sheet` exists: seventeen controls is the
 *    shape that pushes its own Apply button off a 360px display.
 *
 * 3. **The footer broke its own grammar.** Two full-width buttons side by side,
 *    where `Sheet` documents (from Airbnb's filter sheet, docs/07 §7b.4) a text
 *    Reset bottom-left and the advancing action bottom-right. A full-width CTA
 *    says "this is the only thing you can do", which is false whenever a reset
 *    sits beside it.
 *
 * 4. **Gold everywhere.** A gold slider track, a gold thumb and three gold
 *    switches is five colour events on one sheet, where the system allows one —
 *    and on this sheet the one is the Apply button. The switches and the track
 *    are ink now.
 *
 * 5. `t.colors.sand` and `t.colors.beige` are deprecated v3 aliases; both are
 *    gone.
 */
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Chip, ChipSelect, Sheet, Text } from '@/components/ui';
import { PriceHistogram } from '@/components/ui/PriceHistogram';
import { formatRs } from '@/features/vendors/vendor-display';
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { haptics, useTheme } from '@/theme';

import {
  DEFAULT_FILTERS,
  PRICE_MAX,
  SORT_OPTIONS,
  countActiveFilters,
  type ExploreFacets,
  type ExploreFilters,
} from './vendor-filter';

/**
 * `value` is the stored filter; only the label localises.
 *
 * "3.0+" and "500+" are digits and stay Latin in both interfaces — the same
 * rule the money column, the slot hours and the booking timestamps follow.
 * Only "Any" is a word, so only "Any" is translated.
 */
const RATING_OPTIONS = ['0', '3', '4', '4.5'] as const;
const CAPACITY_OPTIONS = ['0', '100', '300', '500', '1000'] as const;

export function FilterSheet({
  visible,
  onClose,
  value,
  onApply,
  facets,
  fullSet,
}: {
  visible: boolean;
  onClose: () => void;
  value: ExploreFilters;
  onApply: (f: ExploreFilters) => void;
  facets: ExploreFacets;
  /** False while Explore is still on infinite scroll — see `PriceHistogram`. */
  fullSet: boolean;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [draft, setDraft] = useState<ExploreFilters>(value);

  // Reset the draft each time the sheet opens — React's render-phase reset
  // pattern (no effect): sync draft to the applied filters on the open edge.
  // An effect here would set state during the commit that opened the sheet,
  // which is one of the five shapes that produce "Maximum update depth
  // exceeded" on Fabric.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(value);
  }

  const patch = (p: Partial<ExploreFilters>) => setDraft((d) => ({ ...d, ...p }));
  const activeCount = countActiveFilters(draft);

  const budgetLabel =
    draft.maxPrice >= PRICE_MAX
      ? `${tr('filter.budget')} · ${tr('filter.budgetAny')}`
      : `${tr('filter.budget')} · ${tr('filter.budgetUpTo')} ${formatRs(draft.maxPrice)}`;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={tr('filter.title')}
      resetLabel={tr('filter.reset')}
      onReset={() => setDraft({ ...DEFAULT_FILTERS })}
      primaryLabel={
        // Parentheses are bidi-neutral too — "لاگو کریں (3)" resolves the
        // bracket pair to the wrong side without the isolate.
        activeCount > 0
          ? `${tr('filter.apply')} ${ltr(`(${activeCount})`, isUrdu)}`
          : tr('filter.apply')
      }
      onPrimary={() => {
        onApply(draft);
        onClose();
      }}
      urdu={isUrdu}
    >
      <View style={{ gap: t.spacing.huge }}>
        <Group title={tr('filter.sortBy')} urdu={isUrdu}>
          <ChipSelect
            scroll={false}
            options={SORT_OPTIONS.map((s) => ({
              value: s.value,
              // The option list owns the VALUES; the string file owns the words.
              label: tr(`sort.${s.value}` as StringKey),
            }))}
            value={draft.sort}
            onChange={(v) => patch({ sort: (v as ExploreFilters['sort']) ?? 'relevance' })}
            urdu={isUrdu}
          />
        </Group>

        <Group title={budgetLabel} urdu={isUrdu}>
          {/*
            The distribution behind the slider. A bare slider makes the customer
            guess where the inventory actually is; the histogram shows them, and
            the line beneath it states how many vendors carry no price at all —
            which at ~98% unpriced is the single most useful sentence on this
            sheet. It costs no request: `deriveFacets` already walks the set.

            This component existed, fully written and specced, and was on no
            screen at all. It is on one now.
          */}
          <PriceHistogram
            prices={facets.prices}
            min={0}
            max={draft.maxPrice}
            sampled={!fullSet}
            urdu={isUrdu}
          />
          <Slider
            minimumValue={0}
            maximumValue={PRICE_MAX}
            step={25000}
            value={draft.maxPrice}
            onValueChange={(v) => patch({ maxPrice: Math.round(v) })}
            // Ink, not gold. The one gold event on this sheet is Apply.
            minimumTrackTintColor={t.colors.textPrimary}
            maximumTrackTintColor={t.colors.border}
            thumbTintColor={t.colors.textPrimary}
          />
          <View
            style={{
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
            }}
          >
            {/* Figures, so never `urdu`. */}
            <Text variant="caption" tone="muted">
              Rs 0
            </Text>
            <Text variant="caption" tone="muted">
              Rs 1,000,000+
            </Text>
          </View>
        </Group>

        <Group title={tr('filter.rating')} urdu={isUrdu}>
          <ChipSelect
            scroll={false}
            options={RATING_OPTIONS.map((v) => ({
              value: v,
              // One decimal on every threshold: "3+ · 4+ · 4.5+" is a ragged
              // set, "3.0+ · 4.0+ · 4.5+" reads as one scale.
              // `ltr` because Urdu bidi moves the trailing `+` to the front —
              // "3.0+" rendered as "+3.0", which is a different claim.
              label: v === '0' ? tr('filter.any') : ltr(`${Number(v).toFixed(1)}+`, isUrdu),
            }))}
            value={String(draft.minRating)}
            onChange={(v) => patch({ minRating: Number(v ?? 0) })}
            urdu={isUrdu}
          />
        </Group>

        <Group title={tr('filter.capacity')} urdu={isUrdu}>
          <ChipSelect
            scroll={false}
            options={CAPACITY_OPTIONS.map((v) => ({
              value: v,
              label: v === '0' ? tr('filter.any') : ltr(`${v}+`, isUrdu),
            }))}
            value={String(draft.minCapacity)}
            onChange={(v) => patch({ minCapacity: Number(v ?? 0) })}
            urdu={isUrdu}
          />
        </Group>

        {facets.cities.length > 1 ? (
          <Group title={tr('filter.city')} urdu={isUrdu}>
            <ChipSelect
              options={facets.cities.map((c) => ({ value: c, label: c }))}
              value={draft.city}
              onChange={(v) => patch({ city: v })}
              allLabel={tr('filter.allCities')}
              urdu={isUrdu}
            />
          </Group>
        ) : null}

        <Group title={tr('filter.showOnly')} urdu={isUrdu}>
          <View>
            <ToggleRow
              label={tr('filter.verified')}
              on={draft.verifiedOnly}
              onToggle={() => patch({ verifiedOnly: !draft.verifiedOnly })}
              urdu={isUrdu}
            />
            <ToggleRow
              label={tr('filter.featured')}
              on={draft.featuredOnly}
              onToggle={() => patch({ featuredOnly: !draft.featuredOnly })}
              urdu={isUrdu}
            />
            <ToggleRow
              label={tr('filter.available')}
              on={draft.availableOnly}
              onToggle={() => patch({ availableOnly: !draft.availableOnly })}
              urdu={isUrdu}
              last
            />
          </View>
        </Group>

        {facets.amenities.length > 0 ? (
          <Group title={tr('filter.amenities')} urdu={isUrdu}>
            <View
              style={{
                flexDirection: isUrdu ? 'row-reverse' : 'row',
                flexWrap: 'wrap',
                gap: t.spacing.sm,
              }}
            >
              {/* Amenity names come from the vendor rows themselves and are not
                  a closed list, so there is nothing to translate them against.
                  `urdu` is left unset so the auto-detection in `Text` sets an
                  Urdu-script amenity in Nastaliq and a Latin one in Jakarta. */}
              {facets.amenities.map((a) => {
                const on = draft.amenities.includes(a);
                return (
                  <Chip
                    key={a}
                    label={a}
                    selected={on}
                    onPress={() =>
                      patch({
                        amenities: on
                          ? draft.amenities.filter((x) => x !== a)
                          : [...draft.amenities, a],
                      })
                    }
                  />
                );
              })}
            </View>
          </Group>
        ) : null}
      </View>
    </Sheet>
  );
}

/**
 * A filter group. The title is a quiet overline, NOT `Section` — `Section`
 * renders its title at `h2` 22 Fraunces, which is right for "About" on a vendor
 * page and wrong for eight stacked control labels on a sheet, where it would
 * shout over the controls it names.
 */
function Group({
  title,
  urdu,
  children,
}: {
  title: string;
  urdu?: boolean;
  children: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.md }}>
      <Text
        variant="overline"
        tone="muted"
        urdu={urdu}
        style={{
          textAlign: urdu ? 'right' : 'left',
          // Latin only — Nastaliq has no case, and `textTransform` on it is
          // either a no-op or a glyph-shaping bug on some Android builds.
          ...(urdu ? null : { textTransform: 'uppercase' as const }),
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * A switch row. Ink, not gold — three gold switches on a sheet that already has
 * a gold Apply button is four colour events where the system allows one.
 *
 * The leading icon is gone with them. Each icon was a different glyph decorating
 * a label that already said the thing ("Verified vendors" beside a tick), and
 * on a hairline list the icon column only adds noise.
 */
function ToggleRow({
  label,
  on,
  onToggle,
  urdu,
  last,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  urdu?: boolean;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={() => {
        haptics.selection();
        onToggle();
      }}
      style={({ pressed }) => ({
        flexDirection: urdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: t.spacing.lg,
        minHeight: 52,
        paddingVertical: t.spacing.sm,
        borderBottomWidth: last ? 0 : t.layout.hairline,
        borderBottomColor: t.colors.border,
        backgroundColor: pressed ? t.colors.sunken : 'transparent',
      })}
    >
      <Text
        variant="body"
        tone={on ? 'primary' : 'body'}
        urdu={urdu}
        numberOfLines={2}
        style={{ flex: 1, textAlign: urdu ? 'right' : 'left' }}
      >
        {label}
      </Text>

      <View
        style={{
          width: 46,
          height: 28,
          borderRadius: t.radius.pill,
          backgroundColor: on ? t.colors.textPrimary : t.colors.sunken,
          // A hairline when off, so the track is visible against paper rather
          // than reading as an empty gap.
          borderWidth: on ? 0 : t.layout.hairline,
          borderColor: t.colors.border,
          justifyContent: 'center',
          paddingHorizontal: 3,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: t.radius.pill,
            backgroundColor: on ? t.colors.white : t.colors.borderStrong,
            alignSelf: on ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
}
