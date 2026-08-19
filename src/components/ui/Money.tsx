/**
 * MoneyRow + TotalsCard — spec: docs/05-UI-SPEC.md §14. Redrawn on v4.
 *
 * One place where money is formatted and coloured, because money bugs in a
 * wedding app are the ones that lose trust permanently.
 *
 * ── The rules encoded here ───────────────────────────────────────────────
 *
 * · Every figure is `mono` and right-aligned, so amounts align down the column.
 *   Ragged digits in a totals block read as an error even when the maths is right.
 * · Money IN is `success`, money OWED is `danger`, and gold is NEVER used for an
 *   amount — gold means "action", and a number is not an action.
 * · Never `Rs 0`. An absent price is "On request" (WW-PRICE0), because a real
 *   zero and an unknown price are different facts and 3,268 businesses were once
 *   bookable at Rs 0 by conflating them.
 * · Postgres returns DECIMAL as a STRING. `Number()` at the boundary, here, not
 *   in a component that happens to need it.
 *
 * ── What v4 changed, and why it matters more here than anywhere ───────────
 *
 * `TotalsCard` was a bordered, shadowed, white-filled box — the single pattern
 * rules.md §0.0 names in its "before" column. On the booking review screen it
 * put a frame around the one thing on the page nobody needs help finding: the
 * price. A box says "this is a group of related things". A total is not a group.
 *
 * So the box is gone and the hierarchy is carried the way the reference carries
 * it — by a rule and by size. Line items sit on the paper at body/mono 14; a
 * hairline crosses the full width; the total lands at `monoLarge` 22. That is a
 * 1.6× jump on the figure and a genuine change of weight on the label, where the
 * old version stepped `label` 14 → `title` 16 and relied on the border to do the
 * rest of the work.
 *
 * The `surface` prop exists for the one place a container is still correct: a
 * totals block sitting ON a photograph or inside a dark sheet, where paper
 * ground is not underneath it. Even then it is white-on-white with a hairline,
 * never a shadow.
 */
import { View, type ViewStyle } from 'react-native';

import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

import { Text } from './Text';

/**
 * Is there actually a price? The structural answer, independent of any string.
 *
 * `MoneyRow` used to decide this with `formatRs(value) !== 'On request'` — a
 * DISPLAY string standing in for a fact about the data. That works exactly until
 * the string is translated, at which point every Urdu row silently starts
 * believing it has a real number and prints a `+`/`−` sign in front of
 * "قیمت پوچھیں". The sentinel has to be the value, not the label.
 */
export function hasPrice(value: number | string | null | undefined): boolean {
  const n = typeof value === 'string' ? Number(value) : value;
  return n != null && Number.isFinite(n) && n > 0;
}

/**
 * Rs with thousands separators, no decimals. The only money formatter.
 *
 * `onRequest` is passed in rather than hardcoded: this is a pure function with
 * no access to the locale, and ~98% of listings carry no price, so the string it
 * returns most often was the one string it could not translate. Callers with a
 * translator pass `tr('price.onRequest')`; the English default keeps every
 * existing call site correct.
 */
export function formatRs(
  value: number | string | null | undefined,
  onRequest = 'On request',
): string {
  if (!hasPrice(value)) return onRequest;
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return `Rs ${Math.round(n).toLocaleString('en-PK')}`;
}

export type MoneyDirection = 'in' | 'out' | 'neutral';

export interface MoneyRowProps {
  label: string;
  value: number | string | null | undefined;
  /** `in` = paid/received (green) · `out` = owed (red) · `neutral` = ink. */
  direction?: MoneyDirection;
  /** Prefix the amount with `+` / `−`. */
  signed?: boolean;
  /** Step the row up to totals weight. */
  emphasis?: boolean;
  /** Secondary line under the label — "20% of Rs 665,000". */
  note?: string;
  urdu?: boolean;
  style?: ViewStyle;
}

export function MoneyRow({
  label,
  value,
  direction = 'neutral',
  signed,
  emphasis,
  note,
  urdu,
  style,
}: MoneyRowProps) {
  const t = useTheme();
  const { t: tr } = useT();

  const tone = direction === 'in' ? 'success' : direction === 'out' ? 'danger' : 'primary';
  const text = formatRs(value, tr('price.onRequest'));
  const isReal = hasPrice(value);
  const sign = signed && isReal ? (direction === 'out' ? '− ' : '+ ') : '';

  return (
    <View
      style={[
        {
          // Urdu reads right-to-left, and a totals block that keeps its labels
          // on the left in Urdu puts the amount where the eye starts — the
          // opposite of the alignment the whole component exists to protect.
          flexDirection: urdu ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: t.spacing.lg,
          paddingVertical: emphasis ? t.spacing.xs : 5,
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          variant={emphasis ? 'h3' : 'body'}
          tone={emphasis ? 'primary' : 'body'}
          urdu={urdu}
          style={{ textAlign: urdu ? 'right' : 'left' }}
        >
          {label}
        </Text>
        {note ? (
          <Text
            variant="caption"
            tone="muted"
            urdu={urdu}
            numberOfLines={1}
            style={{ textAlign: urdu ? 'right' : 'left', marginTop: 1 }}
          >
            {note}
          </Text>
        ) : null}
      </View>
      {/* Never `urdu` on the figure. Digits are Latin in both interfaces —
          "Rs 665,000" set in Nastaliq is unreadable, and the column stops
          aligning the moment one row changes family. */}
      <Text
        variant={emphasis ? 'monoLarge' : 'mono'}
        tone={isReal ? tone : 'muted'}
        numberOfLines={1}
      >
        {sign}
        {text}
      </Text>
    </View>
  );
}

export interface TotalsCardProps {
  /** Line items above the rule. */
  lines: MoneyRowProps[];
  /** The total, rendered at emphasis below a hairline. */
  total?: MoneyRowProps;
  /** Settlement lines below the total — paid / balance. */
  settlement?: MoneyRowProps[];
  /** A quiet overline above the block. */
  title?: string;
  /**
   * Draw the block on its own white surface with a hairline. For totals that do
   * NOT sit on paper — on photography, or inside the deep register. Never
   * needed on an ordinary screen.
   */
  surface?: boolean;
  urdu?: boolean;
}

export function TotalsCard({ lines, total, settlement, title, surface, urdu }: TotalsCardProps) {
  const t = useTheme();
  return (
    <View
      style={
        surface
          ? {
              backgroundColor: t.colors.card,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.border,
              borderRadius: t.radius.lg,
              padding: t.spacing.xl,
            }
          : undefined
      }
    >
      {title ? (
        <Text
          variant="overline"
          tone="muted"
          urdu={urdu}
          style={{
            marginBottom: t.spacing.md,
            textAlign: urdu ? 'right' : 'left',
            // Latin only — Nastaliq has no case, and `textTransform` on it is
            // either a no-op or a glyph-shaping bug on some Android builds.
            ...(urdu ? null : { textTransform: 'uppercase' as const }),
          }}
        >
          {title}
        </Text>
      ) : null}

      {lines.map((l, i) => (
        <MoneyRow key={`${l.label}-${i}`} {...l} urdu={urdu} />
      ))}

      {total ? (
        <>
          {/* Full-width rule. This is the whole structure of the block — it
              replaces the border that used to run around all four sides. */}
          <View
            style={{
              height: t.layout.hairline,
              backgroundColor: t.colors.border,
              marginTop: t.spacing.md,
              marginBottom: t.spacing.md,
            }}
          />
          <MoneyRow {...total} emphasis urdu={urdu} />
        </>
      ) : null}

      {settlement?.length ? (
        // Settlement hangs off the total rather than starting a new group, so
        // the gap above it is smaller than the gap above the rule.
        <View style={{ marginTop: total ? t.spacing.sm : t.spacing.md }}>
          {settlement.map((s, i) => (
            <MoneyRow key={`${s.label}-${i}`} {...s} urdu={urdu} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
