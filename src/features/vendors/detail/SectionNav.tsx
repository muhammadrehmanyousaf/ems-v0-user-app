/**
 * SectionNav — the sticky section tabs on vendor detail.
 *
 * Governed by rules.md §0.0. Mirrors the web, which runs
 * `Overview · Gallery · Packages · Menus · Reviews · Availability` with
 * scroll-spy (`ems-v0/components/VendorDetails/VendorDetailsMobile.tsx`).
 *
 * ── Why a detail page needs this and a home page does not ─────────────────
 *
 * Vendor detail is the longest screen in the app — hero, trust strip, packages,
 * about, specs, services, reviews, availability, related. On a 360px phone that
 * is roughly six screens of scrolling, and the two questions a couple actually
 * arrives with — *what does it cost* and *is my date free* — live at opposite
 * ends of it. Without a section index the answer to "is 29 August free?" is
 * thirty seconds of thumb.
 *
 * ── Two decisions that keep it honest ─────────────────────────────────────
 *
 * 1. **A tab only exists if its section does.** The web renders all six
 *    regardless; here, a vendor with no packages has no Packages tab, and only
 *    caterers and venues ever get Menus. On a platform where ~98% of listings
 *    are unclaimed imports, six tabs leading to five empty sections would be a
 *    navigation bar that mostly lies about what is below it.
 * 2. **It is a scroll index, not a filter.** Tapping scrolls; it never hides the
 *    other sections. A couple who taps "Reviews" and then keeps scrolling should
 *    land in Availability, because that is the next question they will have.
 *
 * Scroll-spy (highlighting the tab you have scrolled into) is deliberately NOT
 * here yet: it needs `onScroll` at 60fps plus measured section offsets, and
 * doing it badly — a tab that flickers between two states at a section boundary
 * — is worse than a tab bar that simply reflects your last tap. Recorded rather
 * than half-built.
 */
import { ScrollView, View } from 'react-native';

import { Chip } from '@/components/ui';
import { layout, useTheme } from '@/theme';

export interface SectionNavItem {
  key: string;
  label: string;
}

export function SectionNav({
  items,
  active,
  onSelect,
  urdu,
}: {
  items: SectionNavItem[];
  active: string | null;
  onSelect: (key: string) => void;
  urdu?: boolean;
}) {
  const t = useTheme();

  // One tab is not a navigation bar — it is a label for the only thing there.
  if (items.length < 2) return null;

  return (
    <View
      style={{
        paddingVertical: t.spacing.md,
        backgroundColor: t.colors.screen,
        borderBottomWidth: 1,
        borderBottomColor: t.colors.border,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: t.spacing.sm }}
      >
        {items.map((it) => (
          <Chip
            key={it.key}
            label={it.label}
            selected={active === it.key}
            onPress={() => onSelect(it.key)}
            urdu={urdu}
          />
        ))}
      </ScrollView>
    </View>
  );
}
