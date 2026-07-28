import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, ChipSelect, Divider, Input, Row, Stack, Text } from '@/components/ui';
import { CHECKLIST_CATEGORIES, CHECKLIST_SEED, PRIORITY_TONE, type ChecklistItem, type Priority } from '@/features/planning/types';
import { newId, useLocalList } from '@/features/planning/useLocalList';
import { haptics, useTheme } from '@/theme';

export default function ChecklistTool() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { items, add, update, remove } = useLocalList<ChecklistItem>('ww.plan.checklist', CHECKLIST_SEED);
  const [filter, setFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const done = items.filter((i) => i.completed).length;
  const pct = items.length > 0 ? done / items.length : 0;
  const shown = useMemo(() => (filter ? items.filter((i) => i.category === filter) : items), [items, filter]);
  const catOptions = useMemo(() => {
    const present = [...new Set(items.map((i) => i.category))];
    return CHECKLIST_CATEGORIES.filter((c) => present.includes(c)).map((c) => ({ value: c, label: c }));
  }, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <Text variant="h1">Checklist</Text>
      </Row>

      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.sm, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Stack gap="md" style={{ marginBottom: t.spacing.sm }}>
            <Card>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text variant="title">{done} of {items.length} done</Text>
                <Text variant="title" tone="gold">{Math.round(pct * 100)}%</Text>
              </Row>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.sand, overflow: 'hidden' }}>
                <View style={{ width: `${Math.round(pct * 100)}%`, height: '100%', backgroundColor: t.colors.gold }} />
              </View>
            </Card>
            {catOptions.length > 1 ? <ChipSelect options={catOptions} value={filter} onChange={setFilter} allLabel="All" /> : null}
          </Stack>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              haptics.selection();
              update(item.id, { completed: !item.completed });
            }}
          >
            <Card>
              <Row gap="md">
                <Ionicons
                  name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={item.completed ? t.colors.success : t.colors.border}
                />
                <Stack gap="xxs" style={{ flex: 1 }}>
                  <Text
                    variant="body"
                    tone={item.completed ? 'muted' : 'primary'}
                    style={item.completed ? { textDecorationLine: 'line-through' } : undefined}
                  >
                    {item.title}
                  </Text>
                  <Row gap="sm">
                    <Text variant="caption" tone="muted">{item.category}</Text>
                    <Badge label={item.priority} tone={PRIORITY_TONE[item.priority]} />
                  </Row>
                </Stack>
                <Pressable onPress={() => remove(item.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={t.colors.textLabel} />
                </Pressable>
              </Row>
            </Card>
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => setModalOpen(true)}
        style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: t.colors.gold, alignItems: 'center', justifyContent: 'center', ...t.elevation.lg }}
      >
        <Ionicons name="add" size={28} color={t.colors.onPrimary} />
      </Pressable>

      <AddTaskModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => {
          add({ id: newId(), completed: false, ...data });
          haptics.success();
          setModalOpen(false);
        }}
      />
    </View>
  );
}

function AddTaskModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; category: string; priority: Priority }) => void;
}) {
  const t = useTheme();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CHECKLIST_CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setTitle('');
      setCategory(CHECKLIST_CATEGORIES[0]);
      setPriority('medium');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(44,24,16,0.4)' }} onPress={onClose} />
      <View style={{ backgroundColor: t.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
        <Row justify="space-between" style={{ padding: t.spacing.lg }}>
          <Text variant="h2">Add task</Text>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={t.colors.textMuted} /></Pressable>
        </Row>
        <Divider />
        <ScrollView contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}>
          <Input label="Task" placeholder="e.g. Book dhol players" value={title} onChangeText={setTitle} />
          <View>
            <Text variant="label" tone="label" style={{ marginBottom: 6 }}>CATEGORY</Text>
            <ChipSelect options={CHECKLIST_CATEGORIES.map((c) => ({ value: c, label: c }))} value={category} onChange={(v) => setCategory(v ?? CHECKLIST_CATEGORIES[0])} />
          </View>
          <View>
            <Text variant="label" tone="label" style={{ marginBottom: 6 }}>PRIORITY</Text>
            <ChipSelect scroll={false} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} value={priority} onChange={(v) => setPriority((v as Priority) ?? 'medium')} />
          </View>
          <Button label="Add task" fullWidth onPress={() => { if (title.trim()) onSave({ title: title.trim(), category, priority }); }} />
        </ScrollView>
      </View>
    </Modal>
  );
}
