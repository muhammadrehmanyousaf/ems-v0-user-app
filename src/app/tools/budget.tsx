/**
 * Budget — the planning tool. Redrawn on v4.
 *
 * ── The money rule, broken twice more ─────────────────────────────────────
 *
 * `Money.tsx` states it in its own header: **money is never gold, because gold
 * means "action" and a number is not an action.** This screen printed the total
 * at `display` 32 in gold, and every line item's estimate in gold beneath it —
 * on the one screen in the app that is entirely about money. That made it the
 * fourth and fifth instances of the same rule being broken, after the bookings
 * list and the Plan tab.
 *
 * Everything is ink now. The total leads by SIZE (display 32 against caption 13)
 * and the spent figure keeps `success` green, because money that has actually
 * gone out is information, and that is the one colour the money rule sanctions.
 *
 * ── And the rest ──────────────────────────────────────────────────────────
 *
 * · **Four bordered `Card`s plus one per line item** — the banned pattern, on a
 *   screen whose whole content is a list.
 * · **Four gold-brown overlines** (`tone="label"`), plus a gold progress bar per
 *   category. With the gold total and the gold FAB that is a dozen colour events
 *   before a single line item is added.
 * · **A hand-rolled header** — now `ScreenHeader onBack`, which also fixes the
 *   ink-on-near-black back chevron this screen shared with three others.
 * · **Its own modal chrome** (`borderTopRadius: 20`, `maxHeight: '88%'`) instead
 *   of `Sheet`, so it had no height cap protecting its Save button.
 * · **`formatRs(0)` renders "On request"** — a vendor-pricing concept that is
 *   nonsense on a budget. An untouched budget is Rs 0, and saying "On request"
 *   about your own spending is meaningless.
 * · `colors.sand` is a deprecated v3 alias.
 *
 * ── The FAB had to go, and not for a style reason ─────────────────────────
 *
 * "Add" was a 56px floating circle bottom-right. Line-item amounts are
 * right-aligned in exactly that column, so at the screen's RESTING scroll
 * position the circle sat on top of the first item's figure: `Rs 40●,●00`.
 * A control that covers a number on a budget screen is not a trade-off, it is
 * a defect — and it mirrors to cover the item NAME in Urdu instead.
 *
 * Add now lives in the header's `trailing` slot, which is where Inbox puts its
 * one control and where nothing can be underneath it. It costs a scroll to
 * reach on a long list; it buys a screen where every figure is legible, which
 * on this screen is the whole point.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  Button,
  ChipSelect,
  EmptyState,
  FormField,
  ScreenHeader,
  Sheet,
  Text,
} from '@/components/ui';
import {
  BUDGET_CATEGORIES,
  planLabel,
  BUDGET_SEED,
  PRIORITY_TONE,
  type BudgetItem,
  type Priority,
} from '@/features/planning/types';
import { newId, useLocalList } from '@/features/planning/useLocalList';
import { formatRs } from '@/features/vendors/vendor-display';
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { haptics, layout, overlay, useTheme } from '@/theme';

/**
 * `formatRs` answers a VENDOR question — "what does this cost?" — and returns
 * "On request" for a zero or absent price, which is the right answer there and
 * nonsense here. A budget of nothing is Rs 0, not a price to be enquired about.
 */
function rs(n: number): string {
  return n > 0 ? formatRs(n) : 'Rs 0';
}

export default function BudgetTool() {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const insets = useSafeAreaInsets();
  const { items, add, update, remove } = useLocalList<BudgetItem>('ww.plan.budget', BUDGET_SEED(isUrdu), locale);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const totals = useMemo(() => {
    const estimated = items.reduce((s, i) => s + (i.estimated || 0), 0);
    const actual = items.reduce((s, i) => s + (i.actual || 0), 0);
    const byCat = new Map<string, number>();
    for (const i of items) byCat.set(i.category, (byCat.get(i.category) ?? 0) + (i.estimated || 0));
    return {
      estimated,
      actual,
      remaining: Math.max(0, estimated - actual),
      byCat: [...byCat.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [items]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (item: BudgetItem) => {
    setEditing(item);
    setModalOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('tool.budget')}
        onBack={() => router.back()}
        backLabel={tr('common.back')}
        urdu={isUrdu}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('budget.addItem')}
            onPress={openAdd}
            hitSlop={12}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: t.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              // A hairline ring on the deep register, so the control reads as
              // a control without a second fill competing with the title.
              borderWidth: t.layout.hairline,
              borderColor: overlay.hairlineOnDark,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            {/* `onDark` — this panel is the deep register. */}
            <Ionicons name="add" size={22} color={t.colors.onDark} />
          </Pressable>
        }
      />

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingBottom: insets.bottom + t.spacing.vast,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: t.spacing.huge, paddingBottom: t.spacing.xl }}>
            {/* The three figures, on paper. No box: the total is the biggest
                type on the screen, which is what makes it the total. */}
            <View style={{ gap: t.spacing.md }}>
              <Overline urdu={isUrdu}>{tr('budget.totalEstimated')}</Overline>
              <Text variant="display" tone="primary">
                {rs(totals.estimated)}
              </Text>

              <View
                style={{
                  flexDirection: isUrdu ? 'row-reverse' : 'row',
                  gap: t.spacing.xxl,
                  marginTop: t.spacing.xs,
                }}
              >
                <Figure
                  label={tr('budget.spent')}
                  value={rs(totals.actual)}
                  // `success` is the one colour the money rule sanctions:
                  // money that has actually gone out is information.
                  tone={totals.actual > 0 ? 'success' : 'muted'}
                  urdu={isUrdu}
                />
                <Figure
                  label={tr('budget.remaining')}
                  value={rs(totals.remaining)}
                  tone="primary"
                  urdu={isUrdu}
                />
              </View>
            </View>

            {totals.byCat.length > 0 ? (
              <View style={{ gap: t.spacing.lg }}>
                <Overline urdu={isUrdu}>{tr('budget.byCategory')}</Overline>
                {totals.byCat.map(([cat, amt]) => {
                  const pct = totals.estimated > 0 ? amt / totals.estimated : 0;
                  return (
                    <View key={cat} style={{ gap: 6 }}>
                      <View
                        style={{
                          flexDirection: isUrdu ? 'row-reverse' : 'row',
                          justifyContent: 'space-between',
                          gap: t.spacing.md,
                        }}
                      >
                        <Text
                          variant="body"
                          tone="body"
                          numberOfLines={1}
                          style={{ flexShrink: 1, textAlign: isUrdu ? 'right' : 'left' }}
                        >
                          {planLabel(cat, isUrdu)}
                        </Text>
                        <Text variant="mono" tone="muted" style={{ fontSize: 13 }}>
                          {rs(amt)}
                        </Text>
                      </View>
                      {/* A 4px ink rule, not a 6px gold one. The bar is a
                          comparison between categories; colour was carrying
                          none of that. */}
                      <View
                        style={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: t.colors.sunken,
                          overflow: 'hidden',
                          // Grows from the reading edge in both interfaces.
                          alignItems: isUrdu ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.round(pct * 100)}%`,
                            height: '100%',
                            backgroundColor: t.colors.textPrimary,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {items.length > 0 ? <Overline urdu={isUrdu}>{tr('budget.lineItems')}</Overline> : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.item}
            onPress={() => openEdit(item)}
            style={({ pressed }) => ({
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: t.spacing.lg,
              paddingVertical: t.spacing.lg,
              borderBottomWidth: index === items.length - 1 ? 0 : t.layout.hairline,
              borderBottomColor: t.colors.border,
              backgroundColor: pressed ? t.colors.sunken : 'transparent',
            })}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <View
                style={{
                  flexDirection: isUrdu ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: t.spacing.sm,
                }}
              >
                <Text
                  variant="title"
                  urdu={isUrdu}
                  numberOfLines={1}
                  style={{ flexShrink: 1, textAlign: isUrdu ? 'right' : 'left' }}
                >
                  {item.item}
                </Text>
                <Badge
                  label={tr(`common.${item.priority}` as StringKey)}
                  urdu={isUrdu}
                  tone={PRIORITY_TONE[item.priority]}
                />
              </View>
              <Text
                variant="caption"
                tone="muted"
                numberOfLines={1}
                style={{ textAlign: isUrdu ? 'right' : 'left' }}
              >
                {planLabel(item.category, isUrdu)}
              </Text>
            </View>

            <View style={{ alignItems: isUrdu ? 'flex-start' : 'flex-end', gap: 2 }}>
              {/* Ink. See the header note. */}
              <Text variant="mono" tone="primary" numberOfLines={1}>
                {rs(item.estimated)}
              </Text>
              {item.actual > 0 ? (
                <Text variant="caption" tone="success" urdu={isUrdu} numberOfLines={1}>
                  {`${tr('budget.paid')} ${ltr(rs(item.actual), isUrdu)}`}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title={tr('budget.empty')}
            message={tr('budget.emptySub')}
            actionLabel={tr('budget.addFirst')}
            onAction={openAdd}
            urdu={isUrdu}
          />
        }
      />

      <BudgetItemSheet
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSave={(data) => {
          if (editing) update(editing.id, data);
          else add({ id: newId(), ...data });
          haptics.success();
          setModalOpen(false);
        }}
        onDelete={
          editing
            ? () => {
                remove(editing.id);
                setModalOpen(false);
              }
            : undefined
        }
      />
    </View>
  );
}

/** A quiet section overline. Never `tone="label"` — that is gold-brown, and
 *  four of them on one screen turns the accent into wallpaper. */
function Overline({ children, urdu }: { children: string; urdu?: boolean }) {
  return (
    <Text
      variant="overline"
      tone="muted"
      urdu={urdu}
      style={{
        textAlign: urdu ? 'right' : 'left',
        // Latin only — Nastaliq has no case.
        ...(urdu ? null : { textTransform: 'uppercase' as const }),
      }}
    >
      {children}
    </Text>
  );
}

function Figure({
  label,
  value,
  tone,
  urdu,
}: {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'muted';
  urdu?: boolean;
}) {
  return (
    <View style={{ gap: 2, alignItems: urdu ? 'flex-end' : 'flex-start' }}>
      <Text variant="caption" tone="muted" urdu={urdu}>
        {label}
      </Text>
      {/* Never `urdu` on a figure — Nastaliq numerals break the column. */}
      <Text variant="mono" tone={tone} style={{ fontSize: 17 }}>
        {value}
      </Text>
    </View>
  );
}

function BudgetItemSheet({
  visible,
  onClose,
  editing,
  onSave,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  editing: BudgetItem | null;
  onSave: (data: Omit<BudgetItem, 'id'>) => void;
  onDelete?: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [item, setItem] = useState('');
  const [category, setCategory] = useState<string>(BUDGET_CATEGORIES[0]);
  const [estimated, setEstimated] = useState('');
  const [actual, setActual] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  // Render-phase reset on the open edge, not an effect — an effect that
  // setState's on the commit that opened the sheet is one of the five shapes
  // behind this repo's "Maximum update depth exceeded" history.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setItem(editing?.item ?? '');
      setCategory(editing?.category ?? BUDGET_CATEGORIES[0]);
      setEstimated(editing?.estimated ? String(editing.estimated) : '');
      setActual(editing?.actual ? String(editing.actual) : '');
      setPriority(editing?.priority ?? 'medium');
    }
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editing ? tr('budget.editItem') : tr('budget.addItem')}
      primaryLabel={editing ? tr('common.saveChanges') : tr('budget.addItem')}
      primaryDisabled={!item.trim()}
      onPrimary={() =>
        onSave({
          item: item.trim(),
          category,
          estimated: Number(estimated) || 0,
          actual: Number(actual) || 0,
          priority,
        })
      }
      urdu={isUrdu}
    >
      <View style={{ gap: t.spacing.xl }}>
        <FormField
          label={tr('budget.item')}
          urdu={isUrdu}
          placeholder={tr('ph.budgetItem')}
          value={item}
          onChangeText={setItem}
        />

        <Field label={tr('common.category')} urdu={isUrdu}>
          <ChipSelect
            options={BUDGET_CATEGORIES.map((c) => ({ value: c, label: planLabel(c, isUrdu) }))}
            value={category}
            onChange={(v) => setCategory(v ?? BUDGET_CATEGORIES[0])}
            urdu={isUrdu}
          />
        </Field>

        <View style={{ flexDirection: isUrdu ? 'row-reverse' : 'row', gap: t.spacing.lg }}>
          <View style={{ flex: 1 }}>
            <FormField
              label={tr('budget.estimated')}
              urdu={isUrdu}
              placeholder="0"
              keyboardType="number-pad"
              value={estimated}
              onChangeText={setEstimated}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label={tr('budget.paidRs')}
              urdu={isUrdu}
              placeholder="0"
              keyboardType="number-pad"
              value={actual}
              onChangeText={setActual}
            />
          </View>
        </View>

        <Field label={tr('common.priority')} urdu={isUrdu}>
          <ChipSelect
            scroll={false}
            options={[
              { value: 'high', label: tr('common.high') },
              { value: 'medium', label: tr('common.medium') },
              { value: 'low', label: tr('common.low') },
            ]}
            value={priority}
            onChange={(v) => setPriority((v as Priority) ?? 'medium')}
            urdu={isUrdu}
          />
        </Field>

        {/* Delete lives at the BOTTOM of the body, not beside Save in the
            footer. `Sheet`'s footer grammar is one advancing action plus an
            optional reset; a destructive action sitting at equal weight next
            to Save is how a line gets deleted by a mis-tap. */}
        {onDelete ? (
          <Button label={tr('common.delete')} urdu={isUrdu} variant="ghost" onPress={onDelete} />
        ) : null}
      </View>
    </Sheet>
  );
}

function Field({
  label,
  urdu,
  children,
}: {
  label: string;
  urdu?: boolean;
  children: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <Overline urdu={urdu}>{label}</Overline>
      {children}
    </View>
  );
}
