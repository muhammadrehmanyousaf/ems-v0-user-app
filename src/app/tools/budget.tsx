import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, ChipSelect, Divider, Input, Row, Stack, Text } from '@/components/ui';
import { BUDGET_CATEGORIES, BUDGET_SEED, PRIORITY_TONE, type BudgetItem, type Priority } from '@/features/planning/types';
import { newId, useLocalList } from '@/features/planning/useLocalList';
import { formatRs } from '@/features/vendors/vendor-display';
import { haptics, useTheme } from '@/theme';

export default function BudgetTool() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { items, add, update, remove } = useLocalList<BudgetItem>('ww.plan.budget', BUDGET_SEED);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const totals = useMemo(() => {
    const estimated = items.reduce((s, i) => s + (i.estimated || 0), 0);
    const actual = items.reduce((s, i) => s + (i.actual || 0), 0);
    const byCat = new Map<string, number>();
    for (const i of items) byCat.set(i.category, (byCat.get(i.category) ?? 0) + (i.estimated || 0));
    return { estimated, actual, byCat: [...byCat.entries()].sort((a, b) => b[1] - a[1]) };
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
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <Text variant="h1">Budget</Text>
      </Row>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Stack gap="md" style={{ marginBottom: t.spacing.sm }}>
            <Card>
              <Row justify="space-between">
                <Stack gap="xxs">
                  <Text variant="overline" tone="label">TOTAL ESTIMATED</Text>
                  <Text variant="display" tone="gold">{formatRs(totals.estimated)}</Text>
                </Stack>
                <Stack gap="xxs" style={{ alignItems: 'flex-end' }}>
                  <Text variant="overline" tone="label">SPENT</Text>
                  <Text variant="h3" tone="success">{formatRs(totals.actual)}</Text>
                </Stack>
              </Row>
            </Card>
            {totals.byCat.length > 0 ? (
              <Card>
                <Text variant="overline" tone="label" style={{ marginBottom: 8 }}>BY CATEGORY</Text>
                <Stack gap="sm">
                  {totals.byCat.map(([cat, amt]) => {
                    const pct = totals.estimated > 0 ? amt / totals.estimated : 0;
                    return (
                      <View key={cat} style={{ gap: 4 }}>
                        <Row justify="space-between">
                          <Text variant="caption" tone="body">{cat}</Text>
                          <Text variant="caption" tone="muted">{formatRs(amt)}</Text>
                        </Row>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: t.colors.sand, overflow: 'hidden' }}>
                          <View style={{ width: `${Math.round(pct * 100)}%`, height: '100%', backgroundColor: t.colors.gold }} />
                        </View>
                      </View>
                    );
                  })}
                </Stack>
              </Card>
            ) : null}
            <Text variant="overline" tone="label">LINE ITEMS</Text>
          </Stack>
        }
        renderItem={({ item }) => (
          <Card onPress={() => openEdit(item)}>
            <Row justify="space-between">
              <Stack gap="xxs" style={{ flex: 1 }}>
                <Row gap="sm">
                  <Text variant="title">{item.item}</Text>
                  <Badge label={item.priority} tone={PRIORITY_TONE[item.priority]} />
                </Row>
                <Text variant="caption" tone="muted">{item.category}</Text>
              </Stack>
              <Stack gap="xxs" style={{ alignItems: 'flex-end' }}>
                <Text variant="bodyMedium" tone="gold">{formatRs(item.estimated)}</Text>
                {item.actual > 0 ? <Text variant="caption" tone="success">Paid {formatRs(item.actual)}</Text> : null}
              </Stack>
            </Row>
          </Card>
        )}
      />

      <Pressable
        onPress={openAdd}
        style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: t.colors.gold, alignItems: 'center', justifyContent: 'center', ...t.elevation.lg }}
      >
        <Ionicons name="add" size={28} color={t.colors.onPrimary} />
      </Pressable>

      <BudgetItemModal
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

function BudgetItemModal({
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
  const [item, setItem] = useState('');
  const [category, setCategory] = useState<string>(BUDGET_CATEGORIES[0]);
  const [estimated, setEstimated] = useState('');
  const [actual, setActual] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setItem(editing?.item ?? '');
      setCategory(editing?.category ?? BUDGET_CATEGORIES[0]);
      setEstimated(editing ? String(editing.estimated) : '');
      setActual(editing?.actual ? String(editing.actual) : '');
      setPriority(editing?.priority ?? 'medium');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(44,24,16,0.4)' }} onPress={onClose} />
      <View style={{ backgroundColor: t.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%' }}>
        <Row justify="space-between" style={{ padding: t.spacing.lg }}>
          <Text variant="h2">{editing ? 'Edit item' : 'Add item'}</Text>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={t.colors.textMuted} /></Pressable>
        </Row>
        <Divider />
        <ScrollView contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}>
          <Input label="Item" placeholder="e.g. Barat hall" value={item} onChangeText={setItem} />
          <View>
            <Text variant="label" tone="label" style={{ marginBottom: 6 }}>CATEGORY</Text>
            <ChipSelect options={BUDGET_CATEGORIES.map((c) => ({ value: c, label: c }))} value={category} onChange={(v) => setCategory(v ?? BUDGET_CATEGORIES[0])} />
          </View>
          <Row gap="md">
            <View style={{ flex: 1 }}><Input label="Estimated (Rs)" placeholder="0" keyboardType="number-pad" value={estimated} onChangeText={setEstimated} /></View>
            <View style={{ flex: 1 }}><Input label="Paid (Rs)" placeholder="0" keyboardType="number-pad" value={actual} onChangeText={setActual} /></View>
          </Row>
          <View>
            <Text variant="label" tone="label" style={{ marginBottom: 6 }}>PRIORITY</Text>
            <ChipSelect scroll={false} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} value={priority} onChange={(v) => setPriority((v as Priority) ?? 'medium')} />
          </View>
          <Button
            label={editing ? 'Save changes' : 'Add item'}
            fullWidth
            onPress={() => {
              if (!item.trim()) return;
              onSave({ item: item.trim(), category, estimated: Number(estimated) || 0, actual: Number(actual) || 0, priority });
            }}
          />
          {onDelete ? <Button label="Delete" variant="ghost" onPress={onDelete} /> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
