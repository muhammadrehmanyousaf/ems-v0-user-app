import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, ChipSelect, Divider, Input, Row, Text } from '@/components/ui';
import { PRIORITY_TONE, TIMELINE_CATEGORIES, TIMELINE_SEED, type Priority, type TimelineItem } from '@/features/planning/types';
import { newId, useLocalList } from '@/features/planning/useLocalList';
import { haptics, useTheme } from '@/theme';

export default function TimelineTool() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { items, add, update, remove } = useLocalList<TimelineItem>('ww.plan.timeline', TIMELINE_SEED);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TimelineItem | null>(null);

  const sorted = useMemo(() => [...items].sort((a, b) => a.time.localeCompare(b.time)), [items]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <Text variant="h1">Timeline</Text>
      </Row>

      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: t.spacing.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text variant="body" tone="muted" style={{ marginBottom: t.spacing.md }}>
            Your day-of schedule, minute by minute.
          </Text>
        }
        renderItem={({ item, index }) => (
          <Pressable onPress={() => { setEditing(item); setModalOpen(true); }}>
            <Row gap="md" align="flex-start">
              {/* Time + connector */}
              <View style={{ width: 56, alignItems: 'flex-end' }}>
                <Text variant="bodyMedium" tone="gold">{item.time}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.colors.gold, marginTop: 4 }} />
                {index < sorted.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 44, backgroundColor: t.colors.border }} /> : null}
              </View>
              {/* Card */}
              <View style={{ flex: 1, backgroundColor: t.colors.card, borderColor: t.colors.border, borderWidth: 1, borderRadius: t.radius.md, padding: t.spacing.md, marginBottom: t.spacing.md }}>
                <Row justify="space-between">
                  <Text variant="title" style={{ flex: 1 }}>{item.event}</Text>
                  <Badge label={item.category} tone={PRIORITY_TONE[item.priority]} />
                </Row>
                <Row gap="md" style={{ marginTop: 4 }} wrap>
                  {item.duration ? (
                    <Row gap="xxs"><Ionicons name="time-outline" size={13} color={t.colors.textMuted} /><Text variant="caption" tone="muted">{item.duration}</Text></Row>
                  ) : null}
                  {item.location ? (
                    <Row gap="xxs"><Ionicons name="location-outline" size={13} color={t.colors.textMuted} /><Text variant="caption" tone="muted">{item.location}</Text></Row>
                  ) : null}
                </Row>
              </View>
            </Row>
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => { setEditing(null); setModalOpen(true); }}
        style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: t.colors.gold, alignItems: 'center', justifyContent: 'center', ...t.elevation.lg }}
      >
        <Ionicons name="add" size={28} color={t.colors.onPrimary} />
      </Pressable>

      <EventModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSave={(data) => {
          if (editing) update(editing.id, data);
          else add({ id: newId(), ...data });
          haptics.success();
          setModalOpen(false);
        }}
        onDelete={editing ? () => { remove(editing.id); setModalOpen(false); } : undefined}
      />
    </View>
  );
}

function EventModal({
  visible,
  onClose,
  editing,
  onSave,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  editing: TimelineItem | null;
  onSave: (data: Omit<TimelineItem, 'id'>) => void;
  onDelete?: () => void;
}) {
  const t = useTheme();
  const [time, setTime] = useState('');
  const [event, setEvent] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<string>(TIMELINE_CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setTime(editing?.time ?? '');
      setEvent(editing?.event ?? '');
      setDuration(editing?.duration ?? '');
      setLocation(editing?.location ?? '');
      setCategory(editing?.category ?? TIMELINE_CATEGORIES[0]);
      setPriority(editing?.priority ?? 'medium');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(44,24,16,0.4)' }} onPress={onClose} />
      <View style={{ backgroundColor: t.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%' }}>
        <Row justify="space-between" style={{ padding: t.spacing.lg }}>
          <Text variant="h2">{editing ? 'Edit event' : 'Add event'}</Text>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={t.colors.textMuted} /></Pressable>
        </Row>
        <Divider />
        <ScrollView contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}>
          <Row gap="md">
            <View style={{ flex: 1 }}><Input label="Time (HH:MM)" placeholder="18:00" value={time} onChangeText={setTime} /></View>
            <View style={{ flex: 1 }}><Input label="Duration" placeholder="1 hr" value={duration} onChangeText={setDuration} /></View>
          </Row>
          <Input label="Event" placeholder="e.g. Nikah ceremony" value={event} onChangeText={setEvent} />
          <Input label="Location" placeholder="e.g. Main hall" value={location} onChangeText={setLocation} />
          <View>
            <Text variant="label" tone="label" style={{ marginBottom: 6 }}>CATEGORY</Text>
            <ChipSelect options={TIMELINE_CATEGORIES.map((c) => ({ value: c, label: c }))} value={category} onChange={(v) => setCategory(v ?? TIMELINE_CATEGORIES[0])} />
          </View>
          <View>
            <Text variant="label" tone="label" style={{ marginBottom: 6 }}>PRIORITY</Text>
            <ChipSelect scroll={false} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} value={priority} onChange={(v) => setPriority((v as Priority) ?? 'medium')} />
          </View>
          <Button label={editing ? 'Save' : 'Add event'} fullWidth onPress={() => { if (event.trim() && time.trim()) onSave({ time: time.trim(), event: event.trim(), duration: duration.trim() || undefined, location: location.trim() || undefined, category, priority }); }} />
          {onDelete ? <Button label="Delete" variant="ghost" onPress={onDelete} /> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
