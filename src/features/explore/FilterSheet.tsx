/** FilterSheet — the Explore filter + sort bottom sheet (budget, rating, city,
 * capacity, amenities, verified/featured/available, sort). */
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Button, Chip, ChipSelect, Divider, Row, Section, Stack, Text } from '@/components/ui';
import { formatRs } from '@/features/vendors/vendor-display';
import { useTheme } from '@/theme';

import {
  DEFAULT_FILTERS,
  PRICE_MAX,
  SORT_OPTIONS,
  countActiveFilters,
  type ExploreFilters,
} from './vendor-filter';

const RATING_OPTIONS = [
  { value: '0', label: 'Any' },
  { value: '3', label: '3.0+' },
  { value: '4', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
];
const CAPACITY_OPTIONS = [
  { value: '0', label: 'Any' },
  { value: '100', label: '100+' },
  { value: '300', label: '300+' },
  { value: '500', label: '500+' },
  { value: '1000', label: '1000+' },
];

export function FilterSheet({
  visible,
  onClose,
  value,
  onApply,
  facets,
}: {
  visible: boolean;
  onClose: () => void;
  value: ExploreFilters;
  onApply: (f: ExploreFilters) => void;
  facets: { cities: string[]; amenities: string[] };
}) {
  const t = useTheme();
  const [draft, setDraft] = useState<ExploreFilters>(value);

  // Reset the draft each time the sheet opens — React's render-phase reset
  // pattern (no effect): sync draft to the applied filters on the open edge.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(value);
  }

  const patch = (p: Partial<ExploreFilters>) => setDraft((d) => ({ ...d, ...p }));
  const activeCount = countActiveFilters(draft);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(44,24,16,0.4)' }} onPress={onClose} />
      <View
        style={{
          backgroundColor: t.colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '86%',
        }}
      >
        <Row justify="space-between" style={{ padding: t.spacing.lg }}>
          <Text variant="h2">Filters</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={t.colors.textMuted} />
          </Pressable>
        </Row>
        <Divider />

        <ScrollView contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.xl }}>
          <Section title="SORT BY">
            <ChipSelect
              scroll={false}
              options={SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
              value={draft.sort}
              onChange={(v) => patch({ sort: (v as ExploreFilters['sort']) ?? 'relevance' })}
            />
          </Section>

          <Section title={`BUDGET · up to ${draft.maxPrice >= PRICE_MAX ? 'any' : formatRs(draft.maxPrice)}`}>
            <Slider
              minimumValue={0}
              maximumValue={PRICE_MAX}
              step={25000}
              value={draft.maxPrice}
              onValueChange={(v) => patch({ maxPrice: Math.round(v) })}
              minimumTrackTintColor={t.colors.gold}
              maximumTrackTintColor={t.colors.beige}
              thumbTintColor={t.colors.goldDark}
            />
            <Row justify="space-between">
              <Text variant="caption" tone="muted">Rs 0</Text>
              <Text variant="caption" tone="muted">Rs 1,000,000+</Text>
            </Row>
          </Section>

          <Section title="MINIMUM RATING">
            <ChipSelect
              scroll={false}
              options={RATING_OPTIONS}
              value={String(draft.minRating)}
              onChange={(v) => patch({ minRating: Number(v ?? 0) })}
            />
          </Section>

          <Section title="GUEST CAPACITY">
            <ChipSelect
              scroll={false}
              options={CAPACITY_OPTIONS}
              value={String(draft.minCapacity)}
              onChange={(v) => patch({ minCapacity: Number(v ?? 0) })}
            />
          </Section>

          {facets.cities.length > 1 ? (
            <Section title="CITY">
              <ChipSelect
                options={facets.cities.map((c) => ({ value: c, label: c }))}
                value={draft.city}
                onChange={(v) => patch({ city: v })}
                allLabel="All cities"
              />
            </Section>
          ) : null}

          <Section title="SHOW ONLY">
            <Stack gap="xs">
              <ToggleRow label="Verified vendors" icon="checkmark-circle-outline" on={draft.verifiedOnly} onToggle={() => patch({ verifiedOnly: !draft.verifiedOnly })} />
              <ToggleRow label="Featured" icon="star-outline" on={draft.featuredOnly} onToggle={() => patch({ featuredOnly: !draft.featuredOnly })} />
              <ToggleRow label="Available (not on vacation)" icon="checkmark-done-outline" on={draft.availableOnly} onToggle={() => patch({ availableOnly: !draft.availableOnly })} />
            </Stack>
          </Section>

          {facets.amenities.length > 0 ? (
            <Section title="AMENITIES">
              <Row gap="sm" wrap>
                {facets.amenities.map((a) => {
                  const on = draft.amenities.includes(a);
                  return (
                    <Chip
                      key={a}
                      label={a}
                      selected={on}
                      onPress={() =>
                        patch({ amenities: on ? draft.amenities.filter((x) => x !== a) : [...draft.amenities, a] })
                      }
                    />
                  );
                })}
              </Row>
            </Section>
          ) : null}
        </ScrollView>

        <Divider />
        <Row gap="md" style={{ padding: t.spacing.lg, paddingBottom: t.spacing.xl }}>
          <View style={{ flex: 1 }}>
            <Button label="Reset" variant="secondary" fullWidth onPress={() => setDraft({ ...DEFAULT_FILTERS })} />
          </View>
          <View style={{ flex: 1.4 }}>
            <Button
              label={activeCount > 0 ? `Apply (${activeCount})` : 'Apply'}
              fullWidth
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            />
          </View>
        </Row>
      </View>
    </Modal>
  );
}

function ToggleRow({
  label,
  icon,
  on,
  onToggle,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  on: boolean;
  onToggle: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 }}>
      <Ionicons name={icon} size={18} color={on ? t.colors.goldDark : t.colors.textMuted} />
      <Text variant="body" tone={on ? 'primary' : 'body'} style={{ flex: 1 }}>
        {label}
      </Text>
      <View
        style={{
          width: 46,
          height: 28,
          borderRadius: 14,
          backgroundColor: on ? t.colors.gold : t.colors.sand,
          justifyContent: 'center',
          paddingHorizontal: 3,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: t.colors.surface,
            alignSelf: on ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
}
