/**
 * PackageTiles — selectable package tiers.
 *
 * Previously packages rendered as a vertical stack of read-only cards, which had
 * two problems: nothing could be chosen (so the price in the CTA was always the
 * vendor's floor price, whatever the customer was actually looking at), and three
 * stacked cards pushed reviews and availability below the fold.
 *
 * A row of tiles fixes both. It also matches how a Pakistani vendor sells —
 * Standard / Silver / Gold — and it is the same tier control the booking flow
 * needs, so building it here means Slice 2 inherits it rather than reinventing it.
 *
 * Layout is a wrapping row, not a horizontal scroll: with two or three tiers
 * everything must be visible at once for the prices to be comparable, and a
 * hidden fourth tier is a hidden price. Four or more wrap onto a second line.
 */
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatRs } from '@/features/vendors/vendor-display';
import type { VendorPackage } from '@/features/vendors/vendors.types';
import { useT } from '@/i18n/useT';
import { goldScale, haptics, useTheme } from '@/theme';

export interface PackageTilesProps {
  packages: VendorPackage[];
  selectedId: number | null;
  onSelect: (pkg: VendorPackage | null) => void;
  urdu?: boolean;
}

/** A package is only selectable as a price if it actually carries one. */
function priceOf(p: VendorPackage): number | null {
  const n = Number(p.price);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function PackageTiles({ packages, selectedId, onSelect, urdu }: PackageTilesProps) {
  const t = useTheme();
  const { t: tr } = useT();
  if (packages.length === 0) return null;

  return (
    /**
     * v4: a ROW of tiles, not a wrapping grid.
     *
     * Three tiers side by side is a comparison — the whole point of a package
     * tier is that you read it against the others. A wrapping grid put the third
     * tier on its own line at 360px, which turned "Silver / Gold / Platinum"
     * into "Silver, Gold" and then a lonely Platinum, and quietly changed the
     * question from "which of these" to "is this one worth it".
     */
    <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'stretch' }}>
      {packages.map((p, i) => {
        const id = typeof p.id === 'number' ? p.id : i;
        const selected = selectedId === id;
        const price = priceOf(p);

        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => {
              haptics.selection();
              // Tapping the selected tile clears it — the customer can back out
              // of a tier without leaving the screen.
              onSelect(selected ? null : { ...p, id });
            }}
            style={{
              flex: 1,
              paddingVertical: t.spacing.lg,
              paddingHorizontal: t.spacing.sm,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: t.spacing.sm,
              borderRadius: t.radius.lg,
              // Selection is INK, matching Chip and the calendar's chosen day —
              // one selected-state language across the app, so a customer learns
              // it once. Gold stays reserved for the action that commits.
              borderWidth: selected ? 1.5 : 1,
              borderColor: selected ? t.colors.textPrimary : t.colors.border,
              backgroundColor: t.colors.card,
            }}
          >
            {/* Two lines: real package names are long ("Silver — Nikah Package")
                and truncating them to "Silver — Nika…" hides which event the
                tier is for, which is the only thing distinguishing them. */}
            <Text
              variant="caption"
              tone={selected ? 'gold' : 'primary'}
              weight="medium"
              urdu={urdu}
              numberOfLines={2}
              align="center"
              style={{ fontSize: 11, lineHeight: 14 }}
            >
              {p.name?.trim() || `Package ${i + 1}`}
            </Text>
            <Text
              variant="mono"
              tone={selected ? 'gold' : 'muted'}
              style={{ fontSize: 10 }}
              numberOfLines={1}
            >
              {formatRs(price, tr('price.onRequest'))}
            </Text>
            {/* Reserve the underline height so selecting never shifts the row. */}
            <View
              style={{
                height: 2,
                width: selected ? 16 : 0,
                borderRadius: 1,
                backgroundColor: selected ? goldScale.bright : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
