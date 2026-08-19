/**
 * Checklist — the planning tool. Redrawn on v4.
 *
 * ── The hazard, first ─────────────────────────────────────────────────────
 *
 * Every row carried a **bare trash button that deleted on one tap, with no
 * confirmation and no undo** — sitting a few millimetres from the row body,
 * whose own tap toggles the task complete. Two adjacent targets, one harmless
 * and one irreversible, on a list a couple builds over months.
 *
 * The trailing control is an EDIT affordance now. It opens the same sheet the
 * add flow uses, with Delete at the bottom of the body — deliberately not beside
 * the save action, for the reason `Sheet`'s footer grammar exists. That also
 * fixes an absence nobody had noticed: there was no way to rename a task at all,
 * only to destroy it and retype it.
 *
 * ── And the same five things the budget tool had ──────────────────────────
 *
 * · A `Card` per row plus a summary `Card` — the banned pattern on a list.
 * · A gold percentage and a gold progress bar; the trash glyph used
 *   `colors.textLabel`, which is gold-brown, so the destructive control was the
 *   most decorated thing on the row.
 * · A hand-rolled header with an ink-on-near-black back chevron.
 * · Its own modal chrome instead of `Sheet`, so no height cap on the save button.
 * · `colors.sand`, a deprecated v3 alias.
 * · A FAB bottom-right, which on the budget screen was covering a figure. Same
 *   move here: the add control lives in the header, where nothing is underneath.
 *
 * `"{done}/{total} done"` is bidi-isolated — `/` is a neutral character, so in
 * an Urdu paragraph "3/10" resolves to "10/3" and reverses the progress it
 * reports.
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
  CHECKLIST_CATEGORIES,
  planLabel,
  CHECKLIST_SEED,
  PRIORITY_TONE,
  type ChecklistItem,
  type Priority,
} from '@/features/planning/types';
import { newId, useLocalList } from '@/features/planning/useLocalList';
import { ltr } from '@/i18n/bidi';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { haptics, layout, overlay, useTheme } from '@/theme';

type Draft = { title: string; category: string; priority: Priority };

export default function ChecklistTool() {
  const t = useTheme();
  const { t: tr, isUrdu, locale } = useT();
  const insets = useSafeAreaInsets();
  const { items, add, update, remove } = useLocalList<ChecklistItem>(
    'ww.plan.checklist',
    CHECKLIST_SEED(isUrdu),
    locale,
  );
  const [filter, setFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const done = items.filter((i) => i.completed).length;
  const pct = items.length > 0 ? done / items.length : 0;
  const shown = useMemo(
    () => (filter ? items.filter((i) => i.category === filter) : items),
    [items, filter],
  );
  const catOptions = useMemo(() => {
    const present = [...new Set(items.map((i) => i.category))];
    return CHECKLIST_CATEGORIES.filter((c) => present.includes(c)).map((c) => ({
      // The VALUE stays the stored English key; only the label is translated.
      value: c,
      label: planLabel(c, isUrdu),
    }));
    // `isUrdu` is a real dependency — without it the chips keep the previous
    // language's words after a switch.
  }, [items, isUrdu]);

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('tool.checklist')}
        onBack={() => router.back()}
        backLabel={tr('common.back')}
        urdu={isUrdu}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('checklist.addTask')}
            onPress={openAdd}
            hitSlop={12}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: t.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: t.layout.hairline,
              borderColor: overlay.hairlineOnDark,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="add" size={22} color={t.colors.onDark} />
          </Pressable>
        }
      />

      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingBottom: insets.bottom + t.spacing.vast,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: t.spacing.xl, paddingBottom: t.spacing.xl }}>
            <View style={{ gap: t.spacing.sm }}>
              <View
                style={{
                  flexDirection: isUrdu ? 'row-reverse' : 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: t.spacing.md,
                }}
              >
                <Text variant="title" urdu={isUrdu}>
                  {`${ltr(`${done}/${items.length}`, isUrdu)} ${tr('checklist.done')}`}
                </Text>
                {/* Ink. The percentage is information, not an action. */}
                <Text variant="mono" tone="primary" style={{ fontSize: 17 }}>
                  {ltr(`${Math.round(pct * 100)}%`, isUrdu)}
                </Text>
              </View>
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: t.colors.sunken,
                  overflow: 'hidden',
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

            {catOptions.length > 1 ? (
              <ChipSelect
                options={catOptions}
                value={filter}
                onChange={setFilter}
                allLabel={tr('common.all')}
                urdu={isUrdu}
              />
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: t.spacing.md,
              borderBottomWidth: index === shown.length - 1 ? 0 : t.layout.hairline,
              borderBottomColor: t.colors.border,
            }}
          >
            {/* The row body toggles. */}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.completed }}
              accessibilityLabel={item.title}
              onPress={() => {
                haptics.selection();
                update(item.id, { completed: !item.completed });
              }}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: isUrdu ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: t.spacing.md,
                paddingVertical: t.spacing.lg,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons
                name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={item.completed ? t.colors.success : t.colors.borderStrong}
              />
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  variant="body"
                  tone={item.completed ? 'muted' : 'primary'}
                  urdu={isUrdu}
                  style={{
                    textAlign: isUrdu ? 'right' : 'left',
                    ...(item.completed ? { textDecorationLine: 'line-through' as const } : null),
                  }}
                >
                  {item.title}
                </Text>
                <View
                  style={{
                    flexDirection: isUrdu ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: t.spacing.sm,
                  }}
                >
                  <Text variant="caption" tone="muted" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {planLabel(item.category, isUrdu)}
                  </Text>
                  <Badge
                    label={tr(`common.${item.priority}` as StringKey)}
                    urdu={isUrdu}
                    tone={PRIORITY_TONE[item.priority]}
                  />
                </View>
              </View>
            </Pressable>

            {/* EDIT, not delete. See the header note — a one-tap irreversible
                action does not belong beside a harmless one. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr('checklist.editTask')}
              onPress={() => {
                haptics.light();
                setEditing(item);
                setSheetOpen(true);
              }}
              hitSlop={12}
              style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.5 : 1 })}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color={t.colors.textMuted} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-done-outline"
            title={tr('checklist.empty')}
            message={tr('checklist.emptySub')}
            actionLabel={tr('checklist.addTask')}
            onAction={openAdd}
            urdu={isUrdu}
          />
        }
      />

      <TaskSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        editing={editing}
        onSave={(data) => {
          if (editing) update(editing.id, data);
          else add({ id: newId(), completed: false, ...data });
          haptics.success();
          setSheetOpen(false);
        }}
        onDelete={
          editing
            ? () => {
                remove(editing.id);
                setSheetOpen(false);
              }
            : undefined
        }
      />
    </View>
  );
}

function TaskSheet({
  visible,
  onClose,
  editing,
  onSave,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  editing: ChecklistItem | null;
  onSave: (data: Draft) => void;
  onDelete?: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CHECKLIST_CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>('medium');

  // Render-phase reset on the open edge, not an effect.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setTitle(editing?.title ?? '');
      setCategory(editing?.category ?? CHECKLIST_CATEGORIES[0]);
      setPriority(editing?.priority ?? 'medium');
    }
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editing ? tr('checklist.editTask') : tr('checklist.addTask')}
      primaryLabel={editing ? tr('common.saveChanges') : tr('checklist.addTask')}
      primaryDisabled={!title.trim()}
      onPrimary={() => onSave({ title: title.trim(), category, priority })}
      urdu={isUrdu}
    >
      <View style={{ gap: t.spacing.xl }}>
        <FormField
          label={tr('checklist.task')}
          urdu={isUrdu}
          placeholder={tr('ph.checklistTask')}
          value={title}
          onChangeText={setTitle}
        />

        <Field label={tr('common.category')} urdu={isUrdu}>
          <ChipSelect
            options={CHECKLIST_CATEGORIES.map((c) => ({ value: c, label: planLabel(c, isUrdu) }))}
            value={category}
            onChange={(v) => setCategory(v ?? CHECKLIST_CATEGORIES[0])}
            urdu={isUrdu}
          />
        </Field>

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
      <Text
        variant="overline"
        tone="muted"
        urdu={urdu}
        style={{
          textAlign: urdu ? 'right' : 'left',
          ...(urdu ? null : { textTransform: 'uppercase' as const }),
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
