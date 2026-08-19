/**
 * MenusSection — per-head menus, with the minimum that actually decides cost.
 *
 * Governed by rules.md §0.0. The web has a Menus tab; the app had nothing.
 *
 * ── The real shape, read from live production ─────────────────────────────
 *
 *   { id, title: "Standard Desi Menu", price: "1850.00",
 *     pricingUnit: "per_head", minGuaranteeCount: 148,
 *     data: { items: ["Chicken Karahi two", "Beef Pulao", …] } }
 *
 * ── Why the minimum guarantee is the point ────────────────────────────────
 *
 * "Rs 1,850 per head" sounds affordable and is not the number a couple pays.
 * With `minGuaranteeCount: 148` the vendor bills for 148 covers whether 148
 * people come or 90 do — so the real floor on that menu is **Rs 273,800**, and a
 * couple planning a 100-guest nikah would be charged for 48 people who do not
 * exist.
 *
 * That is the single most expensive surprise in Pakistani wedding catering, the
 * data is right there on the row, and neither the app nor (in this form) the web
 * spells it out. So this component computes it and states it in words:
 *
 *     Rs 1,850 per head
 *     Minimum 148 guests — Rs 273,800
 *
 * rules.md §0 puts truth above beauty, and §5.7 forbids implying a vendor offers
 * something the data does not say. Showing the per-head rate alone would not be
 * a lie exactly — it would just be the half of the truth that flatters us.
 *
 * A menu with no `minGuaranteeCount` shows only the rate, because then there
 * genuinely is no floor. Nothing is invented for the missing case.
 */
import { View } from 'react-native';

import { Section, Text } from '@/components/ui';
import { formatRs } from '@/features/vendors/vendor-display';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

import type { Vendor } from '../vendors.types';

interface Menu {
  id?: number;
  title?: string | null;
  price?: number | string | null;
  pricingUnit?: string | null;
  minGuaranteeCount?: number | null;
  data?: { items?: unknown[] } | null;
}

/** Numeric price from the backend's DECIMAL-as-string, or null. */
function priceOf(m: Menu): number | null {
  const n = Number(m.price);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function MenusSection({ vendor }: { vendor: Vendor }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();

  const menus = (Array.isArray(vendor.menus) ? (vendor.menus as Menu[]) : []).filter(
    (m) => m && (m.title || priceOf(m) != null),
  );
  if (menus.length === 0) return null;

  return (
    <Section title={tr('detail.menus')} urdu={isUrdu}>
      <View style={{ gap: t.spacing.lg }}>
        {menus.map((m, i) => {
          const rate = priceOf(m);
          const perHead = String(m.pricingUnit ?? '').includes('head');
          const minGuests =
            m.minGuaranteeCount && m.minGuaranteeCount > 0 ? m.minGuaranteeCount : null;
          const floor = rate != null && perHead && minGuests ? rate * minGuests : null;
          const items = (m.data?.items ?? []).filter(
            (x): x is string => typeof x === 'string' && x.length > 0,
          );

          return (
            <View
              key={m.id ?? i}
              style={{
                paddingBottom: t.spacing.lg,
                borderBottomWidth: i < menus.length - 1 ? 1 : 0,
                borderBottomColor: t.colors.border,
                gap: t.spacing.sm,
              }}
            >
              <View
                style={{
                  flexDirection: isUrdu ? 'row-reverse' : 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: t.spacing.md,
                }}
              >
                <Text variant="h3" urdu={isUrdu} numberOfLines={2} style={{ flex: 1 }}>
                  {m.title ?? tr('detail.menus')}
                </Text>
                {rate != null ? (
                  <Text variant="mono" style={{ fontSize: 15 }}>
                    {formatRs(rate)}
                  </Text>
                ) : null}
              </View>

              {rate != null && perHead ? (
                <Text variant="caption" tone="muted" urdu={isUrdu}>
                  {tr('detail.perHead')}
                </Text>
              ) : null}

              {/* The number that actually decides affordability. Stated in full
                  rather than left for the customer to multiply. */}
              {floor != null && minGuests ? (
                <View
                  style={{
                    marginTop: t.spacing.xs,
                    padding: t.spacing.md,
                    borderRadius: t.radius.sm,
                    backgroundColor: t.colors.warningBg,
                  }}
                >
                  <Text variant="label" tone="warning" urdu={isUrdu}>
                    {`${tr('detail.minGuests')} ${minGuests} — ${formatRs(floor)}`}
                  </Text>
                  <Text variant="caption" tone="muted" urdu={isUrdu} style={{ marginTop: 2 }}>
                    {tr('detail.minGuestsNote')}
                  </Text>
                </View>
              ) : null}

              {items.length > 0 ? (
                <Text variant="body" tone="body" urdu={isUrdu} style={{ marginTop: t.spacing.xs }}>
                  {items.join(' · ')}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </Section>
  );
}
