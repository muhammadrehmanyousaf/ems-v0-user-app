import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, ChipSelect, Divider, Input, Row, Stack, Text } from '@/components/ui';
import { GUEST_GROUPS, GUEST_SEED, type GuestItem, type Rsvp } from '@/features/planning/types';
import { newId, useLocalList } from '@/features/planning/useLocalList';
import type { StringKey } from '@/i18n/strings';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { haptics, useTheme } from '@/theme';

const RSVP_TONE: Record<Rsvp, 'success' | 'gold' | 'danger'> = { attending: 'success', pending: 'gold', declined: 'danger' };
const RSVP_CYCLE: Record<Rsvp, Rsvp> = { pending: 'attending', attending: 'declined', declined: 'pending' };

export default function GuestsTool() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const { items, add, update, remove } = useLocalList<GuestItem>('ww.plan.guests', GUEST_SEED);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GuestItem | null>(null);

  const stats = useMemo(() => {
    const heads = (rsvp?: Rsvp) => items.filter((g) => !rsvp || g.rsvp === rsvp).reduce((s, g) => s + (g.count || 1), 0);
    return { total: heads(), attending: heads('attending'), pending: heads('pending'), declined: heads('declined') };
  }, [items]);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter((g) => (!group || g.group === group) && (!s || g.name.toLowerCase().includes(s)));
  }, [items, search, group]);

  const groupOptions = useMemo(() => {
    const present = [...new Set(items.map((g) => g.group))];
    return GUEST_GROUPS.filter((g) => present.includes(g)).map((g) => ({ value: g, label: g }));
  }, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <T k="tool.guests" variant="h1" />
      </Row>

      <FlatList
        data={shown}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.sm, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Stack gap="md" style={{ marginBottom: t.spacing.sm }}>
            <Card>
              <Row justify="space-between">
                <Stat label={tr('guests.total')} value={stats.total} tone="primary" urdu={isUrdu} />
                <Stat label={tr('guests.attending')} value={stats.attending} tone="success" urdu={isUrdu} />
                <Stat label={tr('guests.pending')} value={stats.pending} tone="gold" urdu={isUrdu} />
                <Stat label={tr('guests.declined')} value={stats.declined} tone="danger" urdu={isUrdu} />
              </Row>
            </Card>
            <Input icon="search-outline" placeholder={tr('guests.searchGuests')} value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
            {groupOptions.length > 1 ? <ChipSelect options={groupOptions} value={group} onChange={setGroup} allLabel={tr('guests.allGroups')} /> : null}
          </Stack>
        }
        renderItem={({ item }) => (
          <Card onPress={() => { setEditing(item); setModalOpen(true); }}>
            <Row justify="space-between">
              <Stack gap="xxs" style={{ flex: 1 }}>
                <Text variant="title">{item.name}</Text>
                <Text variant="caption" tone="muted" urdu={isUrdu}>{item.group} · {item.count} {tr('guests.guestWord')}</Text>
              </Stack>
              <Pressable
                onPress={() => { haptics.selection(); update(item.id, { rsvp: RSVP_CYCLE[item.rsvp] }); }}
                hitSlop={6}
              >
                <Badge label={tr(`rsvp.${item.rsvp}` as StringKey)} urdu={isUrdu} tone={RSVP_TONE[item.rsvp]} />
              </Pressable>
            </Row>
          </Card>
        )}
        ListEmptyComponent={<T k="guests.emptyList" variant="body" tone="muted" align="center" style={{ padding: 24 }} />}
      />

      <Pressable
        onPress={() => { setEditing(null); setModalOpen(true); }}
        style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: t.colors.gold, alignItems: 'center', justifyContent: 'center', ...t.elevation.lg }}
      >
        <Ionicons name="add" size={28} color={t.colors.onPrimary} />
      </Pressable>

      <GuestModal
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

function Stat({ label, value, tone, urdu }: { label: string; value: number; tone: 'primary' | 'success' | 'gold' | 'danger'; urdu?: boolean }) {
  return (
    <Stack gap="xxs" style={{ alignItems: 'center' }}>
      <Text variant="h2" tone={tone === 'primary' ? 'primary' : tone}>{value}</Text>
      <Text variant="overline" tone="muted" urdu={urdu}>{label}</Text>
    </Stack>
  );
}

function GuestModal({
  visible,
  onClose,
  editing,
  onSave,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  editing: GuestItem | null;
  onSave: (data: Omit<GuestItem, 'id'>) => void;
  onDelete?: () => void;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [name, setName] = useState('');
  const [group, setGroup] = useState<string>(GUEST_GROUPS[0]);
  const [count, setCount] = useState('1');
  const [rsvp, setRsvp] = useState<Rsvp>('pending');
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName(editing?.name ?? '');
      setGroup(editing?.group ?? GUEST_GROUPS[0]);
      setCount(editing ? String(editing.count) : '1');
      setRsvp(editing?.rsvp ?? 'pending');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(44,24,16,0.4)' }} onPress={onClose} />
      <View style={{ backgroundColor: t.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '86%' }}>
        <Row justify="space-between" style={{ padding: t.spacing.lg }}>
          <Text variant="h2" urdu={isUrdu}>{editing ? tr('guests.editGuest') : tr('guests.addGuest')}</Text>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={t.colors.textMuted} /></Pressable>
        </Row>
        <Divider />
        <ScrollView contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}>
          <Input label={tr('guests.name')} urdu={isUrdu} placeholder="e.g. Ahmed & family" value={name} onChangeText={setName} />
          <Row gap="md">
            <View style={{ flex: 2 }}>
              <Text variant="label" tone="label" urdu={isUrdu} style={{ marginBottom: 6 }}>{tr('guests.group')}</Text>
              <ChipSelect options={GUEST_GROUPS.map((g) => ({ value: g, label: g }))} value={group} onChange={(v) => setGroup(v ?? GUEST_GROUPS[0])} />
            </View>
          </Row>
          <Row gap="md">
            <View style={{ flex: 1 }}><Input label={tr('guests.partySize')} urdu={isUrdu} placeholder="1" keyboardType="number-pad" value={count} onChangeText={setCount} /></View>
          </Row>
          <View>
            <Text variant="label" tone="label" urdu={isUrdu} style={{ marginBottom: 6 }}>{tr('rsvp.label')}</Text>
            <ChipSelect scroll={false} options={[{ value: 'pending', label: tr('rsvp.pending') }, { value: 'attending', label: tr('rsvp.attending') }, { value: 'declined', label: tr('rsvp.declined') }]} value={rsvp} onChange={(v) => setRsvp((v as Rsvp) ?? 'pending')} />
          </View>
          <Button label={editing ? tr('common.save') : tr('guests.addGuest')} urdu={isUrdu} fullWidth onPress={() => { if (name.trim()) onSave({ name: name.trim(), group, count: Number(count) || 1, rsvp }); }} />
          {onDelete ? <Button label={tr('common.delete')} urdu={isUrdu} variant="ghost" onPress={onDelete} /> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
