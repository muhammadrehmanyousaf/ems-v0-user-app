/**
 * SpecStrip — the "at a glance" facts row on a vendor detail screen: capacity,
 * parking, indoor/outdoor, advance %.
 *
 * Borrowed from the NOTES strip in the perfume reference, and it earns its place
 * here for a specific reason: a Pakistani couple choosing a venue is comparing
 * four or five numbers, and those numbers were previously buried in prose or in
 * an amenities chip cloud. A fixed strip means the same facts sit in the same
 * place on every vendor, which is what makes comparison possible at all.
 *
 * Cells that have no value are dropped rather than shown empty — 98% of listings
 * are unclaimed OSM imports with mostly-null columns, and a strip of four
 * dashes reads as a broken screen. Below two real facts the whole strip hides.
 *
 * ── What v4 changed ───────────────────────────────────────────────────────
 *
 * **Eight gold events in one strip.** Four gold icons and four gold labels,
 * sitting directly under a vendor name and directly above a gold CTA. That is
 * the accent used as a texture, which is precisely what the token file says it
 * must never be — and it made the strip shout louder than the venue's own
 * price.
 *
 * The facts also could not be read. Values were `mono` 13 and labels were 9px
 * tracked to 0.9, which is smaller than any other text in the product, on the
 * one element whose entire job is being scanned at a glance. Values are 18 and
 * labels are `caption` 13 now.
 *
 * Everything is ink and hairline. The strip's job is to make four numbers
 * comparable across vendors; colour was never doing any of that work.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export interface Spec {
  icon: keyof typeof Ionicons.glyphMap;
  /** The number or short token: "500", "AC", "10%". */
  value: string | number | null | undefined;
  /** The label beneath: "Seated", "Parking". */
  label: string;
}

export function SpecStrip({ specs, urdu }: { specs: Spec[]; urdu?: boolean }) {
  const t = useTheme();

  const real = specs.filter(
    (s) => s.value !== null && s.value !== undefined && String(s.value).trim() !== '',
  );
  // One lonely fact is not a comparison aid; it belongs in the body copy.
  if (real.length < 2) return null;

  return (
    <View
      style={{
        flexDirection: urdu ? 'row-reverse' : 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: t.colors.divider,
      }}
    >
      {real.map((s, i) => (
        <View
          key={`${s.label}-${i}`}
          style={{
            flex: 1,
            alignItems: 'center',
            gap: 5,
            paddingVertical: t.spacing.lg,
            // The rule between cells follows the reading direction, so in Urdu
            // it is the LEFT edge that carries it.
            ...(i < real.length - 1
              ? urdu
                ? {
                    borderLeftWidth: StyleSheet.hairlineWidth,
                    borderLeftColor: t.colors.divider,
                  }
                : {
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor: t.colors.divider,
                  }
              : null),
          }}
        >
          <Ionicons name={s.icon} size={16} color={t.colors.textMuted} />
          {/* Never `urdu`: these are figures and short Latin tokens ("500",
              "20%", "AC"), and Nastaliq numerals here would break the column. */}
          <Text variant="mono" tone="primary" style={{ fontSize: 18, lineHeight: 23 }}>
            {String(s.value)}
          </Text>
          <Text
            variant="caption"
            tone="muted"
            urdu={urdu}
            align="center"
            numberOfLines={1}
          >
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
